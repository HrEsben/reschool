"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Input,
  VStack,
  Text,
  HStack,
  Flex,
  Badge,
  Heading,
  Tabs,
  CheckboxCard,
  Textarea,
} from '@chakra-ui/react';
import { DialogManager } from '@/components/ui/dialog-manager';
import { showToast } from '@/components/ui/simple-toast';
import { useChildUsers } from '@/lib/queries';
import { UserWithRelation } from '@/lib/database-service';

interface Sengetider {
  id: number;
  childId: number;
  createdBy: number;
  topic: string;
  description?: string;
  targetBedtime?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditSengetiderDialogProps {
  sengetider: Sengetider;
  onSengetiderUpdated: () => void;
  trigger: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EditSengetiderDialog({ sengetider, onSengetiderUpdated, trigger, isOpen, onOpenChange }: EditSengetiderDialogProps) {
  const [topic, setTopic] = useState(sengetider.topic);
  const [description, setDescription] = useState(sengetider.description || '');
  const [targetBedtime, setTargetBedtime] = useState(sengetider.targetBedtime || '20:00');
  const [loading, setLoading] = useState(false);
  
  // Visibility control state
  const [visibilityOption, setVisibilityOption] = useState<'alle' | 'kun_mig' | 'custom'>(
    sengetider.isPublic ? 'alle' : 'kun_mig'
  );
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  
  // Fetch child users for access control selection
  const { data: childUsers = [] } = useChildUsers(sengetider.childId.toString());

  // Initialize form with current sengetider data
  useEffect(() => {
    setTopic(sengetider.topic);
    setDescription(sengetider.description || '');
    setTargetBedtime(sengetider.targetBedtime || '20:00');
    setVisibilityOption(sengetider.isPublic ? 'alle' : 'kun_mig');
  }, [sengetider]);

  const getEffectiveSelectedUsers = (): UserWithRelation[] => {
    if (visibilityOption === 'alle') {
      return childUsers;
    } else if (visibilityOption === 'kun_mig') {
      const currentUser = childUsers.find((user: UserWithRelation) => user.id === sengetider.createdBy);
      return currentUser ? [currentUser] : [];
    } else {
      return childUsers.filter((user: UserWithRelation) => selectedUserIds.includes(user.id));
    }
  };

  const handleSubmit = async () => {
    if (!topic.trim()) {
      showToast({
        title: 'Fejl',
        description: 'Navn er påkrævet',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      // Determine visibility settings
      const isPublic = visibilityOption === 'alle';
      const accessibleUserIds = visibilityOption === 'custom' ? selectedUserIds : [];

      const response = await fetch(`/api/sengetider/${sengetider.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          description: description.trim() || undefined,
          targetBedtime,
          isPublic,
          accessibleUserIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      showToast({
        title: 'Succes',
        description: 'Sengetider opdateret',
        type: 'success',
        duration: 3000,
      });

      onSengetiderUpdated();
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error updating sengetider:', error);
      
      let errorMessage = 'Kunne ikke opdatere sengetider';
      if (error instanceof Error) {
        if (error.message.includes('topic') || error.message.includes('navn')) {
          errorMessage = 'Navnet er påkrævet';
        } else if (error.message.includes('target_bedtime') || error.message.includes('tid')) {
          errorMessage = 'Ugyldig målsengetid';
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
    // Reset form to original values
    setTopic(sengetider.topic);
    setDescription(sengetider.description || '');
    setTargetBedtime(sengetider.targetBedtime || '20:00');
    setVisibilityOption(sengetider.isPublic ? 'alle' : 'kun_mig');
    setSelectedUserIds([]);
    
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <DialogManager
      trigger={trigger}
      title="Rediger sengetider" 
      primaryAction={{
        label: "Gem ændringer",
        onClick: handleSubmit,
        isDisabled: !topic.trim(),
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
          <Tabs.Trigger value="synlighed">Synlighed</Tabs.Trigger>
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
                <Text mb={2} fontWeight="medium">Navn på sengetider</Text>
                <Input
                  placeholder="Hvad skal sengetider hedde? (f.eks. 'Hverdags sengetid', 'Weekend sengetid')"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  maxLength={255}
                  borderColor="cream.300"
                  borderRadius="lg"
                  bg="cream.25"
                  _hover={{ borderColor: "cream.400" }}
                  _focus={{ 
                    borderColor: "sage.400", 
                    boxShadow: "0 0 0 3px rgba(129, 178, 154, 0.1)",
                    bg: "white"
                  }}
                />
              </Box>

              <Box>
                <Text mb={2} fontWeight="medium">Målsengetid</Text>
                <Input
                  type="time"
                  value={targetBedtime}
                  onChange={(e) => setTargetBedtime(e.target.value)}
                  borderColor="cream.300"
                  borderRadius="lg"
                  bg="cream.25"
                  _hover={{ borderColor: "cream.400" }}
                  _focus={{ 
                    borderColor: "sage.400", 
                    boxShadow: "0 0 0 3px rgba(129, 178, 154, 0.1)",
                    bg: "white"
                  }}
                />
                <Text fontSize="sm" color="gray.600" mt={1}>
                  Den tid barnet ideelt set skal i seng
                </Text>
              </Box>

              <Box>
                <Text mb={2} fontWeight="medium">Beskrivelse <Text as="span" color="gray.500">(valgfri)</Text></Text>
                <Textarea
                  placeholder="Tilføj en beskrivelse af hvad denne sengetider bruges til..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={1000}
                  borderColor="cream.300"
                  borderRadius="lg"
                  bg="cream.25"
                  _hover={{ borderColor: "cream.400" }}
                  _focus={{ 
                    borderColor: "sage.400", 
                    boxShadow: "0 0 0 3px rgba(129, 178, 154, 0.1)",
                    bg: "white"
                  }}
                  rows={3}
                />
              </Box>
            </VStack>

            {/* Preview Section */}
            <VStack 
              gap={4} 
              align="stretch" 
              flex={1} 
              pl={{ base: 0, lg: 6 }}
              borderLeft={{ base: "none", lg: "1px solid" }}
              borderTop={{ base: "1px solid", lg: "none" }}
              borderColor="cream.200"
              pt={{ base: 6, lg: 0 }}
              minW={0}
            >
              <Heading size="md" color="sage.700">Forhåndsvisning</Heading>
              
              <Box 
                p={4} 
                bg="cream.50" 
                borderRadius="lg" 
                border="1px solid" 
                borderColor="cream.200"
              >
                <VStack gap={3} align="start">
                  <HStack gap={2} wrap="wrap">
                    <Badge colorScheme="sage" fontSize="xs">
                      Sengetider
                    </Badge>
                    <Badge colorScheme="blue" fontSize="xs">
                      Mål: {targetBedtime}
                    </Badge>
                  </HStack>

                  <Box>
                    <Text fontWeight="semibold" color="sage.800">
                      {topic || 'Sengetider navn'}
                    </Text>
                    {description && (
                      <Text fontSize="sm" color="gray.600" mt={1}>
                        {description}
                      </Text>
                    )}
                  </Box>

                  <Box 
                    p={3} 
                    bg="white" 
                    borderRadius="md" 
                    border="1px solid" 
                    borderColor="cream.200"
                    w="full"
                  >
                    <Text fontSize="sm" color="gray.600" mb={2}>
                      Sådan vil sengetider-kortet se ud:
                    </Text>
                    <Box p={3} bg="gray.50" borderRadius="md">
                      <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm" fontWeight="medium">Målsengetid</Text>
                        <Text fontSize="sm" color="sage.600">{targetBedtime}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontSize="sm" fontWeight="medium">Faktisk sengetid</Text>
                        <Text fontSize="sm" color="gray.500">--:--</Text>
                      </HStack>
                    </Box>
                  </Box>
                </VStack>
              </Box>
            </VStack>
          </Flex>
        </Tabs.Content>

        <Tabs.Content value="synlighed">
          <VStack gap={6} align="stretch" maxW="2xl">
            <Box>
              <Heading size="md" mb={2} color="sage.700">Hvem kan se og bruge denne sengetider?</Heading>
              <Text color="gray.600" fontSize="sm">
                Vælg hvem der kan se sengetider-værktøjet og tilføje sengetidspunkter.
              </Text>
            </Box>

            {/* Alle voksne option */}
            <Box
              p={3}
              border="2px solid"
              borderColor={visibilityOption === 'alle' ? 'sage.400' : 'gray.200'}
              borderRadius="md"
              cursor="pointer"
              onClick={() => setVisibilityOption('alle')}
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
                  <Text fontWeight="semibold">Alle voksne</Text>
                  <Text fontSize="sm" color="gray.600">
                    Alle voksne tilknyttet barnet kan se og tilføje sengetider (inkl. nye voksne)
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
              cursor="pointer"
              onClick={() => setVisibilityOption('kun_mig')}
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
                    Kun du kan se og tilføje sengetider
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
              cursor="pointer"
              onClick={() => setVisibilityOption('custom')}
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
                  <Text fontWeight="semibold">Vælg specifikke personer</Text>
                  <Text fontSize="sm" color="gray.600">
                    Vælg nøjagtigt hvem der kan se og bruge sengetider
                  </Text>
                </VStack>
              </HStack>
            </Box>

            {/* Custom users selection */}
            {visibilityOption === 'custom' && (
              <Box pl={7}>
                <Text fontWeight="medium" mb={3}>Vælg personer:</Text>
                <VStack gap={2} align="stretch">
                  {childUsers.map((user: UserWithRelation) => (
                    <CheckboxCard.Root
                      key={user.id}
                      checked={selectedUserIds.includes(user.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedUserIds([...selectedUserIds, user.id]);
                        } else {
                          setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                        }
                      }}
                      size="sm"
                    >
                      <CheckboxCard.Control>
                        <CheckboxCard.Indicator />
                      </CheckboxCard.Control>
                      <CheckboxCard.Content>
                        <CheckboxCard.Label>{user.displayName}</CheckboxCard.Label>
                        <CheckboxCard.Description>{user.email}</CheckboxCard.Description>
                      </CheckboxCard.Content>
                    </CheckboxCard.Root>
                  ))}
                </VStack>
              </Box>
            )}

            {/* Selected users preview */}
            {getEffectiveSelectedUsers().length > 0 && (
              <Box>
                <Text fontWeight="medium" mb={2}>Adgang til sengetider:</Text>
                <Flex gap={2} wrap="wrap">
                  {getEffectiveSelectedUsers().map((user) => (
                    <Badge key={user.id} colorScheme="sage" variant="subtle">
                      {user.displayName}
                    </Badge>
                  ))}
                </Flex>
              </Box>
            )}
          </VStack>
        </Tabs.Content>
      </Tabs.Root>
    </DialogManager>
  );
}
