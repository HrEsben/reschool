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
  Button,
  Separator,
  Table,
  Input,
  Field,
  Dialog,
  Portal,
  CloseButton,
  Card
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

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const user = useUser();
  const [userProfileData, setUserProfileData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Settings state (only used when viewing own profile)
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [isSettingsLoading, setIsSettingsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const userId = params.userId as string;

  const fetchUserProfileData = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/users/${userId}`);
      
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
  }, [userId]);

  useEffect(() => {
    if (user === null) {
      router.push("/");
      return;
    }
    
    if (user && userId) {
      fetchUserProfileData();
    }
  }, [user, userId, fetchUserProfileData, router]);  const getRelationDisplayName = (child: ChildWithRelation) => {
    if (child.relation === 'Ressourceperson' && child.customRelationName) {
      return child.customRelationName;
    }
    return child.relation;
  };

  // Initialize settings form when user data is available
  useEffect(() => {
    if (user && userProfileData && userProfileData.user.stackAuthId === user.id) {
      if (user) {
        setDisplayName(user.displayName || "");
        setEmail(user.primaryEmail || "");
      }
    }
  }, [user, userProfileData]);

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

  // Settings functions (only used when viewing own profile)
  const showSettingsMessage = (type: 'success' | 'error', text: string) => {
    setSettingsMessage({ type, text });
    setTimeout(() => setSettingsMessage(null), 5000);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSettingsLoading(true);
    try {
      // Update display name if changed
      if (user.displayName !== displayName.trim()) {
        await user.update({ displayName: displayName.trim() });
      }

      showSettingsMessage('success', 'Profil opdateret succesfuldt');
    } catch {
      showSettingsMessage('error', 'Der opstod en fejl ved opdatering af profilen');
    } finally {
      setIsSettingsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsSettingsLoading(true);
    try {
      await user.delete();
      showSettingsMessage('success', 'Konto slettet');
      router.push("/");
    } catch {
      showSettingsMessage('error', 'Der opstod en fejl ved sletning af kontoen');
    } finally {
      setIsSettingsLoading(false);
      setIsDeleteDialogOpen(false);
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
                {isOwnProfile ? 'Tilknyttede børn' : `${getPossessiveForm(getUserDisplayName())} børn`} ({userProfileData.children.length})
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
                          <Text color="fg.default" fontSize="sm" fontWeight="500">
                            {getRelationDisplayName(child)}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>
                          {child.isAdministrator ? (
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
                {/* Settings Message */}
                {settingsMessage && (
                  <Box
                    p={4}
                    borderRadius="md"
                    bg={settingsMessage.type === 'success' ? '#f4f1de' : '#f2cc8f'}
                    borderColor={settingsMessage.type === 'success' ? '#81b29a' : '#e07a5f'}
                    borderWidth={1}
                  >
                    <Text color={settingsMessage.type === 'success' ? '#3d405b' : '#3d405b'} fontWeight="500">
                      {settingsMessage.text}
                    </Text>
                  </Box>
                )}

                <Heading size="lg" color="fg.default" fontWeight="600">
                  Indstillinger
                </Heading>
                <Box className="w-16 h-1 bg-burnt-sienna-500 rounded-full"></Box>
                
                <Separator />

                {/* Personal Information */}
                <Card.Root>
                  <Card.Body>
                    <VStack gap={4} align="start">
                      <VStack align="start" gap={1}>
                        <Heading size="md">Personlige oplysninger</Heading>
                        <Box w={10} h={1} bg="#81b29a" borderRadius="full"></Box>
                      </VStack>
                      
                      <VStack gap={4} align="stretch" width="100%">
                        <Field.Root>
                          <Field.Label htmlFor="displayName">Navn</Field.Label>
                          <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Indtast dit navn"
                            _focus={{
                              borderColor: '#81b29a',
                              shadow: '0 0 0 1px #81b29a',
                              outline: 'none'
                            }}
                          />
                        </Field.Root>
                        
                        <Field.Root>
                          <Field.Label htmlFor="email">E-mail</Field.Label>
                          <Input
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Indtast din e-mail"
                            type="email"
                            _focus={{
                              borderColor: '#81b29a',
                              shadow: '0 0 0 1px #81b29a',
                              outline: 'none'
                            }}
                          />
                          <Field.HelperText>
                            Ændring af e-mail kræver bekræftelse
                          </Field.HelperText>
                        </Field.Root>
                      </VStack>
                      
                      <Button
                        bg="#81b29a"
                        color="#f4f1de"
                        _hover={{ bg: "#6da085" }}
                        onClick={handleSaveProfile}
                        loading={isSettingsLoading}
                        loadingText="Gemmer..."
                      >
                        Gem ændringer
                      </Button>
                    </VStack>
                  </Card.Body>
                </Card.Root>

                {/* Danger Zone */}
                <Card.Root borderColor="#e07a5f">
                  <Card.Body>
                    <VStack gap={4} align="start">
                      <VStack gap={1} align="start">
                        <Heading size="md" color="#e07a5f">Farezone</Heading>
                        <Text fontSize="sm" color="#3d405b">
                          Disse handlinger kan ikke fortrydes
                        </Text>
                      </VStack>
                    
                      <Dialog.Root 
                        open={isDeleteDialogOpen} 
                        onOpenChange={(details) => setIsDeleteDialogOpen(details.open)}
                      >
                        <Dialog.Trigger asChild>
                          <Button 
                            borderColor="#e07a5f"
                            color="#e07a5f"
                            variant="outline"
                            _hover={{
                              bg: "#e07a5f",
                              color: "white"
                            }}
                            onClick={() => setIsDeleteDialogOpen(true)}
                          >
                            Slet konto permanent
                          </Button>
                        </Dialog.Trigger>
                        
                        <Portal>
                          <Dialog.Backdrop />
                          <Dialog.Positioner>
                            <Dialog.Content maxW="md" mx={4}>
                              <Dialog.Header>
                                <Dialog.Title fontSize="lg" fontWeight="bold">
                                  Slet konto
                                </Dialog.Title>
                              </Dialog.Header>
                              
                              <Dialog.Body>
                                <Text>
                                  Er du sikker på, at du vil slette din konto? Alle dine data vil blive permanent fjernet. 
                                  Denne handling kan ikke fortrydes.
                                </Text>
                              </Dialog.Body>
                              
                              <Dialog.Footer>
                                <Dialog.ActionTrigger asChild>
                                  <Button 
                                    variant="outline"
                                    borderColor="#81b29a" 
                                    color="#3d405b" 
                                    _hover={{ bg: "#81b29a", color: "#f4f1de" }}
                                    onClick={() => setIsDeleteDialogOpen(false)}
                                  >
                                    Annuller
                                  </Button>
                                </Dialog.ActionTrigger>
                                <Button 
                                  bg="#e07a5f"
                                  color="#f4f1de"
                                  _hover={{ bg: "#d06749" }}
                                  onClick={handleDeleteAccount}
                                  loading={isSettingsLoading}
                                >
                                  Slet konto
                                </Button>
                              </Dialog.Footer>
                              
                              <Dialog.CloseTrigger asChild>
                                <CloseButton size="sm" />
                              </Dialog.CloseTrigger>
                            </Dialog.Content>
                          </Dialog.Positioner>
                        </Portal>
                      </Dialog.Root>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              </VStack>
            </Box>
          )}

        </VStack>
      </Box>
    </AppLayout>
  );
}
