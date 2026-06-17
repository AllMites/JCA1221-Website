import { useRef, useEffect, useState, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import type { CsrProject } from '../../shared/content-types'
import { ShaderBackground } from '../../shared/ShaderBackground'

interface CsrCarouselProps {
  projects: CsrProject[]
  title?: string
  subtitle?: string
}

export function CsrCarousel({ projects, title, subtitle }: CsrCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const reducedMotion = useReducedMotion()
  const AUTO_ADVANCE_MS = 5000

  const totalCards = projects.length + 1 // +1 for end hint card
  const cardWidth = 350 + 20 // 350px card + 20px gap

  // Pause on hover
  const handleMouseEnter = useCallback(() => setIsPaused(true), [])
  const handleMouseLeave = useCallback(() => setIsPaused(false), [])

  // Auto-advance
  useEffect(() => {
    if (reducedMotion || projects.length === 0) return
    const interval = setInterval(() => {
      if (!isPaused && scrollRef.current) {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % totalCards
          scrollRef.current?.scrollTo({ left: next * cardWidth, behavior: 'smooth' })
          return next
        })
      }
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(interval)
  }, [isPaused, totalCards, reducedMotion, AUTO_ADVANCE_MS, cardWidth])

  if (!projects || projects.length === 0) return null

  return (
    <section className="relative py-20 overflow-hidden bg-white dark:bg-slate-950">
      <ShaderBackground variant="light" opacity={0.3} />

      {/* Section header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        {(title || subtitle) && (
          <div className="text-center">
            {subtitle && (
              <p className="text-sm font-medium font-heading uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400 mb-3">
                {subtitle}
              </p>
            )}
            {title && (
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 dark:text-white mb-4">
                {title}
              </h2>
            )}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-2">
        <div className="h-0.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-lime-500 dark:bg-lime-400 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: isPaused ? undefined : '100%' }}
            transition={{
              duration: AUTO_ADVANCE_MS / 1000,
              ease: 'linear',
              repeat: Infinity,
            }}
            key={currentIndex}
          />
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 overflow-x-auto overscroll-x-contain pb-2"
      >
        <div
          className="flex gap-5 px-4 sm:px-6 lg:px-8 pb-4 snap-x snap-mandatory"
          style={{
            scrollPaddingInline: 'calc((100vw - 1280px) / 2 + 2rem)',
            paddingLeft: 'max(1rem, calc((100vw - 1280px) / 2 + 2rem))',
            paddingRight: 'max(1rem, calc((100vw - 1280px) / 2 + 2rem))',
          }}
        >
          {projects.map((csr) => {
            const stats = (csr.stats as Array<{ label: string; value: string }>) ?? []
            return (
              <a
                key={csr.id}
                href={`/projects?tab=csr#${csr.slug}`}
                className="group/card flex-shrink-0 w-[350px] snap-start text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-lime-400/50 dark:hover:border-lime-500/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-lime-500/10 dark:hover:shadow-lime-500/5 transition-all duration-500"
              >
                {/* Hero image */}
                <div className="relative h-44 bg-gradient-to-br from-lime-100 to-slate-200 dark:from-lime-950 dark:to-slate-800 overflow-hidden">
                  {csr.hero_image ? (
                    <img
                      src={csr.hero_image}
                      alt={csr.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Heart size={32} className="text-lime-400/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent dark:from-slate-900/90 dark:via-slate-900/40" />

                  {/* Category badge */}
                  {csr.category && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium font-heading rounded-full border backdrop-blur-sm bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-300 border-lime-200/50 dark:border-lime-800/30">
                        {csr.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold font-heading text-slate-900 dark:text-white text-lg leading-tight group-hover/card:text-lime-600 dark:group-hover/card:text-lime-400 transition-colors duration-300 line-clamp-2">
                    {csr.name}
                  </h3>

                  {csr.location && (
                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      {csr.location}
                    </p>
                  )}

                  {csr.description && (
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {csr.description}
                    </p>
                  )}

                  {/* SDG badges */}
                  {csr.sdg_tags && csr.sdg_tags.length > 0 && (
                    <div className="flex gap-1.5 mt-3 flex-wrap">
                      {csr.sdg_tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-0.5 text-[10px] font-semibold font-heading rounded-full bg-lime-400/10 text-lime-700 dark:text-lime-400 border border-lime-400/20"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Mini stats */}
                  {stats.length > 0 && (
                    <div className="flex gap-5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      {stats.slice(0, 2).map((s, i) => (
                        <div key={i}>
                          <p className="text-base font-bold font-heading text-slate-700 dark:text-slate-300">
                            {s.value}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                            {s.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </a>
            )
          })}

          {/* End hint card */}
          <div className="flex-shrink-0 w-[280px] flex items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
            <div className="text-center p-6">
              <Heart size={24} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-400 dark:text-slate-500 font-heading">
                More CSR initiatives underway
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
