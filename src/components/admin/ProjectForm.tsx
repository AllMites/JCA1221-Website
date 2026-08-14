import { useState, useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import type { Project, ProjectStatus, ProjectStat, ProjectTechnology, ImpactMetric } from '@/lib/content-types'
import { RepeatableRowEditor, KeyValueEditor, ImagePicker, type RowFieldDef } from '@/components/content-editors'

interface ProjectFormProps {
  project?: Project | null  // null = create mode
  onSave: (data: Partial<Project>) => Promise<void>
  onCancel: () => void
}

type FieldErrors = Partial<Record<
  'name' | 'slug' | 'location' | 'heroImage' | 'heroDescription' | 'shortDescription' | 'yearStarted' | 'yearCompleted',
  string
>>

const STATUSES: ProjectStatus[] = ['operational', 'development', 'planning']

const STAT_FIELDS: RowFieldDef[] = [
  { name: 'label', label: 'Label' },
  { name: 'value', label: 'Value' },
]

const IMPACT_FIELDS: RowFieldDef[] = [
  { name: 'label', label: 'Label' },
  { name: 'value', label: 'Value' },
  { name: 'improvement', label: 'Improvement' },
]

export function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)

  // Auto-generate slug from name on create mode, unless user has manually edited slug
  useEffect(() => {
    if (!project && !slugTouched) {
      setSlug(name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
    }
  }, [name, project, slugTouched])
  const [location, setLocation] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('planning')
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [heroDescription, setHeroDescription] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [stats, setStats] = useState<ProjectStat[]>([])
  const [technology, setTechnology] = useState<ProjectTechnology>({ description: '', tags: [] })
  const [impactMetrics, setImpactMetrics] = useState<ImpactMetric[]>([])
  const [yearStarted, setYearStarted] = useState('')
  const [yearCompleted, setYearCompleted] = useState('')
  const [galleryImages, setGalleryImages] = useState<string[]>([])
  const [order, setOrder] = useState('0')
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [publishMode, setPublishMode] = useState(project?.published ?? true)
  const submitRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (project) {
      setName(project.name)
      setSlug(project.slug)
      setLocation(project.location)
      setHeroImage(project.hero_image ?? null)
      setHeroDescription(project.hero_description ?? '')
      setShortDescription(project.short_description ?? '')
      setDescription(project.description ?? '')
      setStats(project.stats ?? [])
      setTechnology(project.technology ?? { description: '', tags: [] })
      setImpactMetrics(project.impact_metrics ?? [])
      setYearStarted(project.year_started?.toString() ?? '')
      setYearCompleted(project.year_completed?.toString() ?? '')
      setGalleryImages(project.gallery_images ?? [])
      setOrder((project.order ?? 0).toString())
    }
  }, [project])

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
    if (!location.trim()) errs.location = 'Location is required'
    if (!heroDescription.trim()) errs.heroDescription = 'Hero description is required'
    if (!shortDescription.trim()) errs.shortDescription = 'Short description is required'
    if (yearStarted && isNaN(parseInt(yearStarted))) errs.yearStarted = 'Please enter a valid year'
    if (yearCompleted && isNaN(parseInt(yearCompleted))) errs.yearCompleted = 'Please enter a valid year'
    if (heroImage && !/^(https?:\/\/|\/)/.test(heroImage.trim())) errs.heroImage = 'Please enter a valid URL or path starting with /'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  function doSave(publish: boolean) {
    setPublishMode(publish)
    submitRef.current?.click()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')

    if (!validate()) return

    setSaving(true)

    try {
      await onSave({
        id: project?.id,
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        location: location.trim(),
        status,
        hero_image: heroImage,
        hero_description: heroDescription.trim(),
        short_description: shortDescription.trim(),
        description: description.trim() || null,
        stats,
        technology,
        impact_metrics: impactMetrics,
        year_started: yearStarted ? parseInt(yearStarted) : null,
        year_completed: yearCompleted ? parseInt(yearCompleted) : null,
        gallery_images: galleryImages,
        order: parseInt(order) || 0,
        published: publishMode,
      })
    } catch (err) {
      setSubmitError((err as Error).message || 'Failed to save project. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputBase = 'w-full h-field px-field-x py-field-y text-sm rounded-field bg-white dark:bg-white/5 border outline-none text-slate-900 dark:text-white transition-all duration-200'
  const textareaBase = inputBase.replace('h-field', 'min-h-field')
  const inputNormal = 'border-slate-200 dark:border-white/10 focus:border-blue-400/50'
  const inputError = 'border-red-400/50 dark:border-red-400/30 focus:border-red-400'
  const labelClass = 'block text-xs font-medium text-slate-500 mb-1'

  function inputClass(field: keyof FieldErrors) {
    return `${inputBase} ${fieldErrors[field] ? inputError : inputNormal}`
  }

  function textareaClass(field: keyof FieldErrors) {
    return `${textareaBase} ${fieldErrors[field] ? inputError : inputNormal}`
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
        {project ? 'Edit Project' : 'New Project'}
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
          <label className={labelClass}>Name *</label>
          <input value={name} onChange={(e) => { setName(e.target.value); clearFieldError('name') }} required className={inputClass('name')} />
          {fieldErrors.name && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.name}</p>}
        </div>
        <div>
          <label className={labelClass}>Slug *</label>
          <input value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); clearFieldError('slug') }} required className={inputClass('slug')} />
          {fieldErrors.slug && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.slug}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Location *</label>
          <input value={location} onChange={(e) => { setLocation(e.target.value); clearFieldError('location') }} required className={inputClass('location')} />
          {fieldErrors.location && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.location}</p>}
        </div>
        <div>
          <label className={labelClass}>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} className={inputBase + ' ' + inputNormal}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <ImagePicker label="Hero Image" value={heroImage} onChange={(url) => { setHeroImage(url); clearFieldError('heroImage') }} />
        {fieldErrors.heroImage && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.heroImage}</p>}
      </div>

      <div>
        <label className={labelClass}>Hero Description *</label>
        <input value={heroDescription} onChange={(e) => { setHeroDescription(e.target.value); clearFieldError('heroDescription') }} required className={inputClass('heroDescription')} />
        {fieldErrors.heroDescription && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.heroDescription}</p>}
      </div>

      <div>
        <label className={labelClass}>Short Description *</label>
        <textarea value={shortDescription} onChange={(e) => { setShortDescription(e.target.value); clearFieldError('shortDescription') }} required rows={2} className={`${textareaClass('shortDescription')} resize-none`} />
        {fieldErrors.shortDescription && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.shortDescription}</p>}
      </div>

      <div>
        <label className={labelClass}>Full Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={textareaBase + ' ' + inputNormal + ' resize-none'} />
      </div>

      <div>
        <label className={labelClass}>Stats</label>
        <RepeatableRowEditor fields={STAT_FIELDS} rows={stats as unknown as Record<string, string>[]} onChange={(rows) => setStats(rows as unknown as ProjectStat[])} addLabel="Add stat" />
      </div>

      <div>
        <label className={labelClass}>Technology</label>
        <KeyValueEditor value={technology} onChange={setTechnology} />
      </div>

      <div>
        <label className={labelClass}>Impact Metrics</label>
        <RepeatableRowEditor fields={IMPACT_FIELDS} rows={impactMetrics as unknown as Record<string, string>[]} onChange={(rows) => setImpactMetrics(rows as unknown as ImpactMetric[])} addLabel="Add metric" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Year Started</label>
          <input type="number" value={yearStarted} onChange={(e) => { setYearStarted(e.target.value); clearFieldError('yearStarted') }} className={inputClass('yearStarted')} />
          {fieldErrors.yearStarted && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.yearStarted}</p>}
        </div>
        <div>
          <label className={labelClass}>Year Completed</label>
          <input type="number" value={yearCompleted} onChange={(e) => { setYearCompleted(e.target.value); clearFieldError('yearCompleted') }} className={inputClass('yearCompleted')} />
          {fieldErrors.yearCompleted && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.yearCompleted}</p>}
        </div>
        <div>
          <label className={labelClass}>Order</label>
          <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className={inputBase + ' ' + inputNormal} />
        </div>
      </div>

      <ImagePicker multiple label="Gallery Images" value={galleryImages} onChange={setGalleryImages} />

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={() => doSave(true)} disabled={saving} className="px-4 py-2 text-xs font-medium rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 border border-white/20 transition-all disabled:opacity-50">
          {saving ? 'Saving…' : 'Publish'}
        </button>
        <button type="button" onClick={() => doSave(false)} disabled={saving} className="px-4 py-2 text-xs font-medium rounded-full text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all disabled:opacity-50">
          {saving ? 'Saving…' : 'Save as Draft'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-medium rounded-full text-slate-500 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
          Cancel
        </button>
      </div>
      <button type="submit" ref={submitRef} className="hidden" />
    </form>
  )
}
