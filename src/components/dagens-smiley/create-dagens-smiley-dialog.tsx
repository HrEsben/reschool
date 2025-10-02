"use client";

import { useState } from 'react';
import {
  Box,
  Input,
  VStack,
  Text,
  HStack,
  Badge,
  Tabs,
  CheckboxCard,
  Textarea,
} from '@chakra-ui/react';
import { DialogManager } from '@/components/ui/dialog-manager';
import { showToast } from '@/components/ui/simple-toast';
import { useChildUsers, useCreateDagensSmiley } from '@/lib/queries';
import { UserWithRelation } from '@/lib/database-service';
import { useUser } from '@stackframe/stack';

interface CreateDagensSmileyDialogProps {
  childId: number;
  onSmileyCreated: () => void;
  trigger: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isUserAdmin?: boolean;
}

export function CreateDagensSmileyDialog({ childId, onSmileyCreated, trigger, isOpen, onOpenChange, isUserAdmin = false }: CreateDagensSmileyDialogProps) {
  const stackUser = useUser();
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  
  // React Query mutation
  const createDagensSmileyMutation = useCreateDagensSmiley();
  const isSubmitting = createDagensSmileyMutation.isPending;
  
  // Visibility control state
  const [visibilityOption, setVisibilityOption] = useState<'alle' | 'kun_mig' | 'custom'>('alle');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  
  // Fetch child users for access control selection
  const { data: childUsers = [] } = useChildUsers(childId.toString());

  const handleSubmit = async () => {
    if (!stackUser || !topic.trim()) {
      showToast({
        title: 'Fejl',
        description: 'Udfyld venligst alle påkrævede felter',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      // Determine visibility settings
      const isPublic = visibilityOption === 'alle';
      const accessibleUserIds = visibilityOption === 'custom' ? selectedUserIds : [];

      await createDagensSmileyMutation.mutateAsync({
        childId: childId.toString(),
        data: {
          topic: topic.trim(),
          description: description.trim() || undefined,
          isPublic,
          accessibleUserIds,
        },
      });

      showToast({
        title: 'Succes',
        description: 'Dagens smiley oprettet',
        type: 'success',
        duration: 3000,
      });

      // Reset form
      setTopic('');
      setDescription('');
      setVisibilityOption('alle');
      setSelectedUserIds([]);
      
      onSmileyCreated();
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error creating dagens smiley:', error);
      showToast({
        title: 'Fejl',
        description: 'Kunne ikke oprette dagens smiley',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const handleCancel = () => {
    setTopic('');
    setDescription('');
    setVisibilityOption('alle');
    setSelectedUserIds([]);
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // Visibility control handlers
  const handleVisibilityChange = (option: 'alle' | 'kun_mig' | 'custom') => {
    setVisibilityOption(option);
    if (option !== 'custom') {
      setSelectedUserIds([]);
    }
  };

  const handleUserSelection = (userId: number, checked: boolean) => {
    setSelectedUserIds(prev => 
      checked 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  };

  return (
    <DialogManager
      trigger={trigger}
      title="Opret dagens smiley"
      type="default"
      primaryAction={{
        label: "Opret",
        onClick: handleSubmit,
        colorScheme: "sage",
        isLoading: isSubmitting,
        loadingText: "Opretter..."
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
          <VStack gap={4} align="stretch">
            {/* Topic Input */}
            <Box>
              <Text mb={2} fontWeight="medium">Emne *</Text>
              <Input
                placeholder="Hvad handler det om? (f.eks. 'Hvordan har jeg det i dag?')"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                maxLength={100}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                {topic.length}/100 tegn
              </Text>
            </Box>

            {/* Description Input */}
            <Box>
              <Text mb={2} fontWeight="medium">Beskrivelse</Text>
              <Textarea
                placeholder="Uddyb gerne hvad dette værktøj skal bruges til..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                {description.length}/500 tegn
              </Text>
            </Box>

            {/* Info about dagens smiley */}
            <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
              <Text fontSize="sm" color="blue.800" fontWeight="medium" mb={1}>
                Om dagens smiley
              </Text>
              <Text fontSize="xs" color="blue.700">
                Barnet vælger en smiley og kan derefter forklare hvorfor de valgte netop den smiley. 
                Det hjælper med at sætte ord på følelser og reflektere over dagens oplevelser.
              </Text>
            </Box>
          </VStack>
        </Tabs.Content>

        {isUserAdmin && (
          <Tabs.Content value="synlighed">
            <VStack gap={6} align="stretch">
              {/* Visibility Options */}
              <Box>
                <Text mb={3} fontWeight="medium">Hvem skal have adgang?</Text>
                <VStack gap={3} align="stretch">
                  {/* Public option */}
                  <Box
                    p={3}
                    borderRadius="md"
                    border="2px solid"
                    borderColor={visibilityOption === 'alle' ? 'sage.500' : 'gray.200'}
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
                        <Text fontWeight="medium">Alle voksne</Text>
                        <Text fontSize="sm" color="gray.600">
                          Alle voksne tilknyttet barnet kan se og bruge dette værktøj
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  {/* Creator only option */}
                  <Box
                    p={3}
                    borderRadius="md"
                    border="2px solid"
                    borderColor={visibilityOption === 'kun_mig' ? 'sage.500' : 'gray.200'}
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
                        <Text fontWeight="medium">Kun mig</Text>
                        <Text fontSize="sm" color="gray.600">
                          Kun du kan se og bruge dette værktøj
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  {/* Custom access option */}
                  <Box
                    p={3}
                    borderRadius="md"
                    border="2px solid"
                    borderColor={visibilityOption === 'custom' ? 'sage.500' : 'gray.200'}
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
                        <Text fontWeight="medium">Udvalgte personer</Text>
                        <Text fontSize="sm" color="gray.600">
                          Vælg specifikke personer der skal have adgang
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </VStack>
              </Box>

              {/* User Selection */}
              {visibilityOption === 'custom' && (
                <Box>
                  <Text mb={3} fontWeight="medium">Vælg personer:</Text>
                  <VStack gap={2} align="stretch" maxH="300px" overflowY="auto">
                    {childUsers.map((user: UserWithRelation) => (
                      <CheckboxCard.Root
                        key={user.id}
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={(checked) => handleUserSelection(user.id, !!checked.checked)}
                      >
                        <CheckboxCard.HiddenInput />
                        <CheckboxCard.Control>
                          <CheckboxCard.Indicator />
                        </CheckboxCard.Control>
                        <CheckboxCard.Content>
                          <VStack gap={1} align="start">
                            <Text fontWeight="medium">{user.displayName}</Text>
                            <HStack gap={2}>
                              <Text fontSize="sm" color="gray.600">
                                {user.customRelationName || user.relation}
                              </Text>
                              {user.isAdministrator && (
                                <Badge colorScheme="blue" size="sm">Administrator</Badge>
                              )}
                            </HStack>
                          </VStack>
                        </CheckboxCard.Content>
                      </CheckboxCard.Root>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </Tabs.Content>
        )}
      </Tabs.Root>
    </DialogManager>
  );
}
