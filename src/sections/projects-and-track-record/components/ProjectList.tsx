import { useState, useMemo } from 'react'
import type { ProjectsProps, FilterStatus, ProjectSector } from '@/../product/sections/projects-and-track-record/types'
import { PortfolioSummaryBar } from './PortfolioSummaryBar'
import { ProjectCardItem } from './ProjectCard'
import { ShaderBackground } from '@/components/ShaderBackground'
import { ScrollReveal, RevealItem } from '@/components/ScrollReveal'
import { ArrowUpDown, Search } from 'lucide-react'

type SortKey = 'date' | 'scale'
type SortDir = 'asc' | 'desc'

const FILTER_OPTIONS: { label: string; value: FilterStatus }[] = [
  { label: 'All Projects', value: 'all' },
  { label: 'Operational', value: 'operational' },
  { label: 'In Development', value: 'development' },
  { label: 'Planning', value: 'planning' },
]

const SECTOR_OPTIONS: { label: string; value: ProjectSector | 'all' }[] = [
  { label: 'All Sectors', value: 'all' },
  { label: 'Water', value: 'water' },
  { label: 'Solid Waste', value: 'solid_waste' },
  { label: 'Coastal', value: 'coastal' },
]

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: 'Date', value: 'date' },
  { label: 'Project Scale', value: 'scale' },
]

const FILTER_CAPSULE: Record<string, string> = {
  all: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/30',
  operational: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/50 dark:border-emerald-800/30',
  development: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200/50 dark:border-amber-800/30',
  planning: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/30',
}

const FILTER_INACTIVE =
  'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-[2px_2px_6px_rgba(0,0,0,0.04),-1px_-1px_4px_rgba(255,255,255,0.8)] dark:shadow-[2px_2px_6px_rgba(0,0,0,0.3),-1px_-1px_4px_rgba(255,255,255,0.02)]'

const ACTIVE_SORT_CAPSULE =
  'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200/50 dark:border-blue-800/30'

function parseNumericValue(value: string): number {
  // Extract the first number from strings like "4,000 m³", "15 tons/day", "2,500 m³/day"
  const cleaned = value.replace(/,/g, '')
  const match = cleaned.match(/[\d.]+/)
  return match ? parseFloat(match[0]) : 0
}

export function ProjectList({
  portfolioSummary,
  projects,
  onProjectClick,
  onFilterChange,
}: ProjectsProps) {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all')
  const [activeSector, setActiveSector] = useState<ProjectSector | 'all'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [searchQuery, setSearchQuery] = useState('')

  const handleFilter = (status: FilterStatus) => {
    setActiveFilter(status)
    onFilterChange?.(status)
  }

  const handleSector = (sector: ProjectSector | 'all') => {
    setActiveSector(sector)
  }

  const handleSortKey = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const filteredAndSorted = useMemo(() => {
    let result = [...projects]

    // Filter by status
    if (activeFilter !== 'all') {
      result = result.filter((p) => p.status === activeFilter)
    }

    // Filter by sector
    if (activeSector !== 'all') {
      result = result.filter((p) => p.sector === activeSector)
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          (p.sector && p.sector.replace('_', ' ').includes(q)),
      )
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'date') {
        // Sort by yearStarted (nulls last)
        const aYear = a.yearStarted ?? 0
        const bYear = b.yearStarted ?? 0
        cmp = aYear - bYear
      } else if (sortKey === 'scale') {
        const aScale = parseNumericValue(a.keyMetric.value)
        const bScale = parseNumericValue(b.keyMetric.value)
        cmp = aScale - bScale
      }
      return sortDir === 'desc' ? -cmp : cmp
    })

    return result
  }, [projects, activeFilter, activeSector, sortKey, sortDir, searchQuery])

  return (
    <div className="font-body">
      {/* Portfolio summary counters */}
      <PortfolioSummaryBar summary={portfolioSummary} />

      {/* Section header + filters */}
      <section className="relative py-16 overflow-hidden bg-white dark:bg-slate-950">
        <ShaderBackground variant="light" opacity={0.5} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <ScrollReveal direction="up" className="text-center mb-10">
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
          </ScrollReveal>

          {/* Controls row: search + sector filter + sort */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
            {/* Search input */}
            <div className="relative w-full sm:w-64" id="project-search-container">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                id="project-search"
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 dark:focus:border-blue-500 transition-all"
              />
            </div>

            {/* Sector filter pills */}
            <div className="flex flex-wrap gap-1.5">
              {SECTOR_OPTIONS.map((opt) => {
                const isActive = activeSector === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSector(opt.value)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium font-heading rounded-full border transition-all duration-200 ${
                      isActive
                        ? FILTER_CAPSULE[opt.value] ?? FILTER_CAPSULE.all
                        : FILTER_INACTIVE
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>

            {/* Sort controls */}
            <div className="flex items-center gap-1">
              {SORT_OPTIONS.map((opt) => {
                const isActive = sortKey === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSortKey(opt.value)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium font-heading rounded-full border transition-all duration-200 ${
                      isActive ? ACTIVE_SORT_CAPSULE : FILTER_INACTIVE
                    }`}
                  >
                    {opt.label}
                    {isActive && (
                      <ArrowUpDown
                        size={12}
                        className={sortDir === 'asc' ? 'rotate-180' : ''}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Filter pills — full colored capsule for active (status) */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {FILTER_OPTIONS.map((opt) => {
              const isActive = activeFilter === opt.value

              return (
                <button
                  key={opt.value}
                  onClick={() => handleFilter(opt.value)}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium font-heading rounded-full border transition-all duration-200 ${
                    isActive
                      ? FILTER_CAPSULE[opt.value]
                      : FILTER_INACTIVE
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>

          {/* Project card grid */}
          {filteredAndSorted.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-500 dark:text-slate-400 text-lg font-heading">
                No projects match your search or filters.
              </p>
            </div>
          ) : (
            <ScrollReveal staggerChildren={0.08} viewportMargin="-40px 0px" className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
              {filteredAndSorted.map((project) => (
                <RevealItem key={project.id}>
                  <ProjectCardItem
                    project={project}
                    onClick={() => onProjectClick?.(project.slug)}
                  />
                </RevealItem>
              ))}
            </ScrollReveal>
          )}
        </div>
      </section>
    </div>
  )
}
