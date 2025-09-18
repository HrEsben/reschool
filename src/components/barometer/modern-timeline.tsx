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
  Timeline,
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

// Helper function to get unique color for each contributor based on site's color palette
const getContributorColor = (contributorName: string): string => {
  // Create a consistent color mapping based on the contributor's name
  const colors = [
    '#81b29a', // cambridge-blue-500 (teal/green)
    '#e07a5f', // burnt-sienna-500 (warm orange)
    '#3d405b', // delft-blue-500 (deep blue)
    '#f2cc8f', // sunset-500 (warm yellow/gold)
    '#9ac1ae', // cambridge-blue-600 (lighter teal)
    '#e79680', // burnt-sienna-600 (lighter orange)
    '#5a5e87', // delft-blue-600 (lighter blue)
    '#f4d5a4', // sunset-600 (lighter gold)
  ];
  
  // Generate a hash from the contributor name for consistent color assignment
  let hash = 0;
  for (let i = 0; i < contributorName.length; i++) {
    const char = contributorName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get a positive index
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
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

// Note: formatDateTime function removed as it's unused - replaced by formatEntryDateTime

// Format the entry date and time for timeline display
const formatEntryDateTime = (entryDate: string, createdAt: string): string => {
  try {
    // Parse the createdAt timestamp for the time component
    const createdDate = new Date(createdAt);
    const time = createdDate.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    // Handle different entryDate formats
    let year: number, month: number, day: number;
    
    if (entryDate.includes('T')) {
      // ISO timestamp format (e.g., "2025-09-16T22:00:00.000Z")
      const entryDateObj = new Date(entryDate);
      year = entryDateObj.getFullYear();
      month = entryDateObj.getMonth() + 1; // getMonth() is 0-indexed
      day = entryDateObj.getDate();
    } else {
      // YYYY-MM-DD format
      const dateParts = entryDate.split('-').map(Number);
      [year, month, day] = dateParts;
    }
    
    // Validate date components
    if (!year || !month || !day || month < 1 || month > 12 || day < 1 || day > 31) {
      console.warn('Invalid date components:', { entryDate, year, month, day });
      return `${entryDate.split('T')[0]}, ${time}`;
    }
    
    // Create date object for comparison (month is 0-indexed in Date constructor)
    const entryDateObj = new Date(year, month - 1, day);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if entry date is today or yesterday
    if (entryDateObj.toDateString() === today.toDateString()) {
      return `I dag, ${time}`;
    }
    if (entryDateObj.toDateString() === yesterday.toDateString()) {
      return `I går, ${time}`;
    }
    
    // Format as Danish date with time
    const weekdays = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
    const months = [
      'januar', 'februar', 'marts', 'april', 'maj', 'juni',
      'juli', 'august', 'september', 'oktober', 'november', 'december'
    ];
    
    const weekday = weekdays[entryDateObj.getDay()];
    const monthName = months[entryDateObj.getMonth()];
    
    return `${weekday} ${day}. ${monthName}, ${time}`;
  } catch (error) {
    console.error('Error in formatEntryDateTime:', error, { entryDate, createdAt });
    // Fallback to simple formatting
    const fallbackTime = new Date(createdAt).toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', hour12: false });
    const simpleDateString = entryDate.includes('T') ? entryDate.split('T')[0] : entryDate;
    return `${simpleDateString}, ${fallbackTime}`;
  }
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

    // Apply limit if specified and sort by creation date (newest first)
    const displayEntries = (limit ? localEntries.slice(0, limit) : localEntries)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
        <Timeline.Root variant="subtle" size={{ base: "sm", md: "md" }}>
          {displayEntries.map((entry) => (
            <Timeline.Item key={entry.id}>
              <Timeline.Connector>
                <Timeline.Separator />
                <Timeline.Indicator 
                  bg={getContributorColor(entry.recordedByName || 'Unknown')}
                  borderColor="bg.emphasis"
                  borderWidth="2px"
                />
              </Timeline.Connector>
              
              <Timeline.Content position="relative">
                {/* Delete button positioned in upper right corner */}
                {canDelete && onDeleteEntry && (
                  <Button
                    variant="ghost"
                    size={{ base: "xs", md: "sm" }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEntry(entry);
                    }}
                    title="Slet registrering"
                    position="absolute"
                    top={0}
                    right={0}
                    p={{ base: 1, md: 1.5 }}
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
                    zIndex={1}
                  >
                    <TrashIcon size="sm" />
                  </Button>
                )}
                
                <Timeline.Title>
                  <Flex 
                    align="center" 
                    gap={{ base: 2, md: 3 }} 
                    wrap={{ base: "wrap", sm: "nowrap" }}
                    pr={{ base: 8, md: 10 }} // Add padding to avoid overlap with delete button
                    mb={2}
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
                    
                    {/* User and relation info */}
                    <HStack 
                      gap={{ base: 1, md: 2 }} 
                      align="center"
                      flexWrap={{ base: "wrap", sm: "nowrap" }}
                    >
                      <Text 
                        fontSize={{ base: "sm", md: "md" }} 
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
                  </Flex>
                </Timeline.Title>
                
                <Timeline.Description>
                  <VStack gap={2} align="flex-start" w="full">
                    {/* Date and time info */}
                    <Text fontSize="xs" color="gray.500">
                      {formatEntryDateTime(entry.entryDate, entry.createdAt)}
                    </Text>
                    
                    {/* Comment */}
                    {entry.comment && (
                      <Box
                        w="full"
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
                  </VStack>
                </Timeline.Description>
              </Timeline.Content>
            </Timeline.Item>
          ))}
        </Timeline.Root>
        
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
              Er du sikker på, at du vil slette denne registrering? Denna handling kan ikke fortrydes.
            </Text>
            {entryToDelete.comment && (
              <Box mt={3} p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" color="gray.600">
                  Kommentar: &ldquo;{entryToDelete.comment}&rdquo;
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
