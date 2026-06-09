import { useState, useEffect } from 'react'
import type { Partner, PartnerType } from '@/lib/content-types'

interface PartnerFormProps {
  partner?: Partner | null
  onSave: (data: Partial<Partner>) => Promise<void>
  onCancel: () => void
}

const TYPES: PartnerType[] = ['LGU', 'national_agency', 'private_sector', 'community', 'regulatory']

export function PartnerForm({ partner, onSave, onCancel }: PartnerFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<PartnerType>('LGU')
  const [logo, setLogo] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [projectIdsStr, setProjectIdsStr] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (partner) {
      setName(partner.name)
      setType(partner.type)
      setLogo(partner.logo ?? '')
      setWebsiteUrl(partner.website_url ?? '')
      setProjectIdsStr((partner.project_ids ?? []).join(', '))
    }
  }, [partner])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await onSave({
      id: partner?.id,
      name: name.trim(),
      type,
      logo: logo.trim() || null,
      website_url: websiteUrl.trim() || null,
      project_ids: projectIdsStr.split(',').map(p => p.trim()).filter(Boolean),
      published: partner?.published ?? true,
    })
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
        {partner ? 'Edit Partner' : 'New Partner'}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Type *</label>
          <select value={type} onChange={(e) => setType(e.target.value as PartnerType)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white">
            {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Logo URL</label>
        <input value={logo} onChange={(e) => setLogo(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Website URL</label>
        <input type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Project IDs (comma-separated UUIDs)</label>
        <input value={projectIdsStr} onChange={(e) => setProjectIdsStr(e.target.value)} placeholder="uuid-1, uuid-2" className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-medium rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 border border-white/20 transition-all disabled:opacity-50">
          {saving ? 'Saving…' : partner ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-medium rounded-full text-slate-500 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
          Cancel
        </button>
      </div>
    </form>
  )
}
