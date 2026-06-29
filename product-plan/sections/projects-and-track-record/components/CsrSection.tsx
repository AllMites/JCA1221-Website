import { useState } from 'react'
import { Heart, Grid3X3, Clock } from 'lucide-react'
import type { CsrProject, CsrTimelineEntry } from '../../shared/content-types'
import { ShaderBackground } from '../../shared/ShaderBackground'

interface CsrSectionProps {
  projects: CsrProject[]
  title?: string
  subtitle?: string
}

type ViewMode = 'grid' | 'timeline'

export function CsrSection({ projects, title, subtitle }: CsrSectionProps) {
  const [view, setView] = useState<ViewMode>('grid')
  const [sdgFilter, setSdgFilter] = useState<string | null>(null)

  if (!projects || projects.length === 0) return null

  // Collect all unique SDG tags for filtering
  const allSdgTags = [...new Set(projects.flatMap((p) => p.sdg_tags ?? []))].sort()

  // Filter projects by selected SDG
  const filtered = sdgFilter
    ? projects.filter((p) => (p.sdg_tags ?? []).includes(sdgFilter))
    : projects

  return (
    <section className="relative py-20 overflow-hidden bg-white dark:bg-slate-950">
      <ShaderBackground variant="light" opacity={0.3} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          {subtitle && (
            <p className="text-sm font-medium font-heading uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400 mb-3">
              {subtitle}
            </p>
          )}
          {title && (
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 dark:text-white mb-4">
              {title}
            </h2>
          )}
          <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
            Beyond infrastructure delivery — our commitment to communities, education, and environmental stewardship across the Philippines.
          </p>
        </div>

        {/* Controls bar: SDG filter + view toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          {/* SDG filter pills */}
          {allSdgTags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSdgFilter(null)}
                className={`px-3 py-1.5 text-xs font-medium font-heading rounded-full border transition-all duration-200 ${
                  sdgFilter === null
                    ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 border-slate-800 dark:border-white'
                    : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                All SDGs
              </button>
              {allSdgTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSdgFilter(tag === sdgFilter ? null : tag)}
                  className={`px-3 py-1.5 text-xs font-medium font-heading rounded-full border transition-all duration-200 ${
                    sdgFilter === tag
                      ? 'bg-lime-400/20 text-lime-700 dark:text-lime-400 border-lime-400/30'
                      : 'bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* View toggle */}
          <div className="flex items-center gap-1 p-1 rounded-full bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setView('grid')}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium font-heading rounded-full transition-all duration-200 ${
                view === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Grid3X3 size={14} />
              Grid
            </button>
            <button
              onClick={() => setView('timeline')}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium font-heading rounded-full transition-all duration-200 ${
                view === 'timeline'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Clock size={14} />
              Timeline
            </button>
          </div>
        </div>

        {/* Grid view */}
        {view === 'grid' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((csr) => {
              const stats = (csr.stats as Array<{ label: string; value: string }>) ?? []
              return (
                <div
                  key={csr.id}
                  id={csr.slug}
                  className="group/card rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-lime-400/50 dark:hover:border-lime-500/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-lime-500/10 dark:hover:shadow-lime-500/5 transition-all duration-500"
                >
                  {/* Hero image */}
                  <div className="relative h-44 bg-gradient-to-br from-lime-100 to-slate-200 dark:from-lime-950 dark:to-slate-800 overflow-hidden">
                    {csr.hero_image ? (
                      <img
                        src={csr.hero_image}
                        alt={csr.name}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Heart size={32} className="text-lime-400/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent dark:from-slate-900/90 dark:via-slate-900/40" />

                    {csr.category && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium font-heading rounded-full border bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-300 border-lime-200/50 dark:border-lime-800/30">
                          {csr.category}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-bold font-heading text-slate-900 dark:text-white text-lg leading-tight group-hover/card:text-lime-600 dark:group-hover/card:text-lime-400 transition-colors duration-300">
                      {csr.name}
                    </h3>

                    {csr.location && (
                      <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {csr.location}
                      </p>
                    )}

                    {csr.description && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {csr.description}
                      </p>
                    )}

                    {/* SDG badges */}
                    {csr.sdg_tags && csr.sdg_tags.length > 0 && (
                      <div className="flex gap-1.5 mt-3 flex-wrap">
                        {csr.sdg_tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 text-[10px] font-semibold font-heading rounded-full bg-lime-400/10 text-lime-700 dark:text-lime-400 border border-lime-400/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    {stats.length > 0 && (
                      <div className="flex gap-5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {stats.slice(0, 3).map((s, i) => (
                          <div key={i}>
                            <p className="text-base font-bold font-heading text-slate-700 dark:text-slate-300">
                              {s.value}
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                              {s.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Timeline view */}
        {view === 'timeline' && (
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-12">
              {filtered.map((csr) => {
                const timeline = (csr.timeline as CsrTimelineEntry[]) ?? []
                return (
                  <div key={csr.id} id={csr.slug} className="relative pl-12">
                    {/* Timeline dot */}
                    <div className="absolute left-3 w-5 h-5 rounded-full border-2 border-lime-400/60 bg-white dark:bg-slate-950 ring-4 ring-lime-400/10" />

                    <div>
                      <span className="text-xs font-medium font-heading uppercase tracking-wider text-lime-600 dark:text-lime-400">
                        {csr.category}
                      </span>
                      <h3 className="mt-1 text-lg font-bold font-heading text-slate-900 dark:text-white">
                        {csr.name}
                      </h3>
                      {csr.location && (
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {csr.location}
                        </p>
                      )}
                      {csr.description && (
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                          {csr.description}
                        </p>
                      )}

                      {/* Sub-timeline entries */}
                      {timeline.length > 0 && (
                        <div className="mt-5 space-y-3">
                          {timeline.map((entry, ei) => (
                            <div key={ei} className="flex gap-4 text-sm">
                              <span className="text-xs font-mono text-slate-400 flex-shrink-0 w-20 pt-0.5">
                                {entry.date}
                              </span>
                              <div>
                                <span className="font-semibold font-heading text-slate-700 dark:text-slate-300">
                                  {entry.title}
                                </span>
                                {entry.description && (
                                  <p className="mt-0.5 text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {entry.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* SDG badges in timeline */}
                      {csr.sdg_tags && csr.sdg_tags.length > 0 && (
                        <div className="flex gap-1.5 mt-4 flex-wrap">
                          {csr.sdg_tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2.5 py-0.5 text-[10px] font-semibold font-heading rounded-full bg-lime-400/10 text-lime-700 dark:text-lime-400 border border-lime-400/20"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-16 font-heading">
            No CSR projects found for this SDG filter.
          </p>
        )}
      </div>
    </section>
  )
}
