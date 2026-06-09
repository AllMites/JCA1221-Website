import { useState, useEffect } from 'react'
import type { NewsArticle, NewsCategory, NewsType } from '@/lib/content-types'

interface NewsFormProps {
  article?: NewsArticle | null  // null = create mode
  onSave: (data: Partial<NewsArticle>) => Promise<void>
  onCancel: () => void
}

const CATEGORIES: NewsCategory[] = ['awards', 'projects', 'policy', 'expansion', 'media']
const TYPES: NewsType[] = ['media-coverage', 'award', 'feature']

export function NewsForm({ article, onSave, onCancel }: NewsFormProps) {
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [excerpt, setExcerpt] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState<NewsCategory>('media')
  const [type, setType] = useState<NewsType>('media-coverage')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (article) {
      setTitle(article.title ?? '')
      setSource(article.source ?? '')
      setDate(article.date?.slice(0, 10) ?? '')
      setExcerpt(article.excerpt ?? '')
      setUrl(article.url ?? '')
      setCategory(article.category ?? 'media')
      setType(article.type ?? 'media-coverage')
      setTags((article.tags ?? []).join(', '))
    }
  }, [article])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave({
      id: article?.id,
      title: title.trim(),
      source: source.trim(),
      date,
      excerpt: excerpt.trim(),
      url: url.trim(),
      category,
      type,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      published: article?.published ?? true,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
        {article ? 'Edit Article' : 'New Article'}
      </h3>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Title *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Source *</label>
          <input value={source} onChange={(e) => setSource(e.target.value)} required className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Date *</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as NewsCategory)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white">
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as NewsType)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white">
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Excerpt</label>
        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white resize-none" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">URL</label>
        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Tags (comma separated)</label>
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. Puerto Princesa, Awards, Water" className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-medium rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 border border-white/20 transition-all disabled:opacity-50">
          {saving ? 'Saving…' : article ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-medium rounded-full text-slate-500 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
          Cancel
        </button>
      </div>
    </form>
  )
}
