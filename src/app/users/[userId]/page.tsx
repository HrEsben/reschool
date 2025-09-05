"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Badge,
  Button
} from '@chakra-ui/react';
import { Header } from '@/components/ui/header';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const user = useUser();
  const [loading, setLoading] = useState(true);

  const userId = params.userId as string;

  useEffect(() => {
    if (user === null) {
      router.push("/");
      return;
    }

    if (user) {
      setLoading(false);
    }
  }, [user]);

  // Show loading state while checking authentication
  if (user === undefined || loading) {
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
          Indlæser brugerprofil...
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
        <VStack gap={6} align="stretch" maxW="4xl" mx="auto">
          {/* Navigation */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            alignSelf="flex-start"
          >
            ← Tilbage
          </Button>

          {/* User Profile Header */}
          <Box 
            bg="white" 
            borderRadius="lg" 
            border="1px solid" 
            borderColor="gray.200" 
            p={6}
            shadow="sm"
          >
            <VStack align="center" gap={4}>
              <Box
                w={20}
                h={20}
                bg="blue.500"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontWeight="bold"
                fontSize="2xl"
              >
                {user.displayName?.charAt(0).toUpperCase() || user.primaryEmail?.charAt(0).toUpperCase() || '?'}
              </Box>
              
              <VStack gap={2}>
                <Heading size="lg" color="blue.600">
                  {user.displayName || 'Navn ikke angivet'}
                </Heading>
                <Text color="gray.600">
                  {user.primaryEmail}
                </Text>
                <Badge colorScheme="blue" size="sm">
                  Bruger ID: {userId}
                </Badge>
              </VStack>
            </VStack>
          </Box>

          {/* Content Placeholder */}
          <Box 
            bg="white" 
            borderRadius="lg" 
            border="1px solid" 
            borderColor="gray.200" 
            p={6}
            shadow="sm"
          >
            <VStack align="stretch" gap={4}>
              <Heading size="lg" color="gray.700">
                Brugerprofil
              </Heading>
              
              <Text color="gray.500" textAlign="center" py={8}>
                Brugerprofilsektionen kommer snart...
              </Text>
            </VStack>
          </Box>

        </VStack>
      </Box>
    </Box>
  );
}
