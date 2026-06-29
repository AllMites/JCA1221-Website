import { useState, useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import type { PageContent } from '@/lib/content-types'

interface PageContentFormProps {
  content?: PageContent | null
  onSave: (data: Partial<PageContent>) => Promise<void>
  onCancel: () => void
}

type FieldErrors = Partial<Record<'page' | 'key' | 'value', string>>

export function PageContentForm({ content, onSave, onCancel }: PageContentFormProps) {
  const [page, setPage] = useState('')
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [order, setOrder] = useState('0')
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // ── Character limits ────────────────────────────────────────────────────
  const VALUE_MAX = 5000
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')

  // ── Form state preservation ──────────────────────────────────────────────
  const savedFormRef = useRef<Record<string, string>>({})

  useEffect(() => {
    if (content) {
      const vals: Record<string, string> = {
        page: content.page ?? '',
        key: content.key ?? '',
        value: (content.value as string) ?? '',
        order: (content.order ?? 0).toString(),
      }
      setPage(vals.page)
      setKey(vals.key)
      setValue(vals.value)
      setOrder(vals.order)
      savedFormRef.current = vals
    }
  }, [content])

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
    if (!page) errs.page = 'Please select a page'
    if (!key.trim()) errs.key = 'Content key is required'
    else if (!/^[a-z0-9_]+$/.test(key.trim().toLowerCase().replace(/\s+/g, '_'))) errs.key = 'Key must contain only lowercase letters, numbers, and underscores'
    if (!value.trim()) errs.value = 'Content value is required'
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
    savedFormRef.current = { page, key, value, order }

    try {
      await onSave({
        id: content?.id,
        page: page.trim(),
        key: key.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
        value: value.trim(),
        order: parseInt(order) || 0,
        published: content?.published ?? true,
      })
    } catch (err) {
      setSubmitError((err as Error).message || 'Failed to save page content. Please try again.')
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
        {content ? 'Edit Page Content' : 'New Page Content'}
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
          <label className="block text-xs font-medium text-slate-500 mb-1">Page *</label>
          <select value={page} onChange={(e) => { setPage(e.target.value); clearFieldError('page') }} required className={inputClass('page')}>
            <option value="">Select page...</option>
            <option value="home">Home</option>
            <option value="about">About</option>
            <option value="projects">Projects</option>
            <option value="team">Team</option>
            <option value="contact">Contact</option>
            <option value="news">News</option>
            <option value="global">Global</option>
          </select>
          {fieldErrors.page && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.page}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Key *</label>
          <input value={key} onChange={(e) => { setKey(e.target.value); clearFieldError('key') }} required placeholder="hero_title" className={inputClass('key')} />
          {fieldErrors.key && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.key}</p>}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Value *</label>
        <textarea value={value} onChange={(e) => { setValue(e.target.value.slice(0, VALUE_MAX)); clearFieldError('value') }} required rows={4} maxLength={VALUE_MAX} className={`${inputClass('value')} resize-none`} />
        <p className="text-right text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">{value.length}/{VALUE_MAX}</p>
        {fieldErrors.value && <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400"><AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.value}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Order</label>
        <input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className={inputBase + ' ' + inputNormal} />
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-medium rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 border border-white/20 transition-all disabled:opacity-50">
          {saving ? 'Saving…' : content ? 'Update' : 'Create'}
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
              Confirm {content ? 'Update' : 'Create'}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              {content ? 'Update this page content?' : 'Create this page content?'}
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
                {content ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
