"use client";

import { useState, forwardRef, useImperativeHandle } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Flex,
  Badge,
  Button,
} from '@chakra-ui/react';
import { TrashIcon } from '@/components/ui/icons';
import { ErrorDialog } from '@/components/ui/dialog-manager';

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

interface ModernTimelineProps {
  entries: BarometerEntry[];
  barometer: Barometer;
  onDeleteEntry?: (entryId: number) => void;
  canDelete?: boolean;
  limit?: number;
}

export interface ModernTimelineRef {
  refresh: () => void;
}

// Helper function to get relation display name
const getRelationDisplayName = (userRelation?: string, customRelationName?: string): string => {
  if (customRelationName) {
    return customRelationName;
  }
  
  switch (userRelation) {
    case 'Mor':
      return 'Mor';
    case 'Far':
      return 'Far';
    case 'Underviser':
      return 'Underviser';
    case 'Ressourceperson':
      return 'Ressourceperson';
    default:
      return '';
  }
};

// Helper function to get rating color based on value
const getRatingColor = (rating: number): string => {
  if (rating >= 4) return 'success.400'; // Green for good ratings
  if (rating >= 3) return 'golden.400'; // Yellow for neutral ratings
  return 'coral.400'; // Orange/red for low ratings
};

// Helper function to get appropriate smiley/rating display based on barometer type
const getRatingDisplay = (rating: number, barometer: Barometer): string | React.ReactNode => {
  // For non-smiley display types, show the rating number
  if (barometer.displayType !== 'smileys') {
    if (barometer.displayType === 'percentage') {
      return `${rating}%`;
    }
    return rating.toString();
  }

  // For smiley display types, show the appropriate smiley
  const range = barometer.scaleMax - barometer.scaleMin;
  const position = (rating - barometer.scaleMin) / range;
  const smileyType = barometer.smileyType || 'emojis';
  
  // Get smiley based on smiley type
  if (smileyType === 'emojis') {
    // Traditional emojis for younger children
    if (position <= 0.2) return '😢';
    if (position <= 0.4) return '😟';
    if (position <= 0.6) return '😐';
    if (position <= 0.8) return '😊';
    return '😄';
  }
  
  if (smileyType === 'simple') {
    // Clean, simple icons for older children
    if (position <= 0.2) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
          <path d="M8 16s1.5-2 4-2 4 2 4 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    }
    if (position <= 0.4) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
          <path d="M10 16h4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    }
    if (position <= 0.6) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
          <path d="M9 16h6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    }
    if (position <= 0.8) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
        <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
        <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
        <path d="M8 14s1.5 2.5 4 2.5 4-2.5 4-2.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    );
  }
  
  if (smileyType === 'subtle') {
    // More mature/professional looking for teens
    if (position <= 0.2) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 15s1.5-2 4-2 4 2 4 2"/>
          <path d="M9 9h.01"/>
          <path d="M15 9h.01"/>
        </svg>
      );
    }
    if (position <= 0.4) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 15h8"/>
          <path d="M9 9h.01"/>
          <path d="M15 9h.01"/>
        </svg>
      );
    }
    if (position <= 0.6) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9 9h.01"/>
          <path d="M15 9h.01"/>
        </svg>
      );
    }
    if (position <= 0.8) {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
          <path d="M9 9h.01"/>
          <path d="M15 9h.01"/>
        </svg>
      );
    }
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 3 4 3 4-3 4-3"/>
        <path d="M9 9h.01"/>
        <path d="M15 9h.01"/>
      </svg>
    );
  }

  // Fallback to emojis
  if (position <= 0.2) return '😢';
  if (position <= 0.4) return '😟';
  if (position <= 0.6) return '😐';
  if (position <= 0.8) return '�';
  return '�';
};

// Format date for grouping (e.g., "Torsdag 8. september")
const formatDateHeader = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if it's today or yesterday
  if (date.toDateString() === today.toDateString()) {
    return 'I dag';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'I går';
  }
  
  // Format as Danish date
  const weekdays = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
  const months = [
    'januar', 'februar', 'marts', 'april', 'maj', 'juni',
    'juli', 'august', 'september', 'oktober', 'november', 'december'
  ];
  
  const weekday = weekdays[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  
  return `${weekday} ${day}. ${month}`;
};

// Format time (e.g., "14:30")
const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('da-DK', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

// Group entries by date
const groupEntriesByDate = (entries: BarometerEntry[]): Record<string, BarometerEntry[]> => {
  return entries.reduce((groups, entry) => {
    const dateKey = entry.entryDate.split('T')[0]; // Get YYYY-MM-DD part
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(entry);
    return groups;
  }, {} as Record<string, BarometerEntry[]>);
};

export const ModernTimeline = forwardRef<ModernTimelineRef, ModernTimelineProps>(
  ({ entries, barometer, onDeleteEntry, canDelete = false, limit }, ref) => {
    const [localEntries, setLocalEntries] = useState<BarometerEntry[]>(entries);
    const [entryToDelete, setEntryToDelete] = useState<BarometerEntry | null>(null);

    useImperativeHandle(ref, () => ({
      refresh: () => {
        setLocalEntries(entries);
      }
    }));

    // Apply limit if specified
    const displayEntries = limit ? localEntries.slice(0, limit) : localEntries;
    
    // Group entries by date
    const groupedEntries = groupEntriesByDate(displayEntries);
    const sortedDates = Object.keys(groupedEntries).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    const handleDeleteEntry = (entry: BarometerEntry) => {
      setEntryToDelete(entry);
    };

    const confirmDeleteEntry = () => {
      if (entryToDelete && onDeleteEntry) {
        onDeleteEntry(entryToDelete.id);
        // Optimistically update local state
        setLocalEntries(prev => prev.filter(entry => entry.id !== entryToDelete.id));
        setEntryToDelete(null);
      }
    };

    if (displayEntries.length === 0) {
      return (
        <Box 
          p={6} 
          textAlign="center" 
          bg="bg.subtle" 
          borderRadius="xl" 
          border="1px solid" 
          borderColor="gray.200"
        >
          <Text color="gray.500" fontSize="sm">
            Ingen registreringer endnu
          </Text>
        </Box>
      );
    }

    return (
      <VStack gap={4} align="stretch" w="full">
        {sortedDates.map(dateKey => {
          const dateEntries = groupedEntries[dateKey].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          
          return (
            <Box key={dateKey}>
              {/* Date Header */}
              <Text 
                fontSize={{ base: "xs", md: "sm" }}
                fontWeight="semibold" 
                color="gray.600" 
                mb={3}
                pl={{ base: 1, md: 2 }}
              >
                {formatDateHeader(dateKey)}
              </Text>
              
              {/* Entries for this date */}
              <VStack gap={2} align="stretch">
                {dateEntries.map((entry, index) => (
                  <Box
                    key={entry.id}
                    position="relative"
                    pl={{ base: 6, md: 8 }} // Responsive left padding for timeline space
                  >
                    {/* Timeline connector */}
                    <Box
                      position="absolute"
                      left={{ base: "8px", md: "12px" }}
                      top={0}
                      bottom={index === dateEntries.length - 1 ? "50%" : "-8px"}
                      width="2px"
                      bg="gray.200"
                      zIndex={1}
                    />
                    
                    {/* Timeline dot */}
                    <Box
                      position="absolute"
                      left={{ base: "6px", md: "8px" }}
                      top={{ base: "12px", md: "16px" }}
                      width={{ base: "8px", md: "10px" }}
                      height={{ base: "8px", md: "10px" }}
                      borderRadius="full"
                      bg={getRatingColor(entry.rating)}
                      border="2px solid"
                      borderColor="bg.emphasis"
                      zIndex={2}
                    />
                    
                    {/* Entry Card */}
                    <Box
                      bg="bg.emphasis"
                      borderRadius="lg"
                      border="1px solid"
                      borderColor="gray.200"
                      p={{ base: 3, md: 4 }}
                      shadow="sm"
                      _hover={{
                        shadow: "md",
                        borderColor: "gray.300"
                      }}
                      transition="all 0.2s"
                    >
                      <Flex 
                        justify="space-between" 
                        align="flex-start" 
                        mb={2}
                        direction={{ base: "column", sm: "row" }}
                        gap={{ base: 2, sm: 0 }}
                      >
                        <Flex 
                          align="center" 
                          gap={{ base: 2, md: 3 }} 
                          flex={1}
                          wrap={{ base: "wrap", sm: "nowrap" }}
                        >
                          {/* Rating with appropriate display type */}
                          <Flex align="center" gap={{ base: 1, md: 2 }}>
                            <Text fontSize={{ base: "md", md: "lg" }} display="flex" alignItems="center">
                              {getRatingDisplay(entry.rating, barometer)}
                            </Text>
                            <Badge
                              colorPalette={
                                entry.rating >= 4 ? 'success' : 
                                entry.rating >= 3 ? 'warning' : 'coral'
                              }
                              size={{ base: "xs", md: "sm" }}
                              borderRadius="full"
                              px={{ base: 1, md: 2 }}
                            >
                              {entry.rating.toFixed(1)}
                            </Badge>
                          </Flex>
                          
                          {/* User and time info */}
                          <VStack gap={0} align="flex-start" flex={1} minW={0}>
                            <HStack 
                              gap={{ base: 1, md: 2 }} 
                              align="center"
                              flexWrap={{ base: "wrap", sm: "nowrap" }}
                            >
                              <Text 
                                fontSize={{ base: "xs", md: "sm" }} 
                                fontWeight="medium" 
                                color="gray.800"
                                lineClamp={1}
                              >
                                {entry.recordedByName || 'Ukendt bruger'}
                              </Text>
                              {getRelationDisplayName(entry.userRelation, entry.customRelationName) && (
                                <Badge
                                  size={{ base: "xs", md: "sm" }}
                                  colorPalette="navy"
                                  variant="subtle"
                                  borderRadius="full"
                                  px={{ base: 1, md: 2 }}
                                  flexShrink={0}
                                >
                                  {getRelationDisplayName(entry.userRelation, entry.customRelationName)}
                                </Badge>
                              )}
                            </HStack>
                            <Text fontSize="xs" color="gray.500">
                              {formatTime(entry.createdAt)}
                            </Text>
                          </VStack>
                        </Flex>
                        
                        {/* Delete button */}
                        {canDelete && onDeleteEntry && (
                          <Button
                            variant="ghost"
                            size={{ base: "xs", md: "sm" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEntry(entry);
                            }}
                            title="Slet registrering"
                            p={{ base: 0.5, md: 1 }}
                            minW="auto"
                            color="coral.600"
                            _hover={{ bg: "coral.50", color: "coral.700" }}
                            _focus={{ 
                              bg: "coral.50",
                              boxShadow: "0 0 0 2px var(--chakra-colors-coral-200)",
                              outline: "none"
                            }}
                            _focusVisible={{ 
                              bg: "coral.50",
                              boxShadow: "0 0 0 2px var(--chakra-colors-coral-200)",
                              outline: "none"
                            }}
                            borderRadius="md"
                            flexShrink={0}
                          >
                            <TrashIcon size="sm" />
                          </Button>
                        )}
                      </Flex>
                      
                      {/* Comment */}
                      {entry.comment && (
                        <Box
                          mt={{ base: 2, md: 3 }}
                          p={{ base: 2, md: 3 }}
                          bg="gray.50"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.100"
                        >
                          <Text 
                            fontSize={{ base: "xs", md: "sm" }} 
                            color="gray.700" 
                            lineHeight="1.5"
                          >
                            &ldquo;{entry.comment}&rdquo;
                          </Text>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </VStack>
            </Box>
          );
        })}
        
        {/* Show more indicator if limited */}
        {limit && entries.length > limit && (
          <Box textAlign="center" pt={2}>
            <Text fontSize="xs" color="gray.500">
              Viser {limit} af {entries.length} registreringer
            </Text>
          </Box>
        )}
        
        {/* Delete confirmation dialog */}
        {entryToDelete && (
          <ErrorDialog
            trigger={<div style={{ display: 'none' }} />}
            title="Slet registrering"
            icon="⚠️"
            isOpen={!!entryToDelete}
            onOpenChange={(open) => {
              if (!open) setEntryToDelete(null);
            }}
            primaryAction={{
              label: "Slet",
              onClick: confirmDeleteEntry,
              colorScheme: "red"
            }}
            secondaryAction={{
              label: "Annuller",
              onClick: () => setEntryToDelete(null),
              variant: "outline"
            }}
          >
            <Text>
              Er du sikker på, at du vil slette denne registrering? Denne handling kan ikke fortrydes.
            </Text>
            {entryToDelete.comment && (
              <Box mt={3} p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" color="gray.600">
                  Kommentar: "{entryToDelete.comment}"
                </Text>
              </Box>
            )}
          </ErrorDialog>
        )}
      </VStack>
    );
  }
);

ModernTimeline.displayName = 'ModernTimeline';
