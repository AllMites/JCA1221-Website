# Technology Carousel Section — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive icon-to-video carousel section above ProcessFlowSection on the Technology page, with 5-step auto-rotation, hover preview, and click-to-lock.

**Architecture:** Single `<video>` element whose `src` swaps based on resolved icon (click > hover > auto priority). React state machine with `useRef` for video/timer control. CSS box-shadow glow on active icon, thin connecting lines between icons, no orb.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, lucide-react icons, native `<video>` API

---

## File Structure

| File | Action | Purpose |
|---|---|---|
| `product/sections/technology-and-approach/types.ts` | Modify | Add `TechnologyStep`, `TechnologyCarouselData` types, extend `TechnologyAndApproachProps` |
| `product/sections/technology-and-approach/data.json` | Modify | Add `carousel` data block with 5 steps + videoSrc placeholders |
| `src/sections/technology-and-approach/components/TechnologyCarouselSection.tsx` | Create | New carousel component |
| `src/sections/technology-and-approach/components/TechnologyView.tsx` | Modify | Add carousel section above ProcessFlowSection |
| `src/sections/technology-and-approach/components/index.ts` | Modify | Export new component |
| `src/pages/TechnologyPage.tsx` | Modify | Pass `carousel` prop |

---

### Task 1: Add TypeScript types

**Files:**
- Modify: `product/sections/technology-and-approach/types.ts`

- [ ] **Step 1: Add new interfaces and extend props**

Insert after the `ProcessStep` interface (after line 10):

```typescript
export interface TechnologyStep {
  /** Unique step identifier */
  id: string
  /** Step label shown below icon */
  label: string
  /** Short description shown below video */
  description: string
  /** lucide-react icon name */
  iconName: string
  /** Path to video file (mp4/webm) or empty string for placeholder */
  videoSrc: string
}

export interface TechnologyCarouselData {
  /** Eyebrow text above icon row */
  eyebrow: string
  /** Carousel steps in order */
  steps: TechnologyStep[]
  /** Milliseconds per auto-rotate step (default 5000) */
  videoHoldDuration?: number
}
```

Modify `TechnologyAndApproachProps` to include carousel data. Replace the existing interface (lines 82-95) with:

```typescript
export interface TechnologyAndApproachProps {
  /** Section title */
  sectionTitle: string
  /** Section subtitle */
  sectionSubtitle: string
  /** Carousel section data (above process flow) */
  carousel: TechnologyCarouselData
  /** Process flow steps (wastewater → clean water) */
  processSteps: ProcessStep[]
  /** JCA vs traditional comparison */
  comparison: Comparison
  /** Core technology pillars */
  technologyPillars: TechnologyPillar[]
  /** Live impact dashboard data */
  liveMetrics: LiveMetrics
}
```

- [ ] **Step 2: Commit**

```bash
git add product/sections/technology-and-approach/types.ts
git commit -m "feat: add TechnologyCarousel types to tech page schema

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 2: Add carousel data to data.json

**Files:**
- Modify: `product/sections/technology-and-approach/data.json`

- [ ] **Step 1: Add carousel block**

Insert after `"sectionSubtitle"` line (after line 19, before `"processSteps"`):

```json
  "carousel": {
    "eyebrow": "From Waste to Resource",
    "videoHoldDuration": 5000,
    "steps": [
      {
        "id": "collection",
        "label": "Collection & Screening",
        "description": "Raw wastewater and septage arrive at the facility. Screens remove large solids — plastics, debris, grit — before treatment begins.",
        "iconName": "Filter",
        "videoSrc": ""
      },
      {
        "id": "biological",
        "label": "Biological Treatment",
        "description": "In the Sequential Batch Reactor, naturally occurring microorganisms consume organic pollutants — the same nitrogen cycle found in healthy rivers and aquariums.",
        "iconName": "Microscope",
        "videoSrc": ""
      },
      {
        "id": "clarification",
        "label": "Clarification",
        "description": "Treated water passes through settling tanks where remaining particles sink and are separated. Clear water rises, ready for final polishing.",
        "iconName": "Beaker",
        "videoSrc": ""
      },
      {
        "id": "uv-disinfection",
        "label": "UV Disinfection",
        "description": "Water flows through ultraviolet light chambers that neutralize remaining pathogens. Solar panels help power this chemical-free sterilization.",
        "iconName": "Sun",
        "videoSrc": ""
      },
      {
        "id": "clean-water",
        "label": "Clean Water Release",
        "description": "The recycled water is released back into the bay or river — clean enough for marine life to thrive and communities to enjoy.",
        "iconName": "Droplets",
        "videoSrc": ""
      }
    ]
  },
```

- [ ] **Step 2: Validate JSON is well-formed**

Run: `node -e "JSON.parse(require('fs').readFileSync('product/sections/technology-and-approach/data.json','utf8')); console.log('Valid JSON')"`
Expected: "Valid JSON"

- [ ] **Step 3: Commit**

```bash
git add product/sections/technology-and-approach/data.json
git commit -m "feat: add carousel data with videoSrc placeholders

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 3: Create TechnologyCarouselSection component

**Files:**
- Create: `src/sections/technology-and-approach/components/TechnologyCarouselSection.tsx`

- [ ] **Step 1: Write the component**

```typescript
import { useRef, useEffect, useState, useCallback } from 'react'
import * as Icons from 'lucide-react'
import type { TechnologyStep } from '@/../product/sections/technology-and-approach/types'
import { ShaderBackground } from '@/components/ShaderBackground'

interface TechnologyCarouselSectionProps {
  eyebrow: string
  steps: TechnologyStep[]
  videoHoldDuration?: number
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Filter: Icons.Filter,
  Microscope: Icons.Microscope,
  Beaker: Icons.Beaker,
  Sun: Icons.Sun,
  Droplets: Icons.Droplets,
}

export function TechnologyCarouselSection({
  eyebrow,
  steps,
  videoHoldDuration = 5000,
}: TechnologyCarouselSectionProps) {
  const [visible, setVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [lockedIndex, setLockedIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [savedIndex, setSavedIndex] = useState<number | null>(null)
  const [videoState, setVideoState] = useState<'playing' | 'paused' | 'ended'>('paused')
  const [videoError, setVideoError] = useState(false)

  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  // IntersectionObserver for entrance animation
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Resolve which index's video to show
  const resolvedIndex = lockedIndex !== null
    ? lockedIndex
    : hoveredIndex !== null
    ? hoveredIndex
    : activeIndex

  const resolvedStep = steps[resolvedIndex]

  // Clear auto-rotation timer
  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current !== null) {
      clearInterval(autoTimerRef.current)
      autoTimerRef.current = null
    }
  }, [])

  // Start auto-rotation
  const startAutoTimer = useCallback(() => {
    clearAutoTimer()
    if (prefersReducedMotion) return
    autoTimerRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % steps.length)
    }, videoHoldDuration)
  }, [clearAutoTimer, videoHoldDuration, steps.length, prefersReducedMotion])

  // Manage auto-rotation lifecycle
  useEffect(() => {
    if (lockedIndex !== null || hoveredIndex !== null) {
      clearAutoTimer()
      return
    }
    startAutoTimer()
    return clearAutoTimer
  }, [lockedIndex, hoveredIndex, startAutoTimer, clearAutoTimer])

  // Play video when resolved step changes
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const step = steps[resolvedIndex]
    if (!step.videoSrc) {
      setVideoState('paused')
      setVideoError(false)
      return
    }

    setVideoError(false)
    video.currentTime = 0

    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => setVideoState('playing'))
        .catch(() => {
          // Autoplay blocked — show paused state, user can click to play
          setVideoState('paused')
        })
    }
  }, [resolvedIndex, steps])

  // Handle video ended — hold last frame, don't loop unless locked
  const handleVideoEnded = useCallback(() => {
    setVideoState('ended')
  }, [])

  // Handle video error
  const handleVideoError = useCallback(() => {
    setVideoError(true)
    setVideoState('paused')
  }, [])

  // Handle video element click (for autoplay-blocked browsers)
  const handleVideoClick = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().then(() => setVideoState('playing')).catch(() => {})
    }
  }, [])

  // Icon hover handlers with debounce
  const handleIconEnter = useCallback((index: number) => {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current)
    }
    if (resumeTimerRef.current !== null) {
      clearTimeout(resumeTimerRef.current)
    }
    setSavedIndex(activeIndex)
    debounceRef.current = setTimeout(() => {
      setHoveredIndex(index)
    }, 150)
  }, [activeIndex])

  const handleIconLeave = useCallback(() => {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    setHoveredIndex(null)
    // Restore saved index
    if (savedIndex !== null) {
      setActiveIndex(savedIndex)
      setSavedIndex(null)
    }
  }, [savedIndex])

  // Icon click handler
  const handleIconClick = useCallback((index: number) => {
    if (lockedIndex === index) {
      // Unlock
      setLockedIndex(null)
      setActiveIndex(index)
    } else {
      // Lock to this icon
      setLockedIndex(index)
      setHoveredIndex(null)
      setSavedIndex(null)
    }
  }, [lockedIndex])

  // Focus/blur — pause on blur
  useEffect(() => {
    const handleBlur = () => clearAutoTimer()
    const handleFocus = () => {
      if (lockedIndex === null && hoveredIndex === null) {
        startAutoTimer()
      }
    }
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [clearAutoTimer, startAutoTimer, lockedIndex, hoveredIndex])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAutoTimer()
      if (debounceRef.current !== null) clearTimeout(debounceRef.current)
      if (resumeTimerRef.current !== null) clearTimeout(resumeTimerRef.current)
    }
  }, [clearAutoTimer])

  const getGlowClass = (index: number): string => {
    if (lockedIndex === index) {
      return 'shadow-[0_0_28px_rgba(250,204,21,0.6)] border-amber-400/80 bg-amber-400/10'
    }
    if (hoveredIndex === index) {
      return 'shadow-[0_0_16px_rgba(6,182,212,0.4)] border-cyan-400/60 bg-cyan-500/10'
    }
    if (resolvedIndex === index) {
      return 'shadow-[0_0_24px_rgba(6,182,212,0.5)] border-cyan-500/80 bg-cyan-500/15'
    }
    return 'border-white/10 bg-white/5'
  }

  const showVideo = resolvedStep.videoSrc && !videoError
  const showPlaceholder = !resolvedStep.videoSrc || videoError

  return (
    <section
      ref={sectionRef}
      className="relative py-20 sm:py-28 overflow-hidden"
    >
      {/* Solid deep background */}
      <div className="absolute inset-0 bg-slate-950" />

      {/* Atmospheric cyan orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-cyan-500/8 blur-[120px]" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-blue-500/6 blur-[100px]" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-cyan-400/5 blur-[80px]" />

      <ShaderBackground variant="currents" opacity={0.4} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <div className="text-center mb-8">
          <p className="text-cyan-300/80 text-sm font-mono tracking-widest uppercase">
            {eyebrow}
          </p>
        </div>

        {/* Icon row */}
        <div className="flex items-center justify-center mb-10 overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex items-center gap-0 flex-nowrap min-w-max sm:min-w-0">
            {steps.map((step, i) => {
              const IconComponent = ICON_MAP[step.iconName]
              const isLast = i === steps.length - 1
              return (
                <div key={step.id} className="flex items-center gap-0">
                  <button
                    type="button"
                    className={`
                      flex flex-col items-center justify-center gap-1
                      w-16 h-16 sm:w-20 sm:h-20 rounded-2xl
                      border-2 transition-all duration-300 cursor-pointer
                      snap-center flex-shrink-0
                      ${getGlowClass(i)}
                      ${resolvedIndex === i ? 'opacity-100 scale-100' : 'opacity-50 scale-95 hover:opacity-75'}
                    `}
                    onMouseEnter={() => handleIconEnter(i)}
                    onMouseLeave={handleIconLeave}
                    onClick={() => handleIconClick(i)}
                    aria-label={step.label}
                    aria-pressed={lockedIndex === i}
                  >
                    {IconComponent && (
                      <IconComponent
                        className={`w-6 h-6 sm:w-7 sm:h-7 ${
                          resolvedIndex === i ? 'text-cyan-300' : 'text-slate-400'
                        }`}
                      />
                    )}
                    <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 leading-tight text-center px-1 hidden sm:block">
                      {step.label}
                    </span>
                  </button>

                  {/* Connecting line */}
                  {!isLast && (
                    <div className="w-6 sm:w-10 h-px bg-white/10 flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Video area */}
        <div className="max-w-3xl mx-auto mb-6">
          <div
            className="relative aspect-video rounded-xl overflow-hidden
                        bg-slate-900/80 backdrop-blur-sm
                        border border-white/10
                        shadow-[0_0_24px_rgba(6,182,212,0.15)]"
          >
            {showVideo && (
              <video
                ref={videoRef}
                src={resolvedStep.videoSrc}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
                onEnded={handleVideoEnded}
                onError={handleVideoError}
                onClick={handleVideoClick}
              />
            )}

            {showPlaceholder && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                {(() => {
                  const IconComponent = ICON_MAP[resolvedStep.iconName]
                  return IconComponent ? (
                    <IconComponent className="w-16 h-16 text-cyan-400/40" />
                  ) : null
                })()}
                <p className="text-slate-500 text-sm font-mono">
                  {videoError ? 'Preview unavailable' : 'Preview coming soon'}
                </p>
              </div>
            )}

            {/* Play overlay for autoplay-blocked */}
            {showVideo && videoState === 'paused' && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                onClick={handleVideoClick}
              >
                <div className="w-16 h-16 rounded-full bg-cyan-500/30 backdrop-blur-sm border border-cyan-400/40 flex items-center justify-center">
                  <Icons.Play className="w-7 h-7 text-white ml-1" />
                </div>
              </div>
            )}

            {/* Locked indicator */}
            {lockedIndex !== null && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-md
                              bg-amber-400/20 backdrop-blur-sm border border-amber-400/30
                              text-amber-300 text-xs font-mono flex items-center gap-1">
                <Icons.Lock className="w-3 h-3" />
                Locked
              </div>
            )}

            {/* Ended overlay — subtle, just indicates hold */}
            {videoState === 'ended' && lockedIndex === null && showVideo && (
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md
                              bg-slate-900/60 backdrop-blur-sm border border-white/5
                              text-slate-400 text-xs font-mono">
                Hold
              </div>
            )}
          </div>
        </div>

        {/* Step description */}
        <div
          className="text-center max-w-lg mx-auto"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <h3 className="text-lg sm:text-xl font-heading font-semibold text-white mb-2">
            {resolvedStep.label}
          </h3>
          <p className="text-sm text-cyan-100/50 leading-relaxed">
            {resolvedStep.description}
          </p>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/sections/technology-and-approach/components/TechnologyCarouselSection.tsx
git commit -m "feat: add TechnologyCarouselSection with icon video carousel

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 4: Export new component, wire into TechnologyView, pass data from page

**Files:**
- Modify: `src/sections/technology-and-approach/components/index.ts`
- Modify: `src/sections/technology-and-approach/components/TechnologyView.tsx`
- Modify: `src/pages/TechnologyPage.tsx`

- [ ] **Step 1: Export from index.ts**

Add export after Line 2 (`export { ProcessFlowSection }`):

```typescript
export { TechnologyCarouselSection } from './TechnologyCarouselSection'
```

Full file becomes:

```typescript
export { TechnologyView } from './TechnologyView'
export { ProcessFlowSection } from './ProcessFlowSection'
export { TechnologyCarouselSection } from './TechnologyCarouselSection'
export { ComparisonSection } from './ComparisonSection'
export { TechnologyGridSection } from './TechnologyGridSection'
export { LiveDashboardSection } from './LiveDashboardSection'
```

- [ ] **Step 2: Update TechnologyView.tsx to include carousel**

Replace the entire file:

```typescript
import type { TechnologyAndApproachProps } from '@/../product/sections/technology-and-approach/types'
import { TechnologyCarouselSection } from './TechnologyCarouselSection'
import { ProcessFlowSection } from './ProcessFlowSection'
import { ComparisonSection } from './ComparisonSection'
import { TechnologyGridSection } from './TechnologyGridSection'
import { LiveDashboardSection } from './LiveDashboardSection'

export function TechnologyView({
  carousel,
  processSteps,
  comparison,
  technologyPillars,
  liveMetrics,
}: TechnologyAndApproachProps) {
  return (
    <div>
      {/* Carousel — interactive icon video previews */}
      <TechnologyCarouselSection
        eyebrow={carousel.eyebrow}
        steps={carousel.steps}
        videoHoldDuration={carousel.videoHoldDuration}
      />

      {/* Process flow — emerald */}
      <ProcessFlowSection steps={processSteps} />

      {/* Comparison — amber */}
      <ComparisonSection comparison={comparison} />

      {/* Tech grid — blue */}
      <TechnologyGridSection pillars={technologyPillars} />

      {/* Live dashboard — slate */}
      <LiveDashboardSection liveMetrics={liveMetrics} />
    </div>
  )
}
```

- [ ] **Step 3: Update TechnologyPage.tsx to pass carousel data**

Add `carousel` prop destructure and pass it. Replace the `<TechnologyView ... />` block (lines 30-37):

```typescript
        <TechnologyView
          sectionTitle={data.sectionTitle}
          sectionSubtitle={data.sectionSubtitle}
          carousel={data.carousel}
          processSteps={data.processSteps}
          comparison={data.comparison}
          technologyPillars={data.technologyPillars}
          liveMetrics={data.liveMetrics as LiveMetrics}
        />
```

- [ ] **Step 4: Verify no TypeScript errors**

Run: `npx tsc --noEmit --project tsconfig.app.json 2>&1 | Select-String "error"`
Expected: no output (no type errors)

- [ ] **Step 5: Commit**

```bash
git add src/sections/technology-and-approach/components/index.ts src/sections/technology-and-approach/components/TechnologyView.tsx src/pages/TechnologyPage.tsx
git commit -m "feat: wire TechnologyCarouselSection into Technology page

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

### Task 5: Verify in browser

**Files:**
- None (verification only)

- [ ] **Step 1: Start dev server**

Run: `npm run dev`
Expected: Vite dev server starts

- [ ] **Step 2: Check browser**

Navigate to `/technology`. Verify:
1. Carousel section visible above ProcessFlowSection
2. Eyebrow "From Waste to Resource" shows
3. 5 icons in row with connecting lines
4. First icon glows cyan (active)
5. Video area shows placeholder with icon ("Preview coming soon")
6. Step description below video
7. Hover over icon 3 → video area switches, glow shifts
8. Mouse leave → returns to original active icon
9. Click icon → locks, amber glow, "Locked" badge
10. Click locked icon → unlocks, returns to auto

- [ ] **Step 3: Check mobile responsive**

Resize to 375px width. Verify:
1. Icons in horizontal scroll container
2. No overflow issues
3. Video full-width

- [ ] **Step 4: Check reduced motion**

Open devtools, enable `prefers-reduced-motion: reduce`. Verify auto-rotation stops.

