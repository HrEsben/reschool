"use client";

import { useUser } from "@stackframe/stack";
import { Box, Button, Text, VStack, Spinner } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

function HomeContent() {
  const user = useUser(); // Now safely inside Suspense
  const router = useRouter();

  // Redirect if authenticated
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
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
        <Text fontSize="2xl" fontWeight="bold" className="text-delft-blue-600">
          ReSchool
        </Text>
        
        {user === null ? (
          // Not authenticated - show login/signup
          <VStack gap={6}>
            <Text fontSize="lg" className="text-delft-blue-600" maxW="md" textAlign="center">
              En tryg vej tilbage i skole for børn med ufrivilligt skolefravær
            </Text>
            
            <VStack gap={4}>
              <Link href="/login">
                <Button 
                  bg="#81b29a"
                  color="white"
                  _hover={{ bg: "#6da085" }}
                  size="lg"
                >
                  Log ind
                </Button>
              </Link>
              
              <Link href="/signup">
                <Button 
                  variant="outline"
                  borderColor="#f2cc8f"
                  color="#d4a574"
                  size="lg"
                >
                  Opret bruger
                </Button>
              </Link>
            </VStack>
          </VStack>
        ) : (
          // User is authenticated, redirecting...
          <VStack gap={4}>
            <Spinner size="lg" className="text-delft-blue-500" />
            <Text className="text-delft-blue-600">Omdirigerer til dashboard...</Text>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}

function LoadingFallback() {
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
        Loading...
      </Text>
    </Box>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <HomeContent />
    </Suspense>
  );
}
