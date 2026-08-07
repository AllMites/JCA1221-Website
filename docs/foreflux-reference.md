# ForeFlux reference — review agent loops and lint/gate architecture

What this is: a read-only reference for the ForeFlux board's code-review and
gate architecture, recorded so this repo can be compared against it and so the
architecture can be replicated from the paths and commands below rather than
from memory.

Card: `t_98d72342`. Evidence collected 2026-08-07 from the live installation on
this machine. Every path, flag and number below was read from the source at the
commit named, not restated from another document.

> **Read the git tree, not the working tree.** The primary ForeFlux checkout
> (`F:\Documents\Repositories\foreflux`) is on `master` at `19db4c5` but its
> working tree is stale — `git status --porcelain` reports `gates/preflight.js`,
> `gates/review-lint.js`, `gates/evaluate.js`, `gates/git-tree-guard.sh` and the
> five newest `docs/*.md` as staged deletions, and `gates/run.sh` on disk is an
> older revision than `HEAD:gates/run.sh`. This is exactly the hazard
> `gates/git-tree-guard.sh` was written to catch (finding P1 below). Use
> `git show HEAD:<path>` when reading that repo.

---

## 1. Where everything lives

| Component | Path |
|---|---|
| ForeFlux repo (reference implementation) | `F:\Documents\Repositories\foreflux` — `master` @ `19db4c5` |
| Gate layer | `foreflux/gates/` — `run.sh`, `syntax.js`, `invariants.js`, `publish.js`, `review-lint.js`, `evaluate.js`, `preflight.js`, `git-tree-guard.sh` (+ `review-lint-test.sh`, `git-tree-guard-test.sh`) |
| Behavioural checks | `foreflux/*-check.js` at the repo root (23 files at HEAD), discovered by shape |
| Check catalogue | `foreflux/CHECKS.md` (621 lines at HEAD, 14 sections) |
| Runner (LLM execution engine) | `foreflux/scripts/claude-runner.py` (541 lines @ HEAD) + `scripts/claude-runner-tests/run.sh` |
| Repo agent directives | `foreflux/.hermes.md` |
| Architecture docs | `foreflux/docs/` — `preflight.md`, `evaluator.md`, `llm-efficiency-audit.md`, `llm-efficiency-synthesis.md`, `gate-impact.md`, `claude-direct-migration.md` |
| Claude Code hook bridge | `foreflux/.claude/hooks/gate.js` + `foreflux/.claude/settings.json` |
| Review agent skill (canonical) | `F:\Documents\Repositories\hermes-ops\skills\sdlc-review\SKILL.md` (v1.3.0, 550 lines) + `hermes-skill.toml` |
| Merge fallback | `hermes-ops\bin\merge_queue.py` (419 lines) |
| hermes-ops own gates | `hermes-ops\gates\run.sh` → smoke test, `mission-control-check.js`, `sdlc-review-check.sh`, `install-skills-version-guard-check.sh` |
| Board record | `C:\Users\USER\AppData\Local\hermes\kanban\boards\foreflux\` — `board.json`, `kanban.db`, `workspaces/` |
| Long-horizon cron scripts | `C:\Users\USER\AppData\Local\hermes\scripts\` — `foreflux_nightly_review.py`, `foreflux_nightly_review_claude.py`, `nightly_audit.py`, `mission_control.py` |
| Cron registry | `C:\Users\USER\AppData\Local\hermes\cron\jobs.json` |

ForeFlux has **no `package.json`, no `.github/`, no `.githooks/`, and
`core.hooksPath` is unset.** The gate is dependency-free node + `sh`; the only
triggers are the Claude Code hook, the runner's preflight, the review agent, and
the merge queue. Setup is "clone + run gates" (`.hermes.md §Setup & Verification`).

---

## 2. The gate suite

### 2.1 `gates/run.sh` — one command, one verdict

```sh
sh gates/run.sh                    # full tier, ~8s, exit 0 expected
GATE_VERBOSE=1 sh gates/run.sh     # also print the checks that passed
sh gates/run.sh --fast <file>...   # fast tier, ~80ms, after a single edit
```

Design points, quoted from the script's own header and body:

- **Two tiers because cost is uneven.** `ff-render-check.js` renders all eight
  screens at 4.5s; `sb-guard-check.js` is 0.07s. Fast tier = per-edit; full tier
  = end of turn / commit / worker finishing.
- **Caller-agnostic.** "Nothing here knows what invoked it. That is the point —
  a Claude Code hook, a Hermes kanban worker, a git pre-commit and CI all get the
  same verdict from the same code."
- **`gates/git-tree-guard.sh` runs first, in both tiers**, and hard-exits before
  any other check.
- **Fast tier** = `syntax` + `invariants` on the named files, plus `publish`
  (which takes no file list — it asks what is in the published root).
- **Full tier** = `syntax` over `*.html *.js`, `invariants`, `publish`,
  `sh gates/review-lint-test.sh`, `sh gates/git-tree-guard-test.sh`, then a glob
  loop over `*-check.js`.
- **Discovery by shape, not by list.** `for c in *-check.js; do … done` —
  "the list was five names while six checks sat at the root: `ff-wave-e-check.js`
  was written, passed, and guarded nothing because nobody added the line."
- **`review-lint` runs only its own self-test in the suite**, not a whole-repo
  scan: the repo ships ~27 deliberate `catch(e){}` guards that are intentional,
  and review-lint is a *diff filter for what an agent just wrote*, not a standing
  invariant.
- Failure mode: `run()` captures stdout+stderr, prints it to stderr on non-zero,
  sets `fail=1`, and the script exits `$fail` — every check runs even after one
  fails.

### 2.2 The four gate programs

| File | Invocation | What it does |
|---|---|---|
| `gates/syntax.js` | `node gates/syntax.js <file>...` | Compiles every JS the repo ships, **including inline `<script>` blocks in HTML**, via `new vm.Script` (compile only, never executes). Uses `lineOffset` so the reported line is the line in the HTML file. Exists because the logic lives inside 30–76KB HTML files where no standard linter reaches it. Skips `src=`'d and non-JS `type=` scripts. |
| `gates/invariants.js` | `node gates/invariants.js [file]...` | The lint layer proper: 6 rules, each a decision already written in `PRODUCT.md` / `PLAN.md` / `motion-plan.md` / `.hermes.md`, restated as something a machine can fail on. |
| `gates/publish.js` | `node gates/publish.js` | Asserts nothing in the repo root would be served without someone having said so: on disk at root + servable extension + **not tracked** + not in `.assetsignore` → fail. Skips silently when git is unavailable. |
| `gates/git-tree-guard.sh` | `sh gates/git-tree-guard.sh` | 25 lines. If `git diff --cached` is non-empty vs HEAD, fail with a message that distinguishes "HEAD moved by plumbing, run `git reset --hard HEAD`" from "staged changes alongside unstaged work". Degrades silently on a non-repo or unborn HEAD. |

`invariants.js` rule set (`id` — `why` source):

| id | applies to | rule |
|---|---|---|
| `reduced-motion` | `*.html`, `*.js` | a file that declares `transition:`/`animation:`/`@keyframes` must contain a `prefers-reduced-motion` block |
| `selection-metrics` | `*.html`, `*.js` | `[aria-selected=true]` / `[aria-current=page]` blocks may not set `font-weight`, `font-size`, `font-family`, `letter-spacing`, `padding*`, `border*-width` (colour and indicator only — no reflow on switch) |
| `no-scroll-into-view` | `*.html`, `*.js` | no `scrollIntoView(` |
| `no-service-role-key` | `*.html`, `*.js`, `*.json(c)` | **decodes** JWTs found in source and fails on any `role !== 'anon'`; also fails on `SUPABASE_SERVICE_ROLE_KEY`/`DB_PASSWORD`-style literal assignments |
| `script-owns-its-globals` | `*.html` | a page naming `NAV`/`NAV_ICONS`/`MASTER_DATA`/`renderNav` must carry `<script src="ff-nav.js">`, unless it declares the name itself |
| `tokens-not-hex` | landing pages only | no raw hex outside `:root` (SVG, `data:` URIs and the `:root` block itself are stripped first) |

Two implementation details worth copying:

- **Comments are blanked, not deleted** (`m.replace(/[^\n]/g, '')`) before content
  rules run, so a rule's own rationale in prose isn't flagged as the violation —
  and offsets still resolve to the right line. "Deleting them reported
  `ff-data.js:791` for a rule that lives on line 975."
- **The gate-adoption rule**, stated in both `invariants.js` and `review-lint.js`:
  "A gate that is born failing gets switched off within a week." A new rule must
  be green before it is wired in, and anything two people could disagree about is
  a review comment, not a gate.

### 2.3 `gates/review-lint.js` — the deterministic half of a code review

```sh
node gates/review-lint.js <file>...
node gates/review-lint.js --diff [ref]            # default ref: master
node gates/review-lint.js --diff master --root=.  # the preflight shape
node gates/review-lint.js --fail-on=high|medium|low|none
```

- JSON on stdout **always**; a short human summary on stderr. Exit 1 when
  anything at or above `--fail-on` (default `medium`) is found. "So
  `node gates/review-lint.js --diff master || reject` is the whole integration."
- Reuses `gates/syntax.js`'s `checkFile` export for the parse rule.
- `LINTABLE = /\.(m?js|cjs|ts|html?|py|css)$/i`; `SKIP_DIR` mirrors `.gitignore`
  (`node_modules`, `.worktrees`, `.git`, `build`, `browser`, `reference`,
  `__pycache__`, `dist`); `console.log` is exempt inside `gates/`, `scripts/` and
  `*-check.js` because tools print for a living.
- Rules: `unresolved-import` (high), `secret` (high), `empty-catch` (medium),
  `except-pass` (medium), `debugger` (medium), `todo-marker` (low),
  `debug-output` (low), `raw-hex` (low), `whitespace` (low).
- Findings sort by severity then file then line and render as
  `file:line: [severity] rule — message`.

**Why it exists** (`docs/llm-efficiency-audit.md §R2`): the `sdlc-review` skill's
"no judgment required" Step 4.5 greps *never ran*. `grep -rn 'TODO\|FIXME' -- '*.py'`
exits with "No such file or directory" because `--` ends option parsing and the
globs are read as filenames. Three of four returned nothing on every card, and
nothing is indistinguishable from clean.

### 2.4 `gates/evaluate.js` — probe harness with a three-way verdict

```sh
node gates/evaluate.js                 # default spec: diff-nonempty + gates/run.sh
node gates/evaluate.js --base <ref> --spec probes.json --cwd <dir> --pretty
```

Exit `0` pass · `1` fail · `2` inconclusive. One JSON object on stdout,
`schema: hermes.evaluate.v1`. Probe kinds: `command` (exit code decides) and
`snapshot` (stdout vs `expect_file`, CRLF/trailing-space normalised). Fields:
`id`, `kind`, `cmd`, `args`, `cwd`, `timeout_ms` (default 120000), `expect_exit`
(default 0), `inconclusive_exit`, `expect_file`.

Verdict rules: any `fail` → fail; else any `inconclusive` → inconclusive; else
pass. **An empty spec is `inconclusive`** — "nothing was checked" must never
round up. A missing or unparseable spec file is reported as a synthetic `spec`
probe, not a crash. Evidence is the last 2000 chars of stdout+stderr, with
`evidence_truncated` declared. Exports `evaluate`, `runProbe`, `verdictOf`,
`defaultSpec`, `pretty` when required as a module.

`inconclusive` is the whole point: "collapsing 'could not run' into 'did not
pass' is how green work gets blocked; on this board 8 of 33 blocks were a second
LLM being rate-limited, not a defect."

### 2.5 `gates/preflight.js` — Tier 0, before any LLM

```sh
node gates/preflight.js                  # this worktree, against master
node gates/preflight.js --base <ref>
node gates/preflight.js --cwd <dir>
node gates/preflight.js --pretty
node gates/preflight.js --no-log
```

Exit `0` approve · `1` reject · `2` escalate. Stdout: one JSON object,
`schema: hermes.preflight.v1`, fields `route`, `llm_skipped`/`llm_needed`,
`verdict`, `base`, `probes[]`.

```
                      ┌──────────────────────────────┐
   card / task  ───►  │ Tier 0  gates/preflight.js   │   no model, ~8-20 s
                      │  base-ref                    │
                      │  work-present                │
                      │  review-lint                 │
                      │  gates/run.sh (repo's own)   │
                      └───────────┬──────────────────┘
                                  │  gates/evaluate.js aggregates
              ┌───────────────────┼───────────────────┐
        pass  │             fail  │      inconclusive │
              ▼                   ▼                   ▼
          approve              reject              escalate
        exit 0, merge      exit 1, payload      exit 2, spawn the
        no LLM             back to worker,      model on this
                           no LLM               evidence only
```

`preflight.js` **composes; it adds no rules of its own.** Four probes:

| id | asks | inconclusive when |
|---|---|---|
| `base-ref` | does the base commit resolve | ref missing (exit 1/128) |
| `work-present` | is there anything to review (working tree, staged, committed) | nothing changed, or no `sh` (127) |
| `review-lint` | does the code survive a mechanical read | review-lint usage error (exit 2) |
| `gates` | does the target's own gate layer accept it | no `gates/run.sh` (127), or the base is red on the same check |

Deliberate choices worth replicating:

- `review-lint` runs **from the preflight's own checkout** with `--root` pointed
  at the target, so the rule set is identical on every card and a worktree
  lacking the gate can't turn a missing tool into a rejection.
- `gates/run.sh` is **the target's own** — the repo's definition of done, not the
  gate's.
- **Base reconciliation.** A red `gates` probe is re-checked against the base:
  `reconcileGatesAgainstBase()` replays the base's own `gates/run.sh` from a
  throwaway `git archive` extraction (no checkout, no worktree touched) and
  downgrades to `inconclusive` when the base is equally red. Without this, 16 of
  19 real sample cards would have wrongly rejected because their *base*, not
  their branch, was gate-red.
- `work-present` uses `git status --porcelain --untracked-files=all` because
  `review-lint --diff` sees untracked files too — two probes with different
  definitions of "is there work here" is how a card gets linted and rejected on
  files the diff probe called absent.

**Tier 0 can never block.** Every way it fails to answer resolves to `escalate`:
missing binary, timeout, unresolvable base ref, no `gates/run.sh`, `preflight.js`
absent, node missing, gate crash. A failed `.claude-preflight.log` append leaves
the route unchanged.

---

## 3. The runner — `scripts/claude-runner.py`

```sh
python3 scripts/claude-runner.py --prompt <file-or-string> --workdir <task-worktree>
python3 scripts/claude-runner.py --prompt <file> --workdir <worktree> --preflight
sh scripts/claude-runner-tests/run.sh          # dependency-free suite, T1–T13
python3 scripts/claude-runner.py --self-test
```

Spawns `claude -p <prompt>` as a **direct child** — no shell wrapper, no
supervising agent — inside the task's git worktree, streams stdout/stderr through
two pump threads, propagates the exit code, retries on rate limits.

| Concern | Behaviour |
|---|---|
| Binary resolution | `CLAUDE_BIN` (fails hard if set and missing) → `%APPDATA%\npm\claude.cmd` → `which claude.cmd` → `which claude`. `shutil.which("claude")` alone finds `claude.ps1`, which `subprocess` cannot execute. |
| Model routing | `complexity: high` (case-insensitive) anywhere in the prompt → `--model opus`; otherwise `--model sonnet`. An explicit `--model` always wins. |
| Defaults | `--allowed-tools Read,Edit,Write,Bash`, `--permission-mode acceptEdits`, `--timeout 1800`, `--output-format json` |
| Rate limits | Detects `rate_limit_error`, `"type":"rate_limit"`, `429`, `529`, `rate limit`, and any 5xx on a non-zero exit. Backoff `30 * 2**attempt` (30/60/120s), raised to `retry_after` when the payload carries one. Knobs: `CLAUDE_RUNNER_MAX_RETRIES` (3), `CLAUDE_RUNNER_BACKOFF_BASE` (30). |
| Timeout | Kills the whole process tree (`taskkill /T /F` on Windows, `killpg` elsewhere), exits `124`. |
| Audit trail | `<git-dir>/claude-runner-last.log` and `<workdir>/.claude-run.log`, each carrying `pid`, `ppid`, `cmdline`, `cwd`. `.claude-run.log` is added to `$(git rev-parse --git-path info/exclude)` once, so it is never committed and never touches tracked `.gitignore`. |
| Worktree awareness | `resolve_git_dir()` runs `git rev-parse --git-dir` because a worktree's `.git` is a *file* pointer, not a directory. |

**Preflight wiring** (`--preflight`, or `CLAUDE_RUNNER_PREFLIGHT=1`;
`--no-preflight` overrides; `--preflight-base` / `CLAUDE_RUNNER_PREFLIGHT_BASE`
default `master`; `--preflight-timeout` default 600s):

| runner exit | meaning |
|---|---|
| `0` | approved by the gate (no LLM), **or** the LLM ran and succeeded |
| `3` | deterministic reject, payload on stdout, no LLM spawned |
| `2` / `124` / `126` / `127` | usage / timeout / spawn failure / CLI not found |
| other | claude's own exit code |

Exit `3` is distinct on purpose — a caller must be able to tell "the gate said
no" from "the model ran and failed". The runner runs Tier 0 **before it even
looks up the Claude CLI**. Profile routing: **review = on** (that dispatch is
what the audit measured), **builder = off** (a builder is producing the diff;
there is nothing to pre-judge). The runner also adds three greppable lines to
`.claude-run.log`: `preflight_route`, `preflight_llm_skipped`,
`preflight_summary`.

The test suite (`scripts/claude-runner-tests/run.sh`) is worth reading as a
pattern: dependency-free `sh` + `python3`, `CLAUDE_BIN` always points at
`fake_claude.py`, and because git-bash's `$!` is an MSYS-virtualised pid, each
side self-reports `os.getpid()` to a file and the test compares those. T1
direct-child+cwd, T2 exit propagation, T3 rate-limit retry (exactly 2 spawns),
T4 backoff cap (exactly `1+max_retries` spawns), T5 timeout kill, T6 missing
binary, T7/T8 model routing, T9–T13 the preflight routes.

---

## 4. Workflow triggers — who calls the gate

| Trigger | Mechanism | Tier |
|---|---|---|
| Every edit in a Claude Code session | `.claude/settings.json` `PostToolUse` matcher `Edit\|Write\|MultiEdit\|NotebookEdit` → `node .claude/hooks/gate.js`, timeout 30s | fast |
| End of every turn that edited something | `.claude/settings.json` `Stop` → same hook, timeout 180s | full |
| Before any review LLM spawn | `claude-runner.py --preflight` → `gates/preflight.js` | Tier 0 |
| Review of a finished card | `sdlc-review` skill, Step 4 | full |
| Merge (both paths) | re-run inside the detached scratch worktree | full |
| Nightly | cron → collector + digest (§6) | read-only |

### `.claude/hooks/gate.js` — the hook bridge (95 lines)

- **`PostToolUse`**: fast gate on the one file just written (~80ms), touches a
  marker at `<repo>/.git/gate-dirty`, and exits 0 if the edit is outside the repo
  or isn't `.html`/`.js` (or is a `-check.js`).
- **`Stop`**: full suite, but **only if the marker exists** — otherwise every
  conversational reply would pay 8s. Honours `stop_hook_active` so it can't loop.
  Deletes the marker on green.
- **Exit 2 is the whole point**: Claude Code reads stderr on exit 2 and hands it
  back to the model, so a failure becomes work to fix rather than a message
  nobody reads. Any other non-zero exit is a broken hook and is deliberately not
  used.
- **A crashed gate (`status === null`) exits 0** — a hung gate must not wedge the
  session.
- Both the repo root and the hook payload path are `fs.realpathSync`'d before
  comparison, because the project root is a symlink and a plain `startsWith` said
  "not my repo" for every edit — the gate silently passed on everything.
- The marker lives in `.git/`, so it is never committed, never deployed, and is
  naturally per-clone — a worktree created for a kanban task gets its own.

---

## 5. The review agent loop

Canonical source: `hermes-ops/skills/sdlc-review/SKILL.md` v1.3.0. Deployed with
`python3 bin/install-skills.py`; install targets `builder` and `global` per
`hermes-skill.toml`. Force-loaded by the kanban dispatcher's `claim_review_task`
(`hermes_cli/kanban_db.py`, `claimed.skills = ["sdlc-review"]`).

```
worker (running) → worker completes → review → [review agent] → done (merged)
                                                 ↘ blocked (rejected, back to worker)
```

Six steps, "do not skip, do not reorder — the order exists so a failure in an
early step prevents wasted work in a later one":

1. **Orient** — `kanban_show()`; read title/body (the ACs), prior attempts,
   comments, parent handoffs; identify branch and workspace from `worker_context`.
2. **1.5 cwd guard** — `cd "$HERMES_KANBAN_WORKSPACE"`, then assert both `pwd`
   and `git rev-parse --show-toplevel` equal the card's workspace. Mismatch →
   `kanban_block(kind="needs_input")`, never a guess. Written after a 2026-08-03
   incident where a stale gateway's inherited cwd resolved to a *different clone*
   with a different `master` and a cleanly-mergeable branch was rejected.
3. **Read the diff** — `git diff master...HEAD`, `--stat`; split by file above
   15k chars.
4. **Verify acceptance criteria** — each one, specifically. "If a criterion is
   ambiguous or untestable from the diff, that is a rejection reason, not a
   reason to guess."
5. **Run the gates** — `sh gates/run.sh`; fall back to `*-check.js`; if neither
   exists say so as `residual_risk`. **"Gate output is the definition of done. A
   red gate is a rejection, full stop."** The reviewer does not fix code.
6. **4.5 Code-quality check** — deterministic greps plus a judgment list
   (`file:line`, severity high/medium/low, one line of reasoning): hallucinated
   imports, dead code, copy-paste divergence, one-caller abstractions, hardcoded
   config, edge cases, race conditions, secrets, injection, hot-path perf, test
   coverage. Secrets are the one finding that rejects regardless of the verdict.
7. **Verdict** — the agent **does not judge**. It assembles ACs + diff summary +
   gate output + findings and runs:
   ```sh
   claude -p "<...>" --model fable 2>&1 | tee .claude-verdict.log
   ```
   `accept` → merge path, `reject` → rejection path, no third option. A failed or
   unusable verdict call is **not** an accept — it blocks with `needs_input`.
   `.claude-verdict.log` is added to `info/exclude` and attached to the card via
   `kanban_attach` **before** the worktree prune destroys it; the attachment id
   goes in `metadata.verdict_log_attachment_id`.

### Merge path — CAS ref move

```sh
repo=$(dirname "$(git rev-parse --git-common-dir)")
# wrong-repo guard: compare --git-common-dir (identical from a linked worktree
# and its main checkout; --absolute-git-dir is NOT and false-triggers)
scratch="$repo/.worktrees/_review_$$"
git -C "$repo"    worktree add --detach "$scratch" "$integration"
before=$(git -C "$repo" rev-parse "$integration")
git -C "$scratch" reset --hard "$before"
git -C "$scratch" merge --no-ff --no-commit "$branch"
(cd "$scratch" && sh gates/run.sh)                 # gates re-run in the merged tree
git -C "$scratch" commit --no-verify -m "merge($branch): $title

kanban-task: $task_id"
after=$(git -C "$scratch" rev-parse HEAD)
git -C "$repo" update-ref "refs/heads/$integration" "$after" "$before"   # CAS
# post-merge assertion: rev-parse refs/heads/$integration must equal $after
git -C "$repo" worktree remove --force "$scratch"
git -C "$repo" worktree remove --force "$workspace"; git -C "$repo" branch -D "$branch"
```

Five safety invariants, shared verbatim with `merge_queue.py`:

1. **Never touch the primary working copy** — the integration branch is checked
   out in an editor somewhere; all merges happen in a detached scratch worktree.
2. **The integration ref only moves by CAS** — never `push --force`, never
   `branch -f`. A moved ref is a rejection, not a clobber.
3. **Never run against a dirty checkout** — the CAS still succeeds, but
   fast-forwarding a dirty checkout would silently revert the merge.
4. **Do not retry into a loop** — a conflict or red gate is one rejection with
   the full output.
5. **Do not fix code** — "if you start thinking 'I'll just fix this one line',
   stop — that is scope creep that hides the worker's mistake from the review
   trail."

### Rejection path

`kanban_comment` citing criterion number / gate output / `file:line` /
code-quality finding, then `kanban_block(...)` (`kind="needs_input"` when the
rejection is a question rather than a defect). The card returns to `blocked` and
the dispatcher respawns the worker on unblock.

### Batch fallback — `merge_queue.py`

```bash
python3 bin/merge_queue.py --repo ~/Repos/foreflux --board foreflux \
  --integration-branch master --check "gates/run.sh" --push
```

Also `--dry-run`, `--remote`. Queue = every `done`/`review` card whose branch
still exists and hasn't landed, oldest completion first; each merged in
`.worktrees/_merge`, gated there, then CAS. Failure surfacing: Hermes forbids
`done → blocked`, so a `review` card is blocked normally and a `done` card gets a
fresh **triage** card raised against it carrying the failure output. Non-zero
exit so cron surfaces it. Requires `.worktrees/` in the target repo's
`.gitignore`.

The skill's own version is gated: `hermes-ops/gates/sdlc-review-check.sh` greps
`hermes-skill.toml` and `SKILL.md` for `1.3.0` and for the retention-fix markers
`kanban_attach(filename="claude-verdict.log"` and `verdict_log_attachment_id`.

---

## 6. Long-horizon task handling

### 6.1 The board

`workspace_kind: worktree`; each card gets `<repo>/.worktrees/<task_id>` on
`wt/<task_id>`. `board.json` is thin — `slug`, `name`, `default_workdir`; all
loop behaviour lives in the skill and the gates, not in board config. State
(`kanban.db`) is single-machine and never synced: "two machines replicating a
write-ahead log produces silent corruption, and it takes the board history with
it." Move state with `hermes backup` → `hermes import`, never a file sync.

Card sizing rules from `.hermes.md`: one feature/fix per PR; build minimal
first; grep before abstracting; cleanup *after* the feature works; small PRs with
a review→fix→repeat loop; human sets direction, agent handles tests/kanban/
orchestration. Max **1 concurrent runner** per subscription.

### 6.2 Nightly review (the long-horizon loop)

Two cron jobs, both `no_agent=true` — hermes never spins up an agent of its own;
the LLM call goes through the supervised runner, so it bills against the flat
subscription:

| Job | Schedule | Script |
|---|---|---|
| `nightly audit (foreflux board)` | `0 22 * * *` | `nightly_audit.py` |
| `Foreflux Nightly Review (claude-code)` | `30 2 * * *` | `foreflux_nightly_review_claude.py` |
| `Board audit digest (hermes-audit.sh)` | `0 2 * * *` | `hermes-audit.sh` |
| `mission-control render` | `* * * * *` | `mission_control.py` |

The agent-mode originals (`Foreflux Nightly Review (improvements)`,
deepseek-v4-flash) are **paused** — every one was converted to the no-agent +
runner pattern.

`foreflux_nightly_review_claude.py` flow:

1. Run the read-only collector `foreflux_nightly_review.py` (opens
   `kanban.db` with `mode=ro`, 24h window, no network, no subprocess, **always
   exits 0** — "a degraded digest beats a dead cron"). It emits `task_runs`,
   blocked/triage cards, **circuit-breaker trips** (`events.kind IN
   ('gave_up','block_loop_detected')`), merge/review failures
   (`BAD_REVIEW_OUTCOMES = crashed, gave_up, timed_out, blocked, failed, error`),
   and a `COMMENT_TARGET=<id>` line naming the oldest open card.
2. Fold that output into a fixed prompt under a `COLLECTED_DATA:` marker. The
   prompt asks for board health, per-blocked-card next action, circuit-breaker
   patterns citing run ids, and **2–5 concrete system improvement proposals each
   grounded in a specific card or run id**. Read-only: "the comment is posted by
   the wrapper script, not by you."
3. `claude-runner.py --allowed-tools Read --output-format text --timeout 1800`,
   prompt passed as a temp **file** to dodge Windows argv limits.
4. Post the digest via `hermes kanban --board foreflux comment <target> --author
   nightly-audit`.
5. Print the digest — stdout **is** the delivered cron message.

Failures are loud: any non-zero step prints one human-readable line and exits
non-zero, "so the cron surfaces an error instead of silently swallowing (the
original deepseek agent silently succeeded even when Claude had nothing)."
`nightly_audit.py` takes the opposite tack for its softer job — if the CLI is
missing or times out it prints the raw deterministic digest and still exits 0,
so the job is useful with no LLM at all.

Board state is always **collected deterministically in Python; the model only
writes the prose.** That is the pattern to copy.

---

## 7. Measured results (`docs/llm-efficiency-synthesis.md`, task `t_f4b17d20`)

The argument for the whole Tier 0 design, with the numbers as the source states
them. These are point-in-time reads against the live installation.

| # | Finding | Number |
|---|---|---|
| 1 | A ~2 KB merge-or-reject verdict produced by a full agent session | median **804,305 tokens**/session board-wide (1.4M–7.5M when Step 5 ran) |
| 2 | Crash rate, with zero classification — every `task_runs.error` is the literal string `pid <N> not alive` | **39.5%** (192/486 spawns) |
| 3 | Blocks caused by the *verdict* provider's own session limit | **8/33 (24%)** of all `blocked` events |
| 4 | Verdicts escaping the skill's accept/reject grammar | **10** unparsed `PARTIAL` verdicts |
| 5 | Step 4.5's "deterministic" checks never ran | the `-- '*.py'` grep bug |
| 6 | Verdict artifact size | mean **1,984 bytes** (~500 output tokens) |
| 7 | Review wall-clock | median **211 s** (max 485 s, n=13) |
| 8 | Base-poisoning false positives | **16/19** sample cards would have wrongly rejected |
| 9 | review-lint whole-file-scan false positives | **2/4** remaining rejects |

Replaying the tuned Tier 0 gate against 19 real merged cards (18 in the
aggregate — one has no transcript and is excluded, not counted as zero):

| metric | before | after | saved |
|---|---|---|---|
| tokens | 243,069,411 | 190,640,073 | **52,429,338 (21.6%)** |
| wall-clock | 30,444 s | 23,065 s | **7,379 s (24.2%)** |
| routes | — | approve=1, reject=4, escalate=13 | — |

Caveats the source insists are not rounded off, and which should carry over to
any replication:

- Only **approve** (1/18) skips the LLM entirely. **escalate** (13/18, the common
  case) still runs the full session — Tier 0 adds ~20 s there and recovers no
  tokens. The saving is dominated by a single approve.
- Of the 4 rejects, 1 was a true positive, 1 was already fixed, and **2 are the
  same undocumented bug**: `review-lint --diff` scans whole files instead of
  changed hunks.
- **No false-negative case exists in the sample.** All 19 cards succeeded, so the
  gate's leniency is exercised but its safety on a genuinely bad diff is not.
  "This is a real gap in the evidence, not a clean bill of health."

Known open items on the ForeFlux side, ranked in the synthesis: a deterministic
crash classifier in `hermes-agent` (biggest remaining lever, ~35% of LLM spend
redone on cards that didn't need it); demoting the Step 5 verdict to a
constrained `pass|fail|unverifiable` AC adjudicator with the mechanical legs
precomputed as booleans; extracting the CAS merge into a testable
`bin/land-branch.sh`; making the `sdlc-review` gate check the deployed skill's
hash instead of grepping a hardcoded version (canonical is v1.3.0, deployed
drifted to v1.3.1); fixing `review-lint --diff`'s whole-file scan; and 34
abandoned worktrees (~59 MB).

---

## 8. Comparison against this repo (JCA1221-Website)

State on `wt/t_98d72342`, for the compare-and-replicate half of the card.

| Component | ForeFlux | This repo | Gap |
|---|---|---|---|
| `gates/run.sh` | syntax + invariants + publish + review-lint self-test + git-tree-guard, then `*-check.js` glob; `--fast` tier | `tsc -b`, diff-scoped `eslint --max-warnings=0`, then `*-check.js` glob; no `--fast` tier (documented: nothing cheap enough exists yet) | different content, same contract |
| Lint model | invariants.js — 6 repo-specific rules restated from written decisions | ESLint scoped to the diff vs the integration branch (`GATE_BASE`) | **no invariants layer.** This repo has no restated-decision rules; ForeFlux's `reduced-motion`, `tokens-not-hex` and `no-service-role-key` all have obvious analogues here |
| `gates/preflight.js` | present | **present** (ported) | — |
| `gates/evaluate.js` | present | **present** (ported) | — |
| `gates/git-tree-guard.sh` | present, wired into both tiers | **present** (header credits the ForeFlux port) | — |
| `gates/review-lint.js` | present, 9 rules, `--diff`/`--fail-on`/`--root` | **absent** | **the main missing piece** — this repo's preflight has no Tier 1 lint probe of its own |
| `gates/soak.js` | absent | present | this repo is ahead |
| Claude Code hook | `.claude/hooks/gate.js`, PostToolUse fast + Stop full | `gates/claude-hook.js` + `gates/claude-settings.json`, installed by `npm run gate:install-hooks` | same design |
| Git hook | none (`core.hooksPath` unset) | `.githooks/pre-commit` via `prepare` | this repo is ahead |
| CI | none | `.github/workflows/gate.yml` (+ `pr-decline.yml`, `stale.yml`) | this repo is ahead |
| Runner | `scripts/claude-runner.py` with `--preflight` | none in-repo (workers spawn via the dispatcher) | **no supervised runner**, so no model-by-complexity routing, no rate-limit backoff, no `.claude-run.log` audit trail |
| Review loop | `sdlc-review` v1.3.0 (base = `master`) | same skill; local behaviour documented in `docs/sdlc-audit/review-loop.md`, with the integration branch derived from `origin/HEAD` → `main` → `master` and the Step 4.5 greps fixed | this repo is ahead on both |
| Check catalogue | `CHECKS.md`, one section per check, "what it asserts / what regression it catches" | none | **missing** — worth adopting if `*-check.js` files accumulate |
| Nightly loop | collector + no-agent runner digest, cron-registered | none for `jca1221` | not wired |

Highest-value ports, in order: `gates/review-lint.js` (with the whole-file-scan
bug fixed at port time rather than inherited), an `invariants.js` layer for the
design decisions already written in `DESIGN.md`/`PRODUCT.md`, and a `CHECKS.md`
catalogue once there is more than one root check.

---

## 9. Reproducing the evidence

```sh
# ForeFlux — read from HEAD, the working tree is stale
cd F:/Documents/Repositories/foreflux
git show HEAD:gates/run.sh
git ls-tree --name-only HEAD gates/ docs/
git log --oneline -25

# the gate layer, from a clean checkout of that commit
sh gates/run.sh                                    # exit 0, full suite
sh gates/git-tree-guard-test.sh                    # 5 cases
node gates/review-lint.js --diff master --root=.   # 0 blocking
node gates/preflight.js --pretty
python3 scripts/gate-impact-measure.py --json /tmp/gate-impact-result.json
sh scripts/claude-runner-tests/run.sh              # T1–T13

# review skill + merge fallback
cd F:/Documents/Repositories/hermes-ops
sh gates/run.sh
python3 bin/merge_queue.py --repo <repo> --board foreflux --dry-run

# board and cron state
python -c "import json;[print(j['name'],j.get('schedule_display'),j.get('script'),j.get('state')) for j in json.load(open(r'C:/Users/USER/AppData/Local/hermes/cron/jobs.json'))['jobs']]"
python C:/Users/USER/AppData/Local/hermes/scripts/foreflux_nightly_review.py
```

## 10. What is *not* covered here

- `hermes-agent`'s `kanban_db.py` (the dispatcher, `claim_review_task`,
  `_classify_worker_exit`) — outside both repos; read only through the
  synthesis doc's citations, not inspected directly for this card.
- `docs/gate-impact.md` and `docs/llm-efficiency-audit.md` were read for their
  headline numbers via the synthesis doc's citation table, not line by line.
- The ForeFlux app-side checks (`CHECKS.md`'s 14 sections, covering 23 root
  `*-check.js` files) are summarised as a pattern here, not transcribed — read
  `CHECKS.md` directly when porting one.
