/* ============================================================
   MediFile — Service Worker v1.2.0
   Limpieza forzada de caché viejo para corregir install prompt
   ============================================================ */

const SW_VERSION = '1.2.0';
const CACHE_NAME = 'medifile-v' + SW_VERSION;

const PRECACHE_URLS = [
  '/MediFile/',
  '/MediFile/index.html',
  '/MediFile/manifest.json',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.3.0/dist/tabler-icons.min.css',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.3.0/dist/fonts/tabler-icons.woff2',
];

self.addEventListener('install', event => {
  // skipWaiting para que este SW tome control de inmediato
  // y elimine cualquier SW viejo que pueda estar bloqueando el install prompt
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(
        PRECACHE_URLS.map(url =>
          cache.add(url).catch(err => console.warn('No se pudo cachear:', url, err))
        )
      )
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys.filter(key => key !== CACHE_NAME).map(key => {
            console.log('Eliminando caché viejo:', key);
            return caches.delete(key);
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API de Anthropic → siempre red
  if (url.hostname === 'api.anthropic.com') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Solo GET
  if (event.request.method !== 'GET') return;

  // Navegación → network first, fallback a caché
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match('/MediFile/index.html'))
    );
    return;
  }

  // Resto → cache first, fallback network
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (
          response.ok &&
          (url.hostname.includes('jsdelivr.net') || url.origin === self.location.origin)
        ) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    }).catch(() => new Response('Sin conexión', { status: 503 }))
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  if (event.data === 'CHECK_VERSION') {
    event.source && event.source.postMessage({ type: 'SW_VERSION', version: SW_VERSION });
  }
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientsArr => {
      const existing = clientsArr.find(c => 'focus' in c);
      if (existing) return existing.focus();
      if (self.clients.openWindow) return self.clients.openWindow('/MediFile/');
    })
  );
});