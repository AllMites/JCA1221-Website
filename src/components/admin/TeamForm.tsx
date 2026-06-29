import { useState, useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import type { TeamMember } from '@/lib/content-types'

interface TeamFormProps {
  member?: TeamMember | null
  onSave: (data: Partial<TeamMember>) => Promise<void>
  onCancel: () => void
}

type FieldErrors = Partial<Record<'name' | 'role' | 'bio' | 'photo', string>>

export function TeamForm({ member, onSave, onCancel }: TeamFormProps) {
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [credentials, setCredentials] = useState('')
  const [photo, setPhoto] = useState('')
  const [bio, setBio] = useState('')
  const [quote, setQuote] = useState('')
  const [expertiseStr, setExpertiseStr] = useState('')
  const [linksJson, setLinksJson] = useState('[]')
  const [order, setOrder] = useState('0')
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')

  // ── Form state preservation ──────────────────────────────────────────────
  const savedFormRef = useRef<Record<string, string>>({})

  useEffect(() => {
    if (member) {
      const vals: Record<string, string> = {
        name: member.name,
        role: member.role,
        credentials: member.credentials ?? '',
        photo: member.photo ?? '',
        bio: member.bio ?? '',
        quote: member.quote ?? '',
        expertiseStr: (member.expertise ?? []).join(', '),
        linksJson: JSON.stringify(member.links ?? [], null, 2),
        order: (member.order ?? 0).toString(),
      }
      setName(vals.name)
      setRole(vals.role)
      setCredentials(vals.credentials)
      setPhoto(vals.photo)
      setBio(vals.bio)
      setQuote(vals.quote)
      setExpertiseStr(vals.expertiseStr)
      setLinksJson(vals.linksJson)
      setOrder(vals.order)
      savedFormRef.current = vals
    }
  }, [member])

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
    if (!name.trim()) errs.name = 'Name is required'
    if (!role.trim()) errs.role = 'Role is required'
    if (!bio.trim()) errs.bio = 'Bio is required'
    else if (bio.trim().length < 10) errs.bio = 'Bio must be at least 10 characters'
    if (photo && !/^(https?:\/\/|\/)/.test(photo.trim())) errs.photo = 'Please enter a valid URL or path starting with /'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')

    if (!validate()) return

    setSaving(true)
    savedFormRef.current = { name, role, credentials, photo, bio, quote, expertiseStr, linksJson, order }

    let links = []
    try { links = JSON.parse(linksJson) } catch {}

    try {
      await onSave({
        id: member?.id,
        name: name.trim(),
        role: role.trim(),
        credentials: credentials.trim() || null,
        photo: photo.trim() || null,
        bio: bio.trim(),
        quote: quote.trim() || null,
        expertise: expertiseStr.split(',').map(e => e.trim()).filter(Boolean),
        links,
        order: parseInt(order) || 0,
        published: member?.published ?? true,
      })
    } catch (err) {
      setSubmitError((err as Error).message || 'Failed to save team member. Please try again.')
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
        {member ? 'Edit Team Member' : 'New Team Member'}
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
          <label className="block text-xs font-medium text-slate-500 mb-1">Role *</label>
          <input value={role} onChange={(e) => { setRole(e.target.value); clearFieldError('role') }} required className={inputClass('role')} />
          {fieldErrors.role && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.role}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Credentials</label>
          <input value={credentials} onChange={(e) => setCredentials(e.target.value)} placeholder="e.g. PhD, PE, MBA" className={inputBase + ' ' + inputNormal} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Photo URL</label>
          <input value={photo} onChange={(e) => { setPhoto(e.target.value); clearFieldError('photo') }} className={inputClass('photo')} />
          {fieldErrors.photo && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.photo}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Bio *</label>
        <textarea value={bio} onChange={(e) => { setBio(e.target.value); clearFieldError('bio') }} required rows={4} className={`${inputClass('bio')} resize-none`} />
        {fieldErrors.bio && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.bio}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Quote</label>
        <textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={2} className={inputBase + ' ' + inputNormal + ' resize-none'} placeholder='"We believe in sustainable infrastructure..."' />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Expertise (comma separated)</label>
        <input value={expertiseStr} onChange={(e) => setExpertiseStr(e.target.value)} placeholder="Water Treatment, PPP, Environmental Engineering" className={inputBase + ' ' + inputNormal} />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Links (JSON)</label>
        <textarea value={linksJson} onChange={(e) => setLinksJson(e.target.value)} rows={3} className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white resize-none" placeholder='[{"type":"linkedin","label":"LinkedIn","url":"https://..."},{"type":"email","label":"Email","url":"mailto:..."}]' />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Order</label>
        <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className={inputBase + ' ' + inputNormal} style={{width:'120px'}} />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-medium rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 border border-white/20 transition-all disabled:opacity-50">
          {saving ? 'Saving…' : member ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-medium rounded-full text-slate-500 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
          Cancel
        </button>
      </div>

    </form>
  )
}
