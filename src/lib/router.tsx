import { createBrowserRouter } from 'react-router-dom'
import {
  HomePage,
  AboutPage,
  ProjectsPage,
  ProjectDetailPage,
  TechnologyPage,
  ContactPage,
  NotFoundPage,
} from '@/pages'

// Design OS pages — kept under /design prefix for continued design work
import { ProductPage } from '@/components/ProductPage'
import { DataShapePage } from '@/components/DataShapePage'
import { DesignPage } from '@/components/DesignPage'
import { SectionsPage } from '@/components/SectionsPage'
import { SectionPage } from '@/components/SectionPage'
import {
  ScreenDesignPage,
  ScreenDesignFullscreen,
} from '@/components/ScreenDesignPage'
import {
  ShellDesignPage,
  ShellDesignFullscreen,
} from '@/components/ShellDesignPage'
import { ExportPage } from '@/components/ExportPage'

export const router = createBrowserRouter([
  // ═══ JCA 1221 Website Routes ═══
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/projects',
    element: <ProjectsPage />,
  },
  {
    path: '/projects/:projectId',
    element: <ProjectDetailPage />,
  },
  {
    path: '/technology',
    element: <TechnologyPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },

  // ═══ Design OS Routes (for continued design work) ═══
  {
    path: '/design',
    element: <ProductPage />,
  },
  {
    path: '/design/data-shape',
    element: <DataShapePage />,
  },
  {
    path: '/design/design',
    element: <DesignPage />,
  },
  {
    path: '/design/sections',
    element: <SectionsPage />,
  },
  {
    path: '/design/sections/:sectionId',
    element: <SectionPage />,
  },
  {
    path: '/design/sections/:sectionId/screen-designs/:screenDesignName',
    element: <ScreenDesignPage />,
  },
  {
    path: '/design/sections/:sectionId/screen-designs/:screenDesignName/fullscreen',
    element: <ScreenDesignFullscreen />,
  },
  {
    path: '/design/shell/design',
    element: <ShellDesignPage />,
  },
  {
    path: '/design/shell/design/fullscreen',
    element: <ShellDesignFullscreen />,
  },
  {
    path: '/design/export',
    element: <ExportPage />,
  },

  // ═══ 404 ═══
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
