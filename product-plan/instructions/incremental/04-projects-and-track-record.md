# Milestone 4: Projects & Track Record

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

Implement the Projects & Track Record section — a portfolio showcase that proves JCA 1221's track record through project case studies with impact metrics, awards, and partner details.

## Overview

The Projects section has two views: a listing page and a detail page. The listing opens with animated portfolio-wide summary stats, followed by filterable project cards in a 2-column grid. Each card links to an individual project detail page with a full-bleed photo hero, key stats, technology overview, environmental impact metrics, and awards.

**Key Functionality:**
- Portfolio summary bar with 4 animated counters (total water treated, projects operational, awards, communities)
- Filter pills for project status: All, Operational, In Development, Planning
- 2-column project card grid (1-col on mobile) with status badges and key metrics
- Project detail: full-bleed dark hero → glass bridge panel → stat grid → tech → impact → awards → partners
- Card hover: lift + blue glass tint

## Components Provided

Copy from `product-plan/sections/projects-and-track-record/components/`:

- `PortfolioSummaryBar.tsx` — Animated stat counters with glass icon circles
- `ProjectCard.tsx` — Card with gradient image, status badge, location, key metric, hover overlay
- `ProjectList.tsx` — Composer: summary bar → filter pills → project grid → empty state
- `ProjectDetail.tsx` — Full-bleed hero, glass bridge, stats, tech, impact, awards, partners

## Props Reference

**ProjectList props:**
| Callback | Triggered When |
|----------|---------------|
| `onProjectClick` | User clicks a project card |
| `onFilterChange` | User clicks a status filter pill |

**ProjectDetail props:**
| Callback | Triggered When |
|----------|---------------|
| `onBack` | User clicks back button |

## Expected User Flows

### Flow 1: Browse Project Portfolio
1. User lands on Projects page
2. Sees animated portfolio stats counting up at the top
3. Views 2-column grid of project cards (Puerto Princesa, Gingoog, Del Carmen)
4. Status badges visible: Operational (green), In Development (amber), Planning (slate)

### Flow 2: Filter by Status
1. User clicks "Operational" filter pill (neumorphic, with colored dot)
2. Grid filters to show only Puerto Princesa
3. User clicks "All" to reset

### Flow 3: View Project Detail
1. User clicks Puerto Princesa card
2. Navigates to detail view with full-bleed dark gradient hero (photo, project name, location, status)
3. Glass bridge panel pulls up with description
4. Scrolls through: 4-col stat grid → blue-tinted tech section → emerald impact metrics → amber awards (Asian Water Award 2025) → partners

### Flow 4: Empty Award State
1. User views Gingoog project detail
2. Awards section shows empty state ("No awards yet — project in development")

## Empty States

- **No projects matching filter:** Grid shows empty state with guidance
- **Project with no awards:** Awards section shows contextual empty state message
- **Project with no partners:** Partners section shows empty state

## Testing

See `product-plan/sections/projects-and-track-record/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/projects-and-track-record/README.md` — Feature overview and design intent
- `product-plan/sections/projects-and-track-record/tests.md` — UI behavior test specs
- `product-plan/sections/projects-and-track-record/components/` — React components
- `product-plan/sections/projects-and-track-record/types.ts` — TypeScript interfaces
- `product-plan/sections/projects-and-track-record/sample-data.json` — Test data
- `product-plan/sections/projects-and-track-record/screenshot.png` — Visual reference

## Done When

- [ ] Portfolio summary bar shows animated counters
- [ ] Filter pills filter project grid correctly
- [ ] Project cards render with images, badges, metrics
- [ ] Project detail renders with full-bleed hero and all sections
- [ ] Empty states display properly
- [ ] Matches the visual design (see screenshot)
- [ ] Responsive on mobile
