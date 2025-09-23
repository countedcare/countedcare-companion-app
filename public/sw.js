// CountedCare Service Worker
const CACHE_NAME = 'countedcare-v1';
const RUNTIME_CACHE = 'countedcare-runtime-v1';

// Essential resources to cache
const STATIC_RESOURCES = [
  '/',
  '/home',
  '/auth',
  '/dashboard',
  '/expenses',
  '/resources',
  '/profile',
  // Add any critical assets here
  '/manifest.json'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
      .catch((error) => {
        console.error('Service Worker: Cache installation failed', error);
      })
  );
  self.skipWaiting();
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => 
            cacheName !== CACHE_NAME && 
            cacheName !== RUNTIME_CACHE
          )
          .map((cacheName) => {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests and external domains
  if (event.request.method !== 'GET' || 
      !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip Supabase API calls - always go to network
  if (event.request.url.includes('supabase.co')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network and cache
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone response for caching
            const responseClone = response.clone();

            caches.open(RUNTIME_CACHE)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });

            return response;
          })
          .catch(() => {
            // Network failed - return offline fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/') || new Response(
                '<html><body><h1>Offline</h1><p>Please check your connection</p></body></html>',
                { headers: { 'Content-Type': 'text/html' } }
              );
            }
          });
      })
  );
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
