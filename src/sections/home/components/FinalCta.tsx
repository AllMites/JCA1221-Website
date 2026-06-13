// src/sections/home/components/FinalCta.tsx
import { useState, type FormEvent } from 'react'
import { Mail, Phone, Send, Loader2 } from 'lucide-react'
import { ScrollReveal } from '@/components/ScrollReveal'
import { submitContact } from '@/lib/api'

interface FinalCtaProps {
  contactInfo: {
    email: string
    phone: string
  }
}

const DEFAULT_CONTACT_INFO = {
  email: 'contact@jca1221.com',
  phone: '+63 (2) 1234 5678',
}

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function FinalCta({ contactInfo }: FinalCtaProps) {
  const info = contactInfo.email ? contactInfo : DEFAULT_CONTACT_INFO

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [message, setMessage] = useState('')
  const [state, setState] = useState<FormState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const isValid = name.trim().length > 0 && email.trim().length > 0 && message.trim().length >= 10

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValid || state === 'loading') return

    setState('loading')
    setErrorMessage('')

    try {
      await submitContact({
        fullName: name.trim(),
        email: email.trim(),
        organization: organization.trim(),
        message: message.trim(),
      })
      setState('success')
    } catch (err) {
      setState('error')
      setErrorMessage(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      )
    }
  }

  if (state === 'success') {
    return (
      <section className="py-20 sm:py-28 bg-white dark:bg-slate-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="rounded-xl p-10 text-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-sm">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
                <Send size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white mb-2">
                Message Sent
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Thank you for reaching out. We&rsquo;ll get back to you within 24 hours.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 sm:py-28 bg-white dark:bg-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          {/* Decorative divider */}
          <div className="flex items-center justify-center mb-12">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-slate-900 dark:text-white mb-3">
              Let&rsquo;s Build Together
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
              Ready to bring environmental infrastructure to your community or portfolio?
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-xl p-6 sm:p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-white/20 dark:border-white/10 shadow-sm"
          >
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="cta-name" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="cta-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="cta-email" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  id="cta-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="cta-org" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Organization
              </label>
              <input
                id="cta-org"
                type="text"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors"
                placeholder="Your organization (optional)"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="cta-message" className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="cta-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={4}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-colors resize-none"
                placeholder="Tell us about your project or interest..."
              />
            </div>

            {state === 'error' && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={!isValid || state === 'loading'}
              className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 text-white font-semibold font-heading rounded-full
                bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400
                hover:from-blue-400 hover:via-cyan-400 hover:to-blue-400
                shadow-[0_0_24px_rgba(59,130,246,0.25),0_4px_12px_rgba(59,130,246,0.12)]
                hover:shadow-[0_0_36px_rgba(59,130,246,0.4),0_8px_20px_rgba(59,130,246,0.18)]
                active:scale-[0.97]
                transition-all duration-500
                disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
                overflow-hidden"
            >
              {/* Shine sweep on hover */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              {state === 'loading' ? (
                <span className="relative z-10 flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  Sending...
                </span>
              ) : (
                <span className="relative z-10 flex items-center gap-2.5">
                  <Send size={18} />
                  Send Message
                </span>
              )}
            </button>
          </form>

          {/* Contact info */}
          <div className="mt-6 flex items-center justify-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Mail size={14} />
              {info.email}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone size={14} />
              {info.phone}
            </span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
