// src/sections/home/components/HomeView.tsx
import { HeroSection } from './HeroSection'
import { TrustStrip } from './TrustStrip'
import { MissionPillars } from './MissionPillars'
import { FeaturedProjects } from './FeaturedProjects'
import { TrustWall } from './TrustWall'
import { CsrCarousel } from './CsrCarousel'
import { FinalCta } from './FinalCta'
import type { HeroContent, ProjectCard, ImpactStat } from '@/../product/sections/home/types'
import type { Partner, CsrProject } from '@/lib/content-types'

export interface NewHomeViewProps {
  hero: HeroContent
  projectCards: ProjectCard[]
  impactStats: ImpactStat[]
  partners: Partner[]
  csrProjects: CsrProject[]
  onCtaClick?: () => void
  onSecondaryCtaClick?: () => void
  onProjectClick?: (projectId: string) => void
}

const PILLARS = [
  {
    title: 'Stewardship',
    description:
      "We don't own the land or water — we restore what's been damaged, for the next generation.",
  },
  {
    title: 'Ingenuity',
    description:
      'Filipino-engineered solutions that cost 60% less than conventional infrastructure — built to last.',
  },
  {
    title: 'Partnership',
    description:
      'We work with, not for — LGUs, communities, and the private sector share ownership.',
  },
]

export function HomeView({
  hero,
  projectCards,
  impactStats,
  partners,
  csrProjects,
  onCtaClick,
  onSecondaryCtaClick,
}: NewHomeViewProps) {
  const partnerNames = partners.slice(0, 6).map((p) => p.name)

  return (
    <div className="font-body">
      {/* Section 1: Hero */}
      <HeroSection
        hero={hero}
        onCtaClick={onCtaClick}
        onSecondaryCtaClick={onSecondaryCtaClick}
      />

      {/* Section 2: Trust Strip */}
      <TrustStrip stats={impactStats} partnerLogos={partnerNames} />

      {/* Section 3: Mission & Values */}
      <MissionPillars
        tagline="Serbisyo, Hindi Negosyo"
        taglineSub="Service, Not Business — because environmental renewal is infrastructure for human dignity."
        pillars={PILLARS}
      />

      {/* Section 4: Featured Projects */}
      <FeaturedProjects projects={projectCards} />

      {/* Section 5: Trust Wall */}
      <TrustWall partners={partners} />

      {/* Section 6: CSR Spotlight */}
      <CsrCarousel
        projects={csrProjects}
        title="Community & CSR"
        subtitle="Beyond Infrastructure"
      />

      {/* Section 7: Final CTA */}
      <FinalCta contactInfo={{ email: 'contact@jca1221.com', phone: '+63 (2) 1234 5678' }} />
    </div>
  )
}
