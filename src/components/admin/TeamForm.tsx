import { useState, useEffect } from 'react'
import type { TeamMember } from '@/lib/content-types'

interface TeamFormProps {
  member?: TeamMember | null
  onSave: (data: Partial<TeamMember>) => Promise<void>
  onCancel: () => void
}

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

  useEffect(() => {
    if (member) {
      setName(member.name)
      setRole(member.role)
      setCredentials(member.credentials ?? '')
      setPhoto(member.photo ?? '')
      setBio(member.bio ?? '')
      setQuote(member.quote ?? '')
      setExpertiseStr((member.expertise ?? []).join(', '))
      setLinksJson(JSON.stringify(member.links ?? [], null, 2))
      setOrder((member.order ?? 0).toString())
    }
  }, [member])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    let links = []
    try { links = JSON.parse(linksJson) } catch {}

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
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
      <h3 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
        {member ? 'Edit Team Member' : 'New Team Member'}
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Name *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Role *</label>
          <input value={role} onChange={(e) => setRole(e.target.value)} required className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Credentials</label>
          <input value={credentials} onChange={(e) => setCredentials(e.target.value)} placeholder="e.g. PhD, PE, MBA" className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Photo URL</label>
          <input value={photo} onChange={(e) => setPhoto(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Bio *</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} required rows={4} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white resize-none" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Quote</label>
        <textarea value={quote} onChange={(e) => setQuote(e.target.value)} rows={2} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white resize-none" placeholder='"We believe in sustainable infrastructure..."' />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Expertise (comma separated)</label>
        <input value={expertiseStr} onChange={(e) => setExpertiseStr(e.target.value)} placeholder="Water Treatment, PPP, Environmental Engineering" className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Links (JSON)</label>
        <textarea value={linksJson} onChange={(e) => setLinksJson(e.target.value)} rows={3} className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white resize-none" placeholder='[{"type":"linkedin","label":"LinkedIn","url":"https://..."},{"type":"email","label":"Email","url":"mailto:..."}]' />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Order</label>
        <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white" style={{width:'120px'}} />
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
