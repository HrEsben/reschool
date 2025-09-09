"use client";

import { useUser } from "@stackframe/stack";
import { Box, Button, Heading, Text, VStack, HStack, Spinner, Alert } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Ensure we're on the client side before accessing Stack Auth
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Wrap useUser in try-catch to handle auth errors gracefully
  let user = null;
  try {
    user = isClient ? useUser() : undefined;
  } catch (error) {
    console.error('Stack Auth Error:', error);
    setAuthError(error instanceof Error ? error.message : 'Authentication error occurred');
  }

  // Redirect based on user state
  useEffect(() => {
    if (user && !authError) {
      // All authenticated users go to dashboard
      // The AuthenticatedLayout will handle name collection if needed
      router.push("/dashboard");
    }
  }, [user, router, authError]);

  // Show auth error if present
  if (authError) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        p={8}
        className="bg-eggshell-900"
      >
        <VStack gap={6} align="center" maxW="lg" mx="auto">
          <Alert.Root status="error" className="bg-red-50 border border-red-200">
            <Alert.Title>Authentication Error</Alert.Title>
            <Alert.Description>
              {authError}
            </Alert.Description>
          </Alert.Root>
          
          <VStack gap={4}>
            <Button 
              onClick={() => {
                // Clear local storage and reload
                if (typeof window !== 'undefined') {
                  localStorage.clear();
                  sessionStorage.clear();
                  document.cookie.split(";").forEach((c) => {
                    const eqPos = c.indexOf("=");
                    const name = eqPos > -1 ? c.substr(0, eqPos) : c;
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                  });
                  window.location.reload();
                }
              }}
              colorScheme="blue"
            >
              Clear Auth Data & Reload
            </Button>
            
            <Link href="/login">
              <Button variant="outline">
                Go to Login
              </Button>
            </Link>
          </VStack>
        </VStack>
      </Box>
    );
  }

  // Show loading state while checking auth
  if (!isClient || user === undefined) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        flexDirection="column"
        gap={4}
        className="bg-eggshell-900"
      >
        <Spinner size="xl" className="text-delft-blue-500" />
        <Text className="text-delft-blue-600" fontSize="lg" fontWeight="500">
          Checking authentication...
        </Text>
      </Box>
    );
  }
