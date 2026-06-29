import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

export function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, isEditor } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/admin' : '/edit', { replace: true })
    }
  }, [isAuthenticated, isAdmin, isEditor, navigate])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // Auth state change handler in AuthProvider will redirect
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm p-6 rounded-xl bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10">
        <h1 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-2">
          Sign In
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Access the content management system.
        </p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white placeholder:text-slate-400 mb-3"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white placeholder:text-slate-400 mb-3"
          />
          {error && (
            <p className="text-xs text-red-500 mb-3">{error}</p>
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
