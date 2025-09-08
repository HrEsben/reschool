'use client';

import { useState } from 'react';
import { useUser } from '@stackframe/stack';
import {
  Box,
  VStack,
  Heading,
  Text,
  Input,
  Button,
  Card,
  Field
} from '@chakra-ui/react';

interface CollectNameDialogProps {
  isOpen: boolean;
  onComplete: () => void;
}

export function CollectNameDialog({ isOpen, onComplete }: CollectNameDialogProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const user = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;

    setIsLoading(true);
    setError('');
    
    try {
      // Update the user's display name in Stack Auth
      await user.update({
        displayName: name.trim()
      });

      // Sync the updated user to the database
      const syncResponse = await fetch('/api/sync-user', {
        method: 'POST',
      });

      if (!syncResponse.ok) {
        throw new Error('Failed to sync user');
      }

      onComplete();
    } catch (error) {
      console.error('Error updating user name:', error);
      setError('Der opstod en fejl ved opdatering af dit navn. Prøv igen.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      inset="0"
      bg="rgba(0, 0, 0, 0.6)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="9999"
      p={4}
    >
      <Card.Root 
        maxW="md" 
        w="full"
        bg="white"
        borderRadius="xl"
        boxShadow="2xl"
        border="2px solid"
        borderColor="border.muted"
      >
        <Card.Header p={6} pb={4}>
          <VStack gap={3} align="center" textAlign="center">
            <Box
              bg="sage.100"
              p={3}
              borderRadius="full"
              color="sage.600"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </Box>
            <Heading size="lg" color="navy.700" fontWeight="700">
              Velkommen til ReSchool!
            </Heading>
            <Text color="fg.muted" fontSize="md" lineHeight="1.6">
              For at fortsætte skal du angive dit navn, så andre kan identificere dig.
            </Text>
          </VStack>
        </Card.Header>

        <Card.Body p={6} pt={2}>
          <form onSubmit={handleSubmit}>
            <VStack gap={4} align="stretch">
              {error && (
                <Box
                  bg="rgba(224, 122, 95, 0.1)"
                  border="1px solid rgba(224, 122, 95, 0.3)"
                  borderRadius="md"
                  p={3}
                >
                  <Text color="#e07a5f" fontSize="sm" fontWeight="500">
                    {error}
                  </Text>
                </Box>
              )}

              <Field.Root>
                <Field.Label color="navy.700" fontWeight="600" fontSize="sm">
                  Dit fulde navn
                </Field.Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="f.eks. Anna Hansen"
                  bg="white"
                  border="2px solid"
                  borderColor="border.muted"
                  _focus={{
                    borderColor: "sage.400",
                    ring: "2px",
                    ringColor: "rgba(129, 178, 154, 0.3)"
                  }}
                  _hover={{
                    borderColor: "sage.300"
                  }}
                  size="lg"
                  borderRadius="md"
                  required
                  disabled={isLoading}
                />
              </Field.Root>
              
              <Button
                type="submit"
                disabled={!name.trim() || isLoading}
                bg="sage.500"
                color="white"
                _hover={{ 
                  bg: "sage.600" 
                }}
                _disabled={{
                  bg: "gray.300",
                  cursor: "not-allowed",
                  _hover: { bg: "gray.300" }
                }}
                size="lg"
                borderRadius="md"
                fontWeight="600"
                mt={2}
                loading={isLoading}
                loadingText="Opdaterer..."
              >
                Fortsæt
              </Button>
            </VStack>
          </form>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}
