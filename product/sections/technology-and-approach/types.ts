export interface ProcessStep {
  /** Step number in the flow (1-based) */
  step: number
  /** Step title */
  title: string
  /** lucide-react icon name */
  icon: string
  /** One-sentence explanation */
  description: string
}

export interface TechnologyStep {
  /** Unique step identifier */
  id: string
  /** Step label shown below icon */
  label: string
  /** Short description shown below video */
  description: string
  /** lucide-react icon name */
  iconName: string
  /** Path to video file (mp4/webm) or empty string for placeholder */
  videoSrc: string
}

export interface TechnologyCarouselData {
  /** Eyebrow text above icon row */
  eyebrow: string
  /** Carousel steps in order */
  steps: TechnologyStep[]
  /** Milliseconds per auto-rotate step (default 5000) */
  videoHoldDuration?: number
}

export interface ComparisonPoint {
  /** What's being compared */
  label: string
  /** JCA's approach description */
  jca: string
  /** Traditional Philippine approach description */
  traditional: string
  /** Whether JCA's approach is superior (for visual check/X indicator) */
  jcaIsBetter: boolean
}

export interface Comparison {
  /** Section title */
  title: string
  /** Section subtitle */
  subtitle: string
  /** Comparison rows */
  points: ComparisonPoint[]
}

export interface TechnologyPillar {
  /** Unique identifier */
  id: string
  /** Pillar title */
  title: string
  /** lucide-react icon name */
  icon: string
  /** 2-3 sentence description */
  description: string
  /** Technology tags for pill display */
  tags: string[]
}

export interface ChartDataPoint {
  /** X-axis label (date, month, quarter, week) */
  label: string
  /** Numeric value */
  value: number
}

export type ChartType = 'line' | 'bar' | 'area'

export interface LiveMetric {
  /** Unique identifier */
  id: string
  /** Metric label */
  label: string
  /** Current displayed value */
  currentValue: string
  /** Unit of measurement */
  unit: string
  /** Context sentence explaining the number */
  context: string
  /** Chart visualization type */
  chartType: ChartType
  /** Data points for chart visualization */
  dataPoints: ChartDataPoint[]
}

export interface LiveMetrics {
  /** Dashboard section title */
  title: string
  /** Dashboard section subtitle */
  subtitle: string
  /** Reference date for "since" calculations (e.g., "January 2024") */
  sinceDate: string
  /** Metric cards for horizontal scroll */
  metrics: LiveMetric[]
}

export interface TechnologyAndApproachProps {
  /** Section title */
  sectionTitle: string
  /** Section subtitle */
  sectionSubtitle: string
  /** Carousel section data (above process flow) */
  carousel: TechnologyCarouselData
  /** Process flow steps (wastewater → clean water) */
  processSteps: ProcessStep[]
  /** JCA vs traditional comparison */
  comparison: Comparison
  /** Core technology pillars */
  technologyPillars: TechnologyPillar[]
  /** Live impact dashboard data */
  liveMetrics: LiveMetrics
}
