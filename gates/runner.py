#!/usr/bin/env python3
"""gates/runner.py — supervised direct-child runner for the Claude Code CLI.

Ported from foreflux@HEAD's scripts/claude-runner.py (see docs/foreflux-reference.md
§3) — the execution engine (binary resolution, model routing, rate-limit backoff,
audit trail) is a straight port; the --preflight wiring below is this repo's own,
built against gates/preflight.js's 4-probe Tier 0 rather than foreflux's now-deleted
copy (docs/alignment-plan.md P0-4's "why" section explains the split).

  python3 gates/runner.py --prompt <file-or-string> --workdir <task-worktree>
  python3 gates/runner.py --prompt <file> --workdir <worktree> --preflight
  python3 gates/runner.py --self-test
  sh gates/runner-tests/run.sh          # dependency-free suite, fake_claude.py

Exit codes:
  0    approved by the gate with no LLM spawned, or the LLM ran and exited 0
  3    preflight rejected deterministically — no LLM spawned (distinct from any
       exit code claude itself can produce, so a caller can tell "the gate said
       no" from "the model ran and failed")
  2    usage error (bad --workdir, empty prompt, preflight escalate path unusable)
  124  timed out — the whole child process tree was killed
  126  failed to spawn claude
  127  claude CLI not found
  other  claude's own exit code
"""
import argparse
import os
import re
import shutil
import subprocess
import sys
import time

RATE_LIMIT_MARKERS = re.compile(
    r"rate_limit_error|\"type\"\s*:\s*\"rate_limit\"|\b429\b|\b529\b|rate limit",
    re.IGNORECASE,
)
SERVER_ERROR_MARKERS = re.compile(r"\b5\d{2}\b")
RETRY_AFTER_RE = re.compile(r"retry[-_]?after[\"':\s]*(\d+)", re.IGNORECASE)
COMPLEXITY_HIGH_RE = re.compile(r"complexity\s*:\s*high", re.IGNORECASE)

DEFAULT_ALLOWED_TOOLS = "Read,Edit,Write,Bash"
DEFAULT_PERMISSION_MODE = "acceptEdits"
DEFAULT_TIMEOUT = 1800
DEFAULT_MAX_RETRIES = 3
DEFAULT_BACKOFF_BASE = 30
DEFAULT_PREFLIGHT_BASE = "main"
DEFAULT_PREFLIGHT_TIMEOUT = 600

PREFLIGHT_EXIT_ROUTE = {0: "approve", 1: "reject", 2: "escalate"}


def resolve_claude_bin():
    """Resolve the Claude Code CLI binary.

    shutil.which("claude") finds claude.ps1 first on Windows, which subprocess
    cannot execute directly (CreateProcess has no interpreter registered for
    .ps1) — prefer CLAUDE_BIN, then the .cmd shim under npm's global install,
    then whatever .cmd/claude resolves on PATH. This repo runs on Windows, so
    the trap is live, not cross-platform trivia.
    """
    override = os.environ.get("CLAUDE_BIN")
    if override:
        # An explicit override that doesn't resolve must fail hard, not
        # silently fall through to autodetection — that could hit a
        # different, unintended binary.
        return override if os.path.isfile(override) else None
    cmd = os.path.join(os.environ.get("APPDATA", ""), "npm", "claude.cmd")
    if os.path.isfile(cmd):
        return cmd
    return shutil.which("claude.cmd") or shutil.which("claude")


def resolve_model(prompt, explicit_model):
    """Pick the model by declared complexity, unless overridden.

    An explicit --model flag always wins. Otherwise `complexity: high`
    anywhere in the prompt (case-insensitive) routes to opus; anything else
    routes to sonnet.
    """
    if explicit_model:
        return explicit_model
    if COMPLEXITY_HIGH_RE.search(prompt):
        return "opus"
    return "sonnet"


def read_prompt(prompt_arg):
    if prompt_arg == "-":
        return sys.stdin.read()
    if prompt_arg and os.path.isfile(prompt_arg):
        with open(prompt_arg, "r", encoding="utf-8") as f:
            return f.read()
    if prompt_arg:
        return prompt_arg
    if not sys.stdin.isatty():
        return sys.stdin.read()
    return ""


def resolve_git_dir(workdir):
    """The real git dir for workdir.

    A git worktree's <workdir>/.git is a *file* (a "gitdir: ..." pointer), not
    a directory — `git rev-parse --git-dir` resolves it to the real,
    per-worktree directory under the main repo's .git/worktrees/<name>/,
    which still satisfies "inside .git, never committed". Falls back to a
    plain <workdir>/.git when workdir isn't a git repo at all (test scratch
    dirs).
    """
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--git-dir"],
            cwd=workdir, capture_output=True, text=True, timeout=5,
        )
        if result.returncode == 0:
            git_dir = result.stdout.strip()
            if not os.path.isabs(git_dir):
                git_dir = os.path.join(workdir, git_dir)
            return git_dir
    except (OSError, subprocess.TimeoutExpired):
        pass
    return os.path.join(workdir, ".git")


def ensure_git_exclude(workdir):
    """Add .claude-run.log to the repo's local git exclude, once.

    Idempotent: checked before writing, so a repo that already carries the
    line (this one does) is left untouched. Uses `git rev-parse --git-path
    info/exclude` (works for a plain repo and a worktree alike) so the audit
    log is never committed and never touches tracked .gitignore.
    """
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--git-path", "info/exclude"],
            cwd=workdir, capture_output=True, text=True, timeout=5,
        )
    except (OSError, subprocess.TimeoutExpired):
        return
    if result.returncode != 0:
        return
    exclude_path = result.stdout.strip()
    if not exclude_path:
        return
    if not os.path.isabs(exclude_path):
        exclude_path = os.path.join(workdir, exclude_path)
    try:
        existing = ""
        if os.path.isfile(exclude_path):
            with open(exclude_path, "r", encoding="utf-8") as f:
                existing = f.read()
        if ".claude-run.log" in existing.splitlines():
            return
        os.makedirs(os.path.dirname(exclude_path), exist_ok=True)
        with open(exclude_path, "a", encoding="utf-8") as f:
            if existing and not existing.endswith("\n"):
                f.write("\n")
            f.write(".claude-run.log\n")
    except OSError:
        pass


def append_audit(workdir, pid=None, ppid=None, cmdline=None, cwd=None, extra_lines=None):
    """Append one audit entry to <git-dir>/claude-runner-last.log and
    <workdir>/.claude-run.log. Append, not overwrite — each invocation adds a
    block so the log is a timeline, matching this repo's other gate logs
    (.claude-preflight.log, .claude-verdict.log) rather than foreflux's
    single-entry "last" file.
    """
    lines = []
    if pid is not None:
        lines.append("pid=%s" % pid)
    if ppid is not None:
        lines.append("ppid=%s" % ppid)
    if cmdline is not None:
        lines.append("cmdline=%s" % " ".join(cmdline))
    if cwd is not None:
        lines.append("cwd=%s" % cwd)
    lines.extend(extra_lines or [])
    if not lines:
        return
    block = "\n".join(lines) + "\n\n"

    git_dir = resolve_git_dir(workdir)
    try:
        os.makedirs(git_dir, exist_ok=True)
        with open(os.path.join(git_dir, "claude-runner-last.log"), "a", encoding="utf-8") as f:
            f.write(block)
    except OSError:
        pass

    ensure_git_exclude(workdir)
    try:
        with open(os.path.join(workdir, ".claude-run.log"), "a", encoding="utf-8") as f:
            f.write(block)
    except OSError:
        pass


def kill_process_tree(proc):
    if sys.platform == "win32":
        subprocess.run(
            ["taskkill", "/PID", str(proc.pid), "/T", "/F"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    else:
        try:
            os.killpg(os.getpgid(proc.pid), 9)
        except (ProcessLookupError, OSError):
            proc.kill()


def launch_prefix(claude_path):
    """Argv prefix to exec claude_path as a direct child, no shell/batch layer.

    A CLAUDE_BIN ending in .py has no OS-level executable form on Windows, so
    route it through the current interpreter directly (one CreateProcess
    hop) — this is exactly the shape the test fixture uses under git-bash,
    where relying on .cmd/.ps1 resolution would fail. Real npm-shim
    claude.cmd targets are left to CreateProcess's own handling.
    """
    if claude_path.lower().endswith(".py"):
        return [sys.executable, claude_path]
    return [claude_path]


def build_command(claude, prompt, args):
    cmd = launch_prefix(claude) + ["-p", prompt, "--output-format", args.output_format]
    if args.model:
        cmd += ["--model", args.model]
    if args.allowed_tools:
        cmd += ["--allowedTools", args.allowed_tools]
    if args.permission_mode:
        cmd += ["--permission-mode", args.permission_mode]
    cmd += args.extra
    return cmd


def spawn_and_stream(cmd, workdir, timeout):
    """Spawn cmd as a direct child, stream stdout/stderr, wait with timeout.

    Returns (returncode, combined_output) or raises TimeoutExpired / OSError.
    """
    popen_kwargs = dict(
        cwd=workdir,
        shell=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        bufsize=1,
    )
    if sys.platform == "win32":
        popen_kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP

    proc = subprocess.Popen(cmd, **popen_kwargs)

    append_audit(workdir, pid=proc.pid, ppid=os.getpid(), cmdline=cmd, cwd=workdir)

    output_lines = []
    deadline = time.monotonic() + timeout

    import threading
    import queue

    q = queue.Queue()

    def pump(stream, tag):
        for line in iter(stream.readline, ""):
            q.put((tag, line))
        stream.close()

    threads = [
        threading.Thread(target=pump, args=(proc.stdout, "out"), daemon=True),
        threading.Thread(target=pump, args=(proc.stderr, "err"), daemon=True),
    ]
    for t in threads:
        t.start()

    timed_out = False
    while True:
        if proc.poll() is not None:
            break
        if time.monotonic() > deadline:
            timed_out = True
            break
        try:
            tag, line = q.get(timeout=0.1)
        except Exception:
            continue
        output_lines.append(line)
        out_stream = sys.stdout if tag == "out" else sys.stderr
        out_stream.write(line)
        out_stream.flush()

    if timed_out:
        kill_process_tree(proc)
        raise subprocess.TimeoutExpired(cmd, timeout)

    proc.wait()
    for t in threads:
        t.join(timeout=5)

    while True:
        try:
            tag, line = q.get_nowait()
        except queue.Empty:
            break
        output_lines.append(line)
        out_stream = sys.stdout if tag == "out" else sys.stderr
        out_stream.write(line)
        out_stream.flush()

    return proc.returncode, "".join(output_lines)


def detect_rate_limit(text, returncode):
    if RATE_LIMIT_MARKERS.search(text):
        return True
    if returncode is not None and returncode != 0:
        for m in SERVER_ERROR_MARKERS.finditer(text):
            code = int(m.group(0))
            if 500 <= code <= 599:
                return True
    return False


def retry_after_seconds(text):
    m = RETRY_AFTER_RE.search(text)
    return int(m.group(1)) if m else None


def run_preflight(workdir, base, timeout):
    """Run gates/preflight.js (the target's own copy, relative to workdir) and
    map its exit code to a route. Any failure to even run it — node missing,
    a timeout, preflight.js absent — resolves to escalate: Tier 0 must never
    be the reason a spawn is blocked, same rule preflight.js applies to its
    own probes.
    """
    try:
        result = subprocess.run(
            ["node", "gates/preflight.js", "--base", base, "--pretty", "--no-log"],
            cwd=workdir, capture_output=True, text=True, timeout=timeout,
        )
    except (OSError, subprocess.TimeoutExpired) as e:
        return {"route": "escalate", "exit_code": None, "summary": "preflight could not run: %s" % e}
    output = ((result.stdout or "") + (result.stderr or "")).strip()
    summary = output.splitlines()[0] if output else ""
    route = PREFLIGHT_EXIT_ROUTE.get(result.returncode, "escalate")
    return {"route": route, "exit_code": result.returncode, "summary": summary}


def run(args):
    workdir = os.path.abspath(args.workdir)
    if not os.path.isdir(workdir):
        print("claude-runner: --workdir %s does not exist." % workdir, file=sys.stderr)
        return 2

    if args.preflight:
        pf = run_preflight(workdir, args.preflight_base, args.preflight_timeout)
        extra_lines = [
            "preflight_route=%s" % pf["route"],
            "preflight_llm_skipped=%s" % ("true" if pf["route"] != "escalate" else "false"),
            "preflight_summary=%s" % pf["summary"],
        ]
        if pf["route"] == "approve":
            append_audit(workdir, extra_lines=extra_lines)
            print("claude-runner: preflight approved — no LLM session needed.")
            if pf["summary"]:
                print(pf["summary"])
            return 0
        if pf["route"] == "reject":
            append_audit(workdir, extra_lines=extra_lines)
            print("claude-runner: preflight rejected — no LLM session spawned.", file=sys.stderr)
            if pf["summary"]:
                print(pf["summary"], file=sys.stderr)
            return 3
        # escalate: evidence doesn't decide it — fall through to spawn, but
        # the audit trail should still carry why.
        append_audit(workdir, extra_lines=extra_lines)

    claude = resolve_claude_bin()
    if not claude:
        print(
            "claude-runner: Claude Code CLI not found (checked CLAUDE_BIN, "
            "%APPDATA%\\npm\\claude.cmd, PATH). Fix your install — refusing to "
            "silently skip.",
            file=sys.stderr,
        )
        return 127

    prompt = read_prompt(args.prompt)
    if not prompt.strip():
        print("claude-runner: empty prompt — nothing to run.", file=sys.stderr)
        return 2

    args.model = resolve_model(prompt, args.model)
    cmd = build_command(claude, prompt, args)

    max_retries = args.max_retries
    backoff_base = args.backoff_base
    attempt = 0

    while True:
        try:
            returncode, output = spawn_and_stream(cmd, workdir, args.timeout)
        except subprocess.TimeoutExpired:
            print(
                "claude-runner: timed out after %ss — child process tree killed."
                % args.timeout,
                file=sys.stderr,
            )
            return 124
        except OSError as e:
            print("claude-runner: failed to spawn claude: %s" % e, file=sys.stderr)
            return 126

        if returncode == 0:
            return 0

        if detect_rate_limit(output, returncode):
            if attempt >= max_retries:
                print(
                    "claude-runner: rate limit exhausted after %d retries."
                    % max_retries,
                    file=sys.stderr,
                )
                return returncode or 1
            backoff = backoff_base * (2 ** attempt)
            retry_after = retry_after_seconds(output)
            if retry_after is not None:
                backoff = max(backoff, retry_after)
            print(
                "claude-runner: rate limit detected (attempt %d/%d) — retrying "
                "in %ss." % (attempt + 1, max_retries, backoff),
                file=sys.stderr,
            )
            time.sleep(backoff)
            attempt += 1
            continue

        print(
            "claude-runner: claude exited %d (completed with error, not a "
            "runner fault)." % returncode,
            file=sys.stderr,
        )
        return returncode


def self_test():
    assert detect_rate_limit('{"type":"rate_limit_error"}', 1)
    assert detect_rate_limit("HTTP 429 too many requests", 1)
    assert detect_rate_limit("server error 503", 1)
    assert not detect_rate_limit("all good", 0)
    assert retry_after_seconds('{"retry_after": 42}') == 42
    assert retry_after_seconds("no hint here") is None
    assert resolve_model("complexity: high\ndo the thing", None) == "opus"
    assert resolve_model("Complexity:HIGH", None) == "opus"
    assert resolve_model("complexity: standard", None) == "sonnet"
    assert resolve_model("no complexity line here", None) == "sonnet"
    assert resolve_model("complexity: high", "sonnet") == "sonnet"
    assert PREFLIGHT_EXIT_ROUTE[0] == "approve"
    assert PREFLIGHT_EXIT_ROUTE[1] == "reject"
    assert PREFLIGHT_EXIT_ROUTE[2] == "escalate"
    assert PREFLIGHT_EXIT_ROUTE.get(127, "escalate") == "escalate"
    print("self-test: ok")
    return 0


def parse_args(argv):
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("--prompt", default="-", help="prompt text, file path, or '-' for stdin")
    p.add_argument("--workdir", default=".", help="task git worktree; child cwd")
    p.add_argument("--model", default=None)
    p.add_argument("--allowed-tools", default=DEFAULT_ALLOWED_TOOLS)
    p.add_argument("--permission-mode", default=DEFAULT_PERMISSION_MODE)
    p.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT)
    p.add_argument(
        "--max-retries", type=int,
        default=int(os.environ.get("CLAUDE_RUNNER_MAX_RETRIES", DEFAULT_MAX_RETRIES)),
    )
    p.add_argument(
        "--backoff-base", type=int,
        default=int(os.environ.get("CLAUDE_RUNNER_BACKOFF_BASE", DEFAULT_BACKOFF_BASE)),
    )
    p.add_argument("--output-format", choices=["json", "text"], default="json")
    p.add_argument("--self-test", action="store_true")
    # Off by default (builder-profile dispatch: there's nothing to pre-judge
    # before the diff exists); a review-profile caller passes --preflight.
    p.add_argument("--preflight", dest="preflight", action="store_true", default=None)
    p.add_argument("--no-preflight", dest="preflight", action="store_false")
    p.add_argument(
        "--preflight-base",
        default=os.environ.get("CLAUDE_RUNNER_PREFLIGHT_BASE", DEFAULT_PREFLIGHT_BASE),
    )
    p.add_argument("--preflight-timeout", type=int, default=DEFAULT_PREFLIGHT_TIMEOUT)
    args, extra = p.parse_known_args(argv)
    if args.preflight is None:
        args.preflight = os.environ.get("CLAUDE_RUNNER_PREFLIGHT", "") == "1"
    args.extra = extra  # passthrough claude CLI args this file doesn't model
    return args


def main(argv=None):
    args = parse_args(argv if argv is not None else sys.argv[1:])
    if args.self_test:
        return self_test()
    return run(args)


if __name__ == "__main__":
    sys.exit(main())
