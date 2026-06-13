// src/sections/home/components/FeaturedProjects.tsx
import { useRef, useCallback, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, ArrowRight } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'
import { ScrollReveal, RevealItem } from '@/components/ScrollReveal'
import type { ProjectCard } from '@/../product/sections/home/types'

interface FeaturedProjectsProps {
  projects: ProjectCard[]
}

function statusDotColor(status: string): string {
  switch (status) {
    case 'operational':
      return 'bg-emerald-400'
    case 'development':
      return 'bg-amber-400'
    default:
      return 'bg-slate-400'
  }
}

/** Max rotation in degrees — subtle, boardroom-safe */
const TILT_DEGREES = 5

function TiltCard({ project }: { project: ProjectCard }) {
  const reducedMotion = useReducedMotion()
  const ref = useRef<HTMLAnchorElement>(null)
  const metrics = (project.stats ?? []).slice(0, 2)

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (reducedMotion || !ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5  // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5   // -0.5 to 0.5
      ref.current.style.transform = `perspective(800px) rotateY(${x * TILT_DEGREES}deg) rotateX(${-y * TILT_DEGREES}deg) scale(1.02)`
      // Shadow follows tilt direction
      ref.current.style.boxShadow = `${-x * 12}px ${-y * 12}px 30px rgba(0,0,0,0.06)`
    },
    [reducedMotion],
  )

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)'
    ref.current.style.boxShadow = ''
    ref.current.style.transition = 'transform 0.4s ease-out, box-shadow 0.4s ease-out'
  }, [])

  const handleMouseEnter = useCallback(() => {
    if (!ref.current) return
    ref.current.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out'
  }, [])

  return (
    <Link
      ref={ref}
      to={`/projects/${project.id}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group block rounded-xl overflow-hidden
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm
        border border-white/20 dark:border-white/10
        shadow-sm
        transition-colors duration-200 ease-out
        [transform-style:preserve-3d]"
      style={{ perspective: '800px' }}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden bg-slate-200 dark:bg-slate-800">
        {project.image ? (
          <img
            src={project.image}
            alt={project.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <MapPin size={32} className="text-slate-300 dark:text-slate-600" />
          </div>
        )}

        {/* Status dot */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-white/10 text-xs font-medium font-heading text-slate-700 dark:text-slate-300">
          <span className={`w-2 h-2 rounded-full ${statusDotColor(project.status)}`} />
          {project.status}
        </div>
      </div>

      {/* Content */}
      <div className="p-5" style={{ transform: 'translateZ(0)' }}>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1.5">
          <MapPin size={12} />
          {project.location}
        </div>

        <h3 className="font-bold font-heading text-lg text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {project.name}
        </h3>

        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
          {project.description}
        </p>

        {/* Mini stats */}
        {metrics.length > 0 && (
          <div className="flex gap-5 pt-3 border-t border-slate-200 dark:border-slate-800">
            {metrics.map((m, i) => (
              <div key={i}>
                <p className="text-base font-bold font-heading text-slate-700 dark:text-slate-300">
                  {m.value}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  if (!projects || projects.length === 0) return null

  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <ScrollReveal direction="up" duration={0.5}>
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm font-medium font-heading uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 mb-3">
                By The Numbers
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 dark:text-white">
                Proven Impact
              </h2>
            </div>
            <Link
              to="/projects"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium font-heading text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              View All Projects
              <ArrowRight size={16} />
            </Link>
          </div>
        </ScrollReveal>

        {/* Project cards — staggered reveal */}
        <ScrollReveal staggerChildren={0.1} viewportMargin="-40px 0px">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((project) => (
              <RevealItem key={project.id}>
                <TiltCard project={project} />
              </RevealItem>
            ))}
          </div>
        </ScrollReveal>

        {/* Mobile "View All" link */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-medium font-heading text-blue-600 dark:text-blue-400"
          >
            View All Projects
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  )
}
