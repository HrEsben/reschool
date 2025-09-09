"use client";

import { ReactNode } from 'react';
import { Text, VStack } from '@chakra-ui/react';
import { WarningDialog } from './dialog-manager';

interface RemoveUserDialogProps {
  trigger: ReactNode;
  userName: string;
  userEmail: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function RemoveUserDialog({
  trigger,
  userName,
  userEmail,
  onConfirm,
  isLoading = false
}: RemoveUserDialogProps) {
  return (
    <WarningDialog
      trigger={trigger}
      title="Fjern bruger"
      primaryAction={{
        label: "Fjern bruger",
        onClick: onConfirm,
        colorScheme: "red",
        isLoading: isLoading,
        loadingText: "Fjerner..."
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
          Er du sikker på, at du vil fjerne{' '}
          <Text as="span" fontWeight="600" color="navy.700">
            {userName || userEmail}
          </Text>{' '}
          fra dette barn?
        </Text>
        
        <Text 
          color="orange.600" 
          fontSize="sm" 
          fontWeight="medium" 
          bg="orange.50" 
          p={3} 
          borderRadius="md"
        >
          Brugeren vil ikke længere have adgang til barnets profil og data.
        </Text>
      </VStack>
    </WarningDialog>
  );
}
