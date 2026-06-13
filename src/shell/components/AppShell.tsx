import { useRef } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import { MainNav, type NavigationItem } from './MainNav'
import { UserMenu } from './UserMenu'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CookieConsent } from '@/components/CookieConsent'
import { ScrollReveal } from '@/components/ScrollReveal'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Team', href: '/team' },
  { label: 'News', href: '/news' },
  { label: 'Contact', href: '/contact' },
]

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
  const headerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  // Nav background: transparent at top, frosted glass after 50px scroll
  const headerBgOpacity = useTransform(scrollY, [0, 80], [0, 1])
  const headerBlur = useTransform(scrollY, [0, 80], [0, 12])
  const headerBorderOpacity = useTransform(scrollY, [0, 80], [0, 1])
  const headerShadow = useTransform(
    scrollY,
    [0, 80],
    [
      '0px 0px 0px rgba(0,0,0,0)',
      '3px 3px 8px rgba(0,0,0,0.06), -2px -2px 6px rgba(255,255,255,0.9)',
    ],
  )

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      {/* Skip-to-content — accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>

      {/* Top navigation bar — scroll-aware: transparent → frosted glass */}
      <motion.header
        ref={headerRef}
        className="sticky top-0 z-50 border-b border-white/20 dark:border-white/10"
        style={{
          backdropFilter: useTransform(headerBlur, (v) => `blur(${v}px)`),
          WebkitBackdropFilter: useTransform(headerBlur, (v) => `blur(${v}px)`),
          borderBottomColor: useTransform(headerBorderOpacity, (v) =>
            `rgba(255,255,255,${v * 0.2})`,
          ),
          boxShadow: useTransform(headerShadow, (v) => v as string),
        }}
      >
        {/* Animated background overlays — light/dark mode */}
        <motion.div
          className="absolute inset-0 bg-white dark:hidden"
          style={{ opacity: useTransform(headerBgOpacity, (v) => v * 0.6) }}
        />
        <motion.div
          className="absolute inset-0 bg-slate-900 hidden dark:block"
          style={{ opacity: useTransform(headerBgOpacity, (v) => v * 0.6) }}
        />
        <div
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          style={{ pointerEvents: 'auto' }}
        >
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault()
                onNavigate?.('/')
              }}
              className="text-lg font-bold font-heading tracking-tight shrink-0 text-foreground"
            >
              {siteName}
            </a>

            {/* Navigation + CTA + Theme */}
            <div className="flex items-center gap-3">
              <MainNav items={navigationItems} onNavigate={onNavigate} />
              <ThemeToggle className="text-slate-500 dark:text-slate-400" />
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
      </motion.header>

      {/* Main content area */}
      <div>
        {sidebarAnchors && sidebarAnchors.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Main content */}
            <main id="main-content" className="flex-1 min-w-0 py-8">{children}</main>

            {/* Floating glass sidebar with page anchors */}
            <aside className="lg:w-56 shrink-0 py-8">
              <nav
                className="sticky top-24 space-y-1 bg-card rounded-xl border border-border/10 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.08)] p-5"
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

      {/* Footer — enhanced with gradient, logo, and reveal animation */}
      <footer className="relative mt-16 border-t border-slate-200 dark:border-white/10 bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Subtle top glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent dark:via-blue-400/20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <ScrollReveal direction="up" duration={0.5}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
              {/* Brand column */}
              <div className="sm:col-span-2 lg:col-span-1">
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault()
                    onNavigate?.('/')
                  }}
                  className="inline-block"
                >
                  <span className="text-lg font-bold font-heading tracking-tight text-slate-900 dark:text-white">
                    {siteName}
                  </span>
                </a>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
                  Philippine environmental infrastructure — restoring coastal ecosystems through
                  nature-mimicking technology and public-private partnerships.
                </p>
                <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                  Makati, Metro Manila, Philippines
                </p>
              </div>

              {/* Navigation columns */}
              <div>
                <h4 className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
                  Navigate
                </h4>
                <ul className="space-y-2.5">
                  {NAV_LINKS.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault()
                          onNavigate?.(link.href)
                        }}
                        className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal column */}
              <div>
                <h4 className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
                  Legal
                </h4>
                <ul className="space-y-2.5">
                  <li>
                    <a
                      href="/privacy"
                      onClick={(e) => {
                        e.preventDefault()
                        onNavigate?.('/privacy')
                      }}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="/terms"
                      onClick={(e) => {
                        e.preventDefault()
                        onNavigate?.('/terms')
                      }}
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Terms of Service
                    </a>
                  </li>
                </ul>
              </div>

              {/* Contact column */}
              <div>
                <h4 className="text-xs font-semibold font-heading uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
                  Contact
                </h4>
                <ul className="space-y-2.5">
                  <li>
                    <a
                      href="mailto:info@jca1221.com"
                      className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      info@jca1221.com
                    </a>
                  </li>
                  <li>
                    <a
                      href="/contact"
                      onClick={(e) => {
                        e.preventDefault()
                        onNavigate?.('/contact')
                      }}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
                    >
                      Get in Touch →
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="pt-6 border-t border-slate-200 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-slate-400 dark:text-slate-500">
                &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
              </p>
              <p className="text-[10px] text-slate-300 dark:text-slate-600">
                Earth Renewal for Generations
              </p>
            </div>
          </ScrollReveal>
        </div>
      </footer>

      {/* Cookie consent — fixed position, site-wide */}
      <CookieConsent />
    </div>
  )
}
