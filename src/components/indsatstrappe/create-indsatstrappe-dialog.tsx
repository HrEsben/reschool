"use client";

import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Input,
  Textarea,
  Text,
  Box,
  Tabs,
  Checkbox
} from '@chakra-ui/react';
import { DialogManager } from '@/components/ui/dialog-manager';
import { useCreateIndsatstrappe } from '@/lib/queries';
import { showToast } from '@/components/ui/simple-toast';
import { useChildUsers } from '@/lib/queries';
import { UserWithRelation } from '@/lib/database-service';

interface CreateIndsatsrappeDialogProps {
  childId: number;
  childName: string;
  trigger: React.ReactElement;
  onSuccess?: () => void;
  isUserAdmin?: boolean;
}

export function CreateIndsatsrappeDialog({
  childId,
  childName,
  trigger,
  onSuccess,
  isUserAdmin = false
}: CreateIndsatsrappeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(() => {
    // Default to today's date in YYYY-MM-DD format
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  
  // Visibility control state (like in tools)
  const [visibilityOption, setVisibilityOption] = useState<'alle' | 'kun_mig' | 'custom'>('alle');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  
  // Fetch child users for access control selection
  const { data: childUsers = [] } = useChildUsers(childId.toString());
  
  const createMutation = useCreateIndsatstrappe();

  // Visibility control handlers
  const handleVisibilityChange = (option: 'alle' | 'kun_mig' | 'custom') => {
    setVisibilityOption(option);
    if (option !== 'custom') {
      setSelectedUserIds([]);
    }
  };

  const getEffectiveSelectedUsers = (): UserWithRelation[] => {
    return childUsers.filter((user: UserWithRelation) => selectedUserIds.includes(user.id));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast({
        title: "Fejl",
        description: "Titel er påkrævet",
        type: "error"
      });
      return;
    }

    // Validate visibility settings for admin users
    if (isUserAdmin && visibilityOption === 'custom' && getEffectiveSelectedUsers().length === 0) {
      showToast({
        title: 'Manglende adgang',
        description: 'Hvis du vælger tilpasset synlighed, skal du vælge mindst én voksen der har adgang',
        type: 'error'
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        childId: childId.toString(),
        title: title.trim(),
        description: description.trim() || undefined,
        startDate: startDate || undefined,
        isPublic: visibilityOption === 'alle',
        accessibleUserIds: isUserAdmin && visibilityOption === 'custom' 
          ? getEffectiveSelectedUsers().map((user: UserWithRelation) => user.id) 
          : visibilityOption === 'kun_mig' 
            ? [] 
            : undefined
      });

      showToast({
        title: "Indsatstrappe oprettet",
        description: `Handlingsplan for ${childName} er blevet oprettet`,
        type: "success"
      });

      // Reset form
      setTitle('');
      setDescription('');
      setStartDate(() => {
        const today = new Date();
        return today.toISOString().split('T')[0];
      });
      setVisibilityOption('alle');
      setSelectedUserIds([]);
      
      setIsOpen(false);
      onSuccess?.();
    } catch {
      showToast({
        title: "Fejl",
        description: "Kunne ikke oprette indsatstrappe",
        type: "error"
      });
    }
  };

  return (
    <DialogManager
      trigger={trigger}
      title="Opret Indsatstrappe"
      maxWidth="lg"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      icon="📋"
      primaryAction={{
        label: 'Opret indsatstrappe',
        onClick: handleSubmit,
        isLoading: createMutation.isPending,
        loadingText: 'Opretter...',
        isDisabled: !title.trim(),
        preventAutoClose: true
      }}
      secondaryAction={{
        label: 'Annuller',
        onClick: () => setIsOpen(false),
        variant: 'outline'
      }}
    >
      <Tabs.Root defaultValue="indstillinger" variant="enclosed">
        <Tabs.List>
          <Tabs.Trigger value="indstillinger">Indstillinger</Tabs.Trigger>
          {isUserAdmin && (
            <Tabs.Trigger value="synlighed">Synlighed</Tabs.Trigger>
          )}
        </Tabs.List>

        <Tabs.Content value="indstillinger">
          <VStack gap={6} align="stretch">
            {/* Introduction */}
            <Box p={4} bg="sage.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="sage.500">
              <Text fontSize="sm" color="fg.default">
                Opret en struktureret handlingsplan for <strong>{childName}</strong>. 
                Planen består af trin der viser vejen mod et specifikt mål.
              </Text>
            </Box>

            {/* Basic Information */}
            <VStack gap={4} align="stretch">
              <VStack gap={2} align="stretch">
                <Text fontSize="sm" fontWeight="medium">Titel <Text as="span" color="red.500">*</Text></Text>
                <Input
                  placeholder="F.eks. 'Forbedre skolefremmøde'"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={255}
                />
              </VStack>

              <VStack gap={2} align="stretch">
                <Text fontSize="sm" fontWeight="medium">Beskrivelse</Text>
                <Textarea
                  placeholder="Beskriv det overordnede mål og formål med denne indsatstrappe..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </VStack>

              <VStack gap={2} align="stretch">
                <Text fontSize="sm" fontWeight="medium">Startdato</Text>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <Text fontSize="xs" color="fg.muted">
                  Hvornår starter denne handlingsplan? (Standard: i dag)
                </Text>
              </VStack>
            </VStack>
          </VStack>
        </Tabs.Content>

        {isUserAdmin && (
          <Tabs.Content value="synlighed">
            <VStack gap={4} align="stretch" p={4}>
              <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                Hvem kan se denne indsatstrappe?
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
                      <Text fontWeight="semibold">Alle voksne</Text>
                      <Text fontSize="sm" color="gray.600">
                        Alle voksne tilknyttet barnet kan se planen (inkl. nye voksne)
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
                        Kun du kan se denne indsatstrappe
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
                      <Text fontWeight="semibold">Udvalgte voksne</Text>
                      <Text fontSize="sm" color="gray.600">
                        Vælg specifikt hvilke voksne der skal have adgang
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </VStack>

              {/* Custom user selection */}
              {visibilityOption === 'custom' && (
                <VStack gap={3} align="stretch" mt={4}>
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                      Vælg hvilke voksne der skal have adgang:
                    </Text>
                    <VStack gap={2} align="stretch">
                      {childUsers.map((user: UserWithRelation) => (
                        <Checkbox.Root
                          key={user.id}
                          checked={selectedUserIds.includes(user.id)}
                          onCheckedChange={(details: { checked: string | boolean }) => {
                            const isChecked = details.checked === true || details.checked === 'true';
                            if (isChecked) {
                              setSelectedUserIds([...selectedUserIds, user.id]);
                            } else {
                              setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                            }
                          }}
                        >
                          <Checkbox.HiddenInput />
                          <Checkbox.Control />
                          <Checkbox.Label>
                            <Text fontSize="sm">{user.displayName} ({user.relation})</Text>
                          </Checkbox.Label>
                        </Checkbox.Root>
                      ))}
                    </VStack>
                  </Box>
                </VStack>
              )}
            </VStack>
          </Tabs.Content>
        )}
      </Tabs.Root>
    </DialogManager>
  );
}
