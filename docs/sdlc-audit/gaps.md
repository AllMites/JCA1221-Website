# SDLC Gap Analysis — JCA1221 vs. the foreflux reference architecture

Snapshot date: **2026-08-07**. Produced for kanban card `t_1e0e2098`
("Produce gap analysis for lint and code-review loops").

**Input:** [`inventory.md`](inventory.md) (card `t_7a6bd06e`, commit `ed42dad` on
branch `wt/t_7a6bd06e`). This document does **not** restate the inventory — it
cites it by section (`INV §n`). Read this one to decide what to build; read the
inventory only when you need the surrounding detail.

Every "Evidence" line below was measured or read on this machine on the snapshot
date, at `main` = `5b0c2ba`. New measurements not present in the inventory are
collected in [Appendix A](#appendix-a--measured-baseline-new-in-this-document).
Where a claim is inferred rather than observed it says **(inferred)**.

---

## 0. Summary

18 gaps. Ordered by the wave that should fix them, not by ID.

| ID | Gap | Severity | Blocks | Wave |
|---|---|---|---|---|
| [G4](#g4--lint-baseline-is-red-82-errors-so-lint-cannot-be-a-blocking-gate-today) | Lint baseline is red (82 errors) — lint cannot block yet | **high** | G1, G7 | 0 |
| [G10](#g10--product-plan-is-a-second-diverged-copy-of-src-linted-but-never-typechecked) | `product-plan/` is a diverged second copy: linted, never typechecked | **high** | G1, G4 | 0 |
| [G6](#g6--claude-is-gitignored-so-the-hook-wiring-cannot-be-committed) | `.claude/` is gitignored — hook wiring cannot be committed | medium | G7 | 0 |
| [G1](#g1--no-gatesrunsh-the-repo-has-no-deterministic-gate-suite) | No `gates/run.sh` — no deterministic gate suite at all | **high** | G7, G8, G2, G3 | 1 |
| [G7](#g7--no-claude-code-hook-wiring-nothing-gates-an-edit-as-it-happens) | No Claude Code `PostToolUse`/`Stop` hook wiring | medium | — | 1 |
| [G2](#g2--completed-work-never-reaches-main-4-done-cards-4-unmerged-branches-0-merges) | Completed work never reaches `main` — 4 done cards, 0 merges | **high** | — | 2 |
| [G5](#g5--the-review-agents-integration-branch-is-the-literal-master) | Review agent's integration branch is the literal `master` | **high** | G2, G3 | 2 |
| [G3](#g3--the-review-column-has-never-been-used-on-this-board) | The review column has never been used on this board | **high** | — | 2 |
| [G8](#g8--no-tier-0-preflight-and-no-supervised-runner) | No Tier 0 preflight, no supervised runner | medium | — | 3 |
| [G14](#g14--no-nightly-review-or-audit-job-covers-the-jca1221-board) | No nightly review/audit job covers the `jca1221` board | medium | — | 3 |
| [G15](#g15--dispatcher-knobs-are-tuned-for-short-cards-40-of-this-boards-cards-have-tripped-the-breaker) | Dispatcher knobs tuned for short cards — 40% breaker trip rate | medium | — | 3 |
| [G12](#g12--all-worktrees-share-one-node_modules-so-they-share-one-incremental-cache) | All worktrees share one `node_modules` → shared incremental caches | medium | — | 3 |
| [G9](#g9--step-45s-deterministic-greps-still-cannot-run-and-there-is-no-ts-review-lint) | Step 4.5's deterministic greps still cannot run; no TS `review-lint` | medium | — | 4 |
| [G11](#g11--eslint-runs-without-type-information-so-the-expensive-half-of-the-rules-is-off) | ESLint runs without type information | medium | — | 4 |
| [G16](#g16--no-test-suite-playwright-is-installed-and-unused) | No test suite; `playwright` installed and unused | medium | — | 4 |
| [G17](#g17--no-invariants-layer-designmd--productmd-decisions-are-unenforced) | No invariants layer — `DESIGN.md`/`PRODUCT.md` decisions unenforced | medium | — | 4 |
| [G13](#g13--no-worktree-gc-8-worktrees-3-empty-4-holding-unmerged-work) | No worktree GC — 8 worktrees: 3 empty, 4 holding unmerged work | low | — | 4 |
| [G18](#g18--adding-caches-will-break-a-tree-guard-unless-gitignore-is-updated-first) | Cache files will break a tree guard unless `.gitignore` is updated | low | G1 | 1 |

### The one-paragraph version

The inventory's conclusion — *"the blocking gap is a gate suite"* (INV §9) — is
correct but not sufficient. Two further gaps are equally blocking and were not
visible from a static read: **the lint baseline is already red** (82 errors on
`main`), so a gate that runs `eslint .` would reject every card on day one; and
**nothing this pipeline produces has ever landed on `main`** (0 `kanban-task:`
trailers, and every one of the 4 `done` cards' branches is `--no-merged`).
Building the gate suite first would produce a pipeline that correctly blocks bad
work while still never shipping good work. Wave 0 makes the gate honest, Wave 1
builds it, Wave 2 makes the output land.

---

## A. The repository gate layer

### G1 — No `gates/run.sh`: the repo has no deterministic gate suite

| | |
|---|---|
| **Severity** | high (blocking — INV §9) |
| **Category** | gate layer |
| **Affected files** | `gates/` (absent), `package.json:6-11`, `netlify.toml` |
| **Blocked by** | G4, G10, G18 |
| **Blocks** | G2 (merge `--check`), G3 (review Step 4), G7 (hooks), G8 (preflight) |

**Evidence.** `gates/run.sh` and root `*-check.js` are absent (INV §2). The only
quality commands are `npm run lint` → `eslint .` and `npm run build` →
`tsc -b && vite build` (`package.json:6-11`), and `lint` has no automatic caller
anywhere in the pipeline (INV §5, rows 1–2). Netlify runs `npm run build` on
deploy, i.e. **after** merge.

**Why it matters.** Every other reference capability is a *caller* of
`gates/run.sh`: the hooks (INV §4.2), the preflight router (INV §6.1), review
Step 4 (INV §6.2), the merge queue's `--check` (INV §7.3). Without it they all
degrade to "no automated gate exists", which the review skill treats as a
`residual_risk` note rather than a rejection (verified in the deployed skill,
`SKILL.md:154-157`). A JCA1221 card can merge today with a type error in it.

**Recommended implementation.** Port the *shape* of foreflux's suite, not its
contents. Two tiers, discovery by shape (`for c in *-check.js`), and — the part
that matters for this repo — **the fast tier must not be ESLint**. ESLint's cold
start on this machine is ~3.1s even for a single file (Appendix A), 40× foreflux's
80ms fast tier. Put the cheap invariants in the fast tier and the linters in the
full tier with caching.

```sh
#!/bin/sh
# gates/run.sh — the only gate command. Nothing here knows what invoked it.
#   sh gates/run.sh --fast <file>...   cheap, per-edit  (target < 500ms)
#   sh gates/run.sh                    full, per-turn   (measured ~8s)
set -e
cd "$(dirname "$0")/.."

if [ "$1" = "--fast" ]; then
  shift
  sh gates/git-tree-guard.sh
  node gates/invariants.js "$@"          # see G17
  exit 0
fi

sh gates/git-tree-guard.sh               # stale-index guard, INV §4.1
npx tsc -b                               # ~4.5s incremental, currently GREEN
npx eslint . --cache                     # ~2.9s cached; see G4 before enabling
for c in *-check.js; do [ -f "$c" ] && node "$c"; done
```

Sequencing note: land `gates/run.sh` with `tsc -b` only (green today), then add
the `eslint` line in the same commit that closes G4. A gate that is red on
arrival trains everyone to ignore it.

**Acceptance test.** From a clean worktree at `main`, `sh gates/run.sh` exits 0
and completes in under 15s; introducing `const x: number = "s"` in any `src/**`
file makes it exit non-zero with the `tsc` message on stderr.

---

### G4 — Lint baseline is red (82 errors), so lint cannot be a blocking gate today

| | |
|---|---|
| **Severity** | high |
| **Category** | lint |
| **Affected files** | 39 files (breakdown below); `eslint.config.js:8-23` |
| **Blocks** | G1 (the `eslint` line), G7, G9 |

**Evidence.** `npx eslint .` at `main` (`5b0c2ba`), clean tree:
**94 problems — 82 errors, 12 warnings, across 39 files**, 7.4s cold.

By rule:

| Count | Rule | Severity |
|---|---|---|
| 25 | `@typescript-eslint/no-unused-vars` | error |
| 12 | `react-hooks/exhaustive-deps` | warn |
| 11 | `react-refresh/only-export-components` | error |
| 10 | `react-hooks/set-state-in-effect` | error |
| 9 | `@typescript-eslint/no-explicit-any` | error |
| 7 | `react-hooks/rules-of-hooks` | error |
| 6 | `no-empty` | error |
| 5 | `react-hooks/refs` | error |
| 4 | `react-hooks/static-components` | error |
| 2 | `react-hooks/purity` | error |
| 2 | `react-hooks/immutability` | error |
| 1 | `no-useless-escape` | error |

Concentration — the top 4 files hold 45 of 94 problems (48%):

| Count | File |
|---|---|
| 13 | `product-plan/shared/ShaderBackground.tsx` |
| 13 | `src/components/ShaderBackground.tsx` |
| 11 | `src/pages/EditorPage.tsx` |
| 8 | `src/components/LiquidGlass.tsx` |

**Why it matters.** This is the gap that determines whether the whole gate layer
is credible. `eslint .` in a blocking gate rejects **every** card immediately,
for pre-existing reasons unrelated to the diff. The two standard escapes are
opposite in cost:

- **Diff-scoped lint** — foreflux's answer (`review-lint.js --diff master`,
  INV §5.2). Cheap, lands today, and permanently tolerates the 82.
- **Baseline cleanup** — expensive, but the only route to a standing invariant.

**Recommended implementation.** Both, in this order.

1. **Now — make the gate diff-scoped so it can land.** `--cache` does not help
   correctness here, only speed; scope is what makes it green:
   ```sh
   # in gates/run.sh, full tier
   base="${GATE_BASE:-main}"
   files=$(git diff --name-only --diff-filter=ACMR "$base"...HEAD -- '*.ts' '*.tsx')
   [ -n "$files" ] && npx eslint --max-warnings=0 $files
   ```
   Same integration contract as `review-lint.js`: non-zero exits, so
   `sh gates/run.sh || reject` is the whole wiring.
2. **Next — clear the baseline in three cards, largest bucket first.** The
   buckets are unequal in risk and must not be one card:
   - *Mechanical, no behaviour change* — 25 `no-unused-vars` + 1
     `no-useless-escape` + 6 `no-empty`. `no-empty` needs a judgement call per
     site: an intentional swallow gets an explicit `// eslint-disable-next-line
     no-empty -- <reason>`, never a blanket rule downgrade. (foreflux hit exactly
     this: ~27 intentional `catch(e){}` guards are why `review-lint` is a diff
     filter and not a standing invariant — INV §4.1.)
   - *Behavioural, needs review* — 30 `react-hooks/*` errors. These are real
     render-correctness findings (`set-state-in-effect`, `rules-of-hooks`,
     `purity`, `immutability`) in shipped components. Do not autofix.
   - *Structural* — 11 `react-refresh/only-export-components` + 9
     `no-explicit-any`. Mostly `product-plan/` and `ui/` primitives; largely
     dissolved by resolving G10 first.
3. **Then flip to whole-repo** by dropping the `--diff` scoping, and only then is
   lint a standing invariant.

**Acceptance test.** Step 1: on a branch whose diff touches one clean file,
`sh gates/run.sh` exits 0; on a branch that adds an unused import, it exits
non-zero naming that file. Step 3: `npx eslint . --max-warnings=0` exits 0 at
`main`.

---

### G10 — `product-plan/` is a second, diverged copy of `src/`: linted but never typechecked

| | |
|---|---|
| **Severity** | high |
| **Category** | lint scope / repo shape |
| **Affected files** | `product-plan/**` (54 tracked `.ts`/`.tsx`), `tsconfig.app.json:33`, `eslint.config.js:9` |
| **Blocks** | G1, G4, G11 |

**Evidence.**

- 228 tracked `.ts`/`.tsx` total: 156 in `src/`, **54 in `product-plan/`**, 10 in
  `netlify/`.
- `tsconfig.app.json:33` is `"include": ["src"]`; `tsconfig.json` references only
  `tsconfig.app.json`, `tsconfig.node.json` (`vite.config.ts`) and
  `netlify/tsconfig.json`. **`product-plan/` is in no `tsconfig`** — `tsc -b`
  never sees it.
- `eslint.config.js:9` ignores only `dist` and `.claude/**`, and matches
  `**/*.{ts,tsx}` — so ESLint **does** see all 54.
- Of the 36 `product-plan/{sections,shared}` `.tsx` files, **33 diverge** from
  their `src/` counterpart and 3 have no counterpart. Divergence is not cosmetic:
  `product-plan/sections/home/components/CsrCarousel.tsx` vs
  `src/sections/home/components/CsrCarousel.tsx` differs by 23 lines — import
  rewrites (`../../shared/…` → `@/lib/…`) *plus* a whole `imgErrors` /
  `handleImgError` image-fallback feature present only in `src/`.
- 22 of the 94 lint problems (23%) are in `product-plan/`, including the joint
  worst file (`product-plan/shared/ShaderBackground.tsx`, 13).

**Why it matters.** Three separate failures compound:

1. The lint gate spends 23% of its findings on a tree the site does not ship, so
   the G4 cleanup cost is inflated by ~23% for zero shipped-quality gain.
2. Type errors in `product-plan/` are structurally undetectable — no gate, no
   `tsc`, no Netlify build.
3. A reviewer running `git diff main...HEAD` (INV §6.2, Step 2) on a card that
   touches both trees cannot tell which is authoritative. That is a false-accept
   *and* a false-reject generator, and it is the exact "copy-paste duplication —
   same logic pasted twice with a subtle divergence" failure mode Step 4.5 is
   supposed to catch (deployed `SKILL.md:194-195`).

**Recommended implementation.** Decide the tree's status, then encode the
decision — do not leave it ambiguous, which is the current state.

- **If `product-plan/` is a generated export artifact** (which is what
  `agents.md` describes it as — the `/export-product` output), it is build output
  in a source tree. Add it to `eslint.config.js` `globalIgnores` alongside
  `dist`, and add a one-line `product-plan/README.md` saying "generated by
  `/export-product`, do not edit, not linted, not typechecked". Cost: one line.
  Removes 22 lint problems and the reviewer ambiguity in one edit.
- **If it is a live second surface**, add it to a tsconfig and keep it linted —
  and then the 33 divergences are a real defect needing its own card.

The evidence favours the first reading: `src/` is strictly ahead (it has the
`imgErrors` feature `product-plan/` lacks), which is the signature of a stale
snapshot, not a mirror.

**Acceptance test.** After the ignore: `npx eslint .` reports 72 problems
(94 − 22) and `git ls-files product-plan | xargs npx tsc --noEmit` is not part of
any gate by design, documented in `product-plan/README.md`.

---

### G6 — `.claude/` is gitignored, so the hook wiring cannot be committed

| | |
|---|---|
| **Severity** | medium |
| **Category** | repo config |
| **Affected files** | `.gitignore:22` |
| **Blocks** | G7 |

**Evidence.** `.gitignore:22` is `.claude/`. Verified:
`git check-ignore -v .claude/settings.json` → `.gitignore:22:.claude/`. Twelve
`.claude/**` files *are* tracked (`.claude/commands/design-os/*.md`,
`.claude/skills/frontend-design/SKILL.md`, `.claude/workflows/vibe-code-cleanup.js`)
only because tracked files ignore `.gitignore`. Any **new** file under `.claude/`
— which is exactly where `settings.json` and `hooks/gate.js` go — is silently
ignored, and `git add` reports nothing.

**Why it matters.** Failure mode is silence: an agent writes
`.claude/settings.json`, runs `git add -A && git commit`, sees a successful
commit, and the hook wiring is not in it. The comment on that line
(`# Claude worktrees`) shows the intent was to ignore `.claude/worktrees/` — the
rule is broader than its purpose.

**Recommended implementation.** Narrow the rule to its intent and un-ignore the
two committed paths.

```gitignore
# Claude worktrees (the original intent of the broad .claude/ rule)
.claude/worktrees/
.claude/settings.local.json
!.claude/settings.json
!.claude/hooks/
```

Replace the bare `.claude/` on line 22. Keep `settings.local.json` ignored — it
is the documented per-developer override and would otherwise carry local paths
into the repo.

**Acceptance test.** `git check-ignore -v .claude/settings.json` exits 1 (not
ignored) and `git check-ignore -v .claude/worktrees/x` exits 0.

---

### G7 — No Claude Code hook wiring: nothing gates an edit as it happens

| | |
|---|---|
| **Severity** | medium |
| **Category** | gate wiring |
| **Affected files** | `.claude/settings.json` (absent), `.claude/hooks/gate.js` (absent) |
| **Blocked by** | G1, G6 |

**Evidence.** `.claude/` holds only `commands/`, `skills/`, `workflows/`,
`worktrees/` — no `settings.json`, no `hooks/` (INV §2). foreflux's wiring is
`PostToolUse` → fast tier, `Stop` → full tier, gated on a
`.git/gate-dirty` marker (INV §4.2).

**Why it matters.** Without it, a gate failure is discovered at review time — one
full agent session later. The exit-2 protocol is the whole point: Claude Code
feeds stderr back to the model on exit 2, so a gate failure becomes work to fix
instead of a message nobody reads (INV §4.2).

**Recommended implementation.** Port `.claude/settings.json` and
`.claude/hooks/gate.js` from foreflux essentially verbatim — the bridge logic is
repo-agnostic and its two hard-won details must survive the copy:

1. `realpath` both the repo root and the edited file before comparing. A plain
   `startsWith` silently passed everything when the project root was a symlink
   (INV §4.2) — and **this repo is symlink-heavy** (G12), so that bug would
   reproduce here immediately.
2. A crashed or hung gate exits **0**. It must not wedge the session.

Two JCA1221-specific changes:

- **Fast-tier timeout ≥ 10s, not 30s → and only if the fast tier stays cheap.**
  If ESLint ever enters the fast tier it will cost ~3.1s per edit (Appendix A);
  at ~40 edits a card that is two minutes of pure latency. Keep ESLint in the
  `Stop` tier.
- **Matcher must include the `product-plan/` skip** if G10 resolves as "generated
  artifact", mirroring foreflux's `*-check.js` skip.

**Acceptance test.** With the hooks installed, editing a `src/**` file writes
`.git/gate-dirty`; ending a turn runs the full suite once and clears the marker;
introducing a type error makes the `Stop` hook exit 2 and the message appears in
the transcript.

---

### G18 — Adding caches will break a tree guard unless `.gitignore` is updated first

| | |
|---|---|
| **Severity** | low |
| **Category** | repo config |
| **Affected files** | `.gitignore` |
| **Blocked by** | — (do it inside the G1 commit) |

**Evidence.** `.gitignore` has no entry for `.eslintcache`. ESLint's `--cache`
default cache location is `.eslintcache` in cwd. `tsc -b` already writes to
`node_modules/.tmp/*.tsbuildinfo` (verified present), which is covered.

**Why it matters.** foreflux's `gates/git-tree-guard.sh` fails if the
index/worktree differ from `HEAD` (INV §4.1) — it is the first gate to run. An
untracked `.eslintcache` created *by the gate itself* would make the guard fail
on the second run of every card. Self-inflicted, trivially avoided, and confusing
to debug.

**Recommended implementation.** In the same commit as G1:

```gitignore
# Gate caches
.eslintcache
```

Keep the cache at the default per-worktree location. **Do not** point it into
`node_modules/.cache/` — that directory is shared across all worktrees (G12).

**Acceptance test.** `sh gates/run.sh; sh gates/run.sh` — the second run exits 0
and `git status --short` is empty.

---

## B. Integration — getting accepted work onto `main`

### G2 — Completed work never reaches `main`: 4 done cards, 4 unmerged branches, 0 merges

| | |
|---|---|
| **Severity** | high |
| **Category** | integration |
| **Affected files** | `F:\Documents\Repositories\hermes-ops\bin\merge_queue.py`; `HERMES_HOME\cron\jobs.json` |
| **Blocked by** | G5 (integration branch name), G1 (`--check` needs a gate) |

**Evidence.**

- `git log main --grep='kanban-task' --oneline` → **empty**. Nothing from this
  pipeline has ever landed on `main`. `main` tip is `5b0c2ba`
  *"wip: auto-commit 2026-08-02"*.
- `git branch --no-merged main` → `wt/t_1b7bbe3f`, `wt/t_646411a3`,
  `wt/t_7a6bd06e`, `wt/t_bd5e5442` — **all four `done` cards**. `wt/t_7a6bd06e`
  is the inventory document itself (`ed42dad`); `wt/t_bd5e5442` is the TrustWall
  removal (`bbdabe5`); the other two are `fd75bae` and `bc170b9`.
- Board DB (`boards/jca1221/kanban.db`), census at 11:35 local: 10 cards — 4
  `done`, 4 `todo`, 1 `ready`, 1 `running` — and **0 `review_requested` events
  ever** (event kinds present: `heartbeat` 38, `claimed` 15, `created` 10,
  `spawned` 6, `promoted` 6, `spawn_failed` 5, `linked` 5, `unblocked` 4,
  `gave_up` 4, `completed` 4, `decomposed` 2, `attached` 2, `crashed` 1).
  The board is live and these counts move; the *ratios* are the durable facts,
  and `review_requested = 0` has held across every reading. Re-run
  [Appendix B](#appendix-b--verification-commands) for current numbers.
- `merge_queue.py` is on no cron job (INV §7.3) and has never been pointed at
  this repo (INV §9).

**Why it matters.** This is the pipeline's most severe failure and it is
invisible from inside a card: a worker calls `kanban_complete`, the board turns
green, the human reads a summary — and the commit sits on an unmerged branch
forever. The gate suite (G1) governs whether *bad* work is blocked; this gap
governs whether *good* work ships. Both `done` branches are one `git branch -D`
away from silent loss, and the only thing currently protecting them is that
nobody has run worktree cleanup (G13).

**Recommended implementation.** `merge_queue.py` already implements exactly this
case — "cards that reached `done` without a review pass" (INV §7.3) — with the
same CAS invariants as the review path, so a card merged either way is
indistinguishable. Do not write a second merge path.

1. **Immediate, manual, to drain the backlog:**
   ```bash
   python3 F:/Documents/Repositories/hermes-ops/bin/merge_queue.py \
     --repo F:/Documents/Repositories/JCA1221-Website \
     --board jca1221 \
     --integration-branch main \
     --check "sh gates/run.sh" \
     --dry-run          # inspect the queue first; drop --dry-run to land it
   ```
   `--integration-branch main` is mandatory here (G5). Omit `--push` until a
   remote-push policy for this repo is decided — `origin/main` exists and is
   shared.
2. **Then put it on cron**, so the failure mode cannot silently recur. It exits
   non-zero if anything failed to land, so cron surfaces it (INV §7.3).
3. **Then note the `done → blocked` constraint** in whatever runbook the human
   reads: Hermes forbids that transition, so a failed merge of a `done` card
   raises a fresh `triage` card instead of reopening the original (INV §7.3).
   Expect triage cards, not reopened ones.

Ordering caveat: with G1 unbuilt, `--check "sh gates/run.sh"` fails on a missing
file. Until G1 lands use `--check "npm run build"` — typecheck is green today
(Appendix A) and is the strongest check currently available.

**Acceptance test.** After the drain, `git log main --grep='kanban-task'
--oneline` lists ≥4 commits, `git branch --no-merged main` no longer lists any
`wt/*` branch belonging to a `done` card, and `docs/sdlc-audit/inventory.md`
exists on `main`.

---

### G5 — The review agent's integration branch is the literal `master`

| | |
|---|---|
| **Severity** | high |
| **Category** | review loop / portability |
| **Affected files** | `F:\Documents\Repositories\hermes-ops\skills\sdlc-review\SKILL.md` (canonical) and the deployed copy at `HERMES_HOME\profiles\builder\skills\software-development\sdlc-review\SKILL.md` |
| **Blocks** | G2, G3 |

**Evidence.** In the deployed skill (v1.3.1), the merge sequence contains the
literal assignment `integration=master` (`SKILL.md:331`), used at
`SKILL.md:335` (`worktree add --detach "$scratch" "$integration"`), `:338`, `:354`
(the CAS `update-ref`) and `:362`. The surrounding prose says *"the integration
branch (default `master`)"* and *"or the configured integration branch"*
(`SKILL.md:107,112,303`) but **there is no configuration mechanism** — no
`symbolic-ref` lookup, no `origin/HEAD` read, no board field. Grepping the skill
for `symbolic-ref`, `origin/HEAD`, `branch --show` returns nothing.
JCA1221's integration branch is **`main`** (`git log --oneline main`; `main` is
the default branch and `origin/HEAD -> origin/main`).

**Why it matters.** The first JCA1221 card ever routed to review will fail at
`git worktree add --detach "$scratch" master` — `master` does not exist in this
repo. The failure lands in a review agent mid-merge, after the gates have run,
which is the most expensive place to discover a one-word configuration problem.
It also silently poisons Step 2: `git diff master...HEAD` fails, so the reviewer
reads no diff.

**Recommended implementation.** Fix it in the skill, in `hermes-ops`, so every
board benefits — not per-repo. Derive the branch instead of hardcoding it:

```sh
integration="${HERMES_INTEGRATION_BRANCH:-$(
  git -C "$repo" symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null \
    | sed 's|^origin/||'
)}"
[ -n "$integration" ] || integration=$(
  git -C "$repo" rev-parse --verify --quiet main >/dev/null && echo main || echo master
)
git -C "$repo" rev-parse --verify --quiet "refs/heads/$integration" >/dev/null || {
  # cannot answer -> do not guess, do not merge
  kanban_block(kind="needs_input", reason="integration branch '$integration' does not exist in $repo")
}
```

This follows the preflight principle already established in the architecture: *a
gate that cannot answer must not block* — but here the safe direction is the
opposite, because a wrong guess **moves a ref**. Escalate to the human rather
than picking a branch.

Two coupled chores in `hermes-ops`, both consequences of INV §10.1/§10.3 (its
primary checkout is stale against `HEAD`, so its on-disk `SKILL.md` is 1.3.0
while `HEAD` and the deployed copy are 1.3.1): `git reset --hard HEAD` **before**
editing, or the edit will revert the merge; and bump the version in
`gates/sdlc-review-check.sh`, which pins it.

**Acceptance test.** A `sdlc-review` dry run (`hermes-ops/bin/verdict-dryrun.sh`,
which exists at `HEAD` — INV §10.1) against a JCA1221 worktree resolves
`integration=main`, and against a foreflux worktree resolves
`integration=master`, with no repo-side configuration.

---

## C. The review loop

### G3 — The review column has never been used on this board

| | |
|---|---|
| **Severity** | high |
| **Category** | review loop |
| **Affected files** | `HERMES_HOME\profiles\builder\config.yaml`; the worker system prompt; card bodies |
| **Blocked by** | G5, G1 |

**Evidence.**

- **0 `review_requested` events** in `boards/jca1221/kanban.db` (full event-kind
  census in G2). The 3 `done` cards went `running → done` directly.
- A card reaches review only via `kanban_complete(route='review')` (INV §7.1).
  Grepping `HERMES_HOME/profiles/builder/*.yaml` and `*.md` for `route='review'`
  / `route="review"` returns **nothing** — the builder profile never instructs a
  worker to route there.
- The worker system prompt for this very card says *"finish by calling
  `kanban_complete` with a summary plus structured metadata"* and does not
  mention `route='review'`. Default behaviour is therefore `done`.
- Even if a card did route there, Step 4 would find no gate and record
  `residual_risk` (INV §9), and Step 5's merge would fail on `master` (G5).

**Why it matters.** The Tier 1 loop is the only stage that verifies acceptance
criteria against the diff and the only stage that merges. Its absence explains
G2 mechanically: nothing routes to review, so nothing merges, so `main` has zero
pipeline commits. Three quality stages are simultaneously inert — AC
verification (Step 3), the gate run (Step 4), and the Fable verdict (Step 5).

**Recommended implementation.** Fix the routing default, not each card. Ordered
by leverage:

1. **Board- or profile-level default.** The right place is one setting that makes
   `route='review'` the default for the `jca1221` board, so a worker cannot
   accidentally self-approve. Note the constraint from INV §1: *there is no
   board-level review configuration — the review flow is triggered by card
   status, not by per-board config.* So this needs either a new board field or a
   line in the builder profile's worker instructions. **The profile line is the
   lazy fix and lands today**; the board field is the correct one.
2. **Interim, per-card:** the auto-decomposer should append *"finish with
   `kanban_complete(route='review')`"* to generated card bodies. Cheap, and it
   makes the routing visible to the human reading the card.
3. **Do not** route to review before G5 and G1 land, or every review will fail
   on a missing `master` and produce `residual_risk` verdicts — worse than no
   review, because it manufactures the appearance of one.

**Acceptance test.** A card completed by a worker lands in `review`, not `done`;
`select count(*) from task_events where kind='review_requested'` is ≥1; the
review agent's run ends in a merge commit on `main` carrying
`kanban-task: <id>`.

---

### G9 — Step 4.5's deterministic greps still cannot run, and there is no TS `review-lint`

| | |
|---|---|
| **Severity** | medium |
| **Category** | review loop / lint |
| **Affected files** | deployed `sdlc-review\SKILL.md:174-187`; `F:\Documents\Repositories\foreflux\gates\review-lint.js` |
| **Blocked by** | — |

**Evidence.** Verified in the deployed v1.3.1 skill, Step 4.5:

```bash
grep -rn 'except:\s*pass\|except Exception:\s*pass' -- '*.py'
grep -rn 'catch\s*([^)]*)\s*{\s*}' -- '*.js' '*.ts'
grep -rn 'TODO\|FIXME' -- '*.py' '*.js' '*.ts'          # SKILL.md:185
grep -rn 'console\.log(\|print(' -- '*.py' '*.js' '*.ts'
```

`--` ends option parsing, so the globs are read as filenames and every one of
these exits *"No such file or directory"* — **indistinguishable from clean**, on
every card (INV §5.2, §10.2). `foreflux/gates/review-lint.js` was written to
replace them but is foreflux-local while the skill is machine-global, so nothing
calls it. Additionally, none of the four patterns match `.tsx` — the extension
that holds 156 of this repo's 228 TypeScript files.

**Why it matters.** Three of four "no judgment required" checks return nothing on
every card *and nothing looks like clean*. This is a false-negative generator
inside the one stage explicitly aimed at Opus-5-generated code. This repo's own
lint run proves the checks would fire if they ran: 6 `no-empty` errors are
exactly the "swallowed errors" pattern, and `src/lib/analytics.ts` has 2
findings.

**Recommended implementation.** Two independent fixes; do the first regardless.

1. **Correct the greps** in `hermes-ops/skills/sdlc-review/SKILL.md` — drop the
   `--`, use `--include`, and add `tsx`/`jsx`:
   ```bash
   grep -rn --include='*.ts' --include='*.tsx' -E 'catch\s*\([^)]*\)\s*\{\s*\}' .
   grep -rn --include='*.ts' --include='*.tsx' -E 'TODO|FIXME' .
   ```
   Then bump the skill version and `gates/sdlc-review-check.sh` (same coupled
   chore as G5 — and mind INV §10.1's stale checkout first).
2. **Replace them with code, per repo.** `review-lint.js`'s own thesis is that a
   check which cannot do its job must fail rather than return empty (INV §5.2).
   For a TypeScript repo, ESLint *is* that tool — the 12 rules already firing
   (G4) subsume every grep above and more. So the JCA1221 equivalent of
   `review-lint --diff` is the diff-scoped ESLint invocation from G4, which means
   **G9 costs nothing extra here once G1+G4 land** — the skill's Step 4
   (`sh gates/run.sh`) will already run it. Do not port `review-lint.js`.

**Acceptance test.** `grep -rn --include='*.tsx' -E 'TODO|FIXME' .` returns a
non-empty result in a repo that has one and exit 1 in a repo that does not — i.e.
the two outcomes become distinguishable.

---

### G8 — No Tier 0 preflight and no supervised runner

| | |
|---|---|
| **Severity** | medium |
| **Category** | review loop / cost |
| **Affected files** | `F:\Documents\Repositories\foreflux\gates\preflight.js`, `gates\evaluate.js`, `scripts\claude-runner.py` (all foreflux-local) |
| **Blocked by** | G1 |

**Evidence.** Neither exists for JCA1221; workers spawn straight from the
dispatcher (INV §9). foreflux's preflight routes on exit code —
`0=approve / 1=reject / 2=escalate` — and only `escalate` spawns a model
(INV §6.1). Its measured justification: a ~2 KB merge decision was costing a
median 804 K tokens board-wide, and on the reject path the entire session was
waste — ~211 s median to rediscover a red exit code `gates/run.sh` reports in
~8 s (INV §6.1).

Two JCA1221 datapoints show the checks would earn their keep immediately:

- **`base-ref` would fire today.** Preflight's base-ref check is precisely the
  G5 class of failure (integration branch `master` does not exist here), caught
  before a session is spawned instead of mid-merge after the gates have run.
- **`work-present` is preventive, not yet triggered.** No `done` card on this
  board currently sits at `main`'s tip with zero commits — checked at 11:35
  local, all 4 have commits. But 3 live worktrees do sit at `5b0c2ba` with no
  commits (G13), and nothing would notice if one of them completed that way.
  This is the cheapest of the four preflight checks; include it.

**Why it matters.** Every reject on this board currently costs a full agent
session. With G3 fixed, every accept costs a second one. The preflight layer is
the only thing in the reference architecture that makes long-horizon boards
affordable, and its escalation discipline is what keeps it safe: *every failure
of this layer routes to `escalate`, never to `reject`* (INV §6.1).

**Recommended implementation.** Port in dependency order, and only after G1 —
`preflight.js` folds `gates/run.sh` in, so it has nothing to run before then.

1. `gates/evaluate.js` — the aggregator. Contract is already specified: exit
   `0=pass / 1=fail / 2=inconclusive`, stdout one JSON object
   `schema: hermes.evaluate.v1` (INV §4.1). Copy it; it is repo-agnostic.
2. `gates/preflight.js` — the router, with JCA1221's checks: base-ref
   (`main`, per G5), work-present (`git rev-list --count main..HEAD > 0`), the
   diff-scoped lint from G4, and `sh gates/run.sh`.
3. `scripts/claude-runner.py` — **defer.** It buys complexity-based model routing
   and 429/5xx backoff (INV §3.1), neither of which is this board's bottleneck.
   The 4 `spawn_failed` events (G15) are workspace-config failures, not rate
   limits. Revisit if rate limiting appears in the logs.

**Acceptance test.** On a branch with zero commits, `node gates/preflight.js`
exits 1 (`reject`) and no model is spawned. With `node` removed from `PATH`, it
exits 2 (`escalate`) — never 1.

---

## D. Long-horizon and large-scale bottlenecks

### G15 — Dispatcher knobs are tuned for short cards: 40% of this board's cards have tripped the breaker

| | |
|---|---|
| **Severity** | medium |
| **Category** | scale |
| **Affected files** | `C:\Users\USER\AppData\Local\hermes\config.yaml` (`kanban:`) |
| **Blocked by** | — |

**Evidence.** Verified in `config.yaml`: `failure_limit: 2`,
`dispatch_stale_timeout_seconds: 14400` (4h), `dispatch_interval_seconds: 60`,
`auto_decompose_per_tick: 3`.

Board DB, `jca1221`, 10 cards total:

- **4 of 10 cards** have both a `spawn_failed` and a `gave_up` event —
  `t_1b7bbe3f`, `t_646411a3`, `t_7a6bd06e`, `t_bd5e5442`. That is a **40%
  breaker-trip rate**. A fifth card (`t_c350ea5f`) has a `spawn_failed` and has
  not yet tripped.
- Run outcomes across the board (11:35 local): `spawn_failed` 5, `gave_up` 4,
  `crashed` 1, `done` 4, `running` 1 — **10 of 15 claimed runs produced no
  work**.
- Root cause of the spawn failures is known and already fixed:
  `default_workdir` was the MSYS-style `/f/Documents/...`, which is not absolute
  (INV §10.4). `board.json` now reads `F:/Documents/Repositories/JCA1221-Website`
  — verified.

**Why it matters.** `failure_limit: 2` cannot distinguish "the workspace config
is wrong" (deterministic, will fail infinitely, should stop immediately) from
"a long card hit a transient error twice over six hours" (should retry). On this
board it consumed 4 cards for a single config typo. For long-horizon work the
asymmetry gets worse: a card that has already invested hours is abandoned by the
same counter that guards a card that has invested seconds. The 4h stale timeout
compounds it — a genuinely long card is declared stale while still working, and
there is no time-based branch policy anywhere to bound the blast radius
(INV §8).

**Recommended implementation.** Do not raise `failure_limit` — that trades one
failure mode for a worse one (infinite retry of a deterministic config error).

1. **Classify before counting.** `spawn_failed` from a workspace-config error is
   not a work failure and should route straight to `triage` without incrementing
   `consecutive_failures`. This is the same distinction `kanban_block(kind=…)`
   already draws for blocks (`capability` vs `transient`) — apply it to runs. One
   change in the kanban engine, benefits every board.
2. **Make the stale timeout proportional, or make heartbeats authoritative.**
   Heartbeats already exist (26 recorded on this board). A card heartbeating
   inside the window is not stale regardless of wall-clock age; that is a
   strictly better signal than a fixed 4h.
3. **Add a `long_horizon: true` card field** (or read `complexity: high` from the
   body, as foreflux's runner already does for model routing — INV §3.1) that
   raises `failure_limit` for that card only.
4. **Measurement first.** All three are engine changes in Layer A, shared by
   every board. Before making them, put the `jca1221` board under the nightly
   collector (G14) so the trip-rate change is observable. Otherwise this is a
   guess with a 40%-rate anecdote behind it.

**Acceptance test.** Reintroduce a bad `default_workdir` on a scratch board: the
card lands in `triage` after one attempt with the workspace error attached, and
`consecutive_failures` is 0.

---

### G12 — All worktrees share one `node_modules`, so they share one incremental cache

| | |
|---|---|
| **Severity** | medium |
| **Category** | scale |
| **Affected files** | `.worktrees/*/node_modules` (symlinks), `tsconfig.app.json:3`, `tsconfig.node.json:3` |
| **Blocked by** | — |

**Evidence.**

- 6 of the 7 `.worktrees/*` directories contain `node_modules` as an NTFS
  `SymbolicLink` → `F:\Documents\Repositories\JCA1221-Website\node_modules`
  (verified via PowerShell `Get-Item -Force`: `LinkType: SymbolicLink`,
  `Target: {F:\Documents\Repositories\JCA1221-Website\node_modules}`).
  **`t_ef2a10f7` has none.**
- The symlink is not created by any committed mechanism, and is not matched by
  `.gitignore`'s `node_modules/` rule (a trailing-slash rule does not match a
  symlink). It is ignored only by `.git/info/exclude:9` — verified:
  `git check-ignore -v node_modules` reports `info/exclude:9`, not
  `.gitignore:6`. `info/exclude` is not committed, so a fresh clone loses it.
- `tsconfig.app.json:3` / `tsconfig.node.json:3` put `tsBuildInfoFile` at
  `./node_modules/.tmp/*.tsbuildinfo`. Running `npx tsc -b` from *this* worktree
  updated `node_modules/.tmp/tsconfig.app.tsbuildinfo` — i.e. **the shared one**.

**Why it matters.** Three distinct problems, all of which only appear at scale:

1. **Gate unavailability.** In `t_ef2a10f7` there is no `node_modules`, so
   `npx eslint` / `npx tsc` cannot run at all. A gate that is silently absent in
   1 of 7 worktrees is worse than no gate — it produces a green run that checked
   nothing. Whatever created the symlinks did so unreliably.
2. **Incremental-cache contention.** Two concurrent workers on different
   branches share one `tsbuildinfo`. Each invalidates the other's state; worst
   case one reads a build info written against a different tree. Non-obvious to
   debug and it only manifests under parallelism — exactly the regime
   long-horizon boards run in. (The board is running 3 cards concurrently right
   now.)
3. **`.gitignore` is load-bearing but not doing the work.** The only thing
   preventing an absolute-machine-path symlink from being committed by a
   `git add -A` is an uncommitted `info/exclude` line.

**Recommended implementation.**

1. **Make provisioning explicit and idempotent** — a `scripts/setup-worktree.sh`
   the gate suite calls (or refuses to run without):
   ```sh
   [ -e node_modules ] || cmd //c mklink //D node_modules \
     "$(git rev-parse --path-format=absolute --git-common-dir)/../node_modules"
   ```
   Better: have `gates/run.sh` **fail loudly** when `node_modules` is missing
   rather than skipping the linters. Silence is the actual defect.
2. **Move the caches out of the shared tree.** In both tsconfigs set
   `"tsBuildInfoFile": "./.tsbuildinfo/<name>.tsbuildinfo"` (per-worktree) and add
   `.tsbuildinfo/` to `.gitignore` alongside `.eslintcache` (G18). This removes
   the contention entirely and costs one cold `tsc` per worktree (~5s, Appendix A).
3. **Fix the `.gitignore` rule** so it does not depend on `info/exclude`: change
   `node_modules/` to `node_modules` (matches both the directory and a symlink).

**Acceptance test.** Two worktrees each run `npx tsc -b` twice; both second runs
are incremental (no full rebuild), and `git status --short` is empty in both.
`sh gates/run.sh` in a worktree with no `node_modules` exits non-zero with a
message naming the missing install.

---

### G14 — No nightly review or audit job covers the `jca1221` board

| | |
|---|---|
| **Severity** | medium |
| **Category** | observability |
| **Affected files** | `HERMES_HOME\cron\jobs.json`; `HERMES_HOME\scripts\nightly_audit.py:26`; `scripts\foreflux_nightly_review.py:20-23`; `scripts\hermes-audit.sh:27-29` |
| **Blocked by** | — |

**Evidence.** `cron/jobs.json` contains 24 jobs. The board-scoped ones are
`nightly audit (foreflux board)` (`c4241470b996`), `Board audit digest`
(`6b106cb30e39`) and the two Foreflux Nightly Review jobs — **none for
`jca1221`** (verified by enumerating every job id/name in the file).

Refining the inventory's "all four cron jobs hardcode `BOARD = "foreflux"`"
(INV §9) — two of three scripts are already parameterised, which makes the fix
much cheaper than the inventory implies:

| Script | Board binding | Parameterised? |
|---|---|---|
| `foreflux_nightly_review.py:20-23` | `os.environ.get("HERMES_KANBAN_DB", ".../foreflux/kanban.db")` | ✅ env |
| `hermes-audit.sh:27-29` | `BOARD="${HERMES_KANBAN_BOARD:-foreflux}"` | ✅ env |
| `nightly_audit.py:26` | `BOARD = "foreflux"` — module constant, no env read | ❌ hardcoded |

**Why it matters.** Nothing watches this board. The 40% breaker-trip rate (G15)
and the 0-merge backlog (G2) both went unreported until a card was explicitly
written to look for them. Every remediation below depends on being able to see
whether it worked — and G15 in particular is an engine change that must not be
made without a before/after measurement.

**Recommended implementation.**

1. **Two jobs today, zero code changes.** Clone the existing cron entries with
   env overrides:
   - review collector: `HERMES_KANBAN_DB=<HERMES_HOME>/kanban/boards/jca1221/kanban.db`
   - audit digest: `HERMES_KANBAN_BOARD=jca1221`

   Stagger the schedules off `30 2 * * *` so the two boards do not contend for the
   single-concurrent-runner limit (INV §3.1).
2. **One small change for the third.** In `nightly_audit.py:26`, make it
   `BOARD = os.environ.get("HERMES_KANBAN_BOARD", "foreflux")` — the module
   already imports `os`. Then clone that job too. Note this file is a *deployed*
   copy under `HERMES_HOME\scripts\`; find and fix its canonical source or the
   next deploy reverts it (the class of problem in INV §10.1/§10.3).
3. **Add two `jca1221`-specific signals** to whatever the digest reports, since
   both current defects are invisible to the existing queries: count of `done`
   cards whose branch is `--no-merged` against the integration branch (G2), and
   count of `review_requested` events in the window (G3). Both are cheap and both
   would have caught this state on night one.

**Acceptance test.** After one night, a digest naming board `jca1221` exists (as
a comment on a `jca1221` card and in `~/Hermes/audit-logs/YYYY-MM-DD.md`), and it
reports the unmerged-`done` count.

---

## E. Coverage and hygiene

### G11 — ESLint runs without type information, so the expensive half of the rules is off

| | |
|---|---|
| **Severity** | medium |
| **Category** | lint |
| **Affected files** | `eslint.config.js:11-17` |
| **Blocked by** | G4, G10 |

**Evidence.** `eslint.config.js:14` extends `tseslint.configs.recommended`, not
`recommendedTypeChecked`, and `languageOptions` (`:18-21`) sets only
`ecmaVersion` and `globals` — no `parserOptions.project`. So no rule that needs
the type checker is active: `no-floating-promises`, `no-misused-promises`,
`await-thenable`, `no-unnecessary-condition`, `restrict-template-expressions`.
`ecmaVersion: 2020` is also below the `target: ES2022` in
`tsconfig.app.json:4`.

**Why it matters.** The un-run rules are precisely the ones that catch the
generated-code failure modes Step 4.5 hunts by eye (deployed `SKILL.md:189-200`).
`no-floating-promises` alone covers a large class of silent async bugs across the
5 `netlify/functions/*.ts` handlers and every Supabase call site. This repo has
9 `no-explicit-any` errors already (G4), each of which is a hole where type-aware
rules would have had nothing to say anyway — the two gaps compound.

**Recommended implementation.** Sequence it after G4, never before: enabling
type-aware rules on a baseline that already has 82 errors makes the cleanup
unmeasurable.

```js
// eslint.config.js
extends: [
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,   // was: tseslint.configs.recommended
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
],
languageOptions: {
  ecmaVersion: 2022,                            // match tsconfig target
  globals: globals.browser,
  parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
},
```

`projectService: true` is the current typescript-eslint mechanism and avoids
listing each tsconfig — relevant here because there are three plus
`netlify/tsconfig.json`. **Measure the cost before committing**: type-aware
linting typically triples ESLint's runtime, which against the ~2.9s cached
baseline (Appendix A) could push the full gate past 15s and make the `Stop` hook
(G7) uncomfortable. If it does, keep type-aware rules in the merge/review gate
only and out of the per-turn hook.

Note the interaction with G10: `product-plan/` is in no tsconfig, so
`projectService` will error on those 54 files unless G10's ignore lands first.
**G10 is a hard prerequisite, not a preference.**

**Acceptance test.** `npx eslint src/lib/analytics.ts` reports at least one
type-aware rule id (e.g. `@typescript-eslint/no-floating-promises`) on a
deliberately un-awaited promise, and the full-run wall time is recorded in
`CHECKS.md`.

---

### G16 — No test suite; `playwright` is installed and unused

| | |
|---|---|
| **Severity** | medium |
| **Category** | coverage |
| **Affected files** | `package.json:6-11` (no `test` script), `package.json:48` (`playwright ^1.60.0`) |
| **Blocked by** | G1 |

**Evidence.** No `test` script; `playwright` is a devDependency with no
`playwright.config.*` and no runner script (INV §2). No `*-check.js`, no unit
tests of any kind.

**Why it matters.** Two consequences. First, the review skill's Step 4 fallback
chain explicitly looks for *"`Makefile test`, `package.json` test script"*
(deployed `SKILL.md:509-512`) and finds neither, so it records `residual_risk`
even after G1 lands unless the gate is the thing it finds. Second, `tsc` and
ESLint together cannot catch a behavioural regression: the recent history is full
of them (`fix: pause hidden videos, reset currentTime on crossfade start`,
`fix: single video layer per word with correct opacity crossfade`,
`fix: slow video playback (0.6x), preload all hero videos`) — three consecutive
commits fixing the same hero-video component, which is exactly the regression
class a behavioural check exists to pin.

**Recommended implementation.** Follow foreflux's model rather than adding a test
framework: behavioural checks as plain `node` scripts at the repo root, picked up
by `gates/run.sh`'s shape discovery (`for c in *-check.js`), each documented in
`CHECKS.md` with the regression it catches (INV §4.1, §3.1). No runner, no
config, no new dependency.

Start with one, for the component that has regressed three times:

- `hero-video-check.js` — assert the invariants those three commits established:
  one video layer per word, hidden videos paused, `currentTime` reset on
  crossfade start, `playbackRate` 0.6.

Defer Playwright. It needs a browser download, a dev server and a config, and
would put minutes into every gate run. If it stays unused after G1 lands, remove
the dependency — an unused devDependency is a standing invitation to add slow
tests to a fast gate.

**Acceptance test.** `node hero-video-check.js` exits 0 at `main`, exits non-zero
when the `playbackRate` assignment is deleted, and appears in `sh gates/run.sh`
output without being named anywhere in `run.sh`.

---

### G17 — No invariants layer: `DESIGN.md` / `PRODUCT.md` decisions are unenforced

| | |
|---|---|
| **Severity** | medium |
| **Category** | coverage |
| **Affected files** | `gates/invariants.js` (absent), `CHECKS.md` (absent), `DESIGN.md`, `PRODUCT.md`, `CLAUDE.md` |
| **Blocked by** | G1 |

**Evidence.** foreflux's `gates/invariants.js` *"restates decisions from
`PRODUCT.md` / `PLAN.md` / `motion-plan.md` / `.hermes.md` as machine-checkable
rules"* and is in **both** tiers (INV §4.1); `CHECKS.md` documents what each
check asserts and which regression class it catches (INV §3.1). JCA1221 has
`DESIGN.md` (tokens, palette, typography, components) and `PRODUCT.md`
(register, audiences, anti-references, design principles) per `CLAUDE.md`, and
**no mechanism that checks a single one of them**.

**Why it matters.** `CLAUDE.md` states the stakes directly: this is a *"brand
register — design IS the product"*. The decisions most likely to be violated by
a generated diff are exactly the ones with no gate: a raw hex outside the token
set, a font that is not in the pairing, a spacing value off the scale. Step 4.5's
one design-oriented grep is
`grep -n '#[0-9a-fA-F]\{3,6\}' --include='*.css' -r . | grep -v ':root'`
(deployed `SKILL.md:177-178`) — which is `--include`-correct, but this project
styles with **Tailwind utility classes in `.tsx`**, not CSS files, so it inspects
almost nothing here.

This is also the highest-leverage fast-tier content for G1: it is cheap enough to
run per-edit, which ESLint is not (Appendix A).

**Recommended implementation.** Port `gates/invariants.js` and write `CHECKS.md`.
Encode only decisions already committed to `DESIGN.md`/`PRODUCT.md` — an
invariant that is not a written decision is a new opinion, and belongs in a
design discussion, not a gate.

Candidate rules, cheap and mechanical, in rough value order:

1. **No raw hex/rgb in `src/**/*.tsx` outside the token definition file.** The
   Tailwind-native analogue of Step 4.5's CSS grep, and the one that actually
   applies here.
2. **No font family outside the `DESIGN.md` pairing** — grep `font-\[`,
   `fontFamily`, and any `@font-face`.
3. **No arbitrary Tailwind values off the spacing scale** — flag `p-[13px]`-style
   escapes, which is where token drift enters a Tailwind codebase.
4. **Anti-reference guards** for whatever `PRODUCT.md` lists as forbidden.

Then `CHECKS.md`, one entry per check: what it asserts, which `DESIGN.md` line it
comes from, which regression it catches. Without it the next agent cannot tell an
invariant from an accident, and deletes it.

**Acceptance test.** `sh gates/run.sh --fast src/sections/home/components/HeroSection.tsx`
completes in under 500ms and exits non-zero when a raw `#2563eb` is added to that
file; every rule it enforces has a `CHECKS.md` entry citing its source line.

---

### G13 — No worktree GC: 8 worktrees, 3 empty, 4 holding unmerged work

| | |
|---|---|
| **Severity** | low |
| **Category** | hygiene |
| **Affected files** | `.worktrees/*`, local `wt/*` branches |
| **Blocked by** | G2 (drain before deleting anything) |

**Evidence.** `git worktree list` — 8 entries besides the primary checkout:

| Worktree | Commit | State |
|---|---|---|
| `.worktrees/t_7a6bd06e` | `ed42dad` | **has work, `--no-merged main`** — do not delete (G2) |
| `.worktrees/t_bd5e5442` | `bbdabe5` | **has work, `--no-merged main`** — do not delete (G2) |
| `.worktrees/t_1e0e2098` | `5b0c2ba` | this card, in progress |
| `.worktrees/t_1b7bbe3f` | `fd75bae` | **has work, `--no-merged main`** — do not delete (G2) |
| `.worktrees/t_646411a3` | `bc170b9` | **has work, `--no-merged main`** — do not delete (G2) |
| `.worktrees/t_da4b0d01` | `5b0c2ba` | no commits |
| `.worktrees/t_ef2a10f7` | `5b0c2ba` | no commits, **no `node_modules`** (G12) |
| `.claude/worktrees/wf_b446c7c4-0ee-1` | `382e07d` | workflow worktree, merged |

So 3 of 8 sit at `main`'s tip with no commits, and **4 hold the only copy of
unmerged work** (G2). Nothing garbage-collects them, and
the reference repos are further along the same curve — foreflux >10 live
worktrees plus a prunable orphan, hermes-ops 5 plus an empty unregistered
`_review_55586` scratch dir (INV §8, §10.5).

**Why it matters.** Mostly cost, not correctness: each worktree is a full
checkout plus a `node_modules` symlink, and the noise makes it hard to see that
two of the eight hold the only copy of unmerged work (G2). The sharp edge is
ordering — a naive "delete worktrees at `main`'s tip" script is safe today, but a
naive "delete all `wt/*`" would destroy four commits — and the set of
at-risk branches grew from 2 to 4 during the two hours this analysis took.

**Recommended implementation.** A GC that is safe by construction: delete a
worktree only when its branch is **both** absent from `git branch --no-merged
<integration>` **and** its card is not `running`. Two `git` commands, no state
of its own.

```sh
integration=main
git worktree list --porcelain | awk '/^worktree /{print $2}' | while read -r wt; do
  br=$(git -C "$wt" symbolic-ref --quiet --short HEAD) || continue
  case "$br" in wt/*) ;; *) continue ;; esac
  git merge-base --is-ancestor "$br" "$integration" || { echo "SKIP unmerged $br"; continue; }
  echo "would remove $wt ($br)"        # add --force / branch -D once verified
done
```

Run it **after** G2's drain, so "merged" is true for the cards that deserve it.
Then put it on the same cron as the merge queue (G2 step 2) — GC and merge belong
together, since merging is what makes a worktree collectable. Prune the
`prunable` orphan under
`HERMES_HOME\kanban\boards\<slug>\workspaces\` with `git worktree prune` in the
same pass, and delete `_review_*` scratch dirs left behind by review runs
(INV §10.5) — the review skill's `worktree remove` runs but the directory is not
always unlinked.

**Acceptance test.** Dry run at the current state prints `SKIP unmerged` for all
four `done` cards' branches and proposes removing only the no-commit worktrees.
After G2's drain, the skipped entries become removable.

---

## 3. Sequenced plan

Each wave is safe to stop at. Nothing in a later wave is required to make an
earlier one useful.

| Wave | Gaps | Goal | Why this order |
|---|---|---|---|
| **0** | G4 (step 1), G10, G6 | Make a gate *possible* | A gate over a red baseline (G4) or an ambiguous tree (G10) is either ignored or wrong; G6 means the wiring cannot even be committed |
| **1** | G1, G7, G18 | The gate exists and runs per-edit | G1 is the caller-of-record for everything downstream; G18 is one `.gitignore` line inside the same commit |
| **2** | G5, G2, G3 | Accepted work lands on `main` | G5 first — it is one line, and both G2 and G3 fail on it. Then drain the backlog (G2), then turn on routing (G3) |
| **3** | G8, G14, G15, G12 | Affordable at scale | G14 before G15: do not change engine knobs without a before/after measurement |
| **4** | G9, G11, G16, G17, G13, G4 (steps 2–3) | Deepen coverage, clean up | All optional; each is independently valuable |

**Critical path to "a bad card cannot merge and a good card does":**
G10 → G4(1) → G1 → G5 → G2 → G3. Six gaps; four of them are configuration edits
of a handful of lines.

**Cheapest high-value items**, if only a day is available: G6 (one `.gitignore`
line), G5 (one line in `hermes-ops`, unblocks two high-severity gaps), G10 (one
line, removes 23% of the lint backlog), G2 step 1 (one command, recovers the
already-lost work). All four are single-line or single-command changes, and
together they clear the two most severe gaps.

---

## 4. Deliberately not recommended

Recorded so the next agent does not relitigate these, and so a "why is this
missing?" review does not read as an oversight.

| Not doing | Why |
|---|---|
| Port `scripts/claude-runner.py` now (part of G8) | Buys complexity routing + 429/5xx backoff. This board's failures are workspace-config, not rate limits. Revisit when rate limiting shows in logs |
| Port `gates/review-lint.js` (G9) | For a TypeScript repo, ESLint already subsumes every check it performs. The diff-scoped invocation in G4 *is* the JCA1221 `review-lint` |
| Add Playwright E2E (G16) | Browser download + dev server + config; minutes per gate run. Root `*-check.js` scripts cover the actual regression history at a fraction of the cost |
| Raise `failure_limit` (G15) | Trades premature abandonment for infinite retry of deterministic config errors. Classify the failure instead of counting it differently |
| Build a second merge path (G2) | `merge_queue.py` already implements this exact case with the same CAS invariants. Point it at this repo; do not reimplement |
| Real build CI (`.github/workflows`) | Neither reference repo has build CI (INV §9), and the gate suite is the same code CI would call. Worth doing eventually — but it is a *parallel* caller of `gates/run.sh`, so it strictly follows G1 |
| Fix the reference repos' stale checkouts (INV §10.1) | Real, high severity, and a prerequisite for editing `hermes-ops` (G5, G9) — but it is work in `foreflux`/`hermes-ops`, outside this repo. Called out inline in G5 rather than given a JCA1221 gap ID |

---

## Appendix A — Measured baseline (new in this document)

Measured in `.worktrees/t_1e0e2098` at `main` = `5b0c2ba`, clean tree, warm
filesystem, Windows 11, shared `node_modules`. Not in the inventory.

| Command | Wall time | Exit | Note |
|---|---|---|---|
| `npx eslint .` (cold) | **7.4s** | 1 | 82 errors, 12 warnings, 39 files |
| `npx eslint . --cache` (first) | 8.3s | 1 | cache write |
| `npx eslint . --cache` (second) | **2.9s** | 1 | the number a gate would see |
| `npx eslint <one .tsx>` | **3.1s** | 1 | ESLint's floor — a per-edit fast tier cannot use it |
| `npx tsc -b` (cold) | 5.2s | **0** | **typecheck is green today** |
| `npx tsc -b` (no change) | 4.5s | 0 | incremental |
| `npx tsc -b` (1 file touched) | 4.5s | 0 | incremental |

Derived: a full tier of `tsc -b` + cached `eslint .` costs **~7.5s**, comparable
to foreflux's ~8s full tier (INV §4). A fast tier is only viable with a
node-startup-only check (G17's `invariants.js`), never with ESLint — 3.1s × ~40
edits per card is ~2 minutes of pure latency.

## Appendix B — Verification commands

Every claim above, reproducible. Run from the repo root.

```sh
# G2  nothing from the pipeline has landed
git log main --grep='kanban-task' --oneline        # expect: empty
git branch --no-merged main                        # expect: every done card's branch

# G3/G15  board state
python -c "import sqlite3;c=sqlite3.connect('file:C:/Users/USER/AppData/Local/hermes/kanban/boards/jca1221/kanban.db?mode=ro',uri=True);print(c.execute('select kind,count(*) from task_events group by 1 order by 2 desc').fetchall())"

# G4  lint baseline
npx eslint . -f json > "$TEMP/lint.json"                   # not the repo root: keeps the tree clean
node -e "const r=require(process.env.TEMP+'/lint.json');let e=0,w=0;for(const f of r)for(const m of f.messages)m.severity===2?e++:w++;console.log(e,'errors',w,'warnings')"
# expect: 82 errors 12 warnings

# G5  integration branch is hardcoded
grep -n 'integration=master' "$LOCALAPPDATA/hermes/profiles/builder/skills/software-development/sdlc-review/SKILL.md"

# G6  .claude is ignored
git check-ignore -v .claude/settings.json          # expect: .gitignore:22:.claude/

# G9  the broken greps are still deployed
grep -n "grep -rn 'TODO" "$LOCALAPPDATA/hermes/profiles/builder/skills/software-development/sdlc-review/SKILL.md"

# G10  product-plan is linted but not typechecked, and diverged
git ls-files 'product-plan/*.ts' 'product-plan/*.tsx' | wc -l   # expect: 54
grep -n '"include"' tsconfig.app.json                            # expect: ["src"]

# G12  shared node_modules, one worktree unprovisioned
for d in ../*/; do printf '%s ' "$d"; [ -e "$d/node_modules" ] && echo linked || echo MISSING; done

# G13/G14
git worktree list
grep -c '"id"' "$LOCALAPPDATA/hermes/cron/jobs.json"             # 24 jobs, none for jca1221
```
