import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { NewsView } from '@/sections/news/components/NewsView'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PageSkeleton } from '@/components/PageSkeleton'
import { NAV_ITEMS } from '@/lib/navigation'
import { useNews } from '@/hooks/use-content'

export function NewsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { articles, loading } = useNews()

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
        {loading ? (
          <PageSkeleton />
        ) : (
          <NewsView
            sectionTitle="News & Press Room"
            sectionSubtitle="Coverage, announcements, and recognition — transparency in action."
            articles={articles}
          />
        )}
      </ErrorBoundary>
    </AppShell>
  )
}
