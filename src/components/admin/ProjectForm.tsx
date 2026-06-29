import { useState, useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import type { Project, ProjectStatus } from '@/lib/content-types'

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
  const [heroImage, setHeroImage] = useState('')
  const [heroDescription, setHeroDescription] = useState('')
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [statsJson, setStatsJson] = useState('[]')
  const [technologyJson, setTechnologyJson] = useState('{"description":"","tags":[]}')
  const [impactMetricsJson, setImpactMetricsJson] = useState('[]')
  const [yearStarted, setYearStarted] = useState('')
  const [yearCompleted, setYearCompleted] = useState('')
  const [galleryImages, setGalleryImages] = useState('')
  const [order, setOrder] = useState('0')
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [publishMode, setPublishMode] = useState(project?.published ?? true)
  const submitRef = useRef<HTMLButtonElement>(null)

  // ── Form state preservation ──────────────────────────────────────────────
  const savedFormRef = useRef<Record<string, string>>({})

  useEffect(() => {
    if (project) {
      const vals: Record<string, string> = {
        name: project.name,
        slug: project.slug,
        location: project.location,
        heroImage: project.hero_image ?? '',
        heroDescription: project.hero_description ?? '',
        shortDescription: project.short_description ?? '',
        description: project.description ?? '',
        statsJson: JSON.stringify(project.stats ?? [], null, 2),
        technologyJson: JSON.stringify(project.technology ?? { description: '', tags: [] }, null, 2),
        impactMetricsJson: JSON.stringify(project.impact_metrics ?? [], null, 2),
        yearStarted: project.year_started?.toString() ?? '',
        yearCompleted: project.year_completed?.toString() ?? '',
        galleryImages: (project.gallery_images ?? []).join(', '),
        order: (project.order ?? 0).toString(),
      }
      setName(vals.name)
      setSlug(vals.slug)
      setLocation(vals.location)
      setHeroImage(vals.heroImage)
      setHeroDescription(vals.heroDescription)
      setShortDescription(vals.shortDescription)
      setDescription(vals.description)
      setStatsJson(vals.statsJson)
      setTechnologyJson(vals.technologyJson)
      setImpactMetricsJson(vals.impactMetricsJson)
      setYearStarted(vals.yearStarted)
      setYearCompleted(vals.yearCompleted)
      setGalleryImages(vals.galleryImages)
      setOrder(vals.order)
      savedFormRef.current = vals
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
    savedFormRef.current = { name, slug, location, heroImage, heroDescription, shortDescription, description, statsJson, technologyJson, impactMetricsJson, yearStarted, yearCompleted, galleryImages, order }

    let stats = []
    let technology = { description: '', tags: [] as string[] }
    let impactMetrics = []
    try { stats = JSON.parse(statsJson) } catch {}
    try { technology = JSON.parse(technologyJson) } catch {}
    try { impactMetrics = JSON.parse(impactMetricsJson) } catch {}

    try {
      await onSave({
        id: project?.id,
        name: name.trim(),
        slug: slug.trim().toLowerCase().replace(/\s+/g, '-'),
        location: location.trim(),
        status,
        hero_image: heroImage.trim() || null,
        hero_description: heroDescription.trim(),
        short_description: shortDescription.trim(),
        description: description.trim() || null,
        stats,
        technology,
        impact_metrics: impactMetrics,
        year_started: yearStarted ? parseInt(yearStarted) : null,
        year_completed: yearCompleted ? parseInt(yearCompleted) : null,
        gallery_images: galleryImages.split(',').map(i => i.trim()).filter(Boolean),
        order: parseInt(order) || 0,
        published: publishMode,
      })
    } catch (err) {
      setSubmitError((err as Error).message || 'Failed to save project. Please try again.')
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
          <label className="block text-xs font-medium text-slate-500 mb-1">Location *</label>
          <input value={location} onChange={(e) => { setLocation(e.target.value); clearFieldError('location') }} required className={inputClass('location')} />
          {fieldErrors.location && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.location}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} className={inputBase + ' ' + inputNormal}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Hero Image URL</label>
        <input value={heroImage} onChange={(e) => { setHeroImage(e.target.value); clearFieldError('heroImage') }} className={inputClass('heroImage')} />
        {fieldErrors.heroImage && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.heroImage}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Hero Description *</label>
        <input value={heroDescription} onChange={(e) => { setHeroDescription(e.target.value); clearFieldError('heroDescription') }} required className={inputClass('heroDescription')} />
        {fieldErrors.heroDescription && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.heroDescription}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Short Description *</label>
        <textarea value={shortDescription} onChange={(e) => { setShortDescription(e.target.value); clearFieldError('shortDescription') }} required rows={2} className={`${inputClass('shortDescription')} resize-none`} />
        {fieldErrors.shortDescription && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.shortDescription}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Full Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputBase + ' ' + inputNormal + ' resize-none'} />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Stats (JSON)</label>
        <textarea value={statsJson} onChange={(e) => setStatsJson(e.target.value)} rows={4} className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white resize-none" placeholder='[{"label":"Population Served","value":"300,000+"}]' />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Technology (JSON)</label>
        <textarea value={technologyJson} onChange={(e) => setTechnologyJson(e.target.value)} rows={3} className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white resize-none" placeholder='{"description":"SBR technology...","tags":["SBR","Biological"]}' />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Impact Metrics (JSON)</label>
        <textarea value={impactMetricsJson} onChange={(e) => setImpactMetricsJson(e.target.value)} rows={4} className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white resize-none" placeholder='[{"label":"Water Treated","value":"50M L/day","improvement":"+30%"}]' />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Year Started</label>
          <input type="number" value={yearStarted} onChange={(e) => { setYearStarted(e.target.value); clearFieldError('yearStarted') }} className={inputClass('yearStarted')} />
          {fieldErrors.yearStarted && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.yearStarted}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Year Completed</label>
          <input type="number" value={yearCompleted} onChange={(e) => { setYearCompleted(e.target.value); clearFieldError('yearCompleted') }} className={inputClass('yearCompleted')} />
          {fieldErrors.yearCompleted && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.yearCompleted}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Order</label>
          <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className={inputBase + ' ' + inputNormal} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Gallery Images (comma-separated URLs)</label>
        <input value={galleryImages} onChange={(e) => setGalleryImages(e.target.value)} placeholder="https://..., https://..." className={inputBase + ' ' + inputNormal} />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={() => doSave(true)} disabled={saving} className="px-4 py-2 text-xs font-medium rounded-full text-white bg-lime-500/80 hover:bg-lime-500/90 border border-lime-400/30 transition-all disabled:opacity-50">
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
