import type { ProjectDetailProps, ProjectStatus } from '@/../product/sections/projects-and-track-record/types'
import { MapPin, ArrowLeft, Trophy, Users, Building2, Calendar, Leaf, Zap, Award } from 'lucide-react'
import { ShaderBackground } from '@/components/ShaderBackground'
import { GlassPill } from '@/components/GlassPill'

const STATUS_COLORS: Record<ProjectStatus, string> = {
  operational: 'bg-emerald-500',
  development: 'bg-amber-500',
  planning: 'bg-blue-400',
}

const STATUS_LABELS: Record<ProjectStatus, string> = {
  operational: 'Operational',
  development: 'In Development',
  planning: 'Planning',
}

export function ProjectDetail({ project, onBack }: ProjectDetailProps) {
  const yearRange =
    project.yearStarted
      ? project.yearCompleted
        ? `${project.yearStarted} – ${project.yearCompleted}`
        : `${project.yearStarted} – Present`
      : 'Timeline TBD'

  return (
    <div className="font-body">
      {/* Hero section — full-bleed image with dark overlay */}
      <section className="relative h-[60vh] min-h-[400px] max-h-[600px] overflow-hidden bg-slate-900">
        {/* Hero image — high priority since above the fold */}
        <img
          src={project.heroImage}
          alt={project.name}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient image placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900" />
        <ShaderBackground variant="dark" opacity={0.4} />
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-blue-500 to-blue-800" />

        {/* Dark gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/20" />

        {/* Content */}
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-16">
          {/* Back button */}
          {onBack && (
            <button
              onClick={onBack}
              className="mb-6 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors font-heading font-medium"
            >
              <ArrowLeft size={16} />
              Back to Projects
            </button>
          )}

          {/* Status badge with liquid glass */}
          <div className="mb-4">
            <GlassPill className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 border border-white/20 text-white">
              <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[project.status] ?? 'bg-slate-400'}`} />
              {STATUS_LABELS[project.status] ?? project.status}
            </GlassPill>
          </div>

          {/* Project name */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-white mb-3 max-w-3xl leading-tight">
            {project.name}
          </h1>

          {/* Location + timeline */}
          <div className="flex flex-wrap items-center gap-4 text-slate-300 text-sm">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} />
              {project.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} />
              {yearRange}
            </span>
          </div>
        </div>
      </section>

      {/* Hero description — glass panel bridging hero to content */}
      <section className="relative -mt-8 pb-8 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl backdrop-blur-xl border border-white/20 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 shadow-[0_8px_40px_rgba(59,130,246,0.08)] dark:shadow-[0_8px_40px_rgba(59,130,246,0.04)] p-6 sm:p-8">
            <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-4xl">
              {project.heroDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Key stats row */}
      <section className="relative pb-16 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {project.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl backdrop-blur-lg border border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5 text-center"
              >
                <p className="text-2xl sm:text-3xl font-bold font-heading text-blue-600 dark:text-blue-400 tabular-nums mb-1">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-tight">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology section — distinct colored bg */}
      <section className="relative py-16 sm:py-20 overflow-hidden bg-gradient-to-b from-blue-50/50 to-white dark:from-blue-950/20 dark:to-slate-950">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 dark:via-blue-600/20 to-transparent" />
        <ShaderBackground variant="blue" opacity={0.4} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Zap size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
              Technology & Approach
            </h2>
          </div>

          {/* Glass description card */}
          <div className="mb-8 rounded-2xl backdrop-blur-lg border border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 sm:p-8">
            <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {project.technology.description}
            </p>
          </div>

          {/* Technology tag pills */}
          <div className="flex flex-wrap gap-2">
            {project.technology.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1.5 text-xs font-medium font-heading rounded-full bg-blue-100/80 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/30 dark:border-blue-700/20 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Environmental impact section — emerald green bg */}
      <section className="relative py-16 sm:py-20 overflow-hidden bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-950">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-300/40 dark:via-emerald-600/20 to-transparent" />
        <ShaderBackground variant="emerald" opacity={0.4} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Leaf size={18} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
              Environmental Impact
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {project.impactMetrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl backdrop-blur-lg border border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5 sm:p-6"
              >
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-bold font-heading text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {metric.value}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {metric.label}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {metric.improvement}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards & Partners section — amber gold */}
      <section className="relative py-16 sm:py-20 overflow-hidden bg-gradient-to-b from-amber-50/30 to-white dark:from-amber-950/15 dark:to-slate-950">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 dark:via-amber-600/20 to-transparent" />
        <ShaderBackground variant="amber" opacity={0.4} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10">
            {/* Awards */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <Trophy size={18} className="text-amber-600 dark:text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  Awards & Recognition
                </h2>
              </div>

              {project.awards.length === 0 ? (
                <div className="rounded-2xl backdrop-blur-lg border border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 text-center">
                  <Award size={24} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    No awards yet — this project is still in progress.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {project.awards.map((award, i) => (
                    <div
                      key={i}
                      className="rounded-2xl backdrop-blur-lg border border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5 sm:p-6"
                    >
                      <div className="flex items-start gap-3">
                        <Trophy size={20} className="text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-bold font-heading text-slate-900 dark:text-white text-base mb-1">
                            {award.title}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                            {award.organization}, {award.year}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            {award.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Partners */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <Building2 size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                  Partners
                </h2>
              </div>

              <div className="rounded-2xl backdrop-blur-lg border border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.08)] divide-y divide-slate-200/50 dark:divide-slate-700/30">
                {project.partners.map((partner, i) => (
                  <div key={i} className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Users size={16} className="text-slate-500 dark:text-slate-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                        {partner.name}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                      {partner.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
