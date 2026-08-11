/* gates/evaluate.js — the deterministic evaluator harness.

     node gates/evaluate.js                     the default probe set for this repo
     node gates/evaluate.js --spec probes.json  a caller-supplied probe set
     node gates/evaluate.js --pretty            the same verdict, for a human

   Exit 0 = pass, 1 = fail, 2 = inconclusive. Stdout is one JSON object
   (`schema: hermes.evaluate.v1`) meant to be posted to a kanban card verbatim.

   Why this exists: docs/llm-efficiency-audit.md measured the review loop and found a
   ~2 KB merge decision being produced by a 10⁶–10⁷-token agent session, most of it
   spent re-deriving an exit code that a script already knew. This is the tier that
   knows the exit code. It runs no model and imports nothing outside node's stdlib, so
   the same input gives the same verdict on every machine and in every session.

   The third outcome is the load-bearing one. A binary pass/fail forces a harness to
   lie when a probe could not run — a missing binary, a timeout, a snapshot with no
   baseline recorded yet. Those are "this evidence does not decide the question", and
   collapsing them into `fail` is how green work gets blocked (8 of 33 blocks on this
   board were a *second* LLM being rate-limited). `inconclusive` is the signal that a
   judgment call is genuinely needed and only then is a model worth spawning.

   Adding a probe means adding a line of JSON, not a rule to this file — the two kinds
   below (an exit code, a snapshot) cover everything the audit asked for, and a third
   kind should have to justify itself against `{cmd, args, expect_exit}`. */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SCHEMA = 'hermes.evaluate.v1';
const EVIDENCE_LIMIT = 2000;
const DEFAULT_TIMEOUT_MS = 120000;
const EXIT = { pass: 0, fail: 1, inconclusive: 2 };

/* The tail, not the head: a check that fails prints its assertion last. Truncation is
   declared in the payload so a reader never mistakes a clipped log for the whole one. */
function evidenceOf(output, limit = EVIDENCE_LIMIT) {
  const text = String(output || '');
  if (text.length <= limit) return { evidence: text, evidence_truncated: false };
  return { evidence: text.slice(text.length - limit), evidence_truncated: true };
}

/* CRLF and a trailing newline are checkout artefacts, not content. This repo runs on
   Windows and on CI; a snapshot that fails on line endings alone is noise. */
const normalize = s => String(s).replace(/\r\n/g, '\n').replace(/\s+$/, '');

function firstDifference(want, got) {
  const a = want.split('\n');
  const b = got.split('\n');
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) {
      return `line ${i + 1}:\n  expected: ${a[i] === undefined ? '<end of file>' : a[i]}\n  actual:   ${b[i] === undefined ? '<end of file>' : b[i]}`;
    }
  }
  return '';
}

function snapshotResult(probe, base, result, output, cwd) {
  const rel = probe.expect_file;
  const file = path.resolve(cwd, rel);
  if (!fs.existsSync(file)) {
    return { ...base, status: 'inconclusive', reason: `no baseline at ${rel} — record one to make this probe decisive`, ...evidenceOf(output) };
  }
  const expected = probe.expect_exit === undefined ? 0 : probe.expect_exit;
  if (result.status !== expected) {
    return { ...base, status: 'fail', reason: `exit ${result.status}, expected ${expected} — nothing to compare`, ...evidenceOf(output) };
  }
  const want = normalize(fs.readFileSync(file, 'utf8'));
  const got = normalize(result.stdout);
  if (want === got) return { ...base, status: 'pass', reason: `output matches ${rel}`, ...evidenceOf('') };
  return { ...base, status: 'fail', reason: `output differs from ${rel}`, ...evidenceOf(firstDifference(want, got)) };
}

function exitResult(probe, base, output) {
  const expected = probe.expect_exit === undefined ? 0 : probe.expect_exit;
  const undecided = probe.inconclusive_exit || [];
  if (base.exit_code === expected) {
    return { ...base, status: 'pass', reason: `exit ${base.exit_code}`, ...evidenceOf(output) };
  }
  if (undecided.includes(base.exit_code)) {
    return { ...base, status: 'inconclusive', reason: `exit ${base.exit_code} is declared inconclusive by the spec`, ...evidenceOf(output) };
  }
  return { ...base, status: 'fail', reason: `exit ${base.exit_code}, expected ${expected}`, ...evidenceOf(output) };
}

/* One probe, one verdict. Every path out of here carries a `reason` in English, because
   the reason is what gets posted to the card — a status with no reason sends the reader
   back to the logs, which is the cost this harness exists to remove. */
function runProbe(probe, opts = {}) {
  const cwd = path.resolve(opts.cwd || ROOT, probe.cwd || '.');
  const timeout = probe.timeout_ms || DEFAULT_TIMEOUT_MS;
  const started = Date.now();
  const result = spawnSync(probe.cmd, probe.args || [], {
    cwd, timeout, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
  });
  const base = {
    id: probe.id,
    kind: probe.kind || 'command',
    exit_code: result.status,
    duration_ms: Date.now() - started,
  };
  const output = `${result.stdout || ''}${result.stderr || ''}`;

  /* Could-not-run is not did-not-pass. A missing binary or a blown timeout says nothing
     about the code under test, so it must not read as a rejection. */
  if (result.error) {
    const code = result.error.code;
    const reason = code === 'ENOENT' ? `command not found: ${probe.cmd}`
      : code === 'ETIMEDOUT' ? `timed out after ${timeout}ms`
      : `${code || 'spawn failed'}: ${result.error.message}`;
    return { ...base, status: 'inconclusive', reason, ...evidenceOf(output) };
  }
  if (result.signal) {
    return { ...base, status: 'inconclusive', reason: `killed by ${result.signal}`, ...evidenceOf(output) };
  }
  if (base.kind === 'snapshot') return snapshotResult(probe, base, result, output, cwd);
  return exitResult(probe, base, output);
}

/* fail beats inconclusive beats pass, and an empty spec is inconclusive rather than a
   free pass — "nothing was checked" is the one answer a harness must never round up. */
function verdictOf(probes) {
  if (!probes.length) return 'inconclusive';
  if (probes.some(p => p.status === 'fail')) return 'fail';
  if (probes.some(p => p.status === 'inconclusive')) return 'inconclusive';
  return 'pass';
}

function summarize(verdict, probes) {
  const counts = { pass: 0, fail: 0, inconclusive: 0 };
  probes.forEach(p => { counts[p.status]++; });
  const named = s => probes.filter(p => p.status === s).map(p => p.id).join(', ');
  const parts = [`${counts.pass} pass, ${counts.fail} fail, ${counts.inconclusive} inconclusive`];
  if (counts.fail) parts.push(`fail: ${named('fail')}`);
  if (counts.inconclusive) parts.push(`inconclusive: ${named('inconclusive')}`);
  return { counts, summary: `verdict=${verdict} — ${parts.join('; ')}` };
}

function evaluate(spec, opts = {}) {
  const probes = (spec || []).map(p => runProbe(p, opts));
  const verdict = verdictOf(probes);
  const { counts, summary } = summarize(verdict, probes);
  return { schema: SCHEMA, verdict, exit_code: EXIT[verdict], counts, summary, probes };
}

/* The default set answers the two questions worth asking before anything expensive is
   spawned: is there work here, and does the repo's own gate layer accept it. A secret
   scan and a lint pass belong here too — gates/preflight.js's own spec adds
   gates/review-lint.js as a third probe, not as more code in this file. */
function defaultSpec(base = 'main') {
  return [
    /* Inverted on purpose: `--quiet` exits 1 when a diff exists, and that is the healthy
       case. Exit 0 means an empty branch and 128 means the base ref is missing — both are
       questions about the request, not answers about the code. */
    { id: 'diff-nonempty', kind: 'command', cmd: 'git', args: ['diff', '--quiet', `${base}...HEAD`], expect_exit: 1, inconclusive_exit: [0, 128] },
    { id: 'gates', kind: 'command', cmd: 'sh', args: ['gates/run.sh'], timeout_ms: 300000 },
  ];
}

function pretty(report) {
  const mark = { pass: 'PASS', fail: 'FAIL', inconclusive: '????' };
  const lines = report.probes.map(p => `  ${mark[p.status]}  ${p.id} (${p.duration_ms}ms) — ${p.reason}`);
  return [report.summary, ...lines].join('\n');
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  const flag = name => {
    const i = argv.indexOf(name);
    return i === -1 ? null : argv[i + 1];
  };
  const specFile = flag('--spec');
  let report;
  try {
    const spec = specFile ? JSON.parse(fs.readFileSync(specFile, 'utf8')) : defaultSpec(flag('--base') || 'master');
    report = evaluate(spec, { cwd: flag('--cwd') || ROOT });
  } catch (e) {
    /* An unreadable spec is the same class of event as a missing binary: the run never
       happened, so it cannot be a rejection. Crashing here would exit 1 and read as
       `fail` to a caller that only sees the exit code — the exact confusion this
       harness exists to remove. */
    report = evaluate([]);
    report.probes = [{ id: 'spec', kind: 'command', status: 'inconclusive', exit_code: null, duration_ms: 0, reason: `spec could not be read: ${e.message}`, evidence: '', evidence_truncated: false }];
    report.counts = { pass: 0, fail: 0, inconclusive: 1 };
    report.summary = `verdict=inconclusive — 0 pass, 0 fail, 1 inconclusive; inconclusive: spec`;
  }
  console.log(argv.includes('--pretty') ? pretty(report) : JSON.stringify(report, null, 2));
  process.exit(report.exit_code);
}

module.exports = { evaluate, runProbe, verdictOf, summarize, defaultSpec, pretty, SCHEMA, EXIT, EVIDENCE_LIMIT };
