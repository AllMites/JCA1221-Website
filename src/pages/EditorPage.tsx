import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRequireAuth } from '@/hooks/use-auth'
import { EditorSidebar, type EditorTab } from '@/components/editor/EditorSidebar'
import { GuideView } from '@/components/admin/GuideView'
import { NewsForm } from '@/components/admin/NewsForm'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { TeamForm } from '@/components/admin/TeamForm'
import { PartnerForm } from '@/components/admin/PartnerForm'
import { CsrForm } from '@/components/admin/CsrForm'
export default function EditorPage() {
  const { isAuthenticated, loading: authLoading } = useRequireAuth()

  // Auth gate
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Please sign in to access the editor.</p>
          <a href="/login" className="px-4 py-2 text-sm rounded-full bg-blue-500 text-white">Sign In</a>
        </div>
      </div>
    )
  }

  const [activeTab, setActiveTab] = useState<EditorTab>('projects')

  // Simple list state per type
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<any | null>(null)
  const [creating, setCreating] = useState(false)

  const TABLE_NAME_MAP: Record<EditorTab, string> = {
    projects: 'projects',
    news: 'news_articles',
    team: 'team_members',
    partners: 'partners',
    csr: 'csr_projects',
    guide: '', // guide tab renders GuideView, no backing table
  }
  const tableName = TABLE_NAME_MAP[activeTab]

  const fetchItems = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from(tableName)
      .select('*')
      .order('order', { ascending: true })
      .order('name', { ascending: true })
    setItems(data || [])
    setLoading(false)
  }, [tableName])

  useEffect(() => {
    fetchItems()
    setEditingItem(null)
    setCreating(false)
  }, [fetchItems])

  async function handleSave(data: any) {
    const { id, ...rest } = data
    if (id) {
      await supabase.from(tableName).update(rest).eq('id', id)
    } else {
      await supabase.from(tableName).insert(rest)
    }
    setEditingItem(null)
    setCreating(false)
    await fetchItems()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this item?')) return
    await supabase.from(tableName).delete().eq('id', id)
    setEditingItem(null)
    await fetchItems()
  }

  function getItemLabel(item: any): string {
    return item.name || item.title || item.key || item.id?.slice(0, 8) || 'Untitled'
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-black/20">
      <EditorSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 flex">
        {/* Guide tab — full width, no list panel */}
        {activeTab === 'guide' ? (
          <div className="flex-1 p-6 overflow-y-auto">
            <GuideView />
          </div>
        ) : (<>
          {/* List panel */}
        <div className="w-64 border-r border-slate-200 dark:border-white/10 bg-white/40 dark:bg-black/20 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-heading font-bold uppercase tracking-wider text-slate-400">
              {activeTab}
            </h2>
            <button
              onClick={() => { setEditingItem(null); setCreating(true) }}
              className="text-[11px] font-medium text-blue-500 hover:text-blue-600 transition-colors"
            >
              + New
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-9 rounded-lg bg-slate-200/50 dark:bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {items.map((item) => (
                <div key={item.id} className="group flex items-center">
                  <button
                    onClick={() => { setEditingItem(item); setCreating(false) }}
                    className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-all truncate ${
                      editingItem?.id === item.id
                        ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    {getItemLabel(item)}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="opacity-0 group-hover:opacity-100 px-2 py-1 text-[11px] text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-all"
                  >
                    ×
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">No items yet</p>
              )}
            </div>
          )}
        </div>

        {/* Form panel */}
        <div className="flex-1 p-6">
          {creating || editingItem ? (
            <>
              {activeTab === 'projects' && (
                <ProjectForm
                  project={creating ? null : editingItem}
                  onSave={handleSave}
                  onCancel={() => { setEditingItem(null); setCreating(false) }}
                />
              )}
              {activeTab === 'news' && (
                <NewsForm
                  article={creating ? null : editingItem}
                  onSave={handleSave}
                  onCancel={() => { setEditingItem(null); setCreating(false) }}
                />
              )}
              {activeTab === 'team' && (
                <TeamForm
                  member={creating ? null : editingItem}
                  onSave={handleSave}
                  onCancel={() => { setEditingItem(null); setCreating(false) }}
                />
              )}
              {activeTab === 'partners' && (
                <PartnerForm
                  partner={creating ? null : editingItem}
                  onSave={handleSave}
                  onCancel={() => { setEditingItem(null); setCreating(false) }}
                />
              )}
              {activeTab === 'csr' && (
                <CsrForm
                  csr={creating ? null : editingItem}
                  onSave={handleSave}
                  onCancel={() => { setEditingItem(null); setCreating(false) }}
                />
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <p className="text-sm text-slate-400">Select an item from the left</p>
                <p className="text-xs text-slate-300 mt-1">or click "+ New" to create one</p>
              </div>
            </div>
          )}
        </div>
          </>)}
      </main>
    </div>
  )
}
