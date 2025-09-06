"use client";

import { ReactNode } from 'react';
import { Text, VStack } from '@chakra-ui/react';
import { WarningDialog } from './dialog-manager';

interface DeleteInvitationDialogProps {
  trigger: ReactNode;
  invitationEmail: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteInvitationDialog({ 
  trigger, 
  invitationEmail, 
  onConfirm, 
  isLoading = false 
}: DeleteInvitationDialogProps) {
  return (
    <WarningDialog
      trigger={trigger}
      title="Slet invitation"
      primaryAction={{
        label: "Slet invitation",
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
          Er du sikker på, at du vil slette invitationen til <strong>{invitationEmail}</strong>?
        </Text>
        
        <Text 
          color="orange.600" 
          fontSize="sm" 
          fontWeight="medium" 
          bg="orange.50" 
          p={3} 
          borderRadius="md"
        >
          Denne handling kan ikke fortrydes. Personen skal inviteres igen for at få adgang.
        </Text>
      </VStack>
    </WarningDialog>
  );
}
