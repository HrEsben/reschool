"use client";

import React, { useState, useEffect } from 'react';
import {
  VStack,
  Input,
  Textarea,
  Text,
  Box,
  Button,
  HStack
} from '@chakra-ui/react';
import { DialogManager } from '@/components/ui/dialog-manager';
import { useUpdateIndsatsStep, useDeleteIndsatsStep } from '@/lib/queries';
import { showToast } from '@/components/ui/simple-toast';
import { IndsatsSteps } from '@/lib/database-service';
import { TrashIcon } from '@/components/ui/icons';

interface EditStepDialogProps {
  trigger?: React.ReactElement;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  step: IndsatsSteps;
  planId: number;
  childId: string;
  onSuccess?: () => void;
  onDelete?: () => void;
}

export function EditStepDialog({
  trigger,
  isOpen: controlledIsOpen,
  setIsOpen: controlledSetIsOpen,
  step,
  planId,
  childId,
  onSuccess,
  onDelete
}: EditStepDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [title, setTitle] = useState(step.title);
  const [description, setDescription] = useState(step.description || '');
  const [målsætning, setMålsætning] = useState(step.målsætning || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Use controlled or internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledSetIsOpen || setInternalIsOpen;

  const updateStepMutation = useUpdateIndsatsStep();
  const deleteStepMutation = useDeleteIndsatsStep();

  // Initialize form data when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTitle(step.title);
      setDescription(step.description || '');
      setMålsætning(step.målsætning || '');
      setShowDeleteConfirm(false);
    }
  }, [isOpen, step]);

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
      await updateStepMutation.mutateAsync({
        stepId: step.id,
        planId,
        childId,
        title: title.trim(),
        description: description.trim() || undefined,
        målsætning: målsætning.trim() || undefined
      });

      showToast({
        title: "Trin opdateret",
        description: `"${title}" er blevet opdateret`,
        type: "success"
      });

      setIsOpen(false);
      onSuccess?.();
    } catch {
      showToast({
        title: "Fejl",
        description: "Kunne ikke opdatere trinnet",
        type: "error"
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStepMutation.mutateAsync({
        stepId: step.id,
        planId,
        childId
      });

      showToast({
        title: "Trin slettet",
        description: `"${step.title}" er blevet slettet`,
        type: "success"
      });

      setIsOpen(false);
      onDelete?.();
      onSuccess?.();
    } catch {
      showToast({
        title: "Fejl",
        description: "Kunne ikke slette trinnet",
        type: "error"
      });
    }
  };

  if (showDeleteConfirm) {
    return (
      <DialogManager
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        trigger={trigger || <div style={{ display: 'none' }} />}
        title="Slet trin"
        primaryAction={{
          label: "Slet trin",
          onClick: handleDelete,
          colorScheme: "red"
        }}
        secondaryAction={{
          label: "Annuller",
          onClick: () => setShowDeleteConfirm(false)
        }}
      >
        <VStack gap={4} align="stretch">
          <Text>
            Er du sikker på, at du vil slette trinnet <strong>&quot;{step.title}&quot;</strong>?
          </Text>
          <Text fontSize="sm" color="fg.muted">
            Denne handling kan ikke fortrydes. Trinnet vil blive permanent slettet.
          </Text>
          {step.isCompleted && (
            <Box 
              p={3} 
              bg="yellow.50" 
              borderRadius="md" 
              border="1px solid" 
              borderColor="yellow.200"
            >
              <Text fontSize="sm" color="yellow.700" fontWeight="medium">
                ⚠️ Dette trin er allerede fuldført
              </Text>
              <Text fontSize="xs" color="yellow.600" mt={1}>
                Sletning af fuldførte trin kan påvirke progresstatistikker.
              </Text>
            </Box>
          )}
        </VStack>
      </DialogManager>
    );
  }

  return (
    <DialogManager
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={trigger || <div style={{ display: 'none' }} />}
      title="Rediger trin"
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
            placeholder="F.eks. Introduktion til skolen"
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
            placeholder="Beskriv hvad der skal ske i dette trin..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </VStack>

        {/* Målsætning */}
        <VStack gap={2} align="stretch">
          <Text fontSize="sm" fontWeight="medium">
            Målsætning
          </Text>
          <Textarea
            placeholder="Hvad er målet med dette trin? Hvad skal opnås?"
            value={målsætning}
            onChange={(e) => setMålsætning(e.target.value)}
            rows={2}
          />
        </VStack>

        {/* Step Information */}
        <Box 
          p={3} 
          bg="sage.50" 
          borderRadius="md" 
          border="1px solid" 
          borderColor="sage.200"
        >
          <HStack justify="space-between" align="center">
            <VStack align="start" gap={1}>
              <Text fontSize="sm" color="sage.700" fontWeight="medium">
                Trin {step.stepNumber}
              </Text>
              <Text fontSize="xs" color="sage.600">
                Status: {step.isCompleted ? 'Fuldført' : 'Ikke fuldført'}
              </Text>
              {step.completedAt && (
                <Text fontSize="xs" color="sage.600">
                  Fuldført: {new Date(step.completedAt).toLocaleDateString('da-DK')}
                </Text>
              )}
            </VStack>
            
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <TrashIcon />
              Slet trin
            </Button>
          </HStack>
        </Box>
      </VStack>
    </DialogManager>
  );
}
