import { useEffect, useState, useRef } from 'react'
import type { ImpactStat as ImpactStatType } from '../types'
import { ShaderBackground } from '../../shared/ShaderBackground'

interface ImpactStatsProps {
  stats: ImpactStatType[]
}

function AnimatedCounter({ number: target, suffix, label, description }: ImpactStatType & { index: number }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (!hasAnimated) return

    const duration = 2000
    const steps = 60
    const stepDuration = duration / steps
    let currentStep = 0

    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))

      if (currentStep >= steps) {
        setCount(target)
        clearInterval(timer)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [hasAnimated, target])

  return (
    <div ref={ref} className="text-center group">
      <div className="mb-2 font-bold font-heading text-4xl sm:text-5xl md:text-6xl text-white tracking-tight tabular-nums" role="status" aria-live="polite">
        {count.toLocaleString()}
        <span className="text-2xl sm:text-3xl text-blue-400 ml-1">{suffix}</span>
      </div>
      <div className="font-semibold font-heading text-sm sm:text-base text-white mb-1">{label}</div>
      <div className="text-xs sm:text-sm text-blue-300/70 max-w-[200px] mx-auto leading-relaxed">{description}</div>
    </div>
  )
}

export function ImpactStats({ stats }: ImpactStatsProps) {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-slate-900" aria-label="Impact statistics">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950" />
      <ShaderBackground variant="slate" opacity={0.5} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-sm font-medium font-heading uppercase tracking-[0.2em] text-amber-400 mb-3">
            By The Numbers
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-4">
            Measurable Impact
          </h2>
          <p className="text-blue-200/70 max-w-xl mx-auto text-base leading-relaxed">
            Real environmental outcomes, verified by scientists and recognized internationally.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 max-w-4xl mx-auto">
          {stats.map((stat, i) => (
            <AnimatedCounter key={stat.label} {...stat} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
