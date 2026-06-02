# Milestone 3: About & Mission

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

Implement the About & Mission section — the company's origin story, core values, and founder profile, designed to build trust with investors and government officials.

## Overview

The About section tells JCA 1221's story through a founder's letter in a large frosted glass panel, four color-coded value pillar sections (Integrity, Circular Economy, Service Over Profit, Track Record), and a lean founder profile with quotes and career milestones. Each value pillar has its own distinct background color for visual rhythm as users scroll.

**Key Functionality:**
- Founder's letter in a frosted glass panel over water-gradient background
- Four value pillar sections with distinct colors (amber, emerald, blue, slate/gold)
- Glassmorphic value cards with icons, descriptions, and sub-points
- Founder profile with photo, quotes, and vertical milestone timeline
- CTA button linking to Contact & Partnerships

## Components Provided

Copy from `product-plan/sections/about-and-mission/components/`:

- `FounderLetterSection.tsx` — Dark water-gradient background, atmospheric glass orbs, frosted glass letter panel with signature
- `ValuePillarSection.tsx` — Four color-coded sections with glass sub-point cards, alternating layout
- `FounderProfileSection.tsx` — Photo in glass circle, quote cards, vertical milestone timeline
- `AboutView.tsx` — Main composer

## Props Reference

The `AboutView` component expects:

**Data props:**
- `founderLetter: string` — First-person founder narrative
- `founderProfile: FounderProfile` — Name, title, bio, quotes array, milestones array
- `valuePillars: ValuePillar[]` — Four pillars with icon, description, sub-points, colors
- `ctaText: string` — CTA button label

**Callback props:**
| Callback | Triggered When |
|----------|---------------|
| `onCtaClick` | User clicks the CTA button at bottom |

## Expected User Flows

### Flow 1: Read Founder's Letter
1. User enters About section
2. Sees dark water-gradient background with atmospheric glass orbs
3. Reads founder's personal letter in a frosted glass panel
4. Scans signature at bottom of the letter

### Flow 2: Scroll Through Value Pillars
1. User scrolls through four color-coded sections
2. Each section has a sticky pillar header card (icon + title + description)
3. Below each header, stacked glass cards display sub-points
4. Background color shifts between amber → emerald → blue → slate/gold

### Flow 3: View Founder Background
1. User scrolls to founder profile section
2. Sees founder photo in glass circle
3. Reads pull quotes in frosted glass cards
4. Scans career milestones on a vertical timeline

### Flow 4: Navigate to Contact
1. User reaches the CTA at the bottom
2. Clicks CTA button
3. Navigates to Contact & Partnerships section

## Testing

See `product-plan/sections/about-and-mission/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/about-and-mission/README.md` — Feature overview and design intent
- `product-plan/sections/about-and-mission/tests.md` — UI behavior test specs
- `product-plan/sections/about-and-mission/components/` — React components
- `product-plan/sections/about-and-mission/types.ts` — TypeScript interfaces
- `product-plan/sections/about-and-mission/sample-data.json` — Test data
- `product-plan/sections/about-and-mission/screenshot.png` — Visual reference

## Done When

- [ ] Founder's letter renders in frosted glass panel over dark gradient
- [ ] Four value pillar sections render with distinct colors
- [ ] Value cards use glassmorphism with proper depth
- [ ] Founder profile shows photo, quotes, and timeline
- [ ] CTA button links to Contact section
- [ ] Matches the visual design (see screenshot)
- [ ] Responsive on mobile
