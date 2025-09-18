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
      Promise.all([
        self.registration.showNotification(data.title || "ReSchool", options),
        // Update badge count for iOS PWA
        updateBadgeCount(data.badgeCount || 1)
      ])
    )
  } else {
    const options = {
      body: "Du har en ny besked!",
      icon: "/android-chrome-192x192.png",
      badge: "/android-chrome-192x192.png",
      tag: 'push-notification'
    }
    
    event.waitUntil(
      Promise.all([
        self.registration.showNotification("ReSchool", options),
        // Update badge count for iOS PWA
        updateBadgeCount(1)
      ])
    )
  }
});

// Function to update iOS PWA badge count
async function updateBadgeCount(count) {
  try {
    if ('setAppBadge' in navigator) {
      // Use the App Badge API if available (Chrome, Edge)
      await navigator.setAppBadge(count);
    } else if ('setClientBadge' in self.registration) {
      // Fallback for other browsers
      await self.registration.setClientBadge(count);
    }
  } catch (error) {
    console.log('Badge API not supported or failed:', error);
  }
}

// Function to clear badge
async function clearBadge() {
  try {
    if ('clearAppBadge' in navigator) {
      await navigator.clearAppBadge();
    } else if ('setClientBadge' in self.registration) {
      await self.registration.setClientBadge(0);
    }
  } catch (error) {
    console.log('Badge clear not supported or failed:', error);
  }
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_BADGE') {
    clearBadge();
  } else if (event.data && event.data.type === 'UPDATE_BADGE') {
    updateBadgeCount(event.data.count || 0);
  }
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  // Clear badge when notification is clicked
  event.waitUntil(
    Promise.all([
      clearBadge(),
      // Open the app when notification is clicked
      event.action === "open" || !event.action ? 
        clients.openWindow(event.notification.data?.url || "/") : 
        Promise.resolve()
    ])
  )
})
