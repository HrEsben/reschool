"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Flex,
  Heading,
} from '@chakra-ui/react';
import { showToast } from '@/components/ui/simple-toast';
import { DialogManager } from '@/components/ui/dialog-manager';
import { ToggleTip } from '@/components/ui/toggle-tip';
import { SettingsIcon, TrashIcon } from '@/components/ui/icons';
import { SmileyTimeline, SmileyTimelineRef } from '@/components/smiley/smiley-timeline';
import { SmileySelectionDialog } from './smiley-selection-dialog';
import { useQuery } from '@tanstack/react-query';

interface DagensSmileyEntry {
  id: number;
  smileyId: number;
  recordedBy: number;
  entryDate: string;
  selectedEmoji: string;
  reasoning?: string;
  createdAt: string;
  updatedAt: string;
}

interface AccessUser {
  user_id: number;
  display_name: string;
  email: string;
}

interface DagensSmiley {
  id: number;
  childId: number;
  createdBy: number;
  topic: string;
  description?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
  latestEntry?: DagensSmileyEntry;
  recordedByName?: string;
}

interface DagensSmileyCardProps {
  smiley: DagensSmiley;
  onEntryRecorded: () => void;
  onSmileyDeleted?: () => void;
  onSmileyEdit?: (smiley: DagensSmiley) => void;
  currentUserId?: number;
  isUserAdmin?: boolean;
  onSmileyUpdated?: () => void;
}

export function DagensSmileyCard({ 
  smiley, 
  onEntryRecorded, 
  onSmileyDeleted, 
  onSmileyEdit, 
  currentUserId, // eslint-disable-line @typescript-eslint/no-unused-vars
  isUserAdmin, 
  onSmileyUpdated // eslint-disable-line @typescript-eslint/no-unused-vars
}: DagensSmileyCardProps) {
  const [loading, setLoading] = useState(false);
  const [deletingSmiley, setDeletingSmiley] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [accessUsers, setAccessUsers] = useState<AccessUser[]>([]);
  const [accessDataLoaded, setAccessDataLoaded] = useState(false);
  const timelineRef = useRef<SmileyTimelineRef>(null);

  // Fetch entries for the timeline
  const { data: entries = [], refetch: refetchEntries } = useQuery({
    queryKey: ['dagens-smiley-entries', smiley.id],
    queryFn: async () => {
      const response = await fetch(`/api/dagens-smiley/${smiley.id}/entries`);
      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }
      return response.json();
    }
  });

  // Fetch access data when needed (for lazy loading on hover/click)
  const fetchAccessData = async () => {
    if (accessDataLoaded || smiley.isPublic) return;
    
    try {
      const response = await fetch(`/api/dagens-smiley/${smiley.id}/access`);
      if (response.ok) {
        const data = await response.json();
        setAccessUsers(data.accessUsers || []);
      }
    } catch (error) {
      console.error('Error fetching access data:', error);
    } finally {
      setAccessDataLoaded(true);
    }
  };

  // Handle dialog submission
  const handleSmileySubmit = async (selectedEmoji: string, reasoning: string) => {
    if (!selectedEmoji) {
      showToast({
        title: 'Fejl',
        description: 'Vælg venligst en smiley',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/dagens-smiley/${smiley.id}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedEmoji,
          reasoning: reasoning.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record entry');
      }

      showToast({
        title: 'Succes',
        description: 'Din smiley er gemt!',
        type: 'success',
        duration: 3000,
      });

      // Refresh timeline and entries
      if (timelineRef.current) {
        timelineRef.current.refresh();
      }
      refetchEntries();

      // Notify parent component
      if (onEntryRecorded) {
        onEntryRecorded();
      }
    } catch (error) {
      console.error('Error recording entry:', error);
      showToast({
        title: 'Fejl',
        description: 'Kunne ikke gemme din smiley',
        type: 'error',
        duration: 3000,
      });
      throw error; // Re-throw to prevent dialog from closing
    } finally {
      setLoading(false);
    }
  };

  const handleEditSmiley = () => {
    if (onSmileyEdit) {
      onSmileyEdit(smiley);
    }
  };

  const handleDeleteSmiley = async () => {
    setDeletingSmiley(true);
    try {
      const response = await fetch(`/api/dagens-smiley/${smiley.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete smiley');
      }

      showToast({
        title: 'Succes',
        description: 'Dagens smiley slettet',
        type: 'success',
        duration: 3000,
      });

      setShowDeleteDialog(false);
      if (onSmileyDeleted) {
        onSmileyDeleted();
      }
    } catch (error) {
      console.error('Error deleting smiley:', error);
      showToast({
        title: 'Fejl',
        description: 'Kunne ikke slette dagens smiley',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setDeletingSmiley(false);
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    try {
      const response = await fetch(`/api/dagens-smiley/${smiley.id}/entries/${entryId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      showToast({
        title: 'Succes',
        description: 'Registrering slettet',
        type: 'success',
        duration: 3000,
      });

      // Refresh timeline
      if (timelineRef.current) {
        timelineRef.current.refresh();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      showToast({
        title: 'Fejl',
        description: 'Kunne ikke slette registrering',
        type: 'error',
        duration: 3000,
      });
    }
  };

  // Get visibility info for display
  const getVisibilityInfo = () => {
    if (smiley.isPublic) {
      return {
        text: 'Alle voksne',
        bg: 'green.100',
        color: 'green.700',
        borderColor: 'green.200'
      };
    }

    // For non-public smileys, we need access data
    if (!accessDataLoaded) {
      fetchAccessData();
      return {
        text: 'Begrænset adgang',
        bg: 'orange.100',
        color: 'orange.700',
        borderColor: 'orange.200'
      };
    }

    // Check if it's creator-only (no specific access users)
    if (accessUsers.length === 0) {
      return {
        text: 'Kun dig',
        bg: 'blue.100',
        color: 'blue.700',
        borderColor: 'blue.200'
      };
    }

    // Show number of users with access
    if (accessUsers.length > 0) {
      const count = accessUsers.length;
      const text = count === 1 ? `${count} voksen` : `${count} voksne`;
      return {
        text,
        bg: 'orange.100',
        color: 'orange.700',
        borderColor: 'orange.200'
      };
    }

    // Fallback
    return {
      text: 'Begrænset adgang',
      bg: 'orange.100',
      color: 'orange.700',
      borderColor: 'orange.200'
    };
  };

  // Get formatted user names for ToggleTip content
  const getToggleTipContent = () => {
    if (smiley.isPublic) {
      return (
        <VStack gap={1} align="start">
          <Text fontSize="sm" fontWeight="medium" color="gray.700">Alle voksne</Text>
          <Text fontSize="xs" color="gray.500">Alle voksne tilknyttet barnet kan se dette værktøj</Text>
        </VStack>
      );
    }

    if (!accessDataLoaded) {
      return (
        <Text fontSize="sm" color="gray.600">Indlæser adgangsoplysninger...</Text>
      );
    }

    if (accessUsers.length === 0) {
      return (
        <VStack gap={1} align="start">
          <Text fontSize="sm" fontWeight="medium" color="gray.700">Kun dig</Text>
          <Text fontSize="xs" color="gray.500">Kun du kan se dette værktøj</Text>
        </VStack>
      );
    }

    const maxShow = 5;
    const showUsers = accessUsers.slice(0, maxShow);
    const remaining = accessUsers.length - maxShow;

    return (
      <VStack gap={1} align="start">
        <Text fontSize="sm" fontWeight="medium" color="gray.700">Har adgang:</Text>
        {showUsers.map((user, index) => (
          <Text key={index} fontSize="xs" color="gray.600">{user.display_name}</Text>
        ))}
        {remaining > 0 && (
          <Text fontSize="xs" color="gray.500">+{remaining} flere</Text>
        )}
      </VStack>
    );
  };

  const visibilityInfo = getVisibilityInfo();

  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="xl"
      bg="white"
      shadow="sm"
      _hover={{ shadow: "md" }}
      transition="all 0.2s"
      overflow="hidden"
    >
      {/* Header */}
      <Box bg="cream.50" px={6} py={4} borderBottomWidth="1px" borderBottomColor="gray.100">
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <VStack align="start" gap={1} flex={1} minW={0}>
            <Heading 
              size="md" 
              color="navy.800"
              lineClamp={1}
              wordBreak="break-word"
            >
              {smiley.topic}
            </Heading>
            {smiley.description && (
              <Text fontSize="sm" color="gray.600" lineClamp={2}>
                {smiley.description}
              </Text>
            )}
          </VStack>
          <HStack gap={2}>
            {/* Visibility Badge */}
            <ToggleTip 
              content={getToggleTipContent()}
              onOpenChange={(open) => { if (open) fetchAccessData(); }}
            >
              <Box
                as="button"
                px={2}
                py={1}
                borderRadius="md"
                bg={visibilityInfo.bg}
                color={visibilityInfo.color}
                border="1px solid"
                borderColor={visibilityInfo.borderColor}
                fontSize="xs"
                fontWeight="medium"
                cursor="help"
                _hover={{ opacity: 0.8 }}
              >
                {visibilityInfo.text}
              </Box>
            </ToggleTip>

            {isUserAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditSmiley}
                  title="Rediger dagens smiley"
                  p={1}
                  minW="auto"
                  color="navy.600"
                  _hover={{ bg: "navy.50", color: "navy.700" }}
                >
                  <SettingsIcon size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  title="Slet dagens smiley"
                  p={1}
                  minW="auto"
                  color="red.600"
                  _hover={{ bg: "red.50", color: "red.700" }}
                >
                  <TrashIcon size={16} />
                </Button>
              </>
            )}
          </HStack>
        </Flex>
      </Box>

      {/* Content */}
      <Box p={6}>
        <VStack gap={6} align="stretch">
          {/* Latest Entry Display */}
          {smiley.latestEntry && (
            <Box
              bg="sage.50"
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="sage.200"
            >
              <VStack gap={2} align="start">
                <HStack gap={2} align="center">
                  <Text fontSize="sm" fontWeight="medium" color="sage.700">
                    Seneste valg:
                  </Text>
                  <Text fontSize="2xl">{smiley.latestEntry.selectedEmoji}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {new Date(smiley.latestEntry.entryDate).toLocaleDateString('da-DK')}
                  </Text>
                </HStack>
                {smiley.latestEntry.reasoning && (
                  <Text fontSize="sm" color="gray.700">
                    <strong>Begrundelse:</strong> {smiley.latestEntry.reasoning}
                  </Text>
                )}
                {smiley.recordedByName && (
                  <Text fontSize="xs" color="gray.500">
                    Registreret af: {smiley.recordedByName}
                  </Text>
                )}
              </VStack>
            </Box>
          )}

          {/* Add New Entry Button with Dialog */}
          <SmileySelectionDialog
            trigger={
              <Button
                colorScheme="blue"
                size="lg"
                width="100%"
                _hover={{
                  transform: "scale(1.02)"
                }}
                transition="all 0.2s"
              >
                Tilføj dagens smiley
              </Button>
            }
            smileyTopic={smiley.topic}
            onSubmit={handleSmileySubmit}
            loading={loading}
          />

          {/* Timeline */}
          <SmileyTimeline
            ref={timelineRef}
            entries={entries}
            smiley={smiley}
            canDelete={isUserAdmin}
            onDeleteEntry={handleDeleteEntry}
          />
        </VStack>
      </Box>

      {/* Delete Dialog */}
      <DialogManager
        trigger={<></>}
        title="Slet dagens smiley"
        type="error"
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        primaryAction={{
          label: deletingSmiley ? "Sletter..." : "Slet",
          onClick: handleDeleteSmiley,
          isLoading: deletingSmiley,
          colorScheme: "red"
        }}
        secondaryAction={{
          label: "Annuller",
          onClick: () => setShowDeleteDialog(false),
          colorScheme: "gray"
        }}
      >
        <VStack gap={4} align="start">
          <Text>
            Er du sikker på, at du vil slette <strong>&ldquo;{smiley.topic}&rdquo;</strong>?
          </Text>
          <Text fontSize="sm" color="gray.600">
            Dette vil slette værktøjet og alle tilhørende indgange permanent. 
            Denne handling kan ikke fortrydes.
          </Text>
        </VStack>
      </DialogManager>
    </Box>
  );
}
