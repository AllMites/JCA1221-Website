# Milestone 2: Home

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

Implement the Home section — a full-screen immersive landing page that introduces JCA 1221 Holdings and drives users into the rest of the site.

## Overview

The Home page is the primary entry point. It opens with a full-screen hero section (company name, tagline "Water Renewal for Generations", value statement over water imagery). Below the fold, visually distinct colored sections cycle through: a horizontal-scrolling project carousel, mission statements, animated impact statistics, and a future expansion section highlighting the Siargao pyrolysis plant.

**Key Functionality:**
- Full-screen hero with water-themed background and brand messaging
- Edge-triggered shell reveal: nav fades in when mouse approaches top 64px of viewport
- Horizontal-scrolling project carousel with award-badged cards
- Animated impact stat counters (cubic meters treated, races hosted, awards, communities)
- Color-banded mission section with integrity statements
- Expansion vision section for solid waste management plans

## Components Provided

Copy the section components from `product-plan/sections/home/components/`:

- `HeroSection.tsx` — Full-screen hero with background image, company name, tagline, value statement
- `ProjectCarousel.tsx` — Horizontal-scrolling carousel of project snapshots with award badges
- `MissionSection.tsx` — Alternating color band with mission values and icons
- `ImpactStats.tsx` — Animated number counters with labels
- `ExpansionSection.tsx` — Future expansion plans with location and highlights
- `HomeView.tsx` — Main composer that assembles all sections

## Props Reference

The `HomeView` component expects:

**Data props:**
- `hero: HomeHero` — company name, tagline, value statement, background image URL
- `projects: ProjectSnapshot[]` — project cards for the carousel
- `impactStats: ImpactStat[]` — animated counters
- `missionStatements: MissionStatement[]` — mission values
- `expansion: ExpansionPlan` — expansion plans

**Callback props:**
| Callback | Triggered When |
|----------|---------------|
| `onProjectClick` | User clicks a project card in the carousel |
| `onViewProjects` | User clicks "View All Projects" CTA |
| `onPartnerClick` | User clicks "Partner With Us" CTA |

## Expected User Flows

### Flow 1: Arrive and Explore
1. User lands on the home page — full-screen hero fills viewport, no nav visible
2. User scrolls to reveal project carousel with horizontal-scrolling cards
3. User hovers over a project card — card lifts with blue glass tint
4. User clicks a project card — navigates to project detail

### Flow 2: View Impact Stats
1. User scrolls to the impact stats section
2. Animated counters fire on scroll into view, counting up from zero
3. User sees key metrics: total water treated, races hosted, awards won, communities served

### Flow 3: Navigate via Shell
1. User moves mouse to top 64px of viewport
2. Navigation shell fades in with section links and "Partner With Us" CTA
3. User clicks a nav link to navigate to another section

## Empty States

- All home content is static/editorial — no dynamic empty states
- Project carousel gracefully degrades if fewer than 3 projects

## Testing

See `product-plan/sections/home/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/home/README.md` — Feature overview and design intent
- `product-plan/sections/home/tests.md` — UI behavior test specs
- `product-plan/sections/home/components/` — React components
- `product-plan/sections/home/types.ts` — TypeScript interfaces
- `product-plan/sections/home/sample-data.json` — Test data
- `product-plan/sections/home/screenshot.png` — Visual reference

## Done When

- [ ] Components render with sample data
- [ ] Hero section fills viewport with water-themed background
- [ ] Project carousel scrolls horizontally on desktop
- [ ] Impact stat counters animate on scroll
- [ ] Edge-triggered nav reveal works
- [ ] Matches the visual design (see screenshot)
- [ ] Responsive on mobile
