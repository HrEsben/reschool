"use client";

import { ReactNode } from 'react';
import { Text, VStack } from '@chakra-ui/react';
import { ErrorDialog } from './dialog-manager';

interface DeleteChildDialogProps {
  trigger: ReactNode;
  childName: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteChildDialog({ 
  trigger, 
  childName, 
  onConfirm, 
  isLoading = false 
}: DeleteChildDialogProps) {
  return (
    <ErrorDialog
      trigger={trigger}
      title="Slet barn permanent"
      icon="⚠️"
      primaryAction={{
        label: "🗑️ Slet permanent",
        onClick: onConfirm,
        colorScheme: "red",
        isLoading: isLoading,
        loadingText: "Sletter..."
      }}
      secondaryAction={{
        label: "Annuller",
        onClick: () => {}, // Dialog will close automatically
        variant: "outline",
        colorScheme: "gray"
      }}
    >
      <VStack gap={4} align="stretch">
        <Text color="gray.700" fontSize="md" lineHeight="tall">
          Er du sikker på, at du vil slette <strong>{childName}</strong>?
        </Text>
        
        <Text 
          color="red.600" 
          fontSize="sm" 
          fontWeight="medium" 
          bg="red.50" 
          p={3} 
          borderRadius="md"
          border="1px solid"
          borderColor="red.200"
        >
          ⚠️ Denne handling vil permanent slette alle data for dette barn for alle tilknyttede brugere. 
          Data kan ikke gendannes efter sletning.
        </Text>
        
        <Text color="gray.600" fontSize="sm">
          Alle følgende data vil blive slettet:
        </Text>
        
        <VStack 
          align="start" 
          gap={1} 
          pl={4} 
          color="gray.600" 
          fontSize="sm"
        >
          <Text>• Barnets profil og information</Text>
          <Text>• Alle tilknyttede brugere og relationer</Text>
          <Text>• Historik og aktivitetsdata</Text>
          <Text>• Værktøjer og indstillinger</Text>
        </VStack>
      </VStack>
    </ErrorDialog>
  );
}
