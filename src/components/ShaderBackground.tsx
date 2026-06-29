import { useRef, useEffect, useState } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

export type ShaderVariant = 'slate' | 'blue' | 'emerald' | 'amber' | 'light' | 'dark' | 'dots' | 'leaves' | 'ripples' | 'currents' | 'bubbles'

export interface ShaderBackgroundProps {
  variant: ShaderVariant
  /** Hex or rgba background color the shader sits on. Used to tint grain. */
  bgColor?: string
  opacity?: number
  backgroundImage?: string
  className?: string
  animated?: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type RGB = [number, number, number]

interface MouseState {
  x: number
  y: number
  vx: number
  vy: number
}

function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, cell: number, color: string) {
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = cell; x < w; x += cell) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h) }
  for (let y = cell; y < h; y += cell) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5) }
  ctx.stroke()
}

function drawOrb(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
  g.addColorStop(0, color)
  g.addColorStop(1, 'transparent')
  ctx.fillStyle = g
  ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
}

// ─── Grain — tinted by bgColor, no blending tricks ───────────────────────────

function applyGrain(ctx: CanvasRenderingContext2D, w: number, h: number, dev: number, rng: () => number, rgb: RGB) {
  const off = new OffscreenCanvas(w, h)
  const oc = off.getContext('2d')!
  const img = oc.createImageData(w, h)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = Math.floor((rng() - 0.5) * dev * 2)
    d[i]     = Math.min(255, Math.max(0, rgb[0] + n))
    d[i + 1] = Math.min(255, Math.max(0, rgb[1] + n))
    d[i + 2] = Math.min(255, Math.max(0, rgb[2] + n))
    d[i + 3] = 255
  }
  oc.putImageData(img, 0, 0)
  ctx.globalAlpha = 0.06
  ctx.drawImage(off, 0, 0)
  ctx.globalAlpha = 1
}

// ─── Noise helper (spatial, deterministic) ───────────────────────────────────

/** Returns 0–1 noise value that's consistent for a given grid coordinate + seed. */
function spatialNoise(gx: number, gy: number, seed: number): number {
  const s = ((gx * 374761393 + gy * 668265263 + seed) & 0x7fffffff) >>> 0
  return mulberry32(s)()
}

// ─── Global time ─────────────────────────────────────────────────────────────

let globalTime = 0
let timeOn = false

function ensureTime() {
  if (timeOn) return
  timeOn = true
  const tick = () => { globalTime += 1 / 60; requestAnimationFrame(tick) }
  requestAnimationFrame(tick)
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════

function drawSlate(ctx: CanvasRenderingContext2D, w: number, h: number, _t: number, rgb: RGB, _mouse: MouseState | null) {
  const rng = mulberry32(42)
  drawGrid(ctx, w, h, 80, 'rgba(148,163,184,0.10)')
  drawGrid(ctx, w, h, 240, 'rgba(148,163,184,0.05)')

  // Highlight random grid cells
  const cellRng = mulberry32(421)
  const CELL = 80
  for (let cx = 0; cx < w; cx += CELL) {
    for (let cy = 0; cy < h; cy += CELL) {
      const roll = cellRng()
      if (roll > 0.88) {
        const alpha = (roll - 0.88) / 0.12 * 0.04
        ctx.fillStyle = `rgba(148,163,184,${alpha.toFixed(3)})`
        ctx.fillRect(cx, cy, CELL, CELL)
      }
    }
  }

  applyGrain(ctx, w, h, 8, rng, rgb)
}

function drawDark(ctx: CanvasRenderingContext2D, w: number, h: number, _t: number, rgb: RGB, _mouse: MouseState | null) {
  const rng = mulberry32(99)
  drawGrid(ctx, w, h, 120, 'rgba(180,170,160,0.07)')

  // Highlight random cells
  const cellRng = mulberry32(991)
  for (let cx = 0; cx < w; cx += 120) {
    for (let cy = 0; cy < h; cy += 120) {
      const roll = cellRng()
      if (roll > 0.90) {
        ctx.fillStyle = `rgba(180,170,160,${((roll - 0.90) / 0.10 * 0.03).toFixed(3)})`
        ctx.fillRect(cx, cy, 120, 120)
      }
    }
  }

  applyGrain(ctx, w, h, 12, rng, rgb)
}

function drawBlue(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, rgb: RGB, _mouse: MouseState | null) {
  const rng = mulberry32(7)

  drawOrb(ctx, w * 0.28 + Math.sin(t * 0.28) * 50, h * 0.38 + Math.cos(t * 0.23) * 30, w * 0.6, 'rgba(0,0,0,0.20)')
  drawOrb(ctx, w * 0.72 + Math.cos(t * 0.33) * 45, h * 0.55 + Math.sin(t * 0.28) * 30, w * 0.5, 'rgba(6,182,212,0.16)')
  drawOrb(ctx, w * 0.52 + Math.sin(t * 0.38) * 35, h * 0.28 + Math.cos(t * 0.42) * 20, w * 0.45, 'rgba(0,0,0,0.10)')

  for (let i = 0; i < 12; i++) {
    const y0 = (h / 13) * (i + 1)
    const ph = t * 0.22 + i * 0.65
    ctx.lineWidth = 1 + (i % 3 === 0 ? 0.5 : 0)
    ctx.strokeStyle = `rgba(0,0,0,${0.07 + i * 0.005})`
    ctx.beginPath()
    ctx.moveTo(0, y0)
    for (let x = 0; x <= w; x += 3) ctx.lineTo(x, y0 + Math.sin(x * 0.0018 + ph) * 22 + Math.sin(x * 0.0045 + ph * 1.6) * 12)
    ctx.stroke()
  }
  for (let i = 0; i < 7; i++) {
    const y0 = (h / 8) * (i + 0.5)
    const ph = t * 0.32 + i * 1.1
    ctx.lineWidth = 0.5
    ctx.strokeStyle = `rgba(34,211,238,${0.05 + i * 0.005})`
    ctx.beginPath()
    ctx.moveTo(0, y0)
    for (let x = 0; x <= w; x += 2) ctx.lineTo(x, y0 + Math.sin(x * 0.0025 + ph) * 14 + Math.cos(x * 0.0055 + ph * 0.75) * 7)
    ctx.stroke()
  }

  applyGrain(ctx, w, h, 10, rng, rgb)
}

function drawEmerald(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, rgb: RGB, _mouse: MouseState | null) {
  const rng = mulberry32(23)
  const N = 22
  for (let i = 0; i < N; i++) {
    const s = mulberry32(100 + i)()
    const cx = ((s * w + Math.sin(t * 0.28 + i * 1.8) * w * 0.10) + w) % w
    const cy = ((s * h + Math.cos(t * 0.22 + i * 2.2) * h * 0.10) + h) % h
    const r = 55 + mulberry32(300 + i)() * 170
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    g.addColorStop(0, `rgba(16,185,129,${0.12 + mulberry32(400 + i)() * 0.07})`)
    g.addColorStop(0.55, `rgba(16,185,129,${0.03 + mulberry32(500 + i)() * 0.04})`)
    g.addColorStop(1, 'transparent')
    ctx.fillStyle = g
    ctx.fillRect(cx - r, cy - r, r * 2, r * 2)
  }
  ctx.lineWidth = 0.6
  for (let i = 0; i < 7; i++) {
    const s = mulberry32(200 + i)()
    const sx = ((s * w + Math.sin(t * 0.18 + i) * w * 0.12) + w) % w
    const ex = ((s * w + Math.cos(t * 0.16 + i) * w * 0.12) + w) % w
    ctx.strokeStyle = `rgba(16,185,129,${0.07 + mulberry32(600 + i)() * 0.05})`
    ctx.beginPath()
    ctx.moveTo(sx, -15)
    ctx.bezierCurveTo(sx + 60 + s * 140, h * 0.3 + Math.sin(t * 0.14 + i) * 50,
      sx - 30 + s * 120, h * 0.65 + Math.cos(t * 0.19 + i) * 45, ex, h + 15)
    ctx.stroke()
  }
  applyGrain(ctx, w, h, 8, rng, rgb)
}

function drawAmber(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, rgb: RGB, _mouse: MouseState | null) {
  const rng = mulberry32(77)
  for (let i = 0; i < 18; i++) {
    const y0 = (h / 19) * (i + 1)
    const drift = Math.sin(t * 0.13 + i * 0.55) * 12
    ctx.lineWidth = 1 + (i % 4 === 0 ? 0.5 : 0)
    ctx.strokeStyle = `rgba(217,160,70,${0.09 + mulberry32(700 + i)() * 0.06})`
    ctx.beginPath()
    ctx.moveTo(0, y0 + drift)
    for (let x = 0; x <= w; x += 10) ctx.lineTo(x, y0 + drift + Math.sin(x * 0.0035 + i * 1.2 + t * 0.18) * 16 + mulberry32(800 + i)() * 5 - 2)
    ctx.stroke()
  }
  drawOrb(ctx, w * 0.22 + Math.sin(t * 0.18) * 35, h * 0.32 + Math.cos(t * 0.22) * 25, w * 0.5, 'rgba(245,158,11,0.10)')
  drawOrb(ctx, w * 0.78 + Math.cos(t * 0.26) * 30, h * 0.62 + Math.sin(t * 0.19) * 20, w * 0.48, 'rgba(251,191,36,0.08)')
  applyGrain(ctx, w, h, 10, rng, rgb)
}

function drawLight(ctx: CanvasRenderingContext2D, w: number, h: number, _t: number, rgb: RGB, _mouse: MouseState | null) {
  const rng = mulberry32(11)
  for (let y = 0; y < h; y += 3) {
    const roll = rng()
    if (roll > 0.93) {
      ctx.strokeStyle = `rgba(100,100,110,${(roll - 0.93) / 0.07 * 0.06})`
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y + rng() * 2 - 1)
      ctx.stroke()
    }
  }
  applyGrain(ctx, w, h, 6, rng, rgb)
}

// ─── Dots variant — noise-sized dot field, mouse distortion ──────────────────

function drawDots(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, rgb: RGB, mouse: MouseState | null) {
  const rng = mulberry32(13)
  const spacing = 55
  const baseRadius = 1.0
  const influenceRadius = 160
  const seed = 17

  for (let x = spacing / 2; x < w + spacing; x += spacing) {
    for (let y = spacing / 2; y < h + spacing; y += spacing) {
      const gx = Math.round(x / spacing)
      const gy = Math.round(y / spacing)

      // Noise-modulated radius
      const n = spatialNoise(gx, gy, seed)
      let r = baseRadius + n * 2.5

      // Slow drift
      let dx = x + Math.sin(t * 0.35 + gy * 0.6) * 1.5 + Math.cos(t * 0.28 + gx * 0.5) * 1.5
      let dy = y + Math.cos(t * 0.40 + gx * 0.55) * 1.5 + Math.sin(t * 0.32 + gy * 0.45) * 1.5

      // Mouse distortion
      if (mouse) {
        const dist = Math.hypot(dx - mouse.x, dy - mouse.y)
        const influence = Math.max(0, 1 - dist / influenceRadius)
        if (influence > 0) {
          const ease = influence * influence // quadratic falloff
          const angle = Math.atan2(dy - mouse.y, dx - mouse.x)
          const speed = Math.hypot(mouse.vx, mouse.vy) * 0.08
          const push = ease * 24 * (1 + speed)
          dx += Math.cos(angle) * push
          dy += Math.sin(angle) * push
          r += ease * 5
          r = Math.min(r, 10) // cap max radius
        }
      }

      // Skip if off-screen
      if (dx < -10 || dx > w + 10 || dy < -10 || dy > h + 10) continue

      // Draw dot
      ctx.beginPath()
      ctx.arc(dx, dy, r, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(148,163,184,0.15)'
      ctx.fill()
    }
  }

  applyGrain(ctx, w, h, 6, rng, rgb)
}

// ─── Leaves variant — voronoi + perlin, organic tissue / leaves ─────────────────

function drawLeaves(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, rgb: RGB, _mouse: MouseState | null) {
  const seed = 42
  const spacing = Math.max(60, Math.min(w, h) / 10)
  const cols = Math.floor(w / spacing) - 1
  const rows = Math.floor(h / spacing) - 1
  if (cols < 1 || rows < 1) return

  // Build drifted grid points
  const pts: Array<{x: number; y: number}> = []
  for (let gy = 0; gy <= rows + 1; gy++) {
    for (let gx = 0; gx <= cols + 1; gx++) {
      const bx = gx * spacing
      const by = gy * spacing
      const dx = Math.sin(t * 0.22 + gy * 0.5 + gx * 0.3) * spacing * 0.12
      const dy = Math.cos(t * 0.18 + gx * 0.6 + gy * 0.4) * spacing * 0.12
      pts.push({ x: bx + dx, y: by + dy })
    }
  }

  const rowLen = cols + 2

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      const idx = gy * rowLen + gx
      const p00 = pts[idx]; const p10 = pts[idx + 1]
      const p01 = pts[idx + rowLen]; const p11 = pts[idx + rowLen + 1]

      // Triangle 1: p00 -> p10 -> p01
      const cx1 = (p00.x + p10.x + p01.x) / 3
      const cy1 = (p00.y + p10.y + p01.y) / 3
      const n1 = spatialNoise(Math.floor(cx1 * 0.005 + t * 0.006), Math.floor(cy1 * 0.005 + t * 0.004), seed)
      const a1 = 0.02 + n1 * 0.14

      ctx.beginPath()
      ctx.moveTo(p00.x, p00.y); ctx.lineTo(p10.x, p10.y); ctx.lineTo(p01.x, p01.y); ctx.closePath()
      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a1.toFixed(3)})`
      ctx.fill()
      ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.03)`
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Triangle 2: p10 -> p11 -> p01
      const cx2 = (p10.x + p11.x + p01.x) / 3
      const cy2 = (p10.y + p11.y + p01.y) / 3
      const n2 = spatialNoise(Math.floor(cx2 * 0.005 + t * 0.006), Math.floor(cy2 * 0.005 + t * 0.004), seed + 1)
      const a2 = 0.02 + n2 * 0.14

      ctx.beginPath()
      ctx.moveTo(p10.x, p10.y); ctx.lineTo(p11.x, p11.y); ctx.lineTo(p01.x, p01.y); ctx.closePath()
      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a2.toFixed(3)})`
      ctx.fill()
      ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.025)`
      ctx.lineWidth = 0.5
      ctx.stroke()
    }
  }
}

// ─── Ripples variant — expanding concentric arcs ────────────────────────────────

function drawRipples(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, rgb: RGB, _mouse: MouseState | null) {
  const count = 4
  const cycle = 4 // seconds per full ripple cycle
  const maxRadius = Math.max(w, h) * 0.4

  for (let i = 0; i < count; i++) {
    const cx = spatialNoise(i * 3, 0, 100) * w
    const cy = spatialNoise(i * 3 + 1, 0, 200) * h
    const phase = spatialNoise(i * 3 + 2, 0, 300) * cycle

    const elapsed = ((t + cycle - phase) % cycle) / cycle // 0->1 over cycle
    if (elapsed > 0.85) continue // fade out last 15%

    const radius = elapsed * maxRadius
    const opacity = (1 - elapsed) * 0.6

    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${opacity.toFixed(3)})`
    ctx.lineWidth = 1
    ctx.stroke()

    // Second thinner ring
    ctx.beginPath()
    ctx.arc(cx, cy, radius * 0.85, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(opacity * 0.5).toFixed(3)})`
    ctx.lineWidth = 0.5
    ctx.stroke()
  }
}

// ─── Currents variant — flowing horizontal wave ribbons ─────────────────────────

function drawCurrents(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, rgb: RGB, _mouse: MouseState | null) {
  const lines = 8
  for (let i = 0; i < lines; i++) {
    const y0 = (h / (lines + 1)) * (i + 1)
    const phaseOffset = spatialNoise(i * 5, 0, 400) * Math.PI * 2
    const amplitude = 8 + spatialNoise(i * 5 + 1, 0, 500) * 14
    const freq = 0.0015 + spatialNoise(i * 5 + 2, 0, 600) * 0.001
    const speed = 0.15 + spatialNoise(i * 5 + 3, 0, 700) * 0.1
    const alpha = 0.04 + spatialNoise(i * 5 + 4, 0, 800) * 0.06

    ctx.beginPath()
    ctx.moveTo(0, y0)
    for (let x = 0; x <= w; x += 4) {
      const y = y0 + Math.sin(x * freq + t * speed + phaseOffset) * amplitude
      ctx.lineTo(x, y)
    }
    ctx.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha.toFixed(3)})`
    ctx.lineWidth = 1.2
    ctx.stroke()
  }
}

// ─── Bubbles variant — rising circles with wobble ───────────────────────────────

function drawBubbles(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, rgb: RGB, _mouse: MouseState | null) {
  const count = 25
  const speed = 0.3

  for (let i = 0; i < count; i++) {
    const seedX = 100 + i * 7
    const seedY = 200 + i * 7
    const seedS = 300 + i * 7
    const seedW = 400 + i * 7

    const baseX = spatialNoise(seedX, 0, 42) * w
    const baseY = (spatialNoise(seedY, 0, 42) * h + t * speed * h * 0.08) % (h + 20) - 10
    const wobble = Math.sin(t * 0.6 + i * 1.3) * 8 + Math.sin(t * 0.4 + i * 0.7) * 5
    const x = baseX + wobble
    const y = baseY
    const r = 1.5 + spatialNoise(seedS, 0, 42) * 3.5
    const alpha = 0.12 + spatialNoise(seedW, 0, 42) * 0.24

    if (x < -10 || x > w + 10 || y < -10 || y > h + 10) continue

    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha.toFixed(3)})`
    ctx.fill()

    // Highlight arc on larger bubbles
    if (r > 3) {
      ctx.beginPath()
      ctx.arc(x - r * 0.2, y - r * 0.2, r * 0.35, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255,255,255,${(alpha * 0.4).toFixed(3)})`
      ctx.fill()
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DISPATCH
// ═══════════════════════════════════════════════════════════════════════════════

type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, rgb: RGB, mouse: MouseState | null) => void

const DRAW: Record<ShaderVariant, DrawFn> = {
  slate: drawSlate, dark: drawDark, blue: drawBlue, emerald: drawEmerald,
  amber: drawAmber, light: drawLight, dots: drawDots,
  leaves: drawLeaves, ripples: drawRipples, currents: drawCurrents,
  bubbles: drawBubbles,
}

const ANIMATED: Set<ShaderVariant> = new Set(['blue', 'emerald', 'amber', 'dots', 'leaves', 'ripples', 'currents', 'bubbles'])

// ─── Default background colors per variant (when bgColor prop not provided) ───

const DEFAULT_BG: Record<ShaderVariant, RGB> = {
  slate:   [15, 23, 42],    // slate-900
  dark:    [2, 6, 23],      // slate-950
  blue:    [23, 37, 84],    // blue-950
  emerald: [6, 78, 59],     // emerald-950
  amber:   [69, 26, 3],     // amber-950
  light:   [248, 250, 252], // slate-50
  dots:    [15, 23, 42],    // slate-900
  leaves:  [6, 78, 59],     // emerald-950
  ripples: [30, 58, 95],    // blue-900
  currents:[15, 23, 42],    // slate-900
  bubbles: [23, 37, 84],    // blue-950
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ShaderBackground({
  variant,
  bgColor,
  opacity = 1,
  backgroundImage,
  className,
  animated: animatedProp,
}: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)
  const [visible, setVisible] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  // ─── Mouse tracking ──────────────────────────────────────────────────────
  const mouseRef = useRef<MouseState>({ x: -1000, y: -1000, vx: 0, vy: 0 })
  const prevMouseRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 })

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const isAnimated = (animatedProp ?? ANIMATED.has(variant)) && !prefersReducedMotion
  const tracksMouse = variant === 'dots'

  useEffect(() => {
    if (!isAnimated) return
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [isAnimated])

  // Mouse move handler
  useEffect(() => {
    if (!tracksMouse) return
    const el = containerRef.current
    if (!el) return

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const prev = prevMouseRef.current
      mouseRef.current = {
        x: mx,
        y: my,
        vx: mx - prev.x,
        vy: my - prev.y,
      }
      prevMouseRef.current = { x: mx, y: my }
    }

    const handleLeave = () => {
      mouseRef.current = { x: -1000, y: -1000, vx: 0, vy: 0 }
      prevMouseRef.current = { x: -1000, y: -1000 }
    }

    el.addEventListener('mousemove', handleMove, { passive: true })
    el.addEventListener('mouseleave', handleLeave)
    return () => {
      el.removeEventListener('mousemove', handleMove)
      el.removeEventListener('mouseleave', handleLeave)
    }
  }, [tracksMouse])

  // Resolve background RGB — from prop, or default for variant
  const rgb = bgColor ? hexToRgb(bgColor) : DEFAULT_BG[variant]

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let live = true

    const frame = (_ms: number) => {
      if (!live) return
      const r = container.getBoundingClientRect()
      if (r.width === 0 || r.height === 0) { rafRef.current = requestAnimationFrame(frame); return }
      const w = r.width, h = r.height
      const cw = Math.floor(w * dpr), ch = Math.floor(h * dpr)
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch }
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)
      const t = isAnimated && visible ? globalTime : 0
      const mouse = tracksMouse ? mouseRef.current : null
      DRAW[variant](ctx, w, h, t, rgb, mouse)
      if (isAnimated && visible) rafRef.current = requestAnimationFrame(frame)
    }

    ensureTime()
    const ro = new ResizeObserver(() => { cancelAnimationFrame(rafRef.current); rafRef.current = requestAnimationFrame(frame) })
    ro.observe(container)
    rafRef.current = requestAnimationFrame(frame)

    return () => { live = false; ro.disconnect(); cancelAnimationFrame(rafRef.current) }
  }, [variant, isAnimated, visible, tracksMouse, ...rgb])

  if (typeof window === 'undefined') return null

  if (backgroundImage) {
    return (
      <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className ?? ''}`} style={{ opacity }} aria-hidden="true">
        <img src={backgroundImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className ?? ''}`} style={{ opacity }} aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  )
}
