const CACHE_NAME = 'food-kraft-v1.0.0';
const STATIC_CACHE = 'food-kraft-static-v1.0.0';
const DYNAMIC_CACHE = 'food-kraft-dynamic-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Add other static assets as needed
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/menu/,
  /\/api\/orders/,
  /\/api\/user/,
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
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Error caching static files', error);
      })
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
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle different types of requests
  if (request.method === 'GET') {
    // Static files - cache first strategy
    if (STATIC_FILES.includes(url.pathname) || url.pathname.startsWith('/static/')) {
      event.respondWith(cacheFirst(request));
    }
    // API requests - network first strategy
    else if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      event.respondWith(networkFirst(request));
    }
    // Images - handle external vs internal differently
    else if (request.destination === 'image') {
      // For external images, use network first with fallback
      if (!request.url.includes(self.location.origin)) {
        event.respondWith(networkFirst(request));
      } else {
        event.respondWith(cacheFirst(request));
      }
    }
    // Other requests - network first strategy
    else {
      event.respondWith(networkFirst(request));
    }
  } else {
    // Non-GET requests - network only
    event.respondWith(fetch(request));
  }
});

// Cache first strategy - check cache first, then network
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);

    // For external images, return a placeholder or skip caching
    if (request.destination === 'image' && !request.url.includes(window.location.origin)) {
      // Don't cache external images, just return a placeholder
      return new Response(
        '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#f3f4f6"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="#9ca3af">Image</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }

    // Return offline page for navigation requests
    if (request.destination === 'document') {
      return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }

    // For other requests, return a generic error response
    return new Response('Resource not available offline', { status: 503 });
  }
}

// Network first strategy - try network first, then cache
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return appropriate offline response
    if (request.destination === 'document') {
      return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }

    // For API requests, return a structured offline response
    if (request.url.includes('/api/')) {
      return new Response(JSON.stringify({
        error: 'Offline',
        message: 'You are currently offline. Please check your connection.',
        offline: true
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);

  if (event.tag === 'order-sync') {
    event.waitUntil(syncOrders());
  }

  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCart());
  }
});

// Sync pending orders when back online
async function syncOrders() {
  try {
    // Get pending orders from IndexedDB
    const pendingOrders = await getPendingOrders();

    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        });

        if (response.ok) {
          // Remove from pending orders
          await removePendingOrder(order.id);
          console.log('Order synced successfully:', order.id);
        }
      } catch (error) {
        console.error('Failed to sync order:', order.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Sync cart changes when back online
async function syncCart() {
  try {
    const cartData = await getCartData();
    if (cartData && cartData.length > 0) {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartData)
      });

      if (response.ok) {
        console.log('Cart synced successfully');
      }
    }
  } catch (error) {
    console.error('Cart sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');

  const options = {
    body: 'You have a new update from SR Food Kraft!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }

  event.waitUntil(
    self.registration.showNotification('SR Food Kraft', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions for IndexedDB operations
async function getPendingOrders() {
  // This would interact with IndexedDB to get pending orders
  // For now, return empty array
  return [];
}

async function removePendingOrder(orderId) {
  // This would remove the order from IndexedDB
  console.log('Removing pending order:', orderId);
}

async function getCartData() {
  // This would get cart data from IndexedDB
  return [];
}

// Message handling for communication with main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('Service Worker: Loaded successfully');
