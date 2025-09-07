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
  Icon,
  Card,
  Span,
  Badge,
} from '@chakra-ui/react';
import { Avatar } from '@chakra-ui/react';
import { TrashIcon } from '@/components/ui/icons';
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

  // Group entries by date
  const groupEntriesByDate = (entries: BarometerEntry[]) => {
    const grouped: { [key: string]: BarometerEntry[] } = {};
    entries.forEach(entry => {
      const dateKey = entry.entryDate;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });
    return grouped;
  };

  const formatDateForDisplay = (dateString: string) => {
    try {
      // Handle both date-only strings and full datetime strings
      const date = dateString.includes('T') 
        ? new Date(dateString)
        : new Date(dateString + 'T12:00:00'); // Use noon to avoid timezone issues
      
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if parsing fails
      }
      
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'I dag';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'I går';
      } else {
        return date.toLocaleDateString('da-DK', {
          day: 'numeric',
          month: 'long',
          year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        });
      }
    } catch (error) {
      console.warn('Error formatting date:', error);
      return dateString; // Return original string as fallback
    }
  };

  const formatTime = (dateString: string) => {
    try {
      // Handle both date-only strings and full datetime strings
      const date = dateString.includes('T') 
        ? new Date(dateString)
        : new Date(dateString + 'T12:00:00'); // Use noon to avoid timezone issues
      
      if (isNaN(date.getTime())) {
        return '12:00'; // Fallback time
      }
      
      return date.toLocaleTimeString('da-DK', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.warn('Error formatting time:', error);
      return '12:00'; // Fallback time
    }
  };

  if (loading) {
    return (
      <Box p={4} bg="cream.25" borderRadius="lg" border="1px solid" borderColor="cream.200">
        <HStack>
          <Spinner size="sm" color="sage.500" />
          <Text fontSize="sm" color="navy.600">Henter registreringer...</Text>
        </HStack>
      </Box>
    );
  }

  if (entries.length === 0) {
    return (
      <Box p={4} bg="cream.25" borderRadius="lg" border="1px solid" borderColor="cream.200">
        <VStack gap={2}>
          <Icon fontSize="2xl" color="sage.400">
            📊
          </Icon>
          <Text fontSize="sm" color="navy.600" textAlign="center">
            Ingen registreringer endnu
          </Text>
          <Text fontSize="xs" color="gray.500" textAlign="center">
            Start med at lave din første vurdering
          </Text>
        </VStack>
      </Box>
    );
  }

  const groupedEntries = groupEntriesByDate(entries);
  const sortedDates = Object.keys(groupedEntries).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <Box p={4} bg="cream.25" borderRadius="lg" border="1px solid" borderColor="cream.200">
      <Text fontSize="sm" color="navy.700" mb={4} fontWeight="semibold">
        Seneste registreringer
      </Text>
      
      <Timeline.Root size="lg" variant="subtle" maxW="full">
        {sortedDates.map((date) => {
          const dateEntries = groupedEntries[date].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          return dateEntries.map((entry, entryIndex) => (
            <Timeline.Item key={`${date}-${entry.id}`}>
              <Timeline.Connector>
                <Timeline.Separator />
                <Timeline.Indicator 
                  bg={getRatingColor(entry.rating)} 
                  color="white"
                  border="2px solid white"
                  boxShadow="0 0 0 1px var(--chakra-colors-cream-300)"
                >
                  {barometer.displayType === 'smileys' ? (
                    <Text fontSize="xs">
                      {getSmileyForRating(entry.rating)}
                    </Text>
                  ) : (
                    <Text fontSize="xs" fontWeight="bold">
                      {getDisplayValue()(entry.rating)}
                    </Text>
                  )}
                </Timeline.Indicator>
              </Timeline.Connector>
              
              <Timeline.Content gap={3}>
                <Timeline.Title>
                  <HStack justify="space-between" w="full">
                    <HStack gap={2}>
                      <Avatar.Root size="2xs">
                        <Avatar.Fallback bg="sage.100" color="sage.700">
                          {(entry.recordedByName || 'A').charAt(0).toUpperCase()}
                        </Avatar.Fallback>
                      </Avatar.Root>
                      
                      <Text fontWeight="semibold" color="navy.700">
                        {entry.recordedByName || 'Anonym'}
                      </Text>
                      
                      <Span color="gray.500">vurderede</Span>
                      
                      <Badge 
                        colorScheme="sage" 
                        variant="subtle"
                        fontSize="xs"
                        fontWeight="bold"
                      >
                        {barometer.displayType === 'smileys' 
                          ? getSmileyForRating(entry.rating)
                          : getDisplayValue()(entry.rating)
                        }
                      </Badge>
                      
                      <Span color="gray.500">
                        {entryIndex === 0 ? formatDateForDisplay(date) : 'samme dag'}
                      </Span>
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
                        <TrashIcon size="xs" />
                      </Button>
                    )}
                  </HStack>
                </Timeline.Title>
                
                {/* Comment Card */}
                {entry.comment && (
                  <Card.Root size="sm" variant="subtle" bg="white" borderColor="cream.300">
                    <Card.Body>
                      <Text fontSize="sm" lineHeight="tall" color="navy.600">
                        &ldquo;{entry.comment}&rdquo;
                      </Text>
                    </Card.Body>
                    <Card.Footer pt={2} pb={3}>
                      <HStack gap={2}>
                        <Text fontSize="xs" color="gray.500">
                          {formatTime(entry.createdAt)}
                        </Text>
                        {entry.updatedAt !== entry.createdAt && (
                          <Badge size="xs" variant="outline" colorScheme="golden">
                            Redigeret
                          </Badge>
                        )}
                      </HStack>
                    </Card.Footer>
                  </Card.Root>
                )}
              </Timeline.Content>
            </Timeline.Item>
          ));
        })}
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
