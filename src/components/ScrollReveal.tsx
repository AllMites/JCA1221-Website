import { useReducedMotion, motion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  delay?: number
  duration?: number
  /** Stagger delay between children in seconds. Children must be direct descendants. */
  staggerChildren?: number
  /** Only animate once (on first scroll into view). Default true. */
  once?: boolean
  /** Margin before viewport edge triggers reveal. Default '-80px 0px'. */
  viewportMargin?: string
}

// Pre-computed direction lookups to avoid computed property keys that break
// framer-motion v12 Variant index-signature checking.
const HIDDEN_BY_DIRECTION: Record<string, Record<string, unknown>> = {
  up: { y: -40 },
  down: { y: 40 },
  left: { x: -40 },
  right: { x: 40 },
}

const ITEM_HIDDEN_BY_DIRECTION: Record<string, Record<string, unknown>> = {
  up: { y: -30 },
  down: { y: 30 },
  left: { x: -30 },
  right: { x: 30 },
}

/**
 * Scroll-triggered reveal animation wrapper.
 * Fades + slides + un-blurs content as it enters the viewport.
 * Automatically disables when `prefers-reduced-motion` is set.
 */
export function ScrollReveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  staggerChildren,
  once = true,
  viewportMargin = '-80px 0px',
}: ScrollRevealProps) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  const hiddenOffset = HIDDEN_BY_DIRECTION[direction]

  const variants: Variants = {
    hidden: {
      opacity: 0,
      filter: 'blur(8px)',
      ...hiddenOffset,
      transition: { duration: 0 },
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      x: 0,
      y: 0,
      transition: {
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: staggerChildren ?? 0,
      },
    },
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: viewportMargin }}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Child element that participates in stagger animation.
 * Wrap individual items inside a ScrollReveal parent with staggerChildren set.
 */
export function RevealItem({
  children,
  className,
  direction = 'up',
  duration = 0.5,
}: {
  children: ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
  duration?: number
}) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  const hiddenOffset = ITEM_HIDDEN_BY_DIRECTION[direction]

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, filter: 'blur(4px)', ...hiddenOffset },
        visible: {
          opacity: 1,
          filter: 'blur(0px)',
          x: 0,
          y: 0,
          transition: { duration, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
