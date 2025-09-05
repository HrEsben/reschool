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
  Separator,
  Table
} from '@chakra-ui/react';
import { AppLayout } from '@/components/ui/app-layout';

interface ChildWithRelation {
  id: number;
  name: string;
  slug: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  relation: string;
  customRelationName?: string;
  isAdministrator: boolean;
}

interface User {
  id: number;
  stackAuthId: string;
  email: string;
  displayName?: string;
  profileImageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserProfileData {
  user: User;
  children: ChildWithRelation[];
}

export default function UserSlugPage() {
  const params = useParams();
  const router = useRouter();
  const user = useUser();
  const [userProfileData, setUserProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userSlug = params.userSlug as string;

  useEffect(() => {
    if (user === null) {
      router.push("/");
      return;
    }

    if (user && userSlug) {
      fetchUserProfileData();
    }
  }, [user, userSlug]);

  const fetchUserProfileData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/users/${userSlug}`);
      
      if (!response.ok) {
        if (response.status === 403) {
          setError('Du har ikke adgang til denne brugerprofil');
        } else if (response.status === 404) {
          setError('Brugeren blev ikke fundet');
        } else {
          setError('Der opstod en fejl ved indlæsning af brugerprofilen');
        }
        return;
      }

      const data = await response.json();
      setUserProfileData(data);
    } catch (error) {
      console.error('Error fetching user profile data:', error);
      setError('Der opstod en netværksfejl');
    } finally {
      setLoading(false);
    }
  };

  const getRelationDisplayName = (child: ChildWithRelation) => {
    if (child.relation === 'Ressourceperson' && child.customRelationName) {
      return child.customRelationName;
    }
    return child.relation;
  };

  const getRelationBadgeColor = (relation: string) => {
    switch (relation) {
      case 'Mor': return 'coral';
      case 'Far': return 'navy';
      case 'Underviser': return 'sage';
      case 'Ressourceperson': return 'golden';
      default: return 'gray';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      return 'Dato ikke tilgængelig';
    }
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return 'Ugyldig dato';
      }
      return date.toLocaleDateString('da-DK');
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Ugyldig dato';
    }
  };

  const getUserDisplayName = () => {
    if (!userProfileData) return '';
    return userProfileData.user.displayName || userProfileData.user.email.split('@')[0];
  };

  const getPossessiveForm = (name: string) => {
    // Danish possessive: if name ends with 's', add apostrophe (´), otherwise add 's'
    if (name.toLowerCase().endsWith('s')) {
      return `${name}´`;
    }
    return `${name}s`;
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
        bg="bg.canvas"
      >
        <Spinner size="xl" colorPalette="navy" />
        <Text color="fg.muted" fontSize="lg" fontWeight="500">
          Indlæser brugerprofil...
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
      <AppLayout>
        <Box p={8}>
          <VStack gap={6} align="stretch" maxW="4xl" mx="auto">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              alignSelf="flex-start"
              colorPalette="navy"
            >
              ← Tilbage til Dashboard
            </Button>
            
            <Box 
              bg="coral.50" 
              border="1px solid" 
              borderColor="coral.200" 
              borderRadius="lg" 
              p={4}
            >
              <Text color="coral.600" fontWeight="500">
                {error}
              </Text>
            </Box>
          </VStack>
        </Box>
      </AppLayout>
    );
  }

  if (!userProfileData) {
    return null;
  }

  const isOwnProfile = userProfileData.user.stackAuthId === user.id;

  return (
    <AppLayout>
      <Box p={8}>
        <VStack gap={6} align="stretch" maxW="4xl" mx="auto">
          {/* User Header - simplified */}
          <VStack align="start" gap={2}>
            <VStack align="start" gap={1}>
              <Heading size="xl" color="navy.800" fontWeight="700">
                {getUserDisplayName()}
              </Heading>
              <Box className="w-20 h-1 bg-delft-blue-500 rounded-full"></Box>
            </VStack>
            <HStack gap={3}>
              <Box
                w={12}
                h={12}
                bg="navy.500"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                color="white"
                fontWeight="bold"
                fontSize="lg"
              >
                {getUserDisplayName().charAt(0).toUpperCase()}
              </Box>
              <VStack align="start" gap={1}>
                <Text color="fg.default" fontWeight="500">
                  {userProfileData.user.email}
                </Text>
                <Text color="fg.muted" fontSize="sm">
                  Medlem siden {formatDate(userProfileData.user.createdAt)}
                </Text>
              </VStack>
            </HStack>
          </VStack>

          {/* Connected Children Section */}
          <Box 
            bg="bg.surface" 
            borderRadius="xl" 
            border="1px solid" 
            borderColor="border.muted" 
            p={6}
          >
            <VStack align="stretch" gap={4}>
              <Heading size="lg" color="fg.default" fontWeight="600">
                {isOwnProfile ? 'Dine børn' : `${getPossessiveForm(getUserDisplayName())} børn`} ({userProfileData.children.length})
              </Heading>
              <Box className="w-16 h-1 bg-cambridge-blue-500 rounded-full"></Box>
              
              <Separator />

              {userProfileData.children.length > 0 ? (
                <Table.Root size="md" variant="line" striped>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader color="fg.muted" fontWeight="600">Navn</Table.ColumnHeader>
                      <Table.ColumnHeader color="fg.muted" fontWeight="600">Relation</Table.ColumnHeader>
                      <Table.ColumnHeader color="fg.muted" fontWeight="600">Rolle</Table.ColumnHeader>
                      <Table.ColumnHeader color="fg.muted" fontWeight="600">Tilføjet</Table.ColumnHeader>
                      <Table.ColumnHeader color="fg.muted" fontWeight="600">Oprettet</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {userProfileData.children.map((child) => (
                      <Table.Row 
                        key={child.id}
                        _hover={{ bg: "cream.100", cursor: "pointer" }}
                        onClick={() => router.push(`/${child.slug}`)}
                        transition="background-color 0.2s ease"
                      >
                        <Table.Cell>
                          <HStack gap={3}>
                            <Box
                              w={8}
                              h={8}
                              bg="sage.500"
                              borderRadius="full"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              color="white"
                              fontWeight="bold"
                              fontSize="sm"
                            >
                              {child.name.charAt(0).toUpperCase()}
                            </Box>
                            <Text fontWeight="500" color="fg.default">
                              {child.name}
                            </Text>
                          </HStack>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge 
                            colorPalette={getRelationBadgeColor(child.relation)}
                            size="sm"
                            fontWeight="500"
                          >
                            {getRelationDisplayName(child)}
                          </Badge>
                        </Table.Cell>
                        <Table.Cell>
                          {child.isAdministrator && (
                            <Badge colorPalette="golden" size="sm" fontWeight="500">
                              ⭐ Admin
                            </Badge>
                          )}
                        </Table.Cell>
                        <Table.Cell>
                          <Text color="fg.muted" fontSize="sm" fontWeight="500">
                            {formatDate(child.createdAt)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          <Text color="fg.muted" fontSize="sm" fontWeight="500">
                            {formatDate(child.createdAt)}
                          </Text>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              ) : (
                <Text color="fg.muted" textAlign="center" py={8} fontWeight="500">
                  {isOwnProfile ? 'Du har ikke tilføjet nogen børn endnu' : 'Denne bruger har ingen børn tilknyttet'}
                </Text>
              )}
            </VStack>
          </Box>

          {/* Settings Section - Only for own profile */}
          {isOwnProfile && (
            <Box 
              bg="bg.surface" 
              borderRadius="xl" 
              border="1px solid" 
              borderColor="border.muted" 
              p={6}
            >
              <VStack align="stretch" gap={4}>
                <Heading size="lg" color="fg.default" fontWeight="600">
                  Indstillinger
                </Heading>
                <Box className="w-16 h-1 bg-burnt-sienna-500 rounded-full"></Box>
                
                <Separator />
                
                <VStack align="stretch" gap={3}>
                  <Button
                    variant="outline"
                    colorPalette="navy"
                    onClick={() => router.push('/settings')}
                    size="sm"
                    justifyContent="start"
                  >
                    ⚙️ Rediger profil
                  </Button>
                  
                  <Text color="fg.muted" fontSize="sm" fontWeight="500">
                    Flere indstillinger kommer snart...
                  </Text>
                </VStack>
              </VStack>
            </Box>
          )}

        </VStack>
      </Box>
    </AppLayout>
  );
}
