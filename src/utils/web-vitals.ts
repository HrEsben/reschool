'use client';

// Performance observer for custom web vitals tracking
export function reportWebVitals() {
  if (typeof window === 'undefined') return;

  // Track LCP (Largest Contentful Paint)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          console.log('LCP:', lastEntry.startTime);
        }
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Track FCP (First Contentful Paint) 
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            console.log('FCP:', entry.startTime);
          }
        });
      });
      fcpObserver.observe({ entryTypes: ['paint'] });

      // Track CLS (Cumulative Layout Shift)
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const layoutShiftEntry = entry as PerformanceEntry & { 
            hadRecentInput?: boolean; 
            value?: number; 
          };
          if (!layoutShiftEntry.hadRecentInput) {
            console.log('CLS:', layoutShiftEntry.value);
          }
        });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('Performance observer not supported:', error);
    }
  }
}