# UI Data Shapes

These types define the shape of data that the UI components expect to receive as props. They represent the **frontend contract** — what the components need to render correctly.

How you model, store, and fetch this data on the backend is an implementation decision. You may combine, split, or extend these types to fit your architecture.

## Entities

- **HomeSection** — Hero, project cards, mission statements, impact stats, expansion info (used in: home)
- **FounderProfile** — Founder's letter, milestones, quotes, profile info (used in: about-and-mission)
- **ValuePillar** — Core company value with icon, description, and sub-points (used in: about-and-mission)
- **Project** — Wastewater/solid waste facility with location, status, stats, awards, partners (used in: projects-and-track-record, home)
- **ProcessStep** — A step in the wastewater-to-clean-water flow (used in: technology-and-approach)
- **ComparisonPoint** — JCA vs traditional approach comparison row (used in: technology-and-approach)
- **TechnologyPillar** — Core technology area with tags (used in: technology-and-approach)
- **LiveMetric** — Dashboard metric card with chart data (used in: technology-and-approach)
- **ContactFormData** — Inquiry form fields (used in: contact-and-partnerships)
- **TeamContact** — Named point of contact for inquiries (used in: contact-and-partnerships)
- **OfficeInfo** — Physical office location and contact details (used in: contact-and-partnerships)
- **PartnerLogo** — Trust-signal partner/certifier logo (used in: contact-and-partnerships)

## Per-Section Types

Each section includes its own `types.ts` with the full interface definitions:

- `sections/home/types.ts`
- `sections/about-and-mission/types.ts`
- `sections/projects-and-track-record/types.ts`
- `sections/technology-and-approach/types.ts`
- `sections/contact-and-partnerships/types.ts`

## Combined Reference

See `overview.ts` for all entity types aggregated in one file.
