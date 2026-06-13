import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import { PageTransitionOutlet } from '@/components/PageTransition'
import { PageSkeleton, HeroPageSkeleton, DetailPageSkeleton } from '@/components/PageSkeleton'

// ─── Lazy-loaded pages (code-split per route) ──────────────────────────────

const HomePage = lazy(() =>
  import('@/pages/HomePage').then((m) => ({ default: m.HomePage })),
)
// HomeAltPage disabled — file does not exist on disk
// const HomeAltPage = lazy(() =>
//   import('@/pages/HomeAltPage').then((m) => ({ default: m.HomeAltPage })),
// )
const AboutPage = lazy(() =>
  import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })),
)
const ProjectsPage = lazy(() =>
  import('@/pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })),
)
const ProjectDetailPage = lazy(() =>
  import('@/pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })),
)
const ContactPage = lazy(() =>
  import('@/pages/ContactPage').then((m) => ({ default: m.ContactPage })),
)
const PrivacyPage = lazy(() =>
  import('@/pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
)
const TermsPage = lazy(() =>
  import('@/pages/TermsPage').then((m) => ({ default: m.TermsPage })),
)
const TeamPage = lazy(() =>
  import('@/pages/TeamPage').then((m) => ({ default: m.TeamPage })),
)
const NewsPage = lazy(() =>
  import('@/pages/NewsPage').then((m) => ({ default: m.NewsPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)
const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const AdminPage = lazy(() =>
  import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage })),
)
const EditorPage = lazy(() => import('@/pages/EditorPage'))

// Design OS pages
const ProductPage = lazy(() =>
  import('@/components/ProductPage').then((m) => ({ default: m.ProductPage })),
)
const DataShapePage = lazy(() =>
  import('@/components/DataShapePage').then((m) => ({ default: m.DataShapePage })),
)
const DesignPage = lazy(() =>
  import('@/components/DesignPage').then((m) => ({ default: m.DesignPage })),
)
const SectionsPage = lazy(() =>
  import('@/components/SectionsPage').then((m) => ({ default: m.SectionsPage })),
)
const SectionPage = lazy(() =>
  import('@/components/SectionPage').then((m) => ({ default: m.SectionPage })),
)
const ScreenDesignPage = lazy(() =>
  import('@/components/ScreenDesignPage').then((m) => ({
    default: m.ScreenDesignPage,
  })),
)
const ScreenDesignFullscreen = lazy(() =>
  import('@/components/ScreenDesignPage').then((m) => ({
    default: m.ScreenDesignFullscreen,
  })),
)
const ShellDesignPage = lazy(() =>
  import('@/components/ShellDesignPage').then((m) => ({ default: m.ShellDesignPage })),
)
const ShellDesignFullscreen = lazy(() =>
  import('@/components/ShellDesignPage').then((m) => ({
    default: m.ShellDesignFullscreen,
  })),
)
const ExportPage = lazy(() =>
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
      <Suspended>
        <PageTransitionOutlet />
      </Suspended>
    ),
    children: [
      // ═══ JCA 1221 Website Routes ═══
      { path: '/', element: <HomePage /> },
      // { path: '/alt', element: <HomeAltPage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/projects', element: <ProjectsPage /> },
      { path: '/projects/:projectId', element: <ProjectDetailPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '/team', element: <TeamPage /> },
      { path: '/news', element: <NewsPage /> },
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
