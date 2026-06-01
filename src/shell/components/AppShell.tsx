import { MainNav, type NavigationItem } from './MainNav'
import { UserMenu } from './UserMenu'
import { ThemeToggle } from '@/components/ThemeToggle'

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
  /** Make header transparent/overlaid (for full-screen hero pages) */
  transparent?: boolean
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
  transparent = false,
  onNavigate,
  onCtaClick,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      {/* Skip-to-content — accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      {/* Top navigation bar — glass panel (or transparent overlay on hero pages) */}
      <header
        className={`top-0 z-50 border-b transition-all duration-500 ${
          transparent
            ? 'absolute bg-transparent backdrop-blur-none border-transparent'
            : 'sticky bg-card/60 backdrop-blur-xl border-border/10 shadow-[0_4px_24px_rgba(59,130,246,0.06)] dark:shadow-[0_4px_24px_rgba(59,130,246,0.04)]'
        }`}
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
              className={`text-lg font-bold font-heading tracking-tight shrink-0 transition-colors duration-500 ${transparent ? 'text-white' : 'text-foreground'}`}
            >
              {siteName}
            </a>

            {/* Navigation + CTA + Theme */}
            <div className="flex items-center gap-3">
              <MainNav items={navigationItems} onNavigate={onNavigate} />
              <ThemeToggle className={transparent ? 'text-white hover:text-blue-200' : 'text-slate-500 dark:text-slate-400'} />
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
      <div>
        {sidebarAnchors && sidebarAnchors.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main content */}
            <main id="main-content" className="flex-1 min-w-0 py-8">{children}</main>

            {/* Floating glass sidebar with page anchors */}
            <aside className="lg:w-56 shrink-0 py-8">
              <nav
                className="sticky top-24 space-y-1 bg-card/70 backdrop-blur-xl rounded-2xl border border-border/10 shadow-[0_8px_32px_rgba(59,130,246,0.06)] dark:shadow-[0_8px_32px_rgba(59,130,246,0.03)] p-5"
                aria-label="On this page"
              >
                <h4 className="text-xs font-semibold font-heading uppercase tracking-wider text-muted-foreground mb-3">
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
                        ? 'text-primary dark:text-blue-400 bg-accent/80 dark:bg-accent/60 font-medium shadow-[inset_1px_1px_3px_rgba(0,0,0,0.04),inset_-1px_-1px_2px_rgba(255,255,255,0.5)]'
                        : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
                    }`}
                  >
                    {anchor.label}
                  </a>
                ))}
              </nav>
            </aside>
          </div>
        ) : (
          <main id="main-content">{children}</main>
        )}
      </div>

      {/* Footer — subtle glass bar (hidden on transparent/hero pages) */}
      {!transparent && (
        <footer className="border-t border-border/10 mt-16 bg-card/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <span className="font-heading font-medium text-foreground/80">
              {siteName}
            </span>
            <span>
              Makati, Metro Manila, Philippines
            </span>
          </div>
        </div>
      </footer>
      )}
    </div>
  )
}
