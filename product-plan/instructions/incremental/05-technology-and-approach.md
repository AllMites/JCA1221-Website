# Milestone 5: Technology & Approach

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell) complete

---

## About This Handoff

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Product requirements and user flow specifications
- Design system tokens (colors, typography)
- Sample data showing the shape of data components expect
- Test specs focused on user-facing behavior

**Your job:**
- Integrate these components into your application
- Wire up callback props to your routing and business logic
- Replace sample data with real data from your backend
- Implement loading, error, and empty states

The components are props-based — they accept data and fire callbacks. How you architect the backend, data layer, and business logic is up to you.

---

## Goal

Implement the Technology & Approach section — explaining how JCA 1221's systems work at an investor-friendly level, with visual process flows, comparison tables, and a live dashboard.

## Overview

Four color-coded sections explain the technology: emerald process flow (5-step wastewater → clean water with animated connector line), amber comparison (JCA vs traditional Philippine treatment), blue technology grid (4 pillars in 2×2 glass cards), and slate live dashboard (auto-scrolling metric cards with CSS charts and time-based live counters).

**Key Functionality:**
- 5-step visual process flow with animated connector line and staggered fade-in
- JCA vs Traditional comparison with Check/X indicators in glass rows
- 2×2 technology pillar grid with icon, description, and tag pills
- Auto-scrolling live dashboard with CSS-only line/bar/area charts
- Live counters that increment based on real system time
- "Live" pulse indicator on dashboard cards

## Components Provided

Copy from `product-plan/sections/technology-and-approach/components/`:

- `ProcessFlowSection.tsx` — Emerald-tinted, 5-step horizontal flow with connector line animation
- `ComparisonSection.tsx` — Amber-tinted, JCA vs Traditional glass comparison rows
- `TechnologyGridSection.tsx` — Blue-tinted, 2×2 grid of glass pillar cards with tech tags
- `LiveDashboardSection.tsx` — Slate/dark, auto-scrolling carousel with CSS charts and live counters
- `TechnologyView.tsx` — Main composer

## Expected User Flows

### Flow 1: Understand the Process
1. User scrolls into emerald section
2. Steps fade in sequentially (Collection & Screening → Biological Treatment → Clarification → UV Disinfection → Clean Water Release)
3. Animated connector line sweeps from step 1 to step 5
4. Each step shows icon, number badge, title, and one-sentence description

### Flow 2: Compare vs Traditional
1. User scrolls to amber section
2. Sees JCA (blue, Check icon) vs Traditional (slate, X icon) column headers
3. Rows cover: treatment method, cost structure, energy use, design approach, transparency, community integration
4. JCA column always shows blue checkmarks — clean visual win

### Flow 3: Explore Tech Pillars
1. User scrolls to blue section
2. Sees 2×2 grid: Biological Nutrient Removal, Modular Design, Solar/IoT, Scalability
3. Each card: icon, title, description paragraph, technology tag pills
4. Cards lift on hover with blue glow shadow

### Flow 4: View Live Dashboard
1. User scrolls to slate/dark section
2. Cards auto-scroll horizontally in an infinite wraparound carousel
3. "Live" pulse indicator on each card
4. Counters tick upward based on system time
5. CSS charts (line, bar, area) visualize historical data

## Empty States

- All content is static/editorial — no dynamic empty states
- Dashboard handles any number of metric cards (1-10)

## Testing

See `product-plan/sections/technology-and-approach/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/technology-and-approach/README.md` — Feature overview and design intent
- `product-plan/sections/technology-and-approach/tests.md` — UI behavior test specs
- `product-plan/sections/technology-and-approach/components/` — React components
- `product-plan/sections/technology-and-approach/types.ts` — TypeScript interfaces
- `product-plan/sections/technology-and-approach/sample-data.json` — Test data
- `product-plan/sections/technology-and-approach/screenshot.png` — Visual reference

## Done When

- [ ] Process flow renders with 5 animated steps
- [ ] Comparison shows all 6 rows with correct indicators
- [ ] Tech grid displays 4 pillars with tags
- [ ] Dashboard auto-scrolls with live counters
- [ ] CSS charts render correctly
- [ ] Matches the visual design (see screenshot)
- [ ] Responsive on mobile
