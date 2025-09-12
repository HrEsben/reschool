"use client";

import { useState, useEffect } from 'react';
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
import { useChildUsers } from '@/lib/queries';
import { UserWithRelation } from '@/lib/database-service';
import { useUser } from '@stackframe/stack';

interface DagensSmiley {
  id: number;
  childId: number;
  createdBy: number;
  topic: string;
  description?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EditDagensSmileyDialogProps {
  smiley: DagensSmiley;
  onSmileyUpdated: () => void;
  trigger: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isUserAdmin?: boolean;
}

export function EditDagensSmileyDialog({ 
  smiley, 
  onSmileyUpdated, 
  trigger,
  isOpen,
  onOpenChange,
  isUserAdmin = false 
}: EditDagensSmileyDialogProps) {
  const stackUser = useUser();
  const [topic, setTopic] = useState(smiley.topic);
  const [description, setDescription] = useState(smiley.description || '');
  const [loading, setLoading] = useState(false);
  
  // Visibility control state
  const [visibilityOption, setVisibilityOption] = useState<'alle' | 'kun_mig' | 'custom'>(
    smiley.isPublic ? 'alle' : 'kun_mig'
  );
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  
  // Fetch child users for access control selection
  const { data: childUsers = [] } = useChildUsers(smiley.childId.toString());

  // Load current access settings when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTopic(smiley.topic);
      setDescription(smiley.description || '');
      setVisibilityOption(smiley.isPublic ? 'alle' : 'kun_mig');
      
      // Load current access users if needed
      if (!smiley.isPublic) {
        fetchCurrentAccessUsers();
      }
    }
  }, [isOpen, smiley]);

  const fetchCurrentAccessUsers = async () => {
    try {
      const response = await fetch(`/api/dagens-smiley/${smiley.id}/access`);
      if (response.ok) {
        const data = await response.json();
        if (data.accessUsers && data.accessUsers.length > 0) {
          setVisibilityOption('custom');
          setSelectedUserIds(data.accessUsers.map((user: any) => user.id));
        }
      }
    } catch (error) {
      console.error('Error fetching access users:', error);
    }
  };

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

    setLoading(true);
    try {
      // Determine visibility settings
      const isPublic = visibilityOption === 'alle';
      const accessibleUserIds = visibilityOption === 'custom' ? selectedUserIds : [];

      const response = await fetch(`/api/dagens-smiley/${smiley.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          description: description.trim() || undefined,
          isPublic,
          accessibleUserIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update dagens smiley');
      }

      showToast({
        title: 'Succes',
        description: 'Dagens smiley opdateret',
        type: 'success',
        duration: 3000,
      });
      
      onSmileyUpdated();
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error updating dagens smiley:', error);
      showToast({
        title: 'Fejl',
        description: 'Der opstod en fejl ved opdatering af dagens smiley',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleVisibilityChange = (option: 'alle' | 'kun_mig' | 'custom') => {
    setVisibilityOption(option);
    if (option !== 'custom') {
      setSelectedUserIds([]);
    }
  };

  const handleUserToggle = (userId: number) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getRelationDisplayName = (relation: string): string => {
    const relationMap: { [key: string]: string } = {
      'mor': 'Mor',
      'far': 'Far',
      'stepmor': 'Stedmor',
      'stepfar': 'Stedfar',
      'bedsteforælder': 'Bedsteforælder',
      'værge': 'Værge',
      'pædagog': 'Pædagog',
      'anden': 'Anden'
    };
    return relationMap[relation] || relation;
  };

  return (
    <DialogManager
      trigger={trigger}
      title="Rediger dagens smiley"
      type="default"
      primaryAction={{
        label: "Gem ændringer",
        onClick: handleSubmit,
        colorScheme: "sage",
        isLoading: loading,
        loadingText: "Gemmer..."
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
                        flexShrink={0}
                      />
                      <VStack align="start" gap={1}>
                        <Text fontWeight="medium">Alle med adgang til barnet</Text>
                        <Text fontSize="sm" color="gray.600">
                          Alle forældre, værger og pædagoger kan se og bruge dette værktøj
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  {/* Private option */}
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
                        flexShrink={0}
                      />
                      <VStack align="start" gap={1}>
                        <Text fontWeight="medium">Kun mig</Text>
                        <Text fontSize="sm" color="gray.600">
                          Kun du kan se og bruge dette værktøj
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  {/* Custom option */}
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
                        flexShrink={0}
                      />
                      <VStack align="start" gap={1}>
                        <Text fontWeight="medium">Vælg specifikke personer</Text>
                        <Text fontSize="sm" color="gray.600">
                          Vælg præcis hvem der skal have adgang
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </VStack>
              </Box>

              {/* User Selection (only shown when custom is selected) */}
              {visibilityOption === 'custom' && (
                <Box>
                  <Text mb={3} fontWeight="medium">Vælg personer:</Text>
                  <VStack gap={2} align="stretch">
                    {childUsers.map((user: UserWithRelation) => (
                      <CheckboxCard.Root
                        key={user.id}
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => handleUserToggle(user.id)}
                      >
                        <CheckboxCard.HiddenInput />
                        <CheckboxCard.Control>
                          <CheckboxCard.Indicator />
                        </CheckboxCard.Control>
                        <CheckboxCard.Content>
                        <HStack justify="space-between" width="100%">
                          <VStack align="start" gap={0}>
                            <Text fontWeight="medium">{user.displayName}</Text>
                            <Text fontSize="sm" color="gray.600">{user.email}</Text>
                          </VStack>
                          <Badge variant="subtle" colorScheme="gray">
                            {getRelationDisplayName(user.relation)}
                          </Badge>
                        </HStack>
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
