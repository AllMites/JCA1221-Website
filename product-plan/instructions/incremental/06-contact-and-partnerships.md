# Milestone 6: Contact & Partnerships

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** Milestone 1 (Shell) complete

---

## About This Handoff

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Product requirements and user flow specifications
- Design system tokens (colors, typography)
- Sample data showing the shape of data components expect
- Test specs focused on user-facing behavior

**Your job:**
- Integrate these components into your application
- Wire up callback props to your routing and business logic
- Replace sample data with real data from your backend
- Implement loading, error, and empty states

The components are props-based — they accept data and fire callbacks. How you architect the backend, data layer, and business logic is up to you.

---

## Goal

Implement the Contact & Partnerships section — the lead-generation endpoint converting government officials and investors into partnership inquiries.

## Overview

A split-panel layout with a two-tier contact form on the left (60%) and trust-signal content on the right (40%). The form collects basic required fields first, with an expandable detailed section. The right panel stacks: Schedule a Call CTA, office info, team contact cards, partner logos, and downloadable capability statement. Navy/slate dark background with grid texture.

**Key Functionality:**
- Two-tier contact form: basic fields always visible, detailed fields expand via toggle
- Inline validation with error states per field
- Success state with confirmation message and numbered next steps
- Schedule a Call CTA linking to external calendar
- Downloadable capability statement PDF
- Team contact cards with inquiry category tags
- Partner logo grid (grayscale → color on hover)
- Glassmorphic inputs with backdrop-blur

## Components Provided

Copy from `product-plan/sections/contact-and-partnerships/components/`:

- `ContactForm.tsx` — Two-tier form with validation, expandable details, success state
- `ContactInfoPanel.tsx` — Right panel: schedule CTA, office card, team cards, partner logos, download CTA
- `ContactView.tsx` — Main composer: split panel layout

## Props Reference

**ContactView props:**
| Callback | Triggered When |
|----------|---------------|
| `onSubmitBasic` | User submits form with basic fields only |
| `onSubmitDetailed` | User submits form with detailed fields expanded |
| `onDownloadPDF` | User clicks capability statement download |
| `onScheduleCall` | User clicks schedule-a-call button |

## Expected User Flows

### Flow 1: Submit Basic Inquiry
1. User fills name, email, organization, message
2. User clicks "Send Inquiry" (glass-tinted blue button)
3. Form validates — errors show inline for missing/invalid fields
4. On success: form replaced with checkmark, confirmation message, numbered next steps

### Flow 2: Add Detailed Fields
1. User clicks "Add more details (helps us prepare)" toggle
2. Animated expand reveals: phone, role, project type dropdown, timeline dropdown
3. User fills optional fields and submits

### Flow 3: Find Right Contact
1. User scans right panel team cards (Founder, Gov Partnerships Head, Investor Relations Director)
2. Each card shows name, title, email, phone, and inquiry category tags
3. User emails the right person directly

### Flow 4: Download Capability Statement
1. User sees "JCA 1221 Capability Statement" card in right panel
2. Shows file name, size (4.2 MB), and description
3. User clicks to download PDF

### Flow 5: Schedule a Call
1. User sees prominent "Schedule a Consultation" card at top of right panel
2. Reads description about 30-min video call
3. Clicks "Book a Call" button — links to external calendar

## Empty States

- No empty states — all content is static/editorial
- Team contacts and partner logos are pre-populated

## Testing

See `product-plan/sections/contact-and-partnerships/tests.md` for UI behavior test specs.

## Files to Reference

- `product-plan/sections/contact-and-partnerships/README.md` — Feature overview
- `product-plan/sections/contact-and-partnerships/tests.md` — UI behavior test specs
- `product-plan/sections/contact-and-partnerships/components/` — React components
- `product-plan/sections/contact-and-partnerships/types.ts` — TypeScript interfaces
- `product-plan/sections/contact-and-partnerships/sample-data.json` — Test data
- `product-plan/sections/contact-and-partnerships/screenshot.png` — Visual reference

## Done When

- [ ] Two-tier form renders with validation
- [ ] Detailed fields expand/collapse with animation
- [ ] Success state appears after submission
- [ ] Right panel shows all trust content (schedule, office, team, logos, download)
- [ ] Callbacks fire correctly for all CTAs
- [ ] Matches the visual design (see screenshot)
- [ ] Responsive on mobile (stacks vertically)
