#!/usr/bin/env node
/* gates/review-lint.js — the deterministic half of a code review, for code an agent
   just wrote. Ported from foreflux@19db4c5's gates/review-lint.js (see
   docs/foreflux-reference.md §2.3) — the approach, not the file: this repo is a
   Vite/React/TS app, not foreflux's served-flat-HTML site, so the HTML- and
   Python-specific rules (`except-pass`, the `<script src>` resolution branch, the
   Python syntax pre-check) are dropped rather than ported, and the rule set below
   is the 7 that map onto this repo's actual file types.

     node gates/review-lint.js <file>...
     node gates/review-lint.js --diff [ref]            # default ref: main
     node gates/review-lint.js --diff main --root=DIR  # the preflight shape
     node gates/review-lint.js --fail-on=high|medium|low|none

   JSON on stdout, always — the caller is a script. A short human summary goes to
   stderr. Exit 1 when anything at or above --fail-on (default: medium) is found,
   exit 2 when this gate cannot answer the question at all (bad base ref, root is
   not a git repo) — "no answer, not no", the same rule gates/preflight.js applies
   to its own probes. Exit 0 otherwise.

   --diff fixes a bug foreflux shipped and later quantified in its own synthesis
   doc: 2 of 4 remaining false-positive rejects in its measured sample were
   review-lint scanning whole files instead of the lines a diff actually touched.
   Here, --diff computes each file's changed line ranges from `git diff -U0 <ref>
   -- <file>` (the "+" side of every @@ hunk header) and every finding is dropped
   unless its line falls inside one of those ranges. A brand-new untracked file has
   no ref-side history to hunk against, so its ranges are unrestricted (the whole
   file is "changed"). Direct file-list invocation (no --diff) also scans whole
   files on purpose — there is no diff to scope to when the caller names files
   itself.

   Adding a rule: it goes here only if two people would agree on the verdict
   without discussing it — the same gate-adoption rule gates/invariants.js states.
   Anything arguable is a review comment, not a gate. */
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const SEV = { low: 1, medium: 2, high: 3 };

/* Extensions this repo actually ships and this gate can reason about. No .html?/.py —
   this repo has neither raw HTML logic nor a Python surface (see docs/foreflux-reference.md
   §8 and the alignment plan's gap table). */
const LINTABLE = /\.(m?js|cjs|ts|tsx|jsx|css)$/i;

const SKIP_DIR = /(?:^|\/)(?:node_modules|\.worktrees|\.git|\.claude|dist)(?:\/|$)/;

/* Tools print for a living — console.log in gates/ or a *-check.js is its output,
   not a leftover debug line. */
const IS_TOOLING = rel => /^(?:gates|scripts)\//.test(rel) || /-check\.js$/i.test(rel);

const lineAt = (src, idx) => src.slice(0, idx).split('\n').length;

/* Comments blanked, not deleted, so an offset into the stripped text is the same
   offset (and line) into the raw one — otherwise a rule flags its own explanation. */
const blank = m => m.replace(/[^\n]/g, ' ');
const stripComments = src => src
  .replace(/\/\*[\s\S]*?\*\//g, blank)
  .replace(/(^|[^:\w])(\/\/[^\n]*)/g, (m, p, c) => p + blank(c));

const stripJsStrings = src => src
  .replace(/'(?:\\.|[^'\\\n])*'/g, blank)
  .replace(/"(?:\\.|[^"\\\n])*"/g, blank)
  .replace(/`(?:\\.|[^`\\])*`/g, blank);

/* True when the raw source at this match held a comment the stripper blanked out —
   i.e. the author wrote down why the block is empty. */
const wasCommented = (src, m) => src.slice(m.index, m.index + m[0].length) !== m[0];

function* scan(re, src) {
  let m;
  re.lastIndex = 0;
  while ((m = re.exec(src)) !== null) yield m;
}

/* ------------------------------------------------------------------ rules */

const RULES = [
  {
    id: 'unresolved-import',
    severity: 'high',
    why: 'A relative import naming a file that is not there — the generated-code failure this catches is a helper the model was sure it had already written.',
    applies: rel => /\.(m?js|cjs|ts|tsx|jsx)$/i.test(rel),
    run(src, rel, ctx) {
      const dir = path.dirname(path.join(ctx.root, rel));
      const out = [];
      const missing = (spec, idx, kind) => {
        const base = path.resolve(dir, spec);
        const tries = [
          base, `${base}.js`, `${base}.mjs`, `${base}.cjs`, `${base}.ts`, `${base}.tsx`, `${base}.jsx`,
          path.join(base, 'index.js'), path.join(base, 'index.ts'), path.join(base, 'index.tsx'),
        ];
        if (tries.some(t => fs.existsSync(t))) return;
        out.push({ line: lineAt(src, idx), message: `${kind} "${spec}" resolves to nothing on disk` });
      };
      const clean = stripComments(src);
      for (const m of scan(/\brequire\s*\(\s*['"](\.[^'"]*)['"]\s*\)/g, clean)) missing(m[1], m.index, 'require');
      for (const m of scan(/\bfrom\s+['"](\.[^'"]*)['"]/g, clean)) missing(m[1], m.index, 'import');
      for (const m of scan(/\bimport\s*\(\s*['"](\.[^'"]*)['"]\s*\)/g, clean)) missing(m[1], m.index, 'import()');
      return out;
    },
  },
  {
    id: 'secret',
    severity: 'high',
    why: 'A secret in the diff is always high severity and blocks the merge path regardless of what else the verdict finds.',
    applies: () => true,
    run(src) {
      const out = [];
      /* Decoded, not grepped — this repo commits its Supabase anon key by design and
         must keep doing so; the anon and service-role keys differ only in one claim
         inside the payload. Same rule as gates/invariants.js's no-hardcoded-secret,
         for code that is not in the shipped root yet. */
      for (const m of scan(/\beyJ[A-Za-z0-9_-]{8,}\.(eyJ[A-Za-z0-9_-]{8,})\.[A-Za-z0-9_-]+/g, src)) {
        let role = '';
        try { role = JSON.parse(Buffer.from(m[1], 'base64url').toString('utf8')).role || ''; } catch { /* unreadable payload — the literal-assignment rule below still covers it */ }
        if (role && role !== 'anon') out.push({ line: lineAt(src, m.index), message: `JWT with role "${role}" — only the anon key may be committed` });
      }
      for (const [re, what] of [
        [/\bAKIA[0-9A-Z]{16}\b/g, 'AWS access key id'],
        [/\bgh[pousr]_[A-Za-z0-9]{30,}\b/g, 'GitHub token'],
        [/\bsk-(?:ant-)?[A-Za-z0-9_-]{24,}\b/g, 'API secret key'],
        [/-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----/g, 'private key block'],
      ]) for (const m of scan(re, src)) out.push({ line: lineAt(src, m.index), message: `${what} in the diff` });

      const PLACEHOLDER = /^(?:x{3,}|\.{3,}|<.*>|\$\{.*\}|%s|.*(?:your|example|placeholder|changeme|dummy|redacted|process\.env|os\.environ|import\.meta\.env).*)$/i;
      const assign = /\b([A-Z_]*(?:SECRET|PASSWORD|PASSWD|API_KEY|ACCESS_KEY|PRIVATE_KEY|SERVICE_ROLE_KEY|AUTH_TOKEN)[A-Z_]*)\s*[:=]\s*["']([^"']{8,})["']/gi;
      for (const m of scan(assign, stripComments(src))) {
        if (PLACEHOLDER.test(m[2])) continue;
        out.push({ line: lineAt(src, m.index), message: `${m[1]} assigned a literal value` });
      }
      return out;
    },
  },
  {
    id: 'empty-catch',
    severity: 'medium',
    why: 'Swallowed errors — an empty catch turns a failure into a screen that looks correct.',
    applies: rel => /\.(m?js|cjs|ts|tsx|jsx)$/i.test(rel),
    run(src) {
      const out = [];
      const clean = stripJsStrings(stripComments(src));
      for (const m of scan(/\bcatch\s*(?:\([^)]*\))?\s*\{\s*\}/g, clean)) {
        if (wasCommented(src, m)) continue;
        out.push({ line: lineAt(src, m.index), message: 'empty catch block — the error is discarded with no note of why' });
      }
      return out;
    },
  },
  {
    id: 'todo-marker',
    severity: 'low',
    why: 'Leftover placeholders. Low, because a tracked TODO is a normal thing to write; it is only evidence when it arrives inside a card that claims to be finished. Exempt inside gates/scripts and *-check.js, which have to name these markers in prose to describe what they hunt.',
    applies: rel => !IS_TOOLING(rel),
    run(src) {
      return [...scan(/\b(TODO|FIXME|XXX|HACK)\b/g, src)]
        .map(m => ({ line: lineAt(src, m.index), message: `${m[1]} marker` }));
    },
  },
  {
    id: 'debug-output',
    severity: 'low',
    why: 'Stray console.log. Exempt inside gates/scripts and *-check.js, where printing is the output.',
    applies: rel => /\.(m?js|cjs|ts|tsx|jsx)$/i.test(rel) && !IS_TOOLING(rel),
    run(src) {
      const clean = stripComments(src);
      return [...scan(/\b(console\.log)\s*\(/g, clean)].map(m => ({ line: lineAt(clean, m.index), message: `stray ${m[1]}(` }));
    },
  },
  {
    id: 'raw-hex',
    severity: 'low',
    why: 'DESIGN.md\'s token system — advisory here, over stylesheets only, because a colour typed into a new file is the moment it is cheap to fix. gates/invariants.js does not enforce this repo-wide: DesignPage.tsx\'s Tailwind swatch table is deliberately raw hex.',
    applies: rel => /\.css$/i.test(rel),
    run(src) {
      const clean = stripComments(src).replace(/:root\s*\{[^}]*\}/g, blank);
      return [...scan(/(^|[^"'=\w])#([0-9a-fA-F]{3,8})\b(?=[\s;,)}]|$)/gm, clean)]
        .map(m => ({ line: lineAt(clean, m.index), message: `raw hex #${m[2]} outside :root` }));
    },
  },
  {
    id: 'whitespace',
    severity: 'low',
    why: 'Trailing whitespace and a missing final newline — both of which a diff shows as noise on the next person\'s unrelated edit.',
    applies: () => true,
    run(src) {
      const out = [];
      src.split('\n').forEach((l, i) => {
        if (/[ \t]+\r?$/.test(l) && l.trim() !== '') out.push({ line: i + 1, message: 'trailing whitespace' });
      });
      if (src.length && !src.endsWith('\n')) out.push({ line: src.split('\n').length, message: 'no newline at end of file' });
      return out;
    },
  },
];

/* ------------------------------------------------------------- diff ranges */

/* Untracked (brand-new) file: nothing on the ref side to hunk against, so the whole
   file counts as changed. `null` means "unrestricted" throughout this file. */
function changedRanges(ref, root, rel) {
  const raw = execFileSync('git', ['diff', '-U0', ref, '--', rel], { cwd: root, encoding: 'utf8' });
  const ranges = [];
  const HUNK_RE = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm;
  let m;
  while ((m = HUNK_RE.exec(raw)) !== null) {
    const start = parseInt(m[1], 10);
    const count = m[2] === undefined ? 1 : parseInt(m[2], 10);
    if (count === 0) continue; // pure deletion — nothing added to flag
    ranges.push([start, start + count - 1]);
  }
  return ranges;
}

const inRanges = (line, ranges) => ranges === null || ranges.some(([a, b]) => line >= a && line <= b);

/* ------------------------------------------------------------------- main */

function parseArgs(argv) {
  const opts = { files: [], diff: null, mode: 'files', failOn: 'medium', root: path.resolve(__dirname, '..') };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--diff') {
      opts.mode = 'diff';
      const next = argv[i + 1];
      opts.diff = (next && !next.startsWith('-')) ? (i++, next) : 'main';
    } else if (a.startsWith('--fail-on=')) {
      opts.failOn = a.slice(10);
    } else if (a.startsWith('--root=')) {
      opts.root = path.resolve(a.slice(7));
    } else if (a === '--help' || a === '-h') {
      opts.help = true;
    } else if (!a.startsWith('-')) {
      opts.files.push(a);
    } else {
      opts.bad = a;
    }
  }
  return opts;
}

/* Working tree against ref, not HEAD against ref: a worker that has not committed
   yet still gets filtered. Throws (rather than degrading to "0 files, clean") when
   git cannot answer — a typo'd ref or a non-repo root is a broken request, and the
   caller (preflight) must see that as inconclusive, not as an empty, passing scan. */
function diffFiles(ref, root) {
  const changed = execFileSync('git', ['diff', '--name-only', '--diff-filter=ACMR', ref], { cwd: root, encoding: 'utf8' })
    .split('\n').map(s => s.trim()).filter(Boolean);
  const untracked = execFileSync('git', ['ls-files', '--others', '--exclude-standard'], { cwd: root, encoding: 'utf8' })
    .split('\n').map(s => s.trim()).filter(Boolean);
  const trackedSet = new Set(changed);
  const all = [...new Set([...changed, ...untracked])];
  return all.map(rel => ({ rel, untracked: !trackedSet.has(rel) }));
}

function collectTargets(opts) {
  if (opts.mode === 'diff') {
    return diffFiles(opts.diff, opts.root)
      .filter(({ rel }) => !SKIP_DIR.test(rel) && LINTABLE.test(rel))
      .map(({ rel, untracked }) => ({
        abs: path.resolve(opts.root, rel),
        rel,
        ranges: untracked ? null : changedRanges(opts.diff, opts.root, rel),
      }))
      .filter(t => fs.existsSync(t.abs) && !fs.statSync(t.abs).isDirectory());
  }
  return opts.files
    .map(f => {
      const abs = path.resolve(opts.root, f);
      const rel = path.relative(opts.root, abs).split(path.sep).join('/');
      return { abs, rel, ranges: null };
    })
    .filter(t => !SKIP_DIR.test(t.rel) && LINTABLE.test(t.rel) && fs.existsSync(t.abs) && !fs.statSync(t.abs).isDirectory());
}

function emptyReport(opts, reason) {
  return {
    tool: 'review-lint', version: 1, mode: opts.mode, ref: opts.diff, fail_on: opts.failOn,
    files_checked: 0, counts: { high: 0, medium: 0, low: 0 }, blocking: 0, ok: false,
    notes: [reason], findings: [], rules: RULES.map(r => ({ id: r.id, severity: r.severity, why: r.why })),
  };
}

function main(argv) {
  const opts = parseArgs(argv);
  if (opts.help || opts.bad) {
    console.error('usage: node gates/review-lint.js [--fail-on=high|medium|low|none] [--root=DIR] <file>...');
    console.error('       node gates/review-lint.js [--fail-on=...] --diff [ref]');
    return opts.help ? 0 : 2;
  }
  if (!(opts.failOn in SEV) && opts.failOn !== 'none') {
    console.error(`review-lint: --fail-on must be high, medium, low or none (got "${opts.failOn}")`);
    return 2;
  }

  let targets;
  try {
    targets = collectTargets(opts);
  } catch (e) {
    const reason = `could not answer: ${String(e.message || e).split('\n')[0]}`;
    const report = emptyReport(opts, reason);
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    console.error(`review-lint: ${reason}`);
    return 2;
  }

  const findings = [];
  const push = (rel, sev, rule, f) => findings.push({ file: rel, line: f.line, rule, severity: sev, message: f.message });

  for (const { abs, rel, ranges } of targets) {
    const src = fs.readFileSync(abs, 'utf8');
    for (const rule of RULES) {
      if (!rule.applies(rel)) continue;
      for (const f of rule.run(src, rel, { root: opts.root })) {
        if (inRanges(f.line, ranges)) push(rel, rule.severity, rule.id, f);
      }
    }
  }

  findings.sort((a, b) => SEV[b.severity] - SEV[a.severity] || a.file.localeCompare(b.file) || a.line - b.line);

  const counts = { high: 0, medium: 0, low: 0 };
  findings.forEach(f => { counts[f.severity]++; });
  const threshold = SEV[opts.failOn] || Infinity;
  const blocking = findings.filter(f => SEV[f.severity] >= threshold);

  const report = {
    tool: 'review-lint', version: 1, mode: opts.mode, ref: opts.diff, fail_on: opts.failOn,
    files_checked: targets.length, counts, blocking: blocking.length, ok: blocking.length === 0,
    notes: [], findings, rules: RULES.map(r => ({ id: r.id, severity: r.severity, why: r.why })),
  };
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');

  if (blocking.length) {
    console.error(`review-lint: ${blocking.length} blocking finding(s) at or above ${opts.failOn} over ${targets.length} file(s)`);
    for (const f of blocking) console.error(`  ${f.file}:${f.line}: [${f.severity}] ${f.rule} — ${f.message}`);
    const advisory = findings.length - blocking.length;
    if (advisory) console.error(`  (+${advisory} advisory finding(s) below ${opts.failOn} — see the JSON on stdout)`);
  } else if (process.env.GATE_VERBOSE) {
    console.log(`review-lint: ${targets.length} file(s) clean at ${opts.failOn}+ (${findings.length} advisory)`);
  }
  return blocking.length ? 1 : 0;
}

module.exports = { main, RULES, changedRanges, inRanges };

if (require.main === module) process.exit(main(process.argv.slice(2)));
