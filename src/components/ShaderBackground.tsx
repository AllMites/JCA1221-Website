import { useRef, useEffect, useState } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

export type ShaderVariant = 'slate' | 'blue' | 'emerald' | 'amber' | 'light' | 'dark'

export interface ShaderBackgroundProps {
  variant: ShaderVariant
  /** Opacity of the shader overlay. Default 1. */
  opacity?: number
  /** Future: URL for a background image. When set, renders <img> instead of canvas. */
  backgroundImage?: string
  className?: string
  /** Enable animation loop. Pauses when section is off-screen. Default false. */
  animated?: boolean
}

// ─── Seeded PRNG ─────────────────────────────────────────────────────────────

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ─── Drawing helpers ─────────────────────────────────────────────────────────

function fillBg(ctx: CanvasRenderingContext2D, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(0, 0, w, h)
}

/** Draw faint grid lines */
function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, cellSize: number, color: string) {
  ctx.strokeStyle = color
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = cellSize; x < w; x += cellSize) {
    ctx.moveTo(x + 0.5, 0)
    ctx.lineTo(x + 0.5, h)
  }
  for (let y = cellSize; y < h; y += cellSize) {
    ctx.moveTo(0, y + 0.5)
    ctx.lineTo(w, y + 0.5)
  }
  ctx.stroke()
}

/** Draw per-pixel noise at reduced resolution for grain texture */
function drawGrain(ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number, rng: () => number) {
  const step = 3 // draw at 1/3 resolution
  const iw = Math.ceil(w / step)
  const ih = Math.ceil(h / step)
  const imageData = ctx.createImageData(iw, ih)
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.floor(rng() * intensity)
    data[i] = v     // R
    data[i + 1] = v // G
    data[i + 2] = v // B
    data[i + 3] = 255
  }
  // Draw to offscreen, then scale up
  const offscreen = new OffscreenCanvas(iw, ih)
  const offCtx = offscreen.getContext('2d')!
  offCtx.putImageData(imageData, 0, 0)
  ctx.drawImage(offscreen, 0, 0, w, h)
}

/** Draw soft orbs (radial gradient circles) */
function drawOrb(ctx: CanvasRenderingContext2D, cx: number, cy: number, radius: number, color: string) {
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius)
  gradient.addColorStop(0, color)
  gradient.addColorStop(1, 'transparent')
  ctx.fillStyle = gradient
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2)
}

/** Draw horizontal wavy strata lines */
function drawStrata(ctx: CanvasRenderingContext2D, w: number, h: number, rng: () => number) {
  const layerCount = 12
  ctx.lineWidth = 1
  for (let i = 0; i < layerCount; i++) {
    const y = (h / layerCount) * i + rng() * 20 - 10
    ctx.strokeStyle = `rgba(180,130,80,${0.03 + rng() * 0.04})`
    ctx.beginPath()
    ctx.moveTo(0, y)
    for (let x = 0; x < w; x += 20) {
      const offset = Math.sin(x * 0.008 + i * 1.7 + rng() * 4) * 12 + rng() * 6 - 3
      ctx.lineTo(x, y + offset)
    }
    ctx.stroke()
  }
}

/** Draw cellular/voronoi-like pattern using gradient circles */
function drawCellular(ctx: CanvasRenderingContext2D, w: number, h: number, rng: () => number) {
  const cellCount = 30
  const cells: Array<{ x: number; y: number; r: number }> = []
  for (let i = 0; i < cellCount; i++) {
    cells.push({
      x: rng() * w,
      y: rng() * h,
      r: 40 + rng() * 200,
    })
  }
  for (const cell of cells) {
    const gradient = ctx.createRadialGradient(cell.x, cell.y, 0, cell.x, cell.y, cell.r)
    gradient.addColorStop(0, `rgba(16,185,129,${0.04 + rng() * 0.03})`)
    gradient.addColorStop(0.7, `rgba(16,185,129,${0.01 + rng() * 0.02})`)
    gradient.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient
    ctx.fillRect(cell.x - cell.r, cell.y - cell.r, cell.r * 2, cell.r * 2)
  }
}

// ─── Animation time offset for wave variants ─────────────────────────────────

let globalTime = 0
let timeInitialized = false
function initGlobalTime() {
  if (timeInitialized) return
  timeInitialized = true
  const tick = () => {
    globalTime += 1 / 60
    requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

// ─── Per-variant draw functions ──────────────────────────────────────────────

function drawSlate(ctx: CanvasRenderingContext2D, w: number, h: number, _time: number) {
  const rng = mulberry32(42)
  fillBg(ctx, w, h, 'transparent')
  drawGrid(ctx, w, h, 80, 'rgba(100,116,139,0.06)')
  drawGrain(ctx, w, h, 20, rng)
}

function drawDark(ctx: CanvasRenderingContext2D, w: number, h: number, _time: number) {
  const rng = mulberry32(99)
  fillBg(ctx, w, h, 'transparent')
  drawGrid(ctx, w, h, 100, 'rgba(255,255,255,0.03)')
  drawGrain(ctx, w, h, 25, rng)
}

function drawBlue(ctx: CanvasRenderingContext2D, w: number, h: number, time: number) {
  const rng = mulberry32(7)
  fillBg(ctx, w, h, 'transparent')

  // Flowing water orbs — positions shift with time
  const shift1 = Math.sin(time * 0.3) * 30
  const shift2 = Math.cos(time * 0.4) * 25
  const shift3 = Math.sin(time * 0.5 + 1) * 20

  drawOrb(ctx, w * 0.3 + shift1, h * 0.4, w * 0.5, 'rgba(59,130,246,0.08)')
  drawOrb(ctx, w * 0.7 + shift2, h * 0.6, w * 0.4, 'rgba(6,182,212,0.06)')
  drawOrb(ctx, w * 0.5 + shift3, h * 0.3, w * 0.35, 'rgba(59,130,246,0.05)')

  // Subtle wave lines
  ctx.lineWidth = 1
  for (let i = 0; i < 8; i++) {
    const baseY = (h / 9) * (i + 1)
    const phase = time * 0.2 + i * 0.8
    ctx.strokeStyle = `rgba(59,130,246,${0.03 + i * 0.005})`
    ctx.beginPath()
    ctx.moveTo(0, baseY)
    for (let x = 0; x <= w; x += 4) {
      const y = baseY + Math.sin(x * 0.003 + phase) * 15 + Math.sin(x * 0.007 + phase * 1.3) * 8
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  drawGrain(ctx, w, h, 12, rng)
}

function drawEmerald(ctx: CanvasRenderingContext2D, w: number, h: number, _time: number) {
  const rng = mulberry32(23)
  fillBg(ctx, w, h, 'transparent')
  drawCellular(ctx, w, h, rng)

  // Subtle vein lines
  ctx.lineWidth = 0.5
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = `rgba(16,185,129,${0.02 + rng() * 0.03})`
    ctx.beginPath()
    const startX = rng() * w
    ctx.moveTo(startX, 0)
    ctx.bezierCurveTo(
      startX + rng() * 200 - 100, h * 0.3,
      startX + rng() * 200 - 100, h * 0.7,
      rng() * w, h
    )
    ctx.stroke()
  }

  drawGrain(ctx, w, h, 10, rng)
}

function drawAmber(ctx: CanvasRenderingContext2D, w: number, h: number, _time: number) {
  const rng = mulberry32(77)
  fillBg(ctx, w, h, 'transparent')
  drawStrata(ctx, w, h, rng)

  // Warm orbs for depth
  drawOrb(ctx, w * 0.2, h * 0.3, w * 0.4, 'rgba(245,158,11,0.04)')
  drawOrb(ctx, w * 0.8, h * 0.7, w * 0.5, 'rgba(245,158,11,0.03)')

  drawGrain(ctx, w, h, 15, rng)
}

function drawLight(ctx: CanvasRenderingContext2D, w: number, h: number, _time: number) {
  const rng = mulberry32(11)
  fillBg(ctx, w, h, 'transparent')

  // Very subtle paper fiber texture — horizontal streaks
  ctx.lineWidth = 0.5
  for (let y = 0; y < h; y += 4) {
    const streak = rng()
    if (streak > 0.92) {
      ctx.strokeStyle = `rgba(0,0,0,${(streak - 0.92) * 0.15})`
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y + rng() * 2 - 1)
      ctx.stroke()
    }
  }

  drawGrain(ctx, w, h, 8, rng)
}

// ─── Variant dispatch ────────────────────────────────────────────────────────

const DRAW_FN: Record<ShaderVariant, (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void> = {
  slate: drawSlate,
  dark: drawDark,
  blue: drawBlue,
  emerald: drawEmerald,
  amber: drawAmber,
  light: drawLight,
}

/** Variants that use animation time */
const ANIMATED_VARIANTS: Set<ShaderVariant> = new Set(['blue'])

// ─── Component ───────────────────────────────────────────────────────────────

export function ShaderBackground({
  variant,
  opacity = 1,
  backgroundImage,
  className,
  animated: animatedProp,
}: ShaderBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animFrameRef = useRef(0)
  const [isVisible, setIsVisible] = useState(true)

  // Determine if this variant animates
  const isAnimated = animatedProp ?? ANIMATED_VARIANTS.has(variant)

  // IntersectionObserver — pause animation when off-screen
  useEffect(() => {
    if (!isAnimated) return
    const el = containerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [isAnimated])

  // ResizeObserver + canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let animating = true

    const draw = (_time: number) => {
      if (!animating) return
      const rect = container.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) {
        animFrameRef.current = requestAnimationFrame(draw)
        return
      }

      const w = rect.width
      const h = rect.height
      const cw = Math.floor(w * dpr)
      const ch = Math.floor(h * dpr)

      if (canvas.width !== cw || canvas.height !== ch) {
        canvas.width = cw
        canvas.height = ch
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // Use global time for consistency across all animated instances
      const t = isAnimated && isVisible ? globalTime : 0
      DRAW_FN[variant](ctx, w, h, t)

      if (isAnimated && isVisible) {
        animFrameRef.current = requestAnimationFrame(draw)
      }
    }

    // Kick off global time loop if needed
    initGlobalTime()

    // Handle resize
    const ro = new ResizeObserver(() => {
      // Redraw on next frame
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = requestAnimationFrame(draw)
    })
    ro.observe(container)

    // Initial draw
    animFrameRef.current = requestAnimationFrame(draw)

    return () => {
      animating = false
      ro.disconnect()
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [variant, isAnimated, isVisible])

  // SSR guard
  if (typeof window === 'undefined') return null

  // Background image mode
  if (backgroundImage) {
    return (
      <div
        ref={containerRef}
        className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className ?? ''}`}
        style={{ opacity }}
        aria-hidden="true"
      >
        <img
          src={backgroundImage}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    )
  }

  // Canvas shader mode
  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className ?? ''}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  )
}
