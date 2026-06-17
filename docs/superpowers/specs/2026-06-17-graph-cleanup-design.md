# Graph Cleanup — Design Spec

**Date:** 2026-06-17
**Source:** /graphify knowledge graph audit (1302 nodes, 2074 edges)
**Principle:** Safety-first — delete dead code, sync drift. No refactoring god nodes.

## Problems Found

| # | Problem | Severity | Action |
|---|---------|----------|--------|
| 1 | `vendor/liquidGL.js` — 35-node exact duplicate of `public/scripts/liquidGL.js`, zero imports | Low risk, pure waste | Delete |
| 2 | 21 React components diverged between `src/sections/` and `product-plan/sections/` | Medium — every src edit drifts further | Sync src→product-plan |
| 3 | ~77 possibly unused exports | Low-Medium — false positives likely | Audit + delete confirmed dead only |

## Step 1: Delete `vendor/liquidGL.js`

**Evidence:**
- MD5 identical to `public/scripts/liquidGL.js`: `e473d5e827e1e93a26d9eaf6305a6ecc`
- Zero imports in entire codebase (`rg "vendor/liquidGL"` returns nothing)
- `index.html:46` uses `<script src="/scripts/liquidGL.js" defer>` — the public/ copy
- Both committed; vendor/ at `aaa083d`, public/ at `83d8e83`

**Action:** `git rm vendor/liquidGL.js`

## Step 2: Audit & Remove Unused Exports

**Process:**
1. Query graph for each candidate export — check zero `imports` / `calls` / `references` edges
2. Cross-check with `rg` for string-based references (dynamic `import()`, template strings)
3. Delete only CONFIRMED dead exports
4. If file becomes empty after cleanup, delete the file
5. Skip barrel exports (`index.ts` re-exports) — they're structural, not dead

## Step 3: Sync 21 Components src/ → product-plan/

**Direction:** src/ → product-plan/ (src/ is authoritative, product-plan/ is export copy)

**Per-component process:**
1. Copy `src/sections/<section>/components/<Component>.tsx` → `product-plan/sections/<section>/components/<Component>.tsx`
2. Transform import paths to be self-contained within product-plan:
   - `@/components/ui/<x>` → copy ui component or use relative path to shared ui/
   - `@/components/ScrollReveal` → copy to product-plan/ shared directory
   - Section-internal imports → relative (`./OtherComponent`)
3. Verify TypeScript compiles

**Diverged components (21):**
AboutView, ContactForm, ContactInfoPanel, ContactView, ComparisonSection, ExpansionSection, FounderLetterSection, FounderProfileSection, HomeView, ImpactStats, HeroSection, MissionSection, ProjectCarousel, PortfolioSummaryBar, ProjectCard, ProjectList, ProjectDetail, ProcessFlowSection, LiveDashboardSection, TechnologyGridSection, TechnologyView

## Non-Goals (explicitly excluded)

- Refactoring `ShaderBackground.tsx` (god node, 28 AST concepts)
- Splitting `content-types.ts` (god node, 23 type definitions)
- Product-plan structural reorganization
- The 499× query compression — that's a feature, not a problem

## Commits

1. `chore: remove dead vendor/liquidGL.js (duplicate of public/scripts/liquidGL.js)`
2. `chore: remove unused exports found by graph audit`
3. `chore: sync product-plan components with src/ counterparts`
