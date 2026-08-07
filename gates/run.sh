#!/bin/sh
# gates/run.sh — the deterministic gate layer. One command, one verdict.
#
#   sh gates/run.sh            typecheck, diff-scoped lint, then any *-check.js
#   GATE_VERBOSE=1 sh …        also print the checks that passed
#   GATE_BASE=origin/main sh … lint against a different integration branch
#
# Nothing here knows what invoked it. The Claude Code `Stop` hook, the
# .githooks/pre-commit hook, .github/workflows/gate.yml and the sdlc-review
# agent all call this same script, so the gate is shared ground rather than one
# caller's opinion of what "clean" means.
#
# --- why lint is scoped to the diff -------------------------------------------
# `npx eslint .` reports 94 problems (82 errors, 12 warnings, 39 files) at `main`
# today. A whole-repo lint gate would therefore reject every card on arrival, for
# reasons that have nothing to do with its diff, and a gate that is red on arrival
# is a gate everybody learns to skip. So the rule is:
# touch a file and you own its lint state; leave it alone and it stays somebody
# else's card. Warnings count as failures inside that scope (--max-warnings=0) —
# the scope is what makes the strictness affordable.
#
# ponytail: this scoping is the known ceiling. Once `npx eslint . --max-warnings=0`
# is green at main, delete lint_diff and replace the call with `npx eslint .
# --max-warnings=0 --cache`, and lint becomes a standing invariant instead of a
# diff filter.
#
# There is deliberately no --fast tier. The only per-edit-cheap check this repo
# could run today is ESLint at ~1.9s per file, which is not cheap, so the
# PostToolUse hook just marks the turn dirty and `Stop` runs this once. Add a
# fast tier when there is an invariants layer worth under ~200ms to put in it.
set -eu

cd "$(dirname "$0")/.."

# Must run before anything else measures the tree: HEAD moved by plumbing leaves
# the index and working tree stale, and then every verdict below is about the
# wrong commit.
sh gates/git-tree-guard.sh || exit 1

fail=0

# Captures both streams and prints them only on failure, so a green run is silent
# and a red one is exactly the failing tool's own message — which is what the
# Claude Code hook feeds back to the model on exit 2.
run() {
  label="$1"; shift
  if ! out=$("$@" 2>&1); then
    printf '%s\n' "$out" >&2
    fail=1
  elif [ -n "${GATE_VERBOSE:-}" ]; then
    printf 'ok   %s\n' "$label"
  fi
}

# First base ref that actually exists. `main` is absent in a CI checkout that only
# fetched the PR head, and GATE_BASE is how the merge queue and CI name theirs.
resolve_base() {
  for b in "${GATE_BASE:-}" main origin/main; do
    [ -n "$b" ] || continue
    if git rev-parse -q --verify "$b^{commit}" >/dev/null 2>&1; then
      printf '%s\n' "$b"
      return 0
    fi
  done
  printf 'HEAD\n'
}

lint_diff() {
  base=$(resolve_base)
  # merge-base, not the base tip: a branch that forked a week ago must not be
  # blamed for files that changed on main since. Diffing the merge-base against
  # the *working tree* (no second rev) covers committed and uncommitted work in
  # one pass, which is what a pre-commit or mid-turn caller needs.
  mb=$(git merge-base "$base" HEAD 2>/dev/null || printf 'HEAD\n')
  files=$(
    {
      git diff --name-only --diff-filter=ACMR "$mb"
      git ls-files --others --exclude-standard
    } | grep -E '\.(ts|tsx|js|jsx|mjs|cjs)$' | sort -u
  ) || true

  if [ -z "$files" ]; then
    [ -n "${GATE_VERBOSE:-}" ] && printf 'lint: no changed .ts/.tsx/.js files vs %s\n' "$base"
    return 0
  fi

  # --no-warn-ignored: passing an ignored path explicitly is a warning in ESLint 9,
  # and --max-warnings=0 would turn "you edited product-plan/" into a gate failure.
  # Unquoted on purpose — one path per line, and this repo has no paths with spaces.
  # shellcheck disable=SC2086
  npx eslint --no-warn-ignored --max-warnings=0 --cache $files
}

run "typecheck" npx tsc -b
run "lint" lint_diff

# A glob, not a list. A check that has to be added to a list somewhere else is a
# check that eventually is not: write <name>-check.js at the repo root and it is
# in the suite.
for c in *-check.js; do
  [ -f "$c" ] && run "$c" node "$c"
done

exit $fail
