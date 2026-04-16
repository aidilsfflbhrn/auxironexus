// Auxiron Service Worker - Auto Update
const CACHE_NAME = 'auxiron-v' + Date.now();

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// Network first - always get latest version
self.addEventListener('fetch', function(e) {
  // Don't cache API calls
  if (e.request.url.includes('/api/')) return;
  
  e.respondWith(
    fetch(e.request)
      .then(function(response) {
        // Clone and cache the response
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      })
      .catch(function() {
        // Fallback to cache if offline
        return caches.match(e.request);
      })
  );
});

// Listen for update messages from app
self.addEventListener('message', function(e) {
  if (e.data === 'skipWaiting') self.skipWaiting();
});
