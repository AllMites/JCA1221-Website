# About & Mission Specification

## Overview
The About & Mission section tells JCA 1221's origin story and institutional values. It opens with a personal founder's letter displayed in a large frosted glass panel, then transitions into four core value pillars — Integrity, Circular Economy, Service Over Profit, and Track Record — each presented as a distinct colored section with vertically stacked liquid-glass cards. A lean founder profile block with key quotes and career milestones closes the page.

## User Flows
- **Read founder's letter** — User encounters a large frosted glass panel containing a personal statement from the founder. The glass panel floats over an atmospheric water-themed background. Text is solid and legible over the translucent glass.
- **Scroll through value pillars** — Each value pillar occupies its own distinctly colored section. Within each, vertically stacked glass cards present the pillar's title, icon, description, and supporting sub-points. Section background colors shift as the user scrolls, creating visual rhythm.
- **View founder profile** — Below the pillars, a lean founder block shows photo, name, role, 2-3 key quotes, and a timeline of 5 career milestones. No full bio — scannable for investors and officials.
- **Navigate to contact** — A CTA at the bottom invites users to reach out for partnerships, linking to the Contact & Partnerships section.

## UI Requirements
- Founder's letter as a large frosted glass panel with backdrop-blur-xl, rounded-3xl borders, subtle white/20 border, and colored shadow over a water-gradient background
- Four value pillar sections, each with a distinct background color (amber/cream for Integrity, emerald/teal for Circular Economy, blue for Service Over Profit, slate/gold for Track Record)
- Value cards use glassmorphism: backdrop-blur, semi-transparent tinted backgrounds, subtle glass edges (border-white/20 or white/10), rounded-2xl
- Glass cards have varying depth: different shadow elevations and blur intensities for staggered layering
- Text always sits on solid or high-contrast surfaces — never directly on glass without legibility treatment
- Founder profile: photo placeholder, name + role, 2-3 pull quotes in glass-styled quote blocks, vertical timeline with 5 milestone dots
- CTA button linking to Contact section, styled with primary blue tinted glass
- All sections responsive (mobile reflow), light/dark mode support via dark: variants
- Smooth scroll transitions between color sections

## Configuration
- shell: true
