"use client";

import { useEffect } from 'react';
import { useUser } from '@stackframe/stack';
import { Box, Button, Heading, Text, VStack, Alert } from '@chakra-ui/react';

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AuthErrorBoundary({ children, fallback }: AuthErrorBoundaryProps) {
  let user;
  let hasAuthError = false;
  let authErrorMessage = '';

  try {
    user = useUser();
  } catch (error) {
    hasAuthError = true;
    authErrorMessage = error instanceof Error ? error.message : 'Authentication error occurred';
    console.error('Stack Auth Error in AuthErrorBoundary:', error);
  }

  // Custom fallback UI for auth errors
  if (hasAuthError) {
    return fallback || (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        p={8}
        className="bg-eggshell-900"
      >
        <VStack gap={6} align="center" maxW="lg" mx="auto">
          <Heading size="lg" className="text-delft-blue-600">
            Authentication Issue
          </Heading>
          
          <Alert.Root status="warning" className="bg-yellow-50 border border-yellow-200">
            <Alert.Description>
              There was an issue with authentication. This is usually resolved by clearing your browser data.
            </Alert.Description>
          </Alert.Root>
          
          <VStack gap={4}>
            <Button 
              onClick={() => {
                // Clear browser storage and reload
                if (typeof window !== 'undefined') {
                  localStorage.clear();
                  sessionStorage.clear();
                  // Clear cookies
                  document.cookie.split(";").forEach((c) => {
                    const eqPos = c.indexOf("=");
                    const name = eqPos > -1 ? c.substr(0, eqPos) : c;
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                  });
                  window.location.reload();
                }
              }}
              colorScheme="blue"
              size="lg"
            >
              Clear Data & Reload
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/login'}
              variant="outline" 
              size="lg"
            >
              Go to Login
            </Button>
          </VStack>
          
          <Text fontSize="sm" className="text-delft-blue-400" textAlign="center">
            Error: {authErrorMessage}
          </Text>
        </VStack>
      </Box>
    );
  }

  // If no auth error, render children normally
  return <>{children}</>;
}
