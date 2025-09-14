"use client";

import { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  HStack,
  Flex,
  Heading,
  Tabs,
  CheckboxCard,
  Textarea,
} from '@chakra-ui/react';
import { DialogManager } from '@/components/ui/dialog-manager';
import { showToast } from '@/components/ui/simple-toast';
import { useChildUsers } from '@/lib/queries';
import { UserWithRelation } from '@/lib/database-service';
import { useUser } from '@stackframe/stack';

interface CreateSengetiderDialogProps {
  childId: number;
  onSengetiderCreated: () => void;
  trigger: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isUserAdmin?: boolean;
  childName: string;
}

export function CreateSengetiderDialog({ 
  childId, 
  onSengetiderCreated, 
  trigger, 
  isOpen, 
  onOpenChange, 
  isUserAdmin = false,
  childName
}: CreateSengetiderDialogProps) {
  const stackUser = useUser();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Visibility control state
  const [visibilityOption, setVisibilityOption] = useState<'alle' | 'kun_mig' | 'custom'>('alle');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  
  // Fetch child users for access control selection
  const { data: childUsers = [] } = useChildUsers(childId.toString());

  const handleVisibilityChange = (option: 'alle' | 'kun_mig' | 'custom') => {
    setVisibilityOption(option);
    if (option !== 'custom') {
      setSelectedUserIds([]);
    }
  };

  const handleSubmit = async () => {
    if (visibilityOption === 'custom' && selectedUserIds.length === 0) {
      showToast({
        title: 'Fejl',
        description: 'Vælg mindst én bruger når du vælger tilpasset synlighed',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      // Determine visibility based on option
      const isPublic = visibilityOption === 'alle';
      const accessibleUserIds = visibilityOption === 'custom' ? selectedUserIds : undefined;

      const response = await fetch(`/api/children/${childId}/sengetider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description.trim() || undefined,
          isPublic,
          accessibleUserIds
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      showToast({
        title: 'Succes',
        description: `Sengetider-værktøj oprettet for ${childName}`,
        type: 'success',
        duration: 3000,
      });

      // Reset form
      setDescription('');
      setVisibilityOption('alle');
      setSelectedUserIds([]);
      
      if (onOpenChange) {
        onOpenChange(false);
      }
      onSengetiderCreated();
    } catch (error) {
      console.error('Error creating sengetider:', error);
      
      let errorMessage = 'Kunne ikke oprette sengetider-værktøj';
      if (error instanceof Error) {
        if (error.message.includes('Only administrators can create sengetider')) {
          errorMessage = 'Kun administratorer kan oprette sengetider-værktøjer';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Netværksfejl - tjek din internetforbindelse';
        } else if (error.message.includes('403')) {
          errorMessage = 'Du har ikke tilladelse til at oprette sengetider-værktøjer for dette barn';
        } else if (error.message.includes('401')) {
          errorMessage = 'Du skal være logget ind for at oprette sengetider-værktøjer';
        } else if (error.message.includes('400')) {
          errorMessage = 'Ugyldig data - tjek dine indtastninger';
        } else {
          errorMessage = error.message;
        }
      }
      
      showToast({
        title: 'Fejl',
        description: errorMessage,
        type: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setDescription('');
    setVisibilityOption('alle');
    setSelectedUserIds([]);
    
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <DialogManager
      trigger={trigger}
      title={`Opret sengetider-værktøj for ${childName}`} 
      primaryAction={{
        label: "Opret værktøj",
        onClick: handleSubmit,
        isLoading: loading,
        colorScheme: "sage"
      }}
      secondaryAction={{
        label: "Annuller",
        onClick: handleCancel,
        colorScheme: "gray"
      }}
      maxWidth="4xl"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <Tabs.Root defaultValue="indstillinger" variant="enclosed">
        <Tabs.List>
          <Tabs.Trigger value="indstillinger">Indstillinger</Tabs.Trigger>
          {isUserAdmin && (
            <Tabs.Trigger value="synlighed">Synlighed</Tabs.Trigger>
          )}
        </Tabs.List>

        <Tabs.Content value="indstillinger">
          <Flex 
            direction={{ base: "column", lg: "row" }}
            gap={{ base: 6, lg: 0 }}
            align="start"
          >
            {/* Form Section */}
            <VStack 
              gap={4} 
              align="stretch" 
              flex={1} 
              pr={{ base: 0, lg: 6 }}
              minW={0}
            >
              {/* Information section */}
              <Box bg="sage.50" p={4} borderRadius="lg" border="1px solid" borderColor="sage.200">
                <VStack gap={3} align="start">
                  <Heading size="sm" color="sage.700">🛏️ Sengetider for {childName}</Heading>
                  <Text fontSize="sm" color="sage.600">
                    Dette værktøj hjælper med at spore {childName}s sengetider på en struktureret måde. 
                    Du kan registrere tre tidspunkter for hver dag:
                  </Text>
                  <VStack gap={1} align="start" pl={2}>
                    <Text fontSize="sm" color="sage.600">• <strong>Puttetid:</strong> Hvornår kom barnet i seng</Text>
                    <Text fontSize="sm" color="sage.600">• <strong>Sov kl.:</strong> Hvornår faldt barnet i søvn</Text>
                    <Text fontSize="sm" color="sage.600">• <strong>Vågnede:</strong> Hvornår vågnede barnet</Text>
                  </VStack>
                  <Text fontSize="sm" color="sage.600">
                    Værktøjet viser den aktuelle uge, så du nemt kan se mønstre og rutiner.
                  </Text>
                </VStack>
              </Box>

              <Box>
                <Text mb={2} fontWeight="medium">Beskrivelse (valgfri)</Text>
                <Textarea
                  placeholder="Tilføj en note om formålet med sengetids-sporingen..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                  borderColor="cream.300"
                  borderRadius="lg"
                  bg="cream.25"
                  _hover={{ borderColor: "cream.400" }}
                  _focus={{ 
                    borderColor: "sage.400", 
                    boxShadow: "0 0 0 1px var(--chakra-colors-sage-400)",
                    bg: "white"
                  }}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {description.length}/500 tegn
                </Text>
              </Box>
            </VStack>

            {/* Responsive Divider */}
            <Box 
              w={{ base: "100%", lg: "1px" }}
              h={{ base: "1px", lg: "400px" }}
              bg="gray.200" 
              alignSelf="stretch"
              display={{ base: "block", lg: "block" }}
            />

            {/* Preview Section */}
            <VStack 
              gap={4} 
              align="stretch" 
              flex={1} 
              pl={{ base: 0, lg: 6 }}
              minW={0}
            >
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Forhåndsvisning:
              </Text>
              
              <VStack gap={3} align="stretch">
                {/* Mini Sengetider Preview */}
                <Box 
                  bg="white" 
                  borderRadius="md" 
                  border="1px solid" 
                  borderColor="gray.200" 
                  p={3}
                  shadow="sm"
                >
                  <VStack gap={3} align="stretch">
                    {/* Header */}
                    <HStack justify="space-between">
                      <Heading size="sm" color="sage.600">
                        Sengetider for {childName}
                      </Heading>
                      <Text fontSize="xs" color="gray.500">
                        Denne uge
                      </Text>
                    </HStack>

                    {/* Sample Week Grid Preview */}
                    <Box>
                      <Text mb={2} fontWeight="medium" fontSize="xs" color="gray.600">
                        Dagens tider:
                      </Text>
                      <HStack gap={2} justify="space-between">
                        <VStack gap={1}>
                          <Text fontSize="xs" color="gray.500">Puttetid</Text>
                          <Box 
                            h="6" 
                            bg="cream.25" 
                            borderRadius="sm" 
                            border="1px solid" 
                            borderColor="cream.300"
                            display="flex"
                            alignItems="center"
                            px={2}
                            width="60px"
                          >
                            <Text fontSize="xs" color="gray.400">20:00</Text>
                          </Box>
                        </VStack>
                        <VStack gap={1}>
                          <Text fontSize="xs" color="gray.500">Sov kl.</Text>
                          <Box 
                            h="6" 
                            bg="cream.25" 
                            borderRadius="sm" 
                            border="1px solid" 
                            borderColor="cream.300"
                            display="flex"
                            alignItems="center"
                            px={2}
                            width="60px"
                          >
                            <Text fontSize="xs" color="gray.400">20:15</Text>
                          </Box>
                        </VStack>
                        <VStack gap={1}>
                          <Text fontSize="xs" color="gray.500">Vågnede</Text>
                          <Box 
                            h="6" 
                            bg="cream.25" 
                            borderRadius="sm" 
                            border="1px solid" 
                            borderColor="cream.300"
                            display="flex"
                            alignItems="center"
                            px={2}
                            width="60px"
                          >
                            <Text fontSize="xs" color="gray.400">06:30</Text>
                          </Box>
                        </VStack>
                      </HStack>
                    </Box>

                    {/* Example note area */}
                    <Box>
                      <Text mb={1} fontWeight="medium" fontSize="xs" color="gray.600">
                        Noter (valgfri)
                      </Text>
                      <Box 
                        h="6" 
                        bg="cream.25" 
                        borderRadius="sm" 
                        border="1px solid" 
                        borderColor="cream.300"
                        display="flex"
                        alignItems="center"
                        px={2}
                      >
                        <Text fontSize="xs" color="gray.400">Tilføj en kort note...</Text>
                      </Box>
                    </Box>
                  </VStack>
                </Box>
              </VStack>
            </VStack>
          </Flex>
        </Tabs.Content>

        {isUserAdmin && (
          <Tabs.Content value="synlighed">
            <VStack gap={4} align="stretch" p={4}>
              <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                Hvem kan se dette sengetider-værktøj?
              </Text>
            
              <VStack gap={3} align="stretch">
                {/* Alle option */}
                <Box
                  p={3}
                  border="2px solid"
                  borderColor={visibilityOption === 'alle' ? 'sage.400' : 'gray.200'}
                  borderRadius="md"
                  bg={visibilityOption === 'alle' ? 'sage.50' : 'white'}
                  cursor="pointer"
                  onClick={() => handleVisibilityChange('alle')}
                  _hover={{ borderColor: 'sage.300' }}
                >
                  <HStack gap={3}>
                    <Box
                      w={4}
                      h={4}
                      borderRadius="full"
                      border="2px solid"
                      borderColor={visibilityOption === 'alle' ? 'sage.500' : 'gray.300'}
                      bg={visibilityOption === 'alle' ? 'sage.500' : 'white'}
                      position="relative"
                    >
                      {visibilityOption === 'alle' && (
                        <Box
                          position="absolute"
                          top="50%"
                          left="50%"
                          transform="translate(-50%, -50%)"
                          w={2}
                          h={2}
                          borderRadius="full"
                          bg="white"
                        />
                      )}
                    </Box>
                    <VStack gap={1} align="start">
                      <Text fontWeight="semibold">Alle tilknyttede brugere</Text>
                      <Text fontSize="sm" color="gray.600">
                        Alle der har adgang til barnet kan se og registrere sengetider
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                {/* Kun mig option */}
                <Box
                  p={3}
                  border="2px solid"
                  borderColor={visibilityOption === 'kun_mig' ? 'sage.400' : 'gray.200'}
                  borderRadius="md"
                  bg={visibilityOption === 'kun_mig' ? 'sage.50' : 'white'}
                  cursor="pointer"
                  onClick={() => handleVisibilityChange('kun_mig')}
                  _hover={{ borderColor: 'sage.300' }}
                >
                  <HStack gap={3}>
                    <Box
                      w={4}
                      h={4}
                      borderRadius="full"
                      border="2px solid"
                      borderColor={visibilityOption === 'kun_mig' ? 'sage.500' : 'gray.300'}
                      bg={visibilityOption === 'kun_mig' ? 'sage.500' : 'white'}
                      position="relative"
                    >
                      {visibilityOption === 'kun_mig' && (
                        <Box
                          position="absolute"
                          top="50%"
                          left="50%"
                          transform="translate(-50%, -50%)"
                          w={2}
                          h={2}
                          borderRadius="full"
                          bg="white"
                        />
                      )}
                    </Box>
                    <VStack gap={1} align="start">
                      <Text fontWeight="semibold">Kun mig</Text>
                      <Text fontSize="sm" color="gray.600">
                        Kun du kan se og registrere sengetider i dette værktøj
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                {/* Custom option */}
                <Box
                  p={3}
                  border="2px solid"
                  borderColor={visibilityOption === 'custom' ? 'sage.400' : 'gray.200'}
                  borderRadius="md"
                  bg={visibilityOption === 'custom' ? 'sage.50' : 'white'}
                  cursor="pointer"
                  onClick={() => handleVisibilityChange('custom')}
                  _hover={{ borderColor: 'sage.300' }}
                >
                  <HStack gap={3}>
                    <Box
                      w={4}
                      h={4}
                      borderRadius="full"
                      border="2px solid"
                      borderColor={visibilityOption === 'custom' ? 'sage.500' : 'gray.300'}
                      bg={visibilityOption === 'custom' ? 'sage.500' : 'white'}
                      position="relative"
                    >
                      {visibilityOption === 'custom' && (
                        <Box
                          position="absolute"
                          top="50%"
                          left="50%"
                          transform="translate(-50%, -50%)"
                          w={2}
                          h={2}
                          borderRadius="full"
                          bg="white"
                        />
                      )}
                    </Box>
                    <VStack gap={1} align="start">
                      <Text fontWeight="semibold">Tilpasset adgang</Text>
                      <Text fontSize="sm" color="gray.600">
                        Vælg specifikke brugere der kan se og registrere sengetider
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                {/* User selection for custom visibility */}
                {visibilityOption === 'custom' && (
                  <VStack gap={2} align="stretch" ml={8} mt={2}>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">
                      Vælg brugere:
                    </Text>
                    {childUsers.map((user: UserWithRelation) => {
                      const isCreator = user.id.toString() === stackUser?.id;
                      const isAdministrator = user.isAdministrator;
                      const isSelected = selectedUserIds.includes(user.id);
                      
                      return (
                        <CheckboxCard.Root
                          key={user.id}
                          checked={isSelected}
                          onCheckedChange={({ checked }) => {
                            if (checked) {
                              setSelectedUserIds(prev => [...prev, user.id]);
                            } else {
                              setSelectedUserIds(prev => prev.filter(id => id !== user.id));
                            }
                          }}
                          size="sm"
                        >
                          <CheckboxCard.Control />
                          <CheckboxCard.Content>
                            <HStack gap={3} align="center">
                              <Box
                                w={8}
                                h={8}
                                borderRadius="full"
                                bg="sage.100"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontSize="sm"
                                fontWeight="medium"
                                color="sage.600"
                              >
                                {user.displayName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                              </Box>
                              <VStack gap={0} align="start" flex={1}>
                                <CheckboxCard.Label fontSize="sm" fontWeight="medium">
                                  {user.displayName || user.email}
                                </CheckboxCard.Label>
                                <HStack gap={1} align="center">
                                  <CheckboxCard.Description fontSize="xs" color="gray.500">
                                    {user.relation}
                                    {user.customRelationName && ` (${user.customRelationName})`}
                                  </CheckboxCard.Description>
                                  {isCreator && (
                                    <Box fontSize="xs" px={1} py={0.5} bg="blue.100" color="blue.600" borderRadius="sm">Ejer</Box>
                                  )}
                                  {isAdministrator && !isCreator && (
                                    <Box fontSize="xs" px={1} py={0.5} bg="purple.100" color="purple.600" borderRadius="sm">Administrator</Box>
                                  )}
                                </HStack>
                              </VStack>
                            </HStack>
                          </CheckboxCard.Content>
                        </CheckboxCard.Root>
                      );
                    })}
                  </VStack>
                )}
              </VStack>
            </VStack>
          </Tabs.Content>
        )}
      </Tabs.Root>
    </DialogManager>
  );
}
