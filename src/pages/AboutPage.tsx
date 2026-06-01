import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { AboutView } from '@/sections/about-and-mission/components/AboutView'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NAV_ITEMS } from '@/lib/navigation'
import type { ValuePillar } from '@/../product/sections/about-and-mission/types'
import data from '@/../product/sections/about-and-mission/data.json'

export function AboutPage() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'About — JCA 1221 Holdings'
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
        <AboutView
        founderLetter={data.founderLetter}
        founderProfile={data.founderProfile}
        valuePillars={data.valuePillars as ValuePillar[]}
        ctaText={data.ctaText}
        onCtaClick={() => navigate('/contact')}
        />
      </ErrorBoundary>
    </AppShell>
  )
}
