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
  Table,
  Icon
} from '@chakra-ui/react';
import { AuthenticatedLayout } from '@/components/layouts/authenticated-layout';
import { DeleteChildDialog } from '@/components/ui/delete-child-dialog';
import { RemoveUserDialog } from '@/components/ui/remove-user-dialog';

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

export default function ChildSlugPage() {
  const params = useParams();
  const router = useRouter();
  const user = useUser();
  const [childData, setChildData] = useState<ChildData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [removingUser, setRemovingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug as string;

  const fetchChildData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Direct slug-based lookup using the new API endpoint
      const response = await fetch(`/api/children/slug/${slug}`);
      
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
  }, [slug]);

  useEffect(() => {
    // Skip certain reserved routes
    const reservedRoutes = ['dashboard', 'settings', 'api', 'children', 'users', '_next', 'favicon.ico'];
    if (reservedRoutes.includes(slug.toLowerCase())) {
      setError('Ugyldig side');
      return;
    }

    if (slug && user) {
      fetchChildData();
    }
  }, [user, slug, fetchChildData]); // Include fetchChildData in dependencies

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

  const handleRemoveUser = async (userId: number) => {
    if (!childData) return;
    
    setRemovingUser(true);
    
    try {
      const response = await fetch(`/api/children/${childData.child.id}/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || 'Der opstod en fejl ved fjernelse af brugeren');
        return;
      }
      
      // Refresh the child data to show updated user list
      await fetchChildData();
    } catch (error) {
      console.error('Error removing user:', error);
      alert('Der opstod en netværksfejl ved fjernelse af brugeren');
    } finally {
      setRemovingUser(false);
    }
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <AuthenticatedLayout>
        <Box 
          minH="50vh" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          flexDirection="column"
          gap={4}
        >
          <Spinner size="xl" colorPalette="navy" />
          <Text color="fg.muted" fontSize="lg" fontWeight="500">
            Indlæser barnets profil...
          </Text>
        </Box>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
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
      </AuthenticatedLayout>
    );
  }

  if (!childData) {
    return null;
  }

  const currentUserRelation = childData.users.find(u => u.stackAuthId === user?.id);
  const isCurrentUserAdmin = currentUserRelation?.isAdministrator || false;

  return (
    <AuthenticatedLayout>
      <Box p={8}>
        <VStack gap={6} align="stretch" maxW="4xl" mx="auto">
          {/* Child Header - simplified */}
          <VStack align="start" gap={2}>
            <Heading size="xl" color="navy.800" mb={4} fontWeight="700">
              {childData.child.name}
            </Heading>
            <Box className="w-20 h-1 bg-sunset-500 rounded-full"></Box>
          </VStack>

          {/* Connected Users Section */}
          <Box 
            bg="bg.surface" 
            borderRadius="xl" 
            border="1px solid" 
            borderColor="border.muted" 
            p={6}
          >
            <VStack align="stretch" gap={4}>
              <Heading size="lg" color="fg.default" fontWeight="600">
                {getPossessiveForm(childData.child.name)} voksne ({childData.users.length})
              </Heading>
              <Box className="w-16 h-1 bg-cambridge-blue-500 rounded-full"></Box>
              
              <Separator />

              <Table.Root size="md" variant="line" striped>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader color="fg.muted" fontWeight="600">Navn</Table.ColumnHeader>
                    <Table.ColumnHeader color="fg.muted" fontWeight="600">Email</Table.ColumnHeader>
                    <Table.ColumnHeader color="fg.muted" fontWeight="600">Relation</Table.ColumnHeader>
                    <Table.ColumnHeader color="fg.muted" fontWeight="600">Rolle</Table.ColumnHeader>
                    <Table.ColumnHeader color="fg.muted" fontWeight="600">Tilføjet</Table.ColumnHeader>
                    {isCurrentUserAdmin && (
                      <Table.ColumnHeader color="fg.muted" fontWeight="600">Handlinger</Table.ColumnHeader>
                    )}
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {childData.users.map((userData) => (
                    <Table.Row 
                      key={userData.id}
                      _hover={{ bg: "cream.100", cursor: "pointer" }}
                      onClick={() => router.push(`/users/${generateUserSlug(userData)}`)}
                      transition="background-color 0.2s ease"
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
                          <Text fontWeight="500" color="fg.default">
                            {userData.displayName || 'Navn ikke angivet'}
                          </Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>
                        <Text color="fg.muted" fontSize="sm" fontWeight="500">
                          {userData.email}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text color="fg.default" fontSize="sm" fontWeight="500">
                          {getRelationDisplayName(userData)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        {userData.isAdministrator ? (
                          <Text color="fg.default" fontSize="sm" fontWeight="500">
                            Administrator
                          </Text>
                        ) : (
                          <Text color="fg.muted" fontSize="sm" fontWeight="400">
                            Bruger
                          </Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Text color="fg.muted" fontSize="sm" fontWeight="500">
                          {formatDate(userData.createdAt)}
                        </Text>
                      </Table.Cell>
                      {isCurrentUserAdmin && (
                        <Table.Cell>
                          {(() => {
                            // Current user data
                            const currentUserData = childData.users.find(u => u.stackAuthId === user?.id);
                            
                            // Count administrators
                            const adminCount = childData.users.filter(u => u.isAdministrator).length;
                            
                            // Don't show remove button if:
                            // 1. This is the current user and they are the last admin
                            const isCurrentUser = userData.stackAuthId === user?.id;
                            const isLastAdmin = userData.isAdministrator && adminCount <= 1;
                            
                            if (isCurrentUser && isLastAdmin) {
                              return (
                                <Text color="fg.muted" fontSize="xs" fontStyle="italic">
                                  Sidste admin
                                </Text>
                              );
                            }
                            
                            return (
                              <RemoveUserDialog
                                trigger={
                                  <Button
                                    variant="subtle"
                                    size="sm"
                                    colorPalette="red"
                                    _hover={{
                                      bg: "#e07a5f",
                                      color: "white"
                                    }}
                                    bg="rgba(224, 122, 95, 0.1)"
                                    color="#e07a5f"
                                    border="1px solid rgba(224, 122, 95, 0.3)"
                                  >
                                    <Icon boxSize={4}>
                                      <svg fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53L15.986 5.952l.149.022a.75.75 0 00.23-1.482A48.16 48.16 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                      </svg>
                                    </Icon>
                                  </Button>
                                }
                                userName={userData.displayName || ''}
                                userEmail={userData.email}
                                onConfirm={() => handleRemoveUser(userData.id)}
                                isLoading={removingUser}
                              />
                            );
                          })()}
                        </Table.Cell>
                      )}
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              {childData.users.length === 0 && (
                <Text color="fg.muted" textAlign="center" py={8} fontWeight="500">
                  Ingen brugere er tilknyttet dette barn endnu
                </Text>
              )}
            </VStack>
          </Box>

          {/* Tools Section Placeholder */}
          <Box 
            bg="bg.surface" 
            borderRadius="xl" 
            border="1px solid" 
            borderColor="border.muted" 
            p={6}
          >
            <VStack align="stretch" gap={4}>
              <Heading size="lg" color="fg.default" fontWeight="600">
                Værktøjer
              </Heading>
              <Box className="w-16 h-1 bg-delft-blue-500 rounded-full"></Box>
              
              <Separator />
              
              <Text color="fg.muted" textAlign="center" py={8} fontWeight="500">
                Værktøjssektionen kommer snart...
              </Text>
            </VStack>
          </Box>

          {/* Delete Button - Only for Admins */}
          {isCurrentUserAdmin && (
            <Box mt={8} pt={6} borderTop="1px solid" borderColor="border.muted">
              <HStack justify="center">
                <DeleteChildDialog
                  trigger={
                    <Button
                      variant="subtle"
                      size="sm"
                      colorPalette="red"
                      _hover={{
                        bg: "#e07a5f",
                        color: "white"
                      }}
                      bg="rgba(224, 122, 95, 0.1)"
                      color="#e07a5f"
                      border="1px solid rgba(224, 122, 95, 0.3)"
                      fontWeight="500"
                    >
                      <Icon mr={2}>
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53L15.986 5.952l.149.022a.75.75 0 00.23-1.482A48.16 48.16 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                        </svg>
                      </Icon>
                      Slet barn
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
    </AuthenticatedLayout>
  );
}
