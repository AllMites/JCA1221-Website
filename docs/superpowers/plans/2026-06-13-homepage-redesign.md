# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign JCA1221 homepage with enterprise cascade layout — Hero → Trust Strip → Mission & Values → Featured Projects → Trust Wall → CSR Spotlight → Final CTA.

**Architecture:** Five new section components, one shared hook extracted from existing code, HeroSection modified to remove ripples/edge detection, HomeView and HomePage rewritten to compose new section order. Original files backed up as `.original.tsx`. All data from existing Supabase hooks. No new tables or endpoints.

**Tech Stack:** React 19, TypeScript 5.9, Tailwind CSS 4, framer-motion, lucide-react, shadcn/ui (new-york), @supabase/supabase-js

**Spec:** `docs/superpowers/specs/2026-06-13-homepage-redesign-design.md`

---

## File Structure

### Modified
| File | Change |
|------|--------|
| `src/pages/HomePage.tsx` | Backup → rewrite with new section order |
| `src/sections/home/HomeView.tsx` | Backup → rewrite with new section composition |
| `src/sections/home/components/HeroSection.tsx` | Remove ripples/edge detection, add subtitle, add secondary CTA, slow cycle to 6s |
| `src/sections/home/components/index.ts` | Add new component exports |

### Created
| File | Purpose |
|------|---------|
| `src/lib/use-count-up.ts` | Shared animated counter hook (extracted from ImpactStats) |
| `src/sections/home/components/TrustStrip.tsx` | Section 2: animated stats + partner marks |
| `src/sections/home/components/MissionPillars.tsx` | Section 3: mission statement + neumorphic value pillars |
| `src/sections/home/components/FeaturedProjects.tsx` | Section 4: three project cards in responsive row |
| `src/sections/home/components/TrustWall.tsx` | Section 5: full partner logo grid + certifications |
| `src/sections/home/components/FinalCta.tsx` | Section 7: inline contact form + contact info |

---

### Task 1: Backup Original Files

**Files:**
- Copy: `src/pages/HomePage.tsx` → `src/pages/HomePage.original.tsx`
- Copy: `src/sections/home/HomeView.tsx` → `src/sections/home/HomeView.original.tsx`

- [ ] **Step 1: Copy HomePage.tsx to HomePage.original.tsx**

Run: `cp "F:/Documents/Repositories/JCA1221-Website/src/pages/HomePage.tsx" "F:/Documents/Repositories/JCA1221-Website/src/pages/HomePage.original.tsx"`

- [ ] **Step 2: Copy HomeView.tsx to HomeView.original.tsx**

Run: `cp "F:/Documents/Repositories/JCA1221-Website/src/sections/home/HomeView.tsx" "F:/Documents/Repositories/JCA1221-Website/src/sections/home/HomeView.original.tsx"`

- [ ] **Step 3: Verify backups exist**

Run: `ls -la "F:/Documents/Repositories/JCA1221-Website/src/pages/HomePage.original.tsx" "F:/Documents/Repositories/JCA1221-Website/src/sections/home/HomeView.original.tsx"`

- [ ] **Step 4: Commit**

```bash
git add src/pages/HomePage.original.tsx src/sections/home/HomeView.original.tsx
git commit -m "chore: backup original HomePage and HomeView before redesign"
```

---

### Task 2: Extract useCountUp Hook from ImpactStats

**Files:**
- Create: `src/lib/use-count-up.ts`

Purpose: Reusable hook for animated number counters. Extracted from the `AnimatedCounter` inline component in `src/sections/home/components/ImpactStats.tsx` (lines 9-55). The original ImpactStats component is kept unchanged for HomeAltPage compatibility.

- [ ] **Step 1: Create the hook file**

```typescript
// src/lib/use-count-up.ts
import { useEffect, useState, useRef } from 'react'

interface UseCountUpOptions {
  /** Target number to count to */
  target: number
  /** Animation duration in ms (default 2000) */
  duration?: number
  /** Start counting when this becomes true */
  enabled: boolean
}

export function useCountUp({ target, duration = 2000, enabled }: UseCountUpOptions) {
  const [count, setCount] = useState(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      } else {
        setCount(target)
      }
    }

    frameRef.current = requestAnimationFrame(tick)

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [target, duration, enabled])

  return count
}
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit src/lib/use-count-up.ts`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/use-count-up.ts
git commit -m "feat: extract useCountUp hook from ImpactStats for reuse"
```

---

### Task 3: Create TrustStrip Component

**Files:**
- Create: `src/sections/home/components/TrustStrip.tsx`

Section 2: Single-row glass card with 4 animated stat columns + abbreviated partner marks below hero.

- [ ] **Step 1: Create TrustStrip.tsx**

```typescript
// src/sections/home/components/TrustStrip.tsx
import { useRef, useState } from 'react'
import { useCountUp } from '@/lib/use-count-up'
import type { ImpactStat } from '@/../product/sections/home/types'

interface TrustStripProps {
  stats: ImpactStat[]
  partnerLogos: string[]
}

function StatItem({ stat }: { stat: ImpactStat }) {
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const count = useCountUp({
    target: stat.number,
    duration: 2000,
    enabled: hasAnimated,
  })

  // Observe scroll into view
  useState(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  })

  return (
    <div ref={ref} className="text-center group cursor-default">
      <div
        className="mb-1 font-bold font-heading text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight tabular-nums"
        role="status"
        aria-live="polite"
      >
        {count.toLocaleString()}
        <span className="text-lg sm:text-xl text-blue-500 dark:text-blue-400 ml-1">{stat.suffix}</span>
      </div>
      <div className="font-semibold font-heading text-xs sm:text-sm text-slate-700 dark:text-slate-300">
        {stat.label}
      </div>
    </div>
  )
}

export function TrustStrip({ stats, partnerLogos }: TrustStripProps) {
  if (!stats || stats.length === 0) return null

  return (
    <section id="trust-strip" className="relative -mt-16 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 shadow-lg">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x-0 md:divide-x divide-slate-200 dark:divide-slate-700 py-8 px-4 sm:px-8 gap-y-8 md:gap-y-0">
            {stats.slice(0, 4).map((stat, i) => (
              <div key={stat.label} className={i >= 2 ? '' : ''}>
                <StatItem stat={stat} />
              </div>
            ))}
          </div>

          {/* Partner marks row */}
          {partnerLogos && partnerLogos.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-700 py-4 px-4 sm:px-8">
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 font-heading uppercase tracking-wider">
                  Trusted By
                </span>
                {partnerLogos.map((name, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold text-slate-400 dark:text-slate-500 grayscale hover:grayscale-0 transition-all duration-300"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit src/sections/home/components/TrustStrip.tsx`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/sections/home/components/TrustStrip.tsx
git commit -m "feat: add TrustStrip component — animated stats + partner marks"
```

---

### Task 4: Create MissionPillars Component

**Files:**
- Create: `src/sections/home/components/MissionPillars.tsx`

Section 3: Centered mission statement + three neumorphic value pillar cards. Reuses neumorphic shadow pattern from MainNav.

- [ ] **Step 1: Create MissionPillars.tsx**

```typescript
// src/sections/home/components/MissionPillars.tsx

interface Pillar {
  title: string
  description: string
}

interface MissionPillarsProps {
  tagline: string
  taglineSub: string
  pillars: Pillar[]
}

const DEFAULT_PILLARS: Pillar[] = [
  {
    title: 'Stewardship',
    description:
      'We don\'t own the land or water — we restore what\'s been damaged, for the next generation.',
  },
  {
    title: 'Ingenuity',
    description:
      'Filipino-engineered solutions that cost 60% less than conventional infrastructure — built to last.',
  },
  {
    title: 'Partnership',
    description:
      'We work with, not for — LGUs, communities, and the private sector share ownership.',
  },
]

function NeumorphicPillarCard({ pillar }: { pillar: Pillar }) {
  return (
    <div
      className="group p-6 sm:p-8 rounded-2xl cursor-pointer select-none transition-all duration-200
        bg-white/60 dark:bg-slate-800/60
        shadow-[3px_3px_8px_rgba(0,0,0,0.06),-2px_-2px_6px_rgba(255,255,255,0.9)]
        dark:shadow-[3px_3px_8px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.03)]
        hover:shadow-[4px_4px_12px_rgba(0,0,0,0.08),-2px_-2px_8px_rgba(255,255,255,1)]
        dark:hover:shadow-[4px_4px_12px_rgba(0,0,0,0.5),-2px_-2px_8px_rgba(255,255,255,0.04)]
        active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.08),inset_-1px_-1px_3px_rgba(255,255,255,0.6)]
        dark:active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]"
    >
      <h3 className="font-bold font-heading text-lg text-slate-800 dark:text-slate-200 mb-2">
        {pillar.title}
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {pillar.description}
      </p>
    </div>
  )
}

export function MissionPillars({ tagline, taglineSub, pillars }: MissionPillarsProps) {
  const displayPillars = pillars.length >= 3 ? pillars : DEFAULT_PILLARS

  return (
    <section className="py-20 sm:py-28 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mission statement */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-slate-900 dark:text-white mb-4 tracking-tight">
            &ldquo;{tagline}&rdquo;
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {taglineSub}
          </p>
        </div>

        {/* Pillar cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {displayPillars.map((pillar) => (
            <NeumorphicPillarCard key={pillar.title} pillar={pillar} />
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit src/sections/home/components/MissionPillars.tsx`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/sections/home/components/MissionPillars.tsx
git commit -m "feat: add MissionPillars component — mission statement + neumorphic value pillars"
```

---

### Task 5: Create FeaturedProjects Component

**Files:**
- Create: `src/sections/home/components/FeaturedProjects.tsx`

Section 4: Three project cards in a responsive glass grid with hover effects. Section header "Proven Impact" + "View All Projects →" link.

- [ ] **Step 1: Create FeaturedProjects.tsx**

```typescript
// src/sections/home/components/FeaturedProjects.tsx
import { Link } from 'react-router-dom'
import { MapPin, ArrowRight } from 'lucide-react'
import type { ProjectCard } from '@/../product/sections/home/types'
import type { ImpactMetric } from '@/lib/content-types'

interface FeaturedProjectsProps {
  projects: ProjectCard[]
}

function statusDotColor(status: string): string {
  switch (status) {
    case 'operational':
      return 'bg-emerald-400'
    case 'development':
      return 'bg-amber-400'
    default:
      return 'bg-slate-400'
  }
}

function extractKeyMetrics(
  stats: { label: string; value: string }[],
): { label: string; value: string }[] {
  return stats.slice(0, 2)
}

function ProjectGlassCard({ project }: { project: ProjectCard }) {
  const metrics = extractKeyMetrics(project.stats ?? [])

  return (
    <Link
      to={`/projects/${project.id}`}
      className="group block rounded-xl overflow-hidden
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm
        border border-white/20 dark:border-white/10
        shadow-sm hover:shadow-xl
        transition-all duration-200 ease-out
        hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-slate-200 dark:bg-slate-800">
        {project.image ? (
          <img
            src={project.image}
            alt={project.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin size={32} className="text-slate-300 dark:text-slate-600" />
          </div>
        )}

        {/* Status dot */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-white/10 text-xs font-medium font-heading text-slate-700 dark:text-slate-300">
          <span className={`w-2 h-2 rounded-full ${statusDotColor(project.status)}`} />
          {project.status}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
          <MapPin size={12} />
          {project.location}
        </div>

        <h3 className="font-bold font-heading text-lg text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {project.name}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {project.description}
        </p>

        {/* Mini stats */}
        {metrics.length > 0 && (
          <div className="flex gap-5 pt-3 border-t border-slate-200 dark:border-slate-800">
            {metrics.map((m, i) => (
              <div key={i}>
                <p className="text-base font-bold font-heading text-slate-700 dark:text-slate-300">
                  {m.value}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  if (!projects || projects.length === 0) return null

  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-sm font-medium font-heading uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-3">
              By The Numbers
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 dark:text-white">
              Proven Impact
            </h2>
          </div>
          <Link
            to="/projects"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium font-heading text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            View All Projects
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Project cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.slice(0, 3).map((project) => (
            <ProjectGlassCard key={project.id} project={project} />
          ))}
        </div>

        {/* Mobile "View All" link */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-medium font-heading text-blue-600 dark:text-blue-400"
          >
            View All Projects
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit src/sections/home/components/FeaturedProjects.tsx`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/sections/home/components/FeaturedProjects.tsx
git commit -m "feat: add FeaturedProjects component — 3 glass project cards with hover effects"
```

---

### Task 6: Create TrustWall Component

**Files:**
- Create: `src/sections/home/components/TrustWall.tsx`

Section 5: Full partner logo grid + certification badges.

- [ ] **Step 1: Create TrustWall.tsx**

```typescript
// src/sections/home/components/TrustWall.tsx
import type { Partner } from '@/lib/content-types'

const CERTIFICATIONS = [
  { label: 'Philippine SEC Registered' },
  { label: 'DENR Environmental Compliance' },
  { label: 'DILG PPP Framework' },
  { label: 'ISO 14001 (in progress)' },
]

interface TrustWallProps {
  partners: Partner[]
}

export function TrustWall({ partners }: TrustWallProps) {
  if (!partners || partners.length === 0) {
    // Show certifications only
    return (
      <section className="py-16 sm:py-24 bg-slate-50/50 dark:bg-slate-950/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white text-center mb-8">
            Certifications & Compliance
          </h2>
          <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
            {CERTIFICATIONS.map((cert) => (
              <div
                key={cert.label}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
              >
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">✓</span>
                </span>
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-tight">
                  {cert.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 sm:py-24 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white text-center mb-8">
          Trusted By
        </h2>

        {/* Partner logo grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
          {partners.map((partner) => (
            <a
              key={partner.id}
              href={partner.website_url || undefined}
              target={partner.website_url ? '_blank' : undefined}
              rel="noopener noreferrer"
              className={partner.website_url ? 'cursor-pointer' : 'cursor-default'}
            >
              <div
                className="aspect-[3/2] rounded-lg flex items-center justify-center p-4
                  bg-white/40 dark:bg-slate-800/40
                  border border-slate-100 dark:border-slate-800
                  transition-all duration-300
                  hover:bg-white/80 dark:hover:bg-slate-800/80
                  hover:shadow-sm"
              >
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    loading="lazy"
                    decoding="async"
                    className="max-h-full max-w-full object-contain transition-all duration-300"
                    style={{ filter: 'grayscale(100%)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.filter = 'grayscale(0%)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.filter = 'grayscale(100%)'
                    }}
                  />
                ) : (
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 text-center">
                    {partner.name}
                  </span>
                )}
              </div>
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-700 max-w-xl mx-auto mb-8" />

        {/* Certifications */}
        <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white text-center mb-6">
          Certifications & Compliance
        </h3>
        <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto">
          {CERTIFICATIONS.map((cert) => (
            <div
              key={cert.label}
              className="flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
            >
              <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold">✓</span>
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-tight">
                {cert.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit src/sections/home/components/TrustWall.tsx`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/sections/home/components/TrustWall.tsx
git commit -m "feat: add TrustWall component — partner logo grid + certifications"
```

---

### Task 7: Create FinalCta Component

**Files:**
- Create: `src/sections/home/components/FinalCta.tsx`

Section 7: Glass card with inline simplified contact form. Submits via existing `submitContact()` Netlify function.

- [ ] **Step 1: Create FinalCta.tsx**

```typescript
// src/sections/home/components/FinalCta.tsx
import { useState, type FormEvent } from 'react'
import { Mail, Phone, Send, Loader2 } from 'lucide-react'
import { submitContact } from '@/lib/api'

interface FinalCtaProps {
  contactInfo: {
    email: string
    phone: string
  }
}

const DEFAULT_CONTACT_INFO = {
  email: 'contact@jca1221.com',
  phone: '+63 (2) 1234 5678',
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function FinalCta({ contactInfo }: FinalCtaProps) {
  const info = contactInfo.email ? contactInfo : DEFAULT_CONTACT_INFO

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const isValid = name.trim().length > 0 && email.trim().length > 0 && message.trim().length >= 10

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValid || state === 'loading') return

    setState('loading')
    setErrorMessage('')

    try {
      await submitContact({
        fullName: name.trim(),
        email: email.trim(),
        organization: organization.trim(),
        message: message.trim(),
      })
      setState('success')
    } catch (err) {
      setState('error')
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      )
    }
  }

  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Decorative divider */}
        <div className="flex items-center justify-center mb-12">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
        </div>

        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 dark:text-white mb-3">
            Let&rsquo;s Build Together
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Ready to bring environmental infrastructure to your community or portfolio?
          </p>
        </div>

        {state === 'success' ? (
          <div className="rounded-xl p-10 text-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
              <Send size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-2">
              Message Sent
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Thank you for reaching out. We&rsquo;ll get back to you within 24 hours.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-sm"
          >
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="cta-name" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="cta-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="cta-email" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="cta-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="cta-org" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Organization
              </label>
              <input
                id="cta-org"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                placeholder="Your organization (optional)"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="cta-message" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="cta-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors resize-none"
                placeholder="Tell us about your project or interest..."
              />
            </div>

            {state === 'error' && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={!isValid || state === 'loading'}
              className="inline-flex items-center gap-2 px-8 py-3 text-white font-semibold font-heading rounded-full
                bg-blue-500/80 hover:bg-blue-500/90 active:bg-blue-600/90
                backdrop-blur-md border border-white/20
                shadow-[0_4px_16px_rgba(59,130,246,0.25)]
                hover:shadow-[0_8px_24px_rgba(59,130,246,0.35)]
                active:scale-[0.98]
                transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {state === 'loading' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Message
                </>
              )}
            </button>
          </form>
        )}

        {/* Contact info */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <Mail size={14} />
            {info.email}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Phone size={14} />
            {info.phone}
          </span>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit src/sections/home/components/FinalCta.tsx`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/sections/home/components/FinalCta.tsx
git commit -m "feat: add FinalCta component — inline contact form with submit/loading/success/error states"
```

---

### Task 8: Modify HeroSection

**Files:**
- Modify: `src/sections/home/components/HeroSection.tsx`

Changes: Remove mouse-following ripples, remove edge detection (mouseMove handler, shell reveal/hide callbacks), slow cycling interval from 3500ms to 6000ms, add subtitle prop capability, add secondary "Our Impact" CTA that smooth-scrolls to trust strip.

- [ ] **Step 1: Read current props and identify changes needed**

The current `HeroSectionProps` is:
```typescript
interface HeroSectionProps {
  hero: HeroContent
  onCtaClick?: () => void
  onShellReveal?: () => void
  onShellHide?: () => void
}
```

New props interface:
```typescript
interface HeroSectionProps {
  hero: HeroContent
  onCtaClick?: () => void
  onSecondaryCtaClick?: () => void
}
```

Remove: `onShellReveal`, `onShellHide`, `onMouseMove` handler, edge timer ref, `edgeTimer` cleanup, `handleMouseMove` function, shell edge detection `<div>`, and `NEXT_WORD_START` / `endCycle` logic (replaced by slower interval).

Changes to apply via targeted edits:

1. Change `CYCLE_INTERVAL` from `3500` to `6000` (line 9)
2. Remove `onShellReveal` and `onShellHide` from props, replace with `onSecondaryCtaClick` (line 44-49)
3. Remove `edgeTimer` ref (line 68)
4. Remove `handleMouseMove` function + the `onMouseMove={handleMouseMove}` on section (lines 86-93, line 168)
5. Remove shell edge detection `<div>` (line 187)
6. Remove edge timer from cleanup `useEffect` (line 97)
7. Change single CTA button to dual CTA (lines 271-283)
8. Add subtitle text below site name (after line 205)

Let me do each edit sequentially.

- [ ] **Step 2: Change cycle interval to 6000ms**

Edit `src/sections/home/components/HeroSection.tsx` line 9:
```
const CYCLE_INTERVAL = 3500
```
→
```
const CYCLE_INTERVAL = 6000
```

- [ ] **Step 3: Replace props interface**

Edit lines 44-49:
```
interface HeroSectionProps {
  hero: HeroContent
  onCtaClick?: () => void
  onShellReveal?: () => void
  onShellHide?: () => void
}
```
→
```
interface HeroSectionProps {
  hero: HeroContent
  onCtaClick?: () => void
  onSecondaryCtaClick?: () => void
}
```

- [ ] **Step 4: Update function signature**

Edit line 67:
```
export function HeroSection({ hero, onCtaClick, onShellReveal, onShellHide }: HeroSectionProps) {
```
→
```
export function HeroSection({ hero, onCtaClick, onSecondaryCtaClick }: HeroSectionProps) {
```

- [ ] **Step 5: Remove edgeTimer ref**

Edit lines 68:
```
  const edgeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const cycleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const bgTeardownRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
```
→
```
  const cycleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const bgTeardownRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
```

- [ ] **Step 6: Remove handleMouseMove**

Delete lines 86-93:
```
  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.clientY <= 64) {
      clearTimeout(edgeTimer.current)
      onShellReveal?.()
    } else {
      edgeTimer.current = setTimeout(() => onShellHide?.(), 300)
    }
  }
```

- [ ] **Step 7: Clean up useEffect — remove edgeTimer cleanup**

Edit lines 95-101:
```
  useEffect(() => {
    return () => {
      clearTimeout(edgeTimer.current)
      clearTimeout(cycleTimer.current)
      clearTimeout(bgTeardownRef.current)
    }
  }, [])
```
→
```
  useEffect(() => {
    return () => {
      clearTimeout(cycleTimer.current)
      clearTimeout(bgTeardownRef.current)
    }
  }, [])
```

- [ ] **Step 8: Remove onMouseMove from section element**

Edit line 168:
```
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
```
→
```
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
```

- [ ] **Step 9: Remove shell edge detection div**

Delete line 187:
```
      <div className="fixed top-0 left-0 right-0 h-16 z-50 pointer-events-none" aria-hidden="true" />
```

- [ ] **Step 10: Replace single CTA with dual CTA**

Edit lines 271-283 — the single CTA button block:
```
        <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <button
            onClick={onCtaClick}
            className="group inline-flex items-center gap-3 px-8 py-4 text-white font-semibold font-heading rounded-full border border-white/20 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_var(--btn-glow)] active:scale-[0.98] transition-all duration-300"
            style={{ '--btn-glow': wordAccent.glow } as React.CSSProperties}
          >
            {hero.ctaLabel}
            <ArrowDown
              size={18}
              className="inline ml-2 group-hover:translate-y-0.5 transition-transform duration-300"
            />
          </button>
        </div>
```
→
```
        {/* Dual CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          {/* Primary CTA */}
          <button
            onClick={onCtaClick}
            className="group inline-flex items-center gap-2 px-8 py-4 text-white font-semibold font-heading rounded-full border border-white/20 backdrop-blur-md shadow-[0_4px_16px_var(--btn-glow)] hover:shadow-[0_8px_24px_var(--btn-glow)] active:scale-[0.98] transition-all duration-300"
            style={{ '--btn-glow': wordAccent.glow } as React.CSSProperties}
          >
            {hero.ctaLabel || 'Partner With Us'}
          </button>

          {/* Secondary CTA */}
          <button
            onClick={onSecondaryCtaClick}
            className="group inline-flex items-center gap-2 px-8 py-4 text-white/80 hover:text-white font-semibold font-heading rounded-full border border-white/20 backdrop-blur-sm hover:backdrop-blur-md hover:border-white/40 active:scale-[0.98] transition-all duration-300"
          >
            Our Impact
            <ArrowDown
              size={18}
              className="group-hover:translate-y-0.5 transition-transform duration-300"
            />
          </button>
        </div>
```

- [ ] **Step 11: Commit**

```bash
git add src/sections/home/components/HeroSection.tsx
git commit -m "refactor: simplify hero — remove ripples/edge detection, add secondary CTA, slow cycle to 6s"
```

---

### Task 9: Rewrite HomeView

**Files:**
- Modify: `src/sections/home/HomeView.tsx`

Replace the old section composition (Hero → ProjectCarousel → MissionSection → ImpactStats → ExpansionSection) with new section order. The original is backed up at `HomeView.original.tsx`.

New HomeView composes: Hero → TrustStrip → MissionPillars → FeaturedProjects → TrustWall → CSR section wrapper → FinalCta.

- [ ] **Step 1: Write new HomeView.tsx**

```typescript
// src/sections/home/HomeView.tsx
import { HeroSection } from './HeroSection'
import { TrustStrip } from './TrustStrip'
import { MissionPillars } from './MissionPillars'
import { FeaturedProjects } from './FeaturedProjects'
import { TrustWall } from './TrustWall'
import { CsrCarousel } from './CsrCarousel'
import { FinalCta } from './FinalCta'
import type { HeroContent, ProjectCard, ImpactStat } from '@/../product/sections/home/types'
import type { Partner, CsrProject } from '@/lib/content-types'

export interface NewHomeViewProps {
  hero: HeroContent
  projectCards: ProjectCard[]
  impactStats: ImpactStat[]
  partners: Partner[]
  csrProjects: CsrProject[]
  onCtaClick?: () => void
  onSecondaryCtaClick?: () => void
  onProjectClick?: (projectId: string) => void
}

const PILLARS = [
  {
    title: 'Stewardship',
    description:
      "We don't own the land or water — we restore what's been damaged, for the next generation.",
  },
  {
    title: 'Ingenuity',
    description:
      'Filipino-engineered solutions that cost 60% less than conventional infrastructure — built to last.',
  },
  {
    title: 'Partnership',
    description:
      'We work with, not for — LGUs, communities, and the private sector share ownership.',
  },
]

export function HomeView({
  hero,
  projectCards,
  impactStats,
  partners,
  csrProjects,
  onCtaClick,
  onSecondaryCtaClick,
}: NewHomeViewProps) {
  const partnerNames = partners.slice(0, 6).map((p) => p.name)

  return (
    <div className="font-body">
      {/* Section 1: Hero */}
      <HeroSection
        hero={hero}
        onCtaClick={onCtaClick}
        onSecondaryCtaClick={onSecondaryCtaClick}
      />

      {/* Section 2: Trust Strip */}
      <TrustStrip stats={impactStats} partnerLogos={partnerNames} />

      {/* Section 3: Mission & Values */}
      <MissionPillars
        tagline="Serbisyo, Hindi Negosyo"
        taglineSub="Service, Not Business — because environmental renewal is infrastructure for human dignity."
        pillars={PILLARS}
      />

      {/* Section 4: Featured Projects */}
      <FeaturedProjects projects={projectCards} />

      {/* Section 5: Trust Wall */}
      <TrustWall partners={partners} />

      {/* Section 6: CSR Spotlight */}
      <CsrCarousel
        projects={csrProjects}
        title="Community & CSR"
        subtitle="Beyond Infrastructure"
      />

      {/* Section 7: Final CTA */}
      <FinalCta contactInfo={{ email: 'contact@jca1221.com', phone: '+63 (2) 1234 5678' }} />
    </div>
  )
}
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit src/sections/home/HomeView.tsx`

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/sections/home/HomeView.tsx
git commit -m "feat: rewrite HomeView — enterprise cascade section order with 5 new components"
```

---

### Task 10: Rewrite HomePage

**Files:**
- Modify: `src/pages/HomePage.tsx`

Replace section composition. The original is backed up at `HomePage.original.tsx`.

Changes:
- Remove `HomeView` import (old), import new `HomeView` with new props
- Remove `PartnerLogoCarousel` import (now handled by TrustWall in HomeView)
- Remove `CsrCarousel` import (now composed inside HomeView)
- Simplify data mapping — remove Expansion/MissionValues/Fallback
- Pass new props: `onSecondaryCtaClick` for smooth-scroll to trust strip
- Add `useMemo` for `projectCards` mapping

Note: The `HomeView` now takes a `NewHomeViewProps` interface. The page still imports `HomeProps` from types but won't use it. The `HeroContent` type is still needed.

- [ ] **Step 1: Write new HomePage.tsx**

```typescript
import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { HomeView } from '@/sections/home/HomeView'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { HeroPageSkeleton } from '@/components/PageSkeleton'
import { NAV_ITEMS } from '@/lib/navigation'
import { useProjects, usePartners, usePageContent, getPageValue, useCsrProjects } from '@/hooks/use-content'
import { useImpactStats } from '@/hooks/use-impact-stats'
import type { HeroContent, ProjectCard, ProjectAward } from '@/../product/sections/home/types'

const FALLBACK_HERO: HeroContent = {
  siteName: 'JCA 1221 Holdings',
  tagline: 'Earth Renewal for Generations',
  description:
    'Environmental infrastructure for Philippine communities — water reclamation, solid waste management, and land renewal through public-private partnerships.',
  backgroundImage: '/images/hero-water.jpg',
  ctaLabel: 'Partner With Us',
  ctaHref: '#projects',
}

export function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { projects, loading: projectsLoading } = useProjects()
  const { content, loading: contentLoading } = usePageContent('home')
  const { stats: impactStats, loading: impactLoading } = useImpactStats()
  const { partners } = usePartners()
  const { projects: csrProjects } = useCsrProjects()

  const loading = projectsLoading || contentLoading || impactLoading

  useEffect(() => {
    document.title = 'JCA 1221 Holdings — Environmental Infrastructure'
  }, [])

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: item.href === '/' || location.pathname === item.href,
  }))

  // Hero content — Supabase or fallback
  const hero: HeroContent = (getPageValue(content, 'hero', 'content') as HeroContent) ?? FALLBACK_HERO

  // Project cards from Supabase — useMemo to prevent re-mapping on every render
  const projectCards: ProjectCard[] = useMemo(
    () =>
      projects.map((p) => ({
        id: p.id,
        name: p.name,
        location: p.location,
        status: p.status,
        image: p.hero_image ?? '',
        description: p.short_description,
        award: undefined as unknown as ProjectAward,
        stats: (p.stats ?? []) as { label: string; value: string }[],
      })),
    [projects],
  )

  const handleCtaClick = () => {
    const el = document.getElementById('trust-strip')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate('/contact')
    }
  }

  const handleSecondaryCtaClick = () => {
    const el = document.getElementById('trust-strip')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <AppShell
      navigationItems={navItems}
      onNavigate={(href) => navigate(href)}
      onCtaClick={() => navigate('/contact')}
    >
      <ErrorBoundary>
        {loading ? (
          <HeroPageSkeleton />
        ) : (
          <HomeView
            hero={hero}
            projectCards={projectCards}
            impactStats={impactStats}
            partners={partners}
            csrProjects={csrProjects}
            onCtaClick={handleCtaClick}
            onSecondaryCtaClick={handleSecondaryCtaClick}
            onProjectClick={(id) => navigate(`/projects/${id}`)}
          />
        )}
      </ErrorBoundary>
    </AppShell>
  )
}
```

- [ ] **Step 2: Verify file compiles**

Run: `npx tsc --noEmit src/pages/HomePage.tsx`

Expected: No errors. The unused `ProjectAward` import is needed for type casting in the map.

- [ ] **Step 3: Commit**

```bash
git add src/pages/HomePage.tsx
git commit -m "feat: rewrite HomePage — enterprise cascade with new HomeView, useMemo optimization"
```

---

### Task 11: Update Component Index Exports

**Files:**
- Modify: `src/sections/home/components/index.ts`

Add new component exports.

- [ ] **Step 1: Update index.ts**

Replace `src/sections/home/components/index.ts`:
```typescript
export { HomeView } from '../HomeView'
export { HeroSection } from './HeroSection'
export { TrustStrip } from './TrustStrip'
export { MissionPillars } from './MissionPillars'
export { FeaturedProjects } from './FeaturedProjects'
export { TrustWall } from './TrustWall'
export { CsrCarousel } from './CsrCarousel'
export { FinalCta } from './FinalCta'
// Kept for HomeAltPage compatibility
export { ProjectCarousel } from './ProjectCarousel'
export { MissionSection } from './MissionSection'
export { ImpactStats } from './ImpactStats'
export { ExpansionSection } from './ExpansionSection'
```

- [ ] **Step 2: Verify no circular imports**

Run: `npx tsc --noEmit src/sections/home/components/index.ts`

Expected: No errors. The HomeView export references `../HomeView` which imports from `./components/index` — check that this doesn't cause circular dependency.

Note: `HomeView` is at `src/sections/home/HomeView.tsx` and imports components from `./components/...`. The index.ts at `src/sections/home/components/index.ts` re-exports `HomeView` from `../HomeView`. This creates a circular reference if anything imports from `./components/index` inside HomeView. Since HomeView uses direct imports (`from './HeroSection'`, not `from '.'`), this is fine.

- [ ] **Step 3: Commit**

```bash
git add src/sections/home/components/index.ts
git commit -m "chore: update component index exports for new homepage components"
```

---

### Task 12: Build Verification

**Files:**
- None (verification only)

- [ ] **Step 1: Run TypeScript check on full project**

Run: `npx tsc --noEmit`

Expected: No errors. If errors appear, fix them before proceeding.

- [ ] **Step 2: Run build**

Run: `npm run build`

Expected: Successful build with no errors. Vite should produce output in `dist/`.

- [ ] **Step 3: Start dev server and check homepage renders**

Run: `npm run dev`

Expected: Homepage at `http://localhost:3000` renders all 7 sections in order. Check:
- Hero: cycling words at 6s interval, no ripples, dual CTA
- Trust strip: counters animate on scroll, partner names visible
- Mission pillars: neumorphic cards with press effect on click
- Featured projects: 3 cards (or fewer if fewer projects), hover effects
- Trust wall: partner logos, certifications
- CSR carousel: CSR projects
- Final CTA: form renders, submit works

- [ ] **Step 4: Verify dark mode**

Toggle dark mode (ThemeToggle in nav). Check all sections render correctly with glass opacity.

- [ ] **Step 5: Verify mobile (375px)**

Resize browser to 375px width. Check no horizontal overflow, all sections stack vertically.

- [ ] **Step 6: Verify HomeAltPage still works**

Navigate to `/alt`. Confirm HomeAltPage renders without errors.

- [ ] **Step 7: Verify reduced motion**

Enable `prefers-reduced-motion` in dev tools. Confirm animations disabled, counters jump to final value.

- [ ] **Step 8: Commit final verification**

```bash
git add -A
git commit -m "chore: final verification — homepage redesign complete"
```

---

## Pre-Delivery Checklist

- [ ] No emojis used as icons (all lucide-react)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] Original files preserved as `.original.tsx`
- [ ] `HomeAltPage.tsx` unchanged and functional
