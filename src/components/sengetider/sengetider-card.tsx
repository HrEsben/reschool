"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Flex,
  Textarea,
  Heading,
  Input,
  Badge,
  useBreakpointValue,
} from '@chakra-ui/react';
import { showToast } from '@/components/ui/simple-toast';
import { DialogManager } from '@/components/ui/dialog-manager';
import { ToggleTip } from '@/components/ui/toggle-tip';
import { SengetiderTimeline, SengetiderTimelineHandle } from './sengetider-timeline';
import { SettingsIcon, TrashIcon } from '@/components/ui/icons';

interface SengetiderEntry {
  id: number;
  sengetiderId: number;
  recordedBy: number;
  entryDate: string;
  actualBedtime: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Sengetider {
  id: number;
  childId: number;
  createdBy: number;
  topic: string;
  description?: string;
  targetBedtime?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
  latestEntry?: SengetiderEntry;
  recordedByName?: string;
}

interface SengetiderCardProps {
  sengetider: Sengetider;
  onEntryRecorded: () => void;
  onSengetiderDeleted?: () => void;
  onSengetiderEdit?: (sengetider: Sengetider) => void;
  currentUserId?: number;
  isUserAdmin?: boolean;
  childName?: string;
}

export function SengetiderCard({ 
  sengetider, 
  onEntryRecorded, 
  onSengetiderDeleted, 
  onSengetiderEdit, 
  isUserAdmin,
  childName
}: SengetiderCardProps) {
  const [actualBedtime, setActualBedtime] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingSengetider, setDeletingSengetider] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const timelineRef = useRef<SengetiderTimelineHandle>(null);

  // Responsive sizing  
  const cardPadding = useBreakpointValue({ base: 4, md: 6 });
  const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' }) as 'sm' | 'md';

  // Check if there's an entry for today
  const isToday = (dateString: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const hasEntryToday = sengetider.latestEntry && isToday(sengetider.latestEntry.entryDate);

  // Pre-populate form if there's an entry today
  useEffect(() => {
    if (hasEntryToday && sengetider.latestEntry) {
      // Convert from HH:MM:SS to HH:MM for the input
      const time = sengetider.latestEntry.actualBedtime;
      const formattedTime = time.substring(0, 5); // Get HH:MM part
      setActualBedtime(formattedTime);
      setNotes(sengetider.latestEntry.notes || '');
    }
  }, [hasEntryToday, sengetider.latestEntry]);

  const handleSubmit = async () => {
    if (!actualBedtime.trim()) {
      showToast({
        title: 'Fejl',
        description: 'Indtast venligst sengetid',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(actualBedtime)) {
      showToast({
        title: 'Fejl',
        description: 'Indtast tid i format HH:MM (f.eks. 19:30)',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/sengetider/${sengetider.id}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryDate: new Date().toISOString().split('T')[0], // Today's date
          actualBedtime: `${actualBedtime}:00`, // Convert to HH:MM:SS
          notes: notes.trim() || undefined,
        }),
      });

      if (response.ok) {
        showToast({
          title: 'Succes!',
          description: hasEntryToday ? 'Sengetid opdateret' : 'Sengetid registreret',
          type: 'success',
          duration: 3000,
        });

        // Refresh timeline to show new entry
        timelineRef.current?.refresh();
        onEntryRecorded(); // Update parent component
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record bedtime');
      }
    } catch (error) {
      console.error('Error recording bedtime:', error);
      showToast({
        title: 'Fejl!',
        description: error instanceof Error ? error.message : 'Der opstod en fejl ved registrering af sengetid',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSengetider = async () => {
    setDeletingSengetider(true);

    try {
      const response = await fetch(`/api/sengetider/${sengetider.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast({
          title: 'Succes!',
          description: 'Sengetider-værktøj slettet',
          type: 'success',
          duration: 3000,
        });
        onSengetiderDeleted?.();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete sengetider');
      }
    } catch (error) {
      console.error('Error deleting sengetider:', error);
      showToast({
        title: 'Fejl!',
        description: error instanceof Error ? error.message : 'Der opstod en fejl ved sletning',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setDeletingSengetider(false);
      setShowDeleteDialog(false);
    }
  };

  // Calculate if bedtime was late compared to target
  const getBedtimeStatus = () => {
    if (!sengetider.targetBedtime || !sengetider.latestEntry) return null;
    
    const target = sengetider.targetBedtime.substring(0, 5); // HH:MM
    const actual = sengetider.latestEntry.actualBedtime.substring(0, 5); // HH:MM
    
    const targetMinutes = timeToMinutes(target);
    const actualMinutes = timeToMinutes(actual);
    
    const diffMinutes = actualMinutes - targetMinutes;
    
    if (diffMinutes <= 0) return { status: 'on-time', text: 'I tide', color: 'success' };
    if (diffMinutes <= 15) return { status: 'slightly-late', text: `${diffMinutes} min. sent`, color: 'warning' };
    return { status: 'late', text: `${diffMinutes} min. sent`, color: 'coral' };
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const bedtimeStatus = getBedtimeStatus();

  return (
    <Box 
      bg="bg.surface" 
      borderRadius="xl" 
      border="1px solid" 
      borderColor="border.muted" 
      p={cardPadding}
    >
      <VStack gap={4} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <VStack gap={1} align="start">
            <Heading size="lg" color="sage.600">{sengetider.topic}</Heading>
            {sengetider.description && (
              <Text fontSize="sm" color="gray.600">
                {sengetider.description}
              </Text>
            )}
            {sengetider.targetBedtime && (
              <HStack gap={2}>
                <Text fontSize="sm" color="gray.600">
                  Mål sengetid:
                </Text>
                <Badge colorPalette="navy" variant="subtle" size="sm">
                  {sengetider.targetBedtime.substring(0, 5)}
                </Badge>
              </HStack>
            )}
          </VStack>
          
          {isUserAdmin && (
            <HStack gap={2}>
              <ToggleTip content="Rediger sengetider-værktøj">
                <Button
                  size={buttonSize}
                  variant="ghost"
                  colorPalette="sage"
                  onClick={() => onSengetiderEdit?.(sengetider)}
                  p={2}
                >
                  <SettingsIcon size={18} />
                </Button>
              </ToggleTip>
              <ToggleTip content="Slet sengetider-værktøj">
                <Button
                  size={buttonSize}
                  variant="ghost"
                  colorPalette="red"
                  onClick={() => setShowDeleteDialog(true)}
                  p={2}
                >
                  <TrashIcon size={18} />
                </Button>
              </ToggleTip>
            </HStack>
          )}
        </Flex>

        {/* Latest Entry Display */}
        {sengetider.latestEntry && (
          <Box 
            bg="sage.25" 
            borderRadius="md" 
            p={3}
            border="1px solid"
            borderColor="sage.100"
          >
            <HStack justify="space-between" align="center">
              <VStack gap={1} align="start">
                <Text fontSize="sm" fontWeight="medium" color="sage.700">
                  Seneste sengetid
                </Text>
                <HStack gap={2}>
                  <Text fontSize="lg" fontWeight="bold" color="sage.800">
                    {sengetider.latestEntry.actualBedtime.substring(0, 5)}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    ({new Date(sengetider.latestEntry.entryDate).toLocaleDateString('da-DK')})
                  </Text>
                  {bedtimeStatus && (
                    <Badge 
                      colorPalette={bedtimeStatus.color} 
                      variant="subtle" 
                      size="sm"
                    >
                      {bedtimeStatus.text}
                    </Badge>
                  )}
                </HStack>
                {sengetider.recordedByName && (
                  <Text fontSize="xs" color="sage.600">
                    Registreret af {sengetider.recordedByName}
                  </Text>
                )}
              </VStack>
            </HStack>
          </Box>
        )}

        {/* Entry Form */}
        <VStack gap={3} align="stretch">
          <Text fontWeight="medium" color="gray.800">
            {hasEntryToday ? 'Opdater sengetid for i dag' : 'Registrer sengetid for i dag'}
          </Text>
          
          <HStack gap={3} align="end">
            <VStack gap={1} align="start" flex={1}>
              <Text fontSize="sm" color="gray.600">Sengetid</Text>
              <Input
                type="time"
                value={actualBedtime}
                onChange={(e) => setActualBedtime(e.target.value)}
                size="md"
                bg="white"
                borderColor="gray.300"
                _hover={{ borderColor: 'sage.300' }}
                _focus={{ borderColor: 'sage.500', boxShadow: '0 0 0 1px var(--colors-sage-500)' }}
              />
            </VStack>
            
            <Button
              colorPalette="sage"
              onClick={handleSubmit}
              loading={loading}
              loadingText={hasEntryToday ? "Opdaterer..." : "Registrerer..."}
              size="md"
              px={6}
            >
              {hasEntryToday ? 'Opdater' : 'Registrer'}
            </Button>
          </HStack>

          {/* Notes Field */}
          <VStack gap={1} align="start">
            <Text fontSize="sm" color="gray.600">Noter (valgfrit)</Text>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Fx "Læste en ekstra historie" eller "Havde svært ved at falde i søvn"`}
              size="sm"
              resize="vertical"
              minH="60px"
              bg="white"
              borderColor="gray.300"
              _hover={{ borderColor: 'sage.300' }}
              _focus={{ borderColor: 'sage.500', boxShadow: '0 0 0 1px var(--colors-sage-500)' }}
            />
          </VStack>
        </VStack>

        {/* Timeline */}
        <SengetiderTimeline
          ref={timelineRef}
          sengetiderId={sengetider.id}
          targetBedtime={sengetider.targetBedtime}
          childName={childName}
        />

        {/* Delete Confirmation Dialog */}
        <DialogManager
          trigger={null}
          title="Slet sengetider-værktøj"
          type="error"
          isOpen={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          primaryAction={{
            label: "Slet",
            onClick: handleDeleteSengetider,
            colorScheme: "red",
            isLoading: deletingSengetider
          }}
          secondaryAction={{
            label: "Annuller",
            onClick: () => setShowDeleteDialog(false)
          }}
        >
          <Text>
            Er du sikker på, at du vil slette sengetider-værktøjet &quot;{sengetider.topic}&quot;? 
            Alle registrerede sengetider vil også blive slettet.
          </Text>
          <Text mt={2} fontSize="sm" color="gray.600">
            Denne handling kan ikke fortrydes.
          </Text>
        </DialogManager>
      </VStack>
    </Box>
  );
}
