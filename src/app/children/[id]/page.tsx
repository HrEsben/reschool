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
  Button,
  Grid,
  Separator
} from '@chakra-ui/react';
import { Header } from '@/components/ui/header';

interface UserWithRelation {
  id: number;
  stackAuthId: string;
  email: string;
  displayName?: string;
  profileImageUrl?: string;
  relation: string;
  customRelationName?: string;
  isAdministrator: boolean;
  createdAt: string;
}

interface Child {
  id: number;
  name: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

interface ChildData {
  child: Child;
  users: UserWithRelation[];
}

export default function ChildProfilePage() {
  const params = useParams();
  const router = useRouter();
  const user = useUser();
  const [childData, setChildData] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const childId = params.id as string;

  useEffect(() => {
    if (user === null) {
      router.push("/");
      return;
    }

    if (user && childId) {
      fetchChildData();
    }
  }, [user, childId]);

  const fetchChildData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/children/${childId}`);
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('Du har ikke adgang til dette barns profil');
        } else if (response.status === 404) {
          setError('Barnet blev ikke fundet');
        } else {
          setError('Der opstod en fejl ved indlæsning af barnets profil');
        }
        return;
      }

      const data = await response.json();
      setChildData(data);
    } catch (error) {
      console.error('Error fetching child data:', error);
      setError('Der opstod en netværksfejl');
    } finally {
      setLoading(false);
    }
  };

  const getRelationDisplayName = (user: UserWithRelation) => {
    if (user.relation === 'Ressourceperson' && user.customRelationName) {
      return user.customRelationName;
    }
    return user.relation;
  };

  const getRelationBadgeColor = (relation: string) => {
    switch (relation) {
      case 'Mor': return 'pink';
      case 'Far': return 'blue';
      case 'Underviser': return 'green';
      case 'Ressourceperson': return 'orange';
      default: return 'gray';
    }
  };

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
          Indlæser barnets profil...
        </Text>
      </Box>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (user === null) {
    return null;
  }

  if (error) {
    return (
      <Box minH="100vh">
        <Header />
        <Box p={8}>
          <VStack gap={6} align="stretch" maxW="4xl" mx="auto">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              alignSelf="flex-start"
            >
              ← Tilbage til Dashboard
            </Button>
            
            <Box 
              bg="red.50" 
              border="1px solid" 
              borderColor="red.200" 
              borderRadius="md" 
              p={4}
            >
              <Text color="red.600" fontWeight="medium">
                {error}
              </Text>
            </Box>
          </VStack>
        </Box>
      </Box>
    );
  }

  if (!childData) {
    return null;
  }

  const currentUserRelation = childData.users.find(u => u.stackAuthId === user.id);
  const isCurrentUserAdmin = currentUserRelation?.isAdministrator || false;

  return (
    <Box minH="100vh">
      <Header />
      
      <Box p={8}>
        <VStack gap={6} align="stretch" maxW="4xl" mx="auto">
          {/* Navigation */}
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            alignSelf="flex-start"
          >
            ← Tilbage til Dashboard
          </Button>

          {/* Child Header */}
          <Box 
            bg="white" 
            borderRadius="lg" 
            border="1px solid" 
            borderColor="gray.200" 
            p={6}
            shadow="sm"
          >
            <HStack justify="space-between" align="center">
              <VStack align="start" gap={2}>
                <Heading size="xl" color="blue.600">
                  {childData.child.name}
                </Heading>
                <HStack>
                  <Text color="gray.600" fontSize="sm">
                    Oprettet: {new Date(childData.child.createdAt).toLocaleDateString('da-DK')}
                  </Text>
                  {isCurrentUserAdmin && (
                    <Badge colorScheme="blue">
                      ⭐ Administrator
                    </Badge>
                  )}
                </HStack>
              </VStack>
              
              {isCurrentUserAdmin && (
                <Button
                  colorScheme="blue"
                  variant="outline"
                >
                  ⚙️ Indstillinger
                </Button>
              )}
            </HStack>
          </Box>

          {/* Connected Users Section */}
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
                Tilknyttede Brugere ({childData.users.length})
              </Heading>
              
              <Separator />

              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                {childData.users.map((userData) => (
                  <Box 
                    key={userData.id}
                    bg="gray.50" 
                    borderRadius="md" 
                    border="1px solid" 
                    borderColor="gray.200" 
                    p={4}
                  >
                    <HStack gap={4}>
                      <Box
                        w={12}
                        h={12}
                        bg="blue.500"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        color="white"
                        fontWeight="bold"
                        fontSize="lg"
                      >
                        {(userData.displayName || userData.email).charAt(0).toUpperCase()}
                      </Box>
                      
                      <VStack align="start" flex={1} gap={1}>
                        <HStack gap={2} wrap="wrap">
                          <Text fontWeight="semibold" fontSize="md">
                            {userData.displayName || 'Navn ikke angivet'}
                          </Text>
                          {userData.isAdministrator && (
                            <Badge colorScheme="blue" size="sm">
                              ⭐ Admin
                            </Badge>
                          )}
                        </HStack>
                        
                        <Text color="gray.600" fontSize="sm">
                          {userData.email}
                        </Text>
                        
                        <HStack>
                          <Badge 
                            colorScheme={getRelationBadgeColor(userData.relation)}
                            size="sm"
                          >
                            {getRelationDisplayName(userData)}
                          </Badge>
                        </HStack>
                        
                        <Text color="gray.500" fontSize="xs">
                          Tilføjet: {new Date(userData.createdAt).toLocaleDateString('da-DK')}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                ))}
              </Grid>

              {childData.users.length === 0 && (
                <Text color="gray.500" textAlign="center" py={8}>
                  Ingen brugere er tilknyttet dette barn endnu
                </Text>
              )}
            </VStack>
          </Box>

          {/* Tools Section Placeholder */}
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
                Værktøjer
              </Heading>
              
              <Separator />
              
              <Text color="gray.500" textAlign="center" py={8}>
                Værktøjssektionen kommer snart...
              </Text>
            </VStack>
          </Box>

        </VStack>
      </Box>
    </Box>
  );
}
