import data from '@/../product/sections/technology-and-approach/data.json'
import { TechnologyView } from './components/TechnologyView'

export default function TechnologyPreview() {
  return (
    <TechnologyView
      sectionTitle={data.sectionTitle}
      sectionSubtitle={data.sectionSubtitle}
      processSteps={data.processSteps}
      comparison={data.comparison}
      technologyPillars={data.technologyPillars}
      liveMetrics={data.liveMetrics}
    />
  )
}
