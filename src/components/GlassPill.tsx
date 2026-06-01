import { useRef, createElement, type ReactNode, type HTMLAttributes, type ElementType } from 'react'
import { useLiquidGlass, type LiquidGlassOptions } from '@/components/LiquidGlass'

// ─── Types ───────────────────────────────────────────────────────────────────

interface GlassPillProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  /** CSS classes applied to the outer glass element */
  className?: string
  /** HTML tag for outer element. Default: 'span' */
  as?: ElementType
  /** Override default glass options for pills */
  options?: LiquidGlassOptions
}

// ─── Default glass options for small pills / badges ──────────────────────────

const PILL_DEFAULTS: LiquidGlassOptions = {
  refraction: 0.008,
  bevelDepth: 0.04,
  bevelWidth: 0.1,
  specular: true,
  shadow: false,
  tilt: false,
  frost: 0,
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * Thin glass wrapper for small elements like status badges, tags,
 * and icon circles. Text children are wrapped in a pointer-events:auto
 * span so they render on top of the glass and aren't distorted.
 */
export function GlassPill({
  children,
  className = '',
  as: Tag = 'span',
  options,
  ...rest
}: GlassPillProps) {
  const ref = useRef<HTMLElement>(null)
  useLiquidGlass(ref, { ...PILL_DEFAULTS, ...options })

  return createElement(
    Tag,
    { ref, className, ...rest },
    <span style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1 }}>
      {children}
    </span>,
  )
}
