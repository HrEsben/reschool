"use client";

import { useState, useEffect } from 'react';
import { Box, Button, Text, Stack, HStack, Badge } from '@chakra-ui/react';
import { useServiceWorker } from '@/hooks/use-service-worker';

interface CacheInfo {
  name: string;
  size: number;
  urls: string[];
}

export function CacheDebugger() {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [swInfo, setSwInfo] = useState<{
    active: boolean;
    installing: boolean;
    waiting: boolean;
    scope: string;
    updateViaCache: string;
  } | null>(null);
  const { isSupported, isRegistered, clearCache, checkForUpdates } = useServiceWorker();

  // Only render on client side to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check for cache information
  const loadCacheInfo = async () => {
    if (!('caches' in window)) return;

    try {
      const cacheNames = await caches.keys();
      const cacheInfos: CacheInfo[] = [];

      for (const name of cacheNames) {
        const cache = await caches.open(name);
        const requests = await cache.keys();
        cacheInfos.push({
          name,
          size: requests.length,
          urls: requests.map(req => req.url).slice(0, 5) // First 5 URLs
        });
      }

      setCacheInfo(cacheInfos);
    } catch (error) {
      console.error('Failed to load cache info:', error);
    }
  };

  // Get service worker info
  const loadSwInfo = async () => {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      if (registration) {
        setSwInfo({
          active: !!registration.active,
          installing: !!registration.installing,
          waiting: !!registration.waiting,
          scope: registration.scope,
          updateViaCache: registration.updateViaCache
        });
      }
    } catch (error) {
      console.error('Failed to load SW info:', error);
    }
  };

  useEffect(() => {
    if (isVisible) {
      loadCacheInfo();
      loadSwInfo();
    }
  }, [isVisible]);

  // Clear all caches manually
  const handleClearAllCaches = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('All caches cleared manually');
      }
      
      // Also clear service worker cache
      await clearCache();
      
      // Refresh cache info
      setTimeout(() => {
        loadCacheInfo();
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  };

  // Force reload without cache
  const handleHardRefresh = () => {
    window.location.reload();
  };

  // Only show in development or when manually enabled
  if (!isMounted || (process.env.NODE_ENV === 'production' && !localStorage.getItem('debug-cache'))) {
    return null;
  }

  if (!isVisible) {
    return (
      <Box 
        position="fixed" 
        bottom="4" 
        right="4" 
        zIndex={9999}
      >
        <Button 
          size="sm" 
          onClick={() => setIsVisible(true)}
          colorPalette="teal"
        >
          🔧 Debug
        </Button>
      </Box>
    );
  }

  return (
    <Box 
      position="fixed" 
      bottom="4" 
      right="4" 
      width="400px"
      maxHeight="600px"
      zIndex={9999}
      overflow="auto"
    >
      <Box p={4} bg="white" boxShadow="xl" border="1px" borderColor="gray.200" borderRadius="md">
        <Stack gap={3}>
          <HStack justify="space-between">
            <Text fontSize="lg" fontWeight="bold">Cache Debugger</Text>
            <Button size="xs" onClick={() => setIsVisible(false)}>×</Button>
          </HStack>
          
          {/* Service Worker Status */}
          <Box>
            <Text fontWeight="semibold" mb={2}>Service Worker Status</Text>
            <HStack wrap="wrap" gap={2}>
              <Badge colorPalette={isSupported ? "green" : "red"}>
                {isSupported ? "Supported" : "Not Supported"}
              </Badge>
              <Badge colorPalette={isRegistered ? "green" : "red"}>
                {isRegistered ? "Registered" : "Not Registered"}
              </Badge>
              {swInfo && (
                <>
                  <Badge colorPalette={swInfo.active ? "green" : "gray"}>
                    {swInfo.active ? "Active" : "Inactive"}
                  </Badge>
                  {swInfo.waiting && <Badge colorPalette="yellow">Update Available</Badge>}
                </>
              )}
            </HStack>
          </Box>

          {/* Cache Information */}
          <Box>
            <Text fontWeight="semibold" mb={2}>Cache Information</Text>
            {cacheInfo.length === 0 ? (
              <Text fontSize="sm" color="gray.600">No caches found</Text>
            ) : (
              <Stack gap={2}>
                {cacheInfo.map((cache) => (
                  <Box key={cache.name} p={2} bg="gray.50" borderRadius="md">
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm" fontWeight="medium">{cache.name}</Text>
                      <Badge>{cache.size} items</Badge>
                    </HStack>
                    {cache.urls.length > 0 && (
                      <Stack gap={1}>
                        {cache.urls.map((url, index) => (
                          <Text key={index} fontSize="xs" color="gray.600" truncate>
                            {url}
                          </Text>
                        ))}
                      </Stack>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {/* Actions */}
          <Stack gap={2}>
            <Button size="sm" onClick={loadCacheInfo} width="full">
              Refresh Cache Info
            </Button>
            <Button size="sm" onClick={checkForUpdates} width="full" colorPalette="blue">
              Check for Updates
            </Button>
            <Button size="sm" onClick={handleClearAllCaches} width="full" colorPalette="orange">
              Clear All Caches
            </Button>
            <Button size="sm" onClick={handleHardRefresh} width="full" colorPalette="red">
              Hard Refresh
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

// Enable cache debugging in production
export function enableCacheDebugging() {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('debug-cache', 'true');
    console.log('Cache debugging enabled. Refresh the page to see the debug panel.');
  }
}

// Add to window for easy access in production
if (typeof window !== 'undefined') {
  (window as typeof window & { enableCacheDebugging: () => void }).enableCacheDebugging = enableCacheDebugging;
}