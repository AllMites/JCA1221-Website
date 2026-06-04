import { useRef, useEffect, useState, useCallback } from 'react'
import * as Icons from 'lucide-react'
import type { TechnologyStep } from '@/../product/sections/technology-and-approach/types'
import { ShaderBackground } from '@/components/ShaderBackground'

interface TechnologyCarouselSectionProps {
  eyebrow: string
  steps: TechnologyStep[]
  videoHoldDuration?: number
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Filter: Icons.Filter,
  Microscope: Icons.Microscope,
  Beaker: Icons.Beaker,
  Sun: Icons.Sun,
  Droplets: Icons.Droplets,
}

export function TechnologyCarouselSection({
  eyebrow,
  steps,
  videoHoldDuration = 5000,
}: TechnologyCarouselSectionProps) {
  const [visible, setVisible] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [lockedIndex, setLockedIndex] = useState<number | null>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [savedIndex, setSavedIndex] = useState<number | null>(null)
  const [videoState, setVideoState] = useState<'playing' | 'paused' | 'ended'>('paused')
  const [videoError, setVideoError] = useState(false)

  const sectionRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Refs to avoid stale closures in event handlers
  const activeIndexRef = useRef(activeIndex)
  const lockedIndexRef = useRef(lockedIndex)
  const hoveredIndexRef = useRef(hoveredIndex)
  const savedIndexRef = useRef(savedIndex)

  useEffect(() => { activeIndexRef.current = activeIndex }, [activeIndex])
  useEffect(() => { lockedIndexRef.current = lockedIndex }, [lockedIndex])
  useEffect(() => { hoveredIndexRef.current = hoveredIndex }, [hoveredIndex])
  useEffect(() => { savedIndexRef.current = savedIndex }, [savedIndex])

  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  // IntersectionObserver for entrance animation
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Resolve which index's video to show
  const resolvedIndex = lockedIndex !== null
    ? lockedIndex
    : hoveredIndex !== null
    ? hoveredIndex
    : activeIndex

  const resolvedStep = steps[resolvedIndex] ?? steps[0]

  // Clear auto-rotation timer
  const clearAutoTimer = useCallback(() => {
    if (autoTimerRef.current !== null) {
      clearInterval(autoTimerRef.current)
      autoTimerRef.current = null
    }
  }, [])

  // Start auto-rotation
  const startAutoTimer = useCallback(() => {
    clearAutoTimer()
    if (prefersReducedMotion) return
    autoTimerRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % steps.length)
    }, videoHoldDuration)
  }, [clearAutoTimer, videoHoldDuration, steps.length, prefersReducedMotion])

  // Manage auto-rotation lifecycle
  useEffect(() => {
    if (lockedIndex !== null || hoveredIndex !== null) {
      clearAutoTimer()
      return
    }
    startAutoTimer()
    return clearAutoTimer
  }, [lockedIndex, hoveredIndex, startAutoTimer, clearAutoTimer])

  // Play video when resolved step changes
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const step = steps[resolvedIndex]
    if (!step || !step.videoSrc) {
      setVideoState('paused')
      setVideoError(false)
      return
    }

    setVideoError(false)
    video.currentTime = 0

    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => setVideoState('playing'))
        .catch(() => {
          setVideoState('paused')
        })
    }
  }, [resolvedIndex, steps])

  // Handle video ended
  const handleVideoEnded = useCallback(() => {
    setVideoState('ended')
  }, [])

  // Handle video error
  const handleVideoError = useCallback(() => {
    setVideoError(true)
    setVideoState('paused')
  }, [])

  // Handle video element click (for autoplay-blocked browsers)
  const handleVideoClick = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().then(() => setVideoState('playing')).catch(() => {})
    }
  }, [])

  // Icon hover handlers with debounce
  const handleIconEnter = useCallback((index: number) => {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current)
    }
    setSavedIndex(activeIndexRef.current)
    debounceRef.current = setTimeout(() => {
      setHoveredIndex(index)
    }, 150)
  }, [])

  const handleIconLeave = useCallback(() => {
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    setHoveredIndex(null)
    const saved = savedIndexRef.current
    if (saved !== null) {
      setActiveIndex(saved)
      setSavedIndex(null)
    }
  }, [])

  // Icon click handler
  const handleIconClick = useCallback((index: number) => {
    const locked = lockedIndexRef.current
    if (locked === index) {
      setLockedIndex(null)
      setActiveIndex(index)
    } else {
      setLockedIndex(index)
      setHoveredIndex(null)
      setSavedIndex(null)
    }
  }, [])

  // Focus/blur — pause on blur
  useEffect(() => {
    const handleBlur = () => clearAutoTimer()
    const handleFocus = () => {
      if (lockedIndex === null && hoveredIndex === null) {
        startAutoTimer()
      }
    }
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
    }
  }, [clearAutoTimer, startAutoTimer, lockedIndex, hoveredIndex])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAutoTimer()
      if (debounceRef.current !== null) clearTimeout(debounceRef.current)
    }
  }, [clearAutoTimer])

  const getGlowClass = (index: number): string => {
    if (lockedIndex === index) {
      return 'shadow-[0_0_28px_rgba(250,204,21,0.6)] border-amber-400/80 bg-amber-400/10'
    }
    if (hoveredIndex === index) {
      return 'shadow-[0_0_16px_rgba(6,182,212,0.4)] border-cyan-400/60 bg-cyan-500/10'
    }
    if (resolvedIndex === index) {
      return 'shadow-[0_0_24px_rgba(6,182,212,0.5)] border-cyan-500/80 bg-cyan-500/15'
    }
    return 'border-white/10 bg-white/5'
  }

  const showVideo = !!(resolvedStep?.videoSrc) && !videoError
  const showPlaceholder = !resolvedStep?.videoSrc || videoError

  return (
    <section
      ref={sectionRef}
      className="relative py-20 sm:py-28 overflow-hidden"
    >
      {/* Solid deep background */}
      <div className="absolute inset-0 bg-slate-950" />

      {/* Atmospheric cyan orbs */}
      <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-cyan-500/8 blur-[120px]" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-blue-500/6 blur-[100px]" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-cyan-400/5 blur-[80px]" />

      <ShaderBackground variant="currents" opacity={0.4} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <div className="text-center mb-8">
          <p className="text-cyan-300/80 text-sm font-mono tracking-widest uppercase">
            {eyebrow}
          </p>
        </div>

        {/* Icon row */}
        <div className="flex items-center justify-center mb-10 overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex items-center gap-0 flex-nowrap min-w-max sm:min-w-0">
            {steps.map((step, i) => {
              const IconComponent = ICON_MAP[step.iconName]
              const isLast = i === steps.length - 1
              return (
                <div key={step.id} className="flex items-center gap-0">
                  <button
                    type="button"
                    className={`
                      flex flex-col items-center justify-center gap-1
                      w-16 h-16 sm:w-20 sm:h-20 rounded-2xl
                      border-2 transition-all duration-300 cursor-pointer
                      snap-center flex-shrink-0
                      ${getGlowClass(i)}
                      ${resolvedIndex === i ? 'opacity-100 scale-100' : 'opacity-50 scale-95 hover:opacity-75'}
                    `}
                    onMouseEnter={() => handleIconEnter(i)}
                    onMouseLeave={handleIconLeave}
                    onClick={() => handleIconClick(i)}
                    aria-label={step.label}
                    aria-pressed={lockedIndex === i}
                  >
                    {IconComponent && (
                      <IconComponent
                        className={`w-6 h-6 sm:w-7 sm:h-7 ${
                          resolvedIndex === i ? 'text-cyan-300' : 'text-slate-400'
                        }`}
                      />
                    )}
                    <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 leading-tight text-center px-1 hidden sm:block">
                      {step.label}
                    </span>
                  </button>

                  {/* Connecting line */}
                  {!isLast && (
                    <div className="w-6 sm:w-10 h-px bg-white/10 flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Video area */}
        <div className="max-w-3xl mx-auto mb-6">
          <div
            className="relative aspect-video rounded-xl overflow-hidden
                        bg-slate-900/80 backdrop-blur-sm
                        border border-white/10
                        shadow-[0_0_24px_rgba(6,182,212,0.15)]"
          >
            {showVideo && (
              <video
                ref={videoRef}
                src={resolvedStep.videoSrc}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
                onEnded={handleVideoEnded}
                onError={handleVideoError}
                onClick={handleVideoClick}
              />
            )}

            {showPlaceholder && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                {(() => {
                  const IconComponent = resolvedStep ? ICON_MAP[resolvedStep.iconName] : null
                  return IconComponent ? (
                    <IconComponent className="w-16 h-16 text-cyan-400/40" />
                  ) : null
                })()}
                <p className="text-slate-500 text-sm font-mono">
                  {videoError ? 'Preview unavailable' : 'Preview coming soon'}
                </p>
              </div>
            )}

            {/* Play overlay for autoplay-blocked */}
            {showVideo && videoState === 'paused' && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
                onClick={handleVideoClick}
              >
                <div className="w-16 h-16 rounded-full bg-cyan-500/30 backdrop-blur-sm border border-cyan-400/40 flex items-center justify-center">
                  <Icons.Play className="w-7 h-7 text-white ml-1" />
                </div>
              </div>
            )}

            {/* Locked indicator */}
            {lockedIndex !== null && (
              <div className="absolute top-3 right-3 px-2 py-1 rounded-md
                              bg-amber-400/20 backdrop-blur-sm border border-amber-400/30
                              text-amber-300 text-xs font-mono flex items-center gap-1">
                <Icons.Lock className="w-3 h-3" />
                Locked
              </div>
            )}

            {/* Ended overlay */}
            {videoState === 'ended' && lockedIndex === null && showVideo && (
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md
                              bg-slate-900/60 backdrop-blur-sm border border-white/5
                              text-slate-400 text-xs font-mono">
                Hold
              </div>
            )}
          </div>
        </div>

        {/* Step description */}
        <div
          className="text-center max-w-lg mx-auto"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <h3 className="text-lg sm:text-xl font-heading font-semibold text-white mb-2">
            {resolvedStep?.label}
          </h3>
          <p className="text-sm text-cyan-100/50 leading-relaxed">
            {resolvedStep?.description}
          </p>
        </div>
      </div>
    </section>
  )
}
