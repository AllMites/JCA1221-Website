import { useState, useEffect } from 'react'
import type { CsrProject } from '@/lib/content-types'

interface CsrFormProps {
  csr?: CsrProject | null
  onSave: (data: Partial<CsrProject>) => Promise<void>
  onCancel: () => void
}

export function CsrForm({ csr, onSave, onCancel }: CsrFormProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  // Auto-generate slug from name on create mode, unless user manually edited slug
  useEffect(() => {
    if (!csr && !slugTouched) {
      setSlug(name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
    }
  }, [name, csr, slugTouched])
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [story, setStory] = useState('')
  const [location, setLocation] = useState('')
  const [heroImage, setHeroImage] = useState('')
  const [statsJson, setStatsJson] = useState('[]')
  const [timelineJson, setTimelineJson] = useState('[]')
  const [sdgTagsStr, setSdgTagsStr] = useState('')
  const [galleryStr, setGalleryStr] = useState('')
  const [linkedProjectId, setLinkedProjectId] = useState('')
  const [order, setOrder] = useState('0')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (csr) {
      setName(csr.name)
      setSlug(csr.slug)
      setCategory(csr.category ?? '')
      setDescription(csr.description ?? '')
      setStory(csr.story ?? '')
      setLocation(csr.location ?? '')
      setHeroImage(csr.hero_image ?? '')
      setStatsJson(JSON.stringify(csr.stats ?? [], null, 2))
      setTimelineJson(JSON.stringify(csr.timeline ?? [], null, 2))
      setSdgTagsStr((csr.sdg_tags ?? []).join(', '))
      setGalleryStr((csr.gallery ?? []).join(', '))
      setLinkedProjectId(csr.linked_project_id ?? '')
      setOrder((csr.order ?? 0).toString())
    }
  }, [csr])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    let stats = []; let timeline = []
    try { stats = JSON.parse(statsJson) } catch {}
    try { timeline = JSON.parse(timelineJson) } catch {}

    await onSave({
      id: csr?.id,
      name: name.trim(),
      slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
      category: category.trim(),
      description: description.trim(),
      story: story.trim() || null,
      location: location.trim(),
      hero_image: heroImage.trim() || null,
      stats,
      timeline,
      sdg_tags: sdgTagsStr.split(',').map(t => t.trim()).filter(Boolean),
      gallery: galleryStr.split(',').map(g => g.trim()).filter(Boolean),
      linked_project_id: linkedProjectId.trim() || null,
      order: parseInt(order) || 0,
      published: csr?.published ?? true,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
        {csr ? 'Edit CSR Project' : 'New CSR Project'}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Slug *</label>
          <input value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }} required className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Coastal Restoration, Education" className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Hero Image URL</label>
        <input value={heroImage} onChange={(e) => setHeroImage(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Description *</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white resize-none" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Story (narrative, Markdown-compatible)</label>
        <textarea value={story} onChange={(e) => setStory(e.target.value)} rows={5} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white resize-none" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Stats (JSON)</label>
        <textarea value={statsJson} onChange={(e) => setStatsJson(e.target.value)} rows={3} className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white resize-none" placeholder='[{"label":"Trees Planted","value":"1,200"}]' />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Timeline (JSON)</label>
        <textarea value={timelineJson} onChange={(e) => setTimelineJson(e.target.value)} rows={4} className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white resize-none" placeholder='[{"date":"2024-01","title":"Project Launch","description":"Started...","photo":null}]' />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">SDG Tags (comma-separated)</label>
        <input value={sdgTagsStr} onChange={(e) => setSdgTagsStr(e.target.value)} placeholder="SDG 14, SDG 13, SDG 11" className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Gallery (comma-separated URLs)</label>
        <input value={galleryStr} onChange={(e) => setGalleryStr(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Linked Project ID (UUID)</label>
          <input value={linkedProjectId} onChange={(e) => setLinkedProjectId(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Order</label>
          <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-medium rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 border border-white/20 transition-all disabled:opacity-50">
          {saving ? 'Saving…' : csr ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-medium rounded-full text-slate-500 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
          Cancel
        </button>
      </div>
    </form>
  )
}
