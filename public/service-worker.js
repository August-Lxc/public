/*
  Basic Service Worker for CRA app
  - Caches app shell and runtime requests
  - Enables offline and faster repeat loads
*/
const CACHE_NAME = 'my-drawing-tool-v1';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/robots.txt',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return; // do not cache POST/PUT etc.

  // Prefer network, fallback to cache; cache successful responses
  event.respondWith(
    (async () => {
      try {
        const networkResponse = await fetch(request);
        const responseClone = networkResponse.clone();
        const cache = await caches.open(CACHE_NAME);
        // Only cache same-origin GET requests
        if (request.url.startsWith(self.origin || self.location.origin)) {
          cache.put(request, responseClone);
        }
        return networkResponse;
      } catch (err) {
        const cached = await caches.match(request);
        if (cached) return cached;
        // Fallback to index for navigation requests (SPA offline support)
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
        throw err;
      }
    })()
  );
});
