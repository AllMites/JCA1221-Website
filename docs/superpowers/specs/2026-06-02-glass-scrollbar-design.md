# Glass Scrollbar — Neumorphism + Glassmorphism Widget

## Overview

Replace the default browser scrollbar with a custom React scrollbar widget styled in the site's existing glassmorphism/neumorphism visual language. Cross-browser compatible (no WebKit-only pseudo-elements for the main scrollbar).

## Behavior

- **Visibility**: On-hover only. Scrollbar fades in when user hovers `.min-h-screen` wrapper, fades out on mouse leave. 300ms opacity transition.
- **Drag**: Thumb is draggable. Mousedown on thumb → track movement → updates `document.documentElement.scrollTop`.
- **Click-to-jump**: Click on track (not thumb) scrolls to that position ratio.
- **Auto-hide idle**: If mouse stays hovered but scrolling stops for 2s, thumb fades to minimal state (never fully hides while hovered).
- **Thumb size**: Proportional to viewport-to-content ratio (like native).

## Styling

All tokens use the existing Tailwind v4 `@theme` variables.

### Track
- `position: fixed; right: 4px; top: 8px; bottom: 8px; width: 8px; z-index: 9999`
- `border-radius: 9999px`
- `bg-white/20 dark:bg-white/5` — translucent base
- `backdrop-blur-md` — frosted glass
- `border border-white/10 dark:border-white/5` — subtle edge
- `shadow-[0_2px_8px_rgba(0,0,0,0.04)]` — light ambient

### Thumb
- `width: 100%; border-radius: 9999px`
- `bg-gradient-to-b from-white/50 to-white/20 dark:from-white/30 dark:to-white/10`
- `shadow-[inset_1px_1px_2px_rgba(255,255,255,0.7),inset_-1px_-1px_2px_rgba(255,255,255,0.1)]` — neumorphism raised/inset
- Hover: `from-white/70 to-white/40` — brighter
- Active (dragging): `from-white/80 to-white/50` — brightest
- `transition: background 200ms`
- Min height: 40px (prevents vanishing on short content)

### State transitions
- **hidden**: `opacity: 0; pointer-events: none`
- **visible (hover)**: `opacity: 1; pointer-events: auto`
- **idle after scroll**: thumb brightness dims slightly but stays visible while hovered

## Component Architecture

### `GlassScrollbar` (src/components/GlassScrollbar.tsx)

A wrapper component that:
1. Hides native scrollbar on its scrollable area
2. Renders a fixed-position glass track + thumb overlay
3. Syncs thumb position with `scroll` events
4. Handles drag interaction on thumb
5. Handles click-to-jump on track

**Props:**
```ts
interface GlassScrollbarProps {
  children: React.ReactNode
  /** Optional class for the scrollable container */
  className?: string
  /** Whether this is the page-level scrollbar (fixed position) vs section-level (relative) */
  variant?: 'page' | 'section'
}
```

### Page-level usage (`variant="page"`)
- Renders track with `position: fixed` at screen-right
- Scrolls `document.documentElement`
- Applied once in `AppShell.tsx` wrapping the main content area

### Section-level usage (`variant="section"`)
- Renders track with `position: absolute` within a `position: relative` container
- Scrolls the ref'd inner container
- Used in `ProjectCarousel` and any other overflow sections

## Implementation Steps

1. Create `GlassScrollbar.tsx` component
2. Add styles to `src/index.css` (or colocate in component)
3. Hide native scrollbar globally (`src/index.css`)
4. Integrate `variant="page"` into `AppShell.tsx`
5. Optional: integrate `variant="section"` into `ProjectCarousel.tsx`
6. Test in Chrome, Firefox, Edge, Safari

## Edge Cases

- **Short content** (no scroll): component renders but thumb has 0 height → hidden automatically (no scroll events fire)
- **Resize**: recalculate thumb height on window resize
- **Content change**: use `ResizeObserver` on scroll container to recalc
- **Reduced motion**: respect `prefers-reduced-motion` — skip fade transitions
- **Touch devices**: scrollbar still shows on hover but drag is disabled on touch (native scroll works fine)
