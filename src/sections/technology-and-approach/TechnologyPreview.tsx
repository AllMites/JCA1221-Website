import type { LiveMetrics } from '@/../product/sections/technology-and-approach/types'
import data from '@/../product/sections/technology-and-approach/data.json'
import { TechnologyView } from './components/TechnologyView'

export default function TechnologyPreview() {
  return (
    <TechnologyView
      sectionTitle={data.sectionTitle}
      sectionSubtitle={data.sectionSubtitle}
      carousel={data.carousel}
      processSteps={data.processSteps}
      comparison={data.comparison}
      technologyPillars={data.technologyPillars}
      liveMetrics={data.liveMetrics as LiveMetrics}
    />
  )
}
