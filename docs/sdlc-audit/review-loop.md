# Review Agent Loop

How a card in this board's kanban gets from "worker says done" to merged or
kicked back, as implemented after the G3/G5/G8/G9 fixes (2026-08-07).

## Entry point

A worker calls `kanban_complete(route='review')`. That moves the card to the
review column. The dispatcher's `claim_review_task` spawns a review agent
with the `sdlc-review` skill force-loaded. This is the **only** entry point —
there is no direct-to-merge path and no way to skip the loop.

## Loop stages (sdlc-review SKILL.md)

1. **Orient** — read the card, confirm the workspace.
2. **1.5 cwd guard** — verify the agent's cwd is the card's actual worktree,
   not a stale or wrong-repo checkout; mismatch is `needs_input`, never a
   guess.
3. **2. Read the diff** — base is the derived integration branch (G5): the
   skill reads `origin/HEAD` first, falls back to `main` then `master`, and
   blocks with `needs_input` if that branch doesn't exist locally. No repo
   with a `main` default gets silently diffed against a `master` that was
   never there.
4. **3. Verify acceptance criteria** — against the card body, verbatim.
5. **4. Run gates** — `sh gates/run.sh` in the workspace; falls back to
   `*-check.js` probes; if neither exists, the step records `residual_risk`
   instead of inventing a pass.
6. **4.5 Code-quality greps** (G9-fixed) — deterministic greps for swallowed
   errors, empty catches, `TODO`/`FIXME`, and `console.log`/`print`, now
   using `--include='*.ext' ... -E` instead of a trailing `--` + glob
   filenames (which grep was treating as literal filenames — every card
   silently reported clean). Extended to `.tsx`/`.jsx` alongside `.ts`/`.js`.
7. **5. Verdict** — rendered by `claude -p "<ACs + diff + gates +
   findings>" --model fable`, never a hardcoded accept. The agent performs
   every mechanical act (CAS merge, `kanban_complete`/`kanban_block`) itself,
   but the accept/reject judgment always comes from that call's output.
   - **Merge Path** — CAS `update-ref` on the derived integration branch
     (scratch worktree, `--no-ff` merge, gates re-run inside the scratch,
     then compare-and-swap the ref). A moved ref or a merge conflict is
     `needs_input`, never a forced merge.
   - **Rejection Path** — `kanban_block`, card returns to the worker with
     the verdict's reasons and gate/lint output attached.

## Tier 0 preflight (G8)

Before any model session is spawned, `node gates/preflight.js --base main`
runs in the card's worktree. Three probes: `base-ref` (does the base
resolve), `work-present` (is there a diff or dirty tree at all), `gates`
(`sh gates/run.sh`, exit 127 = no gate layer yet). Exit 0 = approve, 1 =
reject, 2 = escalate. Every way this layer can fail to answer — missing
binary, timeout, absent `gates/run.sh` — routes to `escalate`, never
`reject`: a gate that cannot run must not be able to block green work. This
repo currently has no `gates/run.sh` (it lands with a sibling card), so
`preflight` always escalates on the `gates` probe today — that's the
designed fallback, not a bug.

`gates/evaluate.js` is the underlying deterministic harness `preflight.js`
is built on (`hermes.evaluate.v1` schema): one probe in, one of
pass/fail/inconclusive out, no model involved. `preflight.js` composes it
with the probe list above (`hermes.preflight.v1` schema) and adds the
approve/reject/escalate routing.

## Loop state / stop conditions

- One review pass per card per `route='review'` call.
- A rejection returns the card to the worker via `kanban_block`; the worker
  fixes and re-requests review with another `kanban_complete(route='review')`.
- The dispatcher's `failure_limit` bounds how many times a card can bounce
  before it's escalated to a human.
- Ambiguous acceptance criteria or a missing integration branch both hit
  `needs_input` — the loop stops and asks rather than guessing either
  direction.
- The merge path never retries into a loop: one rejection, full output
  attached, back to the worker.

## Status of the pieces (2026-08-07)

- `sdlc-review` skill: G5 (derived integration branch) + G9 (fixed 4.5
  greps) landed, version 1.3.2, deployed to the builder profile.
- `gates/evaluate.js` + `gates/preflight.js`: ported into this repo, base
  ref `main`.
- `gates/run.sh`: not yet in this repo — arrives with sibling card
  `t_8f6c0a6b`. Until then, Step 4 of the review loop and the preflight
  `gates` probe both resolve to "no gate layer" (127 / inconclusive /
  escalate) rather than a pass or a fail, and the loop's gate step runs
  `tsc` + diff-scoped `eslint` directly instead of through `gates/run.sh`.
  Once that card lands, both the review loop and the preflight probe run
  the full deterministic suite (`tsc` + diff-scoped `eslint` +
  `*-check.js`) with no further changes needed here.
