import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { NewsView } from '@/sections/news/components/NewsView'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { NAV_ITEMS } from '@/lib/navigation'
import type { NewsArticle } from '@/../product/sections/news/types'
import data from '@/../product/sections/news/data.json'

export function NewsPage() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'News — JCA 1221 Holdings'
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
        <NewsView
          sectionTitle={data.sectionTitle}
          sectionSubtitle={data.sectionSubtitle}
          articles={data.articles as NewsArticle[]}
        />
      </ErrorBoundary>
    </AppShell>
  )
}
