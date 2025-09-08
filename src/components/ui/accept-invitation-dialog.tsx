'use client';

import { DialogManager } from './dialog-manager';
import { Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@/components/ui/simple-toast';

interface AcceptInvitationDialogProps {
  trigger: React.ReactNode;
  invitationToken: string;
  childName: string;
  inviterName: string;
  onAccept?: () => void;
}

export function AcceptInvitationDialog({
  trigger,
  invitationToken,
  childName,
  inviterName,
  onAccept
}: AcceptInvitationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/invitations/${invitationToken}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        showToast({
          title: 'Invitation accepteret!',
          description: `Du har nu adgang til ${childName}`,
          type: 'success'
        });

        onAccept?.();
        
        // Redirect to the child's page
        if (data.childSlug) {
          router.push(`/children/${data.childSlug}`);
        } else {
          router.push('/dashboard');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunne ikke acceptere invitation');
      }
    } catch (error) {
      console.error('Error accepting invitation:', error);
      showToast({
        title: 'Fejl',
        description: error instanceof Error ? error.message : 'Der opstod en fejl ved accept af invitationen',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogManager
      trigger={trigger}
      title="Acceptér invitation"
      type="info"
      primaryAction={{
        label: 'Acceptér',
        onClick: handleAccept,
        isLoading,
        loadingText: 'Accepterer...',
        colorScheme: 'blue'
      }}
      secondaryAction={{
        label: 'Annuller',
        onClick: () => {},
        variant: 'outline'
      }}
    >
      <VStack align="start" gap={4}>
        <Text>
          <strong>{inviterName}</strong> har inviteret dig til at følge <strong>{childName}</strong>.
        </Text>
        <Text color="gray.600" fontSize="sm">
          Vil du acceptere denne invitation? Du vil få adgang til at se barnets udvikling og tilføje observationer.
        </Text>
      </VStack>
    </DialogManager>
  );
}
