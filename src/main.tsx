import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from '@/lib/router'

// No liquidGL elements currently active.
// Import { initLiquidGL } from '@/components/LiquidGlass' when needed
// for large fixed-position elements (e.g. hero overlay, shell panels).

const boot = () => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot)
} else {
  boot()
}
