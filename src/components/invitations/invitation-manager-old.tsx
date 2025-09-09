"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  Icon,
  Spinner,
  Badge
} from '@chakra-ui/react';
import { AcceptInvitationDialog } from '@/components/ui/accept-invitation-dialog';
import { DialogManager } from '@/components/ui/dialog-manager';

interface PendingInvitation {
  id: number;
  email: string;
  childId: number;
  childName: string;
  childSlug: string;
  invitedBy: number;
  relation: string;
  customRelationName?: string;
  token: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  inviterName: string;
  inviterRelation: string;
}

export function InvitationManager() {
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [decliningId, setDecliningId] = useState<number | null>(null);

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/invitations/pending', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setInvitations(data.invitations);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
  }, []);

  const handleDeclineInvitation = async (invitationId: number) => {
    setDecliningId(invitationId);
    try {
      const response = await fetch('/api/invitations/decline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ invitationId }),
      });

      if (response.ok) {
        // Remove the declined invitation from the list
        setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
      } else {
        console.error('Failed to decline invitation');
      }
    } catch (error) {
      console.error('Error declining invitation:', error);
    } finally {
      setDecliningId(null);
    }
  };

  const handleInvitationAccepted = () => {
    // Refresh the invitations list
    fetchInvitations();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('da-DK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" color="sage.500" />
        <Text mt={2} color="fg.muted">Indlæser invitationer...</Text>
      </Box>
    );
  }

  if (invitations.length === 0) {
    return null; // Don't show the section if there are no pending invitations
  }

  return (
    <Box>
      <VStack gap={4} align="stretch">
        <Box>
          <HStack justify="space-between" align="center">
            <Heading size="lg" color="fg.default" fontWeight="600">
              Afventende invitationer
            </Heading>
            <Badge colorScheme="orange" size="lg">
              {invitations.length}
            </Badge>
          </HStack>
          <Box className="w-16 h-1 bg-cambridge-blue-500 rounded-full mt-2"></Box>
        </Box>

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
                          disabled={decliningId === invitation.id}
                          loading={decliningId === invitation.id}
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
      </VStack>
    </Box>
  );
}
