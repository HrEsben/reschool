// Badge management utilities for iOS PWA
'use client';

// Function to clear badge via service worker message
export async function clearBadgeClient() {
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Send message to service worker to clear badge
      navigator.serviceWorker.controller.postMessage({
        type: 'CLEAR_BADGE'
      });
    }
    
    // Also try direct badge API if available
    if ('clearAppBadge' in navigator) {
      await (navigator as any).clearAppBadge();
    }
  } catch (error) {
    console.log('Badge clear failed:', error);
  }
}

// Function to update badge count via service worker message
export async function updateBadgeClient(count: number) {
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      // Send message to service worker to update badge
      navigator.serviceWorker.controller.postMessage({
        type: 'UPDATE_BADGE',
        count: count
      });
    }
    
    // Also try direct badge API if available
    if ('setAppBadge' in navigator) {
      await (navigator as any).setAppBadge(count);
    }
  } catch (error) {
    console.log('Badge update failed:', error);
  }
}
