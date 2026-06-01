import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { ProjectDetail } from '@/sections/projects-and-track-record/components/ProjectDetail'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NAV_ITEMS } from '@/lib/navigation'
import type { ProjectDetail as ProjectDetailType } from '@/../product/sections/projects-and-track-record/types'
import data from '@/../product/sections/projects-and-track-record/data.json'

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const project = data.projects.find((p) => p.id === projectId)

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: item.href === '/projects',
  }))

  useEffect(() => {
    document.title = project
      ? `${project.name} — JCA 1221 Holdings`
      : 'Project Not Found — JCA 1221 Holdings'
  }, [project])

  if (!project) {
    return (
      <AppShell
        navigationItems={navItems}
        onNavigate={(href) => navigate(href)}
        onCtaClick={() => navigate('/contact')}
      >
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h1 className="text-4xl font-heading font-bold text-slate-300 dark:text-slate-600 mb-4">
            404
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-6">
            Project not found.
          </p>
          <button
            onClick={() => navigate('/projects')}
            className="px-6 py-3 text-sm font-medium font-heading rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 backdrop-blur-md border border-white/20 shadow-[0_4px_16px_rgba(59,130,246,0.25)] transition-all duration-300"
          >
            Back to Projects
          </button>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      navigationItems={navItems}
      onNavigate={(href) => navigate(href)}
      onCtaClick={() => navigate('/contact')}
    >
      <ErrorBoundary>
        <Breadcrumbs
          segments={[
            { label: 'Home', href: '/' },
            { label: 'Projects', href: '/projects' },
            { label: project.name },
          ]}
        />
        <ProjectDetail project={project as ProjectDetailType} onBack={() => navigate('/projects')} />
      </ErrorBoundary>
    </AppShell>
  )
}
