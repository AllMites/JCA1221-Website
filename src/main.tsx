import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from '@/lib/router'
import { initLiquidGL } from '@/components/LiquidGlass'

// Initialize liquidGL — creates the shared WebGL renderer.
// The constructor captures a snapshot immediately; retries handle
// the case where body is empty before React renders.
// We also recapture 2s after boot to get ShaderBackground canvases
// (which are now marked data-liquid-ignore) excluded.
const boot = () => {
  initLiquidGL()
  // Recapture after React has rendered the first page.
  // ShaderBackground canvases have data-liquid-ignore so the snapshot
  // won't include animated shader content.
  setTimeout(() => {
    const r = window.__liquidGLRenderer__
    if (r && !r._capturing) {
      r.captureSnapshot().then(() => r.render())
    }
  }, 2000)
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )
}

// liquidGL script is deferred — wait a tick
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(boot))
} else {
  requestAnimationFrame(boot)
}
