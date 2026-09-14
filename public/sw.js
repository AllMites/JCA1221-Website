// Tombstone service worker.
//
// The previous SW served same-origin images and scripts cache-first with a
// hardcoded cache name, so any file at a stable path (/images/**, /logo-nav.png,
// /scripts/liquidGL.js) was pinned to whatever bytes were first seen. Replacing
// an image on disk changed nothing for returning visitors until they hard-reloaded.
// It also wrapped asset fetches in respondWith() with no timeout, so a stalled
// chunk request hung forever behind the route skeleton.
//
// The CDN plus the immutable /assets/* headers already cover real caching, so the
// SW is gone rather than repaired. THIS FILE MUST STAY DEPLOYED: an installed SW
// is only evictable by a newer SW script at the same URL. Browsers re-check
// /sw.js on in-scope navigations even though nothing calls register() any more.
// Safe to delete once the install base has turned over (a year is plenty).

self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) await caches.delete(key)
      await self.registration.unregister()
      // Reload open tabs so they drop the stale assets they are already showing.
      // No register() call remains in index.html, so nothing reinstalls and this
      // cannot loop.
      for (const client of await self.clients.matchAll({ type: 'window' })) {
        client.navigate(client.url)
      }
    })(),
  )
})
