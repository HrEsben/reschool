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
  GridItem,
  useBreakpointValue,
  IconButton,
} from '@chakra-ui/react';
import { showToast } from '@/components/ui/simple-toast';
import { DialogManager } from '@/components/ui/dialog-manager';
import { SettingsIcon, TrashIcon } from '@/components/ui/icons';
import { ToggleTip } from '@/components/ui/toggle-tip';
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
  const [currentWeekEntries, setCurrentWeekEntries] = useState<SengetiderEntry[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, -1 = last week, etc.

  // React Query mutation for deleting sengetider
  const deleteSengetiderMutation = useDeleteSengetider();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // Default to today
  const [hasUserInput, setHasUserInput] = useState(false); // Track if user has started typing

  // Get current week dates (Monday to Sunday) with offset support
  const getCurrentWeekDates = (offset: number = 0) => {
    const today = new Date();
    today.setDate(today.getDate() + (offset * 7)); // Apply week offset
    const currentDay = today.getDay();
    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek);
      date.setDate(firstDayOfWeek.getDate() + i);
      weekDates.push(date);
    }
    return weekDates;
  };

  const weekDates = getCurrentWeekDates(weekOffset);
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Load current week entries
  useEffect(() => {
    const loadCurrentWeekEntries = async () => {
      try {
        const response = await fetch(`/api/sengetider/${sengetider.id}/entries`);
        if (response.ok) {
          const data = await response.json();
          const weekStart = weekDates[0].toISOString().split('T')[0];
          const weekEnd = weekDates[6].toISOString().split('T')[0];
          
          const filteredEntries = data.entries.filter((entry: SengetiderEntry) => {
            return entry.entryDate >= weekStart && entry.entryDate <= weekEnd;
          });
          
          setCurrentWeekEntries(filteredEntries);
        }
      } catch (error) {
        console.error('Error loading week entries:', error);
      }
    };

    loadCurrentWeekEntries();
  }, [sengetider.id, weekDates, weekOffset]);

  // Get entry for specific date
  const getEntryForDate = useCallback((date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return currentWeekEntries.find(entry => entry.entryDate === dateString);
  }, [currentWeekEntries]);

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

  // Navigation functions
  const goToPreviousWeek = () => {
    setWeekOffset(prev => prev - 1);
  };

  const goToNextWeek = () => {
    setWeekOffset(prev => prev + 1);
  };

  const goToCurrentWeek = () => {
    setWeekOffset(0);
  };

  // Handle clicking on a day to select it for registration
  const handleDayClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Only allow registration for today and past dates
    if (date > today) {
      showToast({
        title: 'Ikke tilladt',
        description: 'Du kan ikke registrere sengetider for fremtidige datoer',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

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

  // Week day names in Danish
  const dayNames = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'];

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
            <Heading size="md" color="navy.800">Sengetider for {childName}</Heading>
            {sengetider.description && (
              <Text fontSize="sm" color="gray.600">
                {sengetider.description}
              </Text>
            )}
            <HStack gap={2}>
              <ToggleTip 
                content={sengetider.isPublic ? (
                  <VStack gap={1} align="start">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">Alle voksne</Text>
                    <Text fontSize="xs" color="gray.500">Alle voksne tilknyttet barnet kan se dette værktøj</Text>
                  </VStack>
                ) : (
                  <VStack gap={1} align="start">
                    <Text fontSize="sm" fontWeight="medium" color="gray.700">Kun dig</Text>
                    <Text fontSize="xs" color="gray.500">Kun du kan se dette værktøj</Text>
                  </VStack>
                )}
              >
                <Box
                  as="button"
                  px={2}
                  py={1}
                  borderRadius="md"
                  bg={sengetider.isPublic ? "green.100" : "blue.100"}
                  color={sengetider.isPublic ? "green.700" : "blue.700"}
                  border="1px solid"
                  borderColor={sengetider.isPublic ? "green.200" : "blue.200"}
                  fontSize="xs"
                  fontWeight="medium"
                  cursor="help"
                  _hover={{ opacity: 0.8 }}
                >
                  {sengetider.isPublic ? "Alle voksne" : "Kun dig"}
                </Box>
              </ToggleTip>
            </HStack>
          </VStack>
          
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
                  color="navy.600"
                  _hover={{ bg: "navy.50", color: "navy.700" }}
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
        </Flex>
      </Box>

      {/* Content */}
      <Box p={6}>
        <VStack gap={6} align="stretch">

          {/* Current Week View */}
          <VStack gap={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Heading size="md" color="navy.700">
                {weekOffset === 0 ? 'Denne uge' : 
                 weekOffset === -1 ? 'Forrige uge' : 
                 weekOffset < -1 ? `${Math.abs(weekOffset)} uger siden` :
                 weekOffset === 1 ? 'Næste uge' :
                 `${weekOffset} uger frem`}
              </Heading>
              
              <HStack gap={2}>
                <IconButton
                  aria-label="Forrige uge"
                  size="sm"
                  variant="outline"
                  colorScheme="sage"
                  onClick={goToPreviousWeek}
                >
                  ←
                </IconButton>
                
                {weekOffset !== 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="sage"
                    onClick={goToCurrentWeek}
                  >
                    I dag
                  </Button>
                )}
                
                <IconButton
                  aria-label="Næste uge"
                  size="sm"
                  variant="outline"
                  colorScheme="sage"
                  onClick={goToNextWeek}
                  disabled={weekOffset >= 0} // Don't allow going into future
                >
                  →
                </IconButton>
              </HStack>
            </Flex>
            
            {/* Week Date Range */}
            <Text fontSize="sm" color="gray.600" textAlign="center">
              {weekDates[0].toLocaleDateString('da-DK', { day: 'numeric', month: 'short' })} - {weekDates[6].toLocaleDateString('da-DK', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
            
            {/* Week Grid */}
            <Grid templateColumns={isMobile ? "repeat(1, 1fr)" : "repeat(7, 1fr)"} gap={3}>
              {weekDates.map((date, index) => {
                const entry = getEntryForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isPast = date <= new Date();
                const isClickable = isPast;
                
                return (
                  <GridItem key={date.toISOString()}>
                    <Box
                      p={4}
                      border="2px solid"
                      borderColor={
                        isSelected ? "sage.500" : 
                        isToday ? "sage.300" : 
                        "gray.200"
                      }
                      borderRadius="lg"
                      bg={
                        isSelected ? "sage.50" :
                        isToday ? "cream.50" : 
                        "white"
                      }
                      minH="140px"
                      cursor={isClickable ? "pointer" : "default"}
                      _hover={isClickable ? { 
                        borderColor: isSelected ? "sage.600" : "sage.400", 
                        bg: isSelected ? "sage.100" : (isToday ? "cream.100" : "cream.25"),
                        transform: "translateY(-1px)",
                        boxShadow: "sm"
                      } : {}}
                      transition="all 0.2s"
                      onClick={isClickable ? () => handleDayClick(date) : undefined}
                      opacity={isPast ? 1 : 0.6}
                    >
                      <VStack gap={2} align="start">
                        <HStack justify="space-between" w="100%">
                          <Text 
                            fontWeight="semibold" 
                            fontSize="sm" 
                            color={
                              isSelected ? "sage.700" :
                              isToday ? "sage.600" : 
                              "navy.700"
                            }
                          >
                            {dayNames[index]}
                          </Text>
                          {isSelected && (
                            <Text fontSize="sm" color="sage.600">✓</Text>
                          )}
                        </HStack>
                        <Text fontSize="xs" color="gray.500" fontWeight="medium">
                          {date.getDate()}.{date.getMonth() + 1}
                        </Text>
                        
                        {entry ? (
                          <VStack gap={1} align="start" fontSize="xs" w="100%">
                            <Text><strong>Puttetid:</strong> {formatTime(entry.puttetid)}</Text>
                            {entry.sovKl && <Text><strong>Sov:</strong> {formatTime(entry.sovKl)}</Text>}
                            {entry.vaagnede && <Text><strong>Vågnede:</strong> {formatTime(entry.vaagnede)}</Text>}
                            {entry.notes && (
                              <Text color="gray.600" fontSize="xs" lineClamp={2}>
                                <strong>Note:</strong> {entry.notes}
                              </Text>
                            )}
                          </VStack>
                        ) : (
                          <Text fontSize="xs" color="gray.400" fontStyle="italic">
                            Ingen registrering
                          </Text>
                        )}
                      </VStack>
                    </Box>
                  </GridItem>
                );
              })}
            </Grid>
          </VStack>

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
            >
              {selectedDate.toDateString() === new Date().toDateString() 
                ? 'Registrer sengetid' 
                : 'Registrer for valgt dato'}
            </Button>
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
