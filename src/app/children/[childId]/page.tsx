"use client";

import { useEffect, useState, useCallback } from 'react';
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
import { DeleteChildDialog } from '@/components/ui/delete-child-dialog';
import { BarometerManager } from '@/components/barometer/barometer-manager';

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
  const [deleting, setDeleting] = useState(false);

  const childId = params.childId as string;

  const fetchChildData = useCallback(async () => {
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
  }, [childId]);

  useEffect(() => {
    if (user === null) {
      router.push("/");
      return;
    }

    if (user && childId) {
      fetchChildData();
    }
  }, [user, childId, fetchChildData, router]);

  const getRelationDisplayName = (user: UserWithRelation) => {
    if (user.relation === 'Ressourceperson' && user.customRelationName) {
      return user.customRelationName;
    }
    return user.relation;
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

  const formatDate = (dateString: string) => {
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

  const getPossessiveForm = (name: string) => {
    // Danish possessive: if name ends with 's', add apostrophe (´), otherwise add 's'
    if (name.toLowerCase().endsWith('s')) {
      return `${name}´`;
    }
    return `${name}s`;
  };

  const generateUserSlug = (userData: UserWithRelation) => {
    const generateSlug = (text: string) => {
      return text.toLowerCase()
        .replace(/[æå]/g, 'a')
        .replace(/[ø]/g, 'o')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    };

    return userData.displayName 
      ? generateSlug(userData.displayName)
      : generateSlug(userData.email.split('@')[0]);
  };

  const handleDeleteChild = async () => {
    if (!childData) return;
    
    setDeleting(true);
    
    try {
      const response = await fetch(`/api/children/${childData.child.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Der opstod en fejl ved sletning af barnet');
        return;
      }
      
      // Redirect to dashboard after successful deletion
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting child:', error);
      alert('Der opstod en netværksfejl ved sletning af barnet');
    } finally {
      setDeleting(false);
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
      <AppLayout>
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
      </AppLayout>
    );
  }

  if (!childData) {
    return null;
  }

  const currentUserRelation = childData.users.find(u => u.stackAuthId === user.id);
  const isCurrentUserAdmin = currentUserRelation?.isAdministrator || false;

  return (
    <AppLayout>
      <Box p={8}>
        <VStack gap={6} align="stretch" maxW="4xl" mx="auto">
          {/* Child Header - simplified */}
          <Heading size="xl" color="navy.800" mb={4} fontWeight="700">
            {childData.child.name}
          </Heading>

          {/* Connected Users Section */}
          <Box 
            bg="bg.surface" 
            borderRadius="xl" 
            border="1px solid" 
            borderColor="border.muted" 
            p={6}
            shadow="lg"
          >
            <VStack align="stretch" gap={4}>
              <Heading size="lg" color="fg.default" fontWeight="600">
                {getPossessiveForm(childData.child.name)} voksne ({childData.users.length})
              </Heading>
              
              <Separator />

              <Table.Root size="md" variant="line" striped>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Navn</Table.ColumnHeader>
                    <Table.ColumnHeader>Email</Table.ColumnHeader>
                    <Table.ColumnHeader>Relation</Table.ColumnHeader>
                    <Table.ColumnHeader>Rolle</Table.ColumnHeader>
                    <Table.ColumnHeader>Tilføjet</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {childData.users.map((userData) => (
                    <Table.Row 
                      key={userData.id}
                      _hover={{ bg: "cream.100", cursor: "pointer" }}
                      onClick={() => router.push(`/users/${generateUserSlug(userData)}`)}
                    >
                      <Table.Cell>
                        <HStack gap={3}>
                          <Box
                            w={8}
                            h={8}
                            bg="navy.500"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            fontWeight="bold"
                            fontSize="sm"
                          >
                            {(userData.displayName || userData.email).charAt(0).toUpperCase()}
                          </Box>
                          <Text fontWeight="medium">
                            {userData.displayName || 'Navn ikke angivet'}
                          </Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>
                        <Text color="gray.600" fontSize="sm">
                          {userData.email}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge 
                          colorScheme={getRelationBadgeColor(userData.relation)}
                          size="sm"
                        >
                          {getRelationDisplayName(userData)}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        {userData.isAdministrator && (
                          <Badge colorScheme="blue" size="sm">
                            ⭐ Admin
                          </Badge>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Text color="gray.500" fontSize="sm">
                          {formatDate(userData.createdAt)}
                        </Text>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              {childData.users.length === 0 && (
                <Text color="gray.500" textAlign="center" py={8}>
                  Ingen brugere er tilknyttet dette barn endnu
                </Text>
              )}
            </VStack>
          </Box>

          {/* Tools Section - Barometer */}
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
                Værktøjer - Barometer
              </Heading>
              
              <Separator />
              
              <BarometerManager 
                childId={childData.child.id} 
                isUserAdmin={isCurrentUserAdmin}
              />
            </VStack>
          </Box>

          {/* Delete Button - Only for Admins */}
          {isCurrentUserAdmin && (
            <Box mt={8} pt={6} borderTop="1px solid" borderColor="gray.200">
              <HStack justify="center">
                <DeleteChildDialog
                  trigger={
                    <Button
                      colorScheme="red"
                      variant="outline"
                      size="sm"
                    >
                      🗑️ Slet barn
                    </Button>
                  }
                  childName={childData.child.name}
                  onConfirm={handleDeleteChild}
                  isLoading={deleting}
                />
              </HStack>
            </Box>
          )}

        </VStack>
      </Box>
    </AppLayout>
  );
}
