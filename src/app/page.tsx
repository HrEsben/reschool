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
      className="bg-eggshell-900"
    >
      <VStack gap={8} textAlign="center">
        <Heading size="2xl" className="text-delft-blue-500">
          Velkommen til ReSchool
        </Heading>
        
        {user === undefined ? (
          // Loading state
          <VStack gap={4}>
            <Spinner size="lg" className="text-delft-blue-500" />
            <Text className="text-delft-blue-600">Indlæser...</Text>
          </VStack>
        ) : user === null ? (
          // Not authenticated - show login/signup
          <VStack gap={4}>
            <Text fontSize="lg" className="text-delft-blue-600">
              Log ind eller opret en konto for at komme i gang.
            </Text>
            
            <HStack gap={4}>
              <Link href="/handler/sign-in">
                <Button 
                  className="bg-cambridge-blue-500 text-white hover:bg-cambridge-blue-400 shadow-md hover:shadow-lg"
                  size="lg"
                >
                  Log ind
                </Button>
              </Link>
              
              <Link href="/handler/sign-up">
                <Button 
                  variant="outline" 
                  className="border-sunset-500 text-sunset-600 hover:bg-sunset-900 hover:text-sunset-600"
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
