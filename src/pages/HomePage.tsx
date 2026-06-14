import { useEffect, useMemo, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { HomeView } from '@/sections/home/components/HomeView'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { HeroPageSkeleton } from '@/components/PageSkeleton'
import { NAV_ITEMS } from '@/lib/navigation'
import { useProjects, usePartners, usePageContent, getPageValue, useCsrProjects } from '@/hooks/use-content'
import { useImpactStats } from '@/hooks/use-impact-stats'
import type { ProjectCard, HeroContent } from '@/../product/sections/home/types'

const FALLBACK_HERO: HeroContent = {
  siteName: 'JCA 1221 Holdings',
  tagline: 'Earth Renewal for Generations',
  description:
    'Philippine environmental infrastructure — restoring coastal ecosystems through nature-mimicking technology and public-private partnerships.',
  backgroundImage: '/images/hero-water.jpg',
  ctaLabel: 'Our Projects',
  ctaHref: '#projects',
}

export function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { projects, loading: projectsLoading } = useProjects()
  const { content, loading: contentLoading } = usePageContent('home')
  const { stats: impactStats, loading: impactLoading } = useImpactStats()
  const { partners } = usePartners()
  const { projects: csrProjects } = useCsrProjects()

  const loading = projectsLoading || contentLoading || impactLoading

  useEffect(() => {
    document.title = 'JCA 1221 Holdings — Environmental Infrastructure'
  }, [])

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: item.href === '/' || location.pathname === item.href,
  }))

  // Hero content — Supabase or fallback
  const hero: HeroContent =
    (getPageValue(content, 'hero', 'content') as HeroContent) ?? FALLBACK_HERO

  // Project cards from Supabase — useMemo to prevent re-mapping on every render
  const projectCards: ProjectCard[] = useMemo(
    () =>
      projects.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        location: p.location,
        status: p.status,
        image: p.hero_image ?? '',
        description: p.short_description,
        award: undefined as unknown as ProjectCard['award'],
        stats: (p.stats ?? []) as { label: string; value: string }[],
      })),
    [projects],
  )

  const handleCtaClick = useCallback(() => {
    const el = document.getElementById('projects')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleSecondaryCtaClick = useCallback(() => {
    const el = document.getElementById('trust-strip')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleProjectClick = useCallback(
    (slug: string) => navigate(`/projects/${slug}`),
    [navigate],
  )

  return (
    <AppShell
      navigationItems={navItems}
      onNavigate={(href) => navigate(href)}
      onCtaClick={() => navigate('/contact')}
    >
      <ErrorBoundary>
        {loading ? (
          <HeroPageSkeleton />
        ) : (
          <HomeView
            hero={hero}
            projectCards={projectCards}
            impactStats={impactStats}
            partners={partners}
            csrProjects={csrProjects}
            onCtaClick={handleCtaClick}
            onSecondaryCtaClick={handleSecondaryCtaClick}
            onProjectClick={handleProjectClick}
          />
        )}
      </ErrorBoundary>
    </AppShell>
  )
}
