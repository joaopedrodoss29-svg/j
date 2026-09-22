self.addEventListener('install', (event) => {
  console.log('AD X-RAY installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request).catch(() => new Response('Offline mode', { status: 200 })));
});
