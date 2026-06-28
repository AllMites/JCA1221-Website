import { PageSEO } from '@/components/PageSEO'
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


  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: location.pathname === item.href,
  }))

  return (
    <>
      <PageSEO
        title="News — JCA 1221 Holdings"
        description="Latest news, project updates, and announcements from JCA 1221 Holdings."
        canonical="https://jca1221.com/news"
      />
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
    </>
  )
}
