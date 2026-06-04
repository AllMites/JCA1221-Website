# Technology Carousel Section — Design Spec

**Date:** 2026-06-04
**Status:** Approved
**Branch:** main

## Overview

Replace the static "eyebrow line" on the Technology page with an interactive icon-to-video carousel. Five process-step icons sit along a "from waste to resource" line. Each icon has a corresponding video/GIF preview. The active icon auto-rotates every 5 seconds. Users can hover to peek or click to lock.

New `TechnologyCarouselSection` sits **above** `ProcessFlowSection` in `TechnologyView.tsx`. Does not replace it.

## State Machine

Priority: **Click (lock) > Hover > Auto**

### State Variables

| Variable | Type | Description |
|---|---|---|
| `activeIndex` | `number` | Currently playing icon in auto-rotate sequence |
| `lockedIndex` | `number \| null` | Clicked/locked icon. `null` when unlocked |
| `hoveredIndex` | `number \| null` | Currently hovered icon |
| `savedIndex` | `number \| null` | Pre-hover `activeIndex`, restored on mouse leave |
| `videoState` | `'playing' \| 'paused' \| 'ended'` | Current video playback state |

### Resolution

1. **If `lockedIndex !== null`** → show locked icon's video. Loop playback until unlocked.
2. **If `hoveredIndex !== null`** → show hovered icon's video. Save `activeIndex` to `savedIndex`.
3. **Else** → show `activeIndex` video. Auto-rotate every 5 seconds.

### Transitions

- **Hover in (`onMouseEnter`):** `savedIndex = activeIndex` → `hoveredIndex = index`
- **Hover out (`onMouseLeave`):** `activeIndex = savedIndex` → `hoveredIndex = null` → `savedIndex = null`
- **Click unlocked icon:** `lockedIndex = index`, auto-rotation paused
- **Click locked icon:** `lockedIndex = null`, resume auto-rotate from current icon
- **Auto-advance:** `activeIndex = (activeIndex + 1) % steps.length`, video src swaps, play 5s, hold last frame
- **Rapid hover:** debounce 150ms before switching video to avoid thrashing

## Glow System (Replaces Orb)

No orb on connecting line. Active icon box glows instead.

| State | Box Shadow | Border | Opacity |
|---|---|---|---|
| Active (auto) | `0 0 24px rgba(6,182,212,0.5)` | `border-cyan-500/80` | 1.0 |
| Hovered | `0 0 16px rgba(6,182,212,0.4)` | `border-cyan-400/60` | 1.0 |
| Locked | `0 0 28px rgba(250,204,21,0.6)` | `border-amber-400/80` | 1.0 |
| Inactive | none | `border-white/10` | 0.5 |

- Transition: `transition-all duration-300`
- Connecting lines: thin `h-px`, `bg-white/10`, no orb/dot on line
- Icons: lucide-react, 5 semantic icons mapped to each step

## Component Structure

### New Files

```
src/sections/technology-and-approach/components/TechnologyCarouselSection.tsx
```

### Modified Files

```
src/sections/technology-and-approach/components/TechnologyView.tsx  — add above ProcessFlow
src/sections/technology-and-approach/components/index.ts            — export new component
product/sections/technology-and-approach/types.ts                   — add types
product/sections/technology-and-approach/data.json                  — add carousel data
```

### Props (`TechnologyCarouselSectionProps`)

```typescript
interface TechnologyStep {
  id: string;
  label: string;
  description: string;
  iconName: string;   // lucide-react icon key
  videoSrc: string;   // path to mp4/webm, or "" for placeholder
}

interface TechnologyCarouselSectionProps {
  eyebrow: string;
  steps: TechnologyStep[];
  videoHoldDuration?: number;  // default 5000
}
```

### Component Internals

- Single `<video>` element, `src` bound to resolved icon's `videoSrc`
- `useRef` for video element, interval ref, debounce timeout ref
- `useEffect` to manage auto-rotation interval (clears on lock/hover)
- Icon row: flex container, horizontal scroll on mobile (`overflow-x-auto`, `snap-x`)
- Video area: `aspect-video`, `max-w-3xl`, `rounded-xl`, glass border, centered
- Step description: `h3` + `p` below video, transitions with icon change

## Edge Cases

| Scenario | Handling |
|---|---|
| No `videoSrc` (placeholder) | Show icon + label card in video area, no `<video>` rendered |
| Video load error | `onError` → show fallback with icon + "Preview coming soon" text |
| Autoplay blocked | Show play button overlay. On click (user gesture), play. |
| `prefers-reduced-motion` | Skip auto-rotation. Manual selection only via hover/click. |
| Rapid hover across icons | 150ms debounce before switching `src` |
| Window loses focus | Pause auto-rotation timer, resume on focus |
| All videos same `src` initially | Graceful — video element just does nothing (poster frame) |

## Responsive

- **Desktop:** Icon row (flex, centered, gap + connecting lines), 16:9 video below, step text below video
- **Mobile (<640px):** Icons in horizontal scroll container (`overflow-x-auto`, `snap-x mandatory`), video full-width, text stacked
- Section follows existing pattern: `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8`

## Background

- `ShaderBackground variant="currents"` (matches ProcessFlowSection adjacent feel)
- Standard section background: `bg-slate-950`
- Section uses existing `IntersectionObserver` fade-in pattern

## Approach Summary

**Approach A: Single `<video>` element.** `src` attribute swaps when resolved icon changes. Video plays 5 seconds, pauses, holds last frame. No crossfade — the hold-frame is a natural transition. Zero new dependencies. Matches existing patterns (`useRef`, `useEffect`, native video API).

## Acceptance Criteria

1. 5 icons visible along "from waste to resource" eyebrow
2. Auto-rotation: each icon active 5s, video plays, holds last frame, advances
3. Hover: switches to hovered icon, returns to previous on mouse leave
4. Click: locks icon, video loops until unclicked
5. Locked icon shows amber glow (distinct from cyan active/hover)
6. No orb on connecting lines
7. Mobile: icons horizontal scroll
8. Placeholder state when no video files exist
9. Reduced motion: no auto-rotate
10. Videoless fallback works
