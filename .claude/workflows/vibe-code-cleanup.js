export const meta = {
  name: 'vibe-code-cleanup',
  description: 'Execute 5-phase vibe-code remediation across JCA 1221 website, parallelized where safe',
  phases: [
    { title: 'Wave 1: Lines + Overlays', detail: 'Phase 1A (delete gradient lines) + Phase 4 (radial overlays) in parallel' },
    { title: 'Wave 2: Shadows + Glass + Radius', detail: 'Phase 1B→2→5 combined per-file (same className strings, must be serial)' },
    { title: 'Wave 3: Orbs→Shaders', detail: 'Phase 3 — replace atmospheric orbs with ShaderBackground variants' },
    { title: 'Verify', detail: 'Build check + visual audit' },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════════
// WAVE 1 — Parallel: Phase 1A (gradient lines) + Phase 4 (radial overlays)
// ═══════════════════════════════════════════════════════════════════════════════

phase('Wave 1: Lines + Overlays')

const [linesResult, overlaysResult] = await parallel([
  // Track A: Phase 1A — delete decorative gradient separator lines
  () => agent(`
    You are doing PHASE 1A of a vibe-code remediation audit.

    TASK: Delete all decorative gradient separator line div elements from the codebase.
    These are the elements matching pattern: h-px bg-gradient-to-r from-transparent via-COLOR to-transparent
    used as section boundary decorations.

    FILES TO EDIT (remove the specified element from each):

    1. src/sections/home/components/ImpactStats.tsx
       - Line 76: Delete <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
       - Line 101: Delete <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />

    2. src/sections/home/components/MissionSection.tsx
       - Line 47: Delete <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 dark:via-amber-600 to-transparent opacity-40" />

    3. src/sections/home/components/ExpansionSection.tsx
       - Line 66: Delete <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300 dark:via-amber-800 to-transparent opacity-50" />

    4. src/sections/about-and-mission/components/AboutView.tsx
       - Line 30: Delete <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 dark:via-blue-600/20 to-transparent" />

    5. src/sections/about-and-mission/components/FounderLetterSection.tsx
       - Line 29: Delete <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
       - Line 78: Delete <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />

    6. src/sections/about-and-mission/components/FounderProfileSection.tsx
       - Line 14: Delete <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 dark:via-blue-600/20 to-transparent" />

    7. src/sections/about-and-mission/components/ValuePillarSection.tsx
       - Line 123: Delete <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-300/30 dark:via-slate-700/20 to-transparent" />

    INSTRUCTIONS:
    - Read each file, find the exact element, and use Edit to delete it.
    - If the element text has already changed from what's listed, skip that file and report it.
    - Do NOT modify any other elements, classNames, or structure.
    - Report which files were edited and which were skipped.

    Return: list of files edited and any files skipped.
  `, { label: 'Phase 1A: delete gradient lines' }),

  // Track B: Phase 4 — kill radial gradient overlays on project images
  () => agent(`
    You are doing PHASE 4 of a vibe-code remediation audit.

    TASK: Replace radial-gradient overlay patterns on project images with flat gradient overlays, and eliminate double-overlay patterns.

    FILE 1: src/sections/home/components/ProjectCarousel.tsx

    Find the radial gradient overlay pattern on project images (around line 40):
    <div className="absolute inset-0 opacity-30 dark:opacity-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-blue-600 to-blue-900 group-hover/card:opacity-50 dark:group-hover/card:opacity-70 transition-opacity duration-500" />

    REPLACE IT with a flat gradient:
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-950/30 to-slate-950/30 group-hover/card:opacity-60 dark:group-hover/card:opacity-70 transition-opacity duration-500" />

    NOTE: The line below it (bg-gradient-to-t from-white/90 via-white/40 to-transparent) does the actual text-legibility work — leave it alone.

    FILE 2: src/sections/projects-and-track-record/components/ProjectDetail.tsx

    Find the radial gradient pattern (around line 41):
    <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-blue-500 to-blue-800" />

    REPLACE IT with:
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-950/30 to-slate-950/30" />

    INSTRUCTIONS:
    - Read each file first to find the exact text.
    - Use Edit to replace the exact match.
    - If the text doesn't match, report it and skip that file.
    - Do NOT modify any other elements.

    Return: list of files edited and any files skipped.
  `, { label: 'Phase 4: radial overlays' }),
])

// ═══════════════════════════════════════════════════════════════════════════════
// WAVE 2 — Pipeline: Phase 1B → Phase 2 → Phase 5 per file
// These MUST be serial because they edit the same className strings.
// Combining into one agent per file that does all three passes at once.
// ═══════════════════════════════════════════════════════════════════════════════

phase('Wave 2: Shadows + Glass + Radius')

const wave2Files = [
  {
    path: 'src/shell/components/AppShell.tsx',
    changes: `
      APP SHELL (Phase 1B + 2 + 5):
      1B: Find shadow-[0_8px_32px_rgba(59,130,246,0.06)] → shadow-[0_8px_32px_rgba(0,0,0,0.06)]
      1B: Find shadow-[0_8px_32px_rgba(59,130,246,0.03)] → shadow-[0_8px_32px_rgba(0,0,0,0.08)]
      2: Footer: change bg-card/40 backdrop-blur-md to bg-card/80 (remove backdrop-blur-md)
      2: Sidebar nav: change bg-card/70 backdrop-blur-xl to bg-card (remove backdrop-blur-xl, remove /70)
    `,
  },
  {
    path: 'src/sections/technology-and-approach/components/TechnologyGridSection.tsx',
    changes: `
      TECHNOLOGY GRID (Phase 1B + 2 + 5):
      1B: Find shadow-[0_4px_24px_rgba(59,130,246,0.06) → shadow-[0_4px_24px_rgba(0,0,0,0.06)
      1B: Find shadow-[0_8px_40px_rgba(59,130,246,0.12) → shadow-[0_8px_40px_rgba(0,0,0,0.10)
      1B: Find shadow-[0_4px_16px_rgba(59,130,246,0.1)] → shadow-[0_4px_16px_rgba(0,0,0,0.08)]
      2: Card: change bg-white/5 backdrop-blur-xl to bg-white/10 (remove backdrop-blur-xl)
      5: Card: change rounded-2xl to rounded-xl
    `,
  },
  {
    path: 'src/sections/technology-and-approach/components/LiveDashboardSection.tsx',
    changes: `
      LIVE DASHBOARD (Phase 1B + 2 + 5):
      1B: No blue shadows found in this file — skip 1B
      2: Metric cards: change bg-white/5 backdrop-blur-xl to bg-white/10 (remove backdrop-blur-xl)
      5: Metric cards: change rounded-2xl to rounded-xl
    `,
  },
  {
    path: 'src/sections/contact-and-partnerships/components/ContactForm.tsx',
    changes: `
      CONTACT FORM (Phase 1B + 2 + 5):
      1B: Submit btn shadow-[0_4px_16px_rgba(59,130,246,0.25) → shadow-[0_4px_16px_rgba(0,0,0,0.12)
      1B: Submit btn hover shadow-[0_8px_24px_rgba(59,130,246,0.35) → shadow-[0_8px_24px_rgba(0,0,0,0.18)
      1B: Submit btn shadow-[0_1px_3px_rgba(59,130,246,0.15) → shadow-[0_1px_3px_rgba(0,0,0,0.08)
      1B: Submit btn hover shadow-[0_1px_3px_rgba(59,130,246,0.2) → shadow-[0_1px_3px_rgba(0,0,0,0.12)
      2: Form inputs: remove backdrop-blur-md from input baseClasses, change bg-slate-50 dark:bg-white/5 to bg-slate-50 dark:bg-slate-800/60
      2: Success state card: change bg-white dark:bg-white/5 backdrop-blur-xl to bg-white dark:bg-slate-900 (remove backdrop-blur-xl)
      5: Form/success cards: change rounded-2xl to rounded-xl
    `,
  },
  {
    path: 'src/sections/contact-and-partnerships/components/ContactInfoPanel.tsx',
    changes: `
      CONTACT INFO PANEL (Phase 1B + 2 + 5):
      1B: Schedule card shadow-[0_4px_16px_rgba(59,130,246,0.06)] → shadow-[0_4px_16px_rgba(0,0,0,0.04)]
      2: Card surface: change bg-white dark:bg-white/5 backdrop-blur-lg to bg-white dark:bg-slate-900 (remove backdrop-blur-lg)
      2: Schedule CTA card: KEEP backdrop-blur-lg (it's one of the 4 strategic glass surfaces)
      2: Schedule CTA button: KEEP backdrop-blur-md (it's one of the 4 strategic glass surfaces)
      5: Cards: change rounded-2xl to rounded-xl
    `,
  },
]

const wave2Results = await pipeline(
  wave2Files,
  (file) => agent(`
    You are doing PHASES 1B + 2 + 5 combined on a single file. These phases all touch the same className strings so must be done together.

    FILE: ${file.path}

    CHANGES NEEDED:
    ${file.changes}

    INSTRUCTIONS:
    1. Read the file first.
    2. Apply ALL changes listed above in a single pass.
    3. Phase 1B: Replace any blue-tinted shadow rgba(59,130,246,...) values with neutral rgba(0,0,0,...) equivalents.
    4. Phase 2: Remove backdrop-blur from surfaces NOT on the keep list. Keep list: AppShell header, ContactForm form card, ContactInfoPanel schedule CTA card+button, GlassPill component.
    5. Phase 5: Change rounded-2xl to rounded-xl on cards. Keep rounded-full on pills/badges/CTAs.
    6. Use Edit tool for each replacement.
    7. If any listed pattern doesn't match current file content, skip that specific change and report it.
    8. Do NOT modify anything beyond the listed changes.

    Return: list of specific edits made and any skipped changes.
  `, { label: file.path.split('/').pop()?.replace('.tsx','') ?? file.path })
)

// ═══════════════════════════════════════════════════════════════════════════════
// WAVE 3 — Phase 3: Replace atmospheric orbs with ShaderBackground
// ═══════════════════════════════════════════════════════════════════════════════

phase('Wave 3: Orbs→Shaders')

const orbResult = await agent(`
  You are doing PHASE 3 of a vibe-code remediation audit.

  TASK: Replace floating blurred-circle atmospheric orbs with the project's own ShaderBackground component (already imported in most files).

  FILE 1: src/sections/contact-and-partnerships/components/ContactView.tsx
  Find (around lines 31-32):
    <div className="hidden dark:block absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full bg-blue-500/4 blur-[180px]" />
    <div className="hidden dark:block absolute bottom-0 left-0 w-[30rem] h-[30rem] rounded-full bg-cyan-500/3 blur-[150px]" />
  DELETE both lines.
  The ShaderBackground variant="dark" already on line 28 handles the texture. Just boost its opacity from 0.5 to 0.7 to compensate.

  FILE 2: src/sections/technology-and-approach/components/TechnologyGridSection.tsx
  Find (around lines 42-44):
    <div className="absolute top-10 right-10 w-[30rem] h-[30rem] rounded-full bg-blue-500/8 blur-[150px]" />
    <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-blue-400/6 blur-[100px]" />
    <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-blue-600/5 blur-[80px]" />
  DELETE all three lines.
  The ShaderBackground variant="dots" on line 47 already provides texture. The solid bg-slate-950 on line 38 provides the deep base.

  FILE 3: src/sections/technology-and-approach/components/LiveDashboardSection.tsx
  Find (around line 426):
    <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-slate-500/4 blur-[120px]" />
  DELETE this line.
  The ShaderBackground variant="slate" on line 429 already provides texture.

  INSTRUCTIONS:
  - Read each file first to find the exact text.
  - Use Edit to delete the orb elements.
  - For ContactView.tsx, also edit the ShaderBackground opacity from 0.5 to 0.7.
  - If any element text doesn't match, report it and skip.
  - Do NOT modify anything else.

  Return: list of files edited with specific deletions.
`, { label: 'Phase 3: orbs → shaders' })

// ═══════════════════════════════════════════════════════════════════════════════
// VERIFY
// ═══════════════════════════════════════════════════════════════════════════════

phase('Verify')

const verifyResult = await agent(`
  Verify the vibe-code remediation changes compile correctly.

  1. Run: npx tsc --noEmit 2>&1 | head -40
     Check for any TypeScript errors introduced by the changes.

  2. If the project has a build step, try: npm run build 2>&1 | tail -20
     (Skip if no build script)

  3. Grep for any remaining obvious vibe-code patterns that were missed:
     - grep for "rounded-full.*blur" — any remaining backdrop-blur on rounded-full surfaces?
     - grep for "rgba(59,130,246" in src/ — any remaining blue-tinted shadows?
     - grep for "radial-gradient" in src/ — any remaining radial gradient overlays?
     - grep for "rounded-full.*blur-\[" in src/ — any remaining atmospheric orbs?
     - grep for "h-px bg-gradient-to-r from-transparent via" in src/ — any remaining decorative gradient lines?

  4. Report: build status, any errors, and any missed patterns found by grep.

  Return: verification report with build status and grep findings.
`, { label: 'Verify: build + grep audit' })

// ═══════════════════════════════════════════════════════════════════════════════
// SYNTHESIS
// ═══════════════════════════════════════════════════════════════════════════════

log(`Wave 1 complete — gradient lines: ${linesResult ?? 'done'}, radial overlays: ${overlaysResult ?? 'done'}`)
log(`Wave 2 complete — ${wave2Results.filter(Boolean).length}/${wave2Files.length} files processed`)
log(`Wave 3 complete — orbs replaced: ${orbResult ?? 'done'}`)
log(`Verification: ${verifyResult ?? 'done'}`)

return {
  wave1: { lines: linesResult, overlays: overlaysResult },
  wave2: wave2Results,
  wave3: orbResult,
  verify: verifyResult,
}
