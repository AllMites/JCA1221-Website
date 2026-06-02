# About & Mission

## Overview

The About & Mission section tells JCA 1221's origin story and institutional values. It opens with a personal founder's letter displayed in a large frosted glass panel, then transitions into four core value pillars — Integrity, Circular Economy, Service Over Profit, and Track Record — each presented as a distinct colored section with vertically stacked liquid-glass cards. A lean founder profile block with key quotes and career milestones closes the page.

## User Flows

- **Read founder's letter** — Large frosted glass panel containing a personal statement from the founder over water-themed background.
- **Scroll through value pillars** — Each pillar occupies its own distinctly colored section. Glass cards present title, icon, description, and sub-points.
- **View founder profile** — Photo, name, role, 2-3 key quotes, and a timeline of 5 career milestones.
- **Navigate to contact** — CTA at bottom invites users to reach out for partnerships.

## Design Decisions

- Dark water-gradient background (slate-950 → blue-950) with atmospheric glass orbs for founder letter
- Four color-coded value pillar sections: amber (Integrity), emerald (Circular Economy), blue (Service Over Profit), slate/gold (Track Record)
- Alternating flex layouts (even: row, odd: row-reverse) for visual variety
- Glassmorphism: backdrop-blur-2xl, translucent tinted backgrounds, glass edges
- Vertical timeline with gradient line and dot indicators for milestones
- All cards use varying blur intensities for staggered depth

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- `FounderLetterSection` — Frosted glass letter panel over dark water gradient
- `ValuePillarSection` — Four color-coded sections with glass sub-point cards
- `FounderProfileSection` — Photo in glass circle, quote cards, timeline
- `AboutView` — Main composer

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onCtaClick` | User clicks the CTA button at bottom |
