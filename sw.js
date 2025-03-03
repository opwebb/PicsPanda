
const CACHE_NAME = 'picspanda-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/convert.html',
  '/compress.html',
  '/pdf-compress.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/convert.js',
  '/js/compress.js',
  '/js/pdf-compress.js',
  '/manifest.json',
  '/images/icon-192.png',
  '/images/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Fallback for offline pages
      if (event.request.url.includes('.html')) {
        return caches.match('/index.html');
      }
    })
  );
});
// PicsPanda Service Worker
const CACHE_NAME = 'picspanda-cache-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/convert.html',
  '/compress.html',
  '/pdf-compress.html',
  '/blog.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/languages.js',
  '/js/performance.js',
  '/manifest.json'
];

// Install event - cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip PDF library requests - they're large and we can get them from the network
  if (event.request.url.includes('pdf-lib')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          // In the background, fetch from network to update cache for next time
          fetch(event.request).then(response => {
            // Only cache successful responses
            if (response.ok) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, response);
              });
            }
          }).catch(() => {
            // Network request failed, but we already have a cached response
            console.log('Network fetch failed, serving from cache');
          });
          
          return cachedResponse;
        }

        // If not in cache, fetch from network
        return fetch(event.request)
          .then(response => {
            // If the response is valid, clone it and put in cache
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(err => {
            // If both cache and network fail, try to serve a fallback page
            console.log('Fetch failed, serving offline page', err);
            
            // For HTML requests, serve the offline page
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/index.html');
            }
            
            return new Response('Network error, application is offline.', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Background sync for offline forms
self.addEventListener('sync', event => {
  if (event.tag === 'sync-form-data') {
    event.waitUntil(syncFormData());
  }
});

// Function to sync any stored form data when online
function syncFormData() {
  return self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_READY'
      });
    });
  });
}
