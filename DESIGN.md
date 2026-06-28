---
name: JCA 1221 Holdings
description: Philippine environmental infrastructure — engineered coastal renewal, documented as proof.
colors:
  pacific-blue: "oklch(0.546 0.245 262.881)"
  tidal-blue-light: "oklch(0.707 0.165 254.624)"
  coastal-blue-wash: "oklch(0.97 0.014 254.604)"
  slate-ink: "oklch(0.216 0.006 56.043)"
  slate-mist: "oklch(0.985 0.001 106.424)"
  surface-white: "oklch(1 0 0)"
  slate-muted: "oklch(0.444 0.011 73.639)"
  slate-line: "oklch(0.923 0.003 48.717)"
  mangrove-green: "oklch(0.527 0.154 150.069)"
  sediment-amber: "oklch(0.769 0.188 70.08)"
  bloom-fuchsia: "oklch(0.627 0.265 303.9)"
  deep-cyan: "oklch(0.398 0.07 227.392)"
  coral-alert: "oklch(0.586 0.253 17.585)"
typography:
  display:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 4.5rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  title:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.pacific-blue}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "{colors.pacific-blue}"
    textColor: "{colors.surface-white}"
  button-outline:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  badge-default:
    backgroundColor: "{colors.pacific-blue}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  card:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.xl}"
    padding: "24px"
  input:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.md}"
    padding: "4px 12px"
    height: "36px"
---

# Design System: JCA 1221 Holdings

## 1. Overview

**Creative North Star: "Blueprint for Renewal"**

This is the visual language of an engineer who plants forests. Every surface carries two readings at once: the precision of infrastructure that a government would underwrite, and the optimism of an ecosystem coming back to life. The drawing and the regrowth share one page. Type is geometric and exact (DM Sans, tightly tracked); color is an engineered blue carrying the system, with living greens and sediment ambers reserved for the moments that prove impact. Nothing is decorative for its own sake — a number, a photograph of the actual site, or a named partner earns every block it occupies.

The system is **bold and confident**, not loud. Hierarchy is decisive: one element commands each fold, proof front-loads, and a first-time visitor reaches "this is a real, capable operator" within the first scroll. Surfaces are **flat and institutional by default** — 1px borders, restrained shadows, crisp edges — with exactly one tactile flourish allowed: the neumorphic navigation pills, which give the chrome a physical, instrument-panel quality without softening the content beneath.

It explicitly rejects four traps named in PRODUCT.md: **generic templated corporate** (interchangeable, no POV), **greenwashed eco-cliché** (leaf logos, hands-in-soil stock, "sustainability" without proof), **SaaS / startup-y** (gradient hero-metric templates, purple gradients, dev-tool aesthetic), and **govt-bureaucratic dull** (dense, gray, lifeless). The standing risk is the blue-and-slate base reading as generic-tech-corporate; the antidote is that color never carries the brand alone — real coastal imagery, measured data, and the green/amber proof accents do.

**Key Characteristics:**
- Engineered precision in type and spacing; bold, decisive hierarchy.
- Flat institutional surfaces; one signature tactile element (nav pills), not a theme.
- Blue carries the system; green and amber are earned, proof-only accents.
- Proof over decoration — imagery and numbers, never eco-iconography.
- Full light/dark parity; WCAG 2.1 AA contrast in both.

## 2. Colors

A cool, engineered base — Pacific blue on slate — warmed only where the work proves itself, by living green and sediment amber.

### Primary
- **Pacific Blue** (`oklch(0.546 0.245 262.881)`, blue-600): The system color. Primary buttons, active links, key emphasis, brand mark. In dark mode it lightens to **Tidal Blue** (`oklch(0.707 0.165 254.624)`, blue-400) to hold contrast on slate. Used as the structural voice — credible, technical, calm.
- **Coastal Blue Wash** (`oklch(0.97 0.014 254.604)`, blue-50): The soft accent ground — hovered ghost states, quiet highlight panels, selected chips.

### Secondary (proof accents — earned, not decorative)
- **Mangrove Green** (`oklch(0.527 0.154 150.069)`, emerald-600): Restoration and positive-impact data only — growth metrics, "completed" status, ecological gains. Never a background wash; it signals a real outcome.
- **Sediment Amber** (`oklch(0.769 0.188 70.08)`, amber-400): In-progress status, attention, secondary data series. The warm counterpoint to blue.

### Tertiary (data visualization only)
- **Bloom Fuchsia** (`oklch(0.627 0.265 303.9)`, fuchsia-500) and **Deep Cyan** (`oklch(0.398 0.07 227.392)`, cyan-800): Additional chart series so multi-category data stays legible. Confined to charts; never UI chrome.

### Neutral
- **Slate Ink** (`oklch(0.216 0.006 56.043)`, slate-900): Primary text on light; the dark-mode background. Body copy lands here, not on a lighter gray.
- **Slate Muted** (`oklch(0.444 0.011 73.639)`, slate-600): Secondary text, captions, metadata — and it must still clear 4.5:1 on its background.
- **Slate Mist** (`oklch(0.985 0.001 106.424)`, slate-50): Page background (light).
- **Surface White** (`oklch(1 0 0)`): Cards and raised content on light.
- **Slate Line** (`oklch(0.923 0.003 48.717)`, slate-200): Borders, dividers, input strokes.

### Named Rules
**The Earned-Green Rule.** Green and amber appear only attached to a real, measured outcome — a number, a status, a chart series. A green section background or a leaf-green button is forbidden; that is the greenwash tell. Blue carries chrome; green carries proof.

**The Two-Reading Rule.** Every screen must read as *infrastructure* (precise, credible) and *renewal* (alive, hopeful) at once. If a comp reads only as a generic blue SaaS page, the renewal half is missing — add real site imagery or impact data, not more blue.

## 3. Typography

**Display Font:** DM Sans (with `system-ui, sans-serif`)
**Body Font:** Inter (with `system-ui, sans-serif`)
**Label/Mono Font:** IBM Plex Mono (with `ui-monospace, monospace`)

**Character:** A geometric-sans family for headings paired with a humanist-sans for body — contrast by role and weight rather than by dramatic style switch. DM Sans gives headings an engineered, drawn-to-spec confidence; Inter keeps long copy quiet and legible; IBM Plex Mono is reserved for data labels, figures, and technical metadata, reinforcing the "blueprint" voice. Headings are semibold and tightly tracked; body breathes.

### Hierarchy
- **Display** (DM Sans 600, `clamp(2.5rem, 6vw, 4.5rem)`, line-height 1.05, tracking -0.02em): Hero headline only. One per page. Use `text-wrap: balance`.
- **Headline** (DM Sans 600, `clamp(1.75rem, 3vw, 2.5rem)`, line-height 1.15): Section openers.
- **Title** (DM Sans 600, `1.25rem`, line-height 1.3): Card titles, sub-section heads.
- **Body** (Inter 400, `1rem`, line-height 1.6): Paragraph copy. Cap measure at 65–75ch. Use `text-wrap: pretty`.
- **Label** (IBM Plex Mono 500, `0.8125rem`, tracking 0.02em): Data figures, stat captions, status metadata, technical tags.

### Named Rules
**The Mono-Is-Data Rule.** IBM Plex Mono is for numbers and technical labels, never for body prose or headlines. Mono-as-decoration is the lazy "technical" costume the brand bans.

**The One-Display Rule.** A single Display headline per page. A second competing giant headline flattens the hierarchy and the "one idea per fold" pacing.

## 4. Elevation

A **flat-by-default, hybrid** system. Content surfaces (cards, inputs, panels) sit nearly flat — a 1px `slate-line` border plus the faintest shadow for separation, not for drama. Depth in content comes from tonal layering (white cards on slate-mist), not from heavy shadows. The deliberate exception is the **navigation chrome**, which uses a true neumorphic shadow vocabulary (paired light/dark offset shadows) to read as a tactile, pressable instrument panel — and the **mobile menu**, a frosted glass panel (`backdrop-blur-xl`). These are the only places soft/glass treatments are sanctioned.

### Shadow Vocabulary
- **Card rest** (`box-shadow: 0 1px 2px rgba(0,0,0,0.05)` — `shadow-sm`): Quiet separation of a card from the page. Borders do most of the work.
- **Input / outline button** (`shadow-xs`): Barely-there lift on interactive fields.
- **Neumorphic raised** (`3px 3px 8px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.9)`): Nav pills and the mobile hamburger at rest.
- **Neumorphic pressed** (`inset 2px 2px 5px rgba(0,0,0,0.08), inset -1px -1px 3px rgba(255,255,255,0.6)`): The active/current nav pill — physically "pushed in."
- **Glass panel** (`-8px 0 32px rgba(59,130,246,0.06)` over `backdrop-filter: blur(20px)`): Mobile slide-out navigation only.

### Named Rules
**The One-Tactile-Surface Rule.** Neumorphism and glass are confined to navigation. Content — cards, forms, sections — stays flat. A neumorphic card or a glass content panel breaks the institutional read and is forbidden.

## 5. Components

### Buttons
- **Shape:** Gently rounded (6px, `rounded-md`); large/small sizes keep the same radius.
- **Primary:** `pacific-blue` background, white text, `8px 16px` padding, 36px tall (`h-9`). Bold and decisive — the single clear action per view.
- **Hover / Focus:** Hover darkens to `primary/90` with an all-property transition; focus shows a 3px `ring-ring/50` ring plus border shift. Never remove the focus ring.
- **Secondary / Outline / Ghost / Link:** Outline = 1px border on background with `shadow-xs`; secondary = `secondary` slate fill; ghost = transparent, fills with `coastal-blue-wash` on hover; link = blue text, underline on hover.

### Badges / Chips
- **Style:** Pill (`rounded-full`), `2px 8px`, `text-xs` semibold. Default = `pacific-blue` fill; use `secondary` for neutral tags, `outline` for quiet metadata. Status badges may use `mangrove-green` (complete) / `sediment-amber` (in progress) per the Earned-Green Rule.

### Cards / Containers
- **Corner Style:** 12px (`rounded-xl`).
- **Background:** `surface-white` on light, `card` slate on dark.
- **Shadow Strategy:** Flat — `shadow-sm` plus a 1px `slate-line` border. See Elevation.
- **Internal Padding:** 24px (`lg`), with a 24px (`gap-6`) internal stack rhythm.
- **Rule:** Never nest a card inside a card. Never add a colored left-stripe accent.

### Inputs / Fields
- **Style:** 1px `slate-line` border, transparent/white background, 6px radius, 36px tall, `4px 12px` padding.
- **Focus:** Border shifts to `ring` and a 3px `ring-ring/50` glow appears; transition on color + box-shadow only.
- **Error / Disabled:** Invalid shows a `destructive` ring + border; disabled drops to 50% opacity, no pointer events. Placeholder text must clear 4.5:1 contrast.

### Navigation (signature)
- **Desktop:** Neumorphic pills (`rounded-full`, DM Sans 500). Raised offset shadows at rest; active pill is inset/pressed with `pacific-blue` text on a `slate-100` ground. The one sanctioned tactile surface in the system.
- **Hover/Active:** Hover deepens the raised shadow; active uses the pressed inset vocabulary.
- **Mobile:** Neumorphic hamburger opens a frosted **glass panel** (`bg-white/80 backdrop-blur-xl`, `border-l`) sliding from the right with a 300ms ease-out transform and a dimmed `bg-black/30 backdrop-blur-sm` scrim.

## 6. Do's and Don'ts

### Do:
- **Do** keep content surfaces flat — 1px `slate-line` borders, `shadow-sm` at most. Depth comes from tonal layering (white on `slate-mist`), not heavy shadows.
- **Do** let `pacific-blue` carry chrome and reserve `mangrove-green` / `sediment-amber` strictly for proven outcomes and data (the Earned-Green Rule).
- **Do** front-load proof: real project photography, measured numbers in IBM Plex Mono, and named partners in the first scroll.
- **Do** keep one Display headline and one primary action per fold; commit the hierarchy.
- **Do** confine neumorphism and glass to navigation only.
- **Do** verify ≥4.5:1 body contrast and ≥3:1 large-text contrast in both light and dark; never rely on chart color alone — add labels or patterns.

### Don't:
- **Don't** ship **generic templated corporate** layouts — interchangeable stock-corporate blocks with no point of view.
- **Don't** drift into **greenwashed eco-cliché**: no leaf logos, hands-holding-soil stock, generic greenery, or "sustainability" copy without a number behind it.
- **Don't** go **SaaS / startup-y**: no gradient hero-metric template, no purple gradients, no dev-tool aesthetic, no `background-clip: text` gradient headings.
- **Don't** read as **govt-bureaucratic dull**: dense gray walls of text are a failure even when "credible."
- **Don't** let blue-and-slate carry a screen alone (the generic-tech-corporate trap) — if a comp reads only as a blue SaaS page, the renewal half is missing.
- **Don't** use neumorphic or glass treatments on cards, forms, or content sections.
- **Don't** use IBM Plex Mono for body copy or headlines, or use a colored `border-left` stripe as an accent.
