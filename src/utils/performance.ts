import { lazy, ComponentType } from 'react';

// Performance utilities for ReSchool

/**
 * Dynamic import helper for components that aren't needed immediately
 */
export function lazyImport<T extends ComponentType<unknown>>(importFn: () => Promise<{ default: T }>) {
  return lazy(importFn);
}

/**
 * Preload critical resources
 */
export const preloadResource = (href: string, as: string) => {
  if (typeof window === 'undefined') return;
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

/**
 * Preload fonts
 */
export const preloadFont = (href: string) => {
  preloadResource(href, 'font');
};

/**
 * Web Vitals tracking
 */
export const trackWebVitals = (metric: {
  name: string;
  value: number;
  id: string;
  delta: number;
}) => {
  // In production, you might want to send to analytics
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }
};

/**
 * Optimize images for better performance
 */
export const getOptimizedImageProps = (src: string, alt: string) => ({
  src,
  alt,
  loading: 'lazy' as const,
  decoding: 'async' as const,
});

// Critical components that should NOT be lazy loaded
export const CRITICAL_COMPONENTS = [
  'AuthenticatedLayout',
  'Button',
  'Box',
  'Heading',
  'Text',
];

// Components that can be lazy loaded
export const NON_CRITICAL_COMPONENTS = [
  'DeleteChildDialog',
  'RemoveUserDialog',
  'InviteUserDialog',
  'DeleteInvitationDialog',
  'PromoteUserDialog',
  'DemoteUserDialog',
  'ToolsManager',
];