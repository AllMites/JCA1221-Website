import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'

const EDITOR_TABS = [
  { id: 'projects', label: 'Projects' },
  { id: 'news', label: 'News' },
  { id: 'team', label: 'Team' },
  { id: 'partners', label: 'Partners' },
  { id: 'csr', label: 'CSR' },
] as const

export type EditorTab = (typeof EDITOR_TABS)[number]['id']

interface EditorSidebarProps {
  activeTab: EditorTab
  onTabChange: (tab: EditorTab) => void
}

export function EditorSidebar({ activeTab, onTabChange }: EditorSidebarProps) {
  const { profile } = useAuth()

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <aside className="w-56 min-h-screen border-r border-slate-200 dark:border-white/10 bg-white/60 dark:bg-black/30 flex flex-col">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10">
        <h1 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
          Content Editor
        </h1>
        <p className="text-[11px] text-slate-400 mt-0.5">
          {profile?.email}
        </p>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {EDITOR_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-slate-200 dark:border-white/10">
        <button
          onClick={handleSignOut}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
