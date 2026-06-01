import data from '@/../product/sections/home/data.json'
import { HomeView } from './components/HomeView'

export default function HomePreview() {
  return (
    <HomeView
      hero={data.hero}
      projectCards={data.projectCards}
      missionValues={data.missionValues}
      impactStats={data.impactStats}
      expansion={data.expansion}
      onCtaClick={() => console.log('CTA: scroll to projects')}
      onProjectClick={(id) => console.log('Navigate to project:', id)}
      onShellReveal={() => console.log('Shell: reveal')}
      onShellHide={() => console.log('Shell: hide')}
    />
  )
}
