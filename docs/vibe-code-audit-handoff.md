# Vibe-Code Remediation Handoff

**Audit date**: 2026-06-02
**Scope**: Cross-reference JCA 1221 website against comprehensive vibe-code giveaway list
**Sources**: [wasitvibed.com](https://wasitvibed.com), [dev.to/kaplich](https://dev.to/kaplich/i-analyzed-100-vibe-coded-websites-and-found-these-common-mistakes-5275), [fountaininstitute.com](https://www.thefountaininstitute.com/blog/signs-vibe-coded-ui), [aquilax.ai](https://aquilax.ai/blog/how-to-identify-vibe-coded-ai-generated-code)

---

## What already passes (baseline)

Full marks on: semantic HTML, heading hierarchy, alt text, OG/metadata, favicon, viewport, form accessibility, responsive breakpoints, `prefers-reduced-motion`, honeypot spam protection, no hardcoded credentials, no emoji-as-icons, domain-specific variable names, focused dependency stack.

---

# Phase 1 — Fast laundry-level fixes (≤ 2 hours)

Two mechanical changes with high vibe-code smell reduction per minute spent. No visual regression risk.

## 1A: Remove all decorative gradient separator lines

These `h-px bg-gradient-to-r from-transparent via-COLOR to-transparent` lines on section boundaries are a top-3 AI fingerprint. Search and remove from every file.

**Files touched**:

| File | Line(s) | Context |
|---|---|---|
| `src/sections/home/components/HeroSection.tsx` | 177 | Scroll indicator at bottom |
| `src/sections/home/components/ImpactStats.tsx` | 76, 101 | Top and bottom lines |
| `src/sections/home/components/MissionSection.tsx` | 47 | Top warm line |
| `src/sections/home/components/ExpansionSection.tsx` | 66 | Top amber line |
| `src/sections/about-and-mission/components/AboutView.tsx` | 30 | Top blue line |
| `src/sections/about-and-mission/components/FounderLetterSection.tsx` | 29, 78 | Top and bottom blue lines |
| `src/sections/about-and-mission/components/ValuePillarSection.tsx` | 123 | Bottom neutral line |
| `src/sections/about-and-mission/components/FounderProfileSection.tsx` | 14 | Top blue line |
| `src/sections/about-and-mission/components/ValuePillarSection.tsx` | 75 | Per-pillar top line (dynamic) |

**Action**: Delete each `<div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r ..." />` element. Section transitions will breathe through background color and content density alone.

## 1B: Swap blue-tinted shadows to neutral

Colored glow shadows (`rgba(59,130,246, …)`) are an AI aesthetic tell. Replace all blue-tinted shadow values with neutral equivalents.

**Search pattern**: `rgba\(59,130,246,`

**Files touched**:

| File | Current | Replace with |
|---|---|---|
| `AppShell.tsx:87` | `rgba(59,130,246,0.06)` | `rgba(0,0,0,0.06)` |
| `AppShell.tsx:87` (dark) | `rgba(59,130,246,0.03)` | `rgba(0,0,0,0.08)` |
| `TechnologyGridSection.tsx:78` | `rgba(59,130,246,0.06)` | `rgba(0,0,0,0.06)` |
| `TechnologyGridSection.tsx:78` hover | `rgba(59,130,246,0.12)` | `rgba(0,0,0,0.10)` |
| `ContactForm.tsx:331` (submit btn) | `rgba(59,130,246,0.25)` | `rgba(0,0,0,0.12)` |
| `ContactForm.tsx:331` hover | `rgba(59,130,246,0.35)` | `rgba(0,0,0,0.18)` |
| `ContactInfoPanel.tsx:207` | `rgba(59,130,246,0.06)` | `rgba(0,0,0,0.04)` |
| `TechnologyGridSection.tsx:81` (GlassPill) | `rgba(59,130,246,0.1)` | `rgba(0,0,0,0.08)` |
| `FounderProfileSection.tsx:34` (avatar) | `rgba(59,130,246,0.12)` | `rgba(0,0,0,0.08)` |

**Note**: Keep CTAs (`rgb(59,130,246)` tint in the background/button itself — the brand is blue. Only nuke the *shadow* tint.

---

# Phase 2 — Glassmorphism discipline (≤ 3 hours)

Glassmorphism on every surface reads as AI-default. Strategic reserve makes the same effect feel intentional.

## 2A: Audit and classify every `backdrop-blur` surface

**Current state** — `backdrop-blur` on 11+ surfaces across 4 components:

| Component | Surfaces | Keep? |
|---|---|---|
| AppShell header | `backdrop-blur-md` | ✅ Yes — sticky nav needs visual separation |
| AppShell footer | `backdrop-blur-md` | ❌ Remove — solid surface |
| AppShell sidebar | `backdrop-blur-xl` | ❌ Remove — solid surface |
| ContactForm card | `backdrop-blur-xl` | ✅ Keep — form over dark textured BG |
| ContactInfoPanel cards | `backdrop-blur-lg` | ❌ Remove — solid surface + subtle border |
| ContactInfoPanel schedule CTA | `backdrop-blur-lg` | ✅ Keep — CTA callout |
| ContactForm inputs | `backdrop-blur-md` | ❌ Remove — solid inputs with subtle border |
| TechnologyGridSection cards | `backdrop-blur-xl` | ❌ Remove — solid card over dark BG |
| LiveDashboardSection cards | `backdrop-blur-xl` | ❌ Remove — solid card |
| GlassPill component | `backdrop-filter: blur(8px)` | ✅ Keep — it's the brand element |
| ContactView success state | `backdrop-blur-xl` | ❌ Remove — solid surface |

**Target**: Reduce from 11+ to 4 strategic surfaces (header nav, contact form card, schedule CTA, GlassPill + its use in Hero droplet).

## 2B: Implement solid surface replacements

For each surface marked ❌ remove, replace `backdrop-blur-*` with solid colors:

```
// Pattern: glass → solid
- bg-white/5 backdrop-blur-xl  →  bg-white dark:bg-slate-900
- bg-white/5 backdrop-blur-lg  →  bg-white dark:bg-slate-900/80
- bg-white/5 backdrop-blur-md  →  bg-slate-50 dark:bg-slate-800/60
```

This gives the kept glass surfaces contrast — they read as elevated/important because everything else is grounded.

---

# Phase 3 — Atmospheric orb replacement (≤ 4 hours)

Floating blurred circles are the #1 AI-generated website tell. Replace with project's own custom `ShaderBackground` variants.

## 3A: Map orbs to ShaderBackground variants

| Location | Current | Replacement |
|---|---|---|
| `ContactView.tsx:31` — blue orb `blur-[180px]` | Generic circle | Already has `ShaderBackground variant="dark"` — strengthen its opacity to 0.7 and remove circles |
| `ContactView.tsx:32` — cyan orb `blur-[150px]` | Generic circle | Same — remove |
| `TechnologyGridSection.tsx:42-44` — three blue orbs | Three circles at different blur radii | Already has `ShaderBackground variant="dots"` — remove orbs, dots variant alone is enough over solid `bg-slate-950` |
| `LiveDashboardSection.tsx:426` — slate orb `blur-[120px]` | Generic circle | Already has `ShaderBackground variant="slate"` — remove orb |

## 3B: If orbs were serving a visual purpose (color accent on dark backgrounds)

For sections where removing the orb creates a flat feel, add a second `ShaderBackground` layer:

```tsx
{/* Replace */}
<div className="absolute top-10 right-10 w-[30rem] h-[30rem] rounded-full bg-blue-500/8 blur-[150px]" />

{/* With */}
<ShaderBackground variant="blue" opacity={0.15} animated={false} />
```

The `ShaderBackground` component has hand-written canvas variants that produce organic, non-AI-looking texture — blue variant has drifting orb + wave line + grain, emerald has organic blob scatter + bezier curves, amber has horizontal drift lines. All more distinctive than a blurred div.

---

# Phase 4 — Image overlay improvements (≤ 2 hours)

## 4A: Replace radial-gradient overlays on project images

`ProjectCarousel.tsx:40` and `ProjectDetail.tsx:41` use v0/Lovable-fingerprint radial gradient pattern:

```tsx
// Current (vibe-code fingerprint)
<div className="absolute inset-0 opacity-30 dark:opacity-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-blue-600 to-blue-900" />
```

**Replace with**: Flat directional gradient overlay using simpler syntax:

```tsx
// Replacement
<div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-blue-950/40 to-slate-950/40" />
```

A flat overlay reads as a deliberate photography treatment, not an AI's first choice.

## 4B: Remove the double overlay pattern

Both files apply gradient-then-radial on the same image. Example from `ProjectCarousel.tsx`:

```
Line 40: radial-gradient from-blue-400 via-blue-600 to-blue-900
Line 41: bg-gradient-to-t from-white/90 via-white/40 to-transparent
```

Two layered gradient overlays on the same image = double the AI tell. Collapse into one: the bottom fade (`bg-gradient-to-t` from solid to transparent) is the one doing the work (it creates the text-readable zone). Remove the radial entirely.

---

# Phase 5 — Border-radius hierarchy (≤ 1 hour)

## 5A: Differentiate card shapes from pill shapes

Currently everything is `rounded-2xl` (cards) and `rounded-full` (buttons/badges/pills). Introduce third shape for visual hierarchy:

| Element | Current | New | Rationale |
|---|---|---|---|
| Section cards | `rounded-2xl` | `rounded-xl` | Flatter = grounded |
| GlassPill badges | `rounded-full` | `rounded-full` | No change — brand element |
| CTAs/buttons | `rounded-full` | `rounded-full` | No change — deliberate choice |
| Contact form panel | `rounded-2xl` | `rounded-xl` | Match card language |
| Dashboard metric cards | `rounded-2xl` | `rounded-xl` | Match card language |
| Technology pillar cards | `rounded-2xl` | `rounded-xl` | Match card language |

The `rounded-full` pill shape becomes a signal — you see it and think "that's a JCA 1221 element" because it's only used on interactive elements and brand badges, not on everything.

---

# Implementation Reference

## Recommended tool approach

Phase 1 and 5 are mechanical search/replace — use Grep to locate each pattern, Edit to replace.

Phase 2-4 require judgment per-file — read each file, assess context, apply replacement patterns listed above.

## Test checklist per phase

| Phase | Test |
|---|---|
| 1A | Scroll every page — no orphaned spacer divs, sections still have visual separation |
| 1B | Audit every interactive element — buttons still have visible press feedback |
| 2 | Toggle dark mode on every page — cards still readable, no transparency-on-transparency stacking |
| 3 | Verify ShaderBackground canvas renders on affected sections — no console errors |
| 4 | Verify project images still have readable text overlay — contrast check |
| 5 | Visual pass on each page — no element looks "wrong shape" for its role |

## Files at risk of merge conflicts

- `src/sections/home/components/HeroSection.tsx` (Phase 1A)
- `src/sections/contact-and-partnerships/components/ContactForm.tsx` (Phase 1B, 2)
- `src/sections/technology-and-approach/components/TechnologyGridSection.tsx` (Phase 1B, 2, 3)
- `src/shell/components/AppShell.tsx` (Phase 1B, 2)
