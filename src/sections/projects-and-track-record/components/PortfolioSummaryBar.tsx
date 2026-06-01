import { useEffect, useState, useRef } from 'react'
import type { PortfolioSummary } from '@/../product/sections/projects-and-track-record/types'
import { Droplets, Building2, Trophy, Users } from 'lucide-react'

interface PortfolioSummaryBarProps {
  summary: PortfolioSummary
}

interface SummaryStat {
  icon: React.ComponentType<{ size?: number; className?: string }>
  number: number
  suffix: string
  label: string
}

function AnimatedSummaryCounter({ icon: Icon, number: target, suffix, label }: SummaryStat) {
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
      {/* Icon in glass circle */}
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-[0_4px_16px_rgba(59,130,246,0.08)] flex items-center justify-center">
        <Icon size={20} className="text-blue-500 dark:text-blue-400" />
      </div>
      <div className="mb-1 font-bold font-heading text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight tabular-nums">
        {count.toLocaleString()}
        <span className="text-lg sm:text-xl text-blue-500 dark:text-blue-400 ml-1">{suffix}</span>
      </div>
      <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</div>
    </div>
  )
}

export function PortfolioSummaryBar({ summary }: PortfolioSummaryBarProps) {
  const stats: SummaryStat[] = [
    {
      icon: Droplets,
      number: summary.totalWaterTreatedDaily,
      suffix: summary.totalWaterTreatedSuffix,
      label: 'Daily Water Treated',
    },
    {
      icon: Building2,
      number: summary.projectsOperational + summary.projectsInDevelopment + summary.projectsInPlanning,
      suffix: '',
      label: 'Active Projects',
    },
    {
      icon: Trophy,
      number: summary.awardsWon,
      suffix: '',
      label: 'Awards Won',
    },
    {
      icon: Users,
      number: summary.communitiesServed,
      suffix: '',
      label: 'Communities Served',
    },
  ]

  return (
    <section className="relative py-16 sm:py-20 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 dark:via-blue-600/20 to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          {stats.map((stat) => (
            <AnimatedSummaryCounter key={stat.label} {...stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
