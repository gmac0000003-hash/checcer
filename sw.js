
const CACHE_NAME = 'checkers-v1';
const urlsToCache = [
  './',
  './index.html',
  'https://cdn.tailwindcss.com',
  'https://picsum.photos/32/32?random=1',
  'https://picsum.photos/192/192?random=1',
  'https://picsum.photos/512/512?random=2'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
           if(!response || response.status !== 200 || response.type !== 'basic') {
             return response;
           }
           const responseToCache = response.clone();
           caches.open(CACHE_NAME).then(cache => {
             cache.put(event.request, responseToCache);
           });
           return response;
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheAllowlist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
