"use client";

import { useUser } from "@stackframe/stack";
import { 
  Box, 
  Heading, 
  Text, 
  VStack, 
  HStack,
  Card, 
  Button, 
  Input,
  Field,
  Dialog,
  Portal,
  CloseButton,
  Spinner
} from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Header } from "@/components/ui/header";
import { Avatar } from "@chakra-ui/react";

export default function Settings() {
  const user = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Check if this is a first-time user
  const isFirstTime = searchParams.get('firstTime') === 'true';
  
  // Form state
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (user === null) {
      router.push("/");
    }
  }, [user, router]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setEmail(user.primaryEmail || "");
    }
  }, [user]);

  // Clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
  };

  const handleSaveProfile = async () => {
    // Validate required fields
    if (!displayName || displayName.trim() === '') {
      showMessage('error', 'Navn er påkrævet');
      return;
    }

    setIsLoading(true);
    try {
      // Update display name
      if (displayName !== user.displayName) {
        await user.update({ displayName: displayName.trim() });
      }

      showMessage('success', 'Profil opdateret succesfuldt');
      
      // If this is a first-time user, redirect to dashboard after successful update
      if (isFirstTime && displayName.trim() !== '') {
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500); // Wait 1.5 seconds to show success message
      }
    } catch (_error) {
      showMessage('error', 'Der opstod en fejl ved opdatering af profilen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await user.delete();
      showMessage('success', 'Konto slettet');
      router.push("/");
    } catch (_error) {
      showMessage('error', 'Der opstod en fejl ved sletning af kontoen');
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  // Generate initials for avatar
  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const initials = getInitials(user.displayName, user.primaryEmail);

  return (
    <Box minH="100vh">
      <Header />
      
      <Box p={8}>
        <VStack gap={8} align="stretch" maxW="2xl" mx="auto">
          {/* Message Display */}
          {message && (
            <Box
              p={4}
              borderRadius="md"
              bg={message.type === 'success' ? 'green.50' : 'red.50'}
              borderColor={message.type === 'success' ? 'green.200' : 'red.200'}
              borderWidth={1}
            >
              <Text color={message.type === 'success' ? 'green.700' : 'red.700'}>
                {message.text}
              </Text>
            </Box>
          )}

          {/* Page Header */}
          <VStack align="start" gap={2}>
            <Heading size="xl" color="blue.600">
              {isFirstTime ? 'Velkommen!' : 'Indstillinger'}
            </Heading>
            <Text color="gray.600">
              {isFirstTime 
                ? 'Først skal du angive dit navn for at komme i gang'
                : 'Administrer din profil og kontoindstillinger'
              }
            </Text>
          </VStack>

          {/* Personal Information */}
          <Card.Root>
            <Card.Body>
              <VStack gap={4} align="start">
                <Heading size="md">Personlige oplysninger</Heading>
                
                <VStack gap={4} align="stretch" width="100%">
                  <Field.Root>
                    <Field.Label htmlFor="displayName">
                      Navn {isFirstTime && <Text as="span" color="red.500">*</Text>}
                    </Field.Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder={isFirstTime ? "Indtast dit navn (påkrævet)" : "Indtast dit navn"}
                      borderColor={isFirstTime && !displayName ? "red.300" : undefined}
                    />
                    {isFirstTime && (
                      <Field.HelperText>
                        Du skal angive dit navn for at komme videre til dashboard
                      </Field.HelperText>
                    )}
                  </Field.Root>
                  
                  <Field.Root>
                    <Field.Label htmlFor="email">E-mail</Field.Label>
                    <Input
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Indtast din e-mail"
                      type="email"
                    />
                    <Field.HelperText>
                      Ændring af e-mail kræver bekræftelse
                    </Field.HelperText>
                  </Field.Root>
                </VStack>
                
                <Button
                  colorScheme="blue"
                  onClick={handleSaveProfile}
                  loading={isLoading}
                  loadingText="Gemmer..."
                  size={isFirstTime ? "lg" : "md"}
                  width={isFirstTime ? "100%" : "auto"}
                >
                  {isFirstTime ? "Gem navn og fortsæt" : "Gem ændringer"}
                </Button>
              </VStack>
            </Card.Body>
          </Card.Root>

          {/* Danger Zone - Hide for first-time users */}
          {!isFirstTime && (
            <Card.Root borderColor="red.200">
              <Card.Body>
                <VStack gap={4} align="start">
                  <VStack gap={1} align="start">
                    <Heading size="md" color="red.600">Farezone</Heading>
                    <Text fontSize="sm" color="gray.600">
                      Disse handlinger kan ikke fortrydes
                    </Text>
                  </VStack>
                
                <Dialog.Root 
                  open={isDeleteDialogOpen} 
                  onOpenChange={(details) => setIsDeleteDialogOpen(details.open)}
                >
                  <Dialog.Trigger asChild>
                    <Button 
                      colorScheme="red" 
                      variant="outline"
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
                              onClick={() => setIsDeleteDialogOpen(false)}
                            >
                              Annuller
                            </Button>
                          </Dialog.ActionTrigger>
                          <Button 
                            colorScheme="red" 
                            onClick={handleDeleteAccount}
                            loading={isLoading}
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
          )}
        </VStack>
      </Box>
    </Box>
  );
}
