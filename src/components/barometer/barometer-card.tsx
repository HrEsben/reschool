"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Flex,
  Textarea,
  Heading,
  Slider,
} from '@chakra-ui/react';
import { showToast } from '@/components/ui/simple-toast';
import { DialogManager } from '@/components/ui/dialog-manager';
import { VisibilityBadge } from '@/components/ui/visibility-badge';
import { CompactDatePicker } from '@/components/ui/compact-date-picker';
import { BarometerTimeline, BarometerTimelineRef } from './barometer-timeline-wrapper';
import { SettingsIcon, TrashIcon } from '@/components/ui/icons';

interface BarometerEntry {
  id: number;
  barometerId: number;
  recordedBy: number;
  entryDate: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

interface AccessUser {
  user_id: number;
  display_name: string;
  email: string;
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
  latestEntry?: BarometerEntry;
  recordedByName?: string;
}

interface BarometerCardProps {
  barometer: Barometer;
  onEntryRecorded: () => void;
  onBarometerDeleted?: () => void;
  onBarometerEdit?: (barometer: Barometer) => void;
  currentUserId?: number;
  isUserAdmin?: boolean;
  onBarometerUpdated?: () => void;
}

export function BarometerCard({ 
  barometer, 
  onEntryRecorded, 
  onBarometerDeleted, 
  onBarometerEdit, 
  currentUserId, 
  isUserAdmin, 
  onBarometerUpdated // eslint-disable-line @typescript-eslint/no-unused-vars
}: BarometerCardProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingBarometer, setDeletingBarometer] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [accessUsers, setAccessUsers] = useState<AccessUser[]>([]);
  const [accessDataLoaded, setAccessDataLoaded] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    // Use a stable date to prevent hydration mismatches
    const today = new Date();
    today.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues
    return today;
  });
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []); // Default to today
  const timelineRef = useRef<BarometerTimelineRef>(null);

  // Fetch access data when needed (for lazy loading on hover/click)
  const fetchAccessData = async () => {
    if (accessDataLoaded || barometer.isPublic) return;
    
    try {
      const response = await fetch(`/api/barometers/${barometer.id}/access`);
      if (response.ok) {
        const data = await response.json();
        setAccessUsers(data.accessUsers || []);
      }
    } catch (error) {
      console.error('Error fetching access data:', error);
    } finally {
      setAccessDataLoaded(true);
    }
  };

  // Refresh access data (clear cache and refetch)
  const refreshAccessData = useCallback(async () => {
    setAccessDataLoaded(false);
    setAccessUsers([]);
    
    // Only fetch if not public
    if (!barometer.isPublic) {
      try {
        const response = await fetch(`/api/barometers/${barometer.id}/access`);
        if (response.ok) {
          const data = await response.json();
          setAccessUsers(data.accessUsers || []);
        }
      } catch (error) {
        console.error('Error fetching access data:', error);
      } finally {
        setAccessDataLoaded(true);
      }
    } else {
      setAccessDataLoaded(true);
    }
  }, [barometer.id, barometer.isPublic]);

  // Load access data immediately on mount for non-public barometers
  useEffect(() => {
    refreshAccessData();
  }, [refreshAccessData]);

  // Calculate color based on rating position in scale using site's color palette
  const getRatingColor = (rating: number) => {
    const range = barometer.scaleMax - barometer.scaleMin;
    const position = (rating - barometer.scaleMin) / range; // 0 to 1
    
    if (position <= 0.5) {
      // Coral to Golden (0 to 0.5) - using site's coral and golden colors
      const ratio = position * 2; // 0 to 1
      // From coral (#e07a5f) to golden (#f2cc8f)
      const red = Math.round(224 + (242 - 224) * ratio);
      const green = Math.round(122 + (204 - 122) * ratio);
      const blue = Math.round(95 + (143 - 95) * ratio);
      return `rgb(${red}, ${green}, ${blue})`;
    } else {
      // Golden to Sage (0.5 to 1) - using site's golden and sage colors
      const ratio = (position - 0.5) * 2; // 0 to 1
      // From golden (#f2cc8f) to sage (#81b29a)
      const red = Math.round(242 + (129 - 242) * ratio);
      const green = Math.round(204 + (178 - 204) * ratio);
      const blue = Math.round(143 + (154 - 143) * ratio);
      return `rgb(${red}, ${green}, ${blue})`;
    }
  };

  const isToday = (dateString: string) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  const hasEntryToday = barometer.latestEntry && isToday(barometer.latestEntry.entryDate);

  // Pre-populate form if there's an entry today
  useEffect(() => {
    if (hasEntryToday && barometer.latestEntry) {
      setSelectedRating(barometer.latestEntry.rating);
      setComment(barometer.latestEntry.comment || '');
    }
  }, [hasEntryToday, barometer.latestEntry]);

  const handleRatingClick = async (rating: number) => {
    setSelectedRating(rating);
    
    // Automatically save rating change if there's already an entry today
    if (hasEntryToday) {
      try {
        const response = await fetch(`/api/barometers/${barometer.id}/entries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rating: rating,
            comment: comment.trim() || undefined,
          }),
        });

        if (response.ok) {
          // Refresh timeline to show updated rating
          timelineRef.current?.refresh();
          onEntryRecorded(); // Update parent component
        }
      } catch (error) {
        console.error('Error auto-updating rating:', error);
      }
    }
  };

  const handleSubmit = async () => {
    // Determine the rating to use - current selection or existing rating for updates
    const ratingToUse = selectedRating !== null ? selectedRating : 
                       (hasEntryToday && barometer.latestEntry ? barometer.latestEntry.rating : null);
    
    if (ratingToUse === null) {
      showToast({
        title: 'Fejl',
        description: 'Vælg venligst en vurdering',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/barometers/${barometer.id}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: ratingToUse,
          comment: comment.trim() || undefined,
          entryDate: selectedDate.toISOString().split('T')[0], // Add the selected date in YYYY-MM-DD format
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record entry');
      }

      showToast({
        title: 'Succes',
        description: hasEntryToday ? 'Vurdering opdateret' : 'Vurdering registreret',
        type: 'success',
        duration: 3000,
      });

      // Reset comment field after successful submission
      setComment('');
      // Refresh timeline to show new/updated entry
      timelineRef.current?.refresh();
      onEntryRecorded();
    } catch (error) {
      console.error('Error recording entry:', error);
      showToast({
        title: 'Fejl',
        description: 'Kunne ikke registrere vurdering',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBarometer = () => {
    if (!isUserAdmin) return;
    setShowDeleteDialog(true);
  };

  const confirmDeleteBarometer = async () => {
    setDeletingBarometer(true);
    try {
      const response = await fetch(`/api/barometers/${barometer.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete barometer');
      }

      showToast({
        title: 'Succes',
        description: 'Barometer slettet',
        type: 'success',
        duration: 3000,
      });

      setShowDeleteDialog(false);
      if (onBarometerDeleted) {
        onBarometerDeleted();
      }
    } catch (error) {
      console.error('Error deleting barometer:', error);
      showToast({
        title: 'Fejl',
        description: 'Kunne ikke slette barometer',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setDeletingBarometer(false);
    }
  };

  const getSmiley = (rating: number) => {
    const range = barometer.scaleMax - barometer.scaleMin;
    const position = (rating - barometer.scaleMin) / range;
    const smileyType = barometer.smileyType || 'emojis';
    
    // Get emoji based on smiley type
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
            <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
            <path d="M8 16s1.5-2 4-2 4 2 4 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        );
      }
      if (position <= 0.4) {
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
            <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
            <path d="M8 15.5s1.5-1 4-1 4 1 4 1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        );
      }
      if (position <= 0.6) {
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
            <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
            <line x1="8" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      }
      if (position <= 0.8) {
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
            <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
            <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
            <path d="M8 14s1.5 1.5 4 1.5 4-1.5 4-1.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        );
      }
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 15s1.5-2 4-2 4 2 4 2"/>
            <path d="M9 9h.01"/>
            <path d="M15 9h.01"/>
          </svg>
        );
      }
      if (position <= 0.4) {
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14.5s1.5-1 4-1 4 1 4 1"/>
            <path d="M9 9h.01"/>
            <path d="M15 9h.01"/>
          </svg>
        );
      }
      if (position <= 0.6) {
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14h8"/>
            <path d="M9 9h.01"/>
            <path d="M15 9h.01"/>
          </svg>
        );
      }
      if (position <= 0.8) {
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 1 4 1 4-1 4-1"/>
            <path d="M9 9h.01"/>
            <path d="M15 9h.01"/>
          </svg>
        );
      }
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <path d="M9 9h.01"/>
          <path d="M15 9h.01"/>
        </svg>
      );
    }
    
    // Fallback to original design
    if (position <= 0.2) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1" fill="currentColor"/>
          <circle cx="16" cy="10" r="1" fill="currentColor"/>
          <path d="M8 16s1.5-2 4-2 4 2 4 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    }
    if (position <= 0.4) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1" fill="currentColor"/>
          <circle cx="16" cy="10" r="1" fill="currentColor"/>
          <line x1="8" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    if (position <= 0.6) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1" fill="currentColor"/>
          <circle cx="16" cy="10" r="1" fill="currentColor"/>
          <line x1="8" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      );
    }
    if (position <= 0.8) {
      return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1" fill="currentColor"/>
          <circle cx="16" cy="10" r="1" fill="currentColor"/>
          <path d="M8 14s1.5 1 4 1 4-1 4-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    }
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
        <circle cx="8" cy="10" r="1" fill="currentColor"/>
        <circle cx="16" cy="10" r="1" fill="currentColor"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    );
  };

  const generateRatingDisplay = () => {
    switch (barometer.displayType) {
      case 'smileys':
        return generateSmileyRating();
      case 'percentage':
        return generatePercentageRating();
      default:
        return generateNumberRating();
    }
  };

  const generateNumberRating = () => {
    const buttons = [];
    const scaleLength = barometer.scaleMax - barometer.scaleMin + 1;
    
    for (let i = barometer.scaleMin; i <= barometer.scaleMax; i++) {
      const color = getRatingColor(i);
      buttons.push(
        <Button
          key={i}
          variant={selectedRating === i ? "solid" : "outline"}
          bg={selectedRating === i ? color : { base: `${color}30`, md: "white" }}
          color={selectedRating === i ? "white" : { base: "white", md: "navy.700" }}
          borderColor={selectedRating === i ? color : color}
          borderWidth="2px"
          size={{ base: scaleLength > 7 ? "sm" : "md", md: "lg" }}
          onClick={() => handleRatingClick(i)}
          minW={{ base: scaleLength > 7 ? "35px" : "45px", md: "50px" }}
          h={{ base: scaleLength > 7 ? "35px" : "45px", md: "50px" }}
          fontSize={{ base: scaleLength > 7 ? "sm" : "md", md: "lg" }}
          fontWeight="semibold"
          borderRadius="lg"
          flex="1"
          maxW={{ base: scaleLength > 7 ? "40px" : "50px", md: "none" }}
          _hover={{
            bg: selectedRating === i ? color : "sage.50",
            borderColor: color,
            color: selectedRating === i ? "white" : "navy.700",
            transform: "scale(1.05)"
          }}
          _focus={{
            borderColor: color,
            boxShadow: `0 0 0 1px ${color}`,
            outline: "none"
          }}
          _focusVisible={{
            borderColor: color,
            boxShadow: `0 0 0 1px ${color}`,
            outline: "none"
          }}
          transition="all 0.2s"
        >
          {i}
        </Button>
      );
    }
    return (
      <Flex 
        gap={{ base: 1, md: scaleLength > 5 ? 1 : 1.5 }} 
        justifyContent="space-between" 
        alignItems="center" 
        width="100%"
        maxW="600px"
        mx="auto"
        flexWrap="nowrap"
        overflowX="auto"
        px={{ base: 2, md: 0 }}
      >
        {buttons}
      </Flex>
    );
  };

  const generateSmileyRating = () => {
    const buttons = [];
    const scaleLength = barometer.scaleMax - barometer.scaleMin + 1;
    const smileyType = barometer.smileyType || 'emojis';
    
    for (let i = barometer.scaleMin; i <= barometer.scaleMax; i++) {
      const color = getRatingColor(i);
      // For emoji smileys, we need different color handling since emojis don't respond to CSS color
      const isEmojiType = smileyType === 'emojis';
      
      buttons.push(
        <Button
          key={i}
          variant="ghost"
          bg={selectedRating === i ? color : { base: isEmojiType ? `${color}20` : `${color}15`, md: "cream.50" }}
          color={selectedRating === i ? "white" : { base: isEmojiType ? "initial" : "navy.700", md: "gray.800" }}
          borderColor={selectedRating === i ? color : color}
          borderWidth="2px"
          borderStyle="solid"
          size={{ base: scaleLength > 7 ? "sm" : "md", md: "lg" }}
          onClick={() => handleRatingClick(i)}
          minW={{ base: scaleLength > 7 ? "35px" : "45px", md: "60px" }}
          w={{ base: scaleLength > 7 ? "35px" : "45px", md: "60px" }}
          h={{ base: scaleLength > 7 ? "35px" : "45px", md: "60px" }}
          fontSize={{ base: scaleLength > 7 ? "md" : "lg", md: "2xl" }}
          borderRadius="full"
          flex="0 0 auto"
          _hover={{
            bg: color,
            borderColor: color,
            color: "white",
            transform: "scale(1.1)"
          }}
          _focus={{
            borderColor: color,
            boxShadow: `0 0 0 1px ${color}`,
            outline: "none"
          }}
          _focusVisible={{
            borderColor: color,
            boxShadow: `0 0 0 1px ${color}`,
            outline: "none"
          }}
          transition="all 0.2s"
        >
          {getSmiley(i)}
        </Button>
      );
    }
    return (
      <VStack gap={4} align="stretch" width="100%">
        <Flex 
          gap={{ base: scaleLength > 7 ? 0.5 : 1, md: scaleLength > 5 ? 1 : 1.5 }} 
          justifyContent="space-between" 
          alignItems="center" 
          width="100%"
          maxW="600px"
          mx="auto"
          flexWrap="nowrap"
          px={{ base: 1, md: 0 }}
        >
          {buttons}
        </Flex>
      </VStack>
    );
  };

  const generatePercentageRating = () => {
    const currentValue = selectedRating !== null ? [selectedRating] : [50];
    
    return (
      <VStack gap={4} align="stretch" width="100%">
        <Box textAlign="center">
          <Text fontSize="6xl" fontWeight="bold" color="sage.600">
            {currentValue[0]}%
          </Text>
        </Box>
        <Slider.Root 
          value={currentValue} 
          onValueChange={(details) => setSelectedRating(details.value[0])}
          min={0}
          max={100}
          step={1}
          colorPalette="sage"
          size="lg"
        >
          <Slider.Control>
            <Slider.Track bg="cream.200">
              <Slider.Range bg="linear-gradient(to right, coral.400, golden.400, sage.400)" />
            </Slider.Track>
            <Slider.Thumb 
              index={0}
              bg="white"
              border="3px solid"
              borderColor="sage.500"
            >
              <Slider.HiddenInput />
            </Slider.Thumb>
          </Slider.Control>
          <Slider.Marks marks={[0, 25, 50, 75, 100]} />
        </Slider.Root>
      </VStack>
    );
  };

  const handleEditBarometer = () => {
    if (onBarometerEdit) {
      onBarometerEdit(barometer);
    }
  };

  return (
    <Box 
      bg="white" 
      borderRadius="xl" 
      border="1px solid" 
      borderColor="gray.200" 
      shadow="sm"
      _hover={{ shadow: "md" }}
      transition="all 0.2s"
      overflow="hidden"
    >
      {/* Header */}
      <Box 
        bg="linear-gradient(135deg, #f6f8f6 0%, #eef2ef 50%, #d5e0d6 100%)" 
        px={6} 
        py={4} 
        borderBottomWidth="1px" 
        borderBottomColor="sage.200"
      >
        <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
          <VStack align="start" gap={1} flex={1} minW={0}>
            <Heading size="md" color="sage.800">{barometer.topic || 'Untitled Barometer'}</Heading>
            {barometer.description && (
              <Text fontSize="sm" color="sage.600">
                {barometer.description}
              </Text>
            )}
          </VStack>
          
          <HStack gap={2} flexShrink={0}>
            {/* Visibility Badge */}
            <VisibilityBadge
              isPublic={barometer.isPublic}
              accessUsers={accessUsers}
              fetchAccessData={fetchAccessData}
              accessDataLoaded={accessDataLoaded}
            />

            {/* Action Buttons */}
            {isUserAdmin && (
              <HStack gap={1}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditBarometer}
                  title="Rediger barometer"
                  p={1}
                  minW="auto"
                  color="sage.600"
                  _hover={{ bg: "sage.50", color: "sage.700" }}
                  _focus={{ 
                    bg: "sage.50",
                    boxShadow: "0 0 0 2px var(--chakra-colors-sage-200)",
                    outline: "none"
                  }}
                  _focusVisible={{ 
                    bg: "sage.50",
                    boxShadow: "0 0 0 2px var(--chakra-colors-sage-200)",
                    outline: "none"
                  }}
                  borderRadius="md"
                >
                  <SettingsIcon size="sm" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteBarometer}
                  loading={deletingBarometer}
                  title="Slet barometer"
                  p={1}
                  minW="auto"
                  color="red.600"
                  _hover={{ bg: "red.50", color: "red.700" }}
                  _focus={{ 
                    bg: "red.50",
                    boxShadow: "0 0 0 2px var(--chakra-colors-red-200)",
                    outline: "none"
                  }}
                  _focusVisible={{ 
                    bg: "red.50",
                    boxShadow: "0 0 0 2px var(--chakra-colors-red-200)",
                    outline: "none"
                  }}
                  borderRadius="md"
                >
                  <TrashIcon size="sm" />
                </Button>
              </HStack>
            )}
          </HStack>
        </Flex>
      </Box>
      
      <Box p={4}>
        <VStack gap={4} align="stretch">
          
          {/* Rating Display */}
          <Box>
            {generateRatingDisplay()}
          </Box>

          {/* Comment */}
          <Box>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tilføj en kort kommentar..."
              size="sm"
              maxLength={500}
              rows={2}
              borderColor="cream.300"
              borderRadius="lg"
              bg="cream.25"
              _hover={{ borderColor: "cream.400" }}
              _focus={{ 
                borderColor: "sage.400", 
                boxShadow: "0 0 0 1px var(--chakra-colors-sage-400)",
                outline: "none"
              }}
              _focusVisible={{
                borderColor: "sage.400", 
                boxShadow: "0 0 0 1px var(--chakra-colors-sage-400)",
                outline: "none"
              }}
            />
          </Box>

          {/* Action Buttons */}
          <HStack gap={3}>
            <Button
              onClick={handleSubmit}
              loading={loading}
              title="Gem registrering"
              flex={1}
              size="md"
              fontWeight="medium"
              bg="sage.500"
              color="white"
              _hover={{ bg: "sage.600" }}
              _active={{ bg: "sage.700" }}
              _focus={{ 
                boxShadow: "0 0 0 2px var(--chakra-colors-sage-200)",
                outline: "none"
              }}
              _focusVisible={{ 
                boxShadow: "0 0 0 2px var(--chakra-colors-sage-200)",
                outline: "none"
              }}
              borderRadius="lg"
            >
              {hasEntryToday ? 'Opdater vurdering' : 'Registrer vurdering'}
            </Button>
            
            <CompactDatePicker
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              maxDaysBack={90}
              disabled={loading}
              size="md"
            />
          </HStack>

          {/* Registreringer Timeline */}
          <BarometerTimeline 
            ref={timelineRef} 
            barometer={barometer} 
            maxEntries={10}
            currentUserId={currentUserId}
            isUserAdmin={isUserAdmin}
            onEntryDeleted={onEntryRecorded}
          />
        </VStack>
      </Box>

      {/* Delete Confirmation Dialog */}
      <DialogManager
        trigger={<Button style={{ display: 'none' }}>Hidden Trigger</Button>}
        title="Slet Barometer"
        type="error"
        primaryAction={{
          label: "Slet",
          onClick: confirmDeleteBarometer,
          isLoading: deletingBarometer,
          isDisabled: deletingBarometer,
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
            Er du sikker på, at du vil slette barometeret <strong>&ldquo;{barometer.topic}&rdquo;</strong>?
          </Text>
          <Text fontSize="sm" color="coral.600">
            ⚠️ Denne handling kan ikke fortrydes. Alle data og registreringer for dette barometer vil blive permanent slettet.
          </Text>
        </VStack>
      </DialogManager>
    </Box>
  );
}
