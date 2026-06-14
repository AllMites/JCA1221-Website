export interface HeroContent {
  siteName: string
  tagline: string
  description: string
  backgroundImage: string
  ctaLabel: string
  ctaHref: string
}

export interface ProjectAward {
  title: string
  organization: string
  year: number
}

export type ProjectStatus = 'operational' | 'development' | 'planning'

export interface ProjectStat {
  label: string
  value: string
}

export interface ProjectCard {
  id: string
  /** URL-safe slug for routing */
  slug: string
  name: string
  location: string
  status: ProjectStatus
  image: string
  description: string
  award: ProjectAward
  stats: ProjectStat[]
}

export interface MissionValue {
  title: string
  description: string
  icon: string
}

export interface ImpactStat {
  number: number
  suffix: string
  label: string
  description: string
}

export type ExpansionStatus = 'In Development' | 'Planning & Assessment' | 'Completed'

export interface ExpansionInitiative {
  location: string
  title: string
  description: string
  status: ExpansionStatus
  image: string
}

export interface Expansion {
  title: string
  subtitle: string
  initiatives: ExpansionInitiative[]
}

export interface HomeProps {
  /** Full-screen hero content */
  hero: HeroContent
  /** Horizontal-scrolling project cards with embedded awards */
  projectCards: ProjectCard[]
  /** Core mission and values */
  missionValues: MissionValue[]
  /** Key impact statistics */
  impactStats: ImpactStat[]
  /** Expansion and future initiatives */
  expansion: Expansion

  /** Callback when CTA button is clicked */
  onCtaClick?: () => void
  /** Callback when a project card is clicked */
  onProjectClick?: (projectId: string) => void
  /** Callback when shell reveal is triggered (mouse near top edge) */
  onShellReveal?: () => void
  /** Callback when shell should hide (mouse leaves edge zone) */
  onShellHide?: () => void
}
