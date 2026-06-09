export type ProjectStatus = 'operational' | 'development' | 'planning'

export type FilterStatus = 'all' | ProjectStatus

export interface ProjectStat {
  /** Metric label */
  label: string
  /** Metric value (can include units) */
  value: string
}

export interface ProjectImpactMetric {
  /** Metric label */
  label: string
  /** Current or projected value */
  value: string
  /** What improved or will improve */
  improvement: string
}

export interface ProjectAward {
  /** Award title */
  title: string
  /** Granting organization */
  organization: string
  /** Year awarded */
  year: number
  /** Short description of what the award recognized */
  description: string
}

export interface ProjectPartner {
  /** Partner organization name */
  name: string
  /** Partner type (LGU, national agency, community org, etc.) */
  type: string
}

export interface ProjectTechnology {
  /** 2-3 sentence overview of the treatment approach */
  description: string
  /** Technology tags for pill display */
  tags: string[]
}

export interface ProjectKeyMetric {
  /** Metric label shown on card */
  label: string
  /** Metric value shown on card */
  value: string
}

export interface ProjectCard {
  /** Unique project identifier */
  id: string
  /** Project name */
  name: string
  /** City/province location */
  location: string
  /** Current project status */
  status: ProjectStatus
  /** Path to card thumbnail image */
  heroImage: string
  /** One-line project summary for the card */
  shortDescription: string
  /** Single key metric displayed prominently on the card */
  keyMetric: ProjectKeyMetric
}

export interface TechWidget {
  id: string
  project_id: string
  widget_type: 'process_flow' | 'comparison_table' | 'video_carousel' | 'monitoring'
  title: string | null
  description: string | null
  config: Record<string, unknown>
  order: number
  published: boolean
}

export interface ProjectDetail {
  /** Unique project identifier */
  id: string
  /** Project name */
  name: string
  /** City/province location */
  location: string
  /** Current project status */
  status: ProjectStatus
  /** Full-width hero background image */
  heroImage: string
  /** 1-2 sentence hero description overlaid on image */
  heroDescription: string
  /** One-line summary */
  shortDescription: string
  /** Key statistic cards (3-4) */
  stats: ProjectStat[]
  /** Technology overview */
  technology: ProjectTechnology
  /** Environmental impact before/after metrics */
  impactMetrics: ProjectImpactMetric[]
  /** Awards and recognition (can be empty array) */
  awards: ProjectAward[]
  /** Project partners */
  partners: ProjectPartner[]
  /** Year project started */
  yearStarted: number | null
  /** Year project completed (null if ongoing) */
  yearCompleted: number | null
  /** Gallery image paths */
  galleryImages: string[]
  /** Technology widgets (process flow, comparison, video, monitoring) */
  techWidgets?: TechWidget[]
}

export interface PortfolioSummary {
  /** Aggregate daily water treated across all projects */
  totalWaterTreatedDaily: number
  /** Suffix for the water treated stat (e.g., "m³/day") */
  totalWaterTreatedSuffix: string
  /** Number of operational projects */
  projectsOperational: number
  /** Number of projects in development */
  projectsInDevelopment: number
  /** Number of projects in planning */
  projectsInPlanning: number
  /** Total awards across all projects */
  awardsWon: number
  /** Total communities served */
  communitiesServed: number
}

export interface ProjectsProps {
  /** Portfolio-wide aggregate stats */
  portfolioSummary: PortfolioSummary
  /** Project cards for the filterable grid */
  projects: ProjectCard[]

  /** Callback when a project card is clicked (navigates to detail) */
  onProjectClick?: (projectId: string) => void
  /** Callback when filter status changes */
  onFilterChange?: (status: FilterStatus) => void
}

export interface ProjectDetailProps {
  /** Full project detail data */
  project: ProjectDetail

  /** Callback for back navigation to listing */
  onBack?: () => void
}
