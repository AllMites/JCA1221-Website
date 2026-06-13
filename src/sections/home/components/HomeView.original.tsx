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
  onShellReveal,
  onShellHide,
}: HomeProps) {
  return (
    <div className="font-body">
      {/* Hero — full screen immersive, edge detection for shell */}
      <HeroSection
        hero={hero}
        onCtaClick={onCtaClick}
        onShellReveal={onShellReveal}
        onShellHide={onShellHide}
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
