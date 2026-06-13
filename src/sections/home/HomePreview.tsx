import type { ProjectCard, Expansion } from '@/../product/sections/home/types'
import data from '@/../product/sections/home/data.json'
import { HomeView } from './components/HomeView'

export default function HomePreview() {
  return (
    <HomeView
      hero={data.hero}
      projectCards={data.projectCards as ProjectCard[]}
      missionValues={data.missionValues}
      impactStats={data.impactStats}
      expansion={data.expansion as Expansion}
      onCtaClick={() => void 0}
      onProjectClick={(id) => void id}
    />
  )
}
