// ── Enums ──
export type ProjectStatus = 'operational' | 'development' | 'planning'
export type PartnerType = 'LGU' | 'national_agency' | 'private_sector' | 'community' | 'regulatory'
export type NewsCategory = 'awards' | 'projects' | 'policy' | 'expansion' | 'media'
export type NewsType = 'media-coverage' | 'award' | 'feature'
export type WidgetType = 'process_flow' | 'comparison_table' | 'video_carousel' | 'monitoring'
export type AuditAction = 'create' | 'update' | 'delete'
export type UserRole = 'admin' | 'editor'

// ── Projects ──
export interface ProjectStat {
  label: string
  value: string
}

export interface ProjectTechnology {
  description: string
  tags: string[]
}

export interface ImpactMetric {
  label: string
  value: string
  improvement: string
}

export interface Project {
  id: string
  name: string
  slug: string
  location: string
  status: ProjectStatus
  hero_image: string | null
  hero_description: string
  short_description: string
  description: string | null
  stats: ProjectStat[]
  technology: ProjectTechnology | null
  impact_metrics: ImpactMetric[]
  year_started: number | null
  year_completed: number | null
  gallery_images: string[]
  order: number
  published: boolean
  created_at?: string
  updated_at?: string
}

// ── Project Awards ──
export interface ProjectAward {
  id: string
  project_id: string
  title: string
  organization: string
  year: number
  description: string
}

// ── News ──
export interface NewsArticle {
  id: string
  title: string
  source: string
  date: string
  excerpt: string
  url: string
  category: NewsCategory
  tags: string[]
  type: NewsType
  published: boolean
  created_at?: string
  updated_at?: string
}

// ── Team ──
export interface TeamMemberLink {
  type: 'email' | 'linkedin'
  label: string
  url: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  credentials: string | null
  photo: string | null
  bio: string
  quote: string | null
  expertise: string[]
  links: TeamMemberLink[]
  order: number
  published: boolean
}

// ── CSR ──
export interface CsrTimelineEntry {
  date: string
  title: string
  description: string
  photo: string | null
}

export interface CsrProject {
  id: string
  name: string
  slug: string
  category: string
  description: string
  story: string | null
  location: string
  hero_image: string | null
  stats: ProjectStat[]
  timeline: CsrTimelineEntry[]
  sdg_tags: string[]
  gallery: string[]
  linked_project_id: string | null
  order: number
  published: boolean
}

// ── Partners ──
export interface Partner {
  id: string
  name: string
  type: PartnerType
  logo: string | null
  website_url: string | null
  project_ids: string[]
  published: boolean
}

// ── Tech Widgets ──
export interface TechWidget {
  id: string
  project_id: string
  widget_type: WidgetType
  title: string | null
  description: string | null
  config: Record<string, unknown>
  order: number
  published: boolean
}

// ── Page Content ──
export interface PageContent {
  id: string
  page: string
  section: string
  key: string
  value: unknown
  order: number
  published: boolean
}

// ── Auth ──
export interface UserProfile {
  id: string
  email: string
  display_name: string
  role: UserRole
  created_at: string
}

// ── Audit ──
export interface AuditEntry {
  id: string
  user_id: string
  table_name: string
  record_id: string
  action: AuditAction
  changes: { old: Record<string, unknown> | null; new: Record<string, unknown> | null }
  timestamp: string
}
