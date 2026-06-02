import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { NAV_ITEMS } from '@/lib/navigation'
import {
  listSubmissions,
  acknowledgeSubmission,
  softDeleteSubmission,
  type Submission,
} from '@/lib/api'

type StatusFilter = 'active' | 'all' | 'deleted'

export function AdminPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: location.pathname === item.href,
  }))

  // ── Auth state ─────────────────────────────────────────────────────
  const [code, setCode] = useState(() => sessionStorage.getItem('jca_admin_code') ?? '')
  const [authenticated, setAuthenticated] = useState(() => !!sessionStorage.getItem('jca_admin_code'))
  const [authError, setAuthError] = useState('')

  // ── Data state ─────────────────────────────────────────────────────
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [status, setStatus] = useState<StatusFilter>('active')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  useEffect(() => {
    document.title = 'Admin — JCA 1221 Holdings'
  }, [])

  // ── Login ──────────────────────────────────────────────────────────
  const handleLogin = () => {
    if (!code.trim()) {
      setAuthError('Enter the admin code')
      return
    }
    sessionStorage.setItem('jca_admin_code', code.trim())
    setAuthenticated(true)
    setAuthError('')
  }

  const handleLogout = () => {
    sessionStorage.removeItem('jca_admin_code')
    setAuthenticated(false)
    setCode('')
    setSubmissions([])
  }

  // ── Fetch ──────────────────────────────────────────────────────────
  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await listSubmissions(page, status)
      setSubmissions(res.submissions)
      setTotal(res.total)
      setTotalPages(res.total_pages)
    } catch (err) {
      // If the error is auth-related, re-prompt
      if ((err as Error).message === 'Unauthorized') {
        sessionStorage.removeItem('jca_admin_code')
        setAuthenticated(false)
        setCode('')
        setAuthError('Invalid or expired admin code')
      } else {
        setError((err as Error).message)
      }
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => {
    if (authenticated) fetchSubmissions()
  }, [authenticated, fetchSubmissions])

  // ── Actions ────────────────────────────────────────────────────────
  const handleAcknowledge = async (id: string, current: boolean) => {
    try {
      await acknowledgeSubmission(id, !current)
      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, acknowledged: !current } : s)),
      )
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const handleDelete = async (id: string, isDeleted: boolean) => {
    try {
      await softDeleteSubmission(id, isDeleted ? 'restore' : 'soft')
      if (status === 'active' && !isDeleted) {
        // Remove from list
        setSubmissions((prev) => prev.filter((s) => s.id !== id))
      } else {
        setSubmissions((prev) =>
          prev.map((s) =>
            s.id === id
              ? { ...s, deleted_at: isDeleted ? null : new Date().toISOString() }
              : s,
          ),
        )
      }
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── Login screen ───────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-sm p-6 rounded-2xl bg-white dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10">
          <h1 className="text-lg font-heading font-bold text-slate-900 dark:text-white mb-2">
            Admin Access
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Enter the admin code to view submissions.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleLogin()
            }}
          >
            <input
              type="password"
              placeholder="Admin code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-400/50 text-slate-900 dark:text-white placeholder:text-slate-400 mb-3"
            />
            {authError && (
              <p className="text-xs text-red-500 mb-3">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full px-4 py-2.5 text-sm font-heading font-semibold rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 border border-white/20 transition-all duration-200"
            >
              Sign In
            </button>
          </form>
          <p className="text-xs text-slate-400 text-center mt-4">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault()
                navigate('/')
              }}
              className="hover:text-slate-600 dark:hover:text-slate-300"
            >
              ← Back to site
            </a>
          </p>
        </div>
      </div>
    )
  }

  // ── Dashboard ──────────────────────────────────────────────────────
  return (
    <AppShell
      navigationItems={navItems}
      onNavigate={(href) => navigate(href)}
      onCtaClick={() => navigate('/contact')}
      siteName="JCA 1221 Admin"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">
              Contact Submissions
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {total} total{submissions.length !== total ? ` · showing ${submissions.length}` : ''}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-xs font-medium rounded-full text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            Sign Out
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['active', 'all', 'deleted'] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatus(s)
                setPage(1)
              }}
              className={`px-4 py-1.5 text-xs font-heading font-medium rounded-full border transition-all ${
                status === s
                  ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300 border-blue-300/40 dark:border-blue-400/30'
                  : 'text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20 text-sm text-red-600 dark:text-red-400">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-3 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12 text-sm text-slate-400">Loading…</div>
        )}

        {/* Empty */}
        {!loading && submissions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 dark:text-slate-500 text-sm">
              {status === 'deleted'
                ? 'No deleted submissions.'
                : 'No submissions yet.'}
            </p>
          </div>
        )}

        {/* List */}
        {!loading && submissions.length > 0 && (
          <div className="space-y-3">
            {submissions.map((s) => (
              <div
                key={s.id}
                className={`rounded-2xl border transition-all ${
                  s.deleted_at
                    ? 'bg-red-50/50 dark:bg-red-500/5 border-red-200 dark:border-red-400/10 opacity-60'
                    : s.acknowledged
                      ? 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10'
                      : 'bg-blue-50/70 dark:bg-blue-500/5 border-blue-200/70 dark:border-blue-400/15'
                }`}
              >
                {/* Header row */}
                <div className="flex items-center gap-3 px-5 py-3 cursor-pointer" onClick={() => toggleExpanded(s.id)}>
                  {/* Status dot */}
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      s.deleted_at
                        ? 'bg-red-400'
                        : s.acknowledged
                          ? 'bg-emerald-400'
                          : 'bg-blue-400 animate-pulse'
                    }`}
                    title={
                      s.deleted_at
                        ? 'Deleted'
                        : s.acknowledged
                          ? 'Acknowledged'
                          : 'New'
                    }
                  />
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {s.full_name}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline truncate">
                        {s.organization}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {new Date(s.created_at).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Manila',
                      })}
                    </div>
                  </div>
                  {/* Actions */}
                  <div className="flex gap-1.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {!s.deleted_at && (
                      <>
                        <button
                          onClick={() => handleAcknowledge(s.id, s.acknowledged)}
                          className={`px-3 py-1 text-[11px] font-medium rounded-full border transition-all ${
                            s.acknowledged
                              ? 'text-slate-500 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5'
                              : 'text-emerald-600 dark:text-emerald-400 border-emerald-300/50 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                          }`}
                        >
                          {s.acknowledged ? 'Unmark' : 'Acknowledge'}
                        </button>
                        <button
                          onClick={() => handleDelete(s.id, false)}
                          className="px-3 py-1 text-[11px] font-medium rounded-full border border-red-200/50 dark:border-red-400/20 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {s.deleted_at && (
                      <button
                        onClick={() => handleDelete(s.id, true)}
                        className="px-3 py-1 text-[11px] font-medium rounded-full border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded.has(s.id) && (
                  <div className="px-5 pb-4 pt-1 border-t border-slate-100 dark:border-white/5">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs mt-2">
                      <div>
                        <span className="text-slate-400">Email:</span>{' '}
                        <span className="text-slate-700 dark:text-slate-300">{s.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Org:</span>{' '}
                        <span className="text-slate-700 dark:text-slate-300">{s.organization}</span>
                      </div>
                      {s.phone && (
                        <div>
                          <span className="text-slate-400">Phone:</span>{' '}
                          <span className="text-slate-700 dark:text-slate-300">{s.phone}</span>
                        </div>
                      )}
                      {s.role && (
                        <div>
                          <span className="text-slate-400">Role:</span>{' '}
                          <span className="text-slate-700 dark:text-slate-300">{s.role}</span>
                        </div>
                      )}
                      {s.project_type && (
                        <div>
                          <span className="text-slate-400">Project Type:</span>{' '}
                          <span className="text-slate-700 dark:text-slate-300">{s.project_type}</span>
                        </div>
                      )}
                      {s.estimated_timeline && (
                        <div>
                          <span className="text-slate-400">Timeline:</span>{' '}
                          <span className="text-slate-700 dark:text-slate-300">{s.estimated_timeline}</span>
                        </div>
                      )}
                      {s.deleted_at && (
                        <div className="col-span-2">
                          <span className="text-slate-400">Deleted:</span>{' '}
                          <span className="text-slate-700 dark:text-slate-300">
                            {new Date(s.deleted_at).toLocaleDateString('en-PH', {
                              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium">Message:</p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {s.message}
                      </p>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <a
                        href={`mailto:${s.email}?subject=Re:%20JCA%201221%20inquiry`}
                        className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Reply via Email →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 text-xs rounded-full border border-slate-200 dark:border-white/10 disabled:opacity-30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              ← Prev
            </button>
            <span className="text-xs text-slate-500">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 text-xs rounded-full border border-slate-200 dark:border-white/10 disabled:opacity-30 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
