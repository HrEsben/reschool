"use client";

import { ReactNode } from 'react';
import { Text, VStack } from '@chakra-ui/react';
import { WarningDialog } from './dialog-manager';

interface DemoteUserDialogProps {
  trigger: ReactNode;
  userName: string;
  userEmail: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DemoteUserDialog({
  trigger,
  userName,
  userEmail,
  onConfirm,
  isLoading = false,
}: DemoteUserDialogProps) {
  return (
    <WarningDialog
      trigger={trigger}
      title="Fjern administratorrettigheder"
      primaryAction={{
        label: "Fjern rettigheder",
        onClick: onConfirm,
        colorScheme: "orange",
        isLoading: isLoading,
        loadingText: "Fjerner rettigheder..."
      }}
      secondaryAction={{
        label: "Annuller",
        onClick: () => {}, // Dialog will close automatically
        variant: "outline",
        colorScheme: "gray"
      }}
    >
      <VStack gap={3} align="stretch">
        <Text color="gray.700" fontSize="md" lineHeight="1.5">
          Er du sikker på, at du vil fjerne administratorrettigheder fra <strong>{userName}</strong> ({userEmail})?
        </Text>
        
        <Text 
          color="orange.700" 
          fontSize="xs" 
          fontWeight="medium" 
          bg="orange.50" 
          p={2.5} 
          borderRadius="md"
          borderLeft="3px solid"
          borderLeftColor="orange.300"
          lineHeight="1.4"
        >
          Brugeren mister adgang til at invitere andre, administrere værktøjer og redigere barnet.
        </Text>
      </VStack>
    </WarningDialog>
  );
}
