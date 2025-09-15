"use client";

import { useState, useRef } from 'react';
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
import { VisibilityBadge } from '@/components/ui/visibility-badge';
import { SettingsIcon, TrashIcon } from '@/components/ui/icons';
import { OpenMojiEmoji } from '@/components/ui/openmoji-emoji';
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
  childName: string;
}

export function DagensSmileyCard({ 
  smiley, 
  onEntryRecorded, 
  onSmileyDeleted, 
  onSmileyEdit, 
  currentUserId, // eslint-disable-line @typescript-eslint/no-unused-vars
  isUserAdmin, 
  onSmileyUpdated, // eslint-disable-line @typescript-eslint/no-unused-vars
  childName
}: DagensSmileyCardProps) {
  const [loading, setLoading] = useState(false);
  const [deletingSmiley, setDeletingSmiley] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [accessUsers, setAccessUsers] = useState<AccessUser[]>([]);
  const [accessDataLoaded, setAccessDataLoaded] = useState(false);
  const timelineRef = useRef<SmileyTimelineRef>(null);

  // Fetch entries for the timeline
  const { data: entriesData, refetch: refetchEntries } = useQuery({
    queryKey: ['dagens-smiley-entries', smiley.id],
    queryFn: async () => {
      const response = await fetch(`/api/dagens-smiley/${smiley.id}/entries`);
      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }
      return response.json();
    }
  });

  // Extract entries array from the response
  const entries = entriesData?.entries || [];

  // Helper function to get today's date in YYYY-MM-DD format (local timezone)
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to get today's entry - check both sources
  const getTodaysEntry = () => {
    const todayString = getTodayDateString();
    
    // First check entries from the timeline query
    const timelineEntry = entries.find((entry: DagensSmileyEntry) => {
      // Convert entry date to local date string to match our comparison
      const entryDate = new Date(entry.entryDate);
      const entryDateString = `${entryDate.getFullYear()}-${String(entryDate.getMonth() + 1).padStart(2, '0')}-${String(entryDate.getDate()).padStart(2, '0')}`;
      return entryDateString === todayString;
    });
    
    if (timelineEntry) return timelineEntry;
    
    // Also check if the smiley's latestEntry is for today
    if (smiley.latestEntry) {
      const latestDate = new Date(smiley.latestEntry.entryDate);
      const latestDateString = `${latestDate.getFullYear()}-${String(latestDate.getMonth() + 1).padStart(2, '0')}-${String(latestDate.getDate()).padStart(2, '0')}`;
      if (latestDateString === todayString) {
        return smiley.latestEntry;
      }
    }
    
    return null;
  };

  // Helper function to format today's date in Danish
  const getFormattedTodayDate = () => {
    const today = new Date();
    const days = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
    const months = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 
                   'juli', 'august', 'september', 'oktober', 'november', 'december'];
    
    const dayName = days[today.getDay()];
    const day = today.getDate();
    const monthName = months[today.getMonth()];
    
    return `${dayName} d. ${day}. ${monthName}`;
  };

  const todaysEntry = getTodaysEntry();

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
      <Box 
        bg="linear-gradient(135deg, #f9f6f0 0%, #f2ebd9 50%, #e6d4b1 100%)" 
        px={6} 
        py={4} 
        borderBottomWidth="1px" 
        borderBottomColor="cream.200"
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <VStack align="start" gap={1} flex={1} minW={0}>
            <Flex align="center" gap={3} wrap="wrap">
              <Heading size="md" color="gray.800">{smiley.topic}</Heading>
              <Text fontSize="sm" fontWeight="medium" color="gray.600">
                {getFormattedTodayDate()}
              </Text>
            </Flex>
            {smiley.description && (
              <Text fontSize="sm" color="gray.700">
                {smiley.description}
              </Text>
            )}
          </VStack>
          
          <HStack gap={2} flexShrink={0}>
            {/* Visibility Badge */}
            <VisibilityBadge
              isPublic={smiley.isPublic}
              accessUsers={accessUsers}
              fetchAccessData={fetchAccessData}
              accessDataLoaded={accessDataLoaded}
            />

            {/* Action Buttons */}
            {isUserAdmin && (
              <HStack gap={1}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditSmiley}
                  title="Rediger dagens smiley"
                  p={1}
                  minW="auto"
                  color="sage.600"
                  _hover={{ bg: "sage.50", color: "sage.700" }}
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
              </HStack>
            )}
          </HStack>
        </Flex>
      </Box>

      {/* Content */}
      <Box p={6}>
        <VStack gap={6} align="stretch">
          {/* Today's Status Display */}
          {todaysEntry ? (
            // Show today's selected smiley with reasoning
            <Box
              bg="sage.50"
              p={6}
              borderRadius="lg"
              border="1px solid"
              borderColor="sage.200"
              textAlign="center"
            >
              <VStack gap={4} align="center">
                <Text fontSize="md" fontWeight="medium" color="sage.700">
                  Dagens valg:
                </Text>
                <OpenMojiEmoji 
                  unicode={todaysEntry.selectedEmoji} 
                  size={96}
                />
                {todaysEntry.reasoning && (
                  <Text fontSize="md" color="gray.700" textAlign="center">
                    {todaysEntry.reasoning}
                  </Text>
                )}
              </VStack>
            </Box>
          ) : (
            // Show prompt when no smiley is selected today
            <Box
              bg="cream.50"
              p={6}
              borderRadius="lg"
              border="1px solid"
              borderColor="cream.200"
              textAlign="center"
            >
              <Text fontSize="lg" fontWeight="medium" color="navy.700" mb={2}>
                Ingen smiley valgt endnu
              </Text>
              <Text fontSize="md" color="gray.600">
                Vælg en smiley for at beskrive hvordan det går i dag
              </Text>
            </Box>
          )}

          {/* Add New Entry Button with Dialog */}
          <SmileySelectionDialog
            trigger={
              <Button
                bg="sage.500"
                color="white"
                _hover={{ bg: "sage.600" }}
                size="lg"
                width="100%"
                _active={{
                  transform: "scale(1.02)"
                }}
                transition="all 0.2s"
              >
                {todaysEntry ? "Ændr dagens smiley" : "Vælg smiley"}
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
            childName={childName}
          />
        </VStack>
      </Box>

      {/* Delete Dialog */}
      <DialogManager
        trigger={<div style={{ display: 'none' }} />}
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
