import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { HomeView } from '@/sections/home/components/HomeView'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NAV_ITEMS } from '@/lib/navigation'
import data from '@/../product/sections/home/data.json'

export function HomePage() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'JCA 1221 Holdings — Environmental Infrastructure'
  }, [])

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: item.href === '/' || location.pathname === item.href,
  }))

  return (
    <AppShell
      navigationItems={navItems}
      onNavigate={(href) => navigate(href)}
      onCtaClick={() => navigate('/contact')}
    >
      <ErrorBoundary>
        <HomeView
        hero={data.hero}
        projectCards={data.projectCards}
        missionValues={data.missionValues}
        impactStats={data.impactStats}
        expansion={data.expansion}
        onCtaClick={() => {
          const el = document.getElementById('projects')
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }}
        onProjectClick={(id) => navigate(`/projects/${id}`)}
        />
      </ErrorBoundary>
    </AppShell>
  )
}
