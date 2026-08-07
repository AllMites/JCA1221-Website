#!/bin/sh
# gates/git-tree-guard.sh — catches the stale-index hazard: HEAD moved by a
# plumbing merge (update-ref / commit-tree, with no checkout) without touching
# the index or the working tree, so every check in gates/run.sh would silently
# measure the wrong commit and report a clean verdict about code that is not
# what was merged.
#
# Ported from the foreflux reference, where the last two merges on the primary
# checkout did exactly this. The merge queue that will move work onto this
# repo's `main` uses the same plumbing, so the hazard arrives with it.
set -eu

cd "$(dirname "$0")/.."

# Not a git repo, or an unborn HEAD (fresh `git init`, `git archive` extract):
# nothing to compare against. Degrade silently rather than block those cases.
git rev-parse --git-dir >/dev/null 2>&1 || exit 0
git rev-parse -q --verify HEAD >/dev/null 2>&1 || exit 0

# .githooks/pre-commit sets this. Staged-differs-from-HEAD is the *normal* state
# inside a pre-commit hook, not the hazard this guard exists to catch, and the
# guard would otherwise reject every commit in the repo.
[ -n "${GATE_ALLOW_STAGED:-}" ] && exit 0

if ! git diff --cached --quiet; then
  if git diff --quiet; then
    echo "git-tree-guard: worktree and index match each other but both differ from HEAD; the gate measures the working tree, which is not the checked-out commit — if HEAD was just moved by a merge, run \`git reset --hard HEAD\`, otherwise commit the staged changes" >&2
  else
    echo "git-tree-guard: staged changes vs HEAD alongside unstaged work; commit or stash before trusting this gate" >&2
  fi
  exit 1
fi

exit 0
