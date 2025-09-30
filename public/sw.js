const CACHE_NAME = 'reschool-v1.0.0';
const APP_VERSION = '1.0.0';

// Critical URLs to cache - only cache routes that definitely exist
const CRITICAL_URLS = [
  '/',
  '/dashboard',
];

// Install event - cache critical resources
self.addEventListener('install', (event) => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(async (cache) => {
        // Cache each URL individually to avoid failing all if one fails
        const cachePromises = CRITICAL_URLS
          .filter(url => !url.includes('undefined'))
          .map(async (url) => {
            try {
              await cache.add(url);
            } catch (error) {
              console.warn(`[SW] Failed to cache ${url}:`, error);
              // Continue with other URLs even if one fails
            }
          });
        
        await Promise.allSettled(cachePromises);
      })
      .then(() => {
        // Force immediate activation
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        const deletePromises = cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
          return caches.delete(name);
          });
        
        return Promise.all(deletePromises);
      })
      .then(() => {
      // Force immediate control of all clients
        return self.clients.claim();
      })
      .then(() => {
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
  
  // Handle static resources (JS, CSS, images)
  if (url.pathname.startsWith('/_next/static/') || 
      url.pathname.includes('.css') || 
      url.pathname.includes('.js') ||
      url.pathname.includes('.png') ||
      url.pathname.includes('.jpg') ||
      url.pathname.includes('.svg')) {
    
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Serve from cache but also update in background
            fetch(request)
              .then((response) => {
                if (response.ok) {
                  caches.open(CACHE_NAME)
                    .then((cache) => {
                      cache.put(request, response);
                    })
                    .catch(() => {
                      // Silently fail cache updates
                    });
                }
              })
              .catch(() => {
                // Network failed, that's okay
              });
            
            return cachedResponse;
          }
          
          // Not in cache, fetch from network
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

