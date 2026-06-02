# JCA 1221 Holdings — Complete Implementation Instructions

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

## Testing

Each section includes a `tests.md` file with UI behavior test specs. These are **framework-agnostic** — adapt them to your testing setup.

**For each section:**
1. Read `product-plan/sections/[section-id]/tests.md`
2. Write tests for key user flows (success and failure paths)
3. Implement the feature to make tests pass
4. Refactor while keeping tests green

---

# JCA 1221 Holdings — Product Overview

## Summary

JCA 1221 Holdings is a Philippine environmental infrastructure company that designs, builds, and operates water reclamation and solid waste management facilities through public-private partnerships. We bring scalable, nature-mimicking technology to cities and islands that have been left behind by conventional infrastructure — restoring ecosystems while keeping services affordable for the communities that need them most.

## Planned Sections

1. **Home** — Full-screen immersive landing page with hero, project carousel, mission highlights, impact stats, and expansion plans
2. **About & Mission** — Founding story, founder's letter, core value pillars, founder profile
3. **Projects & Track Record** — Portfolio summary, filterable project grid, individual project detail pages
4. **Technology & Approach** — Visual process flow, JCA vs traditional comparison, core technology pillars, live impact dashboard
5. **Contact & Partnerships** — Two-tier inquiry form, team contacts, office info, partner logos, downloadable capability statement

## Design System

**Colors:**
- Primary: blue — buttons, links, key accents
- Secondary: amber — tags, highlights
- Neutral: slate — backgrounds, text, borders

**Typography:**
- Heading: DM Sans
- Body: Inter
- Mono: IBM Plex Mono

**Design Language:**
- Glassmorphism for structural containers (frosted glass panels, backdrop-blur, tinted transparency, glass edges, colored shadows)
- Neumorphism for interactive elements (raised/inset shadow pills, rounded buttons)
- Distinct colored section backgrounds for visual rhythm

---

# Milestone 1: Shell

Set up the design tokens and application shell — the persistent chrome that wraps all sections.

### Design Tokens

Configure your styling system:
- **Colors:** blue (primary), amber (secondary), slate (neutral)
- **Typography:** DM Sans (heading), Inter (body), IBM Plex Mono (mono)
- See `product-plan/design-system/` for full configuration files

### Application Shell

Copy components from `product-plan/shell/components/`:
- `AppShell.tsx` — Main layout with glass nav, content area, footer
- `MainNav.tsx` — Neumorphic navigation pills, mobile hamburger
- `UserMenu.tsx` — "Partner With Us" glass-tinted CTA

**Wire Up Navigation:**
- Home → `/` or `/home`
- About & Mission → `/about-and-mission`
- Projects & Track Record → `/projects-and-track-record`
- Technology & Approach → `/technology-and-approach`
- Contact & Partnerships → `/contact-and-partnerships`

**Design patterns:**
- Nav: `bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border-b border-white/20`
- Nav pills (inactive): `rounded-full shadow-[3px_3px_8px_rgba(0,0,0,0.06),-2px_-2px_6px_rgba(255,255,255,0.9)]`
- Nav pills (active): `rounded-full shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08)]`
- CTA: `bg-blue-500/80 backdrop-blur-md rounded-full border-white/20 shadow-blue`
- Mobile: hamburger opens glass slide-out panel

---

# Milestone 2: Home

Full-screen immersive landing page for JCA 1221 Holdings.

**Components from `product-plan/sections/home/components/`:**
- `HeroSection.tsx` — Full-screen hero with water-themed background
- `ProjectCarousel.tsx` — Horizontal-scrolling project cards with award badges
- `MissionSection.tsx` — Color-banded mission values
- `ImpactStats.tsx` — Animated counters
- `ExpansionSection.tsx` — Future expansion plans
- `HomeView.tsx` — Main composer

**Key callbacks:** `onProjectClick`, `onViewProjects`, `onPartnerClick`

**User flows:** Arrive → scroll hero → carousel → mission → impact stats → expansion plans. Nav reveals on mouse edge proximity.

---

# Milestone 3: About & Mission

Founder's letter, value pillars, and founder profile.

**Components from `product-plan/sections/about-and-mission/components/`:**
- `FounderLetterSection.tsx` — Frosted glass letter panel over dark water gradient
- `ValuePillarSection.tsx` — Four color-coded sections with glass sub-point cards
- `FounderProfileSection.tsx` — Photo, quotes, vertical milestone timeline
- `AboutView.tsx` — Main composer

**Key callbacks:** `onCtaClick`

**User flows:** Read founder's letter → scroll through value pillars (amber/emerald/blue/slate) → view founder profile with quotes and milestones → click CTA to Contact.

---

# Milestone 4: Projects & Track Record

Portfolio listing and project detail views.

**Components from `product-plan/sections/projects-and-track-record/components/`:**
- `PortfolioSummaryBar.tsx` — Animated stat counters
- `ProjectCard.tsx` — Card with image, badge, hover overlay
- `ProjectList.tsx` — Summary bar → filter pills → grid → empty state
- `ProjectDetail.tsx` — Full-bleed hero → glass bridge → stats → tech → impact → awards → partners

**Key callbacks:** `onProjectClick`, `onFilterChange`, `onBack`

**User flows:** Browse grid with animated portfolio stats → filter by status → click card to detail → scroll through hero, stats, tech, impact, awards, partners → back to list.

---

# Milestone 5: Technology & Approach

Visual process flow, comparison, tech grid, and live dashboard.

**Components from `product-plan/sections/technology-and-approach/components/`:**
- `ProcessFlowSection.tsx` — 5-step emerald flow with animated connector
- `ComparisonSection.tsx` — Amber JCA vs Traditional glass rows
- `TechnologyGridSection.tsx` — Blue 2×2 glass pillar grid
- `LiveDashboardSection.tsx` — Auto-scrolling metric cards with CSS charts
- `TechnologyView.tsx` — Main composer

**No callbacks** — read-only informational section.

**User flows:** Process flow animation → comparison table → tech pillar grid → live auto-scrolling dashboard with time-based counters.

---

# Milestone 6: Contact & Partnerships

Lead-generation form with trust signals.

**Components from `product-plan/sections/contact-and-partnerships/components/`:**
- `ContactForm.tsx` — Two-tier form with validation, expand, success state
- `ContactInfoPanel.tsx` — Schedule CTA, office, team, logos, download
- `ContactView.tsx` — Split panel composer

**Key callbacks:** `onSubmitBasic`, `onSubmitDetailed`, `onDownloadPDF`, `onScheduleCall`

**User flows:** Fill basic form → expand detailed fields → submit → success confirmation. Browse team contacts → download capability statement → schedule consultation call.
