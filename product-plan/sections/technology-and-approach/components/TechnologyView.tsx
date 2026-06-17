import type { TechnologyAndApproachProps } from '../types'
import { TechnologyCarouselSection } from './TechnologyCarouselSection'
import { ComparisonSection } from './ComparisonSection'
import { TechnologyGridSection } from './TechnologyGridSection'
import { LiveDashboardSection } from './LiveDashboardSection'

export function TechnologyView({
  sectionTitle,
  sectionSubtitle,
  carousel,
  comparison,
  technologyPillars,
  liveMetrics,
}: TechnologyAndApproachProps) {
  return (
    <div>
      {/* Carousel — merged process flow with interactive video previews */}
      <TechnologyCarouselSection
        title={sectionTitle}
        subtitle={sectionSubtitle}
        eyebrow={carousel.eyebrow}
        steps={carousel.steps}
        videoHoldDuration={carousel.videoHoldDuration}
      />

      {/* Comparison — amber */}
      <ComparisonSection comparison={comparison} />

      {/* Tech grid — blue */}
      <TechnologyGridSection pillars={technologyPillars} />

      {/* Live dashboard — slate */}
      <LiveDashboardSection liveMetrics={liveMetrics} />
    </div>
  )
}
