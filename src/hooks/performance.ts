import { useCallback, useRef } from 'react';

/**
 * Hook to debounce function calls to improve performance
 * @param callback The function to debounce
 * @param delay Delay in milliseconds
 */
export function useDebounce<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
}

/**
 * Hook to throttle function calls to improve performance
 * @param callback The function to throttle
 * @param delay Delay in milliseconds
 */
export function useThrottle<T extends (...args: unknown[]) => void>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef<number>(0);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastRan.current >= delay) {
        callback(...args);
        lastRan.current = now;
      }
    },
    [callback, delay]
  ) as T;

  return throttledCallback;
}

/**
 * Hook for memoizing expensive calculations
 * @param fn Function that performs expensive calculation
 * @param deps Dependency array
 */
export function useMemoizedValue<T>(
  fn: () => T,
  deps: React.DependencyList
): T {
  const memoRef = useRef<{ value: T; deps: React.DependencyList } | null>(null);
  
  const depsChanged = !memoRef.current || 
    deps.length !== memoRef.current.deps.length ||
    deps.some((dep, index) => dep !== memoRef.current!.deps[index]);
  
  if (depsChanged) {
    memoRef.current = {
      value: fn(),
      deps: [...deps]
    };
  }
  
  return memoRef.current!.value;
}
