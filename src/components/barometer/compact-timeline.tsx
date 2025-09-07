"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Timeline,
  Spinner,
  Button,
  Textarea,
  Icon,
} from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/react';
import { MdEdit, MdSave, MdClose, MdDelete } from 'react-icons/md';
import { showToast } from '@/components/ui/simple-toast';
import { DialogManager } from '@/components/ui/dialog-manager';

interface BarometerEntry {
  id: number;
  barometerId: number;
  recordedBy: number;
  entryDate: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  recordedByName?: string;
}

interface Barometer {
  id: number;
  childId: number;
  createdBy: number;
  topic: string;
  description?: string;
  scaleMin: number;
  scaleMax: number;
  displayType: string;
  smileyType?: string;
  createdAt: string;
  updatedAt: string;
}

interface CompactTimelineProps {
  barometer: Barometer;
  maxEntries?: number;
  refreshTrigger?: number; // Add this to trigger refresh from parent
  currentUserId?: number;
  isUserAdmin?: boolean;
  onEntryDeleted?: () => void; // Callback when entry is deleted
}

export interface CompactTimelineRef {
  refresh: () => void;
}

export const CompactTimeline = forwardRef<CompactTimelineRef, CompactTimelineProps>(
  ({ barometer, maxEntries = 3, refreshTrigger, currentUserId, isUserAdmin = false, onEntryDeleted }, ref) => {
  const [entries, setEntries] = useState<BarometerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<BarometerEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/barometers/${barometer.id}/entries`);
      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }
      const data = await response.json();
      setEntries(data.entries?.slice(0, maxEntries) || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh function to parent
  useImperativeHandle(ref, () => ({
    refresh: fetchEntries
  }));

  // Check if user can delete entry
  const canDeleteEntry = (entry: BarometerEntry) => {
    if (!currentUserId) return false;
    return isUserAdmin || entry.recordedBy === currentUserId;
  };

  // Handle delete entry
  const handleDeleteEntry = (entry: BarometerEntry) => {
    setEntryToDelete(entry);
    setShowDeleteDialog(true);
  };

  const confirmDeleteEntry = async () => {
    if (!entryToDelete) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/barometers/${barometer.id}/entries/${entryToDelete.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      showToast({
        title: 'Succes',
        description: 'Vurdering slettet',
        type: 'success',
        duration: 3000,
      });

      setShowDeleteDialog(false);
      setEntryToDelete(null);
      fetchEntries(); // Refresh timeline
      onEntryDeleted?.(); // Notify parent
    } catch (error) {
      console.error('Error deleting entry:', error);
      showToast({
        title: 'Fejl',
        description: 'Kunne ikke slette vurdering',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [barometer.id, maxEntries]);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      fetchEntries();
    }
  }, [refreshTrigger]);

  // Calculate color based on rating position in scale
  const getRatingColor = (rating: number) => {
    const range = barometer.scaleMax - barometer.scaleMin;
    const position = (rating - barometer.scaleMin) / range; // 0 to 1
    
    if (position <= 0.5) {
      // Coral to Golden (0 to 0.5)
      const ratio = position * 2; // 0 to 1
      const red = Math.round(224 + (242 - 224) * ratio);
      const green = Math.round(122 + (204 - 122) * ratio);
      const blue = Math.round(95 + (143 - 95) * ratio);
      return `rgb(${red}, ${green}, ${blue})`;
    } else {
      // Golden to Sage (0.5 to 1)
      const ratio = (position - 0.5) * 2; // 0 to 1
      const red = Math.round(242 + (129 - 242) * ratio);
      const green = Math.round(204 + (178 - 204) * ratio);
      const blue = Math.round(143 + (154 - 143) * ratio);
      return `rgb(${red}, ${green}, ${blue})`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  };

  const getDisplayValue = () => {
    switch (barometer.displayType) {
      case 'percentage':
        return (rating: number) => `${rating}%`;
      case 'smileys':
        return (rating: number) => getSmileyForRating(rating);
      default:
        return (rating: number) => rating.toString();
    }
  };

  // Get smiley based on rating and smiley type
  const getSmileyForRating = (rating: number) => {
    const range = barometer.scaleMax - barometer.scaleMin;
    const position = (rating - barometer.scaleMin) / range;
    const smileyType = barometer.smileyType || 'emojis';
    
    if (smileyType === 'emojis') {
      // Traditional emojis for younger children
      if (position <= 0.2) return '😢';
      if (position <= 0.4) return '😟';
      if (position <= 0.6) return '😐';
      if (position <= 0.8) return '😊';
      return '😄';
    }
    
    if (smileyType === 'simple') {
      // For simple icons, we'll use symbols that work in timeline
      if (position <= 0.2) return '☹️';
      if (position <= 0.4) return '😕';
      if (position <= 0.6) return '😐';
      if (position <= 0.8) return '🙂';
      return '😊';
    }
    
    if (smileyType === 'subtle') {
      // Subtle representations
      if (position <= 0.2) return '◐';
      if (position <= 0.4) return '◑';
      if (position <= 0.6) return '◒';
      if (position <= 0.8) return '◓';
      return '●';
    }
    
    // Default fallback
    return rating.toString();
  };

  if (loading) {
    return (
      <Box p={3} bg="gray.50" borderRadius="md">
        <HStack>
          <Spinner size="sm" />
          <Text fontSize="sm" color="gray.600">Henter registreringer...</Text>
        </HStack>
      </Box>
    );
  }

  if (entries.length === 0) {
    return (
      <Box p={3} bg="gray.50" borderRadius="md">
        <Text fontSize="sm" color="gray.600">Ingen registreringer endnu</Text>
      </Box>
    );
  }

  return (
    <Box p={3} bg="gray.50" borderRadius="md">
      <Text fontSize="sm" color="gray.600" mb={3} fontWeight="medium">
        Seneste registreringer
      </Text>
            <Timeline.Root size="sm">
        {entries.map((entry, index) => (
          <Timeline.Item key={entry.id}>
            {/* Content Before - Date */}
            <Timeline.Content width="auto">
              <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
                {formatDate(entry.entryDate)}
              </Text>
            </Timeline.Content>
            
            <Timeline.Separator>
              {/* Avatar or Smiley as Indicator */}
              <Timeline.Indicator>
                {barometer.displayType === 'smileys' ? (
                  <Box
                    bg={getRatingColor(entry.rating)}
                    borderRadius="full"
                    w="24px"
                    h="24px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontSize="sm"
                  >
                    {getSmileyForRating(entry.rating)}
                  </Box>
                ) : (
                  <Avatar.Root size="xs">
                    <Avatar.Image 
                      src={`https://i.pravatar.cc/150?u=${entry.recordedBy}`}
                      alt={entry.recordedByName || 'Anonym'}
                    />
                    <Avatar.Fallback>
                      {(entry.recordedByName || 'A').charAt(0).toUpperCase()}
                    </Avatar.Fallback>
                  </Avatar.Root>
                )}
              </Timeline.Indicator>
              {index < entries.length - 1 && <Timeline.Connector />}
            </Timeline.Separator>
            
            {/* Main Content - Rating and Comment */}
            <Timeline.Content pb={index < entries.length - 1 ? 3 : 0}>
              <VStack align="start" gap={1}>
                {/* Rating and Delete Button Row */}
                <HStack justify="space-between" w="full">
                  <HStack>
                    {barometer.displayType === 'smileys' ? (
                      <Text 
                        fontSize="lg" 
                        lineHeight="1"
                      >
                        {getSmileyForRating(entry.rating)}
                      </Text>
                    ) : (
                      <Text 
                        fontSize="sm" 
                        fontWeight="bold"
                        color={getRatingColor(entry.rating)}
                      >
                        {getDisplayValue()(entry.rating)}
                      </Text>
                    )}
                    {entry.recordedByName && (
                      <Text fontSize="xs" color="gray.500">
                        af {entry.recordedByName}
                      </Text>
                    )}
                  </HStack>
                  
                  {/* Delete Button */}
                  {canDeleteEntry(entry) && (
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => handleDeleteEntry(entry)}
                      color="coral.600"
                      _hover={{ bg: "coral.50", color: "coral.700" }}
                      _focus={{ 
                        bg: "coral.50",
                        boxShadow: "0 0 0 1px var(--chakra-colors-coral-200)",
                        outline: "none"
                      }}
                      title="Slet vurdering"
                      borderRadius="md"
                      p={1}
                      minW="auto"
                    >
                      <Icon>
                        <MdDelete size={12} />
                      </Icon>
                    </Button>
                  )}
                </HStack>
                
                {/* Comment below */}
                {entry.comment && (
                  <Text fontSize="xs" color="gray.600" fontStyle="italic">
                    &ldquo;{entry.comment}&rdquo;
                  </Text>
                )}
              </VStack>
            </Timeline.Content>
          </Timeline.Item>
        ))}
      </Timeline.Root>
      
      {/* Delete Confirmation Dialog */}
      <DialogManager
        trigger={<Button style={{ display: 'none' }}>Hidden Trigger</Button>}
        title="Slet Vurdering"
        primaryAction={{
          label: "Slet",
          onClick: confirmDeleteEntry,
          isLoading: deleting,
          isDisabled: deleting,
          colorScheme: "coral"
        }}
        secondaryAction={{
          label: "Annuller",
          onClick: () => setShowDeleteDialog(false),
          colorScheme: "gray"
        }}
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <VStack gap={4} align="stretch">
          <Text>
            Er du sikker på, at du vil slette denne vurdering?
          </Text>
          {entryToDelete && (
            <Box p={3} bg="cream.50" borderRadius="md" borderLeft="3px solid" borderColor="coral.300">
              <HStack justify="space-between">
                <Text fontSize="sm" fontWeight="medium">
                  {formatDate(entryToDelete.entryDate)}: {getDisplayValue()(entryToDelete.rating)}
                </Text>
              </HStack>
              {entryToDelete.comment && (
                <Text fontSize="xs" color="gray.600" mt={1} fontStyle="italic">
                  &ldquo;{entryToDelete.comment}&rdquo;
                </Text>
              )}
            </Box>
          )}
          <Text fontSize="sm" color="golden.600">
            Denne handling kan ikke fortrydes.
          </Text>
        </VStack>
      </DialogManager>
    </Box>
  );
});

CompactTimeline.displayName = 'CompactTimeline';
