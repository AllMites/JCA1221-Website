# Alignment plan — JCA1221 gate/review architecture vs foreflux

Card `t_c29826eb`, 2026-08-12. Gap analysis and prioritized task list to bring
this repo's review-loop and lint architecture toward foreflux parity,
including large-scale/long-horizon support.

---

## 1. Purpose & method

Compares two sources, both already committed on this branch:

- `docs/current-architecture.md` (card `t_b7406444`) — this repo, `wt/t_b7406444` @ `972031d`, verified 2026-08-07.
- `docs/foreflux-reference.md` (card `t_98d72342`) — foreflux `master` @ `19db4c5`, evidence collected 2026-08-07.

**foreflux state is a moving target — every gap row below names which state
it's compared against:**

- **"foreflux@19db4c5" (documented reference)** — the full Tier-0 layer:
  `gates/review-lint.js`, `gates/evaluate.js`, `gates/preflight.js`,
  `gates/git-tree-guard.sh`, `docs/preflight.md`, `docs/evaluator.md`,
  `docs/gate-impact.md`, `docs/llm-efficiency-{audit,synthesis}.md`,
  `ff-evaluate-check.js`, `ff-preflight-check.js`, `scripts/claude-runner.py --preflight`.
- **"foreflux@HEAD" (1d40da9, verified live 2026-08-12 by this card)** — commit
  `8eded8f` ("pre-pilot numbers verification", 2026-08-08) deleted the entire
  list above. `gates/` at HEAD is only `run.sh`, `syntax.js`, `invariants.js`,
  `publish.js`. `run.sh` still has `--fast` (syntax+invariants+publish on
  named files) and full tier (`syntax *.html *.js` + invariants + publish +
  `*-check.js` glob, 25 root checks — up from 23 at 19db4c5). `CHECKS.md`
  still exists but documents `gates/review-lint.js`, which is gone — the doc
  is now stale. `scripts/claude-runner.py` retains `CLAUDE_BIN` resolution,
  `complexity: high → opus` routing, and rate-limit backoff; `grep -n
  preflight scripts/claude-runner.py` returns **zero** matches at HEAD — the
  `--preflight` wiring is gone too.

Live verification commands run for this card (from `F:/Documents/Repositories/foreflux`):

```
git log --oneline -5 master        # 1d40da9 at HEAD
git ls-tree --name-only HEAD gates/  # invariants.js publish.js run.sh syntax.js
git show 8eded8f --stat              # confirms the deletions above
ls *-check.js | wc -l                # 25
grep -n preflight scripts/claude-runner.py | wc -l   # 0
```

Implication: **this repo already ported and kept `evaluate.js`/`preflight.js`/
`git-tree-guard.sh` after foreflux itself deleted its own copies.** A "port
what foreflux had" instruction is therefore ambiguous by default; every task
below states explicitly whether it targets foreflux@19db4c5 (documented,
now-deleted-upstream) or foreflux@HEAD (live, smaller). See [§5](#5-risks) for
the why-we-keep-it rationale this implies.

---

## 2. Gap table

| Component | This repo (current-architecture.md) | foreflux | Gap | Priority |
|---|---|---|---|---|
| `gates/run.sh` tiers | one tier only: `tsc -b` (whole project) + diff-scoped eslint + `*-check.js` glob. No `--fast`. Documented reason: cheapest available check is ESLint at ~1.9s/file. | **@HEAD**: `--fast` (syntax+invariants+publish on named files, ~80ms) and full (~8s) tiers | **no per-edit-cheap tier** — `PostToolUse` only marks dirty here vs foreflux running a real fast gate on every edit | P1 |
| `*-check.js` glob | 0 files at repo root (F8) — tier is structural only | **@HEAD**: 25 files at root, `CHECKS.md` cataloguing them | not a code gap (mechanism exists, ported already) but zero content — nothing to discover yet | P2 (grows with app surface, not urgent alone) |
| Lint model | diff-scoped ESLint only; **F1**: `eslint.config.js` `files: ['**/*.{ts,tsx}']` means every `.js/.jsx/.mjs/.cjs` file (including `gates/*.js` itself) gets zero rules and passes unconditionally | **@HEAD**: `invariants.js` (6 rules restated from written product decisions, e.g. `reduced-motion`, `tokens-not-hex`, `no-service-role-key`) + `syntax.js` (parse-only, reaches inline `<script>` in HTML) | **no invariants layer** restating this repo's own written decisions (`DESIGN.md`/`PRODUCT.md`) as machine-checkable rules; **F1 lint escape hatch** unfixed | P0 |
| Tier-0 lint probe | `gates/preflight.js` has 3 probes: `base-ref`, `work-present`, `gates`. **F6**: no lint/review-lint probe — `preflightSpec()`'s own comments describe one that was never built. | **@19db4c5 only**: `review-lint.js` (9 rules: unresolved-import, secret, empty-catch, except-pass, debugger, todo-marker, debug-output, raw-hex, whitespace) + a 4th preflight probe running it via `--diff`/`--root`. **@HEAD**: deleted, not replaced. | this repo's Tier 0 has a documented-but-unbuilt probe; foreflux itself abandoned the mechanism rather than finishing it | P0 (build a JCA-scoped version; don't just port foreflux's deleted file verbatim — see §5) |
| Hook layer (per-turn) | `gates/claude-hook.js` + `gates/claude-settings.json`: `PostToolUse` marks dirty only (~30ms, no checks run); `Stop` runs the full gate. **F4**: not installed here — no `.claude/settings.json` in this worktree. | `.claude/hooks/gate.js`: `PostToolUse` runs the **fast tier** on the edited file (~80ms); `Stop` runs full, gated on the dirty marker | same `Stop` design; **`PostToolUse` here does no checking at all** (no fast tier to run) — parity gap is downstream of the `--fast` gap above; **also F4: never installed** | P1 (design gap depends on P0 fast tier; F4 install is independent and cheap) |
| Git hook | `.githooks/pre-commit`, wired via `npm install` → `prepare` → `core.hooksPath` | none — `core.hooksPath` unset | this repo is **ahead** | — (no action) |
| CI | `.github/workflows/gate.yml` on `pull_request`/`push:main`. **F5**: never executed — `origin/main` 9 commits behind local `main`, zero workflow runs. | none | this repo is ahead in design, **but F5 means it has never been proven to work** | P1 |
| Runner | none in-repo; workers spawn via the `hermes-agent` dispatcher, no supervised child process for `claude -p` | `scripts/claude-runner.py`: direct-child spawn, `CLAUDE_BIN` resolution (`.cmd` vs `.ps1` trap), `complexity: high → opus` routing, rate-limit backoff (30·2^n s, capped retries), `.claude-run.log` + `<git-dir>/claude-runner-last.log` audit trail, `--preflight` wiring with distinct exit 3 for deterministic reject | **the largest single gap** — no supervised execution layer at all; nothing here can do model-by-complexity routing, retry on rate limit, or leave an audit trail per run. This is the main blocker for reliable large-scale/long-horizon task execution. | P0 |
| Long-horizon validation | `gates/soak.js` — seed/fix/route/commit cycles proving the gate layer doesn't drift under repeated real commits (18 cycles × 10 invariants, 0 failures) | none (foreflux has no equivalent soak harness) | this repo is **ahead** | — (no action) |
| Nightly loop | none for this board | cron-registered: `nightly_audit.py` (deterministic collector, always exits 0), `foreflux_nightly_review_claude.py` (collector → fixed prompt → `claude-runner.py --allowed-tools Read` → posts digest as board comment), `mission_control.py` render job | **no equivalent** — no automated overnight health digest for this board | P2 (depends on runner existing first) |
| Check catalogue | none | `CHECKS.md`, 621 lines @ 19db4c5, 14 sections, one section per check ("what it asserts / what regression it catches"); **stale at HEAD** (documents the now-deleted `review-lint.js`) | missing; worth adopting once `*-check.js` files exist to catalogue | P2 |
| Review skill (`sdlc-review`) | same skill deployed; **F2**: version drift across 4 copies (canonical `hermes-ops` working tree 1.3.0, `hermes-ops` HEAD 1.3.1, two deployed copies 1.3.1/1.3.2, only the 1.3.2 profile copy actually dispatched); **F3**: a duplicated nested install path (`profiles/builder/profiles/builder/...`), dead weight not a live hazard | canonical `hermes-ops/skills/sdlc-review/SKILL.md` v1.3.0, gated by `hermes-ops/gates/sdlc-review-check.sh` (greps for `1.3.0` + retention markers) | version-drift bug is **shared infrastructure** (`hermes-ops`), not this repo's code — flagged here because it affects every review this repo's cards go through | P1 (fix lives in `hermes-ops`, out of this repo's file scope — see §6) |
| `publish.js` | absent | present — asserts nothing untracked+servable sits at repo root | not obviously applicable: this repo is a Vite/React app, not a served-flat-HTML site like foreflux; **evaluate before porting**, don't port by default | P2 (evaluate only) |
| `syntax.js` | absent (covered by `tsc -b`) | present — compiles inline `<script>` in HTML via `vm.Script` | not applicable — this repo has no logic embedded in raw HTML files; `tsc -b` already covers all `.ts`/`.tsx` | not a gap — different app shape |

---

## 3. Prioritized task list

Ordered; execute top to bottom. Each task closes one or more gap-table rows.

### P0-1 — Fix F1: close the plain-JS lint escape hatch

**Why:** `gates/*.js` (the gate's own code) currently passes lint unconditionally. This is the single highest-leverage fix — every other lint/invariants improvement below is diluted while this holds.

**File-level changes:**
- Edit `eslint.config.js`: change the block's `files` selector from `files: ['**/*.{ts,tsx}']` to `files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}']`, or add a second config block for the JS extensions with an equivalent (non-typed) rule set — `tseslint.configs.recommended` requires type info some plain `.js` files won't have, so use `js.configs.recommended` + `reactHooks`/`reactRefresh` for the JS block and keep the typed config scoped to `.ts`/`.tsx`.

**New/moved gate commands:** none — `gates/run.sh`'s `lint_diff()` already globs `.ts|.tsx|.js|.jsx|.mjs|.cjs`; the fix is entirely in `eslint.config.js`.

**Acceptance check:**
```sh
npx eslint --no-warn-ignored --max-warnings=0 gates/evaluate.js; echo $?
npx eslint --print-config gates/evaluate.js | node -e "let c='';process.stdin.on('data',d=>c+=d).on('end',()=>console.log(Object.keys(JSON.parse(c).rules).length))"
```
Expect a non-empty rule count (was 0) and — because `main` is currently red on this file (per F1's premise, other `.js` files may now surface real lint errors) — re-run `sh gates/run.sh` afterward and fix or `GATE_BASE`-scope out any newly-surfaced violations before merging this task standalone.

---

### P0-2 — Add an `invariants.js` layer restating JCA1221's own written decisions

**Why:** closes the "no invariants layer" gap. foreflux's rule set (`reduced-motion`, `tokens-not-hex`, `no-service-role-key`, etc.) is literally "decisions already written in `PRODUCT.md`/`PLAN.md` restated as something a machine can fail on" — this repo has `DESIGN.md` and `PRODUCT.md` playing the same role and no equivalent gate.

**Target state:** foreflux@HEAD's `gates/invariants.js` is the pattern to copy (structure, not content — foreflux's 6 rules are foreflux-specific).

**File-level changes:**
- New file `gates/invariants.js`, `node gates/invariants.js [file]...`, following foreflux's two implementation details worth copying verbatim: (1) blank comments (`m.replace(/[^\n]/g, '')`) before content rules run, so a rule's own rationale in prose isn't flagged, and offsets still resolve to the right line; (2) the gate-adoption rule — a new rule must be green against the current tree before it's wired into `run.sh`, and anything two people could disagree about is a review comment, not a gate.
- Candidate first rules, derived from `DESIGN.md`/`PRODUCT.md` (confirm exact wording against those files before writing the rule — do not guess the token names):
  - a token-usage rule analogous to `tokens-not-hex` if `DESIGN.md` specifies token-only color usage outside `:root`.
  - a `prefers-reduced-motion` rule analogous to foreflux's, if `DESIGN.md`'s motion section makes an equivalent guarantee.
  - a secret-pattern rule (`no-service-role-key`-equivalent) scoped to this repo's actual secret shapes (check `netlify/functions/` env var names first).
- Edit `gates/run.sh`: add `run "invariants" node gates/invariants.js` immediately after the `run "lint" lint_diff` line (line 95 in the current file), inside the single existing tier — this repo has no `--fast`/full split yet (see P1-1), so it runs every time.

**New/moved gate commands:**
```sh
node gates/invariants.js [file]...     # new
```
slotted into `gates/run.sh` after `run "lint" lint_diff`.

**Acceptance check:** `sh gates/run.sh` stays green on current `main` with the new step added (gate-adoption rule); a scratch file violating one new rule makes `gates/run.sh` fail with that rule's `file:line` message, mirroring the existing `src/scratch-probe.ts` TS6133 repro in `docs/current-architecture.md` §8.

---

### P0-3 — Build a JCA-scoped `review-lint.js` + wire it into `preflight.js` (closes F6)

**Why:** `preflight.js`'s own comments already describe a lint probe that was never built (F6). Given F1, this was correctly identified as the larger of the two gaps. **Do not port foreflux's file verbatim** — foreflux deleted its own copy at `8eded8f`, and this repo's app shape (Vite/React/TS, not flat HTML) differs; the relevant design to copy is the *approach* (diff-scoped mechanical review rules with severity + `--fail-on`), sourced from foreflux@19db4c5 since that's the last state where the design was complete and documented.

**File-level changes:**
- New file `gates/review-lint.js`:
  - CLI: `node gates/review-lint.js <file>...`, `node gates/review-lint.js --diff [ref]` (default ref: `main`, matching this repo's `resolve_base()` convention, not foreflux's `master`), `--fail-on=high|medium|low|none` (default `medium`), `--root=<dir>`.
  - JSON on stdout always, human summary on stderr, exit 1 when a finding at/above `--fail-on` exists.
  - Rule set, adapted from foreflux's 9 (drop the ones that don't map, e.g. nothing HTML-specific): `unresolved-import` (high), `secret` (high), `empty-catch` (medium), `todo-marker` (low), `debug-output` (low, i.e. `console.log`/`print` — exempt inside `gates/`, `scripts/`, `*-check.js`), `raw-hex` (low), `whitespace` (low). Drop `except-pass` (no Python in this repo) unless a future Python surface appears.
  - **Fix the whole-file-scan bug at port time, not after**: foreflux's own synthesis doc records `review-lint --diff` scanning whole files instead of changed hunks as the cause of 2/4 remaining false-positive rejects in its measured sample. Implement `--diff` to compute the changed-line-range per file (e.g. via `git diff -U0 <ref> -- <file>` and parsing `@@` hunk headers) and only flag findings inside those ranges, not the whole file.
  - `LINTABLE` should match this repo's real extensions: `/\.(m?js|cjs|ts|tsx|jsx|css)$/i` (no `.py`, no bare `.html?` unless this repo ships raw HTML pages).
- Edit `gates/preflight.js`: add a 4th probe to `preflightSpec()` (currently returns an array of 3 objects at lines 63–96), inserted after `work-present` and before `gates`:
  ```js
  {
    id: 'review-lint',
    kind: 'command',
    cmd: 'node',
    args: ['gates/review-lint.js', '--diff', base, `--root=${cwd}`],
    inconclusive_exit: [2],
  },
  ```
  Run review-lint from preflight's own checkout with `--root` pointed at the target (foreflux's stated reason: identical rule set on every card, and a worktree lacking the gate file can't turn a missing tool into a rejection) — confirm this matches how `preflight.js` resolves its own script directory before assuming `cwd`-relative works as written above; adjust the `cmd`/`args` construction to match whatever pattern the existing 3 probes use for cross-directory invocation.
- Edit `gates/evaluate.js`'s `defaultSpec` comment (currently references the not-yet-built lint probe per F6) to point at the new file instead of describing a future one.

**New/moved gate commands:**
```sh
node gates/review-lint.js --diff main --root=.     # standalone
node gates/review-lint.js --diff main --fail-on=high
```
New probe `id: 'review-lint'` added to `preflightSpec()` in `gates/preflight.js`, between `work-present` and `gates`.

**Acceptance check:** `node gates/preflight.js --base main --pretty --no-log` on the current (clean) tree shows 4 probes including `review-lint`, still routes the same as before (currently `escalate` on an empty branch per `docs/current-architecture.md` §4.2's repro); a scratch file with an empty `catch {}` block makes the `review-lint` probe fail and the overall preflight verdict `fail`/`reject`, not silently pass.

---

### P1-1 — Add a `--fast` tier to `gates/run.sh`, gated on `invariants.js` existing (P0-2)

**Why:** foreflux's `PostToolUse` hook runs a real ~80ms fast gate on every edit; this repo's hook only marks the turn dirty because — per this repo's own `run.sh` header — "the only per-edit-cheap check this repo could run today is ESLint at ~1.9s/file, which is not cheap." Once P0-2 lands, `invariants.js` running on named files is cheap enough (foreflux's own analogous rule runs in ~80ms) to justify the tier. Do this after P0-2, not before — there is nothing fast to put in `--fast` until then.

**File-level changes:**
- Edit `gates/run.sh`:
  - Add an early branch mirroring foreflux@HEAD's structure: `if [ "${1:-}" = "--fast" ]; then shift; ...; fi` before the current `sh gates/git-tree-guard.sh || exit 1` line — note foreflux's fast tier does **not** run the tree guard (foreflux's fast tier skips it since the guard's cost is in the same ballpark as the checks it protects at this scale; re-verify this repo's own risk tolerance before copying that omission, since this repo's `git-tree-guard.sh` was explicitly ported and kept as an "ahead" feature).
  - Fast tier body: filter `"$@"` to `.ts/.tsx/.js/.jsx` (excluding `*-check.js`, matching foreflux's filter pattern), then `run "invariants" node gates/invariants.js "$@"`. Do **not** include `tsc -b` or full ESLint in the fast tier — both are the checks this repo already measured as too slow per-edit.
  - Update the file header comment (lines 27–30 currently document "no `--fast` tier... Add a fast tier when there is an invariants layer worth under ~200ms to put in it") to describe the now-added tier instead of the absence.
- Edit `gates/claude-hook.js`: change the `PostToolUse` handler from "write the dirty marker only" to also invoking `sh gates/run.sh --fast <changed-file>`, following foreflux's `.claude/hooks/gate.js` pattern — keep the existing realpath-based repo-containment check (this repo's own doc explains why: NTFS symlinks to `node_modules` break a raw `startsWith`).

**New/moved gate commands:**
```sh
sh gates/run.sh --fast <file>...    # new tier
```

**Acceptance check:** `time sh gates/run.sh --fast gates/preflight.js` completes well under 1s; editing a file through Claude Code now triggers a fast-tier run on `PostToolUse` (verify via `GATE_VERBOSE=1` output or a deliberately-broken invariant in a scratch file caught immediately after the edit, not only at `Stop`).

---

### P1-2 — Install the per-turn hook stage in this worktree (closes F4)

**Why:** F4 — `.claude/settings.json` does not exist here, so `gates/claude-hook.js` has never fired on this repo. This is a one-command fix blocked on nothing else; do it early since it's free and lets P1-1's fast tier actually run once built.

**File-level changes:**
- Run `npm run gate:install-hooks` (copies `gates/claude-settings.json` → `.claude/settings.json`). If `.claude/settings.json` already carries unrelated model/permission settings by the time this task executes, merge the `hooks` block by hand instead of overwriting.

**New/moved gate commands:** none — installs the existing wiring, no new script.

**Acceptance check:** `.claude/settings.json` exists and contains `PostToolUse`/`Stop` hook entries pointing at `gates/claude-hook.js`; make a trivial edit in a Claude Code session and confirm the `Stop` hook fires (gate output appears, or silent pass with `gate-dirty` marker cleared).

---

### P1-3 — Prove CI actually runs (closes F5)

**Why:** F5 — `.github/workflows/gate.yml` has zero executions; `origin/main` is 9 commits behind local `main`. A CI stage that has never fired is not verified infrastructure, it's a file that parses.

**File-level changes:** none in this repo beyond what already exists (`gates/run.sh`, `.github/workflows/gate.yml`) — this is a push/verification task, not a code change. **Requires explicit user authorization to push** (per this session's operating rules — pushing to a shared remote is a visible, side-effecting action).

**New/moved gate commands:** none.

**Acceptance check:** after pushing the 9 pending commits (or opening a PR), the Actions tab shows a completed `gate.yml` run with a pass/fail verdict — not "no runs".

---

### P1-4 — Fix `sdlc-review` version drift (F2) — out-of-repo task, flagged here

**Why:** the review skill that gates every card in this repo (via `claim_review_task`) is running a copy (1.3.2, deployed) ahead of its own canonical source (1.3.0, `hermes-ops` working tree) and ahead of the version its own gate pins (`hermes-ops/gates/sdlc-review-check.sh` asserts `1.3.0`). This repo's cards inherit whatever behavior the drifted 1.3.2 copy has, undocumented anywhere but this audit.

**File-level changes:** **out of scope for this repo** — the fix lives in `hermes-ops` (`skills/sdlc-review/SKILL.md`, `gates/sdlc-review-check.sh`) and the deployed profile path (`AppData\Local\hermes\profiles\builder\skills\...`). Per this card's own constraints (do not touch `hermes-ops` or foreflux), this task is recorded here as a dependency to flag to whoever owns `hermes-ops`, not executed from this repo.

**New/moved gate commands:** none in this repo.

**Acceptance check (external):** all four copies report the same version; `hermes-ops/gates/sdlc-review-check.sh`'s pinned version matches the deployed/dispatched copy.

---

### P0-4 — Build a supervised runner for this board (closes the largest gap: no runner)

**Why:** the biggest gap for large-scale/long-horizon task support. Without a supervised child process wrapping `claude -p`, this repo's dispatcher has no model-by-complexity routing, no rate-limit backoff, and no per-run audit trail — exactly the failure modes foreflux's synthesis doc quantified (39.5% crash rate with zero classification, 24% of blocks caused by a *second* LLM's rate limit, not a defect).

**Target state:** foreflux@HEAD's `scripts/claude-runner.py` still has the execution-engine parts intact (binary resolution, model routing, backoff, audit log) — only its `--preflight` wiring was removed. Port the engine; **do not port `--preflight` wiring verbatim**, since this repo's Tier-0 layer (`preflight.js`) has different probes (see P0-3) and lives in this repo, not a shared `scripts/` dir shape foreflux uses.

**File-level changes:**
- New file `gates/runner.py` (or `scripts/claude-runner.py` if this repo adopts a `scripts/` convention — check for one before creating a new top-level dir):
  - `resolve_claude_bin()`: `CLAUDE_BIN` env override (fail hard if set and missing) → `%APPDATA%\npm\claude.cmd` → `which claude.cmd` → `which claude`. Document why `shutil.which("claude")` alone is insufficient on Windows (finds `claude.ps1`, which `subprocess` cannot execute) — this repo runs on Windows per the environment block, so this trap is directly relevant, not a cross-platform nicety.
  - `resolve_model(prompt, override)`: `complexity: high` (case-insensitive) anywhere in the prompt → `--model opus`, else `--model sonnet`; explicit `--model` flag always wins.
  - Rate-limit detection: `rate_limit_error`, `"type":"rate_limit"`, `429`, `529`, `rate limit`, any 5xx on non-zero exit. Backoff `30 * 2**attempt` (30/60/120s), raised to a `retry_after` value when the payload carries one. Env knobs: `CLAUDE_RUNNER_MAX_RETRIES` (default 3), `CLAUDE_RUNNER_BACKOFF_BASE` (default 30).
  - Audit trail: append to `<git-dir>/claude-runner-last.log` and `<workdir>/.claude-run.log`, each with `pid`, `ppid`, `cmdline`, `cwd`. Add `.claude-run.log` to `$(git rev-parse --git-path info/exclude)` once (never committed, never touches tracked `.gitignore`) — mirrors this repo's existing `.claude-verdict.log` / `.claude-preflight.log` pattern already in use per `docs/current-architecture.md` §5.3/§4.2.
  - Preflight wiring, this-repo-specific (not a foreflux@19db4c5 port): `--preflight` flag calls `node gates/preflight.js --base <ref> --pretty --no-log` from the target workdir before resolving the Claude binary; exit code mapping: `0` → proceed to spawn (or skip spawn on `approve` and report success directly), `1` → exit `3` (distinct "deterministic reject" code, no LLM spawned), `2` → proceed to spawn (escalate). Route on/off should default **off** for builder-profile dispatch and **on** for review-profile dispatch, matching foreflux's stated rationale (a builder produces the diff; there's nothing to pre-judge before it exists).
- New test file `gates/runner-tests/run.sh` (dependency-free `sh` + `python3`, `CLAUDE_BIN` pointed at a `fake_claude.py` fixture), covering at minimum: direct-child spawn + cwd, exit code propagation, rate-limit retry (exact spawn count), backoff cap, timeout kill, missing-binary handling, model routing (both branches), and the 3 preflight routes — mirrors foreflux's T1–T13 pattern in `scripts/claude-runner-tests/run.sh`.

**New/moved gate commands:**
```sh
python3 gates/runner.py --prompt <file> --workdir <worktree>                # base
python3 gates/runner.py --prompt <file> --workdir <worktree> --preflight    # gated
sh gates/runner-tests/run.sh                                                # T1-T13 equivalent
```
This is new infrastructure, not a `run.sh` tier — it wraps the gate, it isn't wrapped by it. No change to `gates/run.sh` itself.

**Acceptance check:** `sh gates/runner-tests/run.sh` passes all cases against `fake_claude.py`; a live smoke test with `CLAUDE_BIN` pointed at the real CLI and a trivial prompt produces a `.claude-run.log` entry with `preflight_route`/`preflight_llm_skipped`/`preflight_summary` lines (once P0-3's preflight exists) and a correctly-routed model flag.

---

### P2-1 — Add `CHECKS.md`

**Why:** worth adopting once `*-check.js` files exist to catalogue — currently 0 at this repo's root (F8), so this is sequenced after any task that adds root checks, not before.

**File-level changes:** new file `CHECKS.md` at repo root, one section per `*-check.js` file, each stating "what it asserts / what regression it catches" (foreflux's format, 14 sections at 621 lines for 23–25 checks — this repo's version starts empty and grows with each new check).

**New/moved gate commands:** none — documentation only, not gated.

**Acceptance check:** every `*-check.js` file at repo root has a corresponding `CHECKS.md` section; consider a lightweight `*-check.js`-count vs `CHECKS.md`-section-count assertion as a future root check once there are ≥2 checks (not required for this task).

---

### P2-2 — Nightly digest loop for this board

**Why:** closes the "no nightly loop" gap. Sequenced last because it depends on P0-4's runner (the collector→prompt→runner→post pattern needs a supervised runner to call) and provides the least immediate value relative to P0/P1 items — it's an observability nicety, not a correctness or throughput fix.

**File-level changes:** outside this repo's own tree — foreflux's nightly scripts live in `C:\Users\USER\AppData\Local\hermes\scripts\` and are cron-registered via `C:\Users\USER\AppData\Local\hermes\cron\jobs.json`, both outside any git repo. This task is: write `jca1221_nightly_review.py` (read-only collector, `kanban.db` `mode=ro`, 24h window, always exits 0) and `jca1221_nightly_review_claude.py` (collector → fixed prompt → `gates/runner.py --allowed-tools Read --output-format text` → post digest as a board comment) in that same external scripts directory, then register two cron jobs analogous to foreflux's `nightly audit` (22:00) and `Nightly Review (claude-code)` (02:30) entries. **Not a file-level change inside this repo's git tree** — flagged here for completeness of the long-horizon-support gap, executed outside this repo's scope boundary.

**New/moved gate commands:** none in this repo.

**Acceptance check (external):** `jobs.json` lists the two new jobs; a manual run of the collector script prints a degraded-but-valid digest even with `CLAUDE_BIN` unset (mirrors foreflux's "a degraded digest beats a dead cron" invariant).

---

## 4. Ordering rationale

1. **P0 before P1 before P2** because P0 items are either (a) currently-active correctness holes (F1's lint escape hatch is silently accepting bad code *right now*), or (b) blocking dependencies for later tasks (P0-2's `invariants.js` must exist before P1-1's `--fast` tier has anything cheap to run; P0-3's `review-lint.js` is the "main missing piece" per the source doc's own ranking).
2. **Within P0**, F1 (P0-1) goes first because it's a one-file edit with no dependencies and the current lint tier is actively wrong today — every hour it's unfixed, plain-JS changes (including to the gate scripts themselves) merge unchecked. P0-2 (invariants) and P0-3 (review-lint) both build new gate programs and can proceed in parallel with each other, but both are sequenced before P0-4 (runner) only because the runner's `--preflight` wiring is more useful once preflight has 4 probes instead of 3 — build order, not a hard blocker.
3. **P1-2 (hook install) is deliberately cheap and could run anytime** — placed after P0 only for narrative grouping; a task-executor could pull it forward since it has zero dependencies.
4. **P1-1 (fast tier) explicitly depends on P0-2** — there is nothing to put in a fast tier until `invariants.js` exists and is proven sub-200ms, per this repo's own `run.sh` header comment stating exactly that condition.
5. **P1-3 (prove CI) and P1-4 (fix version drift)** are verification/flagging tasks with no code dependencies on anything else; sequenced in P1 because they're risk-reduction (an unverified CI stage and a drifted review skill are both "looks done, isn't") rather than new capability.
6. **P2 items are the two lowest-urgency gaps**: `CHECKS.md` has nothing to catalogue yet (depends on root checks accumulating, which depends on app-specific work outside this plan's scope), and the nightly loop depends on P0-4 and duplicates effort if built before the runner exists to call.

---

## 5. Risks

- **foreflux's reference is not a stable target.** The documented state (19db4c5) already diverged from live foreflux (1d40da9) by the time this card started, via a deletion (`8eded8f`) that removed the entire Tier-0 layer this repo's `preflight.js`/`evaluate.js` were ported from. **Any task above labeled "target: foreflux@19db4c5" should be understood as "this repo's own design, informed by a now-abandoned foreflux experiment" — not "match foreflux today."** foreflux judging its own Tier-0 layer not worth keeping is a real data point, not noise: before investing further in P0-3 (review-lint.js) and the preflight probe, revisit whether foreflux's reason for deleting it (not recorded in either source doc — the deletion commit message is only "pre-pilot numbers verification", uninformative) was a judgment on the *design* or an unrelated repo cleanup. This plan proceeds on the latter assumption (this repo already committed to keeping `preflight.js`/`evaluate.js`, per `docs/current-architecture.md` finding F6's framing as a gap to close, not a layer to remove) but that assumption should be stated explicitly to whoever executes P0-3, not inherited silently.
- **F1 (lint escape hatch) fix (P0-1) may surface a wave of new lint failures** in previously-unchecked `.js` files across the repo (`gates/*.js`, `netlify/functions/*.js`, etc.) — because the diff-scoping rule ("touch a file and you own its lint state") means files nobody currently touches stay unlinted regardless, but any card that *does* touch one of those files after this fix lands will hit real violations for the first time. Budget review time for that; don't schedule P0-1 immediately before an unrelated deadline-sensitive card that happens to touch `gates/`.
- **F2 (sdlc-review version drift) is out of this repo's control** — this repo cannot fix it from inside `.worktrees/t_c29826eb`, only flag it (P1-4). Every review this repo's cards go through in the meantime runs against the deployed 1.3.2 copy, whose exact behavioral delta from the canonical 1.3.0 is not fully documented in either source doc beyond "has G5 `origin/HEAD` derivation (4 refs)".
- **F5 (CI never ran) means `.github/workflows/gate.yml` is unverified.** It parses and its logic mirrors `gates/run.sh` faithfully on paper, but "has run zero times" and "works" are different claims. P1-3 requires a push, which requires explicit user authorization per this session's standing rules — do not push as a side effect of executing an earlier task.
- **F4 (hook not installed) is silently the default state for every new worktree.** `npm run gate:install-hooks` overwrites `.claude/settings.json` wholesale (documented in both this repo's `CLAUDE.md` and `current-architecture.md`) — if a future worktree already has unrelated hook/permission config in that file, running the installer without checking first will destroy it. P1-2 already calls this out; repeat the warning to whoever executes it.
- **"No formatter" constraint.** This repo has no Prettier, no `format` script, no `.prettierrc` — style is whatever ESLint enforces. Any new gate program (`invariants.js`, `review-lint.js`, `runner.py`) should not assume a formatter will normalize its own source or its output; keep generated messages and any new source files hand-formatted to match surrounding style, and do not introduce a formatter as a side effect of this plan — that's explicitly out of scope (§6).
- **Windows-specific traps carry real weight here**, not just as foreflux trivia: this repo's environment is Windows (per the session's environment block), so the `CLAUDE_BIN`/`.cmd`-vs-`.ps1` resolution trap in P0-4 and the NTFS-symlink `realpath` trap already documented in this repo's existing `gates/claude-hook.js` are both live risks, not historical footnotes to skip past when porting.
- **`review-lint.js`'s whole-file-scan bug is a known, previously-shipped defect** (foreflux's own synthesis doc: 2/4 remaining false-positive rejects in its sample were this bug). P0-3 calls out fixing it at port time; if that step is skipped under time pressure, this repo would import a bug foreflux's own data already quantified as costly.

---

## 6. Not covered

- Any change to `hermes-ops` (canonical `sdlc-review` skill, `sdlc-review-check.sh`) or the foreflux repo itself — both are explicitly out of scope for this card; F2's fix (P1-4) is recorded as a dependency to hand off, not executed here.
- `hermes-agent`'s dispatcher internals (`kanban_db.py` review-column dispatch, `claim_review_task`, retry/decomposition logic) — read only as far as prior audits needed, not re-examined for this plan.
- A deterministic crash classifier for `hermes-agent` — foreflux's synthesis doc ranks this as its own highest-value remaining item (~35% of LLM spend re-run on cards that didn't need it), but it's dispatcher-side infrastructure outside this repo's boundary, same as F2.
- Demoting the review skill's Step 5 verdict to a constrained `pass|fail|unverifiable` AC adjudicator, extracting the CAS merge into a testable `bin/land-branch.sh`, and the `sdlc-review`-hash-instead-of-grep idea — all three are `hermes-ops`-side per foreflux's own synthesis doc, not this repo's files.
- Adding a formatter (Prettier or otherwise) — explicitly called out as a current-state constraint in this repo's `CLAUDE.md`/`current-architecture.md`, not something this plan proposes changing.
- `publish.js`/`syntax.js` full ports — listed in the gap table as "evaluate, don't port by default" given this repo's different app shape (Vite/React SPA vs. foreflux's served-flat-HTML pattern); no task above builds them.
- Any actual edit to `gates/`, `package.json`, `src/`, or the `foreflux`/`hermes-ops` repos as part of *producing this plan* — per this card's constraints, only `docs/alignment-plan.md` was written.
