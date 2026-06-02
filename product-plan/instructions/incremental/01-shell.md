# Milestone 1: Shell

> **Provide alongside:** `product-overview.md`
> **Prerequisites:** None

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

Set up the design tokens and application shell — the persistent chrome that wraps all sections.

## What to Implement

### 1. Design Tokens

Configure your styling system with these tokens:

- See `product-plan/design-system/tokens.css` for CSS custom properties
- See `product-plan/design-system/tailwind-colors.md` for Tailwind configuration
- See `product-plan/design-system/fonts.md` for Google Fonts setup

**Color palette:**
- Primary: `blue` — buttons, links, key accents
- Secondary: `amber` — tags, highlights
- Neutral: `slate` — backgrounds, text, borders

**Typography:**
- Heading: DM Sans (600-700 weight)
- Body: Inter (400-500 weight)
- Mono: IBM Plex Mono (400-500 weight)

### 2. Application Shell

Copy the shell components from `product-plan/shell/components/` to your project:

- `AppShell.tsx` — Main layout wrapper with glass nav, content area, glass footer
- `MainNav.tsx` — Navigation with neumorphic pills, mobile hamburger
- `UserMenu.tsx` — "Partner With Us" glass-tinted CTA button

**Wire Up Navigation:**

Connect navigation to your routing:
- Home → `/` or `/home`
- About & Mission → `/about-and-mission`
- Projects & Track Record → `/projects-and-track-record`
- Technology & Approach → `/technology-and-approach`
- Contact & Partnerships → `/contact-and-partnerships`

**Design Language:**
- **Glassmorphism:** Nav bar with `backdrop-blur-xl`, `bg-white/60 dark:bg-slate-950/60`, `border-white/20`, blue-tinted shadow
- **Neumorphism:** Navigation pills with `rounded-full`, raised shadows (inactive), inset shadows (active)
- **Glass-tinted CTA:** `bg-blue-500/80`, `backdrop-blur-md`, `rounded-full`, blue glow shadow
- **Mobile:** Hamburger opens glass slide-out panel with stacked nav pills

## Files to Reference

- `product-plan/design-system/` — Design tokens
- `product-plan/shell/README.md` — Shell design intent
- `product-plan/shell/components/` — Shell React components

## Done When

- [ ] Design tokens are configured (colors, fonts)
- [ ] Shell renders with glassmorphic navigation
- [ ] Navigation links to all 5 section routes
- [ ] Active section shows inset neumorphic pressed state
- [ ] "Partner With Us" CTA renders as glass-tinted button
- [ ] Responsive on mobile (hamburger + glass slide-out)
- [ ] Light/dark mode variants work
