import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { AboutView } from '@/sections/about-and-mission/components/AboutView'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PageSkeleton } from '@/components/PageSkeleton'
import { NAV_ITEMS } from '@/lib/navigation'
import { usePageContent, getPageValue } from '@/hooks/use-content'
import type { ValuePillar, FounderProfile } from '@/../product/sections/about-and-mission/types'

const FALLBACK_CTA = 'Partner With Us'

export function AboutPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { content, loading } = usePageContent('about')

  useEffect(() => {
    document.title = 'About — JCA 1221 Holdings'
  }, [])

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: location.pathname === item.href,
  }))

  const founderLetter = (getPageValue(content, 'founder', 'letter') as string) ?? ''
  const founderProfile = getPageValue(content, 'founder', 'profile') as FounderProfile | null
  const valuePillars: ValuePillar[] = (getPageValue(content, 'values', 'pillars') as ValuePillar[]) ?? []

  return (
    <AppShell
      navigationItems={navItems}
      onNavigate={(href) => navigate(href)}
      onCtaClick={() => navigate('/contact')}
    >
      <ErrorBoundary>
        {loading ? (
          <PageSkeleton />
        ) : (
          <AboutView
            founderLetter={founderLetter}
            founderProfile={founderProfile ?? {
              name: '',
              role: '',
              photo: '',
              signatureQuote: '',
              quotes: [],
              milestones: [],
            }}
            valuePillars={valuePillars}
            ctaText={FALLBACK_CTA}
            onCtaClick={() => navigate('/contact')}
          />
        )}
      </ErrorBoundary>
    </AppShell>
  )
}
