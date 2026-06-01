import { ArrowDown, Droplets } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { HeroContent } from '@/../product/sections/home/types'
import { ShaderBackground } from '@/components/ShaderBackground'

const CYCLE_WORDS = ['Water', 'Land', 'Waste']
const CYCLE_INTERVAL = 3500

// ─── Letter stagger constants ─────────────────────────────────────────────
const LETTER_DURATION = 350 // ms per letter animation
const LETTER_STAGGER = 60 // ms between consecutive letters
/** Total time from first letter start to last letter animation end */
const cycleTotalMs = (word: string) => LETTER_DURATION + (word.length - 1) * LETTER_STAGGER

interface HeroSectionProps {
  hero: HeroContent
  onCtaClick?: () => void
  onShellReveal?: () => void
  onShellHide?: () => void
}

export function HeroSection({ hero, onCtaClick, onShellReveal, onShellHide }: HeroSectionProps) {
  const edgeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const cycleTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [wordIndex, setWordIndex] = useState(0)
  const [cycling, setCycling] = useState(false)

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.clientY <= 64) {
      clearTimeout(edgeTimer.current)
      onShellReveal?.()
    } else {
      edgeTimer.current = setTimeout(() => onShellHide?.(), 300)
    }
  }

  useEffect(() => {
    return () => {
      clearTimeout(edgeTimer.current)
      clearTimeout(cycleTimer.current)
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

  const currentWord = CYCLE_WORDS[wordIndex]
  const nextWord = CYCLE_WORDS[(wordIndex + 1) % CYCLE_WORDS.length]

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Water background layers */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950 to-slate-900" />

      {/* Animated shader — drifting orbs + flowing wave lines + grain */}
      <ShaderBackground variant="blue" opacity={0.7} animated />

      {/* Shell edge detection zone (invisible) */}
      <div className="fixed top-0 left-0 right-0 h-16 z-50 pointer-events-none" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Water droplet icon */}
        <div className="mb-8 flex justify-center animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <div className="p-4 rounded-full bg-blue-500/20 backdrop-blur-sm ring-1 ring-blue-400/30">
            <Droplets size={36} className="text-blue-400" strokeWidth={1.5} />
          </div>
        </div>

        {/* Site name */}
        <p
          className="text-sm font-medium font-heading uppercase tracking-[0.25em] text-blue-300 mb-6 animate-fade-in-up"
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
          className="text-lg sm:text-xl text-blue-200/80 max-w-2xl mx-auto leading-relaxed mb-12 animate-fade-in-up"
          style={{ animationDelay: '450ms' }}
        >
          {hero.description}
        </p>

        {/* CTA */}
        <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <button
            onClick={onCtaClick}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-semibold font-heading rounded-full hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] transition-all duration-300"
          >
            {hero.ctaLabel}
            <ArrowDown
              size={18}
              className="group-hover:translate-y-0.5 transition-transform duration-300"
            />
          </button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5">
          <div className="w-1 h-2.5 rounded-full bg-white/40 animate-scroll-dot" />
        </div>
      </div>

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
