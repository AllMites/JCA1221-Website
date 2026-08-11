/* gates/invariants.js — decisions already written in DESIGN.md/PRODUCT.md, restated as
   something a machine can fail on. Ported from foreflux's gates/invariants.js pattern
   (see docs/foreflux-reference.md §2.2); rule content is this repo's own.

     node gates/invariants.js [file]...   check the named files
     node gates/invariants.js             check the whole tracked source tree

   Exit 0 = clean, 1 = at least one finding. Findings print to stderr as `file:line: id — reason`.

   The gate-adoption rule (foreflux's, kept verbatim): a rule must be green against the
   current tree before it is wired into gates/run.sh, and anything two people could
   disagree about is a review comment, not a gate. That is why this file has two rules,
   not foreflux's six — the other four (selection-metrics, no-scroll-into-view,
   script-owns-its-globals, tokens-not-hex) don't have a matching written decision in
   this repo's DESIGN.md/PRODUCT.md today, or would fail on existing, legitimate code
   (e.g. DesignPage.tsx's Tailwind swatch table is deliberately raw hex). Add a rule here
   only once it is green on the current tree and traceable to a specific sentence in
   DESIGN.md or PRODUCT.md. */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', 'dist', '.git', '.worktrees', '.claude']);

/* Comments are blanked, not deleted, so a rule's own rationale in prose isn't flagged as
   the violation and line offsets still resolve correctly. Regex-based, not a real
   tokenizer — ponytail: known ceiling, a `//` or `/*` inside a string literal can be
   mis-stripped; upgrade to a real lexer only if that produces an actual false negative. */
function blankComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, pre) => pre + m.slice(pre.length).replace(/[^\n]/g, ' '));
}

function lineOf(src, index) {
  return src.slice(0, index).split('\n').length;
}

/* PRODUCT.md §Accessibility & Inclusion: "The codebase already commits to this
   baseline — ... `prefers-reduced-motion` handling ... — and new work must preserve
   it." Scoped to .css: this repo enforces reduced motion globally via a CSS
   `@media (prefers-reduced-motion: reduce)` kill switch in src/index.css, not
   per-component — framer-motion's `transition`/`animate` are JS prop names, not CSS
   declarations, so scoping this to .tsx/.ts would flag components that correctly rely
   on the global override and never fail cleanly. */
function reducedMotionRule(file, content) {
  if (!/\.css$/i.test(file)) return [];
  if (!/@keyframes|(?:^|[;{}\s])(?:transition|animation)\s*:/m.test(content)) return [];
  if (/prefers-reduced-motion/.test(content)) return [];
  return [{ line: 1, reason: 'declares transition:/animation:/@keyframes but has no prefers-reduced-motion block' }];
}

/* PRODUCT.md's accessibility commitment plus the standing rule that a service-role /
   admin secret must never be a source literal — this repo's analogue of foreflux's
   no-service-role-key (netlify/lib/supabase.ts reads SUPABASE_SERVICE_KEY from
   process.env; a literal here would mean the real secret shipped in the repo). */
const SECRET_ASSIGNMENT = /\b(SERVICE_ROLE_KEY|SERVICE_KEY|DB_PASSWORD|ADMIN_CODE|API_SECRET|SENDGRID_API_KEY)\s*[:=]\s*['"][^'"]{8,}['"]/g;
const JWT_LITERAL = /\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\b/g;

function decodeJwtRole(token) {
  try {
    const payload = token.split('.')[1];
    const json = Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    return JSON.parse(json).role;
  } catch {
    return undefined;
  }
}

function noHardcodedSecretRule(file, content) {
  if (!/\.(m?[jt]sx?|cjs|jsonc?)$/i.test(file)) return [];
  const findings = [];
  for (const m of content.matchAll(SECRET_ASSIGNMENT)) {
    findings.push({ line: lineOf(content, m.index), reason: `hardcoded literal assigned to ${m[1]} — read it from process.env instead` });
  }
  for (const m of content.matchAll(JWT_LITERAL)) {
    const role = decodeJwtRole(m[0]);
    if (role !== undefined && role !== 'anon') {
      findings.push({ line: lineOf(content, m.index), reason: `hardcoded JWT with role "${role}" — service-role tokens must never be a source literal` });
    }
  }
  return findings;
}

const RULES = [
  { id: 'reduced-motion', check: reducedMotionRule },
  { id: 'no-hardcoded-secret', check: noHardcodedSecretRule },
];

function checkFile(file) {
  let raw;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch {
    return [];
  }
  const content = blankComments(raw);
  const findings = [];
  for (const rule of RULES) {
    for (const f of rule.check(file, content)) {
      findings.push({ file, id: rule.id, ...f });
    }
  }
  return findings;
}

/* No files given: the whole tracked source tree, filtered to the extensions any rule
   above cares about. Cheap regex rules, no tsc — fine to run unscoped every time. */
function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
    } else if (/\.(css|m?[jt]sx?|cjs|jsonc?)$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function defaultFiles() {
  return walk(ROOT, []);
}

function main(argv) {
  const files = argv.length ? argv.map(f => path.resolve(f)) : defaultFiles();
  const findings = files.flatMap(checkFile);
  const rel = f => path.relative(ROOT, f).split(path.sep).join('/');
  for (const f of findings) {
    console.error(`${rel(f.file)}:${f.line}: ${f.id} — ${f.reason}`);
  }
  return findings.length ? 1 : 0;
}

if (require.main === module) {
  process.exit(main(process.argv.slice(2)));
}

module.exports = { blankComments, reducedMotionRule, noHardcodedSecretRule, checkFile, main, RULES };
