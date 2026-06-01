# Application Shell Specification

## Overview
Top navigation bar with glassmorphism treatment (frosted glass, backdrop blur, tinted transparency) and neumorphic navigation pills. A glass-tinted "Partner With Us" CTA button sits in the nav. Content pages include a floating glass sidebar with in-page section anchors.

## Navigation Structure
- Home → Hero landing section
- About & Mission → Company story, values, founder
- Projects & Track Record → Case studies and project portfolio
- Technology & Approach → Technical deep dive
- Contact & Partnerships → Inquiry form and contact details

## CTA Button
"Partner With Us" button in the top navigation bar. Glass-tinted treatment: blue-500/80 background with backdrop-blur-md, subtle glass edge (border-white/20), rounded-full pill shape. Hover deepens tint to blue-500/90.

## Layout Pattern
- **Top nav bar:** Sticky glass panel — bg-white/60 dark:bg-slate-950/60, backdrop-blur-xl, subtle blue-tinted shadow, white/20 glass bottom border
- **Nav items:** Neumorphic pill buttons. Raised state: soft light+dark offset shadows. Active state: inset shadow (pressed-in). Rounded-full pill shape. Background blends with nav surface color.
- **Sidebar:** Floating glass card on right side — bg-white/70 dark:bg-slate-900/70, backdrop-blur-xl, glass edge border, blue-tinted shadow
- **Content area:** Between nav bar and sidebar, max-width constrained
- **Footer:** Subtle glass-tinted bar with site name and location

## Responsive Behavior
- **Desktop:** Top nav full width, glass sidebar visible, content area with max-width
- **Tablet:** Top nav, sidebar below content or collapsible
- **Mobile:** Hamburger opens glass slide-out panel (backdrop-blur-xl, glass edge). Nav items as neumorphic pills stacked vertically.

## Design Notes
- Glassmorphism used for structural containers (nav bar, sidebar, mobile panel, footer)
- Neumorphism used for interactive elements (nav pills, hamburger toggle)
- Glass-tinted treatment for primary CTA (bridges both: translucent like glass, interactive like neumorphic)
- Active section highlighted with inset neumorphic pressed state
- Blue-tinted shadows throughout for water aesthetic consistency
- Clean, professional aesthetic suited for government and investor audiences
- All glass elements use solid text layers for legibility
