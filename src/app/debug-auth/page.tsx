"use client";

import { useState, useEffect } from 'react';
import { Box, Button, Text, VStack, Card, Code, Heading } from '@chakra-ui/react';

export default function AuthDebug() {
  const [browserData, setBrowserData] = useState<any>({});
  const [stackAuthStatus, setStackAuthStatus] = useState<string>('checking...');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check browser storage
      const localStorageKeys = Object.keys(localStorage);
      const sessionStorageKeys = Object.keys(sessionStorage);
      const cookies = document.cookie;

      setBrowserData({
        localStorage: localStorageKeys.filter(key => key.includes('stack')),
        sessionStorage: sessionStorageKeys.filter(key => key.includes('stack')),
        cookies: cookies.split(';').filter(c => c.includes('stack')),
        userAgent: navigator.userAgent,
        url: window.location.href
      });

      // Test Stack Auth
      try {
        import('@stackframe/stack').then(({ useUser }) => {
          setStackAuthStatus('Stack Auth module loaded successfully');
        });
      } catch (error) {
        setStackAuthStatus(`Stack Auth error: ${error}`);
      }
    }
  }, []);

  const clearAllAuthData = () => {
    if (typeof window !== 'undefined') {
      // Clear localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.includes('stack') || key.includes('auth')) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      Object.keys(sessionStorage).forEach(key => {
        if (key.includes('stack') || key.includes('auth')) {
          sessionStorage.removeItem(key);
        }
      });

      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
        if (name.includes('stack') || name.includes('auth') || name.includes('token')) {
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
          document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=localhost";
        }
      });

      window.location.reload();
    }
  };

  return (
    <Box minH="100vh" p={8} className="bg-eggshell-900">
      <VStack gap={6} maxW="4xl" mx="auto">
        <Heading>Stack Auth Debug Information</Heading>
        
        <Card.Root>
          <Card.Header>
            <Heading size="md">Stack Auth Status</Heading>
          </Card.Header>
          <Card.Body>
            <Text>{stackAuthStatus}</Text>
          </Card.Body>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Heading size="md">Browser Storage Data</Heading>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Box>
                <Text fontWeight="bold">Local Storage (Stack-related):</Text>
                <Code>{JSON.stringify(browserData.localStorage, null, 2)}</Code>
              </Box>
              
              <Box>
                <Text fontWeight="bold">Session Storage (Stack-related):</Text>
                <Code>{JSON.stringify(browserData.sessionStorage, null, 2)}</Code>
              </Box>
              
              <Box>
                <Text fontWeight="bold">Cookies (Stack-related):</Text>
                <Code>{JSON.stringify(browserData.cookies, null, 2)}</Code>
              </Box>
              
              <Box>
                <Text fontWeight="bold">Current URL:</Text>
                <Code>{browserData.url}</Code>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>

        <VStack gap={4}>
          <Button 
            onClick={clearAllAuthData}
            colorScheme="red"
            size="lg"
          >
            Clear All Auth Data & Reload
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/'}
            colorScheme="blue"
            variant="outline"
          >
            Back to Home
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
