import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // Reduced to 2 minutes for mobile
      gcTime: 5 * 60 * 1000, // Garbage collection after 5 minutes
      refetchOnWindowFocus: true, // Enable for mobile focus/unfocus
      refetchOnReconnect: true, // Refetch when network comes back
      refetchOnMount: true, // Always refetch on mount
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors (except 408)
        const httpError = error as { status?: number };
        const status = httpError?.status;
        if (status && status >= 400 && status < 500 && status !== 408) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Network mode to handle offline scenarios
      networkMode: 'online',
    },
    mutations: {
      // Add retry logic for mutations too
      retry: (failureCount, error: unknown) => {
        const httpError = error as { status?: number };
        const status = httpError?.status;
        // Retry on network errors but not on client errors
        if (status && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
      networkMode: 'online',
    },
  },
});
