import { useState, useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import type { CsrProject } from '@/lib/content-types'

interface CsrFormProps {
  csr?: CsrProject | null
  onSave: (data: Partial<CsrProject>) => Promise<void>
  onCancel: () => void
}

type FieldErrors = Partial<Record<'name' | 'slug' | 'description' | 'heroImage', string>>

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')

  // ── Form state preservation ──────────────────────────────────────────────
  const savedFormRef = useRef<Record<string, string>>({})

  useEffect(() => {
    if (csr) {
      const vals: Record<string, string> = {
        name: csr.name,
        slug: csr.slug,
        category: csr.category ?? '',
        description: csr.description ?? '',
        story: csr.story ?? '',
        location: csr.location ?? '',
        heroImage: csr.hero_image ?? '',
        statsJson: JSON.stringify(csr.stats ?? [], null, 2),
        timelineJson: JSON.stringify(csr.timeline ?? [], null, 2),
        sdgTagsStr: (csr.sdg_tags ?? []).join(', '),
        galleryStr: (csr.gallery ?? []).join(', '),
        linkedProjectId: csr.linked_project_id ?? '',
        order: (csr.order ?? 0).toString(),
      }
      setName(vals.name)
      setSlug(vals.slug)
      setCategory(vals.category)
      setDescription(vals.description)
      setStory(vals.story)
      setLocation(vals.location)
      setHeroImage(vals.heroImage)
      setStatsJson(vals.statsJson)
      setTimelineJson(vals.timelineJson)
      setSdgTagsStr(vals.sdgTagsStr)
      setGalleryStr(vals.galleryStr)
      setLinkedProjectId(vals.linkedProjectId)
      setOrder(vals.order)
      savedFormRef.current = vals
    }
  }, [csr])

  function clearFieldError(field: keyof FieldErrors) {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function validate(): boolean {
    const errs: FieldErrors = {}
    if (!name.trim()) errs.name = 'Project name is required'
    if (!slug.trim()) errs.slug = 'URL slug is required'
    else if (!/^[a-z0-9-]+$/.test(slug.trim())) errs.slug = 'Slug must contain only lowercase letters, numbers, and hyphens'
    if (!description.trim()) errs.description = 'Description is required'
    if (heroImage && !/^(https?:\/\/|\/)/.test(heroImage.trim())) errs.heroImage = 'Please enter a valid URL or path starting with /'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')

    if (!validate()) return

    setSaving(true)
    savedFormRef.current = { name, slug, category, description, story, location, heroImage, statsJson, timelineJson, sdgTagsStr, galleryStr, linkedProjectId, order }

    let stats = []; let timeline = []
    try { stats = JSON.parse(statsJson) } catch {}
    try { timeline = JSON.parse(timelineJson) } catch {}

    try {
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
    } catch (err) {
      setSubmitError((err as Error).message || 'Failed to save CSR project. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputBase = 'w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border outline-none text-slate-900 dark:text-white transition-all duration-200'
  const inputNormal = 'border-slate-200 dark:border-white/10 focus:border-blue-400/50'
  const inputError = 'border-red-400/50 dark:border-red-400/30 focus:border-red-400'

  function inputClass(field: keyof FieldErrors) {
    return `${inputBase} ${fieldErrors[field] ? inputError : inputNormal}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
        {csr ? 'Edit CSR Project' : 'New CSR Project'}
      </h3>

      {submitError && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20">
          <p className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />{submitError}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Name *</label>
          <input value={name} onChange={(e) => { setName(e.target.value); clearFieldError('name') }} required className={inputClass('name')} />
          {fieldErrors.name && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.name}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Slug *</label>
          <input value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); clearFieldError('slug') }} required className={inputClass('slug')} />
          {fieldErrors.slug && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.slug}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
          <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Coastal Restoration, Education" className={inputBase + ' ' + inputNormal} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputBase + ' ' + inputNormal} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Hero Image URL</label>
        <input value={heroImage} onChange={(e) => { setHeroImage(e.target.value); clearFieldError('heroImage') }} className={inputClass('heroImage')} />
        {fieldErrors.heroImage && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.heroImage}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Description *</label>
        <textarea value={description} onChange={(e) => { setDescription(e.target.value); clearFieldError('description') }} required rows={3} className={`${inputClass('description')} resize-none`} />
        {fieldErrors.description && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.description}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Story (narrative, Markdown-compatible)</label>
        <textarea value={story} onChange={(e) => setStory(e.target.value)} rows={5} className={inputBase + ' ' + inputNormal + ' resize-none'} />
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
        <input value={sdgTagsStr} onChange={(e) => setSdgTagsStr(e.target.value)} placeholder="SDG 14, SDG 13, SDG 11" className={inputBase + ' ' + inputNormal} />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Gallery (comma-separated URLs)</label>
        <input value={galleryStr} onChange={(e) => setGalleryStr(e.target.value)} className={inputBase + ' ' + inputNormal} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Linked Project ID (UUID)</label>
          <input value={linkedProjectId} onChange={(e) => setLinkedProjectId(e.target.value)} className={inputBase + ' ' + inputNormal} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Order</label>
          <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className={inputBase + ' ' + inputNormal} />
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
