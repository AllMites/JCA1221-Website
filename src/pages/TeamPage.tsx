import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '@/shell/components/AppShell'
import { TeamView } from '@/sections/team/components/TeamView'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PageSkeleton } from '@/components/PageSkeleton'
import { NAV_ITEMS } from '@/lib/navigation'
import { useTeam } from '@/hooks/use-content'
import type { TeamMember } from '@/../product/sections/team/types'

const FALLBACK_TITLE = 'Meet Our Team'
const FALLBACK_SUBTITLE = 'Dedicated professionals committed to environmental infrastructure and community service.'

export function TeamPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { members, loading } = useTeam()

  useEffect(() => {
    document.title = 'Team — JCA 1221 Holdings'
  }, [])

  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    isActive: location.pathname === item.href,
  }))

  // Map Supabase team members to section shape
  const mappedMembers: TeamMember[] = members.map((m) => ({
    id: m.id,
    name: m.name,
    role: m.role,
    credentials: m.credentials ?? undefined,
    photo: m.photo ?? undefined,
    bio: m.bio,
    quote: m.quote ?? undefined,
    expertise: m.expertise ?? [],
    links: m.links ?? undefined,
    order: m.order,
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
          <TeamView
            sectionTitle={FALLBACK_TITLE}
            sectionSubtitle={FALLBACK_SUBTITLE}
            members={mappedMembers}
          />
        )}
      </ErrorBoundary>
    </AppShell>
  )
}
