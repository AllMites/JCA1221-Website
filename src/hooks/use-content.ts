import { useState, useEffect, useCallback } from 'react'
import { supabase, hasSupabaseCredentials } from '@/lib/supabase'
import type {
  NewsArticle, Project, ProjectAward, TeamMember,
  CsrProject, Partner, TechWidget, PageContent,
} from '@/lib/content-types'

// ── Generic fetcher ──
async function fetchPublished<T>(table: string, column = 'created_at', ascending = false): Promise<T[]> {
  if (!hasSupabaseCredentials) return []
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('published', true)
    .order(column, { ascending })
  if (error) throw error
  return (data ?? []) as T[]
}

async function fetchBySlug<T>(table: string, slug: string): Promise<T | null> {
  if (!hasSupabaseCredentials) return null
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  if (error) return null
  return data as T
}

// ── News ──
export function useNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPublished<NewsArticle>('news_articles', 'date', false)
      setArticles(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { articles, loading, error, reload: load }
}

// ── Projects ──
export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPublished<Project>('projects', 'order')
      setProjects(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { projects, loading, error, reload: load }
}

export function useProject(slug: string) {
  const [project, setProject] = useState<(Project & { awards: ProjectAward[]; widgets: TechWidget[] }) | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const p = await fetchBySlug<Project>('projects', slug)
      if (!p) { setProject(null); setLoading(false); return }

      const [{ data: awards }, { data: widgets }] = await Promise.all([
        supabase.from('project_awards').select('*').eq('project_id', p.id),
        supabase.from('tech_widgets').select('*').eq('project_id', p.id).eq('published', true).order('order'),
      ])

      setProject({ ...p, awards: (awards ?? []) as ProjectAward[], widgets: (widgets ?? []) as TechWidget[] })
    } catch {
      setProject(null)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { load() }, [load])

  return { project, loading, reload: load }
}

// ── Team ──
export function useTeam() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPublished<TeamMember>('team_members', 'order')
      setMembers(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { members, loading, error, reload: load }
}

// ── CSR ──
export function useCsrProjects() {
  const [projects, setProjects] = useState<CsrProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPublished<CsrProject>('csr_projects', 'order')
      setProjects(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { projects, loading, error, reload: load }
}

// ── Partners ──
export function usePartners() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPublished<Partner>('partners')
      setPartners(data)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { partners, loading, error, reload: load }
}

// ── Page Content ──
export function usePageContent(page: string) {
  const [content, setContent] = useState<PageContent[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    if (!hasSupabaseCredentials) { setLoading(false); return }
    try {
      const { data } = await supabase
        .from('page_content')
        .select('*')
        .eq('page', page)
        .eq('published', true)
      setContent((data ?? []) as PageContent[])
    } catch {
      setContent([])
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { load() }, [load])

  return { content, loading, reload: load }
}

// Helper to get a value from page_content array
export function getPageValue(content: PageContent[], section: string, key: string): unknown {
  return content.find(c => c.section === section && c.key === key)?.value ?? null
}
