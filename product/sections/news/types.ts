export interface NewsArticle {
  /** Unique article identifier (slug) */
  id: string
  /** Article headline */
  title: string
  /** Publication/source name */
  source: string
  /** Publication date in ISO format */
  date: string
  /** Article excerpt (2-3 sentences) */
  excerpt: string
  /** External URL to full article */
  url: string
  /** Source logo or favicon path */
  sourceLogo?: string
  /** Category for filtering */
  category: NewsCategory
  /** Path to thumbnail image (optional) */
  image?: string
  /** Tags for filtering */
  tags: string[]
  /** Whether this is a press release (internal) or media coverage (external) */
  type: 'press-release' | 'media-coverage' | 'award' | 'feature'
}

export type NewsCategory = 'all' | 'awards' | 'projects' | 'policy' | 'expansion' | 'media'

export interface NewsSectionData {
  /** Section heading */
  sectionTitle: string
  /** Section subtitle */
  sectionSubtitle: string
  /** News articles in reverse chronological order */
  articles: NewsArticle[]
}

export interface NewsViewProps {
  sectionTitle: string
  sectionSubtitle: string
  articles: NewsArticle[]
}
