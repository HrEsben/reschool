"use client";

import { useUser } from "@stackframe/stack";
import { Box, Heading, Text, VStack, Spinner } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Header } from "@/components/ui/header";
import { ChildrenManager } from "@/components/children/children-manager";

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
        flexDirection="column"
        gap={4}
      >
        <Spinner size="xl" color="blue.500" />
        <Text color="gray.600" fontSize="lg">
          Indlæser...
        </Text>
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
          
          

          {/* Child Management Section */}
          <ChildrenManager />

        
        </VStack>
      </Box>
    </Box>
  );
}
