import { ArrowDown, Droplets } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import type { HeroContent } from '@/../product/sections/home/types'
import { GlassPill } from '@/components/GlassPill'


const CYCLE_WORDS = ['Water', 'Land', 'Waste']
const CYCLE_INTERVAL = 6000

// ─── Hero video — one cinematic backdrop per word ─────────────────────────
const HERO_VIDEOS: Record<string, string> = {
  Water:  '/videos/projects/compressed/puerto-princesa-hero.mp4',
  Land:   '/videos/projects/compressed/gingoog-hero.mp4',
  Waste:  '/videos/projects/compressed/del-carmen-hero.mp4',
}

const HERO_POSTERS: Record<string, string> = {
  Water:  '/videos/projects/compressed/puerto-princesa-hero-poster.webp',
  Land:   '/videos/projects/compressed/gingoog-hero-poster.webp',
  Waste:  '/videos/projects/compressed/del-carmen-hero-poster.webp',
}

// ─── Letter stagger constants ─────────────────────────────────────────────
const LETTER_DURATION = 350 // ms per letter animation
const LETTER_STAGGER = 60 // ms between consecutive letters
/** Total time from first letter start to last letter animation end */
const cycleTotalMs = (word: string) => LETTER_DURATION + (word.length - 1) * LETTER_STAGGER

// ─── Tint overlay per word (color shifts with word cycle) ─────────────────
interface WordTint {
  color: string   // Tailwind color class for the tint overlay
  accent: string  // accent text color
}

const WORD_TINT: Record<string, WordTint> = {
  Water:  { color: 'from-blue-950/70 via-blue-900/60 to-slate-950/80', accent: 'text-blue-300' },
  Land:   { color: 'from-emerald-950/70 via-emerald-900/60 to-slate-950/80', accent: 'text-emerald-300' },
  Waste:  { color: 'from-amber-950/70 via-amber-900/60 to-slate-950/80', accent: 'text-amber-300' },
}

interface HeroSectionProps {
  hero: HeroContent
  onCtaClick?: () => void
  onSecondaryCtaClick?: () => void
}

/** Icon color per word theme */
const WORD_ACCENT: Record<string, { bg: string; ring: string; icon: string; text: string; glow: string }> = {
  Water: {
    bg: 'bg-blue-500/20', ring: 'ring-blue-400/30', icon: 'text-blue-400',
    text: 'text-blue-300', glow: 'rgba(0,0,0,0.3)',
  },
  Land: {
    bg: 'bg-emerald-500/20', ring: 'ring-emerald-400/30', icon: 'text-emerald-400',
    text: 'text-emerald-300', glow: 'rgba(16,185,129,0.3)',
  },
  Waste: {
    bg: 'bg-amber-500/20', ring: 'ring-amber-400/30', icon: 'text-amber-400',
    text: 'text-amber-300', glow: 'rgba(245,158,11,0.3)',
  },
}

export function HeroSection({ hero, onCtaClick, onSecondaryCtaClick }: HeroSectionProps) {
  const cycleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const bgTeardownRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [wordIndex, setWordIndex] = useState(0)
  const [cycling, setCycling] = useState(false)

  // ─── Background cross-fade state ───────────────────────────────────────
  const activeBgWordRef = useRef(CYCLE_WORDS[0])
  const [overlayWord, setOverlayWord] = useState<string | null>(null)
  const [overlayVisible, setOverlayVisible] = useState(false)

  // ─── Parallax scroll effect ─────────────────────────────────────────────
  const sectionRef = useRef<HTMLElement>(null)
  const { scrollY } = useScroll()
  // Map section scroll position to parallax offset: 0 → 0, 1 → -150px (bg moves slower upward)
  const parallaxY = useTransform(scrollY, [0, window.innerHeight], [0, -120])

  const currentWord = CYCLE_WORDS[wordIndex]
  const nextWord = CYCLE_WORDS[(wordIndex + 1) % CYCLE_WORDS.length]
  // Accent follows overlay while it exists in DOM — syncs eyebrow/icon
  // transition with background, and doesn't snap back during fade-out
  const visualWord = overlayWord ?? currentWord
  const wordAccent = WORD_ACCENT[visualWord]

  useEffect(() => {
    return () => {
      clearTimeout(cycleTimer.current)
      clearTimeout(bgTeardownRef.current)
    }
  }, [])

  // Cycling word timer
  useEffect(() => {
    const id = setInterval(() => setCycling(true), CYCLE_INTERVAL)
    return () => clearInterval(id)
  }, [])

  // When cycling starts, schedule state reset after all letters finish
  useEffect(() => {
    if (!cycling) return
    const current = CYCLE_WORDS[wordIndex]
    const ms = cycleTotalMs(current) + 80 // small buffer after last letter
    cycleTimer.current = setTimeout(() => {
      setWordIndex((i) => (i + 1) % CYCLE_WORDS.length)
      setCycling(false)
    }, ms)
    return () => clearTimeout(cycleTimer.current)
  }, [cycling, wordIndex])

  // ─── Background cross-fade effect (synced to letter animation) ─────────
  useEffect(() => {
    if (!cycling) {
      // Letters finished → fade overlay out, then remove overlay DOM
      if (overlayWord) {
        activeBgWordRef.current = overlayWord      // 1. swap base behind opacity-1 overlay
        setOverlayVisible(false)                    // 2. start CSS fade-out
        bgTeardownRef.current = setTimeout(() => {  // 3. after transition: drop overlay DOM
          setOverlayWord(null)
          clearTimeout(bgTeardownRef.current)
        }, cycleTotalMs(currentWord))
      }
      return
    }

    // Cycling started → render overlay, then trigger fade-in
    setOverlayWord(nextWord)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setOverlayVisible(true))
    })

    return () => clearTimeout(bgTeardownRef.current)
  }, [cycling, nextWord]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Video playback rate — slow cinematic movement ─────────────────────
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})

  useEffect(() => {
    // Set slow playback on all videos once mounted
    CYCLE_WORDS.forEach((word) => {
      const el = videoRefs.current[word]
      if (el) {
        el.playbackRate = 0.6
        el.loop = true
      }
    })
  }, [])

  // ─── Video visibility control — pause hidden, reset + play on fade-in ──
  useEffect(() => {
    CYCLE_WORDS.forEach((word) => {
      const el = videoRefs.current[word]
      if (!el) return
      const isActive = word === activeBgWordRef.current
      const isIncoming = word === overlayWord && overlayVisible
      if (isActive || isIncoming) {
        // Reset to start when fading in as overlay
        if (isIncoming && !isActive) {
          el.currentTime = 0
        }
        if (el.paused) el.play()
      } else {
        el.pause()
      }
    })
  }, [activeBgWordRef.current, overlayWord, overlayVisible])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background layers with parallax — all videos preloaded, one visible at a time */}
      <motion.div className="absolute inset-0" style={{ y: parallaxY }}>
        {CYCLE_WORDS.map((word) => {
          const isActive = word === activeBgWordRef.current
          const isIncoming = word === overlayWord
          // Active base: full opacity. Incoming overlay: fades in. Neither: hidden.
          const visible = isActive || (isIncoming && overlayVisible)
          return (
            <div key={word} className="absolute inset-0 transition-opacity duration-[2000ms] ease-in-out"
              style={{ opacity: visible ? 1 : 0, pointerEvents: visible ? 'auto' : 'none' }}
            >
              <video
                ref={(el) => { videoRefs.current[word] = el }}
                src={HERO_VIDEOS[word]}
                poster={HERO_POSTERS[word]}
                autoPlay muted loop playsInline preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-b ${WORD_TINT[word].color}`} />
              <div className="absolute inset-0 bg-slate-950/20" />
            </div>
          )
        })}
      </motion.div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Icon with glass — accent color follows current word */}
        <div className="mb-8 flex justify-center animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <GlassPill as="div" className={`p-4 rounded-full ${wordAccent.bg} ring-1 ${wordAccent.ring} transition-colors duration-500`}>
            <Droplets size={36} className={`${wordAccent.icon} transition-colors duration-500`} strokeWidth={1.5} />
          </GlassPill>
        </div>

        {/* Site name */}
        <p
          className={`text-sm font-medium font-heading uppercase tracking-[0.25em] ${wordAccent.text} mb-6 animate-fade-in-up transition-colors duration-500 [text-shadow:0_2px_12px_rgba(0,0,0,0.7),0_1px_3px_rgba(0,0,0,0.5)]`}
          style={{ animationDelay: '150ms' }}
        >
          {hero.siteName}
        </p>

        {/* Tagline with cycling word */}
        <h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-heading text-white tracking-tight leading-[0.95] mb-8 animate-fade-in-up"
          style={{ animationDelay: '300ms' }}
        >
          {/* Cycling word — CSS grid cell for stable width regardless of word length */}
          <span
            className="relative inline-grid overflow-hidden h-[1em]"
            style={{
              gridTemplateAreas: "'slot'",
            }}
          >
            {/* Invisible spacers: all words with per-letter inline-block structure (matches visible words exactly, prevents kerning-driven width shifts) */}
            {CYCLE_WORDS.map((w) => (
              <span key={`spacer-${w}`} className="invisible pointer-events-none" aria-hidden="true" style={{ gridArea: 'slot' }}>
                {w.split('').map((letter, i) => (
                  <span key={i} className="inline-block">{letter}</span>
                ))}
                &nbsp;
              </span>
            ))}

            {/* Current word — letters exit staggered */}
            <span className="inline-block" style={{ gridArea: 'slot' }}>
              {currentWord.split('').map((letter, i) => (
                <span
                  key={`cur-${wordIndex}-${i}`}
                  className={`inline-block ${cycling ? 'animate-letter-out' : ''}`}
                  style={{ animationDelay: `${i * LETTER_STAGGER}ms` }}
                >
                  {letter}
                </span>
              ))}
              {/* Non-breaking space between cycling word and static text */}
              &nbsp;
            </span>

            {/* Next word — letters enter staggered (only during cycle) */}
            {cycling && (
              <span className="inline-block" style={{ gridArea: 'slot' }}>
                {nextWord.split('').map((letter, i) => (
                  <span
                    key={`next-${wordIndex}-${i}`}
                    className="inline-block animate-letter-in"
                    style={{ animationDelay: `${i * LETTER_STAGGER + 100}ms` }}
                  >
                    {letter}
                  </span>
                ))}
                &nbsp;
              </span>
            )}
          </span>
          Renewal for Generations
        </h1>

        {/* Description */}
        <p
          className={`text-lg sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-12 animate-fade-in-up [text-shadow:0_2px_12px_rgba(0,0,0,0.7),0_1px_3px_rgba(0,0,0,0.5)]`}
          style={{ animationDelay: '450ms' }}
        >
          {hero.description}
        </p>

        {/* Dual CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          {/* Primary CTA — premium gradient button */}
          <button
            onClick={onCtaClick}
            className="group relative inline-flex items-center gap-2.5 px-8 py-4 text-white font-semibold font-heading rounded-full transition-all duration-500
              bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400
              hover:from-blue-400 hover:via-cyan-400 hover:to-blue-400
              shadow-[0_0_24px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.15)]
              hover:shadow-[0_0_36px_rgba(0,0,0,0.45),0_8px_20px_rgba(0,0,0,0.2)]
              active:scale-[0.97]
              overflow-hidden"
          >
            {/* Subtle shine sweep on hover */}
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <span className="relative z-10">{hero.ctaLabel || 'Partner With Us'}</span>
          </button>

          {/* Secondary CTA — glass pill */}
          <button
            onClick={onSecondaryCtaClick}
            aria-label="Scroll to impact statistics"
            className="group inline-flex items-center gap-2 px-8 py-4 text-white/90 hover:text-white font-semibold font-heading rounded-full
              bg-white/10 hover:bg-white/15
              border border-white/30 hover:border-white/50
              backdrop-blur-md
              shadow-[0_4px_12px_rgba(0,0,0,0.08)]
              hover:shadow-[0_6px_20px_rgba(0,0,0,0.12)]
              active:scale-[0.97]
              transition-all duration-300"
          >
            Our Impact
            <ArrowDown
              size={16}
              className="group-hover:translate-y-0.5 transition-transform duration-300"
            />
          </button>
        </div>
      </div>

      {/* Scroll indicator — fades out on scroll */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 1 }}
        style={{ opacity: useTransform(scrollY, [0, 200], [1, 0]) }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
          <div className="w-1 h-2.5 rounded-full bg-white/40 animate-scroll-dot" />
        </div>
      </motion.div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scroll-dot {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(8px); opacity: 1; }
        }
        @keyframes letter-out {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-105%); opacity: 0; }
        }
        @keyframes letter-in {
          from { transform: translateY(105%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scroll-dot {
          animation: scroll-dot 2s ease-in-out infinite;
        }
        .animate-letter-out {
          animation: letter-out ${LETTER_DURATION}ms cubic-bezier(0.4, 0, 1, 1) both;
        }
        .animate-letter-in {
          animation: letter-in ${LETTER_DURATION}ms cubic-bezier(0, 0, 0.2, 1) both;
        }
      `}</style>
    </section>
  )
}
