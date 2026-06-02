import type { FounderProfile } from '../types'
import { User, Quote } from 'lucide-react'

interface FounderProfileSectionProps {
  profile: FounderProfile
}

export function FounderProfileSection({ profile }: FounderProfileSectionProps) {
  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/30 dark:via-blue-600/20 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium font-heading uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-3">
            Leadership
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 dark:text-white">
            The Founder
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Left column: Photo + Name + Signature quote */}
          <div className="lg:w-[380px] shrink-0">
            <div className="rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 shadow-[0_8px_40px_rgba(59,130,246,0.08)] dark:shadow-[0_8px_40px_rgba(59,130,246,0.04)] p-8 text-center">
              {/* Photo placeholder — glass circle */}
              <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-slate-200 dark:from-blue-900 dark:to-slate-800 border-4 border-white/30 dark:border-white/10 shadow-[0_8px_32px_rgba(59,130,246,0.12)] flex items-center justify-center">
                <User size={40} className="text-blue-400 dark:text-blue-300" />
              </div>

              {/* Name */}
              <h3 className="font-bold font-heading text-xl text-slate-900 dark:text-white mb-1">
                {profile.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {profile.role}
              </p>

              {/* Signature quote */}
              <div className="relative pt-6 border-t border-slate-200 dark:border-slate-800">
                <Quote size={16} className="text-blue-300 dark:text-blue-500 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed font-body">
                  &ldquo;{profile.signatureQuote}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Right column: Quotes + Timeline */}
          <div className="flex-1 space-y-12">
            {/* Pull quotes */}
            <div className="grid sm:grid-cols-3 gap-4">
              {profile.quotes.map((q, i) => (
                <div
                  key={i}
                  className="rounded-2xl backdrop-blur-lg border border-white/20 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5 flex flex-col"
                >
                  <Quote size={14} className="text-blue-400/40 dark:text-blue-500/40 mb-3 shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic mb-4 flex-1 font-body">
                    &ldquo;{q.text}&rdquo;
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-tight">
                    {q.context}
                  </p>
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-4 sm:left-6 top-2 bottom-2 w-px bg-gradient-to-b from-blue-300/60 via-blue-400/60 to-blue-300/60 dark:from-blue-600/40 dark:via-blue-500/40 dark:to-blue-600/40" />

              <div className="space-y-8">
                {profile.milestones.map((m, i) => (
                  <div key={i} className="relative pl-10 sm:pl-14 group">
                    {/* Timeline dot */}
                    <div className="absolute left-[10px] sm:left-[18px] top-1.5 w-3 h-3 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-400 dark:border-blue-500 shadow-[0_0_0_4px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_0_8px_rgba(59,130,246,0.15)] group-hover:border-blue-500 dark:group-hover:border-blue-400 transition-all duration-300" />

                    {/* Milestone card */}
                    <div className="rounded-xl backdrop-blur-sm border border-white/20 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_20px_rgba(59,130,246,0.06)] dark:hover:shadow-[0_4px_20px_rgba(59,130,246,0.04)] hover:-translate-y-0.5 transition-all duration-300 p-4 sm:p-5">
                      <div className="flex items-baseline gap-3 mb-1">
                        <span className="text-xs font-bold font-heading text-blue-500 dark:text-blue-400 tabular-nums">
                          {m.year}
                        </span>
                        <h4 className="font-bold font-heading text-sm text-slate-900 dark:text-white">
                          {m.title}
                        </h4>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {m.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
