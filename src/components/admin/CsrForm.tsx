import { useState, useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import type { CsrProject, ProjectStat, CsrNewsletterEntry } from '@/lib/content-types'
import { RepeatableRowEditor, TagPillInput, ImagePicker, type RowFieldDef } from '@/components/content-editors'

interface CsrFormProps {
  csr?: CsrProject | null
  onSave: (data: Partial<CsrProject>) => Promise<void>
  onCancel: () => void
}

type FieldErrors = Partial<Record<'name' | 'slug' | 'description' | 'heroImage', string>>

const STAT_FIELDS: RowFieldDef[] = [
  { name: 'label', label: 'Label', type: 'text' },
  { name: 'value', label: 'Value', type: 'text' },
]

const TIMELINE_FIELDS: RowFieldDef[] = [
  { name: 'date', label: 'Date', type: 'text', placeholder: '2024-01' },
  { name: 'title', label: 'Title', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'photo', label: 'Photo', type: 'image' },
]

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
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [stats, setStats] = useState<ProjectStat[]>([])
  const [timeline, setTimeline] = useState<CsrNewsletterEntry[]>([])
  const [sdgTags, setSdgTags] = useState<string[]>([])
  const [gallery, setGallery] = useState<string[]>([])
  const [linkedProjectId, setLinkedProjectId] = useState('')
  const [order, setOrder] = useState('0')
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')

  // ── Form state preservation ──────────────────────────────────────────────
  const savedFormRef = useRef<Record<string, string>>({})

  useEffect(() => {
    if (csr) {
      setName(csr.name)
      setSlug(csr.slug)
      setCategory(csr.category ?? '')
      setDescription(csr.description ?? '')
      setStory(csr.story ?? '')
      setLocation(csr.location ?? '')
      setHeroImage(csr.hero_image ?? null)
      setStats(csr.stats ?? [])
      setTimeline(csr.timeline ?? [])
      setSdgTags(csr.sdg_tags ?? [])
      setGallery(csr.gallery ?? [])
      setLinkedProjectId(csr.linked_project_id ?? '')
      setOrder((csr.order ?? 0).toString())
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
    savedFormRef.current = { name, slug, category, description, story, location, heroImage: heroImage ?? '', linkedProjectId, order }

    try {
      await onSave({
        id: csr?.id,
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        category: category.trim(),
        description: description.trim(),
        story: story.trim() || null,
        location: location.trim(),
        hero_image: heroImage?.trim() || null,
        stats,
        timeline,
        sdg_tags: sdgTags,
        gallery,
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

  const inputBase = 'w-full h-field px-field-x py-field-y text-sm rounded-field bg-white dark:bg-white/5 border outline-none text-slate-900 dark:text-white transition-all duration-200'
  const textareaBase = inputBase.replace('h-field', 'min-h-field')
  const inputNormal = 'border-slate-200 dark:border-white/10 focus:border-blue-400/50'
  const inputError = 'border-red-400/50 dark:border-red-400/30 focus:border-red-400'

  function inputClass(field: keyof FieldErrors) {
    return `${inputBase} ${fieldErrors[field] ? inputError : inputNormal}`
  }

  function textareaClass(field: keyof FieldErrors) {
    return `${textareaBase} ${fieldErrors[field] ? inputError : inputNormal}`
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
        <ImagePicker label="Hero Image" value={heroImage} onChange={(url) => { setHeroImage(url); clearFieldError('heroImage') }} />
        {fieldErrors.heroImage && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.heroImage}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Description *</label>
        <textarea value={description} onChange={(e) => { setDescription(e.target.value); clearFieldError('description') }} required rows={3} className={`${textareaClass('description')} resize-none`} />
        {fieldErrors.description && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.description}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Story (narrative, Markdown-compatible)</label>
        <textarea value={story} onChange={(e) => setStory(e.target.value)} rows={5} className={textareaBase + ' ' + inputNormal + ' resize-none'} />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Stats</label>
        <RepeatableRowEditor
          rows={stats as unknown as Record<string, string>[]}
          onChange={(rows) => setStats(rows as unknown as ProjectStat[])}
          fields={STAT_FIELDS}
          addLabel="Add stat"
          emptyRow={{ label: '', value: '' }}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Newsletter Entries</label>
        <RepeatableRowEditor
          rows={timeline as unknown as Record<string, string>[]}
          onChange={(rows) => setTimeline(rows as unknown as CsrNewsletterEntry[])}
          fields={TIMELINE_FIELDS}
          addLabel="Add entry"
          emptyRow={{ date: '', title: '', description: '', photo: '' }}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">SDG Tags</label>
        <TagPillInput value={sdgTags} onChange={setSdgTags} placeholder="SDG 14, SDG 13, SDG 11" />
      </div>

      <ImagePicker multiple label="Gallery" value={gallery} onChange={setGallery} />

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
