"use client";

import { useEffect, useState } from 'react';

interface ServiceWorkerHookReturn {
  isSupported: boolean;
  isRegistered: boolean;
  registration: ServiceWorkerRegistration | null;
  clearCache: () => Promise<void>;
  checkForUpdates: () => Promise<void>;
}

export function useServiceWorker(): ServiceWorkerHookReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      setIsSupported(true);
      
      // Register service worker
      navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // Always check for updates
      })
      .then((reg) => {
    setRegistration(reg);
        setIsRegistered(true);

        // Check for updates immediately
        reg.update();

        // Listen for updates
        reg.addEventListener('updatefound', () => {
         const newWorker = reg.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Force refresh to get new content
                window.location.reload();
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'CACHE_CLEARED') {
          setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        });
      })
      .catch((error) => {
        console.warn('[SW] Service worker registration failed:', error);
      });

      // Listen for controller changes (new SW took control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
      });
    } else {
      console.warn('[SW] Service workers not supported');
    }
  }, []);

  const clearCache = async (): Promise<void> => {
    if (!registration || !registration.active) {
      console.warn('[SW] No active service worker to clear cache');
      return;
    }

    // Send message to service worker to clear cache
    registration.active.postMessage({
      type: 'CLEAR_CACHE'
    });
  };

  const checkForUpdates = async (): Promise<void> => {
    if (!registration) {
      console.warn('[SW] No service worker registration to check for updates');
      return;
    }

    try {
      await registration.update();
 } catch (error) {
      console.warn('[SW] Failed to check for updates:', error);
    }
  };

  return {
    isSupported,
    isRegistered,
    registration,
    clearCache,
    checkForUpdates,
  };
}

// Component to handle service worker registration
export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useServiceWorker();
  return <>{children}</>;
}