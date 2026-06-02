export interface TeamMember {
  /** Unique identifier */
  id: string
  /** Full name */
  name: string
  /** Job title */
  role: string
  /** Professional credentials suffix (e.g., "Atty.", "P.E.", "Ph.D.") */
  credentials?: string
  /** Path to profile photo */
  photo: string
  /** Short bio (2-3 sentences) */
  bio: string
  /** Key quote from this team member */
  quote?: string
  /** Areas of expertise for tag display */
  expertise: string[]
  /** Social/contact links */
  links?: TeamMemberLink[]
  /** Display order (lower = first) */
  order: number
}

export interface TeamMemberLink {
  /** Link type */
  type: 'email' | 'linkedin'
  /** Display label */
  label: string
  /** URL or mailto */
  url: string
}

export interface TeamSectionData {
  /** Section heading */
  sectionTitle: string
  /** Section subtitle */
  sectionSubtitle: string
  /** Team members in display order */
  members: TeamMember[]
}

export interface TeamViewProps {
  sectionTitle: string
  sectionSubtitle: string
  members: TeamMember[]
}
