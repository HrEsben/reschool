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

interface ModernTimelineProps {
  entries: BarometerEntry[];
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

// Helper function to get rating emoji
const getRatingEmoji = (rating: number): string => {
  if (rating >= 4.5) return '😊';
  if (rating >= 4) return '🙂';
  if (rating >= 3) return '😐';
  if (rating >= 2) return '😕';
  return '😞';
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
  ({ entries, onDeleteEntry, canDelete = false, limit }, ref) => {
    const [localEntries, setLocalEntries] = useState<BarometerEntry[]>(entries);

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

    const handleDeleteEntry = (entryId: number) => {
      if (onDeleteEntry) {
        onDeleteEntry(entryId);
        // Optimistically update local state
        setLocalEntries(prev => prev.filter(entry => entry.id !== entryId));
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
                          {/* Rating with emoji */}
                          <Flex align="center" gap={{ base: 1, md: 2 }}>
                            <Text fontSize={{ base: "md", md: "lg" }}>
                              {getRatingEmoji(entry.rating)}
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
                              handleDeleteEntry(entry.id);
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
      </VStack>
    );
  }
);

ModernTimeline.displayName = 'ModernTimeline';
