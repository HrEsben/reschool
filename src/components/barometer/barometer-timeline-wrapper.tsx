"use client";

import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { Box, Text, Spinner } from '@chakra-ui/react';
import { ModernTimeline, ModernTimelineRef } from './modern-timeline';
import { showToast } from '@/components/ui/simple-toast';

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
  userRelation?: string;
  customRelationName?: string;
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
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BarometerTimelineProps {
  barometer: Barometer;
  maxEntries?: number;
  currentUserId?: number;
  isUserAdmin?: boolean;
  onEntryDeleted?: () => void;
}

export interface BarometerTimelineRef {
  refresh: () => void;
}

export const BarometerTimeline = forwardRef<BarometerTimelineRef, BarometerTimelineProps>(
  ({ barometer, maxEntries = 10, currentUserId, isUserAdmin = false, onEntryDeleted }, ref) => {
    const [entries, setEntries] = useState<BarometerEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const timelineRef = React.useRef<ModernTimelineRef>(null);

    const fetchEntries = useCallback(async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/barometers/${barometer.id}/entries`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch entries');
        }
        
        const data = await response.json();
        const entriesArray = data.entries || [];
        setEntries(entriesArray.slice(0, maxEntries));
      } catch (error) {
        console.error('Error fetching barometer entries:', error);
        showToast({
          title: 'Fejl',
          description: 'Kunne ikke hente registreringer',
          type: 'error',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    }, [barometer.id, maxEntries]);

    useEffect(() => {
      fetchEntries();
    }, [fetchEntries]);

    useImperativeHandle(ref, () => ({
      refresh: () => {
        fetchEntries();
        timelineRef.current?.refresh();
      }
    }));

    const handleDeleteEntry = async (entryId: number) => {
      try {
        const response = await fetch(`/api/barometers/${barometer.id}/entries/${entryId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete entry');
        }

        showToast({
          title: 'Registrering slettet',
          description: 'Registreringen er blevet slettet',
          type: 'success',
          duration: 3000,
        });

        // Refresh entries
        await fetchEntries();
        
        // Notify parent component
        if (onEntryDeleted) {
          onEntryDeleted();
        }
      } catch (error) {
        console.error('Error deleting entry:', error);
        showToast({
          title: 'Fejl',
          description: error instanceof Error ? error.message : 'Kunne ikke slette registrering',
          type: 'error',
          duration: 5000,
        });
      }
    };

    // Determine if user can delete entries
    const canDelete = isUserAdmin || entries.some(entry => entry.recordedBy === currentUserId);

    if (loading) {
      return (
        <Box 
          p={6} 
          textAlign="center" 
          bg="bg.subtle" 
          borderRadius="xl" 
          border="1px solid" 
          borderColor="gray.200"
        >
          <Spinner size="sm" colorPalette="navy" />
          <Text fontSize="sm" color="gray.500" mt={2}>
            Indlæser registreringer...
          </Text>
        </Box>
      );
    }

    return (
      <ModernTimeline
        ref={timelineRef}
        entries={entries}
        barometer={barometer}
        onDeleteEntry={canDelete ? handleDeleteEntry : undefined}
        canDelete={canDelete}
        limit={maxEntries}
      />
    );
  }
);

BarometerTimeline.displayName = 'BarometerTimeline';
