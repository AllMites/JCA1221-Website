# Application Shell

## Overview

Top navigation bar with glassmorphism treatment (frosted glass, backdrop blur, tinted transparency) and neumorphic navigation pills. A glass-tinted "Partner With Us" CTA button sits in the nav.

## Navigation Structure

- Home → Hero landing section
- About & Mission → Company story, values, founder
- Projects & Track Record → Case studies and project portfolio
- Technology & Approach → Technical deep dive
- Contact & Partnerships → Inquiry form and contact details

## Design Language

- **Glassmorphism** for structural containers: nav bar (`bg-white/60`, `backdrop-blur-xl`, `border-white/20`), mobile slide-out panel
- **Neumorphism** for interactive pills: raised shadows for inactive, inset shadows for active/pressed
- **Glass-tinted CTA**: `bg-blue-500/80`, `backdrop-blur-md`, `rounded-full`, blue glow shadow
- Footer is a subtle glass-tinted bar

## Components

- `AppShell.tsx` — Main layout wrapper with glass nav, content area, glass footer
- `MainNav.tsx` — Navigation with neumorphic pills, mobile hamburger with glass slide-out
- `UserMenu.tsx` — CTA button ("Partner With Us") with glass-tinted treatment

## Props

### AppShell
- `children: React.ReactNode`
- `navigationItems: Array<{ label, href, isActive? }>`
- `user?: { name, avatarUrl? }`
- `onNavigate?: (href) => void`
- `onLogout?: () => void`

### MainNav
- `items: Array<{ label, href, isActive? }>`
- `onNavigate?: (href) => void`

### UserMenu
- `user?: { name, avatarUrl? }`
- `onLogout?: () => void`

## Responsive Behavior

- **Desktop:** Top nav full width, neumorphic pills in a row, CTA on right
- **Mobile:** Hamburger icon opens glass slide-out panel with stacked nav pills
