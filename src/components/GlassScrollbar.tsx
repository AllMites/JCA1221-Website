import { useRef, useState, useEffect, useCallback, type ReactNode } from 'react'

interface GlassScrollbarProps {
  children: ReactNode
  variant?: 'page' | 'section'
  className?: string
}

/**
 * Glassmorphism scrollbar widget.
 * `variant="page"` — fixed position, hides native body scrollbar, controls document.
 * `variant="section"` — absolute position, wraps children in a scrollable container.
 *
 * Drag uses direct DOM manipulation (no React state) to avoid render-cycle
 * feedback loops. React state is only synced on mouseup.
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
  const isDraggingRef = useRef(false)

  /** Holds computed maxScroll + trackTravel so drag handler can read synchronously */
  const metricsRef = useRef({ maxScroll: 0, trackTravel: 0 })

  /** Absolute drag origin — frozen at mousedown, never mutated */
  const dragOriginRef = useRef<{ scrollY: number; mouseY: number } | null>(null)

  const isPage = variant === 'page'

  /** Track offset: the CSS `top-[6px]` means the track doesn't start at y=0 */
  const TRACK_OFFSET = isPage ? 12 : 0 // 6px top + 6px bottom

  // ─── Get scroll metrics ─────────────────────────────────────
  const getMetrics = useCallback(() => {
    if (isPage) {
      const { scrollHeight, clientHeight, scrollTop } = document.documentElement
      const maxScroll = scrollHeight - clientHeight
      const thumbH = maxScroll > 0 ? (clientHeight / scrollHeight) * clientHeight : 0
      const thumbT = maxScroll > 0 ? (scrollTop / maxScroll) * (clientHeight - thumbH - TRACK_OFFSET) : 0
      return { height: Math.max(thumbH, 40), top: thumbT, maxScroll, scrollTop, clientHeight }
    }

    const el = scrollContainerRef.current
    if (!el) return { height: 0, top: 0, maxScroll: 0, scrollTop: 0, clientHeight: 0 }
    const { scrollHeight, clientHeight, scrollTop } = el
    const maxScroll = scrollHeight - clientHeight
    const thumbH = maxScroll > 0 ? (clientHeight / scrollHeight) * clientHeight : 0
    const thumbT = maxScroll > 0 ? (scrollTop / maxScroll) * (clientHeight - thumbH) : 0
    return { height: Math.max(thumbH, 40), top: thumbT, maxScroll, scrollTop, clientHeight }
  }, [isPage, TRACK_OFFSET])

  // ─── Sync thumb position ────────────────────────────────────
  const syncThumb = useCallback(() => {
    const m = getMetrics()
    setThumbHeight(m.height)
    setThumbTop(m.top)
    metricsRef.current = {
      maxScroll: m.maxScroll,
      trackTravel: m.clientHeight - m.height - TRACK_OFFSET,
    }
    if (m.maxScroll <= 0) {
      setIsVisible(false)
    }
  }, [getMetrics, TRACK_OFFSET])

  // ─── rAF-throttled scroll handler ───────────────────────────
  const onScroll = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      // During drag, React state still causes re-render jitter.
      // Thumb DOM + page scroll are updated directly in mousemove.
      if (!isDraggingRef.current) {
        syncThumb()
      }
      rafRef.current = null
    })
  }, [syncThumb])

  // ─── Hover visibility ───────────────────────────────────────
  const handleMouseEnter = useCallback(() => {
    setIsVisible(true)
  }, [])

  const handleMouseLeave = useCallback(() => {
    if (!isDragging) setIsVisible(false)
  }, [isDragging])

  // ─── Drag handlers ──────────────────────────────────────────
  const handleThumbMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(true)
      isDraggingRef.current = true

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

  // ─── Global mouse move/up (direct DOM, no React state) ──────
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
      const clamped = Math.max(0, Math.min(targetScroll, maxScroll))

      // Set scroll position directly
      if (isPage) {
        document.documentElement.scrollTop = clamped
      } else if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = clamped
      }

      // Update thumb DOM directly — skip React state to avoid render loop
      if (thumbRef.current) {
        const thumbT = (clamped / maxScroll) * trackTravel
        thumbRef.current.style.top = `${thumbT}px`
      }
    }

    const onMouseUp = () => {
      setIsDragging(false)
      isDraggingRef.current = false
      dragOriginRef.current = null
      // Sync React state to match final DOM position
      syncThumb()
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [isDragging, isPage, syncThumb])

  // ─── Attach scroll listener + resize observer ───────────────
  useEffect(() => {
    const target = isPage ? document : scrollContainerRef.current
    if (!target) return
    target.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

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

  // ─── Cleanup ────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  // ─── Render ─────────────────────────────────────────────────

  const trackClasses = isPage
    ? 'fixed right-[3px] top-[6px] bottom-[6px] z-[9999]'
    : 'absolute right-[2px] top-0 bottom-0'

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
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className={`${trackClasses} w-[8px] rounded-full bg-white/10 dark:bg-white/[0.04] backdrop-blur-md border border-white/[0.06] dark:border-white/[0.03] ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}
        >
          <div
            ref={thumbRef}
            onMouseDown={handleThumbMouseDown}
            style={{ height: thumbHeight, top: thumbTop }}
            className={`absolute left-0 right-0 rounded-full cursor-grab active:cursor-grabbing ${thumbBase} ${thumbHover} ${
              isDragging ? thumbActive : ''
            }`}
            aria-hidden="true"
          />
        </div>
      </div>
    )
  }

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
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className={`${trackClasses} w-[6px] rounded-full bg-white/15 dark:bg-white/[0.05] backdrop-blur-sm border border-white/[0.08] dark:border-white/[0.03] ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-opacity duration-300`}
      >
        <div
          ref={thumbRef}
          onMouseDown={handleThumbMouseDown}
          style={{ height: thumbHeight, top: thumbTop }}
          className={`absolute left-0 right-0 rounded-full cursor-grab active:cursor-grabbing ${thumbBase} ${thumbHover} ${
            isDragging ? thumbActive : ''
          }`}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
