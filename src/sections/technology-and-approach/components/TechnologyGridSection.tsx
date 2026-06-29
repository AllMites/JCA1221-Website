import { useRef, useEffect, useState, type ReactNode } from 'react'
import * as Icons from 'lucide-react'
import type { TechnologyPillar } from '@/../product/sections/technology-and-approach/types'
import { ShaderBackground } from '@/components/ShaderBackground'
import { GlassPill } from '@/components/GlassPill'
import { Tooltip } from '@/components/Tooltip'

interface TechnologyGridSectionProps {
  pillars: TechnologyPillar[]
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Microscope: Icons.Microscope,
  Blocks: Icons.Blocks,
  Zap: Icons.Zap,
  Globe: Icons.Globe,
}

/** Wrap known technical terms in text with Tooltip spans */
function renderWithTooltips(text: string): ReactNode[] {
  const terms: Record<string, string> = {
    BOD: 'Biochemical Oxygen Demand — a measure of organic pollution in water. Lower BOD means cleaner water.',
    'constructed wetland': 'Constructed wetlands are engineered ecosystems that use plants, soil, and microbes to treat wastewater naturally.',
    effluent: 'Effluent is treated wastewater discharged from a treatment facility.',
    IoT: 'Internet of Things — sensors streaming real-time data to the cloud for remote monitoring.',
    'Sequential Batch Reactor': 'A fill-and-draw activated sludge treatment system where wastewater is treated in batches using naturally occurring microorganisms.',
    SBR: 'Sequential Batch Reactor — a biological wastewater treatment process using naturally occurring microorganisms in timed batch cycles.',
    modular: 'Modular design uses prefabricated units deployed in phases — start small, scale with demand.',
    PPP: 'Public-Private Partnership — a contractual arrangement between government and private sector for infrastructure projects.',
    'Biological Nutrient Removal': 'A wastewater treatment process where bacteria remove nitrogen and phosphorus — the same cycles that keep rivers and aquariums healthy.',
    'solar-assisted': 'Solar panels integrated into facility operations to reduce grid energy consumption and carbon footprint.',
  }

  const result: ReactNode[] = []
  let remaining = text

  const sortedTerms = Object.entries(terms).sort((a, b) => b[0].length - a[0].length)

  while (remaining.length > 0) {
    let matched = false
    for (const [term, tooltip] of sortedTerms) {
      const idx = remaining.toLowerCase().indexOf(term.toLowerCase())
      if (idx !== -1) {
        if (idx > 0) {
          result.push(remaining.slice(0, idx))
        }
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
      result.push(remaining)
      break
    }
  }

  return result
}

export function TechnologyGridSection({ pillars }: TechnologyGridSectionProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
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
      <div className="absolute inset-0 bg-white dark:bg-slate-950" />


      {/* Noise dither */}
      <ShaderBackground variant="bubbles" opacity={0.5} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-blue-600 dark:text-blue-300/80 text-sm font-mono tracking-widest uppercase mb-4">
            Core Technology
          </p>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-slate-900 dark:text-white mb-4">
            Four Pillars of Our Systems
          </h2>
          <p className="text-slate-600 dark:text-blue-100/60 max-w-xl mx-auto text-lg leading-relaxed">
            Modular, biological, and transparent — the same stack powers everything from 300k-person cities to small island communities.
          </p>
        </div>

        {/* 2×2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pillars.map((pillar, i) => {
            const IconComponent = ICON_MAP[pillar.icon]
            return (
              <div
                key={pillar.id}
                className="group relative"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateY(0)' : 'translateY(24px)',
                  transition: `all 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.12}s`,
                }}
              >
                {/* Glass card with hover lift */}
                <div className="h-full p-6 sm:p-8 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:border-blue-400/50 dark:hover:border-blue-400/25 shadow-sm dark:shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-md dark:hover:shadow-[0_8px_40px_rgba(0,0,0,0.10)] transition-all duration-500 hover:-translate-y-1">
                  {/* Icon + title row */}
                  <div className="flex items-center gap-4 mb-4">
                    <GlassPill as="div" className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-400/20 flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                      {IconComponent && <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-300" />}
                    </GlassPill>
                    <h3 className="text-lg sm:text-xl font-heading font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-200 transition-colors duration-300">
                      {pillar.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 dark:text-blue-100/50 leading-relaxed mb-5">
                    {renderWithTooltips(pillar.description)}
                  </p>

                  {/* Technology tags with liquid glass */}
                  <div className="flex flex-wrap gap-2">
                    {pillar.tags.map((tag) => (
                      <GlassPill
                        key={tag}
                        className="px-3 py-1 text-xs font-mono rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/15 text-blue-700 dark:text-blue-300/80"
                      >
                        {tag}
                      </GlassPill>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
