"use client";

import { useUser } from "@stackframe/stack";
import { Box, Button, Heading, Text, VStack, HStack, Spinner } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const user = useUser();
  const router = useRouter();

  // Redirect based on user state
  useEffect(() => {
    if (user) {
      // Check if user has a display name set
      if (!user.displayName || user.displayName.trim() === '') {
        // First time user - redirect to settings to set name
        router.push("/settings?firstTime=true");
      } else {
        // User has name set - go to dashboard
        router.push("/dashboard");
      }
    }
  }, [user, router]);

  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center" 
      p={8}
    >
      <VStack gap={8} textAlign="center">
        <Heading size="2xl" color="blue.600">
          Velkommen til ReSchool
        </Heading>
        
        {user === undefined ? (
          // Loading state
          <VStack gap={4}>
            <Spinner size="lg" color="blue.500" />
            <Text color="gray.600">Indlæser...</Text>
          </VStack>
        ) : user === null ? (
          // Not authenticated - show login/signup
          <VStack gap={4}>
            <Text fontSize="lg" color="gray.600">
              Log ind eller opret en konto for at komme i gang.
            </Text>
            
            <HStack gap={4}>
              <Link href="/handler/sign-in">
                <Button 
                  colorScheme="blue" 
                  size="lg"
                >
                  Log ind
                </Button>
              </Link>
              
              <Link href="/handler/sign-up">
                <Button 
                  variant="outline" 
                  colorScheme="blue" 
                  size="lg"
                >
                  Opret bruger
                </Button>
              </Link>
            </HStack>
          </VStack>
        ) : null}
      </VStack>
    </Box>
  );
}
