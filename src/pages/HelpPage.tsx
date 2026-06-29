import { PageSEO } from '@/components/PageSEO'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { HelpView } from '@/sections/faq/HelpView'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NAV_ITEMS } from '@/lib/navigation'

export function HelpPage() {
  const location = useLocation()
  const navigate = useNavigate()

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: location.pathname === item.href,
  }))

  return (
    <>
      <PageSEO
        title="Help & Documentation — JCA 1221 Holdings"
        description="Find answers to frequently asked questions about partnering with JCA1221 Holdings, explore our glossary of environmental infrastructure terms, and download our capability statement."
        canonical="https://jca1221.com/help"
      />
      <AppShell
        navigationItems={navItems}
        onNavigate={(href) => navigate(href)}
        onCtaClick={() => navigate('/contact')}
      >
        <ErrorBoundary>
          <HelpView
            ctaText="Partner With Us"
            onCtaClick={() => navigate('/contact')}
          />
        </ErrorBoundary>
      </AppShell>
    </>
  )
}
