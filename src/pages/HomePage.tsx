import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { HomeView } from '@/sections/home/components/HomeView'
import { PartnerLogoCarousel } from '@/sections/contact-and-partnerships/components/PartnerLogoCarousel'
import { CsrCarousel } from '@/sections/home/components/CsrCarousel'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { HeroPageSkeleton } from '@/components/PageSkeleton'
import { NAV_ITEMS } from '@/lib/navigation'
import { useProjects, usePartners, usePageContent, getPageValue, useCsrProjects } from '@/hooks/use-content'
import { useImpactStats } from '@/hooks/use-impact-stats'
import type { ProjectCard, HeroContent, MissionValue, ImpactStat, Expansion, ProjectAward } from '@/../product/sections/home/types'

const FALLBACK_HERO: HeroContent = {
  siteName: 'JCA 1221 Holdings',
  tagline: 'Earth Renewal for Generations',
  description: 'Philippine environmental infrastructure — restoring coastal ecosystems through nature-mimicking technology and public-private partnerships.',
  backgroundImage: '/images/hero-water.jpg',
  ctaLabel: 'Our Projects',
  ctaHref: '#projects',
}

const FALLBACK_EXPANSION_TITLE = 'Expanding Our Reach'
const FALLBACK_EXPANSION_SUBTITLE = 'From water to land — building the next generation of Philippine environmental infrastructure'

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
  const hero: HeroContent = (getPageValue(content, 'hero', 'content') as HeroContent) ?? FALLBACK_HERO

  // Project cards from Supabase — map to home section shape
  const projectCards: ProjectCard[] = projects.map((p) => ({
    id: p.id,
    name: p.name,
    location: p.location,
    status: p.status,
    image: p.hero_image ?? '',
    description: p.short_description,
    award: undefined as unknown as ProjectAward,
    stats: (p.stats ?? []) as { label: string; value: string }[],
  }))

  // Mission values from page_content
  const missionValues: MissionValue[] = (getPageValue(content, 'mission', 'values') as MissionValue[]) ?? []


  // Expansion from page_content
  const initiatives = (getPageValue(content, 'expansion', 'initiatives') as Expansion['initiatives']) ?? []
  const expansion: Expansion = {
    title: FALLBACK_EXPANSION_TITLE,
    subtitle: FALLBACK_EXPANSION_SUBTITLE,
    initiatives,
  }

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
          <>
            <HomeView
              hero={hero}
              projectCards={projectCards}
              missionValues={missionValues}
              impactStats={impactStats}
              expansion={expansion}
              onCtaClick={() => {
                const el = document.getElementById('projects')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              onProjectClick={(id) => navigate(`/projects/${id}`)}
            />
            <CsrCarousel
              projects={csrProjects}
              title="Community & CSR"
              subtitle="Beyond Infrastructure"
            />
            <PartnerLogoCarousel
              partners={partners}
              title="Our Partners"
              subtitle="Government, private sector, and community organizations working with us across the Philippines"
            />
          </>
        )}
      </ErrorBoundary>
    </AppShell>
  )
}
