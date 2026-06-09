import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { AuditEntry } from '@/lib/content-types'

const ACTIONS: Record<string, { label: string; color: string }> = {
  create: { label: 'Created', color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10' },
  update: { label: 'Updated', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10' },
  delete: { label: 'Deleted', color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10' },
}

const PAGE_SIZE = 25

export function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tableFilter, setTableFilter] = useState<string>('')
  const [actionFilter, setActionFilter] = useState<string>('')
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('audit_log')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)

    if (tableFilter) {
      query = query.eq('table_name', tableFilter)
    }
    if (actionFilter) {
      query = query.eq('action', actionFilter)
    }

    const { data, error: fetchError, count } = await query

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setEntries((data ?? []) as AuditEntry[])
      setHasMore(count !== null ? count > (page + 1) * PAGE_SIZE : false)
    }
    setLoading(false)
  }, [page, tableFilter, actionFilter])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  function resetFilters() {
    setTableFilter('')
    setActionFilter('')
    setPage(0)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-heading font-bold text-slate-900 dark:text-white">Audit Log</h2>
        <button
          onClick={fetchEntries}
          className="px-3 py-1.5 text-[11px] font-medium rounded-full text-slate-500 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select
          value={tableFilter}
          onChange={(e) => { setTableFilter(e.target.value); setPage(0) }}
          className="px-3 py-1.5 text-[11px] rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 outline-none focus:border-blue-400/50"
        >
          <option value="">All tables</option>
          <option value="projects">Projects</option>
          <option value="news_articles">News</option>
          <option value="team_members">Team</option>
          <option value="partners">Partners</option>
          <option value="csr_projects">CSR</option>
          <option value="page_content">Page Content</option>
          <option value="profiles">Users</option>
        </select>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(0) }}
          className="px-3 py-1.5 text-[11px] rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 outline-none focus:border-blue-400/50"
        >
          <option value="">All actions</option>
          <option value="create">Created</option>
          <option value="update">Updated</option>
          <option value="delete">Deleted</option>
        </select>
        {(tableFilter || actionFilter) && (
          <button onClick={resetFilters} className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            Clear filters
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 mb-4 rounded-lg bg-red-50 dark:bg-red-500/5 border border-red-200/50 dark:border-red-500/20">
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-slate-200/50 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-slate-400 py-8 text-center">No audit entries found.</p>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                  <th className="text-left py-2.5 px-4 text-[10px] font-medium uppercase tracking-wider text-slate-400">When</th>
                  <th className="text-left py-2.5 px-4 text-[10px] font-medium uppercase tracking-wider text-slate-400">Action</th>
                  <th className="text-left py-2.5 px-4 text-[10px] font-medium uppercase tracking-wider text-slate-400">Table</th>
                  <th className="text-left py-2.5 px-4 text-[10px] font-medium uppercase tracking-wider text-slate-400">Record</th>
                  <th className="text-left py-2.5 px-4 text-[10px] font-medium uppercase tracking-wider text-slate-400">User</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-100 dark:border-white/5 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-4 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono">
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full ${ACTIONS[entry.action]?.color || 'text-slate-500 bg-slate-100 dark:bg-white/5'}`}>
                        {ACTIONS[entry.action]?.label || entry.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                      {entry.table_name}
                    </td>
                    <td className="py-2.5 px-4 text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[200px]">
                      {entry.record_id?.slice(0, 8)}…
                    </td>
                    <td className="py-2.5 px-4 text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[120px]">
                      {entry.user_id?.slice(0, 8)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-[11px] text-slate-400">
              Page {page + 1}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasMore}
                className="px-3 py-1.5 text-[11px] font-medium rounded-lg border border-slate-200 dark:border-white/10 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
