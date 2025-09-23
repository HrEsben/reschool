"use client";

import React, { useState, useEffect } from 'react';
import {
  VStack,
  Input,
  Textarea,
  Text,
  Box,
  Tabs,
  Checkbox,
  HStack
} from '@chakra-ui/react';
import { DialogManager } from '@/components/ui/dialog-manager';
import { useUpdateIndsatstrappe } from '@/lib/queries';
import { showToast } from '@/components/ui/simple-toast';
import { useChildUsers } from '@/lib/queries';
import { UserWithRelation, IndsatstrappePlan } from '@/lib/database-service';

interface EditIndsatsrappeDialogProps {
  trigger?: React.ReactElement;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  plan: IndsatstrappePlan;
  childId: number;
  isUserAdmin: boolean;
  onSuccess?: () => void;
}

export function EditIndsatsrappeDialog({
  trigger,
  isOpen: controlledIsOpen,
  setIsOpen: controlledSetIsOpen,
  plan,
  childId,
  isUserAdmin,
  onSuccess
}: EditIndsatsrappeDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [title, setTitle] = useState(plan.title);
  const [description, setDescription] = useState(plan.description || '');
  const [visibilityOption, setVisibilityOption] = useState<'alle' | 'kun_mig' | 'custom'>('alle');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  
  // Use controlled or internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledSetIsOpen || setInternalIsOpen;
  
  const updateIndsatstrapeMutation = useUpdateIndsatstrappe();
  const { data: childUsers = [] } = useChildUsers(childId.toString());

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

  // Initialize form data when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTitle(plan.title);
      setDescription(plan.description || '');
      
      // Initialize visibility settings based on plan data
      // Note: Access control data may not be available in the current plan object
      // Check if the plan has access control information
      const planWithAccess = plan as IndsatstrappePlan & { accessibleUserIds?: number[] };
      
      if (planWithAccess.accessibleUserIds !== undefined) {
        if (planWithAccess.accessibleUserIds.length === 0) {
          setVisibilityOption('kun_mig');
          setSelectedUserIds([]);
        } else {
          setVisibilityOption('custom');
          setSelectedUserIds(planWithAccess.accessibleUserIds);
        }
      } else {
        // Default to 'alle' if no access control is set
        setVisibilityOption('alle');
        setSelectedUserIds([]);
      }
    }
  }, [isOpen, plan]);

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
      await updateIndsatstrapeMutation.mutateAsync({
        planId: plan.id,
        childId: childId.toString(),
        title: title.trim(),
        description: description.trim() || undefined,
        isActive: plan.isActive,
        accessibleUserIds: isUserAdmin && visibilityOption === 'custom' 
          ? getEffectiveSelectedUsers().map((user: UserWithRelation) => user.id) 
          : visibilityOption === 'kun_mig' 
            ? [] 
            : undefined
      });

      showToast({
        title: "Indsatstrappe opdateret",
        description: `"${title}" er blevet opdateret`,
        type: "success"
      });

      setIsOpen(false);
      onSuccess?.();
    } catch {
      showToast({
        title: "Fejl",
        description: "Kunne ikke opdatere indsatstrappe",
        type: "error"
      });
    }
  };

  return (
    <DialogManager
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={trigger || <div style={{ display: 'none' }} />}
      title="Rediger Indsatstrappe"
      maxWidth="lg"
      primaryAction={{
        label: "Gem ændringer",
        onClick: handleSubmit,
        colorScheme: "sage"
      }}
      secondaryAction={{
        label: "Annuller",
        onClick: () => setIsOpen(false)
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
            {/* Title */}
            <VStack gap={2} align="stretch">
              <Text fontSize="sm" fontWeight="medium">
                Titel *
              </Text>
              <Input
                placeholder="F.eks. Skoleintegration, Sociale færdigheder..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </VStack>

            {/* Description */}
            <VStack gap={2} align="stretch">
              <Text fontSize="sm" fontWeight="medium">
                Beskrivelse
              </Text>
              <Textarea
                placeholder="Beskriv formålet og målene med denne indsatstrappe..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </VStack>

            {/* Status Information */}
            <Box 
              p={3} 
              bg="sage.50" 
              borderRadius="md" 
              border="1px solid" 
              borderColor="sage.200"
            >
              <Text fontSize="sm" color="sage.700" fontWeight="medium">
                Plan status: {plan.isActive ? 'Aktiv' : 'Inaktiv'}
              </Text>
              <Text fontSize="xs" color="sage.600" mt={1}>
                {plan.totalSteps} trin i alt • {plan.completedSteps} fuldført
              </Text>
              {plan.targetDate && (
                <Text fontSize="xs" color="sage.600">
                  Målsætning: {new Date(plan.targetDate).toLocaleDateString('da-DK')}
                </Text>
              )}
            </Box>
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
                      <Text fontWeight="semibold">Tilpasset</Text>
                      <Text fontSize="sm" color="gray.600">
                        Vælg specifikke personer der skal have adgang
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </VStack>

              {/* Custom user selection */}
              {visibilityOption === 'custom' && (
                <VStack gap={3} align="stretch">
                  <Text fontSize="sm" fontWeight="medium" color="gray.700">
                    Vælg hvem der skal have adgang ({getEffectiveSelectedUsers().length} valgt)
                  </Text>
                  
                  <Box
                    p={3}
                    border="1px solid"
                    borderColor="sage.200"
                    borderRadius="md"
                    bg="sage.25"
                    maxH="200px"
                    overflowY="auto"
                  >
                    <VStack gap={2} align="stretch">
                      {childUsers.filter((user: UserWithRelation) => 
                        user.relation === 'adult' || user.relation === 'administrator'
                      ).map((user: UserWithRelation) => (
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
