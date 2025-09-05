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
import { Header } from '@/components/ui/header';
import { DeleteChildDialog } from '@/components/ui/delete-child-dialog';

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
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug as string;

  useEffect(() => {
    if (user === null) {
      router.push("/");
      return;
    }

    // Skip certain reserved routes
    const reservedRoutes = ['dashboard', 'settings', 'api', 'children', 'users', '_next', 'favicon.ico'];
    if (reservedRoutes.includes(slug.toLowerCase())) {
      setError('Ugyldig side');
      return;
    }

    if (user && slug) {
      fetchChildData();
    }
  }, [user, slug]);

  const fetchChildData = async () => {
    try {
      setLoading(true);
      // First, get all children for the user to find the one matching the slug
      const childrenResponse = await fetch('/api/children');
      if (!childrenResponse.ok) {
        setError('Der opstod en fejl ved hentning af børn');
        return;
      }

      const childrenData = await childrenResponse.json();
      const targetChild = childrenData.children?.find((child: any) => 
        child.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
      );

      if (!targetChild) {
        setError('Barnet blev ikke fundet');
        return;
      }

      // Now fetch the detailed child data using the ID
      const response = await fetch(`/api/children/${targetChild.id}`);
      
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
                    Oprettet: {formatDate(childData.child.createdAt)}
                  </Text>
                  {isCurrentUserAdmin && (
                    <Badge colorScheme="blue">
                      ⭐ Administrator
                    </Badge>
                  )}
                </HStack>
              </VStack>
              
              {isCurrentUserAdmin && (
                <HStack gap={3}>
                  <Button
                    colorScheme="blue"
                    variant="outline"
                  >
                    ⚙️ Indstillinger
                  </Button>
                  
                  <DeleteChildDialog
                    trigger={
                      <Button
                        colorScheme="red"
                        variant="outline"
                      >
                        🗑️ Slet barn
                      </Button>
                    }
                    childName={childData.child.name}
                    onConfirm={handleDeleteChild}
                    isLoading={deleting}
                  />
                </HStack>
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
                      _hover={{ bg: "blue.50", cursor: "pointer" }}
                      onClick={() => router.push(`/users/${userData.stackAuthId}`)}
                    >
                      <Table.Cell>
                        <HStack gap={3}>
                          <Box
                            w={8}
                            h={8}
                            bg="blue.500"
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
