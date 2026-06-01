import { type ReactNode, type HTMLAttributes, type ElementType } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface GlassPillProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  /** CSS classes applied to the outer glass element */
  className?: string
  /** HTML tag for outer element. Default: 'span' */
  as?: ElementType
}

// ─── Component ───────────────────────────────────────────────────────────────

/**
 * CSS-only glass wrapper for small elements like status badges, tags,
 * and icon circles. Uses backdrop-filter blur for frost effects.
 * No WebGL — avoids specular artifacts and scroll jitter on tiny elements.
 */
export function GlassPill({
  children,
  className = '',
  as: Tag = 'span',
  ...rest
}: GlassPillProps) {
  return (
    <Tag
      className={className}
      style={{
        backdropFilter: 'blur(8px) saturate(120%)',
        WebkitBackdropFilter: 'blur(8px) saturate(120%)',
      }}
      {...rest}
    >
      <span style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1 }}>
        {children}
      </span>
    </Tag>
  )
}
