import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { NAV_ITEMS } from '@/lib/navigation'

export function NotFoundPage() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = '404 — Page Not Found — JCA 1221 Holdings'
  }, [])

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: location.pathname === item.href,
  }))

  return (
    <AppShell
      navigationItems={navItems}
      onNavigate={(href) => navigate(href)}
      onCtaClick={() => navigate('/contact')}
    >
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <h1 className="text-8xl font-heading font-bold text-slate-200 dark:text-slate-800 mb-4">
          404
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xl mb-2">
          Page not found
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-sm mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 text-sm font-medium font-heading rounded-full text-white bg-blue-500/80 hover:bg-blue-500/90 backdrop-blur-md border border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.12)] transition-all duration-300"
        >
          Back to Home
        </button>
      </div>
    </AppShell>
  )
}
