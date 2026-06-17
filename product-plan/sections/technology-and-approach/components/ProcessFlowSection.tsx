import { useRef, useEffect, useState } from 'react'
import * as Icons from 'lucide-react'
import type { ProcessStep } from '../types'
import { ShaderBackground } from '../../shared/ShaderBackground'

interface ProcessFlowSectionProps {
  steps: ProcessStep[]
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Filter: Icons.Filter,
  Microscope: Icons.Microscope,
  Beaker: Icons.Beaker,
  Sun: Icons.Sun,
  Droplets: Icons.Droplets,
}

export function ProcessFlowSection({ steps }: ProcessFlowSectionProps) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
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

      {/* Atmospheric cyan orbs — radial avoids linear banding */}
      <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-cyan-500/8 blur-[120px]" />
      <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-blue-500/6 blur-[100px]" />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-cyan-400/5 blur-[80px]" />

      {/* Noise dither — breaks residual bands */}
      <ShaderBackground variant="currents" opacity={0.4} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-cyan-300/80 text-sm font-mono tracking-widest uppercase mb-4">
            From Waste to Resource
          </p>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-cyan-100/60 max-w-xl mx-auto text-lg leading-relaxed">
            Five steps from raw wastewater to clean, safe water — powered by nature, guided by engineering.
          </p>
        </div>

        {/* Process flow — horizontal on desktop, vertical on mobile */}
        <div className="relative">
          {/* Connector line — desktop horizontal, mobile vertical */}
          <div
            className="hidden lg:block absolute top-12 left-[calc(10%+2rem)] right-[calc(10%+2rem)] h-0.5"
            style={{
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              transitionDelay: visible ? '0.15s' : '0s',
            }}
          >
            <div className="w-full h-full bg-gradient-to-r from-cyan-500/40 via-cyan-400/60 to-cyan-500/40 rounded-full" />
            {/* Animated glow dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.6)]"
              style={{
                left: visible ? '100%' : '0%',
                transition: 'left 2s cubic-bezier(0.16, 1, 0.3, 1)',
                transitionDelay: '0.5s',
              }}
            />
          </div>

          {/* Mobile vertical connector */}
          <div className="lg:hidden absolute left-8 top-0 bottom-0 w-0.5">
            <div className="w-full h-full bg-gradient-to-b from-cyan-500/40 via-cyan-400/60 to-cyan-500/40 rounded-full" />
          </div>

          {/* Steps */}
          <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-0">
            {steps.map((step, i) => {
              const IconComponent = ICON_MAP[step.icon]
              return (
                <div
                  key={step.step}
                  className="relative flex lg:flex-col items-center gap-6 lg:gap-0 lg:text-center"
                  style={{
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateY(0)' : 'translateY(20px)',
                    transition: `all 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.15}s`,
                  }}
                >
                  {/* Icon circle — glass */}
                  <div className="relative flex-shrink-0 z-10">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-cyan-500/15 backdrop-blur-lg border border-cyan-400/20 flex items-center justify-center shadow-[0_8px_32px_rgba(34,211,238,0.12),0_0_0_1px_rgba(34,211,238,0.08)] group-hover:shadow-[0_8px_32px_rgba(34,211,238,0.2)] transition-shadow duration-300">
                      {IconComponent && <IconComponent className="w-7 h-7 lg:w-8 lg:h-8 text-cyan-300" />}
                    </div>
                    {/* Step number badge */}
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-cyan-500/80 backdrop-blur-sm border border-cyan-400/30 flex items-center justify-center text-xs font-mono font-bold text-white">
                      {step.step}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 lg:mt-6 lg:px-2">
                    <h3 className="text-base lg:text-lg font-heading font-semibold text-white mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-cyan-100/50 leading-relaxed max-w-[14rem] mx-auto">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
