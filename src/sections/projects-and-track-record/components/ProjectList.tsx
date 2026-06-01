import { useState } from 'react'
import type { ProjectsProps, FilterStatus } from '@/../product/sections/projects-and-track-record/types'
import { PortfolioSummaryBar } from './PortfolioSummaryBar'
import { ProjectCardItem } from './ProjectCard'
import { ShaderBackground } from '@/components/ShaderBackground'

const FILTER_OPTIONS: { label: string; value: FilterStatus }[] = [
  { label: 'All Projects', value: 'all' },
  { label: 'Operational', value: 'operational' },
  { label: 'In Development', value: 'development' },
  { label: 'Planning', value: 'planning' },
]

const STATUS_DOT: Record<FilterStatus, string> = {
  all: 'bg-slate-400',
  operational: 'bg-emerald-500',
  development: 'bg-amber-500',
  planning: 'bg-blue-400',
}

export function ProjectList({
  portfolioSummary,
  projects,
  onProjectClick,
  onFilterChange,
}: ProjectsProps) {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all')

  const handleFilter = (status: FilterStatus) => {
    setActiveFilter(status)
    onFilterChange?.(status)
  }

  const filteredProjects =
    activeFilter === 'all'
      ? projects
      : projects.filter((p) => p.status === activeFilter)

  return (
    <div className="font-body">
      {/* Portfolio summary counters */}
      <PortfolioSummaryBar summary={portfolioSummary} />

      {/* Section header + filters */}
      <section className="relative py-16 overflow-hidden bg-white dark:bg-slate-950">
        <ShaderBackground variant="light" opacity={0.5} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-sm font-medium font-heading uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-3">
              Our Portfolio
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 dark:text-white mb-4">
              Projects That Deliver
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-xl mx-auto text-base leading-relaxed">
              Each facility is a public-private partnership built on integrity, delivering measurable
              environmental outcomes for Philippine communities.
            </p>
          </div>

          {/* Filter pills — neumorphic */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {FILTER_OPTIONS.map((opt) => {
              const isActive = activeFilter === opt.value
              const dotColor = STATUS_DOT[opt.value]

              return (
                <button
                  key={opt.value}
                  onClick={() => handleFilter(opt.value)}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium font-heading rounded-full transition-all duration-200 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.06),inset_-1px_-1px_3px_rgba(255,255,255,0.5)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.4),inset_-1px_-1px_2px_rgba(255,255,255,0.05)]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-[2px_2px_6px_rgba(0,0,0,0.04),-1px_-1px_4px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.3),-1px_-1px_4px_rgba(255,255,255,0.02)] hover:shadow-[3px_3px_8px_rgba(0,0,0,0.06),-2px_-2px_6px_rgba(255,255,255,0.9)] dark:hover:shadow-[3px_3px_8px_rgba(0,0,0,0.4),-2px_-2px_6px_rgba(255,255,255,0.03)]'
                  }`}
                >
                  {opt.value !== 'all' && (
                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                  )}
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* Project card grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 dark:text-slate-400 text-lg font-heading">
                No projects match this filter.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
              {filteredProjects.map((project) => (
                <ProjectCardItem
                  key={project.id}
                  project={project}
                  onClick={() => onProjectClick?.(project.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
