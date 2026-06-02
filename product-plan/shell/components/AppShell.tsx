import { MainNav, type NavigationItem } from './MainNav'
import { UserMenu } from './UserMenu'

interface AppShellProps {
  children: React.ReactNode
  /** Site logo / name */
  siteName?: string
  /** Top-level navigation items */
  navigationItems: NavigationItem[]
  /** Optional in-page sidebar anchors */
  sidebarAnchors?: Array<{ label: string; href: string; isActive?: boolean }>
  /** CTA button config */
  ctaLabel?: string
  ctaHref?: string
  /** Callbacks */
  onNavigate?: (href: string) => void
  onCtaClick?: () => void
}

export function AppShell({
  children,
  siteName = 'JCA 1221 Holdings',
  navigationItems,
  sidebarAnchors,
  ctaLabel,
  ctaHref,
  onNavigate,
  onCtaClick,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body">
      {/* Top navigation bar — glass panel */}
      <header
        className="sticky top-0 z-50 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-[0_4px_24px_rgba(59,130,246,0.06)] dark:shadow-[0_4px_24px_rgba(59,130,246,0.04)]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault()
                onNavigate?.('/')
              }}
              className="text-lg font-bold font-heading text-slate-900 dark:text-white tracking-tight shrink-0"
            >
              {siteName}
            </a>

            {/* Navigation + CTA */}
            <div className="flex items-center gap-3">
              <MainNav items={navigationItems} onNavigate={onNavigate} />
              <div className="hidden md:block">
                <UserMenu
                  ctaLabel={ctaLabel}
                  ctaHref={ctaHref}
                  onCtaClick={onCtaClick}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {sidebarAnchors && sidebarAnchors.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Main content */}
            <main className="flex-1 min-w-0 py-8">{children}</main>

            {/* Floating glass sidebar with page anchors */}
            <aside className="lg:w-56 shrink-0 py-8">
              <nav
                className="sticky top-24 space-y-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 shadow-[0_8px_32px_rgba(59,130,246,0.06)] dark:shadow-[0_8px_32px_rgba(59,130,246,0.03)] p-5"
                aria-label="On this page"
              >
                <h4 className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  On this page
                </h4>
                {sidebarAnchors.map((anchor) => (
                  <a
                    key={anchor.href}
                    href={anchor.href}
                    onClick={(e) => {
                      e.preventDefault()
                      onNavigate?.(anchor.href)
                    }}
                    className={`block px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                      anchor.isActive
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/60 font-medium shadow-[inset_1px_1px_3px_rgba(0,0,0,0.04),inset_-1px_-1px_2px_rgba(255,255,255,0.5)]'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    {anchor.label}
                  </a>
                ))}
              </nav>
            </aside>
          </div>
        ) : (
          <main className="py-8">{children}</main>
        )}
      </div>

      {/* Footer — subtle glass bar */}
      <footer className="border-t border-white/20 dark:border-white/10 mt-16 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="font-heading font-medium text-slate-700 dark:text-slate-300">
              {siteName}
            </span>
            <span>
              Makati, Metro Manila, Philippines
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
