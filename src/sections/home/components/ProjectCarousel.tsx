import { MapPin, ArrowRight, ArrowUpRight, CheckCircle2, Wrench, ClipboardCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ProjectCard as ProjectCardType } from '@/../product/sections/home/types'
import { ShaderBackground } from '@/components/ShaderBackground'

interface ProjectCarouselProps {
  projects: ProjectCardType[]
  onProjectClick?: (projectId: string) => void
}

const STATUS_CAPSULE: Record<string, { label: string; icon: LucideIcon; className: string }> = {
  operational: {
    label: 'Operational',
    icon: CheckCircle2,
    className: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/30',
  },
  development: {
    label: 'In Development',
    icon: Wrench,
    className: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/30',
  },
  planning: {
    label: 'Planning',
    icon: ClipboardCheck,
    className: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/30',
  },
}

function ProjectCardItem({ project, onClick }: { project: ProjectCardType; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group/card flex-shrink-0 w-[380px] sm:w-[420px] text-left rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-blue-400/50 dark:hover:border-blue-500/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 transition-all duration-500 cursor-pointer"
    >
      {/* Image area */}
      <div className="relative h-52 bg-gradient-to-br from-blue-100 to-slate-200 dark:from-blue-950 dark:to-slate-800 overflow-hidden">
        {/* Lazy-loaded project photo — gradient serves as background fill while loading */}
        <img
          src={project.image}
          alt={project.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient fallback image */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-950/30 to-slate-950/30 group-hover/card:opacity-60 dark:group-hover/card:opacity-70 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent dark:from-slate-900/90 dark:via-slate-900/40" />

        {/* Status capsule — full colored pill matching news style */}
        <div className="absolute top-3 left-3">
          {(() => {
            const c = STATUS_CAPSULE[project.status]
            const Icon = c.icon
            return (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium font-heading rounded-full border backdrop-blur-sm ${c.className}`}>
                <Icon size={12} />
                {c.label}
              </span>
            )
          })()}
        </div>

        {/* Hover overlay — award + stats */}
        <div className="absolute inset-0 bg-blue-950/80 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex flex-col justify-center px-6 py-4 text-white">
          {project.award && (
            <div className="mb-4">
              <p className="text-xs uppercase tracking-wider text-amber-400 font-medium mb-1">Award</p>
              <p className="text-sm font-semibold leading-snug">{project.award.title}</p>
              <p className="text-xs text-blue-300 mt-0.5">{project.award.organization}, {project.award.year}</p>
            </div>
          )}
          {project.stats.length > 0 && (
            <div className="flex gap-6">
              {project.stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-lg font-bold font-heading">{stat.value}</p>
                  <p className="text-xs text-blue-300">{stat.label}</p>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 flex items-center gap-1 text-xs text-blue-300 opacity-0 group-hover/card:opacity-100 transition-opacity delay-200">
            View project details <ArrowUpRight size={12} />
          </div>
        </div>
      </div>

      {/* Content — always visible */}
      <div className="p-5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-2">
          <MapPin size={12} />
          <span className="truncate">{project.location}</span>
        </div>

        <h3 className="font-bold font-heading text-slate-900 dark:text-white text-lg leading-tight group-hover/card:text-blue-600 dark:group-hover/card:text-blue-400 transition-colors duration-300">
          {project.name}
        </h3>
      </div>
    </button>
  )
}

export function ProjectCarousel({ projects, onProjectClick }: ProjectCarouselProps) {
  return (
    <section id="projects" className="relative py-20 overflow-hidden bg-slate-900 dark:bg-black">
      {/* Section background texture */}
      <ShaderBackground variant="ripples" opacity={0.6} />

      {/* Section header */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <p className="text-sm font-medium font-heading uppercase tracking-[0.2em] text-blue-400 mb-3">
          Track Record
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-4">
          Projects That Restore Ecosystems
        </h2>
        <p className="text-blue-200/70 max-w-xl text-base leading-relaxed">
          Each facility is a public-private partnership built on integrity, delivering measurable
          environmental outcomes for Philippine communities.
        </p>
      </div>

      {/* Horizontal scroll container */}
      <div className="relative z-10 overflow-x-auto overscroll-x-contain pb-2">
        <div
          className="flex gap-5 px-4 sm:px-6 lg:px-8 pb-4 snap-x snap-mandatory"
          style={{ scrollPaddingInline: 'calc((100vw - 1280px) / 2 + 2rem)', paddingLeft: 'max(1rem, calc((100vw - 1280px) / 2 + 2rem))', paddingRight: 'max(1rem, calc((100vw - 1280px) / 2 + 2rem))' }}
        >
          {projects.map((project) => (
            <div key={project.id} className="snap-start">
              <ProjectCardItem
                project={project}
                onClick={() => onProjectClick?.(project.slug)}
              />
            </div>
          ))}

          {/* End hint card */}
          <div className="flex-shrink-0 w-[280px] flex items-center justify-center rounded-2xl border border-dashed border-slate-700 dark:border-slate-800 bg-slate-800/30">
            <div className="text-center p-6">
              <ArrowRight size={24} className="text-slate-600 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-heading">
                More projects coming online
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
