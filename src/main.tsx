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
  // Render React first so body has dimensions before snapshot capture
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  )

  // Init liquidGL after React content is in the DOM.
  // requestAnimationFrame ensures paint cycle completes first.
  requestAnimationFrame(() => {
    initLiquidGL()
    // Recapture after ShaderBackground canvases are painted.
    // They have data-liquid-ignore so animated content stays out.
    setTimeout(() => {
      const r = window.__liquidGLRenderer__
      if (r && !r._capturing) {
        r.captureSnapshot().then(() => r.render())
      }
    }, 2000)
  })
}

// liquidGL script is deferred — wait a tick
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(boot))
} else {
  requestAnimationFrame(boot)
}
