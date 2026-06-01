# Contact & Partnerships Specification

## Overview
The Contact section is the lead-generation endpoint for government officials and potential investors. It features a two-tier contact form (simple fields first, optional detailed follow-up), split-panel layout with supporting trust content (office info, team contacts, partner logos), and CTA elements including a downloadable capability statement PDF and a "Schedule a Call" option.

## User Flows
- **Submit a basic inquiry** — User fills in name, email, organization, and message. On submit, the form expands to reveal optional detailed fields (phone, role, project type, estimated timeline).
- **Skip detailed follow-up** — User can submit just the basic fields without filling optional details.
- **Download capability statement** — User clicks to download a PDF portfolio/capability statement as immediate value before or after submitting.
- **Schedule a consultation call** — User clicks a scheduling CTA (links to external calendar/scheduling tool).
- **Browse trust signals** — User scans partner logos, awards, and certifications to build confidence.
- **Find a specific contact** — User reads team contact cards to identify the right person for their inquiry type (government partnerships, investor relations, media).

## UI Requirements
- Split panel layout: form on left (60%), contact info + trust signals on right (40%)
- Two-tier form: basic fields always visible, detailed fields expand inline after first submit or via "Add more details" toggle
- Form uses glassmorphism: frosted glass input fields with backdrop-blur, rounded-xl, subtle borders
- CTA buttons: primary glass-tinted (blue-500/80, rounded-full) for submit, secondary neumorphic pill for download PDF
- Right panel: stacked glass cards — office location (with embedded map placeholder), team contact cards, partner logo grid
- Partner logos as grayscale → color on hover, glass card container
- "Schedule a Call" as a prominent neumorphic CTA card with calendar icon
- Navy/slate dark background with subtle grid texture
- Form validation: required fields marked, inline error states
- Success state: form replaced with confirmation message and next steps
- Mobile: split collapses to single column, form stacks above info cards
- Light/dark mode via dark: variants

## Configuration
- shell: true
