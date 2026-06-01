# Home Specification

## Overview
Full-screen immersive landing page for JCA 1221 Holdings. Hero section dominates initial viewport with water imagery and brand statement. Below the fold, sections cycle through visually distinct colored backgrounds: a horizontal-scrolling project carousel with award cards, mission statements, impact statistics, and future expansion plans. Navigation chrome is hidden by default and reveals on mouse entry to screen edges.

## User Flows
- **Arrive on page** — Full-screen hero fills viewport. No nav chrome visible. Scroll down or hover edge to trigger navigation.
- **Scroll to projects carousel** — Horizontal scroll of project cards with associated awards. Cards lift and reveal blue accent on hover. Clicking navigates to Projects detail.
- **Hover edge to reveal shell** — Moving mouse to top edge fades in the sticky navigation header with section links and "Partner With Us" CTA.
- **Scroll through mission section** — Alternating background color band with integrity statements and core values.
- **View impact statistics** — Animated number counters for key metrics (cubic meters treated, races hosted, awards won, communities served).
- **Read expansion vision** — Section on Siargao pyrolysis plant and solid waste management expansion plans.

## UI Requirements
- Full-screen hero with background image (water/coastal Philippines), company name, tagline "Water Renewal for Generations", brief value statement
- Edge-triggered shell reveal: nav header fades in on mouse proximity to top edge (64px zone)
- Horizontal scrolling project cards section with distinct background color
- Project cards: image, project name, location, award badge, lift + blue accent on hover
- Mission & Values section: colored background band, stacked value cards with icons
- Impact stats section: large numbers with labels, counting animation
- Expansion section: Siargao focus with pyrolysis plant details
- Smooth scroll between sections, snap or standard
- All sections use distinct background colors for visual rhythm
- Light and dark mode support across all sections

## Configuration
- shell: true
