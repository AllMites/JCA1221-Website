import { useEffect, useRef, useState, useCallback } from 'react'
import type { Partner } from '../../shared/content-types'

interface PartnerLogoCarouselProps {
  partners: Partner[]
  title?: string
  subtitle?: string
}

export function PartnerLogoCarousel({ partners, title, subtitle }: PartnerLogoCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const animationRef = useRef<number | null>(null)

  const items = [...partners, ...partners]

  const scroll = useCallback(() => {
    if (!scrollRef.current || isPaused) {
      animationRef.current = requestAnimationFrame(scroll)
      return
    }

    const el = scrollRef.current
    el.scrollLeft += 0.5

    const singleSetWidth = el.scrollWidth / 2
    if (el.scrollLeft >= singleSetWidth) {
      el.scrollLeft = el.scrollLeft - singleSetWidth
    }

    animationRef.current = requestAnimationFrame(scroll)
  }, [isPaused])

  useEffect(() => {
    animationRef.current = requestAnimationFrame(scroll)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [scroll])

  if (!partners || partners.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-black/20">
      <div className="max-w-7xl mx-auto px-6">
        {(title || subtitle) && (
          <div className="text-center mb-10">
            {title && (
              <h2 className="text-xl md:text-2xl font-heading font-bold text-slate-900 dark:text-white">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <div
          className="overflow-hidden relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-hidden py-4"
          >
            {items.map((partner, i) => (
              <a
                key={`${partner.id}-${i}`}
                href={partner.website_url || undefined}
                target={partner.website_url ? '_blank' : undefined}
                rel="noopener noreferrer"
                className={`flex-shrink-0 h-16 min-w-[140px] rounded-lg flex items-center justify-center p-3 transition-all duration-300 group ${
                  partner.website_url ? 'cursor-pointer' : 'cursor-default'
                }`}
                style={{
                  filter: 'grayscale(100%)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'grayscale(0%)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'grayscale(100%)'
                }}
              >
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-full max-w-full object-contain opacity-70 group-hover:opacity-100 transition-all duration-300"
                  />
                ) : (
                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
                    {partner.name}
                  </span>
                )}
              </a>
            ))}
          </div>

          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white/80 dark:from-black/40 to-transparent pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white/80 dark:from-black/40 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
