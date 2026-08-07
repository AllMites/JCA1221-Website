#!/usr/bin/env node
/* gates/soak.js — long-horizon soak driver for the deterministic gate layer.
 *
 *   node gates/soak.js --cycles 8 --label A     run 8 defect->fix->commit cycles here
 *   node gates/soak.js --cycles 4 --base main   preflight each cycle against another base
 *
 * The question this answers is not "do the gates work" — gates/run.sh proved that on
 * one diff, once. It is "do they still say the same thing on cycle 8 that they said on
 * cycle 1, on a branch that has been growing the whole time". Drift is the failure mode
 * a single green run cannot see: a cache that goes stale, a lint scope that widens as
 * the branch diverges from main, a log that stops being appended to, a tree left dirty
 * by the previous cycle so the next one measures the wrong commit.
 *
 * So every cycle does the same four things and asserts the same invariants:
 *
 *   1. seed  — write a scratch module carrying one unused local. Both tsc
 *              (noUnusedLocals) and eslint (@typescript-eslint/no-unused-vars) must
 *              reject it. Re-seeded every cycle on purpose: a gate is only known to be
 *              strict on the cycle you watched it reject something.
 *   2. fix   — rewrite the module clean; the same gate must now pass.
 *   3. route — node gates/preflight.js; Tier 0 must route `approve` on a green tree.
 *   4. commit — and then assert the tree is clean, the preflight log grew by exactly
 *              one line, and history grew by exactly one commit.
 *
 * Writes soak-report-<label>.json and exits non-zero if any cycle broke an invariant.
 * Runs entirely inside the worktree it is invoked from, so N copies on N branches are
 * N independent runs — which is the parallel-branch claim, tested rather than asserted.
 *
 * ponytail: no framework, no fixtures. Node's assert + spawnSync is the whole harness,
 * and each cycle is a plain function call in a for loop. If a cycle ever needs to run
 * concurrently *within* one branch, that is a different tool, not a flag on this one.
 */
'use strict';
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PREFLIGHT_LOG = '.claude-preflight.log';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? fallback : process.argv[i + 1];
};

const sh = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024, ...opts });

const git = (...args) => sh('git', args).stdout.trim();

/* Both streams: a gate failure's message is the evidence, and tsc writes to stdout
   while eslint's own failures land on stderr. */
const gate = () => {
  const r = sh('sh', ['gates/run.sh'], { timeout: 300000 });
  return { exit: r.status, out: `${r.stdout || ''}${r.stderr || ''}` };
};

const preflight = base => {
  const r = sh('node', ['gates/preflight.js', '--base', base], { timeout: 600000 });
  let route = null;
  try {
    route = JSON.parse(r.stdout).route;
  } catch {
    /* a preflight that cannot even emit its report is itself the finding — the cycle
       records exit + raw output and fails on the route assertion below. */
  }
  return { exit: r.status, route, out: `${r.stdout || ''}${r.stderr || ''}` };
};

const countLines = file => {
  try {
    return fs.readFileSync(path.join(ROOT, file), 'utf8').split('\n').filter(Boolean).length;
  } catch {
    return 0;
  }
};

const clean = (label, n) =>
  `export const cycle = ${n};\n\nexport function soakLabel(): string {\n  return '${label}-${n}';\n}\n`;

/* One unused local, nothing else: the smallest edit both halves of the suite must
   independently reject, so a cycle where only one of them fires is still a red flag
   the evidence records (which_tool below). */
const defect = (label, n) =>
  `export const cycle = ${n};\n\nexport function soakLabel(): string {\n  const unusedByDesign = ${n};\n  return '${label}-${n}';\n}\n`;

function runCycle({ label, n, base, baselineCommits }) {
  const rel = `src/soak/${label}-cycle-${n}.ts`;
  const file = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });

  fs.writeFileSync(file, defect(label, n), 'utf8');
  const seeded = gate();

  fs.writeFileSync(file, clean(label, n), 'utf8');
  const fixed = gate();

  const routed = preflight(base);

  /* Only the scratch dir, never `git add -A`: the first run of this harness redirected
     its own stdout into the worktree, `-A` committed that file in cycle 1, and node's
     4 KB stdout buffer flushed into it again during cycle 8 — so the tree was dirty at
     the check and the cycle failed. The gate assertion was right; the harness was
     staging a file it was still writing. Commit what the cycle authored, nothing else. */
  sh('git', ['add', 'src/soak']);
  /* deliberately not --no-verify: the pre-commit hook runs gates/run.sh a second time,
     which is the point — the per-commit stage is part of what has to still be there on
     cycle 8, and the only way to see it is to let it fire every cycle. */
  const commit = sh('git', ['commit', '-m', `soak(${label}): cycle ${n}`]);

  /* Tracked modifications only. An untracked file in the worktree is somebody's
     scratch, not branch state the gate is responsible for; a *modified tracked* file
     after a commit means the cycle left the tree describing a different commit than
     HEAD, which is exactly the staleness gates/git-tree-guard.sh exists to catch. */
  const dirty = git('status', '--porcelain', '--untracked-files=no');
  const commits = Number(git('rev-list', '--count', 'HEAD'));
  const logLines = countLines(PREFLIGHT_LOG);

  const checks = {
    /* the gate rejected the seeded defect */
    defect_rejected: seeded.exit !== 0,
    /* ...and named it — a non-zero exit for some unrelated reason is not the same test */
    defect_named: /no-unused-vars|TS6133|unusedByDesign/.test(seeded.out),
    /* both halves of the suite fired, not just the fast one */
    typecheck_fired: /TS6133/.test(seeded.out),
    lint_fired: /no-unused-vars/.test(seeded.out),
    /* the fix cleared it */
    fix_accepted: fixed.exit === 0,
    /* Tier 0 routes a green tree to approve, with no model spawned */
    routed_approve: routed.route === 'approve' && routed.exit === 0,
    /* no state lost: tree clean, log appended once, history advanced once */
    tree_clean_after_commit: dirty === '',
    commit_landed: commit.status === 0,
    history_advanced: commits === baselineCommits + n,
    /* the log is the loop's memory across cycles; one preflight call, one line */
    preflight_log_appended: logLines === n,
  };

  return {
    cycle: n,
    file: rel,
    head: git('rev-parse', '--short', 'HEAD'),
    seeded_exit: seeded.exit,
    fixed_exit: fixed.exit,
    preflight_route: routed.route,
    preflight_exit: routed.exit,
    commits,
    preflight_log_lines: logLines,
    dirty,
    checks,
    failures: Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k),
    /* kept only when something broke: a passing soak should not ship 8 copies of a
       gate's stdout, and a failing one is unreadable without them. */
    evidence: undefined,
    _evidence: { seeded: seeded.out, fixed: fixed.out, routed: routed.out },
  };
}

function main() {
  const cycles = Number(arg('--cycles', 5));
  const label = arg('--label', 'soak');
  const base = arg('--base', 'main');

  const branch = git('rev-parse', '--abbrev-ref', 'HEAD');
  const baselineCommits = Number(git('rev-list', '--count', 'HEAD'));
  const startedAt = Date.now();

  const results = [];
  for (let n = 1; n <= cycles; n++) {
    const r = runCycle({ label, n, base, baselineCommits });
    if (r.failures.length) r.evidence = r._evidence;
    delete r._evidence;
    results.push(r);
    console.log(
      `cycle ${n}/${cycles}  seed=${r.seeded_exit} fix=${r.fixed_exit} ` +
      `route=${r.preflight_route} head=${r.head} ${r.failures.length ? `FAIL ${r.failures.join(',')}` : 'ok'}`
    );
  }

  const failures = results.flatMap(r => r.failures.map(f => `cycle ${r.cycle}: ${f}`));
  const report = {
    schema: 'hermes.soak.v1',
    label,
    branch,
    base,
    cycles,
    baseline_commits: baselineCommits,
    duration_ms: Date.now() - startedAt,
    passed: failures.length === 0,
    failures,
    results,
  };
  const out = path.join(ROOT, `soak-report-${label}.json`);
  fs.writeFileSync(out, JSON.stringify(report, null, 2), 'utf8');
  console.log(`${report.passed ? 'PASS' : 'FAIL'} — ${cycles} cycles on ${branch} in ${report.duration_ms}ms → ${out}`);
  process.exit(report.passed ? 0 : 1);
}

if (require.main === module) main();

module.exports = { runCycle, clean, defect };
