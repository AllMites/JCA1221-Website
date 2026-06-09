import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { UserProfile } from '@/lib/content-types'

export function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function toggleRole(user: UserProfile) {
    const newRole: 'admin' | 'editor' = user.role === 'admin' ? 'editor' : 'admin'

    if (!confirm(`Change ${user.email} role from ${user.role} to ${newRole}?`)) return

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id)

    if (updateError) {
      alert(`Failed to update role: ${updateError.message}`)
      return
    }

    await fetchUsers()
  }

  async function removeUser(user: UserProfile) {
    if (!confirm(`Remove ${user.email}? This action cannot be undone.`)) return

    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id)

    if (deleteError) {
      alert(`Failed to remove user: ${deleteError.message}`)
      return
    }

    // Note: deleting the auth.users record requires the Supabase service_role key
    // and must be done via a secure backend endpoint or the Supabase dashboard.
    // Profile deletion effectively revokes access since profiles are checked on every request.
    await fetchUsers()
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-sm text-red-500">Error loading users: {error}</p>
        <button onClick={fetchUsers} className="mt-2 text-xs text-blue-500 hover:underline">Retry</button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-heading font-bold text-slate-900 dark:text-white">User Management</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">{users.length} user{users.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={fetchUsers}
          className="px-3 py-1.5 text-[11px] font-medium rounded-full text-slate-500 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-lg bg-slate-200/50 dark:bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-slate-400">Email</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-slate-400">Role</th>
                <th className="text-left py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-slate-400">Created</th>
                <th className="text-right py-3 px-4 text-[11px] font-medium uppercase tracking-wider text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-100 dark:border-white/5 last:border-0">
                  <td className="py-3 px-4">
                    <span className="text-slate-700 dark:text-slate-300">{user.email}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full ${
                      user.role === 'admin'
                        ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 border border-slate-200 dark:border-white/10'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-400">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => toggleRole(user)}
                        className="px-2 py-1 text-[10px] font-medium rounded text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                      >
                        {user.role === 'admin' ? 'Demote' : 'Promote'}
                      </button>
                      <button
                        onClick={() => removeUser(user)}
                        className="px-2 py-1 text-[10px] font-medium rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-[11px] text-slate-400">
        New users sign up via the Supabase Auth admin panel. Their profile is created automatically.
      </p>
    </div>
  )
}
