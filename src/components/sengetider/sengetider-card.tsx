"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Flex,
  Heading,
  Input,
  Textarea,
  Grid,
  useBreakpointValue,
} from '@chakra-ui/react';
import { showToast } from '@/components/ui/simple-toast';
import { DialogManager } from '@/components/ui/dialog-manager';
import { SettingsIcon, TrashIcon } from '@/components/ui/icons';
import { VisibilityBadge } from '@/components/ui/visibility-badge';
import { CompactDatePicker } from '@/components/ui/compact-date-picker';
import { SengetiderEntry, SengetiderWithLatestEntry } from '@/lib/database-service';
import { useDeleteSengetider } from '@/lib/queries';

interface SengetiderCardProps {
  sengetider: SengetiderWithLatestEntry;
  onEntryRecorded: () => void;
  onSengetiderDeleted: () => void;
  onSengetiderEdit?: (sengetider: SengetiderWithLatestEntry) => void;
  isUserAdmin: boolean;
  childName: string;
}

export function SengetiderCard({
  sengetider, 
  onEntryRecorded, 
  onSengetiderDeleted, 
  onSengetiderEdit, 
  isUserAdmin,
  childName
}: SengetiderCardProps) {
  const [puttetid, setPuttetid] = useState('');
  const [sovKl, setSovKl] = useState('');
  const [vaagnede, setVaagnede] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingSengetider, setDeletingSengetider] = useState(false);
  const [allEntries, setAllEntries] = useState<SengetiderEntry[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Use a stable date to prevent hydration mismatches
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
    return today;
  });
  const [hasUserInput, setHasUserInput] = useState(false); // Track if user has started typing

  // Handle hydration
  

  // React Query mutation for deleting sengetider
  const deleteSengetiderMutation = useDeleteSengetider();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Load all entries for this sengetider tool
  useEffect(() => {
    const loadAllEntries = async () => {
      try {
        const response = await fetch(`/api/sengetider/${sengetider.id}/entries`);
        if (response.ok) {
          const data = await response.json();
          setAllEntries(data.entries || []);
        }
      } catch (error) {
        console.error('Error loading entries:', error);
      }
    };

    loadAllEntries();
  }, [sengetider.id]);

  // Get entry for specific date
  const getEntryForDate = useCallback((date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return allEntries.find((entry: SengetiderEntry) => entry.entryDate === dateString);
  }, [allEntries]);

  // Pre-fill form when selected date changes, but only if user hasn't started typing
  useEffect(() => {
    if (!hasUserInput) {
      const existingEntry = getEntryForDate(selectedDate);
      if (existingEntry) {
        setPuttetid(existingEntry.puttetid || '');
        setSovKl(existingEntry.sovKl || '');
        setVaagnede(existingEntry.vaagnede || '');
        setNotes(existingEntry.notes || '');
      } else {
        setPuttetid('');
        setSovKl('');
        setVaagnede('');
        setNotes('');
      }
    }
  }, [selectedDate, getEntryForDate, hasUserInput]);

  // Format time for display
  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5); // HH:MM
  };

  // Handle recording new entry
  const handleRecordEntry = async () => {
    if (!puttetid.trim()) {
      showToast({
        title: 'Fejl',
        description: 'Puttetid er påkrævet',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const selectedDateString = selectedDate.toISOString().split('T')[0];
      
      const response = await fetch(`/api/sengetider/${sengetider.id}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryDate: selectedDateString,
          puttetid: puttetid || null,
          sovKl: sovKl || null,
          vaagnede: vaagnede || null,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record entry');
      }

      const isToday = selectedDate.toDateString() === new Date().toDateString();
      showToast({
        title: 'Succes',
        description: isToday ? 'Sengetid registreret' : `Sengetid registreret for ${selectedDate.toLocaleDateString('da-DK')}`,
        type: 'success',
        duration: 3000,
      });
      
      // Reset form and user input flag
      setPuttetid('');
      setSovKl('');
      setVaagnede('');
      setNotes('');
      setHasUserInput(false);
      onEntryRecorded();
      
    } catch (error) {
      showToast({
        title: 'Fejl',
        description: error instanceof Error ? error.message : 'Der opstod en fejl',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle date change from the date picker
  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setHasUserInput(false); // Reset user input flag when selecting a new date
  };

  const handleDeleteSengetider = async () => {
    setDeletingSengetider(true);
    try {
      await deleteSengetiderMutation.mutateAsync({
        id: sengetider.id,
        childId: sengetider.childId.toString()
      });

      showToast({
        title: 'Slettet',
        description: 'Sengetider-værktøjet er slettet',
        type: 'success',
        duration: 3000,
      });
      onSengetiderDeleted();
    } catch (error) {
      showToast({
        title: 'Fejl',
        description: error instanceof Error ? error.message : 'Der opstod en fejl',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setDeletingSengetider(false);
      setShowDeleteDialog(false);
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
        bg="linear-gradient(135deg, #ebeef2 0%, #ced6e0 50%, #9bb0c4 100%)" 
        px={6} 
        py={4} 
        borderBottomWidth="1px" 
        borderBottomColor="navy.200"
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <VStack align="start" gap={1} flex={1} minW={0}>
            <Heading size="md" color="navy.800">Sengetider for {childName}</Heading>
            {sengetider.description && (
              <Text fontSize="sm" color="navy.600">
                {sengetider.description}
              </Text>
            )}
          </VStack>
          
          <HStack gap={2} flexShrink={0}>
            {/* Visibility Badge */}
            <VisibilityBadge
              isPublic={sengetider.isPublic}
            />

            {/* Action Buttons */}
            {isUserAdmin && (
              <HStack gap={1}>
                {onSengetiderEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSengetiderEdit(sengetider)}
                    title="Rediger sengetider-værktøj"
                    p={1}
                    minW="auto"
                    color="sage.600"
                    _hover={{ bg: "sage.50", color: "sage.700" }}
                  >
                    <SettingsIcon size={16} />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  title="Slet sengetider-værktøj"
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

          {/* Show existing entry for selected date */}
          {(() => {
            const existingEntry = getEntryForDate(selectedDate);
            if (existingEntry) {
              return (
                <Box
                  p={4}
                  bg="cream.50"
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="cream.300"
                >
                  <Text fontSize="sm" fontWeight="medium" color="navy.700" mb={2}>
                    Eksisterende registrering for {selectedDate.toDateString() === new Date().toDateString() ? 'i dag' : selectedDate.toLocaleDateString('da-DK')}:
                  </Text>
                  <VStack gap={1} align="start" fontSize="sm">
                    <Text><strong>Puttetid:</strong> {formatTime(existingEntry.puttetid)}</Text>
                    {existingEntry.sovKl && <Text><strong>Sov kl:</strong> {formatTime(existingEntry.sovKl)}</Text>}
                    {existingEntry.vaagnede && <Text><strong>Vågnede:</strong> {formatTime(existingEntry.vaagnede)}</Text>}
                    {existingEntry.notes && (
                      <Text color="gray.600">
                        <strong>Noter:</strong> {existingEntry.notes}
                      </Text>
                    )}
                  </VStack>
                  <Text fontSize="xs" color="gray.500" mt={2}>
                    Udfyld formularen nedenfor for at opdatere registreringen
                  </Text>
                </Box>
              );
            }
            return null;
          })()}

          {/* Record Entry Form */}
          <VStack gap={4} align="stretch">
            <Heading size="md" color="navy.700">
              {selectedDate.toDateString() === new Date().toDateString() 
                ? 'Registrer i dag' 
                : `Registrer for ${selectedDate.toLocaleDateString('da-DK')}`}
            </Heading>
            
            <Grid templateColumns={isMobile ? "1fr" : "repeat(3, 1fr)"} gap={4}>
              <VStack align="start" gap={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.700">Puttetid *</Text>
                <Input
                  type="time"
                  value={puttetid}
                  onChange={(e) => {
                    setPuttetid(e.target.value);
                    setHasUserInput(true);
                  }}
                  size="md"
                  borderColor="cream.300"
                  borderRadius="lg"
                  bg="cream.25"
                  _hover={{ borderColor: "cream.400" }}
                  _focus={{ 
                    borderColor: "sage.400", 
                    boxShadow: "0 0 0 1px var(--chakra-colors-sage-400)",
                    bg: "white",
                    outline: "none"
                  }}
                />
              </VStack>
              
              <VStack align="start" gap={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.700">Sov kl.</Text>
                <Input
                  type="time"
                  value={sovKl}
                  onChange={(e) => {
                    setSovKl(e.target.value);
                    setHasUserInput(true);
                  }}
                  size="md"
                  borderColor="cream.300"
                  borderRadius="lg"
                  bg="cream.25"
                  _hover={{ borderColor: "cream.400" }}
                  _focus={{ 
                    borderColor: "sage.400", 
                    boxShadow: "0 0 0 1px var(--chakra-colors-sage-400)",
                    bg: "white",
                    outline: "none"
                  }}
                />
              </VStack>
              
              <VStack align="start" gap={2}>
                <Text fontSize="sm" fontWeight="medium" color="gray.700">Vågnede</Text>
                <Input
                  type="time"
                  value={vaagnede}
                  onChange={(e) => {
                    setVaagnede(e.target.value);
                    setHasUserInput(true);
                  }}
                  size="md"
                  borderColor="cream.300"
                  borderRadius="lg"
                  bg="cream.25"
                  _hover={{ borderColor: "cream.400" }}
                  _focus={{ 
                    borderColor: "sage.400", 
                    boxShadow: "0 0 0 1px var(--chakra-colors-sage-400)",
                    bg: "white",
                    outline: "none"
                  }}
                />
              </VStack>
            </Grid>
            
            <VStack align="start" gap={2}>
              <Text fontSize="sm" fontWeight="medium" color="gray.700">Noter (valgfrit)</Text>
              <Textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setHasUserInput(true);
                }}
                placeholder="Skriv eventuelle noter om søvnen..."
                size="md"
                borderColor="cream.300"
                borderRadius="lg"
                bg="cream.25"
                _hover={{ borderColor: "cream.400" }}
                _focus={{ 
                  borderColor: "sage.400", 
                  boxShadow: "0 0 0 1px var(--chakra-colors-sage-400)",
                  bg: "white",
                  outline: "none"
                }}
                rows={3}
                maxLength={500}
              />
            </VStack>

            <HStack gap={3}>
              <Button
                bg="sage.500"
                color="white"
                _hover={{ bg: "sage.600" }}
                _active={{ bg: "sage.700" }}
                _focus={{ 
                  boxShadow: "0 0 0 2px var(--chakra-colors-sage-200)",
                  outline: "none"
                }}
                size="lg"
                borderRadius="lg"
                fontWeight="medium"
                onClick={handleRecordEntry}
                loading={loading}
                disabled={!puttetid.trim()}
                _disabled={{
                  opacity: 0.6,
                  cursor: "not-allowed"
                }}
                flex={1}
              >
                {selectedDate.toDateString() === new Date().toDateString() 
                  ? 'Registrer sengetid' 
                  : 'Registrer for valgt dato'}
              </Button>
              
              <CompactDatePicker
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                maxDaysBack={90}
                disabled={loading}
                size="lg"
              />
            </HStack>
          </VStack>
        </VStack>
      </Box>

      {/* Delete Confirmation Dialog */}
      <DialogManager
        trigger={<div style={{ display: 'none' }} />}
        title="Slet sengetider-værktøj"
        type="error"
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        primaryAction={{
          label: deletingSengetider ? "Sletter..." : "Slet",
          onClick: handleDeleteSengetider,
          isLoading: deletingSengetider,
          colorScheme: "coral"
        }}
        secondaryAction={{
          label: "Annuller",
          onClick: () => setShowDeleteDialog(false),
          colorScheme: "gray"
        }}
      >
        <VStack gap={2} align="stretch">
          <Text>
            Er du sikker på, at du vil slette sengetider-værktøjet?
          </Text>
          <Text fontSize="sm" color="coral.600">
            ⚠️ Denne handling kan ikke fortrydes. Alle registrerede sengetider vil blive permanent slettet.
          </Text>
        </VStack>
      </DialogManager>
    </Box>
  );
}
