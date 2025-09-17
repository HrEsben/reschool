// Service Worker for push notifications and offline caching
const CACHE_NAME = "reschool-v1";
const urlsToCache = [
  "/",
  "/manifest.webmanifest",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/favicon.ico"
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching files...');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip API routes and other dynamic content
  if (event.request.url.includes('/api/') || 
      event.request.url.includes('/_next/') ||
      event.request.url.includes('/handler/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).catch(() => {
          // Return offline page or default response if fetch fails
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// Push event - handle push notifications
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body || data.message || "Du har en ny besked!",
      icon: "/android-chrome-192x192.png",
      badge: "/android-chrome-192x192.png",
      tag: 'push-notification',
      data: data,
      requireInteraction: false,
      silent: false,
      actions: [
        {
          action: "open",
          title: "Åbn",
          icon: "/android-chrome-192x192.png"
        },
        {
          action: "close",
          title: "Luk",
          icon: "/android-chrome-192x192.png"
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title || "ReSchool", options)
    )
  } else {
    const options = {
      body: "Du har en ny besked!",
      icon: "/android-chrome-192x192.png",
      badge: "/android-chrome-192x192.png",
      tag: 'push-notification'
    }
    
    event.waitUntil(
      self.registration.showNotification("ReSchool", options)
    )
  }
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "open" || !event.action) {
    // Open the app when notification is clicked
    event.waitUntil(
      clients.openWindow(event.notification.data?.url || "/")
    )
  }
})
