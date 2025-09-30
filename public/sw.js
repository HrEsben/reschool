const CACHE_NAME = 'reschool-v1';

// Minimal service worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Simple fetch handler - network first for everything
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin and API requests
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) {
    return;
  }
  
  // Simple network-first strategy
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests and Chrome extension requests
  if (url.origin !== self.location.origin || url.protocol === 'chrome-extension:') {
    return;
  }
  
  // Skip API requests - they should always be fresh
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/handler/')) {
    return;
  }
  
  // Handle navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If network succeeds, return response and optionally cache it
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              })
              .catch(() => {
                // Silently fail cache updates
              });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
               return cachedResponse;
              }
              
              // If no cache, return a basic offline page
              return new Response(`
                <!DOCTYPE html>
                <html>
                <head>
                  <title>Offline - ReSchool</title>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    body { 
                      font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
                      text-align: center; 
                      padding: 50px; 
                      background: #f4f1de;
                      color: #3d405b;
                    }
                    .offline-container {
                      max-width: 400px;
                      margin: 0 auto;
                    }
                    button {
                      background: #81b29a;
                      color: white;
                      border: none;
                      padding: 12px 24px;
                      border-radius: 8px;
                      cursor: pointer;
                      font-size: 16px;
                      margin-top: 20px;
                    }
                    button:hover {
                      background: #6ea085;
                    }
                  </style>
                </head>
                <body>
                  <div class="offline-container">
                    <h1>📱 Offline</h1>
                    <p>You're currently offline. Please check your internet connection and try again.</p>
                    <button onclick="window.location.reload()">Try Again</button>
                  </div>
                </body>
                </html>
              `, {
                headers: { 'Content-Type': 'text/html' }
              });
            });
        })
    );
    return;
  }
  
  // Handle static resources with aggressive caching for performance
  if (url.pathname.startsWith('/_next/static/') || 
      url.pathname.includes('.css') || 
      url.pathname.includes('.js') ||
      url.pathname.includes('.png') ||
      url.pathname.includes('.jpg') ||
      url.pathname.includes('.svg') ||
      url.pathname.includes('.woff') ||
      url.pathname.includes('.woff2')) {
    
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          // For static assets, serve from cache immediately if available
          if (cachedResponse) {
            return cachedResponse;
          }
          
          // Not in cache, fetch from network and cache aggressively
          return fetch(request)
            .then((response) => {
              if (response.ok) {
                const responseClone = response.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  })
                  .catch(() => {
                    // Silently fail cache updates
                  });
              }
              return response;
            })
            .catch(() => {
              // Return offline fallback for failed static resources
              return new Response('/* Offline fallback */', {
                headers: { 'Content-Type': 'text/css' }
              });
            });
        })
    );
  }
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          const deletePromises = cacheNames.map((name) => {
           return caches.delete(name);
          });
          return Promise.all(deletePromises);
        })
        .then(() => {
         // Notify all clients to reload
          return self.clients.matchAll();
        })
        .then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'CACHE_CLEARED',
              message: 'All caches have been cleared. The page will reload.'
            });
          });
        })
    );
  }
  
  if (event.data && event.data.type === 'CHECK_VERSION') {
    event.ports[0].postMessage({
      version: APP_VERSION,
      cacheName: CACHE_NAME
    });
  }
});

