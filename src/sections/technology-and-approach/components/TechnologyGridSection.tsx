import { useRef, useEffect, useState } from 'react'
import * as Icons from 'lucide-react'
import type { TechnologyPillar } from '@/../product/sections/technology-and-approach/types'
import { ShaderBackground } from '@/components/ShaderBackground'
import { GlassPill } from '@/components/GlassPill'

interface TechnologyGridSectionProps {
  pillars: TechnologyPillar[]
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Microscope: Icons.Microscope,
  Blocks: Icons.Blocks,
  Zap: Icons.Zap,
  Globe: Icons.Globe,
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
      <div className="absolute inset-0 bg-slate-950" />

      {/* Layered blue atmospheric orbs */}
      <div className="absolute top-10 right-10 w-[30rem] h-[30rem] rounded-full bg-blue-500/8 blur-[150px]" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-blue-400/6 blur-[100px]" />
      <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full bg-blue-600/5 blur-[80px]" />

      {/* Noise dither */}
      <ShaderBackground variant="dots" opacity={0.5} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-blue-300/80 text-sm font-mono tracking-widest uppercase mb-4">
            Core Technology
          </p>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
            Four Pillars of Our Systems
          </h2>
          <p className="text-blue-100/60 max-w-xl mx-auto text-lg leading-relaxed">
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
                <div className="h-full p-6 sm:p-8 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-blue-400/25 shadow-[0_4px_24px_rgba(59,130,246,0.06),0_0_0_1px_rgba(255,255,255,0.03)] hover:shadow-[0_8px_40px_rgba(59,130,246,0.12),0_0_0_1px_rgba(59,130,246,0.1)] transition-all duration-500 hover:-translate-y-1">
                  {/* Icon + title row */}
                  <div className="flex items-center gap-4 mb-4">
                    <GlassPill as="div" className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/15 border border-blue-400/20 flex items-center justify-center shadow-[0_4px_16px_rgba(59,130,246,0.1)]" options={{ refraction: 0.01, bevelDepth: 0.05, bevelWidth: 0.12, specular: true }}>
                      {IconComponent && <IconComponent className="w-6 h-6 text-blue-300" />}
                    </GlassPill>
                    <h3 className="text-lg sm:text-xl font-heading font-bold text-white group-hover:text-blue-200 transition-colors duration-300">
                      {pillar.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-blue-100/50 leading-relaxed mb-5">
                    {pillar.description}
                  </p>

                  {/* Technology tags with liquid glass */}
                  <div className="flex flex-wrap gap-2">
                    {pillar.tags.map((tag) => (
                      <GlassPill
                        key={tag}
                        className="px-3 py-1 text-xs font-mono rounded-full bg-blue-500/10 border border-blue-400/15 text-blue-300/80"
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
