/* ============================================================
   MediFile — Service Worker v1.1.0
   Estrategia: Cache First para assets locales,
               Network First para la API de IA y navegación.
   Novedades v1.1.0:
     - Versión de caché visible y fácil de subir en cada deploy.
     - Sistema de aviso de actualización: cuando hay una versión
       nueva instalada y esperando, el SW responde a un mensaje
       'CHECK_VERSION' con su versión actual, para que la app
       pueda mostrar un banner "Hay una actualización disponible"
       en vez de recargar a la fuerza a mitad de sesión.
     - 'SKIP_WAITING' sigue disponible para cuando el usuario
       confirma que quiere actualizar ahora.
   ============================================================ */

const SW_VERSION = '1.1.0';
const CACHE_NAME = 'medifile-v' + SW_VERSION;

// Assets que se cachean al instalar
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.3.0/dist/tabler-icons.min.css',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.3.0/dist/fonts/tabler-icons.woff2',
];

// ---- INSTALL: cachear assets esenciales ----
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // Intentar cachear todos; si alguno falla, no bloquear la instalación
        return Promise.allSettled(
          PRECACHE_URLS.map(url =>
            cache.add(url).catch(err => console.warn('No se pudo cachear:', url, err))
          )
        );
      })
    // NOTA: ya NO se llama self.skipWaiting() aquí automáticamente.
    // Se espera el mensaje 'SKIP_WAITING' explícito desde la app,
    // para no interrumpir a un usuario a mitad de una sesión activa.
    // Si prefieres el comportamiento anterior (actualizar siempre
    // de inmediato sin preguntar), descomenta la siguiente línea:
    // .then(() => self.skipWaiting())
  );
});

// ---- ACTIVATE: limpiar cachés viejos y tomar control ----
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ---- FETCH: estrategia por tipo de recurso ----
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 1. API de Anthropic → siempre red, nunca cachear (datos sensibles + siempre frescos)
  if (url.hostname === 'api.anthropic.com') {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. Solo manejar GET; dejar pasar POST/PUT/DELETE sin tocar
  if (event.request.method !== 'GET') {
    return;
  }

  // 3. Navegación (HTML) → Network first, fallback a caché offline
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // 4. Todo lo demás (CSS, fuentes, iconos) → Cache first, fallback network
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
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
      })
      .catch(() => new Response('Recurso no disponible sin conexión', { status: 503 }))
  );
});

// ---- MENSAJES desde la app ----
self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data === 'CHECK_VERSION') {
    event.source && event.source.postMessage({ type: 'SW_VERSION', version: SW_VERSION });
  }
});

// ---- NOTIFICACIONES: click en una notificación abre/enfoca la app ----
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientsArr => {
      const existing = clientsArr.find(c => 'focus' in c);
      if (existing) return existing.focus();
      if (self.clients.openWindow) return self.clients.openWindow('./');
    })
  );
});