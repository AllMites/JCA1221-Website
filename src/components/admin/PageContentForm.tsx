import { useState, useEffect } from 'react'
import type { PageContent } from '@/lib/content-types'

interface PageContentFormProps {
  content?: PageContent | null
  onSave: (data: Partial<PageContent>) => Promise<void>
  onCancel: () => void
}

export function PageContentForm({ content, onSave, onCancel }: PageContentFormProps) {
  const [page, setPage] = useState('')
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [order, setOrder] = useState('0')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (content) {
      setPage(content.page ?? '')
      setKey(content.key ?? '')
      setValue((content.value as string) ?? '')
      setOrder((content.order ?? 0).toString())
    }
  }, [content])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave({
      id: content?.id,
      page: page.trim(),
      key: key.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      value: value.trim(),
      order: parseInt(order) || 0,
      published: content?.published ?? true,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
        {content ? 'Edit Page Content' : 'New Page Content'}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Page *</label>
          <select value={page} onChange={(e) => setPage(e.target.value)} required className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white">
            <option value="">Select page...</option>
            <option value="home">Home</option>
            <option value="about">About</option>
            <option value="projects">Projects</option>
            <option value="team">Team</option>
            <option value="contact">Contact</option>
            <option value="news">News</option>
            <option value="global">Global</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Key *</label>
          <input value={key} onChange={(e) => setKey(e.target.value)} required placeholder="hero_title" className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Value *</label>
        <textarea value={value} onChange={(e) => setValue(e.target.value)} required rows={4} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white resize-none" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Order</label>
        <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-medium rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 border border-white/20 transition-all disabled:opacity-50">
          {saving ? 'Saving…' : content ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-medium rounded-full text-slate-500 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
          Cancel
        </button>
      </div>
    </form>
  )
}
