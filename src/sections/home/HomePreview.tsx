import type { ProjectCard, ImpactStat } from '@/../product/sections/home/types'
import type { Partner, CsrProject } from '@/lib/content-types'
import data from '@/../product/sections/home/data.json'
import { HomeView } from './components/HomeView'

export default function HomePreview() {
  return (
    <HomeView
      hero={data.hero}
      projectCards={data.projectCards as ProjectCard[]}
      impactStats={data.impactStats as ImpactStat[]}
      partners={[] as Partner[]}
      csrProjects={[] as CsrProject[]}
      onCtaClick={() => void 0}
      onSecondaryCtaClick={() => void 0}
      onProjectClick={(id) => void id}
    />
  )
}
