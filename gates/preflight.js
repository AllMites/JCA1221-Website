#!/usr/bin/env node
/* gates/preflight.js — Tier 0 of the verdict pyramid: everything decidable by code,
   run *before* any LLM session is spawned, and a route out of it.

     node gates/preflight.js                    preflight this worktree against main
     node gates/preflight.js --base <ref>       another base ref
     node gates/preflight.js --cwd <dir>        preflight a different worktree
     node gates/preflight.js --pretty           the same routing decision, for a human

   Exit 0 = approve · 1 = reject · 2 = escalate (ask a model). Stdout is one JSON
   object, `schema: hermes.preflight.v1`, suitable for posting to a kanban card or
   handing to a worker as a rejection payload.

   docs/llm-efficiency-audit.md §R1 measured what this replaces: a card whose gates
   were already red still cost a full review session (10⁶–10⁷ tokens, ~211 s median)
   to discover an exit code a script could read in ~8 s. The cheapest token is the
   session never started, so the ordering is the whole design — deterministic first,
   model last, and only for the residue.

   The route is a mapping, not a judgment:

     evaluate verdict   route      what the caller does
     ----------------   --------   ---------------------------------------------
     pass               approve    merge; no LLM session
     fail               reject     hand probes[] back to the worker; no LLM session
     inconclusive       escalate   spawn the model, on this evidence only

   `escalate` is load-bearing and is also the failure mode. A missing binary, a blown
   timeout, an unreadable spec, a base ref that does not exist — every way this layer
   can fail to answer resolves to `escalate`, never to `reject`. A gate that cannot
   run must not be able to block green work; that is exactly the failure this layer
   exists to remove (8 of 33 blocks on this board were a *second* LLM being rate
   limited, not a defect). The bias costs one model call in the ambiguous case and
   buys the guarantee that Tier 0 can never be the thing that stops a good card.

   Composition, not new rules: the probes are gates/review-lint.js (audit R2) and the
   repo's own gates/run.sh, run through gates/evaluate.js (audit's evaluator harness).
   Adding a check means adding a probe below, not logic to this file. */
'use strict';
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { evaluate, verdictOf, summarize } = require('./evaluate.js');

const ROOT = path.resolve(__dirname, '..');
const SCHEMA = 'hermes.preflight.v1';
const LOG_NAME = '.claude-preflight.log';

const ROUTE = { pass: 'approve', fail: 'reject', inconclusive: 'escalate' };
const EXIT = { approve: 0, reject: 1, escalate: 2 };

/* The questions worth asking before anything expensive is spawned: does the base ref
   exist, is there work here at all, does the code an agent just wrote survive a
   mechanical read, and does the repo's own gate layer accept it.

   review-lint runs from *this* checkout with `--root` pointed at the target, rather than
   from the target's own copy: the gate must be the same code on every card, and a
   worktree that happens not to carry gates/review-lint.js would otherwise fail to lint
   and — worse — that absence would arrive as a non-zero exit, i.e. as a rejection.
   gates/run.sh is the opposite case and is deliberately the target's own: it is that
   repo's definition of done, not ours. */
function preflightSpec(base, cwd) {
  return [
    /* Asked first and separately, because every other probe silently degrades when the
       base is wrong: review-lint reports "0 files, clean", and a typo'd ref would read as
       approval. A base that does not resolve is a broken request, not a judgement. */
    {
      id: 'base-ref',
      kind: 'command',
      cmd: 'git',
      args: ['rev-parse', '--verify', '--quiet', `${base}^{commit}`],
      inconclusive_exit: [1, 128],
    },
    /* Working tree, staged and committed alike — the same view review-lint takes, and it
       has to be: the two probes answering "is there work here" with different definitions
       is how a card gets linted and rejected on files the diff probe called absent. An
       empty branch is a question about the request, so it lands on inconclusive. */
    {
      id: 'work-present',
      kind: 'command',
      cmd: 'sh',
      args: ['-c', `test -n "$(git status --porcelain --untracked-files=all)$(git diff --name-only ${base}...HEAD)"`],
      inconclusive_exit: [1, 127],
    },
    /* Runs gates/review-lint.js from *this* checkout (an absolute path), not the
       target's own copy — the rule set has to be identical on every card, and a
       worktree that happens not to carry gates/review-lint.js must not turn a
       missing tool into a rejection. exit 2 is review-lint's own "cannot answer"
       code (bad base ref, root is not a git repo). */
    {
      id: 'review-lint',
      kind: 'command',
      cmd: 'node',
      args: [path.resolve(__dirname, 'review-lint.js'), '--diff', base, `--root=${cwd}`],
      inconclusive_exit: [2],
    },
    {
      id: 'gates',
      kind: 'command',
      cmd: 'sh',
      /* 127 is "no gates/run.sh here" (or no sh). A repo with no gate layer has not
         failed its gate layer. */
      args: ['gates/run.sh'],
      inconclusive_exit: [127],
      timeout_ms: 300000,
    },
  ];
}

/* Slim on purpose: the log is a timeline, not an archive. Full evidence lives in the
   stdout report the caller already has; a per-probe reason is enough to answer "why did
   this card skip the model" months later without re-running anything. */
function logLine(report, cwd) {
  return {
    ts: new Date().toISOString(),
    schema: SCHEMA,
    route: report.route,
    verdict: report.verdict,
    llm_skipped: report.llm_skipped,
    base: report.base,
    cwd,
    duration_ms: report.duration_ms,
    summary: report.summary,
    probes: report.probes.map(p => ({
      id: p.id, status: p.status, exit_code: p.exit_code, duration_ms: p.duration_ms, reason: p.reason,
    })),
  };
}

/* Append-only, and never fatal. A preflight that refused to route because its own
   audit log was read-only would be the gate blocking work again, one level down. */
function appendLog(cwd, report) {
  const file = path.join(cwd, LOG_NAME);
  try {
    fs.appendFileSync(file, JSON.stringify(logLine(report, cwd)) + '\n', 'utf8');
    return file;
  } catch {
    return null;
  }
}

/* A base that was already red poisons the `gates` probe for every branch built on it:
   old main 354cfa5 shipped a failing check, so any branch preflighted against it
   routed gates -> fail -> reject even when the branch's own diff was clean. The probe
   above answers "does this checkout pass its own gate layer", which cannot tell a
   regression the branch introduced from one it merely inherited — so when it fails,
   this asks the same question of the base, on a throwaway extraction (git archive, no
   checkout, nothing in any worktree touched) rather than trusting a stale exit code. */
function runBaseGates(base, cwd, timeoutMs) {
  let tmpDir;
  try {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'preflight-base-'));
  } catch (e) {
    return { available: false, reason: `could not create a scratch dir: ${e.message}` };
  }
  try {
    const archive = spawnSync('git', ['archive', '--format=tar', base], { cwd, maxBuffer: 64 * 1024 * 1024 });
    if (archive.error || archive.status !== 0) {
      return { available: false, reason: `git archive ${base} failed` };
    }
    const extract = spawnSync('tar', ['-x', '-C', tmpDir], { input: archive.stdout, maxBuffer: 64 * 1024 * 1024 });
    if (extract.error || extract.status !== 0) {
      return { available: false, reason: 'extracting the base tree failed' };
    }
    const run = spawnSync('sh', ['gates/run.sh'], {
      cwd: tmpDir, timeout: timeoutMs, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
    });
    if (run.error) return { available: false, reason: `base gates/run.sh could not run: ${run.error.message}` };
    /* 127 is "no gates/run.sh on the base" — the same inconclusive case the probe
       itself carries, and just as much not the branch's fault either way. */
    if (run.status === 127) return { available: true, status: 'inconclusive' };
    return { available: true, status: run.status === 0 ? 'pass' : 'fail' };
  } finally {
    try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { /* best-effort: a locked scratch dir must not fail the route */ }
  }
}

/* Only ever softens a verdict — a base-compare that could launder a real regression
   would be worse than the bug it fixes. Runs once, only on the `gates` probe's own
   failure path, so a healthy base costs nothing extra. */
function reconcileGatesAgainstBase(report, base, cwd, timeoutMs) {
  const gates = report.probes.find(p => p.id === 'gates');
  if (!gates || gates.status !== 'fail') return report;
  const baseResult = runBaseGates(base, cwd, timeoutMs);
  if (!baseResult.available || baseResult.status !== 'fail') return report;
  gates.status = 'inconclusive';
  gates.reason = `${gates.reason} — base ${base} is also red on gates/run.sh, so this is not a regression the branch introduced`;
  const verdict = verdictOf(report.probes);
  const { counts, summary } = summarize(verdict, report.probes);
  return { ...report, verdict, counts, summary };
}

function preflight(opts = {}) {
  const base = opts.base || 'main';
  const cwd = path.resolve(opts.cwd || ROOT);
  const started = Date.now();
  let report;
  try {
    report = evaluate(preflightSpec(base, cwd), { cwd });
  } catch (e) {
    /* evaluate() spawns rather than throws, so reaching here means this layer itself is
       broken — which is still "no answer", not "no". */
    report = {
      verdict: 'inconclusive',
      counts: { pass: 0, fail: 0, inconclusive: 1 },
      summary: `verdict=inconclusive — preflight could not run: ${e.message}`,
      probes: [{
        id: 'preflight', kind: 'command', status: 'inconclusive', exit_code: null,
        duration_ms: 0, reason: `preflight could not run: ${e.message}`,
        evidence: '', evidence_truncated: false,
      }],
    };
  }
  report = reconcileGatesAgainstBase(report, base, cwd, 300000);
  const route = ROUTE[report.verdict] || 'escalate';
  return {
    schema: SCHEMA,
    route,
    llm_needed: route === 'escalate',
    llm_skipped: route !== 'escalate',
    exit_code: EXIT[route],
    verdict: report.verdict,
    base,
    duration_ms: Date.now() - started,
    counts: report.counts,
    summary: `route=${route} — ${report.summary}`,
    probes: report.probes,
  };
}

function pretty(report) {
  const mark = { pass: 'PASS', fail: 'FAIL', inconclusive: '????' };
  const lines = report.probes.map(p => `  ${mark[p.status]}  ${p.id} (${p.duration_ms}ms) — ${p.reason}`);
  const verdictLine = report.llm_skipped
    ? `  → LLM skipped (${report.route})`
    : '  → escalating to the model: the evidence above does not decide it';
  return [report.summary, ...lines, verdictLine].join('\n');
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  const flag = name => {
    const i = argv.indexOf(name);
    return i === -1 ? null : argv[i + 1];
  };
  const cwd = path.resolve(flag('--cwd') || ROOT);
  const report = preflight({ base: flag('--base') || 'main', cwd });
  if (!argv.includes('--no-log')) appendLog(cwd, report);
  console.log(argv.includes('--pretty') ? pretty(report) : JSON.stringify(report, null, 2));
  process.exit(report.exit_code);
}

module.exports = {
  preflight, preflightSpec, pretty, appendLog, logLine, ROUTE, EXIT, SCHEMA, LOG_NAME,
  runBaseGates, reconcileGatesAgainstBase,
};
