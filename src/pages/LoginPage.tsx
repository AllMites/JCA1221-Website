import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

/** Map known Supabase auth error messages to user-friendly versions. */
function friendlyAuthError(raw: string): string {
  const lower = raw.toLowerCase()
  if (lower.includes('invalid login credentials') || lower.includes('invalid email or password')) {
    return 'Invalid email or password. Please check your credentials and try again.'
  }
  if (lower.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in. Check your inbox for the confirmation link.'
  }
  if (lower.includes('user not found')) {
    return 'No account found with this email address.'
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Too many sign-in attempts. Please wait a moment and try again.'
  }
  if (lower.includes('network') || lower.includes('fetch')) {
    return 'Unable to connect to the server. Please check your internet connection and try again.'
  }
  // Fallback: return the raw message, but still more helpful than raw
  return `Sign in failed: ${raw}`
}

type FieldErrors = { email?: string; password?: string }

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, isEditor } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)

  // ── Form state preservation: save form data so it survives re-renders on error ──
  const savedFormRef = useRef<{ email: string; password: string }>({ email: '', password: '' })
  const restoredRef = useRef(false)

  // Restore saved form data on mount if we had a previous failed submission
  useEffect(() => {
    if (!restoredRef.current) {
      const saved = savedFormRef.current
      if (saved.email || saved.password) {
        setEmail(saved.email)
        setPassword(saved.password)
      }
      restoredRef.current = true
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/edit', { replace: true })
    }
  }, [isAuthenticated, isAdmin, isEditor, navigate])

  /** Client-side validation */
  function validate(): boolean {
    const errs: FieldErrors = {}
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      errs.email = 'Please enter your email address'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errs.email = 'Please enter a valid email address'
    }

    if (!password) {
      errs.password = 'Please enter your password'
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters'
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  /** Clear a specific field error when user starts typing */
  function clearFieldError(field: keyof FieldErrors) {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    // Client-side validation first
    if (!validate()) return

    setLoading(true)

    // Save form data in ref before submission (state is preserved via ref)
    savedFormRef.current = { email: email.trim(), password }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (authError) {
      setFormError(friendlyAuthError(authError.message))
      setLoading(false)
      // Form state is preserved automatically — we never clear state variables
      return
    }

    // Auth state change handler in AuthProvider will redirect
    setLoading(false)
  }

  // Shared input classes
  const inputBase = 'w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-white/5 border outline-none text-slate-900 dark:text-white placeholder:text-slate-400 transition-all duration-200'
  const inputNormal = 'border-slate-200 dark:border-white/10 focus:border-blue-400/50'
  const inputError = 'border-red-400/50 dark:border-red-400/30 focus:border-red-400 shadow-[0_0_0_1px_rgba(248,113,113,0.15)]'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm p-6 rounded-xl bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10">
        <h1 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-2">
          Sign In
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Access the content management system.
        </p>
        <form onSubmit={handleLogin} noValidate>
          {/* Email field */}
          <div className="mb-4">
            <label htmlFor="login-email" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                clearFieldError('email')
              }}
              autoComplete="email"
              className={`${inputBase} ${fieldErrors.email ? inputError : inputNormal} mb-1`}
            />
            {fieldErrors.email && (
              <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="mb-4">
            <label htmlFor="login-password" className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                clearFieldError('password')
              }}
              autoComplete="current-password"
              className={`${inputBase} ${fieldErrors.password ? inputError : inputNormal} mb-1`}
            />
            {fieldErrors.password && (
              <p className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Form-level error (from server) */}
          {formError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20">
              <p className="text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                {formError}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2.5 text-sm font-heading font-semibold rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 border border-white/20 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <p className="text-xs text-slate-400 text-center mt-4">
          <a href="/" className="hover:text-slate-600 dark:hover:text-slate-300">
            ← Back to site
          </a>
        </p>
      </div>
    </div>
  )
}
