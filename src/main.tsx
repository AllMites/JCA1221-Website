import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import { router } from '@/lib/router'
import { AuthProvider } from '@/hooks/use-auth'
import { NetworkStatus } from '@/components/NetworkStatus'

// No liquidGL elements currently active.
// Import { initLiquidGL } from '@/components/LiquidGlass' when needed
// for large fixed-position elements (e.g. hero overlay, shell panels).

const boot = () => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <HelmetProvider>
        <AuthProvider>
          <NetworkStatus />
          <RouterProvider router={router} />
        </AuthProvider>
      </HelmetProvider>
    </StrictMode>,
  )
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot)
} else {
  boot()
}
