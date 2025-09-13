"use client";

import { useState } from 'react';
import {
  Box,
  Input,
  VStack,
  Text,
  HStack,
  Flex,
  Heading,
  Tabs,
  CheckboxCard,
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
}

export function CreateSengetiderDialog({ 
  childId, 
  onSengetiderCreated, 
  trigger, 
  isOpen, 
  onOpenChange, 
  isUserAdmin = false 
}: CreateSengetiderDialogProps) {
  const stackUser = useUser();
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [targetBedtime, setTargetBedtime] = useState('20:00');
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

  const isTimeValid = (time: string): boolean => {
    const timePattern = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timePattern.test(time);
  };

  const handleSubmit = async () => {
    if (!topic.trim()) {
      showToast({
        title: 'Fejl',
        description: 'Emne er påkrævet',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    if (!isTimeValid(targetBedtime)) {
      showToast({
        title: 'Fejl',
        description: 'Ugyldig sengetid. Brug format TT:MM (f.eks. 20:30)',
        type: 'error',
        duration: 3000,
      });
      return;
    }

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
      const visibilityPayload: {
        visibility?: 'all' | 'creator' | 'custom';
        accessibleUserIds?: number[];
      } = {};
      
      if (visibilityOption === 'alle') {
        visibilityPayload.visibility = 'all';
      } else if (visibilityOption === 'kun_mig') {
        visibilityPayload.visibility = 'creator';
      } else if (visibilityOption === 'custom') {
        visibilityPayload.visibility = 'custom';
        visibilityPayload.accessibleUserIds = selectedUserIds;
      }

      const response = await fetch(`/api/children/${childId}/sengetider`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          description: description.trim() || undefined,
          targetBedtime: targetBedtime,
          ...visibilityPayload
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      showToast({
        title: 'Succes',
        description: 'Sengetider-værktøj oprettet',
        type: 'success',
        duration: 3000,
      });

      // Reset form
      setTopic('');
      setDescription('');
      setTargetBedtime('20:00');
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
    setTopic('');
    setDescription('');
    setTargetBedtime('20:00');
    setVisibilityOption('alle');
    setSelectedUserIds([]);
    
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <DialogManager
      trigger={trigger}
      title="Opret nyt sengetider-værktøj" 
      primaryAction={{
        label: "Opret værktøj",
        onClick: handleSubmit,
        isDisabled: !topic.trim() || !isTimeValid(targetBedtime),
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
              <Box>
                <Text mb={2} fontWeight="medium">Emne</Text>
                <Input
                  placeholder="Hvad skal sengetider-værktøjet spore? (f.eks. 'Sengetid weekdag', 'Weekend sengetid')"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  maxLength={255}
                  borderColor="cream.300"
                  borderRadius="lg"
                  bg="cream.25"
                  _hover={{ borderColor: "cream.400" }}
                  _focus={{ 
                    borderColor: "sage.400", 
                    boxShadow: "0 0 0 1px var(--chakra-colors-sage-400)",
                    outline: "none"
                  }}
                  _focusVisible={{
                    borderColor: "sage.400", 
                    boxShadow: "0 0 0 1px var(--chakra-colors-sage-400)",
                    outline: "none"
                  }}
                />
              </Box>

              <Box>
                <Text mb={2} fontWeight="medium">Beskrivelse (valgfri)</Text>
                <Input
                  placeholder="Beskriv formålet med sengetids-sporingen (f.eks. 'Spor barnets sengetid på hverdage for at følge rutiner')"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  borderColor="cream.300"
                  borderRadius="lg"
                  bg="cream.25"
                  _hover={{ borderColor: "cream.400" }}
                  _focus={{ 
                    borderColor: "sage.400", 
                    boxShadow: "0 0 0 1px var(--chakra-colors-sage-400)",
                    outline: "none"
                  }}
                  _focusVisible={{
                    borderColor: "sage.400", 
                    boxShadow: "0 0 0 1px var(--chakra-colors-sage-400)",
                    outline: "none"
                  }}
                />
              </Box>
              
              <Box>
                <Text mb={2} fontWeight="medium">Mål sengetid</Text>
                <HStack gap={2}>
                  <Input
                    placeholder="20:00"
                    value={targetBedtime}
                    onChange={(e) => setTargetBedtime(e.target.value)}
                    maxLength={5}
                    borderColor="cream.300"
                    borderRadius="lg"
                    bg="cream.25"
                    width="120px"
                    _hover={{ borderColor: "cream.400" }}
                    _focus={{ 
                      borderColor: "sage.400", 
                      boxShadow: "0 0 0 1px var(--chakra-colors-sage-400)",
                      outline: "none"
                    }}
                    _focusVisible={{
                      borderColor: "sage.400", 
                      boxShadow: "0 0 0 1px var(--chakra-colors-sage-400)",
                      outline: "none"
                    }}
                  />
                  <Text fontSize="sm" color="gray.600">
                    Format: TT:MM (f.eks. 20:30)
                  </Text>
                </HStack>
                {!isTimeValid(targetBedtime) && targetBedtime && (
                  <Text fontSize="sm" color="coral.500" mt={1}>
                    Ugyldig tid. Brug format TT:MM (f.eks. 20:30)
                  </Text>
                )}
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
                      <Heading 
                        size="sm" 
                        color={topic.trim() ? "black" : "gray.400"}
                      >
                        {topic.trim() || "Emne"}
                      </Heading>
                      <Text fontSize="sm" color="sage.600">
                        🛏️ {targetBedtime}
                      </Text>
                    </HStack>

                    {/* Sample Time Input */}
                    <Box>
                      <Text mb={1} fontWeight="medium" fontSize="xs" color="gray.600">
                        Hvornår gik du i seng i dag?
                      </Text>
                      <HStack gap={2}>
                        <Box 
                          h="8" 
                          bg="gray.50" 
                          borderRadius="sm" 
                          border="1px solid" 
                          borderColor="gray.200"
                          display="flex"
                          alignItems="center"
                          px={2}
                          width="100px"
                        >
                          <Text fontSize="xs" color="gray.400">20:15</Text>
                        </Box>
                        <Box 
                          h="8" 
                          bg="sage.500" 
                          borderRadius="sm" 
                          display="flex"
                          alignItems="center"
                          px={3}
                        >
                          <Text fontSize="xs" color="white" fontWeight="medium">Gem</Text>
                        </Box>
                      </HStack>
                    </Box>
                    
                    {/* Example comment area */}
                    <Box>
                      <Text mb={1} fontWeight="medium" fontSize="xs" color="gray.600">
                        Noter (valgfri)
                      </Text>
                      <Box 
                        h="6" 
                        bg="gray.50" 
                        borderRadius="sm" 
                        border="1px solid" 
                        borderColor="gray.200"
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
