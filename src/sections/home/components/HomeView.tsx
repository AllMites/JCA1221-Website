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
      "We restore what's been damaged, for the next generations.",
  },
  {
    title: 'Ingenuity',
    description:
      'Filipino-engineered, customized, innovative solutions, built to last.',
  },
  {
    title: 'Purpose',
    description:
      'We work to fulfill community goals.',
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
  const partnerNames = ['City of Puerto Princesa', 'Mun. of Del Carmen', 'Siargao', 'Gingoog City', 'Samal']

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
