const CACHE_NAME = 'ti25ka-pwa-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/TI-25-KA.png',
  '/TI-25-KA_Logo.png',
  '/ibik_logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Optionally cache new requests
        return response;
      }).catch(() => caches.match('/'));
    })
  );
});
