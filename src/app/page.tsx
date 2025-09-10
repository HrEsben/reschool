"use client";

import { useUser } from "@stackframe/stack";
import { Box, Button, Heading, Text, VStack, HStack, Spinner } from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

function AuthenticatedHome() {
  const user = useUser(); // This is now inside a Suspense boundary
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
        <Heading 
          size="4xl" 
          fontWeight="900"
          letterSpacing="-0.05em"
          style={{
            background: 'linear-gradient(135deg, #e07a5f 0%, #3d405b 25%, #81b29a 75%, #f2cc8f 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontStretch: 'condensed'
          }}
        >
          ReSchool
        </Heading>
        
        {user === null ? (
          // Not authenticated - show login/signup
          <VStack gap={6}>
            <Text fontSize="lg" className="text-delft-blue-600" maxW="md" textAlign="center" lineHeight="1.6">
              En tryg vej tilbage i skole for børn med ufrivilligt skolefravær
            </Text>
            
            <HStack gap={4}>
              <Link href="/login">
                <Button 
                  bg="#81b29a"
                  color="white"
                  _hover={{ bg: "#6da085" }}
                  size="lg"
                  fontWeight="600"
                >
                  Log ind
                </Button>
              </Link>
              
              <Link href="/signup">
                <Button 
                  variant="outline"
                  borderColor="#f2cc8f"
                  color="#d4a574"
                  _hover={{ 
                    bg: "#f2cc8f", 
                    color: "#8b6914",
                    borderColor: "#f2cc8f"
                  }}
                  size="lg"
                  fontWeight="600"
                >
                  Opret bruger
                </Button>
              </Link>
            </HStack>
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
        Checking authentication...
      </Text>
    </Box>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthenticatedHome />
    </Suspense>
  );
}
