# Home

## Overview

Full-screen immersive landing page for JCA 1221 Holdings. Hero section dominates initial viewport with water imagery and brand statement. Below the fold, sections cycle through visually distinct colored backgrounds: a horizontal-scrolling project carousel with award cards, mission statements, impact statistics, and future expansion plans.

## User Flows

- **Arrive on page** — Full-screen hero fills viewport. No nav chrome visible. Scroll down or hover edge to trigger navigation.
- **Scroll to projects carousel** — Horizontal scroll of project cards with associated awards. Cards lift and reveal blue accent on hover.
- **Hover edge to reveal shell** — Moving mouse to top edge fades in the sticky navigation header.
- **Scroll through mission section** — Alternating background color band with integrity statements and core values.
- **View impact statistics** — Animated number counters for key metrics.
- **Read expansion vision** — Section on Siargao pyrolysis plant and solid waste management plans.

## Design Decisions

- Full-screen hero with edge-triggered shell reveal (64px top zone)
- Horizontal-scrolling carousel with snap-scroll for projects
- Animated counters using IntersectionObserver + ease-out cubic animation
- Distinct background colors for each sub-section for visual rhythm
- Glassmorphism throughout: frosted panels, tinted transparency, colored shadows

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- `HeroSection` — Full-screen hero with background image, company name, tagline
- `ProjectCarousel` — Horizontal-scrolling project cards with award badges
- `MissionSection` — Color-banded mission values with icons
- `ImpactStats` — Animated number counters with labels
- `HomeView` — Main composer assembling all sub-sections

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onProjectClick` | User clicks a project card |
| `onViewProjects` | User clicks "View All Projects" |
| `onPartnerClick` | User clicks "Partner With Us" |
