const CACHE_NAME = 'sr-foodkraft-v1.0.1';
const STATIC_CACHE = 'sr-foodkraft-static-v1.0.1';
const DYNAMIC_CACHE = 'sr-foodkraft-dynamic-v1.0.1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/admin/dashboard',
  '/admin/menu',
  '/admin/orders'
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/menu/,
  /\/api\/orders/,
  /\/api\/user/,
  /\/admin-api\//
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return event.respondWith(fetch(request));
  }

  // Strategies
  if (STATIC_FILES.includes(url.pathname)) {
    event.respondWith(cacheFirst(request));
  } else if (API_CACHE_PATTERNS.some(p => p.test(url.pathname))) {
    event.respondWith(networkFirst(request));
  } else if (request.destination === 'image') {
    if (!request.url.includes(self.location.origin)) {
      event.respondWith(networkFirst(request));
    } else {
      event.respondWith(cacheFirst(request));
    }
  } else {
    event.respondWith(networkFirst(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const network = await fetch(request);
    if (network.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, network.clone());
    }
    return network;
  } catch (e) {
    if (request.destination === 'image') {
      return new Response('<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#eee"/><text x="50" y="50" text-anchor="middle" dy=".3em">Image</text></svg>', { headers: { 'Content-Type': 'image/svg+xml' } });
    }
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const network = await fetch(request);
    if (network.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, network.clone());
    }
    return network;
  } catch (e) {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Offline' }), { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}

console.log('Service Worker: Loaded successfully');
