/* gates/claude-hook.js — bridges Claude Code's hook events to gates/run.sh.
   Wired in .claude/settings.json for PostToolUse (Edit|Write|MultiEdit) and Stop.

   It lives in gates/ rather than .claude/hooks/ so that the whole gate layer is one
   directory: every caller of the gate (CI, pre-commit, the reviewer, this hook) is
   findable by opening gates/. .claude/settings.json holds only the wiring.

   Two events, one gate:
     PostToolUse  runs `gates/run.sh --fast` (invariants.js only, ~200ms) on the one
                  file just edited, and blocks on exit 2 the same way Stop does — a
                  fast-tier failure is caught immediately after the edit rather than
                  at the end of the turn. Marks the turn dirty either way, so Stop
                  still runs the full suite once even when the fast tier is clean
                  (invariants.js is a small subset of what tsc/ESLint catch).
     Stop         the full suite, but only if something was actually edited this
                  turn. Without that condition every conversational reply pays ~6s.

   Exit 2 is the whole point: on 2, Claude Code reads stderr as the reason and hands
   it back to the model, so a gate failure becomes work to fix rather than a message
   nobody reads. Any other non-zero exit is a broken hook and is deliberately unused. */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/* Both sides get realpath'd before they are compared. Every worktree in this repo
   reaches node_modules through an NTFS symlink and the kanban worktrees live under
   .worktrees/, so a plain startsWith on the raw paths can say "not my repo" for a
   real edit — and then the gate silently passes on everything. */
const real = p => { try { return fs.realpathSync(p); } catch { return path.resolve(p); } };

const REPO = real(path.resolve(__dirname, '..'));

/* The marker lives in the git dir so it is never committed and never deployed, and
   is naturally per-checkout — a worktree created for a kanban task gets its own.
   Resolved via git rather than path.join(REPO, '.git') because in a worktree `.git`
   is a *file* pointing elsewhere, and writing a marker "inside" it fails. */
function gitDir() {
  const r = spawnSync('git', ['rev-parse', '--absolute-git-dir'], { cwd: REPO, encoding: 'utf8' });
  const out = (r.stdout || '').trim();
  return r.status === 0 && out ? out : null;
}

const MARKER = (d => (d ? path.join(d, 'gate-dirty') : null))(gitDir());

function readInput() {
  let raw = '';
  try { raw = fs.readFileSync(0, 'utf8'); } catch { return {}; }
  try { return JSON.parse(raw); } catch { return {}; }
}

function runGate(extraArgs) {
  const r = spawnSync('sh', [path.join(REPO, 'gates', 'run.sh'), ...(extraArgs || [])], {
    cwd: REPO,
    encoding: 'utf8',
    timeout: 150000,
  });
  const output = `${r.stdout || ''}${r.stderr || ''}`.trim();
  return { ok: r.status === 0, output, crashed: r.status === null };
}

const input = readInput();
const event = input.hook_event_name;

if (event === 'PostToolUse') {
  const file = input?.tool_input?.file_path;
  if (!file) process.exit(0);
  const abs = real(path.resolve(REPO, file));
  /* An edit elsewhere on the machine is not this repo's business. */
  if (!abs.startsWith(REPO + path.sep)) process.exit(0);
  /* Only the file types the gate has an opinion about. A README edit should not
     make the next Stop pay for a typecheck. */
  if (!/\.(m?[jt]sx?|cjs)$/i.test(abs)) process.exit(0);

  /* No git dir (archive extract, template copy): the marker cannot be written, so
     the Stop tier below just always runs. Fail open on liveness, closed on verdict. */
  if (MARKER) { try { fs.writeFileSync(MARKER, ''); } catch { /* Stop still runs */ } }

  const { ok, output, crashed } = runGate(['--fast', abs]);
  if (crashed) process.exit(0); // a hung fast gate must not wedge the session
  if (!ok) {
    process.stdout.write(JSON.stringify({ decision: 'block', reason: output }));
    process.stderr.write(
      `The fast gate is failing on ${file}. Same invariants Stop would catch anyway — ` +
      `fixing it now is cheaper than finding out at the end of the turn.\n\n${output}`
    );
    process.exit(2);
  }
  process.exit(0);
}

if (event === 'Stop') {
  if (input.stop_hook_active) process.exit(0);            // already blocked once; don't loop
  if (MARKER && !fs.existsSync(MARKER)) process.exit(0);  // nothing was edited this turn

  const { ok, output, crashed } = runGate();
  if (crashed) process.exit(0);                           // a hung gate must not wedge the session
  if (!ok) {
    process.stdout.write(JSON.stringify({ decision: 'block', reason: output }));
    process.stderr.write(
      'The gate suite is failing. These are the repo\'s own invariants — `sh gates/run.sh` ' +
      'is what CI and the reviewer run too — so this is work to finish, not a report to ' +
      `hand over.\n\n${output}`
    );
    process.exit(2);
  }
  if (MARKER) { try { fs.unlinkSync(MARKER); } catch { /* already gone */ } }
  process.exit(0);
}

process.exit(0);
