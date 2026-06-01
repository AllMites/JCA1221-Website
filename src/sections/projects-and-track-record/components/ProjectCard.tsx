import type { ProjectCard as ProjectCardType, ProjectStatus } from '@/../product/sections/projects-and-track-record/types'
import { MapPin, ArrowRight } from 'lucide-react'
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

interface ProjectCardItemProps {
  project: ProjectCardType
  onClick?: () => void
}

export function ProjectCardItem({ project, onClick }: ProjectCardItemProps) {
  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 transition-all duration-500 cursor-pointer"
    >
      {/* Image area */}
      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-blue-100 to-slate-200 dark:from-blue-950 dark:to-slate-800 overflow-hidden">
        {/* Lazy-loaded project photo */}
        <img
          src={project.heroImage}
          alt={project.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient image placeholder */}
        <div className="absolute inset-0 opacity-30 dark:opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-blue-600 to-blue-900 group-hover:opacity-50 dark:group-hover:opacity-60 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent dark:from-slate-900/90 dark:via-slate-900/40" />

        {/* Status badge with liquid glass */}
        <div className="absolute top-3 left-3">
          <GlassPill className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 shadow-sm">
            <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[project.status] ?? 'bg-slate-400'}`} />
            {STATUS_LABELS[project.status] ?? project.status}
          </GlassPill>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-blue-950/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <span className="flex items-center gap-2 text-white text-sm font-medium font-heading">
            View Project Details <ArrowRight size={16} />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        {/* Location */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{project.location}</span>
        </div>

        {/* Project name */}
        <h3 className="font-bold font-heading text-slate-900 dark:text-white text-lg leading-tight mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
          {project.name}
        </h3>

        {/* Key metric */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium mb-0.5">
            {project.keyMetric.label}
          </p>
          <p className="text-lg font-bold font-heading text-slate-900 dark:text-white tabular-nums">
            {project.keyMetric.value}
          </p>
        </div>
      </div>
    </button>
  )
}
