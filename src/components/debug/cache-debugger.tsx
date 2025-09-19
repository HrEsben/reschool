"use client";

import { useState, useEffect } from 'react';
import { Box, Button, Text, VStack, HStack, Badge, Card } from '@chakra-ui/react';
import { useServiceWorker } from '@/hooks/use-service-worker';

interface CacheInfo {
  name: string;
  size: number;
  urls: string[];
}

export function CacheDebugger() {
  const [cacheInfo, setCacheInfo] = useState<CacheInfo[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [swInfo, setSwInfo] = useState<{
    active: boolean;
    installing: boolean;
    waiting: boolean;
    scope: string;
    updateViaCache: string;
  } | null>(null);
  const { isSupported, isRegistered, clearCache, checkForUpdates } = useServiceWorker();

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
  if (typeof window === 'undefined' || (process.env.NODE_ENV === 'production' && !window.localStorage.getItem('debug-cache'))) {
    return null;
  }

  return (
    <>
      {/* Debug Toggle Button */}
      <Box
        position="fixed"
        bottom="20px"
        right="20px"
        zIndex={9999}
      >
        <Button
          size="sm"
          colorScheme="orange"
          onClick={() => setIsVisible(!isVisible)}
        >
          🐛 Cache Debug
        </Button>
      </Box>

      {/* Debug Panel */}
      {isVisible && (
        <Box
          position="fixed"
          top="20px"
          right="20px"
          width="400px"
          maxHeight="80vh"
          overflowY="auto"
          zIndex={9998}
          bg="white"
          border="1px solid #e2e8f0"
          borderRadius="lg"
          shadow="xl"
          p={4}
        >
          <VStack align="stretch" gap={4}>
            <HStack justify="space-between">
              <Text fontWeight="bold" fontSize="lg">Cache Debugger</Text>
              <Button size="xs" onClick={() => setIsVisible(false)}>✕</Button>
            </HStack>

            {/* Service Worker Info */}
            <Card.Root size="sm">
              <Card.Header>
                <Text fontWeight="semibold">Service Worker</Text>
              </Card.Header>
              <Card.Body>
                <VStack align="stretch" gap={2}>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Supported:</Text>
                    <Badge colorScheme={isSupported ? 'green' : 'red'}>
                      {isSupported ? 'Yes' : 'No'}
                    </Badge>
                  </HStack>
                  <HStack justify="space-between">
                    <Text fontSize="sm">Registered:</Text>
                    <Badge colorScheme={isRegistered ? 'green' : 'red'}>
                      {isRegistered ? 'Yes' : 'No'}
                    </Badge>
                  </HStack>
                  {swInfo && (
                    <>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Active:</Text>
                        <Badge colorScheme={swInfo.active ? 'green' : 'orange'}>
                          {swInfo.active ? 'Yes' : 'No'}
                        </Badge>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm">Installing:</Text>
                        <Badge colorScheme={swInfo.installing ? 'blue' : 'gray'}>
                          {swInfo.installing ? 'Yes' : 'No'}
                        </Badge>
                      </HStack>
                    </>
                  )}
                </VStack>
              </Card.Body>
            </Card.Root>

            {/* Cache Info */}
            <Card.Root size="sm">
              <Card.Header>
                <Text fontWeight="semibold">Browser Caches ({cacheInfo.length})</Text>
              </Card.Header>
              <Card.Body>
                {cacheInfo.length === 0 ? (
                  <Text fontSize="sm" color="gray.500">No caches found</Text>
                ) : (
                  <VStack align="stretch" gap={2}>
                    {cacheInfo.map((cache, index) => (
                      <Box key={index} p={2} bg="gray.50" borderRadius="md">
                        <HStack justify="space-between" mb={1}>
                          <Text fontSize="sm" fontWeight="medium">{cache.name}</Text>
                          <Badge size="sm">{cache.size} items</Badge>
                        </HStack>
                        {cache.urls.length > 0 && (
                          <Text fontSize="xs" color="gray.600" 
                                style={{ 
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                            {cache.urls[0]}
                            {cache.urls.length > 1 && ` +${cache.urls.length - 1} more`}
                          </Text>
                        )}
                      </Box>
                    ))}
                  </VStack>
                )}
              </Card.Body>
            </Card.Root>

            {/* Actions */}
            <VStack gap={2}>
              <Button
                size="sm"
                colorScheme="blue"
                width="full"
                onClick={() => {
                  loadCacheInfo();
                  loadSwInfo();
                }}
              >
                🔄 Refresh Info
              </Button>
              
              <Button
                size="sm"
                colorScheme="orange"
                width="full"
                onClick={checkForUpdates}
              >
                🔍 Check for Updates
              </Button>
              
              <Button
                size="sm"
                colorScheme="red"
                width="full"
                onClick={handleClearAllCaches}
              >
                🗑️ Clear All Caches
              </Button>
              
              <Button
                size="sm"
                colorScheme="purple"
                width="full"
                onClick={handleHardRefresh}
              >
                🚀 Hard Refresh
              </Button>
            </VStack>

            {/* Debug Info */}
            <Box p={3} bg="gray.50" borderRadius="md" fontSize="xs" fontFamily="mono">
              <Text>User Agent: {navigator.userAgent.slice(0, 50)}...</Text>
              <Text>Online: {navigator.onLine ? 'Yes' : 'No'}</Text>
              <Text>Timestamp: {new Date().toISOString()}</Text>
            </Box>
          </VStack>
        </Box>
      )}
    </>
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