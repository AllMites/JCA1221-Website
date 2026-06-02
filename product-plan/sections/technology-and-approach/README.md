# Technology & Approach

## Overview

The Technology section explains how JCA 1221's environmental infrastructure works — at an investor-friendly level without drowning in numbers. It opens with a high-level visual process flow (wastewater → clean water, step by step), followed by a comparison of JCA's approach versus traditional Philippine wastewater treatment. A core technology grid showcases the four pillars: biological treatment, modular design, solar/IoT, and scalability. A dynamic auto-scrolling dashboard displays live-updating stats and CSS-only charts.

## User Flows

- **Understand the process** — 5-step visual flow with staggered animations and connector line
- **Compare vs traditional** — JCA vs Traditional comparison rows with Check/X indicators
- **Explore core technology pillars** — 2×2 grid of glass cards with technology tags
- **View live impact dashboard** — Auto-scrolling carousel of metric cards with CSS charts and time-based live counters

## Design Decisions

- Four distinct colored sections: emerald (process), amber (comparison), blue (tech grid), slate (dashboard)
- CSS-only charts: SVG polylines for line/area, div-based bars — no charting library
- Auto-scrolling carousel: cards tripled for seamless wraparound, 40px/s speed
- Live counters: time-based incrementing using requestAnimationFrame, realistic per-metric tick rates
- "Live" ping animation indicator on each dashboard card
- Hidden scrollbar, gradient fade edges on carousel

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- `ProcessFlowSection` — 5-step emerald flow with animated connector
- `ComparisonSection` — Amber JCA vs Traditional glass rows
- `TechnologyGridSection` — Blue 2×2 glass pillar grid
- `LiveDashboardSection` — Auto-scrolling metric cards with CSS charts
- `TechnologyView` — Main composer

## Callback Props

No callbacks — this is a read-only informational section.
