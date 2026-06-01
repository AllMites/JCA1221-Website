# Projects & Track Record Specification

## Overview
The Projects section showcases JCA 1221's completed and ongoing environmental infrastructure projects. The listing page opens with an impact-first portfolio summary (aggregate stats across all projects), followed by a filterable grid of project cards. Each card links to a scannable one-page project detail view with photo hero, key statistics, technology overview, environmental impact, and awards. Both views serve as evidence of the company's track record and integrity for investors and government officials.

## User Flows
- **Browse project portfolio** — User lands on the listing page. Portfolio-wide stats (total water treated, projects operational, awards, communities served) display at the top as animated counters. Below, a grid of project cards shows photo, location, status badge, and key metric. Filter by status: Operational, In Development, Planning.
- **Click project card** — Navigates to the individual project detail page. The home page carousel also links here via `onProjectClick`.
- **Read project detail** — Scannable one-pager: full-bleed photo hero with project name and location overlaid, then key stats row, technology overview, environmental impact metrics, award badge, and partners list.
- **Filter projects by status** — User clicks status filter pills to narrow the grid to operational, development, or planning projects.

## UI Requirements
- Portfolio summary bar with 4 animated stat counters: total water treated, projects operational, awards won, communities served
- Filter pills for project status (Operational, In Development, Planning) with an "All" default
- Project card grid: 2-column on desktop, 1-column on mobile. Each card: photo, project name, location with map pin icon, status badge, one key impact metric
- Card hover: subtle lift + blue glass tint overlay, shadow increase
- Project detail hero: full-width background image with dark gradient overlay, project name as large heading, location, status badge
- Detail key stats row: 3-4 metrics in glass card layout (e.g., Daily Capacity, Water Treated/Year, Project Cost, Communities Served)
- Detail technology section: short description of treatment approach with technology tags
- Detail environmental impact: before/after metrics or improvement percentages
- Detail award section: award card with trophy icon, award title, organization, year
- Detail partners section: partner logos/names
- Back navigation from detail to listing (via onNavigate callback)
- All sections use glassmorphism cards, distinct colored backgrounds, light/dark mode
- Mobile responsive: grid collapses, detail hero stacks vertically

## Configuration
- shell: true
