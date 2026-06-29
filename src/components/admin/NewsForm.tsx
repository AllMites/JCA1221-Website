import { useState, useEffect, useRef } from 'react'
import { AlertCircle } from 'lucide-react'
import type { NewsArticle, NewsCategory, NewsType } from '@/lib/content-types'

interface NewsFormProps {
  article?: NewsArticle | null  // null = create mode
  onSave: (data: Partial<NewsArticle>) => Promise<void>
  onCancel: () => void
}

type FieldErrors = Partial<Record<keyof Partial<NewsArticle> | 'tags', string>>

const CATEGORIES: NewsCategory[] = ['awards', 'projects', 'policy', 'expansion', 'media']
const TYPES: NewsType[] = ['media-coverage', 'award', 'feature']

export function NewsForm({ article, onSave, onCancel }: NewsFormProps) {
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [excerpt, setExcerpt] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState<NewsCategory>('media')
  const [type, setType] = useState<NewsType>('media-coverage')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [publishMode, setPublishMode] = useState(article?.published ?? true)
  const [showConfirm, setShowConfirm] = useState(false)
  const submitRef = useRef<HTMLButtonElement>(null)

  // ── Character limits ────────────────────────────────────────────────────
  const EXCERPT_MAX = 300

  // ── Form state preservation ──────────────────────────────────────────────
  const savedFormRef = useRef({
    title: '', source: '', date: '', excerpt: '', url: '',
    category: 'media' as NewsCategory, type: 'media-coverage' as NewsType, tags: '',
  })

  useEffect(() => {
    if (article) {
      const vals = {
        title: article.title ?? '',
        source: article.source ?? '',
        date: article.date?.slice(0, 10) ?? '',
        excerpt: article.excerpt ?? '',
        url: article.url ?? '',
        category: article.category ?? 'media',
        type: article.type ?? 'media-coverage',
        tags: (article.tags ?? []).join(', '),
      }
      setTitle(vals.title)
      setSource(vals.source)
      setDate(vals.date)
      setExcerpt(vals.excerpt)
      setUrl(vals.url)
      setCategory(vals.category)
      setType(vals.type)
      setTags(vals.tags)
      savedFormRef.current = vals
    }
  }, [article])

  function clearFieldError(field: keyof FieldErrors) {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  /** Client-side validation */
  function validate(): boolean {
    const errs: FieldErrors = {}
    if (!title.trim()) errs.title = 'Title is required'
    if (!source.trim()) errs.source = 'Source is required'
    if (!date) errs.date = 'Date is required'
    if (!excerpt.trim()) errs.excerpt = 'Excerpt is required'
    else if (excerpt.trim().length < 10) errs.excerpt = 'Excerpt must be at least 10 characters'
    if (url && !/^https?:\/\/.+/.test(url.trim())) errs.url = 'Please enter a valid URL starting with http:// or https://'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  function doSave(publish: boolean) {
    setPublishMode(publish)
    if (!validate()) return
    setShowConfirm(true)
  }

  function confirmSave() {
    setShowConfirm(false)
    submitRef.current?.click()
  }

  function cancelSave() {
    setShowConfirm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitError('')

    if (!validate()) return

    setSaving(true)
    // Save form data in ref before submission
    savedFormRef.current = { title, source, date, excerpt, url, category, type, tags }

    try {
      await onSave({
        id: article?.id,
        title: title.trim(),
        source: source.trim(),
        date,
        excerpt: excerpt.trim(),
        url: url.trim(),
        category,
        type,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        published: publishMode,
      })
    } catch (err) {
      setSubmitError((err as Error).message || 'Failed to save article. Please try again.')
      // Form state is preserved — we never clear state variables on error
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
        {article ? 'Edit Article' : 'New Article'}
      </h3>

      {/* Submit error banner */}
      {submitError && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20">
          <p className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            {submitError}
          </p>
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Title *</label>
        <input
          value={title}
          onChange={(e) => { setTitle(e.target.value); clearFieldError('title') }}
          required
          className={inputClass('title')}
        />
        {fieldErrors.title && (
          <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.title}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Source *</label>
          <input
            value={source}
            onChange={(e) => { setSource(e.target.value); clearFieldError('source') }}
            required
            className={inputClass('source')}
          />
          {fieldErrors.source && (
            <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.source}
            </p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); clearFieldError('date') }}
            required
            className={inputClass('date')}
          />
          {fieldErrors.date && (
            <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.date}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as NewsCategory)} className={inputBase + ' ' + inputNormal}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as NewsType)} className={inputBase + ' ' + inputNormal}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Excerpt *</label>
        <textarea
          value={excerpt}
          onChange={(e) => { setExcerpt(e.target.value.slice(0, EXCERPT_MAX)); clearFieldError('excerpt') }}
          rows={3}
          maxLength={EXCERPT_MAX}
          className={`${inputClass('excerpt')} resize-none`}
        />
        <p className="text-right text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">{excerpt.length}/{EXCERPT_MAX}</p>
        {fieldErrors.excerpt && (
          <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.excerpt}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">URL</label>
        <input
          type="url"
          value={url}
          onChange={(e) => { setUrl(e.target.value); clearFieldError('url') }}
          className={inputClass('url')}
        />
        {fieldErrors.url && (
          <p className="flex items-center gap-1 mt-1 text-xs text-red-500 dark:text-red-400">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />{fieldErrors.url}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Tags (comma separated)</label>
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. Puerto Princesa, Awards, Water" className={inputBase + ' ' + inputNormal} />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => doSave(true)}
          disabled={saving}
          className="px-4 py-2 text-xs font-medium rounded-full text-white bg-lime-500/80 hover:bg-lime-500/90 border border-lime-400/30 transition-all disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Publish'}
        </button>
        <button
          type="button"
          onClick={() => doSave(false)}
          disabled={saving}
          className="px-4 py-2 text-xs font-medium rounded-full text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save as Draft'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 text-xs font-medium rounded-full text-slate-500 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
          Cancel
        </button>
      </div>
      <button type="submit" ref={submitRef} className="hidden" />

      {/* ── Confirmation modal ───────────────────────────────────────────── */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-[0_16px_48px_rgba(0,0,0,0.2)] p-6">
            <h4 className="text-lg font-heading font-semibold text-slate-900 dark:text-white mb-2">
              Confirm {publishMode ? 'Publish' : 'Save Draft'}
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              {publishMode
                ? 'Publish this article? It will be visible on the live site.'
                : 'Save this article as a draft?'}
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
                {publishMode ? 'Publish' : 'Save Draft'}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
