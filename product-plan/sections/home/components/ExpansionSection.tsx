import { Construction, MapPin } from 'lucide-react'
import type { Expansion, ExpansionInitiative } from '../types'
import { ShaderBackground } from '../../shared/ShaderBackground'

interface ExpansionSectionProps {
  expansion: Expansion
}

const STATUS_STYLES: Record<string, string> = {
  'In Development': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-300 dark:border-amber-700',
  'Planning & Assessment': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-300 dark:border-blue-700',
  'Completed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700',
}

function InitiativeCard({ initiative }: { initiative: ExpansionInitiative }) {
  return (
    <div className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden hover:shadow-xl transition-all duration-500">
      {/* Image area */}
      <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
        <img
          src={initiative.image}
          alt={initiative.title}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/15 to-amber-500/10 dark:from-blue-500/10 dark:to-amber-500/5" />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <MapPin size={12} />
          <span>{initiative.location}</span>
        </div>

        {/* Title + Status */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="font-bold font-heading text-lg text-slate-900 dark:text-white leading-tight group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-300">
            {initiative.title}
          </h3>
        </div>

        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[initiative.status] ?? ''}`}>
          {initiative.status}
        </span>

        {/* Description */}
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {initiative.description}
        </p>
      </div>
    </div>
  )
}

export function ExpansionSection({ expansion }: ExpansionSectionProps) {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-white dark:bg-slate-950">
      {/* Subtle background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950" />
      <ShaderBackground variant="leaves" opacity={0.5} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-xs font-medium text-amber-700 dark:text-amber-400 mb-4">
            <Construction size={12} />
            Active Growth
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 dark:text-white mb-4">
            {expansion.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
            {expansion.subtitle}
          </p>
        </div>

        {/* Initiative cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {expansion.initiatives.map((initiative) => (
            <InitiativeCard key={initiative.title} initiative={initiative} />
          ))}
        </div>
      </div>
    </section>
  )
}
