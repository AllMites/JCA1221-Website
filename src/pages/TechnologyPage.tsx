import { useEffect } from 'react'
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

  useEffect(() => {
    document.title = 'Technology & Approach — JCA 1221 Holdings'
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
      <ErrorBoundary>
        <TechnologyView
        sectionTitle={data.sectionTitle}
        sectionSubtitle={data.sectionSubtitle}
        processSteps={data.processSteps}
        comparison={data.comparison}
        technologyPillars={data.technologyPillars}
        liveMetrics={data.liveMetrics as LiveMetrics}
        />
      </ErrorBoundary>
    </AppShell>
  )
}
