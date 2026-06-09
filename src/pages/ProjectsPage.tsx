import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { ProjectList } from '@/sections/projects-and-track-record/components/ProjectList'
import { CsrSection } from '@/sections/projects-and-track-record/components/CsrSection'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PageSkeleton } from '@/components/PageSkeleton'
import { NAV_ITEMS } from '@/lib/navigation'
import { useProjects, useCsrProjects } from '@/hooks/use-content'
import type { ProjectCard, PortfolioSummary, ProjectStatus, ProjectKeyMetric } from '@/../product/sections/projects-and-track-record/types'

export function ProjectsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { projects, loading } = useProjects()
  const { projects: csrProjects } = useCsrProjects()

  useEffect(() => {
    document.title = 'Projects — JCA 1221 Holdings'
  }, [])

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: location.pathname === item.href,
  }))

  // Map Supabase projects to ProjectCard shape
  const projectCards: ProjectCard[] = projects.map((p) => ({
    id: p.id,
    name: p.name,
    location: p.location,
    status: p.status as ProjectStatus,
    heroImage: p.hero_image ?? '',
    shortDescription: p.short_description,
    keyMetric: ((p.stats && p.stats[0]) ? p.stats[0] : { label: '', value: '' }) as ProjectKeyMetric,
  }))

  // Compute portfolio summary from live project data
  const portfolioSummary: PortfolioSummary = {
    totalWaterTreatedDaily: 4000,
    totalWaterTreatedSuffix: 'm³/day',
    projectsOperational: projects.filter((p) => p.status === 'operational').length,
    projectsInDevelopment: projects.filter((p) => p.status === 'development').length,
    projectsInPlanning: projects.filter((p) => p.status === 'planning').length,
    awardsWon: 1,
    communitiesServed: 3,
  }

  return (
    <AppShell
      navigationItems={navItems}
      onNavigate={(href) => navigate(href)}
      onCtaClick={() => navigate('/contact')}
    >
      <ErrorBoundary>
        {loading ? (
          <PageSkeleton />
        ) : (
          <>
            <ProjectList
              portfolioSummary={portfolioSummary}
              projects={projectCards}
              onProjectClick={(id) => navigate(`/projects/${id}`)}
              onFilterChange={() => {
                // Filter state tracked internally by ProjectList
              }}
            />
            <CsrSection
              projects={csrProjects}
              title="Corporate Social Responsibility"
              subtitle="Our Impact Beyond Infrastructure"
            />
          </>
        )}
      </ErrorBoundary>
    </AppShell>
  )
}
