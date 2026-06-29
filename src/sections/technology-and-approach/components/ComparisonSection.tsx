import { useRef, useEffect, useState, type ReactNode } from 'react'
import { Check, X } from 'lucide-react'
import type { Comparison } from '@/../product/sections/technology-and-approach/types'
import { ShaderBackground } from '@/components/ShaderBackground'
import { Tooltip } from '@/components/Tooltip'

interface ComparisonSectionProps {
  comparison: Comparison
}

/** Wrap known technical terms in text with Tooltip spans */
function renderWithTooltips(text: string): ReactNode[] {
  const terms: Record<string, string> = {
    PPP: 'Public-Private Partnership — a contractual arrangement between government and private sector for infrastructure projects under the Philippine BOT Law.',
    'public-private partnership': 'Public-Private Partnership — a contractual arrangement between government and private sector for infrastructure projects under the Philippine BOT Law.',
    biological: 'Biological treatment uses naturally occurring microorganisms — not chemicals — to break down organic pollutants in wastewater.',
    modular: 'Modular design uses prefabricated treatment units that can be deployed in phases, allowing communities to start small and scale as they grow.',
    IoT: 'Internet of Things — a network of sensors and devices that stream real-time data to the cloud for remote monitoring and diagnostics.',
    effluent: 'Effluent is treated wastewater discharged from a treatment facility — our systems achieve quality that meets or exceeds DENR standards.',
    BOD: 'Biochemical Oxygen Demand — a measure of organic pollution in water. Lower BOD means cleaner water. Our systems achieve over 90% BOD reduction.',
    'constructed wetland': 'Constructed wetlands are engineered ecosystems that use plants, soil, and microbes to treat wastewater naturally — requiring minimal energy and no chemicals.',
  }

  const result: ReactNode[] = []
  let remaining = text

  // Sort terms by length (longest first) to avoid partial matches
  const sortedTerms = Object.entries(terms).sort((a, b) => b[0].length - a[0].length)

  while (remaining.length > 0) {
    let matched = false
    for (const [term, tooltip] of sortedTerms) {
      const idx = remaining.toLowerCase().indexOf(term.toLowerCase())
      if (idx !== -1) {
        // Push text before the match
        if (idx > 0) {
          result.push(remaining.slice(0, idx))
        }
        // Push the tooltip-wrapped term
        result.push(
          <Tooltip key={`${term}-${idx}`} content={tooltip}>
            {remaining.slice(idx, idx + term.length)}
          </Tooltip>,
        )
        remaining = remaining.slice(idx + term.length)
        matched = true
        break
      }
    }
    if (!matched) {
      // No more terms matched — push remaining text and break
      result.push(remaining)
      break
    }
  }

  return result
}

export function ComparisonSection({ comparison }: ComparisonSectionProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      className="relative py-20 sm:py-28 overflow-hidden"
    >
      {/* Solid deep background */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950" />

      {/* Subtle blue atmospheric orbs */}
      <div className="absolute top-1/3 right-1/3 w-96 h-96 rounded-full bg-blue-500/5 blur-[120px]" />
      <div className="absolute bottom-20 left-1/4 w-72 h-72 rounded-full bg-slate-500/4 blur-[100px]" />

      {/* Noise dither */}
      <ShaderBackground variant="ripples" opacity={0.4} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-blue-600 dark:text-blue-300/80 text-sm font-mono tracking-widest uppercase mb-4">
            Why It Matters
          </p>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 dark:text-white mb-4">
            {comparison.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-300/60 max-w-lg mx-auto text-lg leading-relaxed">
            {comparison.subtitle}
          </p>
        </div>

        {/* Column headers — desktop only */}
        <div className="hidden md:grid grid-cols-[1fr_1.2fr_1.2fr] gap-4 mb-4 px-4">
          <div />
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/15 backdrop-blur-sm border border-blue-300 dark:border-blue-400/20 text-sm font-heading font-semibold text-blue-700 dark:text-blue-300">
              <Check className="w-4 h-4" />
              JCA 1221
            </span>
          </div>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-500/15 backdrop-blur-sm border border-slate-300 dark:border-slate-400/20 text-sm font-heading font-semibold text-slate-600 dark:text-slate-300">
              <X className="w-4 h-4" />
              Traditional
            </span>
          </div>
        </div>

        {/* Comparison rows */}
        <div className="space-y-3">
          {comparison.points.map((point, i) => (
            <div
              key={point.label}
              className="group relative"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(16px)',
                transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s`,
              }}
            >
              {/* Glass row */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr_1.2fr] gap-3 md:gap-4 p-4 md:p-5 rounded-xl bg-white dark:bg-white/5 backdrop-blur-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/8 transition-colors duration-300">
                {/* Label */}
                <div className="flex items-center">
                  <span className="text-sm font-heading font-semibold text-slate-800 dark:text-slate-200">
                    {point.label}
                  </span>
                </div>

                {/* JCA column */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/20 border border-blue-300 dark:border-blue-400/30 flex items-center justify-center">
                      <Check className="w-3 h-3 text-blue-600 dark:text-blue-300" />
                    </div>
                  </div>
                  <p className="text-sm text-blue-900/80 dark:text-blue-100/70 leading-relaxed">
                    {renderWithTooltips(point.jca)}
                  </p>
                </div>

                {/* Traditional column */}
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-500/15 border border-slate-300 dark:border-slate-400/20 flex items-center justify-center">
                      <X className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-300/50 leading-relaxed">
                    {renderWithTooltips(point.traditional)}
                  </p>
                </div>
              </div>

              {/* Mobile label */}
              <div className="md:hidden absolute top-3 right-4 text-[10px] font-mono uppercase tracking-wider text-slate-400/50">
                vs
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
