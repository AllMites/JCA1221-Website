import { useState, useEffect } from 'react'
import { Shield, ChevronDown } from 'lucide-react'
import {
  type ConsentState,
  hasChosenConsent,
  getConsent,
  setConsent,
} from '@/lib/analytics'

/**
 * Cookie consent banner — PH Data Privacy Act (RA 10173) + GDPR-aligned.
 *
 * Renders a fixed glass banner at the bottom of the viewport.  Three tiers:
 *   - Accept All — analytics + marketing cookies
 *   - Essential Only — no tracking (default, implicit on first load)
 *   - Customize — expand inline toggles per category
 *
 * Once dismissed (any choice), the banner stays gone until localStorage is
 * cleared or 12 months pass (auto-renew for GDPR validity).
 */

const EXPIRY_KEY = 'jca1221_cookie_consent_expiry'
const RENEWAL_MS = 365 * 24 * 60 * 60 * 1000 // 12 months

function hasExpired(): boolean {
  try {
    const ts = localStorage.getItem(EXPIRY_KEY)
    if (ts) return Date.now() > parseInt(ts, 10)
  } catch { /* ignore */ }
  return true
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [customizing, setCustomizing] = useState(false)
  const [state, setState] = useState<ConsentState>({ analytics: false, marketing: false })

  useEffect(() => {
    // Only show if consent hasn't been given or has expired
    if (!hasChosenConsent() || hasExpired()) {
      // Small delay so the banner doesn't flash on pageload before the page renders
      const id = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(id)
    }
    setState(getConsent())
  }, [])

  const acceptAll = () => {
    const s: ConsentState = { analytics: true, marketing: true }
    setConsent(s)
    setState(s)
    setExpiry()
    setVisible(false)
  }

  const essentialOnly = () => {
    const s: ConsentState = { analytics: false, marketing: false }
    setConsent(s)
    setState(s)
    setExpiry()
    setVisible(false)
  }

  const saveCustom = () => {
    setConsent(state)
    setExpiry()
    setVisible(false)
  }

  const setExpiry = () => {
    try {
      localStorage.setItem(EXPIRY_KEY, String(Date.now() + RENEWAL_MS))
    } catch { /* ignore */ }
  }

  const toggleCategory = (cat: keyof ConsentState) => {
    setState((prev) => ({ ...prev, [cat]: !prev[cat] }))
  }

  if (!visible) return null

  return (
    <>
      {/* Banner */}
      <div
        role="dialog"
        aria-label="Cookie consent"
        className="fixed bottom-0 left-0 right-0 z-[70] p-4 sm:p-6"
        style={{ animation: 'cookie-slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
      >
        <div className="max-w-2xl mx-auto rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-[0_-8px_40px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_-8px_40px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.03)] p-5 sm:p-6">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-400/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                This site uses cookies
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                We use cookies to understand how visitors use our site and to improve our
                services. We never sell your data. You can choose which categories to allow.
                See our{' '}
                <a
                  href="/privacy"
                  className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Privacy Policy
                </a>{' '}
                for details.
              </p>
            </div>
          </div>

          {/* Customize toggles */}
          <div
            className={`transition-all duration-300 overflow-hidden ${
              customizing ? 'max-h-60 opacity-100 mb-4' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="space-y-3 pt-2 pb-1">
              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Analytics
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Page views, button clicks, form interactions — helps us improve the site.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={state.analytics}
                  onChange={() => toggleCategory('analytics')}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 rounded-full bg-slate-300 dark:bg-slate-600 peer-checked:bg-blue-500 relative transition-colors flex-shrink-0 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4" />
              </label>

              <label className="flex items-center justify-between gap-3 cursor-pointer">
                <div>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Marketing
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Retargeting and ad measurement — we rarely run these, but the
                    option exists.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={state.marketing}
                  onChange={() => toggleCategory('marketing')}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 rounded-full bg-slate-300 dark:bg-slate-600 peer-checked:bg-blue-500 relative transition-colors flex-shrink-0 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4" />
              </label>
            </div>

            {/* Save custom */}
            <button
              onClick={saveCustom}
              className="mt-3 px-4 py-2 text-xs font-heading font-semibold rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 border border-white/20 transition-all duration-200"
            >
              Save Preferences
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={acceptAll}
              className="px-5 py-2.5 text-sm font-heading font-semibold rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 active:bg-blue-600/90 backdrop-blur-md border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-200"
            >
              Accept All
            </button>
            <button
              onClick={essentialOnly}
              className="px-5 py-2.5 text-sm font-heading font-medium rounded-full text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-white/10 transition-all duration-200"
            >
              Essential Only
            </button>
            <button
              onClick={() => setCustomizing(!customizing)}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-heading font-medium rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all duration-200"
            >
              Customize
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  customizing ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cookie-slide-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
