"use client";

import { useEffect } from 'react';

interface WebVitalMetric {
  name: string;
  value: number;
  id: string;
}

export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Report Core Web Vitals
      const reportWebVitals = (metric: WebVitalMetric) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('Web Vital:', metric);
        }
      };

      // Measure First Contentful Paint
      if ('getEntriesByType' in performance) {
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            reportWebVitals({
              name: 'FCP',
              value: entry.startTime,
              id: 'fcp'
            });
          }
        });
      }

      // Measure Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            reportWebVitals({
              name: 'LCP',
              value: lastEntry.startTime,
              id: 'lcp'
            });
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch {
          // PerformanceObserver not supported
        }
      }

      // Measure Cumulative Layout Shift
      if ('PerformanceObserver' in window) {
        try {
          let clsValue = 0;
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const layoutShiftEntry = entry as PerformanceEntry & { 
                hadRecentInput?: boolean; 
                value?: number; 
              };
              if (!layoutShiftEntry.hadRecentInput) {
                clsValue += layoutShiftEntry.value || 0;
              }
            }
            reportWebVitals({
              name: 'CLS',
              value: clsValue,
              id: 'cls'
            });
          });
          observer.observe({ entryTypes: ['layout-shift'] });
        } catch {
          // PerformanceObserver not supported
        }
      }
    }
  }, []);

  return null;
}

// Hook for measuring component render time
export function usePerformanceTimer(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      return () => {
        const end = performance.now();
        console.log(`${componentName} render time: ${end - start}ms`);
      };
    }
  });
}
