"use client";

import { useEffect, useState } from 'react';
import { Box, Button, Text, VStack } from '@chakra-ui/react';

interface MobileCacheFixProps {
  children: React.ReactNode;
}

export function MobileCacheFix({ children }: MobileCacheFixProps) {
  const [isStuck, setIsStuck] = useState(false);
  const [showRefreshPrompt, setShowRefreshPrompt] = useState(false);

  useEffect(() => {
    // Only check for stuck loading after a very long time and only once per session
    const hasChecked = sessionStorage.getItem('stuckCheckDone');
    if (hasChecked) return;

    const loadingTimeout = setTimeout(() => {
      // Look for actual loading spinners that indicate stuck state
      const hasLoadingSpinner = document.querySelector('[data-loading="true"]') || 
                               document.querySelector('.chakra-spinner') ||
                               document.querySelector('[role="status"]');
      
      // Only show if we're truly stuck (spinner visible for 15+ seconds)
      if (hasLoadingSpinner) {
        setIsStuck(true);
        setShowRefreshPrompt(true);
        sessionStorage.setItem('stuckCheckDone', 'true');
      }
    }, 15000); // Wait 15 seconds before checking

    return () => clearTimeout(loadingTimeout);
  }, []);

  useEffect(() => {
    // Much more conservative cache checking - only on first visit or major issues
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    
    // Only check for problematic browsers and only if we haven't checked recently
    if (isMobile && (isIOS || isSafari)) {
      const lastCacheCheck = localStorage.getItem('lastCacheCheck');
      const now = Date.now();
      
      // Only check once per day maximum
      if (lastCacheCheck && (now - parseInt(lastCacheCheck)) < 86400000) { // 24 hours
        return;
      }

      const checkCacheIssue = () => {
        const lastRefresh = localStorage.getItem('lastRefresh');
        const cacheVersion = localStorage.getItem('cacheVersion');
        const currentVersion = '1.0.0';
        
        // Only show if:
        // 1. This is the very first visit (no lastRefresh)
        // 2. OR cache version is significantly outdated (more than 24 hours)
        // 3. AND user hasn't dismissed it recently
        const dismissedRecently = localStorage.getItem('cachePromptDismissed');
        const dismissTime = dismissedRecently ? parseInt(dismissedRecently) : 0;
        
        if (!dismissedRecently || (now - dismissTime) > 86400000) { // 24 hours since last dismiss
          if (!lastRefresh || 
              cacheVersion !== currentVersion || 
              (now - parseInt(lastRefresh)) > 86400000) { // 24 hours
            
            console.log('[Mobile Cache] Cache may be outdated, suggesting refresh');
            setShowRefreshPrompt(true);
            localStorage.setItem('lastCacheCheck', now.toString());
          }
        }
      };

      // Only check once when component mounts, not on every visibility change
      checkCacheIssue();
    }
  }, []);

  const handleRefresh = () => {
    // Update cache tracking
    localStorage.setItem('lastRefresh', Date.now().toString());
    localStorage.setItem('cacheVersion', '1.0.0');
    
    // Clear any cached data
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Force hard refresh
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowRefreshPrompt(false);
    // Remember dismissal for 24 hours
    if (typeof window !== 'undefined') {
      localStorage.setItem('cachePromptDismissed', Date.now().toString());
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('refreshPromptDismissed', 'true');
      }
    }
  };

  const handleDisablePermanently = () => {
    setShowRefreshPrompt(false);
    // Permanently disable the cache prompt
    if (typeof window !== 'undefined') {
      localStorage.setItem('cachePromptDisabled', 'true');
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('refreshPromptDismissed', 'true');
      }
    }
  };

  // Don't show if already dismissed in this session OR in the last 24 hours OR user has disabled it
  if (typeof window !== 'undefined') {
    // Check if user has permanently disabled the cache prompt
    if (localStorage.getItem('cachePromptDisabled') === 'true') {
      return <>{children}</>;
    }
    
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('refreshPromptDismissed')) {
      return <>{children}</>;
    }
    
    const dismissedTime = localStorage.getItem('cachePromptDismissed');
    if (dismissedTime && (Date.now() - parseInt(dismissedTime)) < 86400000) { // 24 hours
      return <>{children}</>;
    }
  }

  return (
    <>
      {children}
      
      {/* Mobile Cache Refresh Prompt */}
      {showRefreshPrompt && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.8)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={10000}
          p={4}
        >
          <Box
            bg="white"
            borderRadius="xl"
            p={6}
            maxW="400px"
            width="100%"
            textAlign="center"
          >
            <VStack gap={4}>
              <Text fontSize="2xl">📱</Text>
              <Text fontWeight="bold" fontSize="lg">
                Cache Problem Detected
              </Text>
              <Text color="gray.600">
                {isStuck 
                  ? "The app seems stuck loading. This usually indicates a cache issue on mobile browsers."
                  : "Your cache may be outdated. Refreshing will ensure you have the latest version."
                }
              </Text>
              <VStack gap={2} width="100%">
                <Button
                  colorScheme="blue"
                  size="lg"
                  width="100%"
                  onClick={handleRefresh}
                >
                  🔄 Refresh Page
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDismiss}
                >
                  Remind me later
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handleDisablePermanently}
                  color="gray.500"
                >
                  Don&apos;t show this again
                </Button>
              </VStack>
            </VStack>
          </Box>
        </Box>
      )}
    </>
  );
}