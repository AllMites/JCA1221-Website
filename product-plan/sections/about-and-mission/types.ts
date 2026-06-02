export interface FounderQuote {
  /** The quote text */
  text: string
  /** Context of when/where this was said */
  context: string
}

export interface FounderMilestone {
  /** Year the milestone occurred */
  year: number
  /** Short title for the milestone */
  title: string
  /** 1-2 sentence description */
  description: string
}

export interface FounderProfile {
  /** Founder's full name */
  name: string
  /** Job title and company */
  role: string
  /** Path to headshot image */
  photo: string
  /** Primary signature quote displayed prominently */
  signatureQuote: string
  /** Collection of pull quotes with context */
  quotes: FounderQuote[]
  /** Career timeline milestones */
  milestones: FounderMilestone[]
}

export interface ValueSubPoint {
  /** Sub-point title */
  title: string
  /** Sub-point description */
  description: string
}

export type SectionColor = 'amber' | 'emerald' | 'blue' | 'slate'

export type GlassTint = 'amber' | 'emerald' | 'blue'

export interface ValuePillar {
  /** Unique identifier */
  id: string
  /** Pillar title */
  title: string
  /** lucide-react icon name */
  icon: string
  /** Background color for this pillar's section */
  sectionColor: SectionColor
  /** Tint color for glass cards within this pillar */
  glassTint: GlassTint
  /** 1-2 sentence pillar description */
  description: string
  /** Supporting detail points */
  subPoints: ValueSubPoint[]
}

export interface AboutAndMissionProps {
  /** First-person founder letter displayed in opening glass panel */
  founderLetter: string
  /** Lean founder profile with quotes and milestones */
  founderProfile: FounderProfile
  /** Four core value pillars */
  valuePillars: ValuePillar[]
  /** CTA button text linking to Contact section */
  ctaText: string

  /** Callback when user clicks the CTA to contact/partner */
  onCtaClick?: () => void
}
