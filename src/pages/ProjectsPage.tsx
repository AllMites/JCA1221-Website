import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { ProjectList } from '@/sections/projects-and-track-record/components/ProjectList'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NAV_ITEMS } from '@/lib/navigation'
import type { ProjectCard } from '@/../product/sections/projects-and-track-record/types'
import data from '@/../product/sections/projects-and-track-record/data.json'

export function ProjectsPage() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Projects — JCA 1221 Holdings'
  }, [])

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: location.pathname === item.href,
  }))

  return (
    <AppShell
      navigationItems={navItems}
      onNavigate={(href) => navigate(href)}
      onCtaClick={() => navigate('/contact')}
    >
      <ErrorBoundary>
        <ProjectList
        portfolioSummary={data.portfolioSummary}
        projects={data.projects as ProjectCard[]}
        onProjectClick={(id) => navigate(`/projects/${id}`)}
        onFilterChange={() => {
          // Filter state tracked internally by ProjectList
        }}
        />
      </ErrorBoundary>
    </AppShell>
  )
}
