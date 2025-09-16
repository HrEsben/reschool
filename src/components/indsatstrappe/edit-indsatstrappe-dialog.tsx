"use client";

import React, { useState, useEffect } from 'react';
import {
  VStack,
  Input,
  Textarea,
  Text,
  Box,
  Tabs,
  Checkbox
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
  childName: string;
  isUserAdmin: boolean;
  onSuccess?: () => void;
}

export function EditIndsatsrappeDialog({
  trigger,
  isOpen: controlledIsOpen,
  setIsOpen: controlledSetIsOpen,
  plan,
  childId,
  childName,
  isUserAdmin,
  onSuccess
}: EditIndsatsrappeDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [title, setTitle] = useState(plan.title);
  const [description, setDescription] = useState(plan.description || '');
  const [visibilityOption, setVisibilityOption] = useState<'alle' | 'specifikke'>('alle');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  
  // Use controlled or internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledSetIsOpen || setInternalIsOpen;
  
  const updateIndsatstrapeMutation = useUpdateIndsatstrappe();
  const { data: childUsers = [] } = useChildUsers(childId.toString());

  // Initialize form data when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTitle(plan.title);
      setDescription(plan.description || '');
      // Note: We don't have access control data in the plan object
      // You may need to fetch this separately if implementing access control
      setVisibilityOption('alle');
      setSelectedUserIds([]);
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

    try {
      await updateIndsatstrapeMutation.mutateAsync({
        planId: plan.id,
        childId: childId.toString(),
        title: title.trim(),
        description: description.trim() || undefined,
        isActive: plan.isActive,
        // Note: Access control implementation would go here
        // accessibleUserIds: visibilityOption === 'specifikke' ? selectedUserIds : undefined
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

  const availableUsers = childUsers.filter((user: UserWithRelation) => 
    user.relation === 'adult' || user.relation === 'administrator'
  );

  return (
    <DialogManager
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={trigger || <div style={{ display: 'none' }} />}
      title="Rediger Indsatstrappe"
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

        {/* Visibility Settings - Optional for future implementation */}
        {isUserAdmin && availableUsers.length > 0 && (
          <VStack gap={4} align="stretch">
            <Text fontSize="sm" fontWeight="medium">
              Adgang
            </Text>
            
            <Tabs.Root 
              value={visibilityOption} 
              onValueChange={(details) => setVisibilityOption(details.value as 'alle' | 'specifikke')}
            >
              <Tabs.List>
                <Tabs.Trigger value="alle">Alle voksne</Tabs.Trigger>
                <Tabs.Trigger value="specifikke">Specifikke personer</Tabs.Trigger>
              </Tabs.List>
              
              <Box pt={4}>
                <Tabs.Content value="alle">
                  <Text fontSize="sm" color="fg.muted">
                    Alle voksne med adgang til {childName} kan se denne indsatstrappe.
                  </Text>
                </Tabs.Content>
                
                <Tabs.Content value="specifikke">
                  <VStack gap={3} align="stretch">
                    <Text fontSize="sm" color="fg.muted">
                      Vælg hvilke personer der skal have adgang til denne indsatstrappe:
                    </Text>
                    
                    <VStack gap={2} align="stretch" maxH="200px" overflowY="auto">
                      {availableUsers.map((user: UserWithRelation) => (
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
                          <Checkbox.Label fontSize="sm">
                            {user.displayName || user.email}
                            <Text as="span" color="fg.muted" ml={2}>
                              ({user.relation === 'administrator' ? 'Administrator' : 'Voksen'})
                            </Text>
                          </Checkbox.Label>
                        </Checkbox.Root>
                      ))}
                    </VStack>
                  </VStack>
                </Tabs.Content>
              </Box>
            </Tabs.Root>
          </VStack>
        )}

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
    </DialogManager>
  );
}
