# Technology & Approach Specification

## Overview
The Technology section explains how JCA 1221's environmental infrastructure works — at an investor-friendly level without drowning in numbers. It opens with a high-level visual process flow (wastewater → clean water, step by step), followed by a comparison of JCA's approach versus traditional Philippine wastewater treatment. A core technology grid showcases the four pillars: biological treatment, modular design, solar/IoT, and scalability. A dynamic horizontal-scrolling dashboard displays semi-live stats and line charts for cumulative water treated and daily treatment volumes.

## User Flows
- **Understand the process** — User scrolls through a visual step-by-step flow of how water goes from raw wastewater to clean recycled output. Each step has an icon, title, and one-sentence explanation.
- **Compare vs traditional** — A comparison section side-by-side shows why JCA's approach differs: nature-mimicking vs chemical-heavy, modular vs monolithic, affordable vs expensive, transparent vs opaque.
- **Explore core technology pillars** — Grid of expandable glass cards covering biological treatment, modular design, solar/IoT, and scalability. Each card has a brief description and supporting tags.
- **View live impact dashboard** — Horizontal-scrolling carousel of chart cards: cumulative water treated since commissioning (line chart), daily treatment volume (bar chart), and key operational metrics. Charts are stylized with animated bars/lines — not real data connections.
- **Learn about scalability** — A section explaining the "city to island" scaling philosophy: same technology stack works from 300k-person cities to 40k-person island communities.

## UI Requirements
- Distinct colored section backgrounds for visual rhythm (blue tech section, emerald process flow, amber comparison, slate charts)
- Visual process flow: horizontal steps with connector lines/arrows, each step as a glass card with icon + title + short description
- Comparison section: 2-column layout with JCA column vs Traditional column. Comparison points as stacked glass cards with check/X indicators
- Core technology grid: 2x2 grid on desktop, stacked on mobile. Each card with icon, title, description, technology tags
- Horizontal-scrolling dashboard: snap-scroll cards containing styled chart visualizations (CSS-only line/bar representations, not real charting library)
- Charts use animated bars (height transitions) and SVG-like line paths for cumulative data
- Each chart card shows: metric title, current value, period label, and visual chart
- "Since commissioning" stats show running totals with date reference
- Glassmorphism throughout: backdrop-blur cards, glass edges, colored shadows
- Mobile responsive: process flow stacks vertically, comparison collapses to single column, grid becomes 1-col
- Light/dark mode via dark: variants

## Configuration
- shell: true
