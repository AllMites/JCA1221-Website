import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { TeamView } from '@/sections/team/components/TeamView'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NAV_ITEMS } from '@/lib/navigation'
import type { TeamMember } from '@/../product/sections/team/types'
import data from '@/../product/sections/team/data.json'

export function TeamPage() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Team — JCA 1221 Holdings'
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
        <TeamView
          sectionTitle={data.sectionTitle}
          sectionSubtitle={data.sectionSubtitle}
          members={data.members as TeamMember[]}
        />
      </ErrorBoundary>
    </AppShell>
  )
}
