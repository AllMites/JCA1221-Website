import { useState, useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import type { Partner, PartnerType } from '@/lib/content-types'

interface PartnerFormProps {
  partner?: Partner | null
  onSave: (data: Partial<Partner>) => Promise<void>
  onCancel: () => void
}

type FieldErrors = Partial<Record<'name' | 'websiteUrl', string>>

const TYPES: PartnerType[] = ['LGU', 'national_agency', 'private_sector', 'community', 'regulatory']

export function PartnerForm({ partner, onSave, onCancel }: PartnerFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<PartnerType>('LGU')
  const [logo, setLogo] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [projectIdsStr, setProjectIdsStr] = useState('')
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')

  // ── Form state preservation ──────────────────────────────────────────────
  const savedFormRef = useRef<Record<string, string>>({})

  useEffect(() => {
    if (partner) {
      const vals: Record<string, string> = {
        name: partner.name,
        logo: partner.logo ?? '',
        websiteUrl: partner.website_url ?? '',
        projectIdsStr: (partner.project_ids ?? []).join(', '),
      }
      setName(vals.name)
      setType(partner.type)
      setLogo(vals.logo)
      setWebsiteUrl(vals.websiteUrl)
      setProjectIdsStr(vals.projectIdsStr)
      savedFormRef.current = vals
    }
  }, [partner])

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
    if (!name.trim()) errs.name = 'Partner name is required'
    if (websiteUrl && !/^https?:\/\/.+/.test(websiteUrl.trim())) errs.websiteUrl = 'Please enter a valid URL starting with http:// or https://'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')

    if (!validate()) return

    setShowConfirm(true)
  }

  async function confirmSave() {
    setShowConfirm(false)
    setSaving(true)
    savedFormRef.current = { name, logo, websiteUrl, projectIdsStr }

    try {
      await onSave({
        id: partner?.id,
        name: name.trim(),
        type,
        logo: logo.trim() || null,
        website_url: websiteUrl.trim() || null,
        project_ids: projectIdsStr.split(',').map(p => p.trim()).filter(Boolean),
        published: partner?.published ?? true,
      })
    } catch (err) {
      setSubmitError((err as Error).message || 'Failed to save partner. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function cancelSave() {
    setShowConfirm(false)
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
        {partner ? 'Edit Partner' : 'New Partner'}
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
          <label className="block text-xs font-medium text-slate-500 mb-1">Type *</label>
          <select value={type} onChange={(e) => setType(e.target.value as PartnerType)} className={inputBase + ' ' + inputNormal}>
            {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Logo URL</label>
        <input value={logo} onChange={(e) => setLogo(e.target.value)} className={inputBase + ' ' + inputNormal} />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Website URL</label>
        <input
          type="url"
          value={websiteUrl}
          onChange={(e) => { setWebsiteUrl(e.target.value); clearFieldError('websiteUrl') }}
          className={inputClass('websiteUrl')}
        />
        {fieldErrors.websiteUrl && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.websiteUrl}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Project IDs (comma-separated UUIDs)</label>
        <input value={projectIdsStr} onChange={(e) => setProjectIdsStr(e.target.value)} placeholder="uuid-1, uuid-2" className={inputBase + ' ' + inputNormal} />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-medium rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 border border-white/20 transition-all disabled:opacity-50">
          {saving ? 'Saving…' : partner ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-medium rounded-full text-slate-500 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
          Cancel
        </button>
      </div>

      {/* ── Confirmation modal ───────────────────────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.2)] p-6">
            <h4 className="text-lg font-heading font-semibold text-slate-900 dark:text-white mb-2">
              Confirm {partner ? 'Update' : 'Create'}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              {partner ? 'Update this partner?' : 'Create this partner?'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={cancelSave}
                className="px-4 py-2 text-sm font-medium rounded-full text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSave}
                className="px-4 py-2 text-sm font-medium rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 border border-white/20 transition-all"
              >
                {partner ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
