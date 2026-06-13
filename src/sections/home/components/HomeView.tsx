import type { HomeProps } from '@/../product/sections/home/types'
import { HeroSection } from './HeroSection'
import { ProjectCarousel } from './ProjectCarousel'
import { MissionSection } from './MissionSection'
import { ImpactStats } from './ImpactStats'
import { ExpansionSection } from './ExpansionSection'

export function HomeView({
  hero,
  projectCards,
  missionValues,
  impactStats,
  expansion,
  onCtaClick,
  onProjectClick,
}: HomeProps) {
  return (
    <div className="font-body">
      {/* Hero — full screen immersive */}
      <HeroSection
        hero={hero}
        onCtaClick={onCtaClick}
        onSecondaryCtaClick={undefined}
      />

      {/* Projects carousel — horizontal scroll, dark background */}
      <ProjectCarousel
        projects={projectCards}
        onProjectClick={onProjectClick}
      />

      {/* Mission & Values — light blue-tinted background */}
      <MissionSection values={missionValues} />

      {/* Impact stats — dark background, animated counters */}
      <ImpactStats stats={impactStats} />

      {/* Expansion — light background, future initiatives */}
      <ExpansionSection expansion={expansion} />
    </div>
  )
}
