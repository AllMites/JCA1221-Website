#!/bin/sh
# gates/runner-tests/run.sh — dependency-free test suite for gates/runner.py.
#
# Mirrors foreflux's scripts/claude-runner-tests/run.sh T1-T13 pattern (see
# docs/foreflux-reference.md §3): sh + python3 only, CLAUDE_BIN always points at
# fake_claude.py in this directory, no network, no real Claude subscription.
#
#   sh gates/runner-tests/run.sh
#
# Each test spawns gates/runner.py against the fixture, asserts on its exit
# code and on whatever the fixture wrote to disk about its own invocation.
# Exits 0 if every case passes, non-zero (with the failing case named) if not.
set -u

# -W: Windows-style (drive-letter) path. Under git-bash, a native python.exe
# (as opposed to an MSYS-built one) does not understand /f/... mount paths —
# it concatenates the current drive onto them literally — so every path handed
# to $PY has to be the -W form, not bash's own default.
HERE="$(cd "$(dirname "$0")" && pwd -W)"
ROOT="$(cd "$HERE/../.." && pwd -W)"
RUNNER="$ROOT/gates/runner.py"
FIXTURE="$HERE/fake_claude.py"

PY=python3

# Case/slash-insensitive compare — a native python.exe reports os.getcwd() as
# a backslashed Windows path; bash's own paths are forward-slashed.
norm() { printf '%s' "$1" | tr 'A-Z' 'a-z' | tr '\\' '/'; }

pass=0
fail=0

ok() {
  pass=$((pass + 1))
  printf 'ok   %s\n' "$1"
}

bad() {
  fail=$((fail + 1))
  printf 'FAIL %s — %s\n' "$1" "$2"
}

# A fresh scratch workdir per test — the audit log and the fixture's
# self-report files all live under it, so nothing leaks between cases.
new_workdir() {
  wd=$(mktemp -d "${TMPDIR:-/tmp}/runner-test-XXXXXX")
  wd=$(cd "$wd" && pwd -W)
  printf '%s' "$wd"
}

# ---------------------------------------------------------------- T1, T2 ---

t1_direct_child_and_cwd() {
  wd=$(new_workdir)
  cwd_file="$wd/.fake-cwd"
  pid_file="$wd/.fake-pid"
  out=$(CLAUDE_BIN="$FIXTURE" FAKE_MODE=success FAKE_CWD_FILE="$cwd_file" FAKE_PID_FILE="$pid_file" \
    $PY "$RUNNER" --prompt "hello" --workdir "$wd" 2>&1)
  code=$?
  reported_cwd=$(cat "$cwd_file" 2>/dev/null || true)
  if [ "$code" -eq 0 ] && [ -s "$pid_file" ] && [ "$(norm "$wd")" = "$(norm "$reported_cwd")" ]; then
    ok "T1 direct-child spawn runs in --workdir"
  else
    bad "T1 direct-child spawn runs in --workdir" "exit=$code cwd_want=$want cwd_got=$got out=$out"
  fi
}

t2_exit_propagation() {
  wd=$(new_workdir)
  CLAUDE_BIN="$FIXTURE" FAKE_MODE=fail $PY "$RUNNER" --prompt "hello" --workdir "$wd" >/dev/null 2>&1
  code=$?
  if [ "$code" -eq 1 ]; then
    ok "T2 claude's own non-rate-limit exit code propagates"
  else
    bad "T2 claude's own non-rate-limit exit code propagates" "exit=$code, want 1"
  fi
}

# --------------------------------------------------------------- T3, T4 ----

t3_rate_limit_retry_exact_count() {
  wd=$(new_workdir)
  calls_file="$wd/.fake-calls"
  CLAUDE_BIN="$FIXTURE" FAKE_MODE=ratelimit FAKE_RATELIMIT_SUCCEED_AT=3 FAKE_CALLS_FILE="$calls_file" \
    $PY "$RUNNER" --prompt "hello" --workdir "$wd" --backoff-base 0 --max-retries 5 >/dev/null 2>&1
  code=$?
  spawns=$(wc -l < "$calls_file" 2>/dev/null | tr -d ' ')
  if [ "$code" -eq 0 ] && [ "$spawns" = "3" ]; then
    ok "T3 rate-limit retry succeeds after exactly 3 spawns"
  else
    bad "T3 rate-limit retry succeeds after exactly 3 spawns" "exit=$code spawns=$spawns, want exit=0 spawns=3"
  fi
}

t4_backoff_cap_exact_count() {
  wd=$(new_workdir)
  calls_file="$wd/.fake-calls"
  CLAUDE_BIN="$FIXTURE" FAKE_MODE=ratelimit_always FAKE_CALLS_FILE="$calls_file" \
    $PY "$RUNNER" --prompt "hello" --workdir "$wd" --backoff-base 0 --max-retries 2 >/dev/null 2>&1
  code=$?
  spawns=$(wc -l < "$calls_file" 2>/dev/null | tr -d ' ')
  # 1 initial attempt + max_retries retries = 3, then the runner gives up.
  if [ "$code" -eq 1 ] && [ "$spawns" = "3" ]; then
    ok "T4 backoff cap stops after exactly 1+max_retries spawns"
  else
    bad "T4 backoff cap stops after exactly 1+max_retries spawns" "exit=$code spawns=$spawns, want exit=1 spawns=3"
  fi
}

# -------------------------------------------------------------------- T5 ---

t5_timeout_kill() {
  wd=$(new_workdir)
  start=$(date +%s)
  CLAUDE_BIN="$FIXTURE" FAKE_MODE=success FAKE_SLEEP=30 \
    $PY "$RUNNER" --prompt "hello" --workdir "$wd" --timeout 1 >/dev/null 2>&1
  code=$?
  end=$(date +%s)
  elapsed=$((end - start))
  # Bounded well under the fixture's 30s sleep — proves the process tree was
  # actually killed, not merely that the runner gave up waiting.
  if [ "$code" -eq 124 ] && [ "$elapsed" -lt 15 ]; then
    ok "T5 timeout kills the child and exits 124"
  else
    bad "T5 timeout kills the child and exits 124" "exit=$code elapsed=${elapsed}s, want exit=124 elapsed<15s"
  fi
}

# -------------------------------------------------------------------- T6 ---

t6_missing_binary() {
  wd=$(new_workdir)
  CLAUDE_BIN="$wd/does-not-exist.cmd" $PY "$RUNNER" --prompt "hello" --workdir "$wd" >/dev/null 2>&1
  code=$?
  if [ "$code" -eq 127 ]; then
    ok "T6 missing CLAUDE_BIN exits 127, refuses to silently skip"
  else
    bad "T6 missing CLAUDE_BIN exits 127, refuses to silently skip" "exit=$code, want 127"
  fi
}

# ------------------------------------------------------------- T7, T8 ------

t7_model_routing_high() {
  got=$($PY -c "import sys; sys.path.insert(0, '$ROOT/gates'); import runner; print(runner.resolve_model('complexity: high\ndo the thing', None))")
  if [ "$got" = "opus" ]; then
    ok "T7 complexity: high routes to opus"
  else
    bad "T7 complexity: high routes to opus" "got=$got, want opus"
  fi
}

t8_model_routing_default() {
  got=$($PY -c "import sys; sys.path.insert(0, '$ROOT/gates'); import runner; print(runner.resolve_model('no complexity line here', None))")
  explicit=$($PY -c "import sys; sys.path.insert(0, '$ROOT/gates'); import runner; print(runner.resolve_model('complexity: high', 'sonnet'))")
  if [ "$got" = "sonnet" ] && [ "$explicit" = "sonnet" ]; then
    ok "T8 default routes to sonnet; explicit --model always wins"
  else
    bad "T8 default routes to sonnet; explicit --model always wins" "default=$got explicit-override=$explicit"
  fi
}

# ----------------------------------------------------------- T9-T11 --------

write_preflight_stub() {
  wd="$1"; exit_code="$2"
  mkdir -p "$wd/gates"
  cat > "$wd/gates/preflight.js" <<'EOF'
#!/usr/bin/env node
const code = parseInt(process.env.FAKE_PREFLIGHT_EXIT || '2', 10);
console.log('route=' + (code === 0 ? 'approve' : code === 1 ? 'reject' : 'escalate') + ' — stub preflight');
process.exit(code);
EOF
}

t9_preflight_approve_skips_llm() {
  wd=$(new_workdir)
  write_preflight_stub "$wd" 0
  calls_file="$wd/.fake-calls"
  out=$(CLAUDE_BIN="$FIXTURE" FAKE_MODE=success FAKE_CALLS_FILE="$calls_file" FAKE_PREFLIGHT_EXIT=0 \
    $PY "$RUNNER" --prompt "hello" --workdir "$wd" --preflight 2>&1)
  code=$?
  spawns=0
  [ -f "$calls_file" ] && spawns=$(wc -l < "$calls_file" | tr -d ' ')
  if [ "$code" -eq 0 ] && [ "$spawns" = "0" ]; then
    ok "T9 preflight approve (exit 0) skips the spawn entirely"
  else
    bad "T9 preflight approve (exit 0) skips the spawn entirely" "exit=$code spawns=$spawns out=$out"
  fi
}

t10_preflight_reject_exits_3() {
  wd=$(new_workdir)
  write_preflight_stub "$wd" 1
  calls_file="$wd/.fake-calls"
  CLAUDE_BIN="$FIXTURE" FAKE_MODE=success FAKE_CALLS_FILE="$calls_file" FAKE_PREFLIGHT_EXIT=1 \
    $PY "$RUNNER" --prompt "hello" --workdir "$wd" --preflight >/dev/null 2>&1
  code=$?
  spawns=0
  [ -f "$calls_file" ] && spawns=$(wc -l < "$calls_file" | tr -d ' ')
  if [ "$code" -eq 3 ] && [ "$spawns" = "0" ]; then
    ok "T10 preflight reject (exit 1) → runner exits 3, no LLM spawned"
  else
    bad "T10 preflight reject (exit 1) → runner exits 3, no LLM spawned" "exit=$code spawns=$spawns"
  fi
}

t11_preflight_escalate_spawns() {
  wd=$(new_workdir)
  write_preflight_stub "$wd" 2
  calls_file="$wd/.fake-calls"
  CLAUDE_BIN="$FIXTURE" FAKE_MODE=success FAKE_CALLS_FILE="$calls_file" FAKE_PREFLIGHT_EXIT=2 \
    $PY "$RUNNER" --prompt "hello" --workdir "$wd" --preflight >/dev/null 2>&1
  code=$?
  spawns=$(wc -l < "$calls_file" 2>/dev/null | tr -d ' ')
  spawns=${spawns:-0}
  if [ "$code" -eq 0 ] && [ "$spawns" = "1" ]; then
    ok "T11 preflight escalate (exit 2) → proceeds to spawn"
  else
    bad "T11 preflight escalate (exit 2) → proceeds to spawn" "exit=$code spawns=$spawns"
  fi
}

# ------------------------------------------------------------------- T12 ---

t12_extra_args_passthrough() {
  wd=$(new_workdir)
  argv_file="$wd/.fake-argv"
  CLAUDE_BIN="$FIXTURE" FAKE_MODE=success FAKE_ARGV_FILE="$argv_file" \
    $PY "$RUNNER" --prompt "hello" --workdir "$wd" --permission-mode bypassPermissions -- --extra-flag zzz >/dev/null 2>&1
  case "$(cat "$argv_file" 2>/dev/null)" in
    *bypassPermissions*extra-flag*zzz*) ok "T12 permission-mode and unmodelled extra args reach the CLI invocation" ;;
    *) bad "T12 permission-mode and unmodelled extra args reach the CLI invocation" "argv=$(cat "$argv_file" 2>/dev/null)" ;;
  esac
}

# ------------------------------------------------------------------ main ---

$PY "$RUNNER" --self-test >/dev/null 2>&1 || bad "self-test" "gates/runner.py --self-test failed"
[ "$fail" -eq 0 ] && ok "runner self-test"

t1_direct_child_and_cwd
t2_exit_propagation
t3_rate_limit_retry_exact_count
t4_backoff_cap_exact_count
t5_timeout_kill
t6_missing_binary
t7_model_routing_high
t8_model_routing_default
t9_preflight_approve_skips_llm
t10_preflight_reject_exits_3
t11_preflight_escalate_spawns
t12_extra_args_passthrough

printf '\n%d passed, %d failed\n' "$pass" "$fail"
[ "$fail" -eq 0 ]
