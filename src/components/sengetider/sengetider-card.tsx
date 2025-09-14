"use client";

import { useState, useEffect } from 'react';
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
  Badge,
  Grid,
  GridItem,
  useBreakpointValue,
} from '@chakra-ui/react';
import { showToast } from '@/components/ui/simple-toast';
import { DialogManager } from '@/components/ui/dialog-manager';
import { SettingsIcon, TrashIcon } from '@/components/ui/icons';
import { ToggleTip } from '@/components/ui/toggle-tip';
import { useCreateSengetiderEntry } from '@/lib/queries';
import { Sengetider, SengetiderEntry, SengetiderWithLatestEntry } from '@/lib/database-service';

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

  // Get current week dates (Monday to Sunday)
  const getCurrentWeekDates = () => {
    const today = new Date();
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

  const weekDates = getCurrentWeekDates();
  const isMobile = useBreakpointValue({ base: true, md: false });

  // Load current week entries
  useEffect(() => {
    const loadCurrentWeekEntries = async () => {
      try {
        const response = await fetch(`/api/sengetider/${sengetider.id}/entries`);
        if (response.ok) {
          const data = await response.json();
          // Filter for current week
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
  }, [sengetider.id, weekDates]);

  // Format time for display
  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return timeString.substring(0, 5); // HH:MM
  };

  // Get entry for specific date
  const getEntryForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return currentWeekEntries.find(entry => entry.entryDate === dateString);
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
      const today = new Date().toISOString().split('T')[0];
      
      const response = await fetch(`/api/sengetider/${sengetider.id}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entryDate: today,
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

      showToast({
        title: 'Succes',
        description: 'Sengetid registreret',
        type: 'success',
        duration: 3000,
      });
      
      // Reset form
      setPuttetid('');
      setSovKl('');
      setVaagnede('');
      setNotes('');
      
      onEntryRecorded();
      
      // Reload current week entries
      const updatedResponse = await fetch(`/api/sengetider/${sengetider.id}/entries`);
      if (updatedResponse.ok) {
        const data = await updatedResponse.json();
        const weekStart = weekDates[0].toISOString().split('T')[0];
        const weekEnd = weekDates[6].toISOString().split('T')[0];
        
        const filteredEntries = data.entries.filter((entry: SengetiderEntry) => {
          return entry.entryDate >= weekStart && entry.entryDate <= weekEnd;
        });
        
        setCurrentWeekEntries(filteredEntries);
      }
      
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

  const handleDeleteSengetider = async () => {
    setDeletingSengetider(true);
    try {
      const response = await fetch(`/api/sengetider/${sengetider.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete sengetider');
      }

      showToast({
        title: 'Succes',
        description: 'Sengetider-værktøjet blev slettet',
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
      bg="bg.surface"
      borderRadius="xl"
      border="1px solid"
      borderColor="border.muted"
      p={{ base: 4, md: 6 }}
      position="relative"
    >
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <VStack align="start" gap={1}>
            <Heading size="lg" color="sage.600">Sengetider for {childName}</Heading>
            {sengetider.description && (
              <Text fontSize="sm" color="gray.600">
                {sengetider.description}
              </Text>
            )}
            <HStack gap={1}>
              <Badge colorScheme="blue" fontSize="xs">
                Sengetider
              </Badge>
              {!sengetider.isPublic && (
                <Badge colorScheme="orange" fontSize="xs" variant="outline">
                  Privat
                </Badge>
              )}
            </HStack>
          </VStack>
          
          {isUserAdmin && (
            <HStack gap={2}>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSengetiderEdit?.(sengetider)}
              >
                <SettingsIcon />
                Indstillinger
              </Button>
              <Button
                size="sm"
                variant="outline"
                colorScheme="red"
                loading={deletingSengetider}
                onClick={() => setShowDeleteDialog(true)}
              >
                <TrashIcon />
                Slet
              </Button>
            </HStack>
          )}
        </Flex>

        {/* Current Week View */}
        <VStack gap={4} align="stretch">
          <Heading size="md" color="gray.700">Denne uge</Heading>
          
          {/* Week Grid */}
          <Grid templateColumns={isMobile ? "repeat(1, 1fr)" : "repeat(7, 1fr)"} gap={2}>
            {weekDates.map((date, index) => {
              const entry = getEntryForDate(date);
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <GridItem key={date.toISOString()}>
                  <Box
                    p={3}
                    border="1px solid"
                    borderColor={isToday ? "sage.300" : "gray.200"}
                    borderRadius="md"
                    bg={isToday ? "sage.50" : "white"}
                    minH="120px"
                  >
                    <VStack gap={2} align="start">
                      <Text fontWeight="bold" fontSize="sm" color={isToday ? "sage.600" : "gray.600"}>
                        {dayNames[index]}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {date.getDate()}.{date.getMonth() + 1}
                      </Text>
                      
                      {entry ? (
                        <VStack gap={1} align="start" fontSize="xs">
                          <Text><strong>Puttetid:</strong> {formatTime(entry.puttetid)}</Text>
                          {entry.sovKl && <Text><strong>Sov kl:</strong> {formatTime(entry.sovKl)}</Text>}
                          {entry.vaagnede && <Text><strong>Vågnede:</strong> {formatTime(entry.vaagnede)}</Text>}
                          {entry.notes && (
                            <Text color="gray.600" fontSize="sm">
                              {entry.notes}
                            </Text>
                          )}
                        </VStack>
                      ) : (
                        <Text fontSize="xs" color="gray.400">
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

        {/* Record Today's Entry */}
        <VStack gap={4} align="stretch">
          <Heading size="md" color="gray.700">Registrer i dag</Heading>
          
          <Grid templateColumns={isMobile ? "1fr" : "repeat(3, 1fr)"} gap={4}>
            <VStack align="start" gap={2}>
              <Text fontSize="sm" fontWeight="medium">Puttetid *</Text>
              <Input
                type="time"
                value={puttetid}
                onChange={(e) => setPuttetid(e.target.value)}
                size="sm"
                borderColor="cream.300"
                borderRadius="lg"
                bg="cream.25"
                _focus={{ 
                  borderColor: "sage.400", 
                  boxShadow: "0 0 0 3px rgba(129, 178, 154, 0.1)",
                  bg: "white"
                }}
              />
            </VStack>
            
            <VStack align="start" gap={2}>
              <Text fontSize="sm" fontWeight="medium">Sov kl.</Text>
              <Input
                type="time"
                value={sovKl}
                onChange={(e) => setSovKl(e.target.value)}
                size="sm"
                borderColor="cream.300"
                borderRadius="lg"
                bg="cream.25"
                _focus={{ 
                  borderColor: "sage.400", 
                  boxShadow: "0 0 0 3px rgba(129, 178, 154, 0.1)",
                  bg: "white"
                }}
              />
            </VStack>
            
            <VStack align="start" gap={2}>
              <Text fontSize="sm" fontWeight="medium">Vågnede</Text>
              <Input
                type="time"
                value={vaagnede}
                onChange={(e) => setVaagnede(e.target.value)}
                size="sm"
                borderColor="cream.300"
                borderRadius="lg"
                bg="cream.25"
                _focus={{ 
                  borderColor: "sage.400", 
                  boxShadow: "0 0 0 3px rgba(129, 178, 154, 0.1)",
                  bg: "white"
                }}
              />
            </VStack>
          </Grid>
          
          <VStack align="start" gap={2}>
            <Text fontSize="sm" fontWeight="medium">Noter (valgfrit)</Text>
            <Textarea
              placeholder="Notater om sengetiden..."
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
              size="sm"
              rows={2}
              borderColor="cream.300"
              borderRadius="lg"
              bg="cream.25"
              _focus={{ 
                borderColor: "sage.400", 
                boxShadow: "0 0 0 3px rgba(129, 178, 154, 0.1)",
                bg: "white"
              }}
            />
          </VStack>

          <Button
            colorScheme="sage"
            onClick={handleRecordEntry}
            loading={loading}
            disabled={!puttetid.trim()}
          >
            Registrer sengetid
          </Button>
        </VStack>

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
            colorScheme: "red"
          }}
          secondaryAction={{
            label: "Annuller",
            onClick: () => setShowDeleteDialog(false),
            colorScheme: "gray"
          }}
        >
          <Text>
            Er du sikker på, at du vil slette sengetider-værktøjet? 
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
