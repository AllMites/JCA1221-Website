import { useState, useRef } from 'react'
import { ChevronDown, Check, AlertCircle, Send } from 'lucide-react'
import { ScrollReveal, RevealItem } from '@/components/ScrollReveal'
import type {
  FormConfig,
  InquiryType,
  TimelineOption,
  ContactFormData,
} from '@/../product/sections/contact-and-partnerships/types'

interface ContactFormProps {
  formConfig: FormConfig
  inquiryTypes: InquiryType[]
  timelineOptions: TimelineOption[]
  onSubmitBasic?: (data: ContactFormData) => void
  onSubmitDetailed?: (data: ContactFormData) => void
}

type FormErrors = Partial<Record<keyof ContactFormData, string>>

export function ContactForm({
  formConfig,
  inquiryTypes,
  timelineOptions,
  onSubmitBasic,
  onSubmitDetailed,
}: ContactFormProps) {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    organization: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [showDetailed, setShowDetailed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const scrollTarget = useRef<HTMLDivElement>(null)

  // ── Spam protection ──────────────────────────────────────────────────────
  const renderTime = useRef(Date.now())
  const lastSubmit = useRef(0)
  const [honeypot, setHoneypot] = useState('')
  const HONEYPOT_MIN_SECONDS = 3 // reject if form filled faster than this
  const COOLDOWN_SECONDS = 30 // minimum seconds between submissions

  const validate = (): boolean => {
    const errs: FormErrors = {}
    if (!formData.fullName.trim()) errs.fullName = 'Name is required'
    if (!formData.email.trim()) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email'
    }
    if (!formData.organization.trim()) errs.organization = 'Organization is required'
    if (!formData.message.trim()) {
      errs.message = 'Please tell us about your needs'
    } else if (formData.message.trim().length < 20) {
      errs.message = 'Please provide at least 20 characters'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleChange = (
    field: keyof ContactFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // ── Spam checks ────────────────────────────────────────────────────────
    // Honeypot: hidden field that only bots fill
    if (honeypot.trim().length > 0) {
      // Silently pretend success — bot thinks it worked
      setSubmitted(true)
      return
    }

    // Time check: humans take at least a few seconds to fill the form
    const elapsed = (Date.now() - renderTime.current) / 1000
    if (elapsed < HONEYPOT_MIN_SECONDS) {
      // Too fast — likely a bot. Silently discard.
      setSubmitted(true)
      return
    }

    // Cooldown: prevent rapid re-submissions
    const sinceLast = (Date.now() - lastSubmit.current) / 1000
    if (sinceLast < COOLDOWN_SECONDS) {
      setErrors({
        fullName:
          'Please wait before submitting again.',
      })
      return
    }

    if (!validate()) return

    lastSubmit.current = Date.now()
    setSubmitting(true)
    // Simulate brief submission delay
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      if (showDetailed && formData.projectType) {
        onSubmitDetailed?.(formData)
      } else {
        onSubmitBasic?.(formData)
      }
    }, 800)
  }

  const handleToggleDetailed = () => {
    setShowDetailed((prev) => !prev)
    setTimeout(() => {
      scrollTarget.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  // Success state
  if (submitted) {
    return (
      <div className="h-full flex items-center">
        <div className="p-8 sm:p-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.03)] text-center w-full">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-400/30 flex items-center justify-center">
            <Check className="w-8 h-8 text-emerald-600 dark:text-emerald-300" />
          </div>
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 dark:text-white mb-3">
            {formConfig.successMessage.title}
          </h3>
          <p className="text-slate-600 dark:text-slate-300/70 leading-relaxed mb-6 max-w-md mx-auto">
            {formConfig.successMessage.body}
          </p>
          <ul className="text-left max-w-sm mx-auto space-y-3 mb-6">
            {formConfig.successMessage.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-300 dark:border-blue-400/20 flex items-center justify-center mt-0.5">
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-300">{i + 1}</span>
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-300/70">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  // Form field renderer
  const renderField = (
    field: typeof formConfig.basicFields[0],
    value: string,
    options?: { value: string; label: string }[]
  ) => {
    const fieldName = field.name as keyof ContactFormData
    const error = errors[fieldName]
    const baseClasses = `w-full px-4 py-3 text-sm rounded-xl bg-slate-50 dark:bg-slate-800/60 border transition-all duration-300 outline-none font-body text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500`

    const stateClasses = error
      ? 'border-red-400/50 focus:border-red-400 shadow-[0_0_0_1px_rgba(248,113,113,0.15)]'
      : 'border-slate-200 dark:border-white/10 focus:border-blue-400/50 focus:shadow-[0_0_0_1px_rgba(0,0,0,0.2)] hover:border-slate-300 dark:hover:border-white/15'

    if (field.type === 'textarea') {
      return (
        <textarea
          name={field.name}
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => handleChange(fieldName, e.target.value)}
          rows={4}
          className={`${baseClasses} ${stateClasses} resize-none`}
        />
      )
    }

    if (field.type === 'select') {
      return (
        <div className="relative">
          <select
            name={field.name}
            value={value}
            onChange={(e) => handleChange(fieldName, e.target.value)}
            className={`${baseClasses} ${stateClasses} appearance-none cursor-pointer`}
          >
            <option value="" className="bg-white dark:bg-slate-900 text-slate-400">
              {field.placeholder}
            </option>
            {(options || []).map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
        </div>
      )
    }

    return (
      <input
        type={field.type}
        name={field.name}
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => handleChange(fieldName, e.target.value)}
        className={`${baseClasses} ${stateClasses}`}
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="h-full">
      <div className="p-6 sm:p-8 lg:p-10 rounded-xl bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.03)]">
        {/* Form header */}
        <div className="mb-8">
          <p className="text-xs font-mono uppercase tracking-widest text-blue-600 dark:text-blue-300/70 mb-3">
            Start a Partnership
          </p>
          <h3 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 dark:text-white mb-2">
            Send an Inquiry
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            We respond to every inquiry within 2 business days. All fields marked with{' '}
            <span className="text-blue-600 dark:text-blue-300">*</span> are required.
          </p>
        </div>

        {/* Basic fields */}
        <ScrollReveal staggerChildren={0.06}>
          <div className="space-y-4">
            {formConfig.basicFields.map((field) => {
              const fieldName = field.name as keyof ContactFormData
              return (
                <RevealItem key={field.name}>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 font-body">
                      {field.label}
                      {field.required && <span className="text-blue-600 dark:text-blue-300 ml-1">*</span>}
                    </label>
                    {renderField(field, formData[fieldName] || '')}
                    {errors[fieldName] && (
                      <p className="flex items-center gap-1.5 mt-1.5 text-xs text-red-500 dark:text-red-400">
                        <AlertCircle className="w-3 h-3 flex-shrink-0" />
                        {errors[fieldName]}
                      </p>
                    )}
                  </div>
                </RevealItem>
              )
            })}
          </div>
        </ScrollReveal>

        {/* Detailed fields toggle */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleToggleDetailed}
            className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors duration-200 group"
          >
            <div
              className={`w-5 h-5 rounded-full border transition-all duration-300 flex items-center justify-center ${
                showDetailed
                  ? 'border-blue-400/50 bg-blue-100 dark:bg-blue-500/20'
                  : 'border-slate-300 dark:border-white/15 bg-slate-100 dark:bg-white/5 group-hover:border-blue-400/30'
              }`}
            >
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-300 ${
                  showDetailed ? 'rotate-180 text-blue-600 dark:text-blue-300' : 'text-slate-400 dark:text-slate-500'
                }`}
              />
            </div>
            {formConfig.detailedToggleText}
          </button>
        </div>

        {/* Detailed fields */}
        <div
          className={`transition-all duration-500 overflow-hidden ${
            showDetailed ? 'max-h-[500px] mt-4 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div ref={scrollTarget} className="space-y-4 pt-2">
            {formConfig.detailedFields.map((field) => {
              const fieldName = field.name as keyof ContactFormData
              const options =
                field.name === 'projectType'
                  ? inquiryTypes
                  : field.name === 'estimatedTimeline'
                    ? timelineOptions
                    : undefined
              return (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1.5 font-body">
                    {field.label}
                    <span className="text-slate-400 dark:text-slate-500 ml-1 text-xs">(optional)</span>
                  </label>
                  {renderField(field, formData[fieldName] || '', options)}
                </div>
              )
            })}
          </div>
        </div>

        {/* Honeypot — hidden from humans, irresistible to bots */}
        <div className="absolute opacity-0 pointer-events-none" style={{ height: 0, overflow: 'hidden' }} aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            autoComplete="off"
            tabIndex={-1}
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="mt-8">
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-heading font-semibold rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 active:bg-blue-600/90 backdrop-blur-md border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.18),0_1px_3px_rgba(0,0,0,0.12)] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {formConfig.submitButtonText}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}
