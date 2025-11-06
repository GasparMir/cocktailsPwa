const CACHE_NAME = 'cocktail-app-shell-v1';
const urlsToCache = [
  './',            
  './index.html',
  './styles.css',
  './app.js'
];

self.addEventListener('install', event => {
  console.log('Service Worker instalándose...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto, agregando archivos...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('App shell guardado en cache');
        return self.skipWaiting();
      })
      .catch(err => console.error('❌ Error al cachear archivos:', err))
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker activado');
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
