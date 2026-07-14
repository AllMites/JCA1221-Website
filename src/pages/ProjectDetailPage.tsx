import { PageSEO } from '@/components/PageSEO'
import { useParams, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { ProjectDetail } from '@/sections/projects-and-track-record/components/ProjectDetail'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { DetailPageSkeleton } from '@/components/PageSkeleton'
import { NAV_ITEMS } from '@/lib/navigation'
import { useProject, usePartners } from '@/hooks/use-content'
import type { ProjectDetail as ProjectDetailType, ProjectStatus, ProjectPartner } from '@/../product/sections/projects-and-track-record/types'

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { project, loading: projectLoading } = useProject(projectId ?? '')
  const { partners } = usePartners()

  const loading = projectLoading

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: item.href === '/projects',
  }))


  // Map Supabase project to section ProjectDetail shape
  const mappedProject: ProjectDetailType | null = project ? {
    id: project.id,
    name: project.name,
    location: project.location,
    status: project.status as ProjectStatus,
    heroImage: project.hero_image ?? '',
    heroDescription: project.hero_description,
    shortDescription: project.short_description,
    stats: project.stats ?? [],
    technology: project.technology ?? { description: '', tags: [] },
    impactMetrics: (project.impact_metrics ?? []).map((m) => ({
      label: m.label,
      value: m.value,
      improvement: m.improvement,
    })),
    awards: (project.awards ?? []).map((a) => ({
      title: a.title,
      organization: a.organization,
      year: a.year,
      description: a.description,
    })),
    partners: partners
      .filter((p) => p.project_ids?.includes(project.id))
      .map((p) => ({ name: p.name, type: p.type }) as ProjectPartner),
    yearStarted: project.year_started,
    yearCompleted: project.year_completed,
    galleryImages: project.gallery_images ?? [],
    techWidgets: (project.widgets ?? []) as ProjectDetailType['techWidgets'],
  } : null

  if (!loading && !mappedProject) {
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
            className="px-6 py-3 text-sm font-medium font-heading rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 backdrop-blur-md border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-300"
          >
            Back to Projects
          </button>
        </div>
      </AppShell>
    )
  }

  return (
    <>
      <PageSEO
        title={mappedProject ? `${mappedProject.name} — JCA 1221 Holdings` : 'Projects — JCA 1221 Holdings'}
        description={mappedProject?.shortDescription ?? 'Environmental infrastructure project by JCA 1221 Holdings in the Philippines.'}
        canonical={mappedProject ? `https://jca1221.com/projects/${projectId}` : 'https://jca1221.com/projects'}
      />
      <AppShell
        navigationItems={navItems}
        onNavigate={(href) => navigate(href)}
        onCtaClick={() => navigate('/contact')}
      >
        <ErrorBoundary>
          {loading ? (
            <DetailPageSkeleton />
          ) : mappedProject ? (
            <>
              <Breadcrumbs
                segments={[
                  { label: 'Home', href: '/' },
                  { label: 'Projects', href: '/projects' },
                  { label: mappedProject.name },
                ]}
              />
              <ProjectDetail project={mappedProject} onBack={() => navigate('/projects')} />
            </>
          ) : null}
        </ErrorBoundary>
      </AppShell>
    </>
  )
}
