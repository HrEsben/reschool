"use client";

import { useEffect } from 'react';

/**
 * Development utility to monitor bfcache performance
 * Only runs in development mode
 */
export function BfcacheMonitor() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Monitor bfcache events
    let bfcacheSupported = false;

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        bfcacheSupported = true;
        console.log('✅ Page restored from bfcache - excellent performance!');
      } else if (bfcacheSupported) {
        console.log('⚠️ Page not restored from bfcache - may have performance impact');
      }
    };

    const handlePageHide = (event: PageTransitionEvent) => {
      if (event.persisted) {
        console.log('✅ Page cached for bfcache');
      } else {
        console.log('❌ Page NOT cached for bfcache - check for blocking factors');
      }
    };

    // Monitor for bfcache blocking factors
    const monitorBlockingFactors = () => {
      // Check for common blocking factors
      const blockingFactors = [];

      // Check for unload handlers
      if (window.onbeforeunload || window.onunload) {
        blockingFactors.push('unload/beforeunload handlers');
      }

      // Check for open IndexedDB connections
      if ('indexedDB' in window) {
        // Note: This is a simplified check
        blockingFactors.push('potential IndexedDB connections');
      }

      // Check for WebRTC connections
      if ('RTCPeerConnection' in window) {
        blockingFactors.push('potential WebRTC connections');
      }

      if (blockingFactors.length > 0) {
        console.warn('⚠️ Potential bfcache blocking factors detected:', blockingFactors);
      } else {
        console.log('✅ No obvious bfcache blocking factors detected');
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('pagehide', handlePageHide);
    
    // Run check after a short delay
    setTimeout(monitorBlockingFactors, 1000);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '5px 10px', 
      borderRadius: '5px', 
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      bfcache monitor active
    </div>
  );
}
