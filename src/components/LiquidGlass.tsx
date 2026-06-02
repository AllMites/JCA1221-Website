import {
  useRef,
  useEffect,
  useState,
  createElement,
  type RefObject,
  type ReactNode,
  type ElementType,
} from 'react'

import type { LiquidGLRenderer } from '@/types/liquidGL'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LiquidGlassOptions {
  /** Refraction intensity. Default: 0.01 */
  refraction?: number
  /** Bevel edge depth. Default: 0.05 */
  bevelDepth?: number
  /** Bevel edge width. Default: 0.12 */
  bevelWidth?: number
  /** Frosted privacy blur. Default: 0 */
  frost?: number
  /** Dynamic drop shadow. Default: false */
  shadow?: boolean
  /** Specular light sweeps. Default: true */
  specular?: boolean
  /** 3D tilt on cursor. Default: false */
  tilt?: boolean
  /** Tilt sensitivity. Default: 5 */
  tiltFactor?: number
  /** Magnification. Default: 1 */
  magnify?: number
  /** CSS fallback background (e.g. 'rgba(255,255,255,0.07)'). Default auto */
  fallbackBg?: string
  /** When true, skip WebGL glass entirely — CSS fallback only. */
  skip?: boolean
}

const DEFAULT_OPTIONS: LiquidGlassOptions = {
  refraction: 0.01,
  bevelDepth: 0.05,
  bevelWidth: 0.12,
  frost: 0,
  shadow: false,
  specular: true,
  tilt: false,
  tiltFactor: 5,
  magnify: 1,
}

// ─── Renderer helpers ────────────────────────────────────────────────────────

let _scrollSyncOn = false

/**
 * Bridges the compositor-to-WebGL gap that causes liquidGL overlays to visibly
 * lag behind CSS content during scroll.
 *
 * Root cause: browser compositor shifts CSS content instantly on the GPU thread,
 * but the WebGL canvas (position:fixed) must re-render via JS → GL commands →
 * buffer swap — introducing 1-2 frames of latency where the glass overlay
 * appears at the pre-scroll position.
 *
 * Fix: synchronously translate the canvas by -scrollDelta on each scroll tick
 * (CSS transform is composited instantly), then on rAF update metrics, render
 * at correct positions, and clear the transform. This eliminates the perceived
 * lag without changing the WebGL pipeline.
 */
function ensureScrollSync() {
  if (_scrollSyncOn || typeof window === 'undefined') return
  _scrollSyncOn = true

  let lastScrollY = window.scrollY
  let ticking = false
  let pendingTransform = ''

  window.addEventListener(
    'scroll',
    () => {
      // Always track scroll delta — even if renderer isn't ready yet —
      // to avoid a huge accumulated delta on the first successful event.
      const delta = window.scrollY - lastScrollY
      lastScrollY = window.scrollY

      const r = getRenderer()
      if (!r || !r.lenses.length) return

      if (delta !== 0) {
        // Ensure the compensation transform is instant (no transition).
        // A previous rAF may have set a transition for the post-render
        // handoff clean-up; we must clear it so the scroll sync transform
        // jumps, not animates.
        r.canvas.style.transition = ''

        // Update metrics synchronously — getBoundingClientRect() correctly
        // reflects the current scroll position in the same event loop tick.
        for (const lens of r.lenses) lens.updateMetrics()

        // Accumulate total pending transform so rapid scroll ticks stack
        const current = parseFloat(pendingTransform || '0') || 0
        pendingTransform = String(current - delta)
        r.canvas.style.transform = `translateY(${pendingTransform}px)`
      }

      if (ticking) return
      ticking = true

      requestAnimationFrame(() => {
        // Re-render at the correct positions (metrics already updated above)
        if (r && r.lenses.length) {
          r.render()
        }
        // Clear the compensation transform — the fresh render is at the
        // correct position. Use a short transition for smooth handoff.
        if (r) {
          r.canvas.style.transition = 'transform 50ms linear'
          r.canvas.style.transform = ''
          pendingTransform = ''
          // Remove transition after it completes so subsequent sync transforms
          // stay instant.
          const cleanup = () => {
            r.canvas.style.transition = ''
            r.canvas.removeEventListener('transitionend', cleanup)
          }
          r.canvas.addEventListener('transitionend', cleanup, { once: true })
        }
        ticking = false
      })
    },
    { passive: true },
  )
}

function getRenderer() {
  return window.__liquidGLRenderer__ ?? null
}

function ensureRenderer(snapshot = 'body', resolution = 2.0) {
  if (typeof window === 'undefined') return null
  if (typeof window.liquidGL === 'undefined') return null
  if (window.__liquidGLRenderer__) {
    // Ensure rAF loop is running (may have been skipped on initial bootstrap)
    const r = window.__liquidGLRenderer__
    if (!r._rafId && !r.useExternalTicker) {
      const loop = () => {
        r.render()
        r._rafId = requestAnimationFrame(loop)
      }
      r._rafId = requestAnimationFrame(loop)
    }
    ensureScrollSync()
    return r
  }

  // Bootstrap renderer. Uses dummy target so liquidGL() doesn't early-return.
  // liquidGL constructor now sets _snapshotResolution BEFORE captureSnapshot()
  // (patched in our local copy — upstream has them reversed).
  window.liquidGL({
    target: '[data-liquid-init]',
    snapshot,
    resolution,
    refraction: 0,
    bevelDepth: 0,
    bevelWidth: 0,
    frost: 0,
    shadow: false,
    specular: false,
    reveal: 'none',
  })

  // TS narrows window.__liquidGLRenderer__ to falsy from the guard at top of
  // ensureRenderer. liquidGL() call above sets it — cast to break stale narrow.
  const renderer = window.__liquidGLRenderer__ as LiquidGLRenderer | undefined
  if (renderer) {
    if (!renderer._rafId && !renderer.useExternalTicker) {
      const loop = () => {
        renderer.render()
        renderer._rafId = requestAnimationFrame(loop)
      }
      renderer._rafId = requestAnimationFrame(loop)
    }
    ensureScrollSync()
  }
  return renderer ?? null
}

function removeLensFromRenderer(lens: import('@/types/liquidGL').LiquidGLLens | null) {
  if (!lens) return
  const r = getRenderer()
  if (!r) return
  const idx = r.lenses.indexOf(lens)
  if (idx > -1) r.lenses.splice(idx, 1)
}

// ─── Hook: useLiquidGlass ────────────────────────────────────────────────────

let _idCounter = 0

/**
 * Apply liquidGL glass effect to an existing element via ref.
 * No extra DOM nesting — element gets the lens directly.
 *
 * IMPORTANT: The element MUST have a child with `pointer-events: auto`
 * to remain interactive, since liquidGL sets pointer-events: none on the target.
 * Wrap interactive children in `<div style={{ pointerEvents: 'auto' }}>`.
 */
export function useLiquidGlass(
  ref: RefObject<HTMLElement | null>,
  options: LiquidGlassOptions = {},
) {
  const lensRef = useRef<import('@/types/liquidGL').LiquidGLLens | null>(null)
  const optsRef = useRef(options)
  optsRef.current = options
  const [ready, setReady] = useState(false)
  const initAttempted = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || initAttempted.current) return
    initAttempted.current = true

    // Skip WebGL glass — just set CSS fallback directly
    if (options.skip) {
      el.style.background = options.fallbackBg ?? 'rgba(255,255,255,0.07)'
      el.style.backdropFilter = 'blur(12px)'
      ;(el.style as any).webkitBackdropFilter = el.style.backdropFilter
      setReady(true)
      return
    }

    // Ensure element has a unique id for the lens target selector
    if (!el.hasAttribute('data-liquid-id')) {
      el.setAttribute('data-liquid-id', `lg-${++_idCounter}`)
    }
    const id = el.getAttribute('data-liquid-id')!

    // Ensure non-static positioning
    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative'
    }
    // Strip background — library sets transparent
    el.style.backgroundColor = 'transparent'

    const tryInit = (retries: number) => {
      // Make sure renderer exists
      const renderer = ensureRenderer()
      if (!renderer) {
        if (retries > 0) {
          requestAnimationFrame(() => tryInit(retries - 1))
          return
        }
        // CSS fallback
        const opts = optsRef.current
        const bg = opts.fallbackBg ?? 'rgba(255,255,255,0.07)'
        el.style.background = bg
        el.style.backdropFilter = `blur(${8 + (opts.frost ?? 0) * 20}px)`
        ;(el.style as any).webkitBackdropFilter = el.style.backdropFilter
        setReady(true)
        return
      }

      const opts = optsRef.current
      const merged = { ...DEFAULT_OPTIONS, ...opts }
      lensRef.current = renderer.addLens(el, {
        target: `[data-liquid-id="${id}"]`,
        refraction: merged.refraction,
        bevelDepth: merged.bevelDepth,
        bevelWidth: merged.bevelWidth,
        frost: merged.frost,
        shadow: merged.shadow,
        specular: merged.specular,
        tilt: merged.tilt,
        tiltFactor: merged.tiltFactor,
        magnify: merged.magnify,
        reveal: 'fade',
      })
      renderer.render()
      setReady(true)
    }
    tryInit(8)

    return () => {
      removeLensFromRenderer(lensRef.current)
      lensRef.current = null
      initAttempted.current = false // Reset for StrictMode remount
      // Restore element styles mutated by liquidGL constructor or skip mode.
      if (el) {
        el.style.opacity = ''
        el.style.position = ''
        el.style.backgroundColor = ''
        el.style.backdropFilter = ''
        ;(el.style as any).webkitBackdropFilter = ''
        el.style.backgroundImage = ''
        el.style.background = ''
        el.style.transition = ''
        el.style.pointerEvents = ''
      }
    }
  }, [ref])

  // Sync option changes to existing lens (doesn't recreate)
  useEffect(() => {
    const lens = lensRef.current
    if (!lens) return
    const opts = { ...DEFAULT_OPTIONS, ...options }
    // Mutate options the lens reads in _renderLens
    Object.assign(lens.options, {
      refraction: opts.refraction,
      bevelDepth: opts.bevelDepth,
      bevelWidth: opts.bevelWidth,
      frost: opts.frost,
      specular: opts.specular,
      tilt: opts.tilt,
      tiltFactor: opts.tiltFactor,
      magnify: opts.magnify,
    })
    // Shadow toggle requires explicit method call
    lens.setShadow(Boolean(opts.shadow))
    // Force re-render
    lens.renderer?.render()
  }, [
    options.refraction,
    options.bevelDepth,
    options.bevelWidth,
    options.frost,
    options.shadow,
    options.specular,
    options.tilt,
    options.tiltFactor,
    options.magnify,
  ])

  return { ready }
}

// ─── Component: LiquidGlass (for greenfield use) ─────────────────────────────

export interface LiquidGlassProps extends LiquidGlassOptions {
  children: ReactNode
  /** HTML element to render. Default: 'div' */
  as?: ElementType
  /** CSS classes on outer glass wrapper */
  className?: string
  /** CSS classes on inner content wrapper */
  contentClassName?: string
}

/**
 * LiquidGlass wrapper component. Renders outer glass pane + inner
 * content layer with pointer-events restored.
 *
 * For attaching to existing DOM elements, use `useLiquidGlass(ref)` instead.
 */
export function LiquidGlass({
  children,
  as: Tag = 'div',
  refraction,
  bevelDepth,
  bevelWidth,
  frost,
  shadow,
  specular,
  tilt,
  tiltFactor,
  magnify,
  fallbackBg,
  className = '',
  contentClassName = '',
}: LiquidGlassProps) {
  const ref = useRef<HTMLElement | null>(null)
  const { ready } = useLiquidGlass(ref, {
    refraction,
    bevelDepth,
    bevelWidth,
    frost,
    shadow,
    specular,
    tilt,
    tiltFactor,
    magnify,
    fallbackBg,
  })

  return createElement(
    Tag,
    { ref, className, 'data-liquid-ready': ready || undefined },
    <div
      className={contentClassName}
      style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1 }}
    >
      {children}
    </div>,
  )
}

// ─── Global init ─────────────────────────────────────────────────────────────

/**
 * Boot liquidGL. Safe to call multiple times — idempotent.
 * Must be called after DOM is ready and liquidGL script has loaded.
 */
export function initLiquidGL(snapshot = 'body', resolution = 2.0) {
  return ensureRenderer(snapshot, resolution)
}

// Re-export for convenience
export { type LiquidGlassOptions as UseLiquidGlassOptions }
