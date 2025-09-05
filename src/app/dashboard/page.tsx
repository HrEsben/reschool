"use client";

import { useUser } from "@stackframe/stack";
import { Box, Heading, Text, VStack, Card } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/components/ui/header";

export default function Dashboard() {
  const user = useUser();
  const router = useRouter();

  // Redirect based on user state
  useEffect(() => {
    if (user === null) {
      router.push("/");
    } else if (user && (!user.displayName || user.displayName.trim() === '')) {
      // User doesn't have a name set - redirect to settings
      router.push("/settings?firstTime=true");
    }
  }, [user, router]);

  // Show loading state while checking authentication
  if (user === undefined) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
      >
        <Text>Loading...</Text>
      </Box>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (user === null) {
    return null;
  }

  return (
    <Box minH="100vh">
      <Header />
      
      <Box p={8}>
        {/* Welcome Section */}
        <VStack gap={6} align="stretch" maxW="4xl" mx="auto">
          <Heading size="xl" color="blue.600" mb={4}>
            Dashboard
          </Heading>
          
          <Card.Root>
            <Card.Body>
              <VStack align="start" gap={2}>
                <Heading size="lg">
                  Velkommen, {user.displayName || user.primaryEmail}!
                </Heading>
                <Text color="gray.600">
                  Dette er dit dashboard. Her kan du administrere dine kurser og aktiviteter.
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Dashboard Content - Empty for now */}
          <Card.Root>
            <Card.Body>
              <VStack gap={4} py={8}>
                <Heading size="md" color="gray.500">
                  Dashboard indhold kommer snart
                </Heading>
                <Text color="gray.400" textAlign="center">
                  Her vil du kunne se dine kurser, opgaver og fremskridt.
                </Text>
              </VStack>
            </Card.Body>
          </Card.Root>
        </VStack>
      </Box>
    </Box>
  );
}
