/**
 * TypeScript declarations for liquidGL
 * Source: https://github.com/naughtyduk/liquidGL (MIT)
 */

interface LiquidGLRenderer {
  canvas: HTMLCanvasElement
  lenses: LiquidGLLens[]
  addLens(element: Element, options: LiquidGLOptions): LiquidGLLens
  captureSnapshot(): Promise<void>
  addDynamicElement(elements: Element | Element[] | NodeList): void
  render(): void
  _rafId: number | null
  _capturing: boolean
  useExternalTicker: boolean
}

interface LiquidGLLens {
  el: Element
  options: LiquidGLOptions
  renderer: LiquidGLRenderer
  rectPx: {
    left: number
    top: number
    width: number
    height: number
  } | null
  tiltX: number
  tiltY: number
  updateMetrics(): void
  setShadow(enabled: boolean): void
  _reveal(): void
}

interface LiquidGLOptions {
  /** CSS selector for glassified element(s) */
  target: string
  /** Element selector to use as refraction snapshot */
  snapshot?: string
  /** Snapshot pixel ratio (default: 2.0) */
  resolution?: number
  /** Refraction intensity (default: 0.01) */
  refraction?: number
  /** Bevel edge depth (default: 0.08) */
  bevelDepth?: number
  /** Bevel edge width (default: 0.15) */
  bevelWidth?: number
  /** Frost/blur intensity (default: 0) */
  frost?: number
  /** Dynamic drop shadow (default: true) */
  shadow?: boolean
  /** Specular light sweeps (default: true) */
  specular?: boolean
  /** Reveal animation: "fade" | "none" (default: "fade") */
  reveal?: 'fade' | 'none'
  /** 3D tilt on cursor (default: false) */
  tilt?: boolean
  /** Tilt sensitivity (default: 5) */
  tiltFactor?: number
  /** Magnification level (default: 1) */
  magnify?: number
  /** Callbacks */
  on?: {
    init?(instance: LiquidGLLens): void
  }
}

interface LiquidGLAPI {
  (options: LiquidGLOptions): LiquidGLLens | LiquidGLLens[] | undefined
  registerDynamic(elements: Element | Element[] | NodeList): void
  syncWith(config?: {
    lenis?: unknown
    locomotiveScroll?: unknown
    gsap?: boolean
  }): { lenis?: unknown; locomotiveScroll?: unknown }
}

declare global {
  interface Window {
    liquidGL: LiquidGLAPI
    __liquidGLRenderer__?: LiquidGLRenderer
    __liquidGLNoWebGL__?: boolean
  }
}

export type { LiquidGLLens, LiquidGLRenderer, LiquidGLOptions, LiquidGLAPI }
