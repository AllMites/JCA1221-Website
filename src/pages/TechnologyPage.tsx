import { PageSEO } from '@/components/PageSEO'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { TechnologyView } from '@/sections/technology-and-approach/components/TechnologyView'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NAV_ITEMS } from '@/lib/navigation'
import type { LiveMetrics } from '@/../product/sections/technology-and-approach/types'
import data from '@/../product/sections/technology-and-approach/data.json'

export function TechnologyPage() {
  const location = useLocation()
  const navigate = useNavigate()


  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: location.pathname === item.href,
  }))

  return (
    <>
      <PageSEO
        title="Technology & Approach — JCA 1221 Holdings"
        description="Nature-mimicking water treatment, solid waste management, and coastal ecosystem restoration — the technology behind JCA 1221's environmental infrastructure projects."
        canonical="https://jca1221.com/technology"
      />
      <AppShell
        navigationItems={navItems}
        onNavigate={(href) => navigate(href)}
        onCtaClick={() => navigate('/contact')}
    >
      <ErrorBoundary>
        <TechnologyView
        sectionTitle={data.sectionTitle}
        sectionSubtitle={data.sectionSubtitle}
        carousel={data.carousel}
        processSteps={data.processSteps}
        comparison={data.comparison}
        technologyPillars={data.technologyPillars}
        liveMetrics={data.liveMetrics as LiveMetrics}
        />
      </ErrorBoundary>
    </AppShell>
    </>
  )
}
