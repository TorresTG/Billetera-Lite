const CACHE_PREFIX = 'mi-billetera-lite-'
const CACHE_NAME = `${CACHE_PREFIX}v1`
const PRECACHE_ASSETS = ["/assets/index-CMsAc8v4.css","/assets/index-CeKMu2c6.js"]
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  ...PRECACHE_ASSETS,
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME,
            )
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse.ok &&
            new URL(event.request.url).origin === self.location.origin
          ) {
            const responseToCache = networkResponse.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache)
            })
          }
          return networkResponse
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html').then(
              (fallbackResponse) =>
                fallbackResponse ??
                new Response(
                  '<h1>Mi Billetera Lite no está disponible sin conexión.</h1>',
                  {
                    status: 503,
                    headers: { 'Content-Type': 'text/html; charset=utf-8' },
                  },
                ),
            )
          }
          return new Response('Recurso no disponible sin conexión', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          })
        })
    }),
  )
})
