// src/sections/home/components/TrustStrip.tsx
import { useEffect, useRef, useState } from 'react'
import { useCountUp } from '@/lib/use-count-up'
import { ScrollReveal, RevealItem } from '@/components/ScrollReveal'
import type { ImpactStat } from '@/../product/sections/home/types'

interface TrustStripProps {
  stats: ImpactStat[]
  partnerLogos: string[]
}

function StatItem({ stat }: { stat: ImpactStat }) {
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const count = useCountUp({
    target: stat.number,
    duration: 2000,
    enabled: hasAnimated,
  })

  // Observe scroll into view
  useEffect(() => {
    const node = ref.current
    if (!node || hasAnimated) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [hasAnimated])

  return (
    <div ref={ref} className="text-center group cursor-default">
      <div
        className="mb-1 font-bold font-heading text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight tabular-nums"
        role="status"
        aria-live="polite"
      >
        {count.toLocaleString()}
        <span className="text-lg sm:text-xl text-blue-500 dark:text-blue-400 ml-1">{stat.suffix}</span>
      </div>
      <div className="font-semibold font-heading text-xs sm:text-sm text-slate-700 dark:text-slate-300">
        {stat.label}
      </div>
    </div>
  )
}

export function TrustStrip({ stats, partnerLogos }: TrustStripProps) {
  if (!stats || stats.length === 0) return null

  return (
    <section id="trust-strip" className="relative -mt-16 z-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 shadow-lg">
          {/* Stats row */}
          <ScrollReveal staggerChildren={0.08} viewportMargin="0px 0px" className="grid grid-cols-2 md:grid-cols-4 py-8 px-4 sm:px-8 gap-y-8 md:gap-y-0">
            {stats.slice(0, 4).map((stat) => (
              <RevealItem key={stat.label} className="md:border-l md:first:border-l-0 border-slate-200 dark:border-slate-700 md:px-4 md:first:pl-0 md:last:pr-0">
                <StatItem stat={stat} />
              </RevealItem>
            ))}
          </ScrollReveal>

          {/* Partner marks row */}
          {partnerLogos && partnerLogos.length > 0 && (
            <div className="border-t border-slate-200 dark:border-slate-700 py-4 px-4 sm:px-8">
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500 font-heading uppercase tracking-wider">
                  Trusted By
                </span>
                {partnerLogos.map((name, i) => (
                  <span
                    key={i}
                    className="text-xs font-semibold text-slate-400 dark:text-slate-500 grayscale hover:grayscale-0 transition-all duration-300"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
