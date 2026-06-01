import type { TechnologyAndApproachProps } from '@/../product/sections/technology-and-approach/types'
import { ProcessFlowSection } from './ProcessFlowSection'
import { ComparisonSection } from './ComparisonSection'
import { TechnologyGridSection } from './TechnologyGridSection'
import { LiveDashboardSection } from './LiveDashboardSection'

export function TechnologyView({
  processSteps,
  comparison,
  technologyPillars,
  liveMetrics,
}: TechnologyAndApproachProps) {
  return (
    <div>
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
