"use client";

import { useEffect } from 'react';

/**
 * Hook to optimize pages for back/forward cache (bfcache)
 * This ensures the page can be cached for faster navigation
 */
export function useBfcacheOptimization() {
  useEffect(() => {
    // Ensure we don't block bfcache with unload handlers
    const handlePageHide = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page is being cached for bfcache
    }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Page was restored from bfcache
     
        // Refresh any time-sensitive data
        if ('performance' in window && performance.navigation) {
          const navigation = performance.navigation as Performance['navigation'] & { type?: string };
          if (navigation.type === 'back_forward') {
            // Trigger data refresh for bfcache navigation
            window.dispatchEvent(new CustomEvent('bfcache-restore'));
          }
        }
      }
    };

    // Add event listeners that don't prevent bfcache
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('pageshow', handlePageShow);

    // Cleanup that doesn't use beforeunload (which blocks bfcache)
    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  useEffect(() => {
    // Avoid features that prevent bfcache:
    // - No IndexedDB connections with active transactions
    // - No fetch() requests with keepalive
    // - No WebRTC connections
    // - No Web Locks API usage
    
    // Ensure any ongoing requests are properly handled
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Page is being hidden, prepare for potential bfcache
        // Cancel any non-essential ongoing operations
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
}

/**
 * Component to wrap pages that should be bfcache-friendly
 */
export function BfcacheOptimizer({ children }: { children: React.ReactNode }) {
  useBfcacheOptimization();
  return <>{children}</>;
}
