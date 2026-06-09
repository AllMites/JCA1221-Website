import { useState, useEffect } from 'react'
import type { Project, ProjectStatus } from '@/lib/content-types'

interface ProjectFormProps {
  project?: Project | null  // null = create mode
  onSave: (data: Partial<Project>) => Promise<void>
  onCancel: () => void
}

const STATUSES: ProjectStatus[] = ['operational', 'development', 'planning']

export function ProjectForm({ project, onSave, onCancel }: ProjectFormProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
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

  useEffect(() => {
    if (project) {
      setName(project.name)
      setSlug(project.slug)
      setLocation(project.location)
      setStatus(project.status)
      setHeroImage(project.hero_image ?? '')
      setHeroDescription(project.hero_description ?? '')
      setShortDescription(project.short_description ?? '')
      setDescription(project.description ?? '')
      setStatsJson(JSON.stringify(project.stats ?? [], null, 2))
      setTechnologyJson(JSON.stringify(project.technology ?? { description: '', tags: [] }, null, 2))
      setImpactMetricsJson(JSON.stringify(project.impact_metrics ?? [], null, 2))
      setYearStarted(project.year_started?.toString() ?? '')
      setYearCompleted(project.year_completed?.toString() ?? '')
      setGalleryImages((project.gallery_images ?? []).join(', '))
      setOrder((project.order ?? 0).toString())
    }
  }, [project])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    let stats = []
    let technology = { description: '', tags: [] as string[] }
    let impactMetrics = []
    try { stats = JSON.parse(statsJson) } catch {}
    try { technology = JSON.parse(technologyJson) } catch {}
    try { impactMetrics = JSON.parse(impactMetricsJson) } catch {}

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
      published: project?.published ?? true,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
        {project ? 'Edit Project' : 'New Project'}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Slug *</label>
          <input value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Location *</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} required className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white">
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Hero Image URL</label>
        <input value={heroImage} onChange={(e) => setHeroImage(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Hero Description *</label>
        <input value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} required className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Short Description *</label>
        <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} required rows={2} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white resize-none" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Full Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white resize-none" />
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
          <input type="number" value={yearStarted} onChange={(e) => setYearStarted(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Year Completed</label>
          <input type="number" value={yearCompleted} onChange={(e) => setYearCompleted(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Order</label>
          <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Gallery Images (comma-separated URLs)</label>
        <input value={galleryImages} onChange={(e) => setGalleryImages(e.target.value)} placeholder="https://..., https://..." className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-medium rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 border border-white/20 transition-all disabled:opacity-50">
          {saving ? 'Saving…' : project ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-medium rounded-full text-slate-500 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
          Cancel
        </button>
      </div>
    </form>
  )
}
