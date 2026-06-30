import { useState } from 'react'
import { ScrollReveal, RevealItem } from '@/components/ScrollReveal'
import type { TechWidget } from '@/lib/content-types'

interface TechWidgetsSectionProps {
  widgets: TechWidget[]
}

export function TechWidgetsSection({ widgets }: TechWidgetsSectionProps) {
  if (!widgets || widgets.length === 0) return null

  const sorted = [...widgets].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))

  return (
    <div className="space-y-16 py-16">
      {sorted.map((widget) => (
        <div key={widget.id} className="scroll-mt-20" id={`widget-${widget.id}`}>
          {widget.title && (
            <div className="mb-6">
              <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
                {widget.title}
              </h3>
              {widget.description && (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                  {widget.description}
                </p>
              )}
            </div>
          )}
          <WidgetContent widget={widget} />
        </div>
      ))}
    </div>
  )
}

function WidgetContent({ widget }: { widget: TechWidget }) {
  switch (widget.widget_type) {
    case 'process_flow':
      return <ProcessFlowDisplay config={widget.config as Record<string, unknown>} />
    case 'comparison_table':
      return <ComparisonTableDisplay config={widget.config as Record<string, unknown>} />
    case 'video_carousel':
      return <VideoCarouselDisplay config={widget.config as Record<string, unknown>} />
    case 'monitoring':
      return <MonitoringDisplay config={widget.config as Record<string, unknown>} />
    case 'visitor_portfolio':
      return <VisitorPortfolioDisplay config={widget.config as Record<string, unknown>} />
    default:
      return null
  }
}

// ─── Process Flow — vertical steps with connecting line ───

interface ProcessStep {
  label: string
  description?: string
  icon?: string
}

function ProcessFlowDisplay({ config }: { config: Record<string, unknown> }) {
  const steps: ProcessStep[] = (config?.steps as ProcessStep[]) ?? []

  if (steps.length === 0) return <p className="text-sm text-slate-400">No steps configured.</p>

  return (
    <div className="relative">
      <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200 dark:bg-white/10" />
      <div className="space-y-8">
        {steps.map((step, i) => (
          <div key={i} className="relative flex gap-4 pl-10">
            <div className="absolute left-3.5 w-4 h-4 rounded-full border-2 border-lime-400/60 bg-white dark:bg-black ring-4 ring-lime-400/10" />
            <div className="pt-0.5">
              <h4 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                {step.icon && <span className="mr-2">{step.icon}</span>}
                {step.label}
              </h4>
              {step.description && (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Comparison Table — responsive table ───

interface ComparisonRow {
  label: string
  values: string[]
}

function ComparisonTableDisplay({ config }: { config: Record<string, unknown> }) {
  const headers: string[] = (config?.headers as string[]) ?? []
  const rows: ComparisonRow[] = (config?.rows as ComparisonRow[]) ?? []

  if (rows.length === 0) return <p className="text-sm text-slate-400">No comparison data.</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10">
            {headers.map((h, i) => (
              <th key={i} className={`py-3 text-left font-medium text-slate-500 dark:text-slate-400 ${i === 0 ? 'pr-8' : 'px-4'}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={`border-b border-slate-100 dark:border-white/5 ${ri % 2 === 1 ? 'bg-slate-50/50 dark:bg-white/[0.02]' : ''}`}>
              <td className="py-3 pr-8 font-medium text-slate-700 dark:text-slate-300">{row.label}</td>
              {row.values.map((v, vi) => (
                <td key={vi} className="py-3 px-4 text-slate-600 dark:text-slate-400">{v}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Video Carousel — horizontal scroll with cards ───

interface VideoItem {
  title: string
  thumbnail?: string
  url?: string
  duration?: string
}

function VideoCarouselDisplay({ config }: { config: Record<string, unknown> }) {
  const videos: VideoItem[] = (config?.videos as VideoItem[]) ?? []

  if (videos.length === 0) return <p className="text-sm text-slate-400">No videos.</p>

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin">
      {videos.map((v, i) => (
        <a
          key={i}
          href={v.url ?? '#'}
          target={v.url ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="flex-shrink-0 w-72 snap-start group"
        >
          <div className="aspect-video rounded-xl bg-slate-200 dark:bg-white/5 overflow-hidden border border-slate-200 dark:border-white/10">
            {v.thumbnail ? (
              <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
          </div>
          <div className="mt-2">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-lime-500 transition-colors">
              {v.title}
            </p>
            {v.duration && <p className="text-[11px] text-slate-400">{v.duration}</p>}
          </div>
        </a>
      ))}
    </div>
  )
}

// ─── Monitoring Dashboard — metric cards ───

interface MetricItem {
  label: string
  value: string
  unit?: string
  trend?: 'up' | 'down' | 'steady'
}

function MonitoringDisplay({ config }: { config: Record<string, unknown> }) {
  const metrics: MetricItem[] = (config?.metrics as MetricItem[]) ?? []

  if (metrics.length === 0) return <p className="text-sm text-slate-400">No monitoring data.</p>

  const trendIcons: Record<string, string> = {
    up: '↑',
    down: '↓',
    steady: '→',
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((m, i) => (
        <div
          key={i}
          className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5"
        >
          <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">{m.label}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
              {m.value}
            </span>
            {m.unit && (
              <span className="text-xs text-slate-400">{m.unit}</span>
            )}
          </div>
          {m.trend && (
            <p className={`text-[11px] mt-1 ${
              m.trend === 'up' ? 'text-lime-500' :
              m.trend === 'down' ? 'text-red-400' :
              'text-slate-400'
            }`}>
              {trendIcons[m.trend]} {m.trend}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Visitor Portfolio — category tabs with entry cards ───

interface VisitorCategory {
  id: string
  label: string
  subtitle?: string
  icon: string
  entries: VisitorEntry[]
  stats?: { label: string; value: string }[]
}

interface VisitorEntry {
  organization: string
  date: string
  visitors?: string
  purpose: string
  highlights: string[]
  impact: string
  referenceUrl?: string
}

function VisitorPortfolioDisplay({ config }: { config: Record<string, unknown> }) {
  const categories: VisitorCategory[] = (config?.categories as VisitorCategory[]) ?? []
  const [activeCategory, setActiveCategory] = useState<string>(categories.length > 0 ? categories[0].id : '')

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-slate-400 dark:text-slate-500">No visitor data available</p>
      </div>
    )
  }

  const activeCat = categories.find((c) => c.id === activeCategory) ?? categories[0]

  return (
    <div>
      {/* Category tabs — horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 snap-start whitespace-nowrap transition-all duration-200 ${
              activeCategory === cat.id
                ? 'bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200/30 dark:border-amber-700/20 px-4 py-2 text-sm font-heading rounded-full'
                : 'bg-slate-100/50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-transparent px-4 py-2 text-sm font-heading rounded-full'
            }`}
          >
            <span className="mr-1.5">{cat.icon}</span>
            {cat.label}
            {cat.subtitle && (
              <span className="ml-1.5 text-[11px] opacity-60">{cat.subtitle}</span>
            )}
          </button>
        ))}
      </div>

      {/* Active category content */}
      <ScrollReveal staggerChildren={0.08}>
        {/* Stats row */}
        {activeCat.stats && activeCat.stats.length > 0 && (
          <RevealItem>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {activeCat.stats.map((stat, si) => (
                <div
                  key={si}
                  className="rounded-xl backdrop-blur-lg border border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-4 text-center"
                >
                  <p className="text-xl font-heading font-bold text-amber-600 dark:text-amber-400">
                    {stat.value}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </RevealItem>
        )}

        {/* Entry cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCat.entries.map((entry, ei) => (
            <RevealItem key={ei}>
              <div className="rounded-xl backdrop-blur-lg border border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5 sm:p-6 h-full flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
                      {entry.organization}
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      {entry.date}
                    </p>
                  </div>
                  {entry.visitors && (
                    <span className="flex-shrink-0 text-[11px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-full">
                      {entry.visitors}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                  {entry.purpose}
                </p>

                {/* Highlights as tag pills */}
                {entry.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {entry.highlights.map((h, hi) => (
                      <span
                        key={hi}
                        className="px-2.5 py-1 text-[11px] rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-auto">
                  &ldquo;{entry.impact}&rdquo;
                </p>

                {entry.referenceUrl && (
                  <a
                    href={entry.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-xs text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1"
                  >
                    View reference
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </RevealItem>
          ))}
        </div>

        {/* Empty state for active category with no entries */}
        {activeCat.entries.length === 0 && (
          <RevealItem>
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-slate-400 dark:text-slate-500">No visitor data available</p>
            </div>
          </RevealItem>
        )}
      </ScrollReveal>
    </div>
  )
}
