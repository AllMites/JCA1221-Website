import { HeartHandshake, ShieldCheck, Scale, Leaf } from 'lucide-react'
import type { MissionValue } from '../types'

interface MissionSectionProps {
  values: MissionValue[]
}

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  HeartHandshake,
  ShieldCheck,
  Scale,
  Leaf,
}

function MissionCard({ value }: { value: MissionValue }) {
  const IconComponent = ICON_MAP[value.icon] ?? Leaf

  return (
    <div className="group relative p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-500">
      {/* Icon */}
      <div className="mb-4 w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 transition-colors duration-500">
        <IconComponent size={22} className="text-blue-600 dark:text-blue-400" />
      </div>

      {/* Title */}
      <h3 className="font-bold font-heading text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
        {value.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        {value.description}
      </p>
    </div>
  )
}

export function MissionSection({ values }: MissionSectionProps) {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-amber-50/30 dark:bg-slate-950">
      {/* Background — warm cream/earth tone, distinct from dark carousel */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50/60 via-amber-50/20 to-white dark:from-amber-950/20 dark:via-slate-950 dark:to-slate-950" />

      {/* Warm decorative line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 dark:via-amber-600 to-transparent opacity-40" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <p className="text-sm font-medium font-heading uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-3">
            What We Stand For
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 dark:text-white mb-4">
            Mission & Values
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
            Our principles guide every project, every partnership, and every decision.
          </p>
        </div>

        {/* Stacked value cards */}
        <div className="flex flex-col gap-4 max-w-2xl mx-auto">
          {values.map((value) => (
            <MissionCard key={value.title} value={value} />
          ))}
        </div>
      </div>
    </section>
  )
}
