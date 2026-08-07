# SDLC Pipeline Inventory — JCA1221 vs. the foreflux reference architecture

Snapshot date: **2026-08-07**. Collected for kanban card `t_7a6bd06e`
("Inventory current SDLC pipeline and foreflux reference architecture").

Everything below was read from the live files and databases on this machine.
Where a claim could not be verified it says so. Paths are exact and absolute
where they leave this repository.

---

## 0. Reading map

| You want | Section |
|---|---|
| What runs lint anywhere | [§5](#5-lint-touchpoints--every-place-lint-runs) |
| What the gate suite command is | [§4](#4-the-deterministic-gate-layer-foreflux) |
| Where a code-review agent is invoked | [§6](#6-code-review-agent-touchpoints) |
| How a verdict changes task state | [§7](#7-how-review-verdicts-feed-back-into-task-state) |
| What happens on failure / long-running branches | [§8](#8-failure-paths-and-long-running-branches) |
| What JCA1221 is missing | [§9](#9-gap-analysis--jca1221-vs-the-reference) |
| Live defects found while collecting | [§10](#10-defects-observed-during-collection) |

---

## 1. The two systems

There are two distinct layers, and they are configured in different places.

**Layer A — the Hermes kanban SDLC engine** (machine-global, not in any repo).
Root: `C:\Users\USER\AppData\Local\hermes\` (referred to below as `HERMES_HOME`).
It dispatches cards, spawns worker and review agents into git worktrees, and
runs cron jobs. It is shared by every board.

**Layer B — the per-repository gate layer** (committed, per-repo).
`foreflux` has a mature one. `hermes-ops` has a small one. **JCA1221 has none.**

```
                 HERMES_HOME (Layer A, one machine, never synced)
                 ├─ kanban/boards/<slug>/{board.json,kanban.db}
                 ├─ cron/jobs.json          nightly review + audit jobs
                 ├─ profiles/<name>/        agent identities (builder, judge, …)
                 └─ scripts/                deployed cron scripts
                          │
                          │ spawns worker into <repo>/.worktrees/<task_id> on wt/<task_id>
                          ▼
                 <repo> (Layer B, committed)
                 ├─ gates/run.sh            the deterministic gate suite
                 └─ .claude/settings.json   hooks that call the gate suite
```

### Boards

| Board | `board.json` | `default_workdir` |
|---|---|---|
| `foreflux` | `HERMES_HOME\kanban\boards\foreflux\board.json` | `F:\Documents\Repositories\foreflux` |
| `jca1221` | `HERMES_HOME\kanban\boards\jca1221\board.json` | `F:/Documents/Repositories/JCA1221-Website` |
| `sdlc-review-test` | `…\sdlc-review-test\board.json` | `null` (E2E test board) |
| `master`, `school`, `_archived` | — | (not inspected; out of scope) |

Each board has its own SQLite DB at
`HERMES_HOME\kanban\boards\<slug>\kanban.db`. Tables referenced by the tooling:
`tasks`, `task_runs`, `task_events`.

### Dispatcher configuration

`C:\Users\USER\AppData\Local\hermes\config.yaml`, key `kanban:`

```yaml
kanban:
  dispatch_in_gateway: true
  dispatch_interval_seconds: 60
  failure_limit: 2                      # circuit breaker: 2 failed runs -> gave_up
  worker_log_rotate_bytes: 2097152
  worker_log_backup_count: 1
  orchestrator_profile: ''
  default_assignee: ''
  auto_decompose: true
  auto_decompose_per_tick: 3
  dispatch_stale_timeout_seconds: 14400 # 4h before a running card is considered stale
```

There is **no board-level review configuration** — the review flow is triggered
by card status (`review`), not by per-board config.

---

## 2. Repository-side setup — JCA1221 (this repo)

| Concern | Status | Path / command |
|---|---|---|
| Lint config | present | `eslint.config.js` (flat config, ESLint 9, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`; ignores `dist`, `.claude/**`) |
| Lint command | present, **never run automatically** | `npm run lint` → `eslint .` |
| Typecheck / build | present, **never run automatically** | `npm run build` → `tsc -b && vite build` |
| Test suite | **none** | no test script; `playwright` is a devDependency but there is no `playwright.config.*` and no test runner script |
| `gates/run.sh` | **absent** | — |
| `*-check.js` at root | **absent** | — |
| `.claude/settings.json` hooks | **absent** | `.claude/` holds only `commands/design-os/*`, `skills/frontend-design`, `workflows/`, `worktrees/` |
| CI workflows | present but unrelated to this project | `.github/workflows/pr-decline.yml`, `.github/workflows/stale.yml` — both inherited from the upstream `buildermethods/design-os` template; they label/close PRs and never build, lint or test |
| Deploy config | present | `netlify.toml` (`command = "npm run build"`, `publish = "dist"`, functions in `netlify/functions`), `vercel.json` (rewrites + cache headers) |

**Net effect: there is no automated quality gate of any kind on this repository.**
The Netlify build is the only thing that would fail on a type error, and it fails
after merge, not before. `npm run lint` has no caller anywhere in the pipeline.

---

## 3. Repository-side setup — the reference repos

### 3.1 `F:\Documents\Repositories\foreflux` (the reference)

Static HTML/JS + Supabase + Cloudflare. Its agentic rules are committed at
`F:\Documents\Repositories\foreflux\.hermes.md`:

- **Orchestrator:** Hermes (strategy, kanban, review loops) — never spawns a
  Claude session by hand.
- **Execution engine:** Claude Code CLI via the supervised runner
  `scripts/claude-runner.py`, launched as a direct child inside the task's git
  worktree, exit codes propagated, backoff on 429/5xx.
  ```bash
  python3 scripts/claude-runner.py --prompt <file-or-string> --workdir <task-worktree>
  ```
  Model routed by declared complexity: `complexity: high` in the card body →
  `--model opus`, otherwise `--model sonnet`; explicit `--model` overrides.
  Resolved invocation logged to `<workdir>/.claude-run.log` (git-excluded).
  Knobs: `CLAUDE_RUNNER_MAX_RETRIES` (3), `CLAUDE_RUNNER_BACKOFF_BASE` (30s),
  `CLAUDE_BIN`. Max 1 concurrent runner per subscription.
  Runner tests: `sh scripts/claude-runner-tests/run.sh`.
- **Subagents:** `delegate_task` for read-only research only — never for repo changes.
- Gate documentation: `F:\Documents\Repositories\foreflux\CHECKS.md` documents
  what each root `*-check.js` asserts and which regression class it catches.

### 3.2 `F:\Documents\Repositories\hermes-ops` (the pipeline's own repo)

"The parts of the agentic pipeline that Hermes does not ship." Contents:

| Path | Purpose |
|---|---|
| `skills/sdlc-review/SKILL.md` | **Canonical source of the review agent.** See §6.2 |
| `skills/sdlc-review/hermes-skill.toml` | Install manifest; `targets = ["builder", "global"]` |
| `bin/install-skills.py` | Deploys skills to `HERMES_HOME/profiles/builder/skills/<category>/<name>` and the global store |
| `bin/merge_queue.py` | Batch merge bot for cards that reached `done` without a review pass. See §7.3 |
| `bin/goal_sync.py` | Goal sync vault ↔ board (cron) |
| `gates/run.sh` | This repo's gate suite |
| `gates/sdlc-review-check.sh` | Regression check pinning the sdlc-review skill's version + retention markers |
| `gates/install-skills-version-guard-check.sh` | Regression check for the installer's downgrade guard |
| `mission_control/` | Dashboard renderer + smoke test |
| `audit/hermes-audit.sh` | Canonical copy of the nightly board audit (deployed to `HERMES_HOME/scripts/`) |

Gate suite command (`hermes-ops/gates/run.sh`):

```sh
sh mission_control/smoke_test.sh
node mission-control-check.js
sh gates/sdlc-review-check.sh
sh gates/install-skills-version-guard-check.sh
```

> Note: the on-disk copy of `hermes-ops/gates/run.sh` is stale relative to
> `HEAD` — see [§10.1](#101-both-reference-repos-primary-checkouts-are-stale-against-head).

---

## 4. The deterministic gate layer (foreflux)

The single most important artifact to copy. Entry point:

```bash
sh gates/run.sh --fast <file>...   # ~80ms  syntax + invariants on named files
sh gates/run.sh                    # ~8s    whole repo + behavioural checks
```

Design note quoted from the script itself: *"Nothing here knows what invoked it.
That is the point — a Claude Code hook, a Hermes kanban worker, a git pre-commit
and CI all get the same verdict from the same code."*

Discovery is **by shape, not by list**: any `*-check.js` at the repo root is in
the suite (`for c in *-check.js; do … node "$c"; done`). This was a deliberate
fix — a check had been written, passed, and guarded nothing because nobody added
its name to a hardcoded list.

### 4.1 Gate scripts at `HEAD` of foreflux

| File | Tier | What it does |
|---|---|---|
| `gates/git-tree-guard.sh` | both (runs first) | Fails if the index/worktree differ from `HEAD` — catches a plumbing merge (`update-ref`/`commit-tree`, no checkout) leaving the tree stale so every other gate measures the wrong commit |
| `gates/syntax.js` | fast + full | `vm.Script`-compiles every shipped `.js` **and every inline `<script>` block inside the HTML screens**; never executes. Reports `file:line` |
| `gates/invariants.js` | fast + full | Restates decisions from `PRODUCT.md` / `PLAN.md` / `motion-plan.md` / `.hermes.md` as machine-checkable rules |
| `gates/publish.js` | fast + full | Fails if any untracked, un-`.assetsignore`d file sits at the publish root (Workers publishes the root verbatim) |
| `gates/review-lint.js` | full (self-test only) | Deterministic half of a code review — see §5.2 |
| `gates/review-lint-test.sh` | full | Self-test for the above |
| `gates/git-tree-guard-test.sh` | full | Self-test for the tree guard |
| `gates/preflight.js` | pre-spawn (Tier 0) | See §6.1 |
| `gates/evaluate.js` | aggregator | Deterministic evaluator harness; exit `0=pass / 1=fail / 2=inconclusive`, stdout is one JSON object `schema: hermes.evaluate.v1` |
| `*-check.js` at repo root | full | Behavioural checks (e.g. `sb-guard-check.js`, `ff-forecast-check.js`, `ff-tenant-check.js`, `ff-render-check.js` …), documented one-by-one in `CHECKS.md` |

`gates/run.sh` deliberately runs only `review-lint`'s **self-test** in the full
tier, not `review-lint` over the whole tree: the repo ships ~27 intentional
`catch(e){}` defensive guards that would be false positives. `review-lint` is a
diff filter (`--diff master`), not a standing invariant.

### 4.2 The hook wiring — `foreflux/.claude/settings.json`

```json
{
  "model": "claude-opus-5",
  "hooks": {
    "PostToolUse": [{ "matcher": "Edit|Write|MultiEdit|NotebookEdit",
      "hooks": [{ "type": "command",
        "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/hooks/gate.js\"",
        "timeout": 30, "statusMessage": "Gating the edit" }] }],
    "Stop": [{ "hooks": [{ "type": "command",
        "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/hooks/gate.js\"",
        "timeout": 180, "statusMessage": "Running the full gate suite" }] }]
  }
}
```

`foreflux/.claude/hooks/gate.js` bridges the two events to the two tiers:

- **PostToolUse** → `gates/run.sh --fast <the file just written>` (~80ms, felt by nobody).
  Skips files outside the repo and `*-check.js`. Writes a marker at
  `<repo>/.git/gate-dirty` so the Stop hook knows something was edited.
  Lives in `.git/` so it is never committed and is naturally per-worktree.
- **Stop** → the full suite, **only if the marker exists** (otherwise every
  conversational reply would pay 8s). Guards against loops with `stop_hook_active`.
- **Exit 2 is the mechanism**: Claude Code reads stderr on exit 2 and hands it
  back to the model, so a gate failure becomes work to fix rather than a message
  nobody reads. A crashed/hung gate exits 0 deliberately — it must not wedge the session.
- Both paths `realpath` the repo root and the edited file before comparing; a
  plain `startsWith` had silently passed everything when the project root was a symlink.

---

## 5. Lint touchpoints — every place lint runs

| # | Where | Trigger | Command | Repo |
|---|---|---|---|---|
| 1 | `package.json` script | **manual only** | `npm run lint` (`eslint .`) | JCA1221 |
| 2 | Netlify build | on deploy | `npm run build` (`tsc -b && vite build`) — typecheck, not lint | JCA1221 |
| 3 | Claude Code `PostToolUse` hook | every `Edit`/`Write`/`MultiEdit` | `gates/run.sh --fast <file>` → `syntax.js` + `invariants.js` + `publish.js` | foreflux |
| 4 | Claude Code `Stop` hook | end of any turn that edited a file | `gates/run.sh` (full) | foreflux |
| 5 | Tier 0 preflight | before any LLM session is spawned | `gates/preflight.js` → includes `review-lint` + `gates/run.sh` | foreflux |
| 6 | Review agent, Step 4 | during a review-column run | `sh gates/run.sh` from the worktree root | any repo that has it |
| 7 | Review agent, Step 4.5 | during a review-column run | grep-based code-quality sweep (see §5.2 for why this was broken) | any repo |
| 8 | Merge queue | batch merge | `--check "gates/run.sh"` run inside the scratch worktree | foreflux |
| 9 | `hermes-ops` gate suite | manual / review | `sh gates/run.sh` | hermes-ops |

**JCA1221 participates in rows 1 and 2 only, and row 1 has no automatic caller.**

### 5.1 The gate suite command, per repo

| Repo | Command |
|---|---|
| foreflux | `sh gates/run.sh` (fast tier: `sh gates/run.sh --fast <file>...`) |
| hermes-ops | `sh gates/run.sh` |
| JCA1221 | **none exists.** Closest available: `npm run lint && npm run build` |

### 5.2 `gates/review-lint.js` — why it exists

From its own header: `docs/llm-efficiency-audit.md` §R2 found the review skill's
"no judgment required" checks were shell greps that **never ran** —
`grep -rn 'TODO\|FIXME' -- '*.py'` exits with *"No such file or directory"*
because `--` ends option parsing and the globs are read as filenames. Three of
the four returned nothing on every card, *and nothing is indistinguishable from
clean*. `review-lint.js` is those checks rewritten as code that fails when it
cannot do its job.

```bash
node gates/review-lint.js <file>...
node gates/review-lint.js --diff [ref]     # default ref: master
```

- Output: JSON on stdout **always**; a short human summary on stderr.
- `--fail-on=LEVEL` (`high|medium|low|none`, default `medium`): syntax errors,
  broken imports and secrets block; leftover TODOs and debug prints report.
- Exit 1 at or above the threshold, so `node gates/review-lint.js --diff master || reject`
  is the whole integration.
- Explicitly a **filter, not a reviewer** — only mechanically decidable questions.

> ⚠ The grep-based Step 4.5 checks in the deployed `sdlc-review` SKILL.md are
> **still written in the broken `grep … -- '*.py'` form** (see §10.2).

---

## 6. Code-review agent touchpoints

### 6.1 Tier 0 — deterministic preflight, *before* any model is spawned

`foreflux/gates/preflight.js` + `scripts/claude-runner.py --preflight`.
Documented at `foreflux/docs/preflight.md` (audit item R1).

```bash
node gates/preflight.js                 # preflight this worktree against master
node gates/preflight.js --base <ref>
node gates/preflight.js --cwd <dir>
node gates/preflight.js --pretty
```

Exit code is the route; stdout is one JSON object `schema: hermes.preflight.v1`:

| `evaluate` verdict | exit | route | what the caller does |
|---|---|---|---|
| pass | 0 | `approve` | merge; **no LLM session** |
| fail | 1 | `reject` | hand `probes[]` back to the worker; **no LLM session** |
| inconclusive | 2 | `escalate` | spawn the model, on this evidence only |

Checks folded in: base-ref, work-present, `review-lint` (audit R2), and the
repo's own `gates/run.sh`, aggregated by `gates/evaluate.js`.

**Every failure of this layer routes to `escalate`, never to `reject`** — a
missing binary, a blown timeout, an unreadable spec, a non-existent base ref. A
gate that cannot answer must not block.

Runner wiring (`foreflux/scripts/claude-runner.py`): `PREFLIGHT_SCRIPT =
gates/preflight.js`, `PREFLIGHT_ROUTES = {0: "approve", 1: "reject", 2:
"escalate"}`, `EXIT_PREFLIGHT_REJECT = 3`, `DEFAULT_PREFLIGHT_TIMEOUT = 600`.

The measured justification, quoted from `docs/preflight.md`: *a ~2 KB merge
decision was being produced by a Claude Code session with a median of 804 K
tokens board-wide — mostly spent re-deriving a gate exit code that a script
already knew. On the reject path the entire session was waste: ~211 s median to
discover a red exit code that `gates/run.sh` reports in ~8 s.*

### 6.2 Tier 1 — the `sdlc-review` review-column agent

- Canonical: `F:\Documents\Repositories\hermes-ops\skills\sdlc-review\SKILL.md`
- Deployed: `C:\Users\USER\AppData\Local\hermes\profiles\builder\skills\software-development\sdlc-review\SKILL.md`
- Manifest: `hermes-skill.toml`, `targets = ["builder", "global"]`, `category = "software-development"`
- Deployed by: `python3 bin/install-skills.py`

**Invocation:** the kanban dispatcher claims a card from the `review` column,
transitions it `review → running` via `claim_review_task`, spawns a review agent,
and **force-loads** this skill. It is never chosen by the agent.

```
worker (running) → worker completes → review → [sdlc-review] → done (merged)
                                                ↘ blocked (rejected, back to worker)
```

The six-step loop, ordered so an early failure prevents late waste:

| Step | What |
|---|---|
| 1 | Orient — `kanban_show()`; read ACs from the body, prior attempts, comments, parent handoffs |
| 1.5 | **cwd guard** — `cd "$HERMES_KANBAN_WORKSPACE"`; assert `pwd` and `git rev-parse --show-toplevel` both equal the workspace path. Added after a 2026-08-03 incident where a stale gateway's inherited cwd resolved to a *different clone* and produced a false rejection |
| 2 | Read the diff — `git diff master...HEAD`, `--stat`; split by file above ~15k chars |
| 3 | Verify each acceptance criterion against the diff; an unverifiable criterion is a rejection reason, not a guess |
| 4 | **Run the gates** — `sh gates/run.sh` from the worktree root; fallback `for c in *-check.js; do node "$c"; done`; if neither exists, that is a `residual_risk` entry, not a rejection. *"A red gate is a rejection, full stop."* |
| 4.5 | **Code-quality check** targeted at Opus 5-generated code — deterministic greps plus judgment checks (hallucinated APIs, copy-paste divergence, over-engineered abstractions, hardcoded config, race conditions, secrets, injection, perf, test quality). Findings are `file:line` + `high/medium/low` + one line of reasoning |
| 5 | **Verdict** — the reviewer does *not* judge. It assembles ACs + diff summary + gate output + code-quality findings and runs `claude -p "<...>" --model fable 2>&1 \| tee .claude-verdict.log`, then acts on `accept` / `reject`. No third option. A failed or unusable verdict is **not** an accept — it is `kanban_block(kind="needs_input")` |
| — | Evidence retention: `.claude-verdict.log` is `git`-excluded via `info/exclude` and attached to the card with `kanban_attach(filename="claude-verdict.log", …)` **before** the worktree prune, because the prune deletes the workspace the path points to |

Secrets in the diff are the one finding that rejects regardless of the verdict.

### 6.3 Tier 2 — the nightly review agent (system-level, not per-card)

Two cron jobs, both `no_agent: true` (Hermes runs the script; the LLM call goes
through the supervised Claude runner on the flat subscription):

| Job | id | Schedule | Script |
|---|---|---|---|
| Foreflux Nightly Review (claude-code) | `0d5ef992a6df` | `30 2 * * *` — **enabled** | `foreflux_nightly_review_claude.py` |
| Foreflux Nightly Review (improvements) | `a4d062d89cd8` | `30 2 * * *` — **paused** (superseded 2026-08-04) | `foreflux_nightly_review.py` (agent-mode, deepseek-v4-flash) |
| nightly audit (foreflux board) | `c4241470b996` | `0 22 * * *` — enabled | `nightly_audit.py` |
| Board audit digest (hermes-audit.sh) | `6b106cb30e39` | `0 2 * * *` — enabled | `hermes-audit.sh` |

Deployed at `C:\Users\USER\AppData\Local\hermes\scripts\`. Flow of the review job:

1. `foreflux_nightly_review.py` — read-only SQLite collector against
   `HERMES_KANBAN_DB` (default `…/boards/foreflux/kanban.db`, `mode=ro`).
   24h window. Emits: `task_runs` with outcomes, open `blocked`/`triage` cards,
   circuit-breaker trips (`gave_up`, `block_loop_detected`), `review_requested`
   event counts, cards in `review` status, bad-outcome runs on review-flow tasks,
   merge/git run errors, and `COMMENT_TARGET=<oldest open card id>`.
   **Always exits 0** — "a degraded digest beats a dead cron".
2. `foreflux_nightly_review_claude.py` folds that stdout into a fixed prompt and
   runs `foreflux/scripts/claude-runner.py --allowed-tools Read --output-format text
   --timeout 1800` with `cwd = F:\Documents\Repositories\foreflux`.
3. Posts the digest as a comment on `COMMENT_TARGET` via
   `hermes kanban --board foreflux comment … --author nightly-audit`.
4. Prints the digest (that is the cron's delivered message).
   **Failures are loud**: any non-zero step exits non-zero, deliberately unlike the
   superseded agent-mode job which "silently succeeded even when Claude had nothing".

The review prompt asks for: board health, per-blocked-card next action, trip/merge
failure patterns citing run ids, and 2–5 concrete system improvement proposals each
anchored to a specific card or run id. It is read-only — the wrapper posts the comment,
not the model.

`hermes-audit.sh` writes a dated Markdown digest to
`~/Hermes/audit-logs/YYYY-MM-DD.md` (idempotent via temp-file + atomic rename,
read-only against the DB, exits non-zero only if the file could not be written).

### 6.4 Agent profiles

`HERMES_HOME\profiles\`: `builder`, `judge`, `daniellover`, `default`, `leinad`,
`ollama`, `pisay-class`. Each has `config.yaml` / `profile.yaml`, its own
`skills/`, `memories/MEMORY.md`, `cron/`, `sessions/`, `logs/`.
The `sdlc-review` skill installs into the **builder** profile
(`profiles/builder/skills/software-development/sdlc-review/`) and the global store.

Builder-profile software-development skills currently deployed: `dogfood`,
`inspecting-hermes-desktop-dom`, `kanban-board-audit`, `node-inspect-debugger`,
`python-debugpy`, `requesting-code-review`, `sdlc-review`, `simplify-code`,
`spike`, `systematic-debugging`, `test-driven-development`.

---

## 7. How review verdicts feed back into task state

### 7.1 The card lifecycle

```
todo ──dispatch──► running ──worker kanban_complete(route='review')──► review
                      ▲                                                  │
                      │                                    claim_review_task
                      │                                                  ▼
                      │                                          running (reviewer)
                      │                                             │        │
                      │                                     accept  │        │ reject
                      │                                             ▼        ▼
                      │                                          done   blocked ──unblocked──┐
                      └──────────────────────────────────────────────────────────────────────┘
```

- **Worker → review:** `kanban_complete(route='review')` moves the card to the
  review column instead of `done`. A `review_requested` event is recorded (the
  nightly collector counts these).
- **Reviewer → done:** `kanban_complete(summary=…, metadata={branch, merge_commit,
  integration, gates:"green", reviewer:"sdlc-review", post_merge, claude_verdict_log,
  verdict_log_attachment_id})`.
- **Reviewer → blocked:** `kanban_comment(task_id, body=<specific citation of the
  criterion / gate output / file:line>)` **then** `kanban_block(reason=…)`.
  `kind="needs_input"` when the rejection is a question rather than a defect.
  The dispatcher respawns the worker when the card is unblocked.
- The rejection comment must cite a criterion number, gate output, or a
  code-quality finding — *"not a vague 'looks wrong'"*.

### 7.2 The merge itself — CAS only

The integration branch moves **only** by compare-and-swap. Sequence, from the skill:

```bash
repo=$(dirname "$(git rev-parse --git-common-dir)")
integration=master
scratch="$repo/.worktrees/_review_$$"

# wrong-repo guard: compare --git-common-dir (identical across a worktree and its
# main checkout in the SAME repo; differs only across distinct clones).
git -C "$repo" worktree add --detach "$scratch" "$integration"
before=$(git -C "$repo" rev-parse "$integration")
git -C "$scratch" reset --hard "$before"
git -C "$scratch" merge --no-ff --no-commit "$branch"
(cd "$scratch" && sh gates/run.sh)
git -C "$scratch" commit --no-verify -m "merge($branch): $title

kanban-task: $task_id"
after=$(git -C "$scratch" rev-parse HEAD)
git -C "$repo" update-ref "refs/heads/$integration" "$after" "$before"   # CAS
# post-merge assertion: rev-parse must now equal $after, else block
git -C "$repo" worktree remove --force "$scratch"
git -C "$repo" worktree remove --force "$workspace"
git -C "$repo" branch -D "$branch"
```

`kanban-task: <task_id>` in the merge message is mandatory so the card is
traceable from the git log. Observed in the live history, e.g.
`merge(wt/t_f4b17d20): LLM-efficiency architecture — Tier 0 preflight, lint/evaluator gates, synthesis doc`.

### 7.3 The batch fallback — `bin/merge_queue.py`

For cards that reached `done` **without** a review pass:

```bash
python3 bin/merge_queue.py \
  --repo ~/Repos/foreflux \
  --board foreflux \
  --integration-branch master \
  --check "gates/run.sh" \
  --push
```

`--dry-run` prints the queue and exits. The queue is every `done`/`review` card
whose branch still exists and has not landed, oldest completion first; each is
merged in a detached scratch worktree at `.worktrees/_merge`, gated there, and
only then does the integration ref move. Same invariants as the review path, so a
card merged by either is indistinguishable.

Failure reporting: Hermes forbids `done → blocked`, so a completed card cannot be
pushed back into the blocked column. Cards in `review` are blocked normally; cards
already in `done` get a **fresh `triage` card** raised against them carrying the
failure output. Exit code is non-zero if anything failed to land, so cron surfaces it.

`merge_queue.py` is **not** currently on any cron job (checked `cron/jobs.json`) —
it is a manual stopgap.

---

## 8. Failure paths and long-running branches

| Situation | Behaviour | Where defined |
|---|---|---|
| Worker run fails | Run recorded with `outcome`; `consecutive_failures` incremented | kanban engine |
| 2 consecutive failures | Circuit breaker: `gave_up` event, card stops being dispatched (`failure_limit: 2`) | `config.yaml` → `kanban.failure_limit` |
| Card blocked and unblocked repeatedly for the same reason | Auto-escalated to `triage` (`block_loop_detected` event) | kanban engine; surfaced by `kanban_block` docs + the nightly collector |
| Card `running` longer than 4h | Considered stale by the dispatcher | `kanban.dispatch_stale_timeout_seconds: 14400` |
| Gate red during review | Rejection with the gate output verbatim. The reviewer must **not** fix the code | `sdlc-review` SKILL.md, Safety Property 5 |
| Merge conflict | Abort merge, remove scratch worktree, reject with the conflict output. **No retry loop** | Safety Property 4 |
| Integration ref moved during the gate run | CAS `update-ref` refuses. **Never force.** Reject with "integration branch moved during review; re-run" | Safety Property 2 |
| Integration branch checked out dirty somewhere | **Stop.** The CAS ref move still succeeds, but fast-forwarding a dirty checkout would silently revert the merge. Note it and let a human resolve | Safety Property 3 + `hermes-ops/README.md` |
| Integration branch checked out clean | Fast-forward it (`git -C <holder> reset --hard "$after"`) so its index does not report merged files as staged deletions | §7.2 |
| HEAD moved by plumbing without a checkout | `gates/git-tree-guard.sh` fails loudly before any other gate runs | `foreflux/gates/git-tree-guard.sh` |
| Preflight layer cannot answer | Routes to `escalate` (spawn the model), never `reject` | `gates/preflight.js` |
| Gate hook crashes or hangs | Exits 0 — must not wedge the session | `foreflux/.claude/hooks/gate.js` |
| Nightly collector cannot read the DB | Emits a `## COLLECTION ERROR` section, still exits 0 | `foreflux_nightly_review.py` |
| Board `default_workdir` not absolute | Spawn fails immediately: `workspace: board '<slug>' default_workdir '<path>' is not absolute` | observed live — see §10.3 |

**Long-running branches.** There is no time-based branch policy anywhere. The
only pressure toward short branches is the committed rule in `foreflux/.hermes.md`:
*"Keep tasks small. One feature, one fix, one reviewable unit per PR."* and
*"Small PRs for review. Review-fix loop: review → fix feedback → repeat until clean."*
Stale worktrees accumulate: `foreflux` currently has **>10 live worktrees** under
`.worktrees/` plus one orphan under
`HERMES_HOME\kanban\boards\foreflux\workspaces\t_a7932d91`; `hermes-ops` has 5 plus
a prunable one and a leftover `_review_55586` scratch worktree from a review run
that did not clean up. Nothing garbage-collects them.

---

## 9. Gap analysis — JCA1221 vs. the reference

| Capability | foreflux | JCA1221 | Notes |
|---|---|---|---|
| `gates/run.sh` two-tier suite | ✅ | ❌ | The single highest-value thing to port |
| `.claude/settings.json` PostToolUse + Stop hooks | ✅ | ❌ | Needs a gate suite first |
| Deterministic behavioural checks | ✅ (`*-check.js` + `CHECKS.md`) | ❌ | JCA1221 has no test of any kind |
| Lint wired to anything automatic | ✅ (via `review-lint` + preflight) | ❌ | `npm run lint` exists, nothing calls it |
| Typecheck before merge | ✅ (in the gate) | ⚠ only at Netlify build, post-merge | `tsc -b` runs inside `npm run build` |
| Tier 0 preflight before LLM spawn | ✅ | ❌ | `gates/preflight.js` is foreflux-local |
| Supervised runner with complexity routing | ✅ (`scripts/claude-runner.py`) | ❌ | JCA1221 workers spawn straight from the dispatcher |
| `sdlc-review` review-column agent | ✅ (machine-global, would apply) | ⚠ available but degraded | It would run Step 4 and find no gate → `residual_risk` instead of a verdict |
| CAS merge / merge queue | ✅ | ⚠ machine-global, untested here | `merge_queue.py --repo` would need pointing at this repo |
| Nightly board review + audit | ✅ (foreflux board only) | ❌ | All four cron jobs hardcode `BOARD = "foreflux"` |
| Real CI | ❌ (neither repo has build CI) | ❌ | JCA1221's two workflows only label/close PRs |

**The blocking gap is a gate suite.** Every other reference capability — the
hooks, the preflight router, the review agent's Step 4, the merge queue's
`--check` — is a caller of `gates/run.sh`. Without it they all degrade to
"no automated gate exists", which the review skill explicitly treats as a
`residual_risk` note rather than a rejection. That means a JCA1221 card can be
merged today with a type error in it.

---

## 10. Defects observed during collection

These are live states found while reading, not hypotheticals.

### 10.1 Both reference repos' primary checkouts are stale against HEAD

`git -C F:\Documents\Repositories\hermes-ops status --short`:

```
## main
M  README.md
D  bin/verdict-dryrun.sh
D  fixtures/fable-output-judge.txt
D  fixtures/fable-output-review.txt
D  fixtures/judge-goal-root-brief.md
D  fixtures/review-verdict-brief.md
M  gates/install-skills-version-guard-check.sh
M  gates/run.sh
M  gates/sdlc-review-check.sh
D  gates/verdict-dryrun-check.sh
M  mission_control/cron_render.py
M  skills/sdlc-review/SKILL.md
M  skills/sdlc-review/hermes-skill.toml
```

Those files **exist at `HEAD`** (`git ls-tree -r --name-only HEAD` lists all of
them) and `HEAD:skills/sdlc-review/SKILL.md` says `version: 1.3.1`, while the
file on disk says `1.3.0`. This is precisely the hazard `hermes-ops/README.md`
documents: *"otherwise its index would report every merged file as a staged
deletion, and committing from there would silently revert the merge."* The CAS
merge landed the ref; nobody fast-forwarded the working copy. **Committing from
this checkout would revert the verdict-dryrun harness and downgrade the review
skill.**

`foreflux` is in the same state (`M .hermes.md`, `M CHECKS.md`,
`D case-study.md`, `D docs/evaluator.md`, `D docs/gate-impact.md`, …), which is
why the on-disk `foreflux/gates/` shows only 4 files while `HEAD` has 10.

Fix in both: `git reset --hard HEAD` on the primary checkout (verify nothing
genuinely uncommitted is lost first). `foreflux/gates/git-tree-guard.sh` at HEAD
was written to catch exactly this — but it is one of the files not present on disk.

### 10.2 The review skill's "deterministic" greps are still the broken form

`sdlc-review` SKILL.md Step 4.5 still ships:

```bash
grep -rn 'TODO\|FIXME' -- '*.py' '*.js' '*.ts'
```

`--` ends option parsing, so the globs are read as filenames and the command
exits *"No such file or directory"* — indistinguishable from clean, on every
card. `foreflux/gates/review-lint.js` was written to replace these (its own
header cites the finding), but the skill has not been updated to call it. The
skill is machine-global; the replacement is foreflux-local.

### 10.3 Deployed review skill is newer than its canonical source on disk

| Copy | Version |
|---|---|
| `hermes-ops/skills/sdlc-review/SKILL.md` (on disk, "repo of record") | 1.3.0 |
| `hermes-ops` `HEAD:skills/sdlc-review/SKILL.md` | 1.3.1 |
| `HERMES_HOME/profiles/builder/skills/software-development/sdlc-review/SKILL.md` (deployed) | 1.3.1 |

The deployed copy matches `HEAD` and carries an extra "Dry run / fixtures"
section referencing `bin/verdict-dryrun.sh`, `fixtures/review-verdict-brief.md`,
`fixtures/fable-output-review.txt` and `gates/verdict-dryrun-check.sh` — none of
which exist on disk (they are the `D`-staged files from §10.1). Consequence:
`hermes-ops/gates/sdlc-review-check.sh` on disk asserts `version = "1.3.0"` and
would **fail** against the true HEAD content. Same root cause as §10.1.

### 10.4 The `jca1221` board's `default_workdir` killed this card's first two runs

Runs 1 and 2 of `t_7a6bd06e` both died with:

```
workspace: board 'jca1221' default_workdir '/f/Documents/Repositories/JCA1221-Website'
is not absolute; use an absolute path to a git repo
```

Two failures hit `failure_limit: 2` → `gave_up`. `board.json` now reads
`"default_workdir": "F:/Documents/Repositories/JCA1221-Website"` and run 9
spawned successfully. Recorded here because the MSYS-style `/f/...` path is what
`pwd` prints inside the Bash tool on this machine, so it is easy to reintroduce
when creating another board.

### 10.5 Orphaned worktrees

- `hermes-ops/.worktrees/_review_55586` — an **empty** directory left behind by a
  review scratch worktree (`scratch="$repo/.worktrees/_review_$$"`). It is not
  registered in `git worktree list`, so `worktree remove` ran but the directory
  itself was not unlinked. Cosmetic, but it means `_review_*` dirs accumulate.
- `HERMES_HOME\kanban\boards\foreflux\workspaces\t_8064d29a` — listed by
  `git worktree list` as `prunable`.
- 5 `hermes-ops` and >10 `foreflux` task worktrees still live with their branches.

---

## 11. Complete file index

### Layer A — `C:\Users\USER\AppData\Local\hermes\`

```
config.yaml                                          kanban: dispatcher config (§1)
cron/jobs.json                                       all cron jobs incl. review + audit (§6.3)
kanban/boards/<slug>/board.json                      per-board default_workdir
kanban/boards/<slug>/kanban.db                       tasks, task_runs, task_events
kanban/boards/<slug>/workspaces/                     scratch workspaces
scripts/foreflux_nightly_review.py                   read-only board collector
scripts/foreflux_nightly_review_claude.py            no-agent review wrapper
scripts/nightly_audit.py                             22:00 foreflux digest
scripts/hermes-audit.sh                              02:00 audit digest (deployed copy)
profiles/builder/skills/software-development/sdlc-review/SKILL.md   deployed review agent
profiles/{builder,judge,default,…}/config.yaml       agent profiles
```

### Layer B — `F:\Documents\Repositories\foreflux\`

```
.hermes.md                            agentic engineering rules, runner contract
CHECKS.md                             what each root *-check.js asserts
.claude/settings.json                 PostToolUse + Stop hook wiring
.claude/hooks/gate.js                 hook → gates/run.sh bridge, exit-2 protocol
gates/run.sh                          THE GATE SUITE COMMAND
gates/git-tree-guard.sh  + -test.sh   stale-index guard
gates/syntax.js                       compile-only syntax gate (incl. inline <script>)
gates/invariants.js                   documented decisions as machine-checkable rules
gates/publish.js                      publish-root safety
gates/review-lint.js     + -test.sh   deterministic half of code review
gates/preflight.js                    Tier 0 router (approve/reject/escalate)
gates/evaluate.js                     deterministic evaluator harness
*-check.js (repo root)                behavioural checks, discovered by shape
scripts/claude-runner.py              supervised Claude Code CLI runner
scripts/claude-runner-tests/run.sh    runner test suite
scripts/gate-impact-measure.py        measured gate impact over real cards
docs/preflight.md                     Tier 0 design + measurements
docs/evaluator.md, docs/gate-impact.md
docs/llm-efficiency-audit.md          R1/R2 findings that produced preflight + review-lint
docs/llm-efficiency-synthesis.md      P1 stale-index finding
```

### Layer B — `F:\Documents\Repositories\hermes-ops\`

```
README.md                                    architecture + merge_queue contract
skills/sdlc-review/SKILL.md                  canonical review agent (§6.2)
skills/sdlc-review/hermes-skill.toml         install manifest
bin/install-skills.py                        skill deployer w/ version guard
bin/merge_queue.py                           batch merge bot (§7.3)
bin/goal_sync.py
gates/run.sh                                 this repo's gate suite
gates/sdlc-review-check.sh                   pins skill version + retention markers
gates/install-skills-version-guard-check.sh
audit/hermes-audit.sh                        canonical nightly audit
mission_control/                             dashboard renderer + smoke test
```

### Layer B — `F:\Documents\Repositories\JCA1221-Website\` (this repo)

```
package.json                     scripts: dev, build (tsc -b && vite build), lint (eslint .), preview
eslint.config.js                 ESLint 9 flat config
netlify.toml                     build command + redirects + functions dir
vercel.json                      rewrites + cache headers
.github/workflows/pr-decline.yml inherited template — labels/closes PRs
.github/workflows/stale.yml      inherited template
docs/sdlc-audit/inventory.md     this document
(no gates/, no *-check.js, no .claude/settings.json, no test runner)
```
