import type { TechnologyAndApproachProps } from '@/../product/sections/technology-and-approach/types'
import { TechnologyCarouselSection } from './TechnologyCarouselSection'
import { ProcessFlowSection } from './ProcessFlowSection'
import { ComparisonSection } from './ComparisonSection'
import { TechnologyGridSection } from './TechnologyGridSection'
import { LiveDashboardSection } from './LiveDashboardSection'

export function TechnologyView({
  carousel,
  processSteps,
  comparison,
  technologyPillars,
  liveMetrics,
}: TechnologyAndApproachProps) {
  return (
    <div>
      {/* Carousel — interactive icon video previews */}
      <TechnologyCarouselSection
        eyebrow={carousel.eyebrow}
        steps={carousel.steps}
        videoHoldDuration={carousel.videoHoldDuration}
      />

      {/* Process flow — emerald */}
      <ProcessFlowSection steps={processSteps} />

      {/* Comparison — amber */}
      <ComparisonSection comparison={comparison} />

      {/* Tech grid — blue */}
      <TechnologyGridSection pillars={technologyPillars} />

      {/* Live dashboard — slate */}
      <LiveDashboardSection liveMetrics={liveMetrics} />
    </div>
  )
}
