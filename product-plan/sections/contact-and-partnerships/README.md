# Contact & Partnerships

## Overview

The Contact section is the lead-generation endpoint for government officials and potential investors. It features a two-tier contact form (simple fields first, optional detailed follow-up), split-panel layout with supporting trust content (office info, team contacts, partner logos), and CTA elements including a downloadable capability statement PDF and a "Schedule a Call" option.

## User Flows

- **Submit a basic inquiry** — Fill name, email, organization, message. Form validates and submits.
- **Expand detailed fields** — Toggle reveals optional fields: phone, role, project type, timeline.
- **Download capability statement** — Click to download corporate profile PDF.
- **Schedule a consultation call** — Click scheduling CTA linking to external calendar.
- **Find a specific contact** — Scan team cards to identify right person per inquiry type.

## Design Decisions

- Split panel 60/40 layout (form left, trust content right, sticky on desktop)
- Two-tier form: basic fields always visible, detailed fields expand via animated toggle
- Glassmorphic inputs: rounded-xl, backdrop-blur, subtle white borders
- Inline validation with error states (red border, alert icon, message)
- Success state: green checkmark circle + numbered next steps
- Navy/slate dark background with grid texture and blue atmospheric orbs
- Right panel stacks vertically: schedule CTA → office → team → logos → download
- Partner logos: grayscale default, color on hover

## Visual Reference

See `screenshot.png` for the target UI design.

## Components Provided

- `ContactForm` — Two-tier form with validation, expand, success state
- `ContactInfoPanel` — Right panel: schedule, office, team, logos, download
- `ContactView` — Main composer: split panel layout

## Callback Props

| Callback | Triggered When |
|----------|---------------|
| `onSubmitBasic` | User submits form with basic fields only |
| `onSubmitDetailed` | User submits form with detailed fields |
| `onDownloadPDF` | User clicks capability statement download |
| `onScheduleCall` | User clicks schedule-a-call button |
