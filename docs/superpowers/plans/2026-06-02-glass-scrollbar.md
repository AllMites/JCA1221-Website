# Glass Scrollbar Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace default browser scrollbar with a custom glassmorphism/neumorphism React scrollbar widget that fades in on hover.

**Architecture:** A `GlassScrollbar` React component that wraps content, hides the native scrollbar via CSS, and renders a fixed/absolute-positioned glass track with a draggable neumorphic thumb. Two variants: `page` (fixed, controls `document.documentElement`) and `section` (absolute within scrollable container). Integrated into `AppShell.tsx` for site-wide use.

**Tech Stack:** React 19, Tailwind CSS v4, TypeScript, framer-motion (exit), no extra dependencies.

---

### Task 1: Add global CSS to hide native scrollbar + scrollbar anim keyframes

**Files:**
- Modify: `src/index.css` (after existing animation utilities)

- [ ] **Step 1: Add native scrollbar hiding CSS and glass scrollbar keyframes**

Add to `src/index.css` before the `@layer utilities` close bracket:

```css
/* ─── Custom Glass Scrollbar ────────────────────────────────── */

/* Hide native scrollbar globally — keep scroll functionality */
html {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge legacy */
}
html::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Opera */
}

/* Section-level hide (for containers using variant="section") */
.hide-native-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.hide-native-scrollbar::-webkit-scrollbar {
  display: none;
}
```

- [ ] **Step 2: Verify CSS parses cleanly**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: hide native scrollbar globally, prep scrollbar CSS classes"
```

---

### Task 2: Create `GlassScrollbar` React component

**Files:**
- Create: `src/components/GlassScrollbar.tsx`

- [ ] **Step 1: Write the component — page variant logic**

```tsx
import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react'

interface GlassScrollbarProps {
  children: ReactNode
  /** Page-level (fixed, controls documentElement) or section-level (absolute, controls inner ref) */
  variant?: 'page' | 'section'
  /** Only for variant="section" — optional class for outer container */
  className?: string
}

/**
 * Glassmorphism scrollbar widget.
 * `variant="page"` — fixed position, hides native body scrollbar, controls document.
 * `variant="section"` — absolute position, wraps children in a scrollable container.
 */
export function GlassScrollbar({ children, variant = 'page', className = '' }: GlassScrollbarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [thumbHeight, setThumbHeight] = useState(0)
  const [thumbTop, setThumbTop] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isIdle, setIsIdle] = useState(false)
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)
  const dragStartRef = useRef<{ thumbStart: number; mouseStart: number } | null>(null)

  const isPage = variant === 'page'

  // ─── Get scroll metrics ─────────────────────────────────────
  const getMetrics = useCallback(() => {
    if (isPage) {
      const { scrollHeight, clientHeight, scrollTop } = document.documentElement
      const maxScroll = scrollHeight - clientHeight
      const height = maxScroll > 0 ? (clientHeight / scrollHeight) * clientHeight : 0
      const top = maxScroll > 0 ? (scrollTop / maxScroll) * (clientHeight - height) : 0
      return { height: Math.max(height, 40), top, maxScroll, scrollTop }
    }

    const el = scrollContainerRef.current
    if (!el) return { height: 0, top: 0, maxScroll: 0, scrollTop: 0 }
    const { scrollHeight, clientHeight, scrollTop } = el
    const maxScroll = scrollHeight - clientHeight
    const height = maxScroll > 0 ? (clientHeight / scrollHeight) * clientHeight : 0
    const top = maxScroll > 0 ? (scrollTop / maxScroll) * (clientHeight - height) : 0
    return { height: Math.max(height, 40), top, maxScroll, scrollTop }
  }, [isPage])

  // ─── Sync thumb position ────────────────────────────────────
  const syncThumb = useCallback(() => {
    const m = getMetrics()
    setThumbHeight(m.height)
    setThumbTop(m.top)
    if (m.maxScroll <= 0) {
      setIsVisible(false)
    }
  }, [getMetrics])

  // ─── Throttled scroll sync via rAF ──────────────────────────
  const onScroll = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      syncThumb()
      rafRef.current = null
    })
  }, [syncThumb])

  // ─── Hover visibility ───────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    setIsVisible(true)
    setIsIdle(false)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      setIsVisible(false)
    }
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
  }, [isDragging])

  // ─── Idle timer (dim thumb after 2s no scroll) ──────────────
  const bumpIdle = useCallback(() => {
    setIsIdle(false)
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
    idleTimerRef.current = setTimeout(() => setIsIdle(true), 2000)
  }, [])

  // ─── Drag handlers ──────────────────────────────────────────
  const handleThumbMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
      dragStartRef.current = {
        thumbStart: thumbTop,
        mouseStart: e.clientY,
      }
    },
    [thumbTop],
  )

  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== thumbRef.current) {
        const rect = trackRef.current?.getBoundingClientRect()
        if (!rect) return
        const clickY = e.clientY - rect.top
        const ratio = clickY / rect.height
        const maxScroll = isPage
          ? document.documentElement.scrollHeight - document.documentElement.clientHeight
          : (scrollContainerRef.current?.scrollHeight ?? 0) -
            (scrollContainerRef.current?.clientHeight ?? 0)
        const targetScroll = Math.round(ratio * maxScroll)
        if (isPage) {
          document.documentElement.scrollTop = targetScroll
        } else if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = targetScroll
        }
        syncThumb()
      }
    },
    [isPage, syncThumb],
  )

  // ─── Global mouse move/up for drag ──────────────────────────
  useEffect(() => {
    if (!isDragging) return

    const onMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current || !trackRef.current) return
      const trackRect = trackRef.current.getBoundingClientRect()
      const deltaY = e.clientY - dragStartRef.current.mouseStart
      const pixelsPerScroll = trackRect.height / thumbHeight
      const scrollDelta = deltaY * (isPage
        ? (document.documentElement.scrollHeight - document.documentElement.clientHeight)
        : ((scrollContainerRef.current?.scrollHeight ?? 0) - (scrollContainerRef.current?.clientHeight ?? 0))
      ) / trackRect.height

      if (isPage) {
        document.documentElement.scrollTop += scrollDelta
      } else if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop += scrollDelta
      }
      dragStartRef.current.mouseStart = e.clientY
    }

    const onMouseUp = () => {
      setIsDragging(false)
      dragStartRef.current = null
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [isDragging, isPage, thumbHeight])

  // ─── Attach scroll listener + resize observer ───────────────
  useEffect(() => {
    const target = isPage ? document : scrollContainerRef.current
    if (!target) return
    target.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // initial sync

    const ro = new ResizeObserver(() => onScroll())
    if (isPage) {
      ro.observe(document.documentElement)
    } else if (scrollContainerRef.current) {
      ro.observe(scrollContainerRef.current)
    }

    return () => {
      target.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [isPage, onScroll])

  // ─── Cleanup idle / raf on unmount ──────────────────────────
  useEffect(() => {
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // ─── Show on any scroll while hovered ───────────────────────
  useEffect(() => {
    if (!isVisible) return
    bumpIdle()
  }, [thumbTop, bumpIdle, isVisible])

  // ─── Render ─────────────────────────────────────────────────

  const trackClasses = isPage
    ? 'fixed right-[3px] top-[6px] bottom-[6px] z-[9999]'
    : 'absolute right-[2px] top-0 bottom-0'

  if (isPage) {
    return (
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative"
      >
        {children}
        {/* Glass track */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className={`${trackClasses} w-[8px] rounded-full bg-white/10 dark:bg-white/[0.04] backdrop-blur-md border border-white/[0.06] dark:border-white/[0.03] ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}
        >
          {/* Glass thumb */}
          <div
            ref={thumbRef}
            onMouseDown={handleThumbMouseDown}
            style={{ height: thumbHeight, top: thumbTop }}
            className={`absolute left-0 right-0 rounded-full cursor-grab active:cursor-grabbing ${
              isDragging
                ? 'bg-gradient-to-b from-white/80 to-white/50 dark:from-white/50 dark:to-white/20'
                : isIdle
                  ? 'bg-gradient-to-b from-white/30 to-white/10 dark:from-white/15 dark:to-white/5'
                  : 'bg-gradient-to-b from-white/50 to-white/20 dark:from-white/30 dark:to-white/10'
            } shadow-[inset_1px_1px_2px_rgba(255,255,255,0.7),inset_-1px_-1px_2px_rgba(255,255,255,0.1)] dark:shadow-[inset_1px_1px_2px_rgba(255,255,255,0.2),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] transition-[background] duration-200`}
            aria-hidden="true"
          />
        </div>
      </div>
    )
  }

  // ─── Section variant ────────────────────────────────────────
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={scrollContainerRef}
        onScroll={onScroll}
        className="h-full overflow-y-auto hide-native-scrollbar"
      >
        {children}
      </div>
      {/* Glass track */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className={`${trackClasses} w-[6px] rounded-full bg-white/15 dark:bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] dark:border-white/[0.03] ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}
      >
        <div
          ref={thumbRef}
          onMouseDown={handleThumbMouseDown}
          style={{ height: thumbHeight, top: thumbTop }}
          className={`absolute left-0 right-0 rounded-full cursor-grab active:cursor-grabbing ${
            isDragging
              ? 'bg-gradient-to-b from-white/70 to-white/40 dark:from-white/50 dark:to-white/20'
              : isIdle
                ? 'bg-gradient-to-b from-white/30 to-white/10 dark:from-white/15 dark:to-white/5'
                : 'bg-gradient-to-b from-white/50 to-white/20 dark:from-white/30 dark:to-white/10'
          } shadow-[inset_1px_1px_2px_rgba(255,255,255,0.7),inset_-1px_-1px_2px_rgba(255,255,255,0.1)] dark:shadow-[inset_1px_1px_2px_rgba(255,255,255,0.2),inset_-1px_-1px_2px_rgba(255,255,255,0.05)] transition-[background] duration-200`}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/components/GlassScrollbar.tsx
git commit -m "feat: add GlassScrollbar component with page and section variants"
```

---

### Task 3: Integrate page scrollbar into AppShell

**Files:**
- Modify: `src/shell/components/AppShell.tsx`

- [ ] **Step 1: Import GlassScrollbar and wrap the root div**

Add import at top (after existing imports):
```tsx
import { GlassScrollbar } from '@/components/GlassScrollbar'
```

Then wrap the root `<div>` with `<GlassScrollbar>` — find and replace:

```tsx
// Before:
    <div className="min-h-screen bg-background text-foreground font-body">

// After:
    <GlassScrollbar variant="page">
    <div className="min-h-screen bg-background text-foreground font-body">
```

And close the wrapper before the root `</div>`:

```tsx
// After the CookieConsent line, before the final </div>:
      </GlassScrollbar>
    </div>
```

Full replacement detail — replace the root `return (` block opening line (line 34 in current file):

old:
```tsx
    <div className="min-h-screen bg-background text-foreground font-body">
```

new:
```tsx
    <GlassScrollbar variant="page">
    <div className="min-h-screen bg-background text-foreground font-body">
```

And find the closing `</div>` on the last line of the component, change:

old:
```
    </div>
  )
}
```

new:
```
      </GlassScrollbar>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Check the project runs in dev mode**

Run: `npm run dev` in background
Expected: Dev server starts, no console errors

- [ ] **Step 4: Commit**

```bash
git add src/shell/components/AppShell.tsx
git commit -m "feat: integrate GlassScrollbar page variant into AppShell"
```

---

### Task 4: Update ProjectCarousel to use section variant (optional enhancement)

**Files:**
- Modify: `src/sections/home/components/ProjectCarousel.tsx`

- [ ] **Step 1: Replace `.scrollbar-hide` with `GlassScrollbar` section variant**

Remove the inline `<style>` block (lines 159-162) and the `scrollbar-hide` class from the scroll container div. Instead wrap the carousel cards list section with `GlassScrollbar`.

Import at top:
```tsx
import { GlassScrollbar } from '@/components/GlassScrollbar'
```

Find the horizontal scroll container div (currently with `className="flex gap-5 px-4 ... scrollbar-hide"`) and replace with:

```tsx
        <GlassScrollbar variant="section" className="relative z-10">
          <div className="flex gap-5 px-4 sm:px-6 lg:px-8 pb-4 snap-x snap-mandatory"
            style={{ scrollPaddingInline: 'calc((100vw - 1280px) / 2 + 2rem)', paddingLeft: 'max(1rem, calc((100vw - 1280px) / 2 + 2rem))', paddingRight: 'max(1rem, calc((100vw - 1280px) / 2 + 2rem))' }}
          >
            {projects.map((project) => (
              <div key={project.id} className="snap-start">
                <ProjectCardItem
                  project={project}
                  onClick={() => onProjectClick?.(project.id)}
                />
              </div>
            ))}

            {/* End hint card */}
            <div className="flex-shrink-0 w-[280px] flex items-center justify-center rounded-2xl border border-dashed border-slate-700 dark:border-slate-800 bg-slate-800/30">
              <div className="text-center p-6">
                <ArrowRight size={24} className="text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500 font-heading">
                  More projects coming online
                </p>
              </div>
            </div>
          </div>
        </GlassScrollbar>
```

And remove the inline `<style>` block:
```tsx
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
```

Also remove the `scrollRef` and `handleMouseEnter` ref since scroll sync is now handled internally by GlassScrollbar. Remove:
- `const scrollRef = useRef<HTMLDivElement>(null)` — delete the useRef line
- The `ref={scrollRef}` on the scroll container — no longer needed
- The `onMouseEnter={handleMouseEnter}` — no longer needed
- The `handleMouseEnter` function definition itself

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/sections/home/components/ProjectCarousel.tsx
git commit -m "feat: use GlassScrollbar section variant in ProjectCarousel"
```

---

### Task 5: Verify the full build

**Files:**
- None

- [ ] **Step 1: Run full TypeScript check**

Run: `npx tsc --noEmit`
Expected: Clean pass, no errors

- [ ] **Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds, output in `dist/`

- [ ] **Step 3: Commit any remaining**

```bash
git add -A
git commit -m "chore: finalize glass scrollbar integration"
```
