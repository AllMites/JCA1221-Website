// =============================================================================
// UI Data Shapes — Combined Reference
//
// These types define the data that UI components expect to receive as props.
// They are a frontend contract, not a database schema. How you model, store,
// and fetch this data is an implementation decision.
// =============================================================================

// -----------------------------------------------------------------------------
// From: sections/home
// -----------------------------------------------------------------------------

export interface HomeHero {
  companyName: string
  tagline: string
  valueStatement: string
  backgroundImageUrl: string
}

export interface ProjectSnapshot {
  id: string
  name: string
  location: string
  imageUrl: string
  status: 'operational' | 'development' | 'planning'
  keyMetric: {
    value: string
    label: string
  }
  award?: {
    title: string
    year: number
  }
}

export interface ImpactStat {
  id: string
  value: number
  suffix?: string
  prefix?: string
  label: string
}

export interface MissionStatement {
  id: string
  title: string
  body: string
  icon: string
}

export interface ExpansionPlan {
  title: string
  description: string
  location: string
  technology: string
  highlights: string[]
  imageUrl: string
}

// -----------------------------------------------------------------------------
// From: sections/about-and-mission
// -----------------------------------------------------------------------------

export interface FounderQuote {
  text: string
  context: string
}

export interface FounderMilestone {
  year: number
  title: string
  description: string
}

export interface FounderProfile {
  name: string
  title: string
  imageUrl: string
  bio: string
  quotes: FounderQuote[]
  milestones: FounderMilestone[]
}

export interface ValueSubPoint {
  title: string
  description: string
}

export interface ValuePillar {
  id: string
  title: string
  icon: string
  description: string
  subPoints: ValueSubPoint[]
  sectionColor: string
  glassTint: string
}

// -----------------------------------------------------------------------------
// From: sections/projects-and-track-record
// -----------------------------------------------------------------------------

export type ProjectStatus = 'operational' | 'development' | 'planning'
export type FilterStatus = 'all' | ProjectStatus

export interface ProjectStat {
  value: string
  label: string
  unit?: string
}

export interface ProjectImpactMetric {
  label: string
  before: string
  after: string
  improvement: string
}

export interface ProjectAward {
  title: string
  organization: string
  year: number
}

export interface ProjectPartner {
  name: string
  type: string
}

export interface ProjectTechnology {
  description: string
  tags: string[]
}

export interface ProjectKeyMetric {
  value: string
  label: string
  unit?: string
}

export interface ProjectCard {
  id: string
  name: string
  location: string
  status: ProjectStatus
  imageUrl: string
  shortDescription: string
  keyMetric: ProjectKeyMetric
  award?: ProjectAward
}

export interface ProjectDetail {
  id: string
  name: string
  location: string
  status: ProjectStatus
  imageUrl: string
  heroDescription: string
  yearStarted?: number
  yearCompleted?: number
  stats: ProjectStat[]
  technology: ProjectTechnology
  impact: ProjectImpactMetric[]
  awards: ProjectAward[]
  partners: ProjectPartner[]
}

export interface PortfolioSummary {
  totalWaterTreated: string
  waterTreatedUnit: string
  projectsOperational: number
  projectsTotal: number
  awardsWon: number
  communitiesServed: number
}

// -----------------------------------------------------------------------------
// From: sections/technology-and-approach
// -----------------------------------------------------------------------------

export interface ProcessStep {
  step: number
  title: string
  icon: string
  description: string
}

export interface ComparisonPoint {
  label: string
  jca: string
  traditional: string
  jcaIsBetter: boolean
}

export interface TechnologyPillar {
  id: string
  title: string
  icon: string
  description: string
  tags: string[]
}

export interface ChartDataPoint {
  label: string
  value: number
}

export type ChartType = 'line' | 'bar' | 'area'

export interface LiveMetric {
  id: string
  label: string
  currentValue: string
  unit: string
  context: string
  chartType: ChartType
  dataPoints: ChartDataPoint[]
}

// -----------------------------------------------------------------------------
// From: sections/contact-and-partnerships
// -----------------------------------------------------------------------------

export interface ContactFormData {
  fullName: string
  email: string
  organization: string
  message: string
  phone?: string
  role?: string
  projectType?: string
  estimatedTimeline?: string
}

export interface TeamContact {
  id: string
  name: string
  title: string
  email: string
  phone: string
  inquiryCategories: string[]
  imageUrl: string
}

export interface OfficeInfo {
  address: string
  city: string
  phone: string
  email: string
  mapEmbedUrl: string
  hoursNote: string
}

export interface PartnerLogo {
  name: string
  imageUrl: string
}
