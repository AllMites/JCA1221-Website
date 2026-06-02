# Projects & Track Record

## Overview

The Projects section showcases JCA 1221's completed and ongoing environmental infrastructure projects. The listing page opens with an impact-first portfolio summary (aggregate stats across all projects), followed by a filterable grid of project cards. Each card links to a scannable one-page project detail view with photo hero, key statistics, technology overview, environmental impact, and awards.

## User Flows

- **Browse project portfolio** — Portfolio-wide stats at top as animated counters. Below, a grid of project cards with photo, location, status badge, and key metric.
- **Filter by status** — Filter pills (All, Operational, In Development, Planning) narrow the grid.
- **View project detail** — Full-bleed photo hero → glass bridge panel → stat grid → tech → impact → awards → partners.
- **Navigate back** — Back button returns to project list.

## Design Decisions

- Portfolio summary bar with IntersectionObserver-triggered animated counters
- Neumorphic filter pills with colored status dots
- Project cards: gradient image area, lift + blue glass tint on hover
- Project detail: dramatic full-bleed dark gradient hero (60vh, min 400px), glass bridge panel pulling up (-mt-8)
- Color-coded sections within detail: blue tech, emerald impact, amber awards
- Handles edge cases: null years, empty awards arrays, projects at different stages

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- `PortfolioSummaryBar` — Animated stat counters with glass icon circles
- `ProjectCard` — Card with gradient image, status badge, hover overlay
- `ProjectList` — Composer: summary → filters → grid → empty state
- `ProjectDetail` — Full-bleed hero, stats, tech, impact, awards, partners

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onProjectClick` | User clicks a project card |
| `onFilterChange` | User clicks a status filter pill |
| `onBack` | User clicks back button in detail view |
