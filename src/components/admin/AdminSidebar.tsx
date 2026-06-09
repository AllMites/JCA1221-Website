import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

type AdminTab = 'submissions' | 'news' | 'projects' | 'team' | 'partners' | 'csr' | 'page-content' | 'users' | 'media' | 'audit'

interface AdminSidebarProps {
  activeTab: AdminTab
  onTabChange: (tab: AdminTab) => void
}

const CONTENT_TABS: { id: AdminTab; label: string }[] = [
  { id: 'submissions', label: 'Submissions' },
  { id: 'news', label: 'News' },
  { id: 'projects', label: 'Projects' },
  { id: 'team', label: 'Team' },
  { id: 'partners', label: 'Partners' },
  { id: 'csr', label: 'CSR' },
  { id: 'page-content', label: 'Page Text' },
  { id: 'media', label: 'Media' },
]

const ADMIN_TABS: { id: AdminTab; label: string }[] = [
  { id: 'users', label: 'Users' },
  { id: 'audit', label: 'Audit Log' },
]

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const { isAdmin, profile } = useAuth()
  const navigate = useNavigate()

  const tabs = isAdmin ? [...CONTENT_TABS, null, ...ADMIN_TABS] : CONTENT_TABS

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="w-56 shrink-0 border-r border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950/50 min-h-screen p-4 flex flex-col">
      <div className="mb-6">
        <h2 className="text-sm font-heading font-bold text-slate-900 dark:text-white">
          JCA CMS
        </h2>
        <p className="text-xs text-slate-400 mt-1">{profile?.email}</p>
        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-300/30">
          {profile?.role}
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {tabs.map((tab) =>
          tab === null ? (
            <hr key="sep" className="my-2 border-slate-200 dark:border-white/5" />
          ) : (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full text-left px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          )
        )}
      </nav>

      <div className="pt-4 border-t border-slate-200 dark:border-white/5">
        <a href="/" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 block mb-2">
          ← View Site
        </a>
        <button
          onClick={handleLogout}
          className="text-xs text-red-500 hover:text-red-600"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
