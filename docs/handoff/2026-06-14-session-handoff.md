# Session Handoff — 2026-06-14

> Paste this at session start for full context. Covers all design decisions, completed work, architecture patterns, and gotchas.

---

## Project Identity

**JCA 1221 Holdings** — Philippine environmental infrastructure company restoring coastal ecosystems through nature-mimicking technology and public-private partnerships. Domains: Water, Land, Waste.

**Target audience:** Businessmen, government officials (LGUs, national agencies), investors.

**Aesthetic:** glassmorphism + neumorphism hybrid. Boardroom-appropriate with subtle interactivity.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 19 + Vite 7 + TypeScript 5.9 |
| Styling | Tailwind CSS 4 (no config file — v4 CSS imports) |
| Components | shadcn/ui (new-york style) + custom |
| Animation | framer-motion v12.4 |
| Router | react-router-dom v7 (createBrowserRouter) |
| Backend | Supabase (project: urtdzvtdekyycdnszlyp) |
| Icons | Lucide React |
| Dev fonts | DM Sans (headings), Inter (body), IBM Plex Mono (code) |

### Tailwind v4 note
No `tailwind.config.js`. Custom styles use `@theme` block in `src/index.css`. Built-in color utilities work directly (`slate-900`, `blue-500`).

### tsconfig non-obvious
- `"erasableSyntaxOnly": true` — can't use enums or namespaces
- `"verbatimModuleSyntax": true` — use `import type` for type-only imports
- `.original.tsx` files excluded via `tsconfig.app.json`

---

## Color Palette

```json
{
  "primary": "blue",
  "secondary": "amber",
  "neutral": "slate"
}
```

Used as Tailwind color classes: `blue-*`, `amber-*`, `slate-*`. CSR section uses `lime-*` accent. Hero word cycle maps to shader variants: Water→'blue', Land→'amber', Waste→'slate'.

---

## Architecture Pattern: Enterprise Cascade

Linear page flow optimized for institutional decision-makers:

```
1. Hero (cycling words + parallax + dual CTA)
2. Trust Strip (4 animated stats + abbreviated partner marks)
3. Mission & Values Pillars (Stewardship, Ingenuity, Partnership)
4. Featured Projects (3D tilt cards, 3 max)
5. Trust Wall (partner logo grid + certifications)
6. CSR Carousel (auto-advancing horizontal scroll + progress bar)
7. Final CTA (inline contact form with 4 states)
```

All sections self-contained. Reorderable. Data from existing Supabase hooks — no new tables.

---

## Completed Pages (all 7 public routes)

| Page | File | Enhancements |
|------|------|-------------|
| Home | `src/pages/HomePage.tsx` | Enterprise cascade with 7 sections |
| Projects | `src/sections/projects-and-track-record/components/ProjectList.tsx` | ScrollReveal header + staggered cards + portfolio stats |
| Project Detail | `src/sections/projects-and-track-record/components/ProjectDetail.tsx` | Parallax hero, staggered stats/metrics/awards |
| About | `src/sections/about-and-mission/components/AboutView.tsx` | 4 section reveals, staggered value pillars |
| Team | `src/sections/team/components/TeamView.tsx` | Staggered member cards with 0.08s delay |
| Contact | `src/sections/contact-and-partnerships/components/ContactView.tsx` | Staggered form fields, partner grid |
| News | `src/sections/news/components/NewsView.tsx` | Staggered article cards |

All pages have ScrollReveal/stagger animations. Build passes clean (`npx tsc --noEmit && npx vite build`).

---

## Shell & Navigation

### AppShell (`src/shell/components/AppShell.tsx`, 296 lines)

**Scroll-aware nav:** Header transitions from transparent → frosted glass after 80px scroll. Uses `useScroll` + `useTransform` (framer-motion). Two `motion.div` overlays (light/dark) animate opacity for bg. Has `pointer-events-none` so clicks pass through.

**Footer:** Gradient background (`from-white via-slate-50 to-slate-100`), 4-column grid (Brand / Navigate / Legal / Contact), wrapped in `ScrollReveal`. Copyright bar + tagline "Earth Renewal for Generations".

**Layout:** Skip-to-content link, sticky header z-50, sidebar anchors on some pages, CookieConsent banner.

### MainNav (`src/shell/components/MainNav.tsx`)
Neumorphic pill nav items (raised shadow), mobile slide-out panel. Active state uses inset shadow (pressed look).

---

## Key Reusable Components

### ScrollReveal (`src/components/ScrollReveal.tsx`, 131 lines)

```tsx
<ScrollReveal direction="up" duration={0.6} staggerChildren={0.1} once={true}>
  <RevealItem direction="up" duration={0.5}>
    <YourComponent />
  </RevealItem>
</ScrollReveal>
```

Props: `direction` (up/down/left/right), `delay`, `duration`, `staggerChildren`, `once`, `viewportMargin` (default `'-80px 0px'`). Uses `whileInView` trigger. Respects `prefers-reduced-motion` — renders plain div when active.

**Implementation detail:** Pre-computed direction lookups (`HIDDEN_BY_DIRECTION`, `ITEM_HIDDEN_BY_DIRECTION`) avoid framer-motion v12 Variant index-signature issues. Computed property keys (`[axis]: value`) would fail type checks.

### useCountUp (`src/lib/use-count-up.ts`, 45 lines)
`requestAnimationFrame`-based counter with cubic ease-out (`1 - Math.pow(1 - progress, 3)`). Takes `target`, `duration`, `enabled` (for IntersectionObserver trigger).

### PageTransition (`src/components/PageTransition.tsx`)
`AnimatePresence` wrapper with fade+slide (y: 12→0 on enter, 0→-8 on exit). Already wired in router via `PageTransitionOutlet`.

### TiltCard (inside `FeaturedProjects.tsx`)
3D tilt on project cards. `useCallback` mouse move handler computes `rotateX/rotateY` (±5° max) from normalized mouse position. Shadow follows tilt direction. Reduced motion? Tilt disabled. On leave: transform resets with 0.4s ease-out transition. On enter: transition set to 0.1s for instant tracking response.

### GlassPill (`src/components/GlassPill.tsx`)
Small badge/chip component used for tags and categories.

### ShaderBackground (`src/components/ShaderBackground.tsx`)
Animated gradient shader — variant='blue'|'amber'|'slate', opacity control.

---

## Homepage Section Components

| Component | File | Key Features |
|-----------|------|-------------|
| HeroSection | `src/sections/home/components/HeroSection.tsx` (348 lines) | Cycling words (Water→Land→Waste at 6s), letter stagger, shader cross-fade, parallax bg via useScroll/useTransform, dual CTAs (gradient primary + glass secondary), scroll indicator fade-out |
| TrustStrip | `src/sections/home/components/TrustStrip.tsx` | 4 animated stat columns with useCountUp, IntersectionObserver trigger |
| MissionPillars | `src/sections/home/components/MissionPillars.tsx` | 3 neumorphic cards (Stewardship, Ingenuity, Partnership), hardcoded DEFAULT_PILLARS fallback |
| FeaturedProjects | `src/sections/home/components/FeaturedProjects.tsx` | 3D TiltCard with mouse tracking, status dot, mini stats |
| TrustWall | `src/sections/home/components/TrustWall.tsx` | Staggered RevealItem logo grid (grayscale→color), BadgeCheck cert icons |
| CsrCarousel | `src/sections/home/components/CsrCarousel.tsx` | Auto-advancing horizontal scroll (5s, loops), progress bar, hover pause, respects reduced-motion |
| FinalCta | `src/sections/home/components/FinalCta.tsx` | Inline form (4 states), gradient submit button with shine sweep |

---

## Supabase Integration

**Hooks used:**
- `useProjects()` — project cards + detail pages
- `usePartners()` — TrustWall logos
- `usePageContent('home')` — hero content CMS overrides
- `useCsrProjects()` — CSR carousel
- `useImpactStats()` — TrustStrip stats
- `useNews()` — news page
- `useTeam()` — team page

**Pattern:** Hooks return `{ data, loading, error }`. Pages short-circuit to skeleton when credentials are placeholder values (`const isPlaceholder = !key || key.includes('placeholder')`).

**MCP:** `.mcp.json` uses `${SUPABASE_ACCESS_TOKEN}` — set env var before using Supabase MCP tools.

---

## Files NEVER to touch

- `src/sections/home/components/alt/` — alternative designs
- `src/pages/HomeAltPage.tsx` — uses old HomeView props
- `src/sections/home/components/*.original.tsx` — none left (deleted by cleanup, excluded from tsconfig)
- `product/` directory — Design OS product definitions

---

## Old Homepage Components (still exported for HomeAltPage)

These exist in `src/sections/home/components/` but are NOT part of the enterprise cascade:
- `ProjectCarousel.tsx`
- `MissionSection.tsx`
- `ImpactStats.tsx`
- `ExpansionSection.tsx`

Exported from `index.ts` for backward compat. If HomeAltPage removed, these can be deleted.

---

## Common Gotchas

1. **framer-motion v12 Variant types** — Don't use computed property keys in Variants objects. Use pre-computed lookup maps instead.
   ```ts
   // BROKEN in v12
   const hidden = { [axis]: -40 }  // type error
   // CORRECT
   const HIDDEN: Record<string, unknown> = { x: -40 }
   const hidden = HIDDEN_BY_DIRECTION[direction]
   ```

2. **Tailwind v4 dark mode** — Uses `dark:` prefix. Media-query based (not class-based). No `darkMode: 'class'` config.

3. **ShaderBackground** — Only supports `variant='blue'|'amber'|'slate'|'light'`.

4. **CFLF warnings** — Windows line endings. Benign. `git config core.autocrlf true` resolves.

5. **Router lazy loading** — All pages use `React.lazy()`. Skeleton shown during load. Choose correct skeleton per path in `router.tsx`.

6. **AdminPage** — Has JSON-aware value rendering (handles both string and object values from Supabase `page_content`).

---

## Build Commands

```bash
# TypeScript check (no emit)
npx tsc --noEmit --pretty

# Dev server
npx vite --port 5173 --host

# Production build
npx vite build

# Run Playwright screenshots (visual regression)
npx playwright test  # if tests configured
```

---

## Git State

**Branch:** `main` (pushed to `origin/main`)
**Last commit:** `dda5848` — feat: premium CTA buttons + TrustWall polish
**Ahead of origin:** 0 (synced)

**Recent milestones:**
- `dda5848` — Premium CTA buttons (gradient + shine), TrustWall stagger + BadgeCheck icons
- `489eecc` — Fix missing HomeAltPage route, add 8 visual regression screenshots
- `4749286` — Supabase token replaced with env var (filter-branch scrubbed from ALL history)
- `511ddf4` — Scroll-aware nav (transparent→frosted) + enhanced footer (4-col grid)
- `77374f5` — CSR carousel auto-advance + progress bar
- `641bb45` — ProjectDetail parallax hero + staggered reveals
- `48f5757` — ContactView staggered form fields + partner grid
- `fa7392a` — NewsView staggered article cards
- `dfb3b72` — AboutView scroll-reveal sections + staggered value pillars
- `21b5f95` — ProjectList scroll-reveal + staggered entry
- `0b84972` — TeamView staggered member cards

**Screenshots:** 8 PNGs in `screenshots/` directory — visual regression baseline.

---

## Suggested Next Work

### Quick Wins (1-5 min each)
- Replace `meta name="apple-mobile-web-app-capable"` with `mobile-web-app-capable` (Playwright found this deprecation)
- Add favicon.ico (none currently)
- Kill `/alt` route entirely (HomeAltPage.tsx + router entry + index.ts exports)

### Medium Effort
- **Landing page variants** — Water-only, Land-only, Waste-only hero variants for campaign pages
- **Magic MCP component pull** — When 21st.dev API recovers, pull glass-card variants for TrustWall/TrustStrip
- **Accessibility audit** — ui-ux-pro-max can run accessibility check on all pages
- **Page transition variants** — Different transitions per route type (slide for sections, zoom for detail)

### Larger Features (from roadmap)
- Chat widget integration
- Interactive project map
- Team roster expansion
- SDG integration for project pages
