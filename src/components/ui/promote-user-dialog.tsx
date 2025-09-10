"use client";

import { ReactNode } from 'react';
import { Text, VStack } from '@chakra-ui/react';
import { SuccessDialog } from './dialog-manager';

interface PromoteUserDialogProps {
  trigger: ReactNode;
  userName: string;
  userEmail: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function PromoteUserDialog({
  trigger,
  userName,
  userEmail,
  onConfirm,
  isLoading = false
}: PromoteUserDialogProps) {
  return (
    <SuccessDialog
      trigger={trigger}
      title="Promovér til administrator"
      primaryAction={{
        label: "Promovér til admin",
        onClick: onConfirm,
        colorScheme: "sage",
        isLoading: isLoading,
        loadingText: "Promoverer..."
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
          Er du sikker på, at du vil promovere <strong>{userName}</strong> ({userEmail}) til administrator?
        </Text>
        
        <Text 
          color="green.700" 
          fontSize="xs" 
          fontWeight="medium" 
          bg="green.50" 
          p={2.5} 
          borderRadius="md"
          borderLeft="3px solid"
          borderLeftColor="green.300"
          lineHeight="1.4"
        >
          Som administrator kan brugeren invitere andre og administrere barnet.
        </Text>
      </VStack>
    </SuccessDialog>
  );
}
