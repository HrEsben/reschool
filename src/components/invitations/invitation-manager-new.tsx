"use client";

import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Icon,
  Badge,
  Skeleton
} from '@chakra-ui/react';
import { AcceptInvitationDialog } from '@/components/ui/accept-invitation-dialog';
import { DialogManager } from '@/components/ui/dialog-manager';
import { usePendingInvitations, useDeclineInvitation } from '@/lib/queries';

export function InvitationManager() {
  const { data: invitations = [], isLoading } = usePendingInvitations();
  const declineInvitation = useDeclineInvitation();

  const handleDeclineInvitation = async (invitationId: number) => {
    try {
      await declineInvitation.mutateAsync(invitationId);
    } catch (error) {
      console.error('Error declining invitation:', error);
    }
  };

  const handleInvitationAccepted = () => {
    // TanStack Query will automatically refresh due to cache invalidation
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Don't show the section at all if no invitations and not loading
  if (!isLoading && invitations.length === 0) {
    return null;
  }

  return (
    <Box>
      <VStack gap={4} align="stretch">
        <Box>
          <HStack justify="space-between" align="center">
            <Heading size="lg" color="fg.default" fontWeight="600">
              Afventende invitationer
            </Heading>
            {!isLoading && invitations.length > 0 && (
              <Badge colorScheme="orange" size="lg">
                {invitations.length}
              </Badge>
            )}
          </HStack>
          <Box className="w-16 h-1 bg-cambridge-blue-500 rounded-full mt-2"></Box>
        </Box>

        {isLoading ? (
          <VStack gap={3} align="stretch">
            {[1, 2].map((i) => (
              <Card.Root key={i} variant="outline" size="sm">
                <Card.Body p={4}>
                  <HStack justify="space-between" align="center">
                    <VStack align="start" gap={1} flex={1}>
                      <Skeleton height="20px" width="70%" />
                      <Skeleton height="16px" width="50%" />
                      <Skeleton height="14px" width="40%" />
                    </VStack>
                    <HStack gap={2}>
                      <Skeleton height="32px" width="60px" />
                      <Skeleton height="32px" width="80px" />
                    </HStack>
                  </HStack>
                </Card.Body>
              </Card.Root>
            ))}
          </VStack>
        ) : (
          <VStack gap={3} align="stretch">
            {invitations.map((invitation) => (
              <Card.Root key={invitation.id} variant="outline" size="sm">
                <Card.Body p={4}>
                  <HStack justify="space-between" align="center">
                    <VStack align="start" gap={1} flex={1}>
                      <HStack gap={2}>
                        <Icon color="sage.500">
                          <svg fill="currentColor" viewBox="0 0 20 20" width="20" height="20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </Icon>
                        <Text fontWeight="600" color="fg.default">
                          Invitation til at følge {invitation.childName}
                        </Text>
                      </HStack>
                      
                      <Text color="fg.muted" fontSize="sm">
                        Fra {invitation.inviterName} ({invitation.inviterRelation})
                      </Text>
                      
                      <Text color="fg.muted" fontSize="xs">
                        Som {invitation.customRelationName || invitation.relation} • {formatDate(invitation.createdAt)}
                      </Text>
                    </VStack>

                    <HStack gap={2}>
                      <DialogManager
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            colorScheme="red"
                            loading={declineInvitation.isPending}
                            loadingText="Afviser..."
                          >
                            Afvis
                          </Button>
                        }
                        title="Afvis invitation"
                        primaryAction={{
                          label: 'Afvis invitation',
                          onClick: () => handleDeclineInvitation(invitation.id),
                          colorScheme: 'red'
                        }}
                        secondaryAction={{
                          label: 'Annuller',
                          variant: 'outline',
                          onClick: () => {} // Close dialog action is handled by DialogManager
                        }}
                      >
                        <Text>
                          Er du sikker på, at du vil afvise invitationen til at følge {invitation.childName}?
                        </Text>
                      </DialogManager>

                      <AcceptInvitationDialog
                        trigger={
                          <Button
                            size="sm"
                            bg="sage.500"
                            color="white"
                            _hover={{ bg: "sage.600" }}
                          >
                            Acceptér
                          </Button>
                        }
                        invitationToken={invitation.token}
                        childName={invitation.childName}
                        inviterName={invitation.inviterName}
                        onAccept={handleInvitationAccepted}
                      />
                    </HStack>
                  </HStack>
                </Card.Body>
              </Card.Root>
            ))}
          </VStack>
        )}
      </VStack>
    </Box>
  );
}
