import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors (except 408)
        const httpError = error as { status?: number };
        const status = httpError?.status;
        if (status && status >= 400 && status < 500 && status !== 408) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});
