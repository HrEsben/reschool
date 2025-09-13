"use client";

import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import {
  Box,
  Text,
  VStack,
  Flex,
  Badge,
  Button,
  Timeline,
  useBreakpointValue,
} from '@chakra-ui/react';
import { TrashIcon } from '@/components/ui/icons';
import { ErrorDialog } from '@/components/ui/dialog-manager';
import { OpenMojiEmoji } from '@/components/ui/openmoji-emoji';

interface DagensSmileyEntry {
  id: number;
  smileyId: number;
  recordedBy: number;
  entryDate: string;
  selectedEmoji: string;
  reasoning?: string;
  createdAt: string;
  updatedAt: string;
  recordedByName?: string;
  userRelation?: string;
  customRelationName?: string;
}

interface DagensSmiley {
  id: number;
  childId: number;
  createdBy: number;
  topic: string;
  description?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SmileyTimelineProps {
  entries: DagensSmileyEntry[];
  smiley: DagensSmiley;
  onDeleteEntry?: (entryId: number) => void;
  canDelete?: boolean;
  limit?: number;
  childName?: string;
}

export interface SmileyTimelineRef {
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

// Format date for display (e.g., "Torsdag 8. september, 14:30")
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if it's today or yesterday
  if (date.toDateString() === today.toDateString()) {
    return `I dag, ${date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return `I går, ${date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  }
  
  // Format as Danish date with time
  const weekdays = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'];
  const months = [
    'januar', 'februar', 'marts', 'april', 'maj', 'juni',
    'juli', 'august', 'september', 'oktober', 'november', 'december'
  ];
  
  const weekday = weekdays[date.getDay()];
  const day = date.getDate();
  const month = months[date.getMonth()];
  const time = date.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', hour12: false });
  
  return `${weekday} ${day}. ${month}, ${time}`;
};

export const SmileyTimeline = forwardRef<SmileyTimelineRef, SmileyTimelineProps>(
  ({ entries, smiley, onDeleteEntry, canDelete = false, limit, childName }, ref) => { // eslint-disable-line @typescript-eslint/no-unused-vars
    const [localEntries, setLocalEntries] = useState<DagensSmileyEntry[]>(Array.isArray(entries) ? entries : []);
    const [entryToDelete, setEntryToDelete] = useState<DagensSmileyEntry | null>(null);
    
    // Responsive emoji size
    const emojiSize = useBreakpointValue({ base: 28, md: 36 }) || 28;

    // Update local entries when entries prop changes
    useEffect(() => {
      setLocalEntries(Array.isArray(entries) ? entries : []);
    }, [entries]);

    useImperativeHandle(ref, () => ({
      refresh: () => {
        setLocalEntries(Array.isArray(entries) ? entries : []);
      }
    }));

    // Apply limit if specified and sort by creation date (newest first)
    const safeEntries = Array.isArray(localEntries) ? localEntries : [];
    const displayEntries = (limit ? safeEntries.slice(0, limit) : safeEntries)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const handleDeleteEntry = (entry: DagensSmileyEntry) => {
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
          {displayEntries.map((entry) => {
            return (
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
                      {/* Selected emoji with new attribution format */}
                      <Flex 
                        align="center" 
                        gap={{ base: 1, md: 2 }}
                        flexWrap="wrap"
                      >
                        <OpenMojiEmoji 
                          unicode={entry.selectedEmoji} 
                          size={emojiSize}
                        />
                        
                        {/* New format: Udfyldt af [Child] sammen med [User, relation] */}
                        <Flex 
                          align="center" 
                          gap={1} 
                          fontSize={{ base: "sm", md: "md" }}
                          flexWrap="wrap"
                        >
                          <Text color="gray.600">Udfyldt af</Text>
                          {childName && (
                            <Badge
                              colorPalette="sage"
                              size={{ base: "xs", md: "sm" }}
                              variant="subtle"
                              borderRadius="full"
                              px={{ base: 1, md: 2 }}
                            >
                              {childName}
                            </Badge>
                          )}
                          <Text color="gray.600">sammen med</Text>
                          <Badge
                            size={{ base: "xs", md: "sm" }}
                            variant="subtle"
                            borderRadius="full"
                            px={{ base: 1, md: 2 }}
                            flexShrink={0}
                            css={{
                              backgroundColor: getContributorColor(entry.recordedByName || 'Unknown'),
                              color: 'white'
                            }}
                          >
                            {entry.recordedByName || 'Ukendt bruger'}
                            {getRelationDisplayName(entry.userRelation, entry.customRelationName) && 
                              `, ${getRelationDisplayName(entry.userRelation, entry.customRelationName)}`
                            }
                          </Badge>
                        </Flex>
                      </Flex>
                    </Flex>
                  </Timeline.Title>
                  
                  <Timeline.Description>
                    <VStack gap={2} align="flex-start" w="full">
                      {/* Date and time info */}
                      <Text fontSize="xs" color="gray.500">
                        {formatDateTime(entry.createdAt)}
                      </Text>
                      
                      {/* Reasoning */}
                      {entry.reasoning && (
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
                            <Text as="span" fontWeight="medium" color="gray.800">
                              {entry.recordedByName || 'Ukendt bruger'}:
                            </Text>
                            {' '}&ldquo;{entry.reasoning}&rdquo;
                          </Text>
                        </Box>
                      )}
                    </VStack>
                  </Timeline.Description>
                </Timeline.Content>
              </Timeline.Item>
            );
          })}
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
            {entryToDelete.reasoning && (
              <Box mt={3} p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" color="gray.600">
                  Begrundelse: &ldquo;{entryToDelete.reasoning}&rdquo;
                </Text>
              </Box>
            )}
          </ErrorDialog>
        )}
      </VStack>
    );
  }
);

SmileyTimeline.displayName = 'SmileyTimeline';
