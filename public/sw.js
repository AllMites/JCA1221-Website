// Service worker for JCA 1221 Holdings
// Simple stale-while-revalidate pattern — serves cached assets instantly, updates cache in background.

const CACHE = 'jca1221-v1'

const PRECACHE_URLS = [
  '/',
  '/index.html',
]

// Install: pre-cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Individual failures are non-fatal — the page still works online
      })
    })
  )
  // Activate immediately — don't wait for old SW to release
  self.skipWaiting()
})

// Activate: purge old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
      )
    })
  )
  // Claim all clients so the new SW controls pages immediately
  self.clients.claim()
})

// Fetch: stale-while-revalidate for navigation + assets
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle GET requests from our own origin
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  // Skip browser extensions and non-http(s)
  if (!url.protocol.startsWith('http')) return

  // Skip analytics / tracking requests
  if (url.pathname.includes('analytics') || url.pathname.includes('gtag')) return

  // Navigation requests: network-first (SPA — we want fresh HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const cloned = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, cloned))
          return response
        })
        .catch(() => {
          // Offline: serve cached shell
          return caches.match(request).then((cached) => cached || caches.match('/'))
        })
    )
    return
  }

  // Static assets: cache-first (JS, CSS, fonts, images — fingerprinted URLs are immutable)
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot)$/) ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          const cloned = response.clone()
          caches.open(CACHE).then((cache) => cache.put(request, cloned))
          return response
        })
      })
    )
    return
  }

  // Everything else: network-first fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        const cloned = response.clone()
        caches.open(CACHE).then((cache) => cache.put(request, cloned))
        return response
      })
      .catch(() => caches.match(request))
  )
})
