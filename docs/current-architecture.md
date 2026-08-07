# Current kanban SDLC engineering architecture

Card `t_b7406444`, 2026-08-07. An as-built map of the machinery that takes a
kanban card from "a worker was spawned" to "merged or kicked back", and of the
lint/typecheck pipeline that machinery leans on.

**This is a read of the system, not a change to it.** Everything below was
verified by running or reading it on `wt/t_b7406444` at `972031d` (identical to
`main`). Where a claim could not be verified from this workspace, it says so.

Two earlier documents cover slices of the same ground and are still worth
reading, but both predate the gate layer landing on `main` and are stale in the
way noted in [§9](#9-drift-and-gaps-found-verified-nothing-changed):
`docs/sdlc-audit/review-loop.md`, `docs/sdlc-audit/long-horizon-validation.md`.

---

## 1. The map

Two verdict tiers, five callers, one script.

```
                      ┌──────────────────────────────────────────┐
  Tier 0  (no model)  │ gates/preflight.js  → approve/reject/    │
                      │   └ gates/evaluate.js    escalate        │
                      └───────────────┬──────────────────────────┘
                                      │ probe: sh gates/run.sh
                      ┌───────────────▼──────────────────────────┐
  Tier 1  (the gate)  │ gates/run.sh                             │
                      │   ├ gates/git-tree-guard.sh              │
                      │   ├ npx tsc -b            (whole project)│
                      │   ├ npx eslint …          (diff-scoped)  │
                      │   └ node <name>-check.js  (glob, root)   │
                      └───────────────▲──────────────────────────┘
                                      │ same script, five callers
  per turn    Claude Code Stop hook  ─┤  gates/claude-hook.js
  per commit  .githooks/pre-commit   ─┤
  per push/PR .github/workflows/gate.yml ┤
  review      sdlc-review skill step 4 ─┤  (+ again inside the CAS scratch)
  merge queue hermes-ops/bin/merge_queue.py --check ─┘
```

| Component | Path | Tier | Runs when |
|---|---|---|---|
| Gate suite | `gates/run.sh` | 1 | every caller below |
| Stale-tree guard | `gates/git-tree-guard.sh` | 1 | first thing inside `run.sh` |
| Claude Code hook bridge | `gates/claude-hook.js` | 1 | `PostToolUse`, `Stop` |
| Hook wiring template | `gates/claude-settings.json` | — | copied by `npm run gate:install-hooks` |
| Commit hook | `.githooks/pre-commit` | 1 | `git commit` |
| CI | `.github/workflows/gate.yml` | 1 | `pull_request`, `push` to `main` |
| Probe harness | `gates/evaluate.js` | 0 | called by `preflight.js` or directly |
| Router | `gates/preflight.js` | 0 | before any review model session |
| Soak driver | `gates/soak.js` | — | manual long-horizon validation |
| Review agent logic | `hermes-ops/skills/sdlc-review/SKILL.md` | — | force-loaded by dispatcher |
| Dispatcher | `hermes-agent/hermes_cli/kanban_db.py` | — | gateway loop |
| Batch merge fallback | `hermes-ops/bin/merge_queue.py` | — | cron / manual |

Paths outside this repo, resolved on this machine:

- `hermes-ops` → `F:\Documents\Repositories\hermes-ops`
- `hermes-agent` → `C:\Users\USER\AppData\Local\hermes\hermes-agent`
- deployed skills → `C:\Users\USER\AppData\Local\hermes\profiles\builder\skills\`

---

## 2. Tier 1 — `gates/run.sh`, the one gate

```sh
sh gates/run.sh                    # the verdict
GATE_VERBOSE=1 sh gates/run.sh     # also print what passed
GATE_BASE=origin/main sh gates/run.sh   # lint against a different integration branch
npm run gate                       # package.json alias for `sh gates/run.sh`
```

Verified on this workspace at `972031d`:

```
$ GATE_VERBOSE=1 sh gates/run.sh
ok   typecheck
ok   lint
real  0m5.578s     exit 0
```

### What it does, in order

1. **`sh gates/git-tree-guard.sh`** — runs before anything measures the tree.
   Fails the whole gate (exit 1) if the index differs from `HEAD`, because a
   plumbing merge (`update-ref` / `commit-tree`, no checkout) leaves the working
   tree describing a different commit than `HEAD` and every check below would
   then be a confident verdict about the wrong code. Two distinct messages:
   - index and worktree agree but both differ from `HEAD` → "HEAD was just moved
     by a merge, run `git reset --hard HEAD`";
   - staged changes *and* unstaged work → "commit or stash before trusting this
     gate".

   Bypassed by `GATE_ALLOW_STAGED=1` (set only by `.githooks/pre-commit`, where
   a staged-differs-from-HEAD index is the normal state). Degrades silently to
   exit 0 outside a git repo or on an unborn `HEAD`.

2. **`npx tsc -b`** — the whole project, via `tsconfig.json` project
   references (`tsconfig.app.json`, `tsconfig.node.json`). Not diff-scoped.

3. **lint, diff-scoped** — `lint_diff()`:

   ```sh
   base=$(resolve_base)                    # $GATE_BASE, else main, else origin/main, else HEAD
   mb=$(git merge-base "$base" HEAD)
   files=$( { git diff --name-only --diff-filter=ACMR "$mb"
              git ls-files --others --exclude-standard
            } | grep -E '\.(ts|tsx|js|jsx|mjs|cjs)$' | sort -u )
   npx eslint --no-warn-ignored --max-warnings=0 --cache $files
   ```

   Three deliberate choices, each with a stated reason in the script header:
   - **merge-base, not the base tip** — a branch forked a week ago is not blamed
     for files that changed on `main` since.
   - **no second rev in the diff** — committed *and* uncommitted work in one
     pass, which is what a pre-commit or mid-turn caller needs.
   - **`--max-warnings=0`** — warnings are failures *inside that scope*. The
     scoping is what makes the strictness affordable: `npx eslint .` reports 94
     problems (82 errors, 12 warnings, 39 files) at `main`, so a whole-repo gate
     would be red on arrival for every card and would be learned around.

   Empty file list → the tier passes and says nothing.

4. **`node <name>-check.js` for every `*-check.js` at the repo root** — a glob,
   not a list, so adding a check is writing a file. **There are currently zero
   `*-check.js` files at this repo's root**, so this tier is a no-op today.

### Failure behavior

`run()` captures both streams per step and prints them only on failure, so a
green run is silent and a red one is exactly the failing tool's own message.
A failure does **not** short-circuit: `fail=1` is recorded and the remaining
steps still run, so one invocation reports everything that is wrong.
Exit `0` = green, `1` = anything failed. The stale-tree guard is the exception
— it `exit 1`s immediately, before any tool runs.

There is deliberately **no `--fast` tier**: the cheapest check available today
is ESLint at ~1.9 s/file, which is not cheap enough to run per edit.

---

## 3. The five callers

### 3.1 Per turn — Claude Code `Stop` hook

Bridge: `gates/claude-hook.js`. Wiring template: `gates/claude-settings.json`.

```sh
npm run gate:install-hooks   # copies gates/claude-settings.json → .claude/settings.json
```

The template registers the same script on two events:

| Event | Matcher | Timeout | Behavior |
|---|---|---|---|
| `PostToolUse` | `Edit\|Write\|MultiEdit\|NotebookEdit` | 15 s | marks the turn dirty (~30 ms), runs no checks |
| `Stop` | — | 180 s | runs the whole of `gates/run.sh`, once |

`PostToolUse` writes an empty marker file at `$(git rev-parse
--absolute-git-dir)/gate-dirty` — inside the git dir so it is never committed
and is naturally per-worktree. It exits 0 early if: no `file_path` in the
payload; the realpath'd file is outside this repo; or the extension is not
`.js/.jsx/.ts/.tsx/.mjs/.cjs`. Both sides of the repo-containment comparison are
`realpath`'d, because every worktree here reaches `node_modules` through an NTFS
symlink and a raw `startsWith` would say "not my repo" for a real edit — and
then the gate would silently pass on everything.

`Stop` exits 0 without running if `stop_hook_active` (already blocked once — no
loop) or if the marker is absent (nothing was edited this turn). Otherwise it
spawns `sh gates/run.sh` with a 150 s timeout and:

- **gate green** → delete the marker, exit 0;
- **gate red** → stdout `{"decision":"block","reason":<gate output>}`, stderr a
  message telling the model this is work to finish, **exit 2**. Exit 2 is the
  whole design: Claude Code reads stderr on 2 and hands it back to the model.
- **gate crashed / hung** (`status === null`) → exit 0. A hung gate must not
  wedge the session. Fail open on liveness, closed on verdict.

**Current status in this checkout: not installed.** `.claude/settings.json` does
not exist (`.claude/` holds only `commands/`, `skills/`, `workflows/`), so the
per-turn stage does not fire here. `gate:install-hooks` overwrites that file
wholesale, which is why the repo does not ship it — merge the `hooks` block by
hand if you already keep model/permission settings there.

### 3.2 Per commit — `.githooks/pre-commit`

Installed repo-wide by `npm install` → `prepare` → `git config core.hooksPath
.githooks`. Verified: `git config core.hooksPath` → `.githooks`.

```sh
root=$(git rev-parse --show-toplevel)
[ -f "$root/gates/run.sh" ] || exit 0          # branches predating gates/ are not a failure
exec env GATE_ALLOW_STAGED=1 sh "$root/gates/run.sh"
```

Failure = non-zero exit = the commit is refused, with the gate's own output.
Bypass is `git commit --no-verify`. Known ceiling, stated in the hook: it gates
the **working tree**, not the staged snapshot, so `git add -p` can commit a
subset the gate never saw — CI catches that difference.

### 3.3 Per push / PR — `.github/workflows/gate.yml`

Triggers: `pull_request`, and `push` to `main`. Steps:
`actions/checkout@v4` with `fetch-depth: 0` (the lint tier needs history for
`merge-base`), `actions/setup-node@v4` node 22 + npm cache, `npm ci`, then:

```yaml
env:
  GATE_BASE: ${{ github.event.pull_request.base.sha || 'HEAD^' }}
  GATE_VERBOSE: '1'
run: sh gates/run.sh
```

On a PR the base is the SHA GitHub already resolved; on a push to `main` there
is no PR base, so it scopes to the pushed commit's own parent. Failure = failed
check = a red PR.

**Current status: this workflow has never executed.** `origin/main` is `5b0c2ba`
("wip: auto-commit 2026-08-02"), local `main` is `972031d`, and
`git rev-list --count origin/main..main` = **9**. Nothing from this pipeline has
been pushed.

### 3.4 Review — the `sdlc-review` agent

See [§5](#5-the-review-loop). Step 4 runs `sh gates/run.sh` in the worktree; the
merge path runs it a *second* time inside the detached scratch worktree, on the
merge result, before the ref moves.

### 3.5 Batch fallback — `hermes-ops/bin/merge_queue.py`

For cards that reached `done` without a review pass.

```bash
python3 bin/merge_queue.py \
  --repo <repo> --board <board> --integration-branch main \
  --check "gates/run.sh" --push
```

Same invariants as the review merge path: detached scratch worktree at
`.worktrees/_merge`, gate there, CAS `update-ref`, never touch the primary
working copy, never run against a dirty checkout, never retry into a loop.
Non-zero exit if anything failed to land, so cron surfaces it. Failures reach
the board as a **triage card** (Hermes forbids `done → blocked`).

---

## 4. Tier 0 — the deterministic router

The ordering is the design: deterministic first, model last, and only for the
residue. `docs/llm-efficiency-audit.md` §R1 is cited in `preflight.js` as the
measurement that motivated it — a card whose gates were already red still cost a
full review session (10⁶–10⁷ tokens, ~211 s median) to discover an exit code a
script reads in ~8 s.

### 4.1 `gates/evaluate.js` — the probe harness

```sh
node gates/evaluate.js                     # the default probe set
node gates/evaluate.js --spec probes.json  # a caller-supplied set
node gates/evaluate.js --pretty            # same verdict, for a human
```

Stdout is one JSON object, `schema: hermes.evaluate.v1`. Exit **0 = pass,
1 = fail, 2 = inconclusive**. Node stdlib only, no model, no network.

A probe is `{id, kind, cmd, args, cwd, timeout_ms, expect_exit,
inconclusive_exit, expect_file}`. Two kinds: `command` (compare exit code) and
`snapshot` (compare stdout against `expect_file`, CRLF- and trailing-whitespace-
normalized, reporting the first differing line). Default timeout 120 s; evidence
is the **tail** of combined stdout+stderr, capped at 2000 chars with
`evidence_truncated` declared in the payload.

**`inconclusive` is the load-bearing outcome.** Could-not-run is not
did-not-pass, so all of these resolve to inconclusive, never fail: `ENOENT`
(missing binary), `ETIMEDOUT`, killed by signal, a snapshot with no baseline
recorded yet, an unreadable spec, and an empty probe list. The rationale in the
file: collapsing those into `fail` is how green work gets blocked — 8 of 33
blocks on this board were a *second* LLM being rate-limited, not a defect.

Aggregation: `fail` beats `inconclusive` beats `pass`.

### 4.2 `gates/preflight.js` — the router

```sh
node gates/preflight.js                    # this worktree against main
node gates/preflight.js --base <ref>
node gates/preflight.js --cwd <dir>
node gates/preflight.js --pretty
node gates/preflight.js --no-log
```

Stdout is one JSON object, `schema: hermes.preflight.v1`. Three probes:

| Probe | Command | Inconclusive on |
|---|---|---|
| `base-ref` | `git rev-parse --verify --quiet <base>^{commit}` | exit 1, 128 |
| `work-present` | `test -n "$(git status --porcelain -uall)$(git diff --name-only <base>...HEAD)"` | exit 1, 127 |
| `gates` | `sh gates/run.sh` (300 s) | exit 127 |

`base-ref` is asked first and separately because every other probe silently
degrades when the base is wrong — a typo'd ref would read as approval.

Routing is a mapping, not a judgment:

| evaluate verdict | route | exit | what the caller does |
|---|---|---|---|
| pass | `approve` | 0 | merge; no LLM session |
| fail | `reject` | 1 | hand `probes[]` back to the worker; no LLM session |
| inconclusive | `escalate` | 2 | spawn the model, on this evidence only |

**Every way this layer can fail to answer routes to `escalate`, never
`reject`.** A gate that cannot run must not be able to block green work.

`reconcileGatesAgainstBase()` handles the inherited-red-base case: if and only
if the `gates` probe **fails**, the base tree is extracted with `git archive` +
`tar` into a temp dir (no checkout, nothing in any worktree touched) and gated
there. If the base is red too, the branch's `gates` probe is softened `fail →
inconclusive` with the reason appended. It only ever *softens*, runs at most
once, and costs nothing when the base is healthy.

Every run appends one line to `.claude-preflight.log` in the target cwd
(suppress with `--no-log`). The append is wrapped and never fatal — a preflight
that refused to route because its own audit log was read-only would be the gate
blocking work again, one level down.

Verified on this workspace (`--no-log`, no commits on the branch yet):

```
$ node gates/preflight.js --base main --pretty --no-log
route=escalate — verdict=inconclusive — 2 pass, 0 fail, 1 inconclusive; inconclusive: work-present
  PASS  base-ref (34ms) — exit 0
  ????  work-present (165ms) — exit 1 is declared inconclusive by the spec
  PASS  gates (5623ms) — exit 0
  → escalating to the model: the evidence above does not decide it
exit=2
```

That is the designed behavior for an empty branch: "is there work here" is a
question about the request, not an answer about the code.

---

## 5. The review loop

### 5.1 Entry point

A worker calls `kanban_complete(route='review')`. That is the **only** entry
point — no direct-to-merge path, no way to skip.

The dispatcher's review-column pass lives in
`hermes-agent/hermes_cli/kanban_db.py` (the "review column dispatch" block,
~line 8935). Per iteration it:

1. selects `status='review' AND claim_lock IS NULL`, ordered
   `priority DESC, created_at ASC`;
2. skips unassigned cards and assignees with no spawnable profile;
3. `claim_review_task()` (`kanban_db.py:4374`) atomically flips `review →
   running` under a claim lock with a TTL, and opens a **new run row** so the
   review agent's lifecycle is tracked separately from the worker's;
4. resolves the worktree workspace and persists `workspace_path` / `branch_name`;
5. **`claimed.skills = ["sdlc-review"]`** (`kanban_db.py:8996`) — force-loaded;
   the kanban lifecycle guidance is already in every worker's system prompt, so
   this is the only extra skill a review agent gets;
6. spawns, records the PID.

Review spawns count against the same `max_spawn` as ready-column dispatch, so
total running workers stays bounded.

### 5.2 Loop bound

`failure_limit` — read from `kanban.failure_limit` in config
(`gateway/kanban_watchers.py:1068`), falling back to
`kanban_db.DEFAULT_FAILURE_LIMIT`, which is **2** (`kanban_db.py:7005`). Values
below 1 or non-integers fall back to the default with a logged warning. On
spawn or workspace-resolution failure, `_record_spawn_failure(...,
failure_limit=...)` auto-blocks the card once the count is reached.

(`docs/sdlc-audit/long-horizon-validation.md` records this number as
unverifiable from that workspace; it is verifiable from this one, and the value
is 2.)

The builder profile's own routing ceilings, at
`AppData\Local\hermes\profiles\builder\config.yaml`:

```yaml
routing:
  claude:
    default_max_turns_low: 15
    default_max_turns_medium: 30
    default_max_turns_high: 60
```

### 5.3 The six steps (`sdlc-review` SKILL.md)

Source of truth for the deployed behavior:
`AppData\Local\hermes\profiles\builder\skills\software-development\sdlc-review\SKILL.md`
(version 1.3.2 — see [§9](#9-drift-and-gaps-found-verified-nothing-changed) on
which copy is which).

1. **Orient** — `kanban_show()`, read body/ACs, prior attempts, comments, parent
   handoffs; identify branch and workspace from `worker_context`.
2. **1.5 cwd guard** — `cd "$HERMES_KANBAN_WORKSPACE"`, then `pwd` and
   `git rev-parse --show-toplevel` must both equal the card's workspace. A
   persistent mismatch is `kanban_block(kind="needs_input")`, never a guess.
   (Motivated by the 2026-08-03 incident: a stale gateway's inherited cwd
   resolved to a *different clone*, and a cleanly-mergeable branch was rejected.)
3. **Read the diff** — `git log --oneline -5`, `git diff <base>...HEAD`,
   `--stat`; split by file above ~15k chars. In 1.3.2 the base is *derived*
   (`origin/HEAD` → `main` → `master`) and a missing integration branch is
   `needs_input`.
4. **Verify acceptance criteria** — each criterion from the card body, verbatim,
   with the specific evidence. Ambiguous or untestable ⇒ rejection reason, not a
   guess.
5. **Run the gates** — `sh gates/run.sh` from the worktree root; fall back to
   `for c in *-check.js; do node "$c"; done`; if neither exists, record
   `residual_risk` rather than inventing a pass. **A red gate is a rejection,
   full stop** — the reviewer's opinion does not override it, and the reviewer
   does not fix the code.
6. **4.5 Code-quality check** — deterministic greps (hardcoded hex outside
   `:root`, `except: pass` / empty `catch {}`, `TODO`/`FIXME`,
   `console.log`/`print`) plus judgment reads (hallucinated imports, dead code,
   copy-paste divergence, speculative abstractions, hardcoded config, edge
   cases, race conditions, secrets, injection, hot-path performance, test
   quality). Output is a `file:line` + `high|medium|low` + one-line-reason list.
   A `high` finding is evidence, not an automatic rejection — **secrets in the
   diff are the one exception and block regardless of the verdict.**
7. **Verdict** — the agent does **not** judge:

   ```bash
   printf '.claude-verdict.log\n' >> "$(git rev-parse --git-path info/exclude)"
   claude -p "<ACs + diff summary + gate output + code-quality findings>" \
     --model fable 2>&1 | tee .claude-verdict.log
   ```

   Two outcomes only, `accept` or `reject`. **A failed or unusable `claude -p`
   call is not an accept** — it is `kanban_block(kind="needs_input")`. The log
   is attached with `kanban_attach(filename="claude-verdict.log", ...)`
   *before* the merge path prunes the workspace, and the attachment id goes in
   the completion metadata as `verdict_log_attachment_id`.

### 5.4 Merge path (accept) — CAS only

```bash
repo=$(dirname "$(git rev-parse --git-common-dir)")
# 0. wrong-repo guard: compare --git-common-dir (identical across a worktree and
#    its main checkout, different across clones). --absolute-git-dir would
#    false-trigger on every legitimate worktree.
scratch="$repo/.worktrees/_review_$$"
git -C "$repo" worktree add --detach "$scratch" "$integration"
before=$(git -C "$repo" rev-parse "$integration")
git -C "$scratch" reset --hard "$before"
git -C "$scratch" merge --no-ff --no-commit "$branch"   # conflict → abort, reject
(cd "$scratch" && sh gates/run.sh)                      # red → abort, reject
git -C "$scratch" commit --no-verify -m "merge($branch): $title

kanban-task: $task_id"
after=$(git -C "$scratch" rev-parse HEAD)
git -C "$repo" update-ref "refs/heads/$integration" "$after" "$before"   # CAS
# 5b. post-merge assertion: rev-parse "$integration" must now equal "$after"
git -C "$repo" worktree remove --force "$scratch"
git -C "$repo" worktree remove --force "$workspace"; git -C "$repo" branch -D "$branch"
```

Then `kanban_complete(summary=..., metadata={branch, merge_commit, integration,
gates, reviewer, post_merge, claude_verdict_log, verdict_log_attachment_id})`.

Failure modes, all `needs_input`, never a force: merge conflict; red gate in the
scratch; the CAS refused because the ref moved during the gate run; the
post-merge assertion not matching; the wrong-repo guard tripping. A clean
checkout of the integration branch elsewhere is fast-forwarded (`reset --hard
"$after"`); a **dirty** one is left alone and handed to a human — the ref move
already landed, the checkout just needs to catch up.

### 5.5 Rejection path

`kanban_comment(...)` citing criterion number, gate output, or `file:line`, then
`kanban_block(...)` — `kind="needs_input"` when the rejection is a question
rather than a definite defect. The card returns to the worker, who fixes and
calls `kanban_complete(route='review')` again. One review pass per `route`
call; the merge path never retries into a loop.

### 5.6 Safety invariants (SKILL.md §Safety Properties)

1. Never touch the primary working copy — all merges in a detached scratch.
2. The integration ref only ever moves by CAS `update-ref <ref> <new> <old>`.
   Never `push --force`, never `branch -f`.
3. Never run against a dirty checkout of the integration branch.
4. Never retry into a loop — one rejection, full output, back to the worker.
5. Never fix the worker's code.

---

## 6. `gates/soak.js` — long-horizon validation

Not part of the per-card path; the harness that proves the gate layer does not
drift.

```sh
git worktree add -b soak/<name> ../.worktrees/soak-<name> HEAD
cd ../.worktrees/soak-<name>        # needs its own node_modules
node gates/soak.js --cycles 10 --label <name> --base main   # redirect stdout OUTSIDE the worktree
```

Each cycle: **seed** `src/soak/<label>-cycle-<n>.ts` with one unused local (both
`tsc` `noUnusedLocals`/TS6133 *and* ESLint `@typescript-eslint/no-unused-vars`
must reject it independently) → **fix** it clean → **route** through
`preflight.js` (must be `approve`) → **commit** through the real pre-commit hook
(no `--no-verify`). Then ten invariants per cycle, including
`tree_clean_after_commit` (tracked modifications only), `history_advanced`
(`rev-list --count` == baseline + n) and `preflight_log_appended`
(`.claude-preflight.log` == n lines). Writes `soak-report-<label>.json`; exit
non-zero if any invariant broke.

Prior results (`docs/sdlc-audit/long-horizon-validation.md`, three concurrent
branches): 18 cycles × 10 invariants = 180 assertions, 0 failures; ~35 s/cycle,
four full gate runs per cycle.

---

## 7. Lint / typecheck / format commands

| Command | What it is |
|---|---|
| `npm run gate` | `sh gates/run.sh` — **the** verdict |
| `npm run lint` | `eslint .` — whole repo, 94 problems at `main`, **not** what the gate runs |
| `npm run build` | `tsc -b && vite build` |
| `npm run gate:install-hooks` | copies `gates/claude-settings.json` → `.claude/settings.json` |
| `npm run prepare` | `git config core.hooksPath .githooks` (runs on `npm install`) |

There is **no formatter** in this repo — no Prettier, no `format` script, no
`.prettierrc`. Style is whatever ESLint's rules enforce.

ESLint config is flat (`eslint.config.js`, ESLint 9):

```js
globalIgnores(['dist', '.claude/**']),
{
  files: ['**/*.{ts,tsx}'],
  extends: [js.configs.recommended, tseslint.configs.recommended,
            reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
  languageOptions: { ecmaVersion: 2020, globals: globals.browser },
}
```

Note the `files` selector — see finding **F1** below.

---

## 8. Reproducing the pipeline end to end

```sh
# 0. one-time per clone
npm install                 # → prepare → git config core.hooksPath .githooks
npm run gate:install-hooks  # → .claude/settings.json  (overwrites; merge by hand if you have one)

# 1. Tier 1, the gate, exactly as every caller runs it
GATE_VERBOSE=1 sh gates/run.sh ; echo "exit=$?"          # expect: ok typecheck / ok lint / exit=0

# 2. watch it actually reject something (this is the only way to know it is strict)
printf 'export function f(): number {\n  const unused = 1;\n  return 2;\n}\n' > src/scratch-probe.ts
sh gates/run.sh ; echo "exit=$?"                          # expect: TS6133 + no-unused-vars, exit=1
rm src/scratch-probe.ts

# 3. per-commit stage
git commit --allow-empty -m probe                         # the hook runs the same script

# 4. Tier 0 routing
node gates/preflight.js --base main --pretty --no-log ; echo "exit=$?"
#   0 approve → merge, no model   |   1 reject → back to the worker, no model
#   2 escalate → spawn the model on this evidence only

# 5. the review loop, from the worker side
#   kanban_complete(route='review')  →  dispatcher claim_review_task
#   →  spawns the assignee's profile with skills=["sdlc-review"]
#   →  six steps  →  claude -p ... --model fable  →  CAS merge  or  kanban_block

# 6. batch fallback for cards that reached done without a review pass
cd F:/Documents/Repositories/hermes-ops
python3 bin/merge_queue.py --repo <repo> --board <board> \
  --integration-branch main --check "gates/run.sh" --dry-run
```

---

## 9. Drift and gaps found (verified; nothing changed)

Recorded as a read, per the card's "no behavioral changes". Each is reproducible
from the command shown.

**F1 — the lint tier is a no-op for `.js/.jsx/.mjs/.cjs`.** `gates/run.sh`
selects those extensions, but `eslint.config.js` has exactly one config block
and it is `files: ['**/*.{ts,tsx}']`. In ESLint 9 flat config a file matching no
block gets no rules.

```sh
$ npx eslint --no-warn-ignored --max-warnings=0 gates/evaluate.js ; echo $?
0
$ npx eslint --print-config gates/evaluate.js | node -e "…Object.keys(c.rules).length"
rule count: 0
```

So `gates/*.js`, `netlify/functions/*.js` and every other plain-JS file in this
repo pass the lint tier unconditionally — including the gate's own code. The
`soak.js` defect probe only ever proved strictness on a `.ts` file.

**F2 — `sdlc-review` version drift across four copies.** The one that actually
runs (builder profile) is ahead of its own canonical repo:

| copy | version | has G5 `origin/HEAD` derivation |
|---|---|---|
| `hermes-ops/skills/sdlc-review/SKILL.md` (working tree) | 1.3.0 | no |
| `hermes-ops` `HEAD` (`60ed03b`) | 1.3.1 | — |
| `AppData\…\hermes\skills\software-development\…` | 1.3.1 | no |
| `AppData\…\hermes\profiles\builder\skills\…` ← **the one dispatched** | **1.3.2** | yes (4 refs) |

`hermes-ops`'s working tree is also mid-revert (staged `M`/`D` on
`skills/sdlc-review/*`, `gates/*`, `fixtures/*`), and
`hermes-ops/gates/sdlc-review-check.sh` asserts `version = "1.3.0"` — i.e. the
canonical repo's own gate currently pins the *oldest* of the four. §5.3 above
documents 1.3.2 because that is what runs.

**F3 — duplicated install path.** A third deployed copy exists at
`AppData\Local\hermes\profiles\builder\profiles\builder\skills\software-development\sdlc-review\SKILL.md`
— `profiles/builder` nested inside itself. Same content as the real one (1.3.2),
so it is dead weight rather than a live hazard.

**F4 — the per-turn stage is not installed here.** No `.claude/settings.json` in
this worktree, so `gates/claude-hook.js` never fires. Of the five callers, this
is the one that has never been exercised on this repo (also noted in
`long-horizon-validation.md`).

**F5 — CI has never run.** `origin/main` = `5b0c2ba`, local `main` = `972031d`,
9 commits unpushed. `.github/workflows/gate.yml` has had no execution.

**F6 — `gates/review-lint.js` does not exist.** `preflight.js`'s header and
`evaluate.js`'s `defaultSpec` comment both describe it as landing with "audit
R2" and `preflightSpec()`'s comment explains how it would be invoked
(`--root` pointed at the target), but no such file is in `gates/`. The probe
list is the three in §4.2 only. Given **F1**, the missing lint probe is the
larger of the two gaps.

**F7 — the two prior audit docs are stale on one point.**
`docs/sdlc-audit/review-loop.md` ("This repo currently has no `gates/run.sh`")
and `long-horizon-validation.md` ("Everything below is true of the composed
branch, not of `main`") both predate `972031d`. `git ls-tree main gates/` now
lists the full layer, and preflight's `gates` probe returns **pass** on `main`,
not `escalate`.

**F8 — the `*-check.js` tier discovers nothing.** Zero matches at the repo root,
so `run.sh`'s third stage is currently structural only.

**F9 — `failure_limit` is 2.** `DEFAULT_FAILURE_LIMIT = 2`
(`hermes-agent/hermes_cli/kanban_db.py:7005`), overridable via
`kanban.failure_limit`. Recorded here because
`long-horizon-validation.md` lists this as the thing it could not read.

---

## 10. What this document does not cover

- **The gateway's ready-column dispatch, retry diversification and
  auto-decomposer** — read here only as far as the review path needed
  (`kanban_db.py` review block, `kanban_watchers.py` failure-limit resolution).
- **`claude -p ... --model fable` verdict quality** — the loop's mechanics are
  documented; whether the model's judgment is good is a separate question.
- **`hermes-ops`'s own gate suite** (`hermes-ops/gates/run.sh`:
  `mission_control/smoke_test.sh`, `mission-control-check.js`,
  `sdlc-review-check.sh`, `install-skills-version-guard-check.sh`) — mapped, not
  run; that repo's working tree is mid-edit and running it would not describe a
  committed state.
- **`.github/workflows/pr-decline.yml` and `stale.yml`** — repo-hygiene
  automation inherited from the `design-os` template (they still point at
  `buildermethods/design-os` URLs), not part of the SDLC gate path.
