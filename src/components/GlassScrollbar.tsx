import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react'

interface GlassScrollbarProps {
  children: ReactNode
  /** Page-level (fixed, controls documentElement) or section-level (absolute, controls inner ref) */
  variant?: 'page' | 'section'
  /** Only for variant="section" — optional class for outer container */
  className?: string
}

/**
 * Glassmorphism scrollbar widget.
 * `variant="page"` — fixed position, hides native body scrollbar, controls document.
 * `variant="section"` — absolute position, wraps children in a scrollable container.
 */
export function GlassScrollbar({ children, variant = 'page', className = '' }: GlassScrollbarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const thumbRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [thumbHeight, setThumbHeight] = useState(0)
  const [thumbTop, setThumbTop] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const rafRef = useRef<number | null>(null)
  const metricsRef = useRef({ maxScroll: 0, trackTravel: 0 })

  /** Absolute drag origin — NOT updated mid-drag */
  const dragOriginRef = useRef<{ scrollY: number; mouseY: number } | null>(null)

  const isPage = variant === 'page'

  // ─── Get scroll metrics ─────────────────────────────────────
  const getMetrics = useCallback(() => {
    if (isPage) {
      const { scrollHeight, clientHeight, scrollTop } = document.documentElement
      const maxScroll = scrollHeight - clientHeight
      const height = maxScroll > 0 ? (clientHeight / scrollHeight) * clientHeight : 0
      const top = maxScroll > 0 ? (scrollTop / maxScroll) * (clientHeight - height) : 0
      return { height: Math.max(height, 40), top, maxScroll, scrollTop, clientHeight }
    }

    const el = scrollContainerRef.current
    if (!el) return { height: 0, top: 0, maxScroll: 0, scrollTop: 0, clientHeight: 0 }
    const { scrollHeight, clientHeight, scrollTop } = el
    const maxScroll = scrollHeight - clientHeight
    const height = maxScroll > 0 ? (clientHeight / scrollHeight) * clientHeight : 0
    const top = maxScroll > 0 ? (scrollTop / maxScroll) * (clientHeight - height) : 0
    return { height: Math.max(height, 40), top, maxScroll, scrollTop, clientHeight }
  }, [isPage])

  // ─── Sync thumb position ────────────────────────────────────
  const syncThumb = useCallback(() => {
    const m = getMetrics()
    setThumbHeight(m.height)
    setThumbTop(m.top)
    metricsRef.current = {
      maxScroll: m.maxScroll,
      trackTravel: m.clientHeight - m.height,
    }
    if (m.maxScroll <= 0) {
      setIsVisible(false)
    }
  }, [getMetrics])

  // ─── Throttled scroll sync via rAF ──────────────────────────
  const onScroll = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      syncThumb()
      rafRef.current = null
    })
  }, [syncThumb])

  // ─── Hover visibility ───────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    setIsVisible(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) {
      setIsVisible(false)
    }
  }, [isDragging])

  // ─── Drag handlers ──────────────────────────────────────────
  const handleThumbMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)

      // Capture the scroll position at drag start (absolute origin)
      const scrollY = isPage
        ? document.documentElement.scrollTop
        : scrollContainerRef.current?.scrollTop ?? 0
      dragOriginRef.current = { scrollY, mouseY: e.clientY }
    },
    [isPage],
  )

  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== thumbRef.current) {
        const rect = trackRef.current?.getBoundingClientRect()
        if (!rect) return
        const clickY = e.clientY - rect.top
        const ratio = clickY / rect.height
        const maxScroll = isPage
          ? document.documentElement.scrollHeight - document.documentElement.clientHeight
          : (scrollContainerRef.current?.scrollHeight ?? 0) -
            (scrollContainerRef.current?.clientHeight ?? 0)
        const targetScroll = Math.round(ratio * maxScroll)
        if (isPage) {
          document.documentElement.scrollTop = targetScroll
        } else if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = targetScroll
        }
        syncThumb()
      }
    },
    [isPage, syncThumb],
  )

  // ─── Global mouse move/up for drag (absolute from origin) ───
  useEffect(() => {
    if (!isDragging || !dragOriginRef.current) return

    const origin = dragOriginRef.current

    const onMouseMove = (e: MouseEvent) => {
      if (!trackRef.current) return
      const { maxScroll, trackTravel } = metricsRef.current
      if (maxScroll <= 0 || trackTravel <= 0) return

      const deltaY = e.clientY - origin.mouseY
      const ratio = deltaY / trackTravel
      const targetScroll = Math.round(origin.scrollY + ratio * maxScroll)

      // Clamp to valid range
      const clamped = Math.max(0, Math.min(targetScroll, maxScroll))

      if (isPage) {
        document.documentElement.scrollTop = clamped
      } else if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = clamped
      }
    }

    const onMouseUp = () => {
      setIsDragging(false)
      dragOriginRef.current = null
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [isDragging, isPage])

  // ─── Attach scroll listener + resize observer ───────────────
  useEffect(() => {
    const target = isPage ? document : scrollContainerRef.current
    if (!target) return
    target.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // initial sync

    const ro = new ResizeObserver(() => onScroll())
    if (isPage) {
      ro.observe(document.documentElement)
    } else if (scrollContainerRef.current) {
      ro.observe(scrollContainerRef.current)
    }

    return () => {
      target.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [isPage, onScroll])

  // ─── Cleanup raf on unmount ──────────────────────────────
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // ─── Render ─────────────────────────────────────────────────

  const trackClasses = isPage
    ? 'fixed right-[3px] top-[6px] bottom-[6px] z-[9999]'
    : 'absolute right-[2px] top-0 bottom-0'

  // Solid thumb color (no liquidGL) — track keeps glass effect
  const thumbBase = 'bg-slate-500/60 dark:bg-slate-400/50'
  const thumbHover = 'hover:bg-slate-500/80 dark:hover:bg-slate-400/70'
  const thumbActive = 'bg-slate-500/80 dark:bg-slate-400/70'

  if (isPage) {
    return (
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative"
      >
        {children}
        {/* Glass track — keeps liquidGL effect */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className={`${trackClasses} w-[8px] rounded-full bg-white/10 dark:bg-white/[0.04] backdrop-blur-md border border-white/[0.06] dark:border-white/[0.03] ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}
        >
          {/* Solid thumb — no liquidGL */}
          <div
            ref={thumbRef}
            onMouseDown={handleThumbMouseDown}
            style={{ height: thumbHeight, top: thumbTop }}
            className={`absolute left-0 right-0 rounded-full cursor-grab active:cursor-grabbing ${thumbBase} ${thumbHover} ${
              isDragging ? thumbActive : ''
            } transition-[background] duration-200`}
            aria-hidden="true"
          />
        </div>
      </div>
    )
  }

  // ─── Section variant ────────────────────────────────────────
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        ref={scrollContainerRef}
        onScroll={onScroll}
        className="h-full overflow-y-auto hide-native-scrollbar"
      >
        {children}
      </div>
      {/* Glass track */}
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className={`${trackClasses} w-[6px] rounded-full bg-white/15 dark:bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] dark:border-white/[0.03] ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}
      >
        {/* Solid thumb — no liquidGL */}
        <div
          ref={thumbRef}
          onMouseDown={handleThumbMouseDown}
          style={{ height: thumbHeight, top: thumbTop }}
          className={`absolute left-0 right-0 rounded-full cursor-grab active:cursor-grabbing ${thumbBase} ${thumbHover} ${
            isDragging ? thumbActive : ''
          } transition-[background] duration-200`}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
