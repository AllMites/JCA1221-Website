# Homepage Redesign — Design Spec

**Date:** 2026-06-13
**Status:** Approved — ready for implementation plan
**Target audience:** Businessmen, government officials (LGUs, national agencies), investors
**Design system:** glassmorphism + neumorphism hybrid, blue/amber/slate palette

---

## Goals

1. **Understand fast** (5s clarity): visitor immediately knows JCA1221 does environmental infrastructure across water, waste, land — not just water.
2. **See proof** (1 scroll): impact numbers, project evidence, trust signals reachable in one scroll from hero.
3. **Professional confidence**: balance distinctiveness (glassmorphism, shader, cycling words) with boardroom appropriateness.

---

## Architecture Choice: Enterprise Cascade (Approach A)

Linear, predictable flow optimized for institutional decision-makers:

```
1. Hero
2. Trust Strip (stats + abbreviated partner marks)
3. Mission & Values Pillars
4. Featured Proof (project cards)
5. Trust Wall (full partner logos + certifications)
6. CSR Spotlight
7. Final CTA (inline contact form)
```

Each section is self-contained. Sections can be reordered or removed without breaking layout. All data comes from existing Supabase hooks — no new tables or API endpoints required.

---

## Section Details

### 1. Hero

**File:** `src/sections/home/components/HeroSection.tsx` (modify existing)

**Changes from current:**
- Remove mouse-following ripples (`useRippleEffect`)
- Remove edge-detection shell reveal/hide logic
- Keep cycling words (Water / Land / Waste) — slow interval from 4s to 6s
- Keep letter-stagger animation (existing `letter-out`/`letter-in` keyframes)
- Keep shader background cross-fade between blue/emerald/amber variants
- Add static sub-tagline: "Environmental Infrastructure for Philippine Communities"
- Retain dual CTA: "Partner With Us" (primary glass-tinted blue pill) + "Our Impact" (secondary glass outline with down-arrow icon, smooth-scrolls to trust strip)
- Mobile: stack CTAs vertically

**Props (unchanged interface):**
```ts
interface HeroSectionProps {
  tagline: string;
  subtitle?: string;
  cycleWords?: string[];
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  backgrounds?: { type: ShaderVariant; color: string }[];
}
```

### 2. Trust Strip

**New file:** `src/sections/home/components/TrustStrip.tsx`

Single-row glass card with 4 animated stat columns + abbreviated partner marks.

**Layout:**
- Glass card: `bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl`
- Desktop: 4 stat columns separated by vertical rules (`border-l border-slate-200 dark:border-slate-700`)
- Tablet: 2×2 grid
- Mobile: stacked
- Below stats: thin row of 5-6 key partner logo marks + "Trusted By" label (monochrome, small)

**Animation:** Number counters count up from zero on scroll-into-view (reuse existing `useCountUp` pattern from `ImpactStats`).

**Interaction:** Tap a stat → glass tooltip with source context.

**Props:**
```ts
interface TrustStripProps {
  stats: { value: number; suffix: string; label: string; context?: string }[];
  partnerLogos?: { name: string; url: string }[];
}
```

**Data source:** `useImpactStats()` + first 6 items from `usePartners()`.

### 3. Mission & Values Pillars

**New file:** `src/sections/home/components/MissionPillars.tsx`
**Replaces:** Current `MissionSection` (can coexist — HomePage chooses which to render)

Centered mission statement ("Serbisyo, Hindi Negosyo" with English sub-line), then three neumorphic value pillar cards.

**Values (hardcoded, editable via `page_content` eventually):**
1. **Stewardship** — "We don't own the land or water — we restore what's been damaged, for the next generation"
2. **Ingenuity** — "Filipino-engineered solutions that cost 60% less than conventional infrastructure — built to last"
3. **Partnership** — "We work with, not for — LGUs, communities, and the private sector share ownership"

**Design:**
- Mission statement block: glass card with larger type, centered text
- Value pillars: neumorphic pills (reuse `NeumorphicPill` pattern from `MainNav`, scaled up). Rest state = raised dual-shadow. Hover/tap = pressed inset-shadow.
- Domain-agnostic — no blue/emerald/amber color coding here. All use neutral neumorphic treatment.

**Mobile:** Mission full-width, pillars stack vertically.

**Props:**
```ts
interface MissionPillarsProps {
  tagline: string;
  taglineSub: string;
  pillars: { title: string; description: string }[];
}
```

### 4. Featured Proof (Projects)

**New file:** `src/sections/home/components/FeaturedProjects.tsx`
**Replaces:** Current `ProjectCarousel` horizontal scroll

Three project cards in a responsive row with glass treatment.

**Design:**
- Section header: "Proven Impact" (left) + "View All Projects →" glass link (right)
- Cards: glass (`bg-white/80 dark:bg-slate-900/80`), 16:9 hero image (rounded top), status dot (green pulse for active), domain badge (glass pill), 2 key metrics (extracted from `impact_metrics` JSONB), "View Detail →" link
- Hover: image gentle zoom (`scale-105`, contained within overflow-hidden), shadow deepens. No layout shift.
- Desktop: 3 columns, Tablet: 2 columns, Mobile: 1 column

**Empty state:** If fewer than 3 projects, show what's available. No collapsed/invisible cards.

**Props:**
```ts
interface FeaturedProjectsProps {
  projects: ProjectCard[];
}
```

**Data source:** `useProjects()` with `published = true`, sorted by `order`.

### 5. Trust Wall

**New file:** `src/sections/home/components/TrustWall.tsx`
**Replaces:** Current `PartnerLogoCarousel` (keep original but don't use on homepage)

Full partner logo grid + certification/accreditation badges.

**Design:**
- Section header: "Trusted By"
- Partner logos: responsive CSS grid (6 cols desktop → 4 tablet → 3 mobile). Monochrome treatment for consistency: CSS `filter: grayscale(100%)` on logo images, removed on hover (color reveal). Each logo in subtle glass cell (`bg-white/40 dark:bg-slate-800/40`, no heavy border).
- Horizontal separator
- Certification badges: icon + text, glass-minimal. Items: Philippine SEC Registered, DENR Environmental Compliance, DILG PPP Framework, ISO 14001 (in progress). These are currently hardcoded — future: `page_content` editable.
- Logos link to partner websites (if `website_url` present).

**Empty state:** Section collapses gracefully if no partners — show certifications only.

**Props:**
```ts
interface TrustWallProps {
  partners: { name: string; logo: string; websiteUrl?: string; type: PartnerType }[];
  certifications: { icon: string; label: string }[];
}
```

**Data source:** `usePartners()`.

### 6. CSR Spotlight

**File:** Keep existing `CsrCarousel` component but render it in a section wrapper.
**Or new file:** `src/sections/home/components/CsrSpotlight.tsx` (wrapper)

2-3 CSR project cards with glass treatment, SDG tags as small colored pills.

**Section header:** "Beyond Infrastructure" (left) + "View CSR →" link (right). Link navigates to `/projects#csr` — scrolls to CSR section on Projects page (existing `CsrSection` component there). When dedicated CSR page is built (separate spec), update to `/csr`.

**Design:** Same glass card pattern as Featured Projects. Smaller because CSR cards tend to have less image content. SDG tags rendered as small colored pills using SDG color palette.

**Props:** Uses existing `CsrCarousel` props or thin wrapper.

**Data source:** `useCsrProjects()`.

### 7. Final CTA

**New file:** `src/sections/home/components/FinalCta.tsx`

Glass card with inline simplified contact form.

**Design:**
- Decorative divider row (`─` characters rendered as horizontal rule or subtle gradient line)
- Centered heading: "Let's Build Together"
- Subheading: "Ready to bring environmental infrastructure to your community or portfolio?"
- Glass card form: name, email, organization, message (textarea). Simplified — no detailed mode toggle. Submit calls `submitContact()`.
- CTA button: glass-tinted blue (existing pattern: `bg-blue-500/80 backdrop-blur-md rounded-full`)
- Below form: email and phone in smaller text

**Form validation:**
- Name required
- Email required + format check
- Message required, min 10 chars
- Organization optional
- Loading state on submit button (spinner + disabled)
- Success: glass card transforms to thank-you message
- Error: inline error text below form

**Props:**
```ts
interface FinalCtaProps {
  contactInfo: { email: string; phone: string };
}
```

---

## Animation Summary

| Section | Animation | Trigger | Duration |
|---------|-----------|---------|----------|
| Hero | Cycling words + shader cross-fade | On load | 6s cycle, continuous |
| Trust Strip | Number counters | On scroll into view | ~1.5s per counter |
| Mission Pillars | Neumorphic press | Hover/tap | 200ms transition |
| Featured Projects | Shadow deepen + image zoom | Hover | 200ms ease-out |
| Trust Wall | None (static) | — | — |
| CSR Spotlight | Card shadow deepen | Hover | 200ms ease-out |
| Final CTA | None (static) | — | — |

**Removed animations (from current):**
- Mouse-following ripples in hero
- Edge detection shell toggle
- Horizontal scroll carousel momentum

**Respected:** `prefers-reduced-motion` — all animations disabled when set.

---

## Data Flow

```
useImpactStats()  ──→ TrustStrip
usePartners()     ──→ TrustStrip (abbreviated) + TrustWall (full)
useProjects()     ──→ FeaturedProjects
useCsrProjects()  ──→ CsrSpotlight
usePageContent()  ──→ MissionPillars (future), FinalCta contact info
```

Page-level data fetching in `HomePage.tsx` stays unchanged — hooks already called. New section components receive data as props. No new hooks needed.

---

## File Plan

### Modified files
| File | Change |
|------|--------|
| `src/pages/HomePage.tsx` | Replace section composition with new order. Backup original as `HomePage.original.tsx`. |
| `src/sections/home/components/HeroSection.tsx` | Remove ripples + edge detection. Add sub-tagline, secondary CTA smooth-scroll. |
| `src/sections/home/HomeView.tsx` | Replace internal section order. Backup original as `HomeView.original.tsx`. |

### New files
| File | Purpose |
|------|---------|
| `src/sections/home/components/TrustStrip.tsx` | Section 2: animated stats + abbreviated partner marks |
| `src/sections/home/components/MissionPillars.tsx` | Section 3: mission statement + neumorphic value pillars |
| `src/sections/home/components/FeaturedProjects.tsx` | Section 4: three project cards in responsive row |
| `src/sections/home/components/TrustWall.tsx` | Section 5: full partner logo grid + certifications |
| `src/sections/home/components/FinalCta.tsx` | Section 7: inline contact form + contact info |

### Unused (kept for reference, not rendered)
| File | Status |
|------|--------|
| `src/sections/home/components/ProjectCarousel.tsx` | Not used in new homepage — keep for alt page |
| `src/sections/home/components/MissionSection.tsx` | Not used in new homepage — keep |
| `src/sections/home/components/ExpansionSection.tsx` | Not used in new homepage — keep |
| `src/sections/home/components/ImpactStats.tsx` | Counter logic extracted into shared util; component kept for alt page |

### Shared utility
| File | Purpose |
|------|---------|
| `src/lib/use-count-up.ts` | Extract counter animation from ImpactStats into reusable hook |

---

## Non-Visual Improvements (Piggyback)

| Change | File | Reason |
|--------|------|--------|
| Add `useMemo` to project data mapping | `HomePage.tsx` | Prevent re-mapping on every render when data unchanged |
| Batch `page_content` fetches | `use-content.ts` | HomePage makes 1 `usePageContent('home')` call — already batched, no change needed |
| Lazy-load hero shader | `HeroSection.tsx` | `React.lazy` for `ShaderBackground` to reduce initial bundle |

---

## What's NOT in Scope

- New supabase tables or migrations
- New API endpoints or Netlify functions
- Font changes (Lexend evaluation deferred to P2)
- Interactive project map (P1, separate spec)
- Full CSR page (P1, separate spec)
- React Query addition (P1, separate spec)
- Layout/shell changes (nav, footer, AppShell unchanged)
- HomeAltPage changes

---

## Acceptance Criteria

1. Homepage renders all 7 sections in order without errors
2. Cycling words animate at 6s interval, shader cross-fades, no mouse ripples or edge detection
3. Trust strip counters animate from zero on scroll into view
4. Mission pillars show neumorphic press on hover/tap
5. Project cards link to correct project detail pages
6. Trust wall shows all partners from Supabase, gracefully handles empty state
7. CSR cards link to correct CSR detail or filtered projects page
8. Final CTA form submits successfully via `submitContact()`, shows loading/success/error states
9. Dark mode: all sections readable with correct glass opacity
10. Mobile (375px): all sections stack vertically, no horizontal overflow
11. `prefers-reduced-motion`: all animations disabled
12. Original `HomePage.tsx` and `HomeView.tsx` preserved as `.original.tsx` backups
13. `HomeAltPage.tsx` continues to function unchanged
