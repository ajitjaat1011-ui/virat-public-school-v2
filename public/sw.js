/* Service worker — fast offline shell without caching dynamic API responses. */
const CACHE_NAME = 'vps-app-v7';
const APP_SHELL = [
  '/',
  '/css/style.css?v=14',
  '/css/components.css?v=2',
  '/css/glass-app.css?v=1',
  '/css/motion-app.css?v=1',
  '/js/partials.js?v=12',
  '/js/i18n.js?v=2',
  '/js/motion-app.js?v=1',
  '/js/main.js?v=9',
  '/manifest.json',
  '/images/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  // Never cache APIs: notices, gallery, stats, auth, and results must be fresh.
  if (new URL(request.url).pathname.startsWith('/api/')) return;

  if (request.headers.get('accept')?.includes('text/html')) {
    // Fresh navigation first, offline fallback second.
    event.respondWith(
      fetch(request).then((response) => {
        if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
        return response;
      }).catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    );
    return;
  }

  // Cache static assets after the first request for instant repeat visits.
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      return response;
    }))
  );
});
