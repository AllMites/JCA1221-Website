# Long-horizon validation of the deterministic gate layer

Card `t_c53dbc51`, 2026-08-07. What this answers: does the gate layer built by
`t_8f6c0a6b` and the review loop built by `t_ec202cc9` still say the same thing on
cycle 10 of a growing branch that they said on cycle 1, and does the whole thing hold
when several branches run it at once.

A single green `gates/run.sh` proves the gate works on one diff, once. It cannot see
the failure mode this card exists to rule out: drift — a cache that goes stale, a lint
scope that quietly narrows as a branch diverges from `main`, a log that stops being
appended to, a tree left dirty by the previous cycle so the next one measures the wrong
commit.

## The suite had to be composed first

Neither branch carried the whole suite:

| piece | where it was |
| --- | --- |
| `gates/run.sh`, `gates/git-tree-guard.sh`, `.githooks/pre-commit`, `.github/workflows/gate.yml` | `wt/t_8f6c0a6b`, **not merged to `main`** |
| `gates/preflight.js`, `gates/evaluate.js` | `main` @ `1ece1ce` |

So this branch merges `wt/t_8f6c0a6b` (merge commit `23addff`) and validates the
composition. **Everything below is true of the composed branch, not of `main`.** Until
`wt/t_8f6c0a6b` lands, `main` still has no `gates/run.sh` and the preflight `gates`
probe there still resolves to `escalate`, exactly as `review-loop.md` describes.

First consequence of composing, on the composed branch:

```
node gates/preflight.js --base main --pretty
route=approve — verdict=pass — 3 pass, 0 fail, 0 inconclusive
  PASS  base-ref (33ms)       — exit 0
  PASS  work-present (235ms)  — exit 0
  PASS  gates (8005ms)        — exit 0
  → LLM skipped (approve)
```

That is the first `approve` Tier 0 has ever returned in this repo. Every prior card
escalated on the `gates` probe because there was no gate layer to probe.

## The harness

`gates/soak.js` — one file, no dependencies, `spawnSync` and `assert`-shaped checks.
Each cycle does four things and asserts ten invariants:

1. **seed** — write `src/soak/<label>-cycle-<n>.ts` carrying one unused local. Both
   halves of the suite must reject it independently (`tsc` `noUnusedLocals` → TS6133,
   ESLint → `@typescript-eslint/no-unused-vars`). Re-seeded *every* cycle: a gate is
   only known to be strict on the cycle you watched it reject something.
2. **fix** — rewrite the module clean; the same gate must now pass.
3. **route** — `node gates/preflight.js --base main`; a green tree must route `approve`
   with no model spawned.
4. **commit** — through the real `.githooks/pre-commit` (no `--no-verify`), so the
   per-commit stage fires on every cycle too. Then assert the tree carries no tracked
   modification, the preflight log grew by exactly one line, and history grew by
   exactly one commit.

Per cycle that is four full gate runs (seed, fix, preflight's own, pre-commit's own).

## Results

Three branches, forked from the same commit `9466163`, run **concurrently** in separate
worktrees:

| branch | cycles | wall clock | per cycle | verdict |
| --- | --- | --- | --- | --- |
| `soak/long-a` | 10 | 350.4 s | 35.0 s | PASS |
| `soak/par-b` | 4 | 151.8 s | 37.9 s | PASS |
| `soak/par-c` | 4 | 151.9 s | 38.0 s | PASS |

**18 cycles × 10 invariants = 180 assertions, 0 failures.** Raw reports:
`docs/sdlc-audit/soak/soak-report-*.json`.

A single cycle run alone costs 33.7 s, so three-way concurrency costs 4–13 % per cycle
— the branches contend for CPU, not for state. No cross-branch interference of any
kind appeared: each branch's history, preflight log and scratch files stayed its own.

### No state lost across cycles

Per cycle, on every one of the 18: tree clean of tracked modifications after the
commit; `rev-list --count HEAD` exactly `baseline + n`; `.claude-preflight.log` exactly
`n` lines. The log after the 10-cycle branch (`docs/sdlc-audit/soak/long-a-preflight.jsonl`):

```
lines: 10   routes: approve   llm_skipped: all true
probe set, all 10 lines identical: base-ref:pass|work-present:pass|gates:pass
first 2026-08-07T05:02:26.982Z   last 2026-08-07T05:07:38.757Z
```

Ten runs, ten records, one shape. The loop's memory is intact and its findings are
recorded the same way on the last cycle as on the first.

### The lint scope does not narrow as the branch grows

The scope worry is specific: `gates/run.sh` lints files changed against
`merge-base(main, HEAD)`, so a branch that keeps committing could in principle stop
covering its own older work. Tested directly — after all 10 cycles, a fresh unused local
was injected into the **cycle-1** file:

```
src/soak/long-a-cycle-1.ts(4,9): error TS6133: 'staleScopeCheck' is declared but never read
  4:9  error  'staleScopeCheck' is assigned a value but never used  @typescript-eslint/no-unused-vars
gate exit=1
```

Both halves still fire on the oldest file in the branch, ten commits later. Reverted,
gate green again at HEAD.

### The reject → fix → accept path, deterministic tier

Run on this branch directly, outside the soak:

| tree | route | exit | model spawned |
| --- | --- | --- | --- |
| one seeded unused local | `reject` | 1 | no |
| after the fix | `approve` | 0 | no |

Two iterations, terminating, no LLM session on either. This is the review loop's Tier 0
doing the whole job for a mechanical defect — which is the point of the ordering in
`preflight.js`.

## The one failure, and what it was

The first 8-cycle run failed cycle 8 on `tree_clean_after_commit`. Cause: the harness
redirected its own stdout into the worktree, `git add -A` committed that file in cycle
1, and node flushed its 4 KB stdout buffer into the same file during cycle 8 — so a
tracked file really was modified after the commit. **The assertion was correct; the
harness was staging a file it was still writing.** Fixed in `9466163`: stage only the
cycle's scratch dir, and assert on tracked modifications rather than on untracked
scratch. Reported here rather than quietly re-run, because a soak that never fails
during development is a soak nobody has debugged.

## What this does not cover

- **`main` is unchanged.** The composed suite lives on `wt/t_c53dbc51` only. Merging
  `wt/t_8f6c0a6b` to `main` is what makes the `approve` route above true for every
  other card; until then they all escalate.
- **The dispatcher's `failure_limit`** — the numeric cap on how many times a card may
  bounce — could not be read from this workspace (the `hermes-ops` checkout is outside
  the permission scope). What *is* verified in-repo: `evaluate.js` contains no retry or
  `while` loop, one probe means one spawn; `reconcileGatesAgainstBase` runs at most
  once and only on the `gates` probe's own failure; and empirically 10 cycles produced
  exactly 10 preflight evaluations with no runaway.
- **`.github/workflows/gate.yml` has still never executed** — inherited from
  `t_8f6c0a6b`; nothing from this pipeline has reached `main`.
- **The Claude Code `Stop` hook is still not installed** (`npm run gate:install-hooks`
  has not been run; the permission layer blocked writing `.claude/settings.json`), so
  the per-turn stage is the one stage of the four that this validation did not exercise.
- **Partial staging** (`git add -p`) remains the pre-commit hook's documented ceiling:
  it gates the working tree, not the staged snapshot.

## Reproducing

```sh
git worktree add -b soak/<name> ../.worktrees/soak-<name> HEAD
cd ../.worktrees/soak-<name>          # needs its own node_modules
node gates/soak.js --cycles 10 --label <name>   # redirect stdout OUTSIDE the worktree
```

Exit 0 and `soak-report-<name>.json` with `"passed": true` is the whole verdict. The
`soak/*` branches from this run are kept as evidence and are deliberately not merged.
