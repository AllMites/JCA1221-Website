import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter, Navigate, ScrollRestoration } from 'react-router-dom'
import { PageTransitionOutlet } from '@/components/PageTransition'
import { PageSkeleton, HeroPageSkeleton, DetailPageSkeleton } from '@/components/PageSkeleton'

// ─── Chunk loading ─────────────────────────────────────────────────────────

const CHUNK_TIMEOUT_MS = 8_000
const RELOAD_KEY = 'jca_chunk_reload'

/**
 * Guards against a reload loop when the chunk is genuinely unreachable (server
 * down) rather than merely stale. One reload per 30s window.
 */
function mayReload(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0)
    if (Date.now() - last < 30_000) return false
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    // Private mode / storage disabled: reloading is still the better outcome.
  }
  return true
}

/**
 * Route chunks are fetched at navigation time, and two failure modes leave the
 * Suspense skeleton on screen forever: a request that stalls and never settles,
 * and a deploy that rotates asset hashes so an already-open tab asks for a chunk
 * that no longer exists. Neither recovers on its own.
 *
 * Race the import against a timeout, retry once, then reload — which re-fetches
 * index.html and with it the current hashes. The pending promise returned on the
 * reload path keeps the skeleton up for the moment the reload takes to commit.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lazyRetry<T extends ComponentType<any>>(load: () => Promise<{ default: T }>) {
  const attempt = () =>
    Promise.race([
      load(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('chunk load timed out')), CHUNK_TIMEOUT_MS),
      ),
    ])

  return lazy(() =>
    attempt()
      .catch(attempt)
      .catch((err) => {
        if (!mayReload()) throw err
        window.location.reload()
        return new Promise<{ default: T }>(() => {})
      }),
  )
}

// ─── Lazy-loaded pages (code-split per route) ──────────────────────────────

const HomePage = lazyRetry(() =>
  import('@/pages/HomePage').then((m) => ({ default: m.HomePage })),
)
// HomeAltPage disabled — file does not exist on disk
// const HomeAltPage = lazyRetry(() =>
//   import('@/pages/HomeAltPage').then((m) => ({ default: m.HomeAltPage })),
// )
const AboutPage = lazyRetry(() =>
  import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })),
)
const ProjectsPage = lazyRetry(() =>
  import('@/pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })),
)
const ProjectDetailPage = lazyRetry(() =>
  import('@/pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })),
)
const ContactPage = lazyRetry(() =>
  import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })),
)
const PrivacyPage = lazyRetry(() =>
  import('@/pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
)
const TermsPage = lazyRetry(() =>
  import('@/pages/TermsPage').then((m) => ({ default: m.TermsPage })),
)
const TechnologyPage = lazyRetry(() =>
  import('@/pages/TechnologyPage').then((m) => ({ default: m.TechnologyPage })),
)
const TeamPage = lazyRetry(() =>
  import('@/pages/TeamPage').then((m) => ({ default: m.TeamPage })),
)
const NewsPage = lazyRetry(() =>
  import('@/pages/NewsPage').then((m) => ({ default: m.NewsPage })),
)
const FaqPage = lazyRetry(() =>
  import('@/pages/FaqPage').then((m) => ({ default: m.FaqPage })),
)
const NotFoundPage = lazyRetry(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)
const LoginPage = lazyRetry(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const AdminPage = lazyRetry(() =>
  import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage })),
)
const EditorPage = lazyRetry(() => import('@/pages/EditorPage'))

// Design OS pages
const ProductPage = lazyRetry(() =>
  import('@/components/ProductPage').then((m) => ({ default: m.ProductPage })),
)
const DataShapePage = lazyRetry(() =>
  import('@/components/DataShapePage').then((m) => ({ default: m.DataShapePage })),
)
const DesignPage = lazyRetry(() =>
  import('@/components/DesignPage').then((m) => ({ default: m.DesignPage })),
)
const SectionsPage = lazyRetry(() =>
  import('@/components/SectionsPage').then((m) => ({ default: m.SectionsPage })),
)
const SectionPage = lazyRetry(() =>
  import('@/components/SectionPage').then((m) => ({ default: m.SectionPage })),
)
const ScreenDesignPage = lazyRetry(() =>
  import('@/components/ScreenDesignPage').then((m) => ({
    default: m.ScreenDesignPage,
  })),
)
const ScreenDesignFullscreen = lazyRetry(() =>
  import('@/components/ScreenDesignPage').then((m) => ({
    default: m.ScreenDesignFullscreen,
  })),
)
const ShellDesignPage = lazyRetry(() =>
  import('@/components/ShellDesignPage').then((m) => ({ default: m.ShellDesignPage })),
)
const ShellDesignFullscreen = lazyRetry(() =>
  import('@/components/ShellDesignPage').then((m) => ({
    default: m.ShellDesignFullscreen,
  })),
)
const ExportPage = lazyRetry(() =>
  import('@/components/ExportPage').then((m) => ({ default: m.ExportPage })),
)

// ─── Skeleton map (per path pattern) ───────────────────────────────────────

function getSkeleton(pathname: string) {
  if (pathname === '/' || pathname === '/alt') return <HeroPageSkeleton />
  if (pathname.startsWith('/projects/') && pathname.split('/').length === 3)
    return <DetailPageSkeleton />
  return <PageSkeleton />
}

// ─── Suspense wrapper that picks right skeleton ─────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
function Suspended({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={getSkeleton(window.location.pathname)}>
      {children}
    </Suspense>
  )
}

// ─── Router ────────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  {
    element: (
      <>
        <Suspended>
          <PageTransitionOutlet />
        </Suspended>
        <ScrollRestoration />
      </>
    ),
    children: [
      // ═══ JCA 1221 Website Routes ═══
      { path: '/', element: <HomePage /> },
      // { path: '/alt', element: <HomeAltPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/projects', element: <ProjectsPage /> },
      { path: '/projects/:projectId', element: <ProjectDetailPage /> },
      { path: '/technology', element: <TechnologyPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/team', element: <TeamPage /> },
      { path: '/news', element: <NewsPage /> },
      { path: '/faqs', element: <FaqPage /> },
      { path: '/help', element: <Navigate to="/faqs" replace /> },
      { path: '/privacy', element: <PrivacyPage /> },
      { path: '/terms', element: <TermsPage /> },

      // ═══ Design OS Routes (for continued design work) ═══
      { path: '/design', element: <ProductPage /> },
      { path: '/design/data-shape', element: <DataShapePage /> },
      { path: '/design/design', element: <DesignPage /> },
      { path: '/design/sections', element: <SectionsPage /> },
      { path: '/design/sections/:sectionId', element: <SectionPage /> },
      {
        path: '/design/sections/:sectionId/screen-designs/:screenDesignName',
        element: <ScreenDesignPage />,
      },
      {
        path: '/design/sections/:sectionId/screen-designs/:screenDesignName/fullscreen',
        element: <ScreenDesignFullscreen />,
      },
      { path: '/design/shell/design', element: <ShellDesignPage /> },
      {
        path: '/design/shell/design/fullscreen',
        element: <ShellDesignFullscreen />,
      },
      { path: '/design/export', element: <ExportPage /> },

      // ═══ Admin ═══
      { path: '/login', element: <LoginPage /> },
      { path: '/admin', element: <AdminPage /> },
      { path: '/edit', element: <EditorPage /> },

      // ═══ 404 ═══
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
