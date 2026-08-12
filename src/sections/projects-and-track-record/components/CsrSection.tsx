import { Heart } from 'lucide-react'
import type { CsrProject } from '@/lib/content-types'
import { ShaderBackground } from '@/components/ShaderBackground'

interface CsrSectionProps {
  projects: CsrProject[]
  title?: string
  subtitle?: string
}

export function CsrSection({ projects, title, subtitle }: CsrSectionProps) {
  if (!projects || projects.length === 0) return null

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

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-card">
          {projects.map((csr) => {
            const stats = (csr.stats as Array<{ label: string; value: string }>) ?? []
            const entries = csr.timeline ?? []

            if (entries.length > 0) {
              return (
                <div
                  key={csr.id}
                  id={csr.slug}
                  className="md:col-span-2 lg:col-span-3 rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-card"
                >
                  {/* Header */}
                  <div className="flex flex-wrap items-center gap-3">
                    {csr.category && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium font-heading rounded-full bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-300 border border-lime-200/50 dark:border-lime-800/30">
                        {csr.category}
                      </span>
                    )}
                    <h3 className="font-bold font-heading text-slate-900 dark:text-white text-card-title leading-tight">
                      {csr.name}
                    </h3>
                    {csr.location && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {csr.location}
                      </span>
                    )}
                  </div>

                  {csr.description && (
                    <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {csr.description}
                    </p>
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

                  {/* Newsletter entries */}
                  <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {entries.map((entry, i) => (
                      <div
                        key={i}
                        className="rounded-card border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4"
                      >
                        <p className="text-[11px] font-medium font-heading uppercase tracking-wider text-lime-600 dark:text-lime-400">
                          {entry.date}
                        </p>
                        <p className="mt-1 text-sm font-semibold font-heading text-slate-900 dark:text-white">
                          {entry.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {entry.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }

            return (
              <div
                key={csr.id}
                id={csr.slug}
                className="group/card h-full flex flex-col rounded-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-lime-400/50 dark:hover:border-lime-500/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-lime-500/10 dark:hover:shadow-lime-500/5 transition-all duration-500"
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
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium font-heading rounded-full border backdrop-blur-sm bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-300 border-lime-200/50 dark:border-lime-800/30">
                        {csr.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-card flex flex-col flex-1">
                  <h3 className="font-bold font-heading text-slate-900 dark:text-white text-card-title leading-tight group-hover/card:text-lime-600 dark:group-hover/card:text-lime-400 transition-colors duration-300">
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

                  {/* Stats */}
                  {stats.length > 0 && (
                    <div className="flex gap-5 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
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
      </div>
    </section>
  )
}
