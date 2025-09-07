"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Flex,
  Textarea,
  Heading,
  Icon,
  Slider,
  Badge,
} from '@chakra-ui/react';
import { showToast } from '@/components/ui/simple-toast';
import { DialogManager } from '@/components/ui/dialog-manager';
import { FiEdit2 } from 'react-icons/fi';
import { MdSettings } from "react-icons/md";

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

interface Barometer {
  id: number;
  childId: number;
  createdBy: number;
  topic: string;
  scaleMin: number;
  scaleMax: number;
  displayType: string;
  smileyType?: string;
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
}

export function BarometerCard({ barometer, onEntryRecorded, onBarometerDeleted, onBarometerEdit, currentUserId, isUserAdmin }: BarometerCardProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingBarometer, setDeletingBarometer] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteEntryDialog, setShowDeleteEntryDialog] = useState(false);

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
  const canDeleteEntry = barometer.latestEntry && (
    isUserAdmin || barometer.latestEntry.recordedBy === currentUserId
  );

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleSubmit = async () => {
    if (selectedRating === null) {
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
          rating: selectedRating,
          comment: comment.trim() || undefined,
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

  const handleDeleteEntry = () => {
    if (!barometer.latestEntry) return;
    setShowDeleteEntryDialog(true);
  };

  const confirmDeleteEntry = async () => {
    if (!barometer.latestEntry) return;

    setDeleting(true);
    try {
      const response = await fetch(
        `/api/barometers/${barometer.id}/entries/${barometer.latestEntry.id}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      showToast({
        title: 'Succes',
        description: 'Vurdering slettet',
        type: 'success',
        duration: 3000,
      });

      setSelectedRating(null);
      setComment('');
      setShowDeleteEntryDialog(false);
      onEntryRecorded();
    } catch (error) {
      console.error('Error deleting entry:', error);
      showToast({
        title: 'Fejl',
        description: 'Kunne ikke slette vurdering',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setDeleting(false);
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
    for (let i = barometer.scaleMin; i <= barometer.scaleMax; i++) {
      const color = getRatingColor(i);
      buttons.push(
        <Button
          key={i}
          variant={selectedRating === i ? "solid" : "outline"}
          bg={selectedRating === i ? color : "transparent"}
          color={selectedRating === i ? "white" : "gray.800"}
          borderColor={color}
          size="lg"
          onClick={() => handleRatingClick(i)}
          minW="50px"
          h="50px"
          fontSize="lg"
          fontWeight="bold"
          _hover={{
            bg: selectedRating === i ? color : `${color}20`,
            borderColor: color,
            color: selectedRating === i ? "white" : "gray.800"
          }}
        >
          {i}
        </Button>
      );
    }
    return (
      <Flex flexWrap="wrap" gap={2} justifyContent="space-evenly" alignItems="center" width="100%">
        {buttons}
      </Flex>
    );
  };

  const generateSmileyRating = () => {
    const buttons = [];
    for (let i = barometer.scaleMin; i <= barometer.scaleMax; i++) {
      const color = getRatingColor(i);
      buttons.push(
        <Button
          key={i}
          variant={selectedRating === i ? "solid" : "outline"}
          bg={selectedRating === i ? color : "transparent"}
          color={selectedRating === i ? "white" : "gray.800"}
          borderColor={color}
          size="lg"
          onClick={() => handleRatingClick(i)}
          minW="60px"
          h="60px"
          fontSize="2xl"
          _hover={{
            bg: selectedRating === i ? color : `${color}20`,
            borderColor: color,
            color: selectedRating === i ? "white" : "gray.800"
          }}
        >
          {getSmiley(i)}
        </Button>
      );
    }
    return (
      <VStack gap={4} align="stretch" width="100%">
        <Flex flexWrap="wrap" gap={2} justifyContent="space-evenly" alignItems="center" width="100%">
          {buttons}
        </Flex>
      </VStack>
    );
  };

  const generatePercentageRating = () => {
    const currentValue = selectedRating !== null ? [selectedRating] : [50];
    const color = getRatingColor(currentValue[0]);
    
    return (
      <VStack gap={4} align="stretch" width="100%">
        <Box textAlign="center">
          <Text fontSize="6xl" fontWeight="bold" color="gray.800">
            {currentValue[0]}%
          </Text>
        </Box>
        <Slider.Root 
          value={currentValue} 
          onValueChange={(details) => setSelectedRating(details.value[0])}
          min={0}
          max={100}
          step={10}
          colorPalette="green"
          size="lg"
        >
          <Slider.Control>
            <Slider.Track>
              <Slider.Range />
            </Slider.Track>
            <Slider.Thumb index={0}>
              <Slider.HiddenInput />
            </Slider.Thumb>
          </Slider.Control>
          <Slider.Marks marks={[0, 25, 50, 75, 100]} />
        </Slider.Root>
      </VStack>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK');
  };

  const handleEditBarometer = () => {
    if (onBarometerEdit) {
      onBarometerEdit(barometer);
    }
  };

  return (
    <Box 
      bg="white" 
      borderRadius="lg" 
      border="1px solid" 
      borderColor="gray.200" 
      shadow="sm"
    >
      <Box p={4} borderBottom="1px solid" borderColor="gray.100">
        <HStack justify="space-between">
                    <Heading size="md">{barometer.topic}</Heading>
          <HStack gap={2}>
            <Button
              variant="ghost"
              size="sm"
              colorScheme="blue"
              onClick={handleEditBarometer}
              title="Rediger barometer"
              p={1}
              minW="auto"
            >
              <Icon>
                <MdSettings size={16} />
              </Icon>
            </Button>
            {isUserAdmin && (
              <Button
                variant="ghost"
                size="sm"
                colorScheme="red"
                onClick={handleDeleteBarometer}
                loading={deletingBarometer}
                title="Slet barometer"
                p={1}
                minW="auto"
              >
                <Icon>
                  <svg fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </Icon>
              </Button>
            )}
          </HStack>
        </HStack>
      </Box>
      
      <Box p={4}>
        <VStack gap={4} align="stretch">
          {/* Rating Display */}
          <Box>
            <Text mb={3} fontWeight="medium" fontSize="sm" color="gray.600">
              Hvordan er det i dag? ({barometer.scaleMin} = lavest, {barometer.scaleMax} = højest)
            </Text>
            {generateRatingDisplay()}
          </Box>

          {/* Comment */}
          <Box>
            <Text mb={2} fontWeight="medium" fontSize="sm" color="gray.600">
              Kommentar (valgfri)
            </Text>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tilføj en kort kommentar..."
              size="sm"
              maxLength={500}
              rows={2}
            />
          </Box>

          {/* Action Buttons */}
          <HStack gap={2}>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              loading={loading}
              disabled={selectedRating === null}
              flex={1}
            >
              {hasEntryToday ? 'Opdater vurdering' : 'Registrer vurdering'}
            </Button>
            
            {canDeleteEntry && (
              <Button
                variant="outline"
                colorScheme="red"
                onClick={handleDeleteEntry}
                loading={deleting}
                size="sm"
              >
                <Icon>
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                </Icon>
              </Button>
            )}
          </HStack>

          {/* Latest Entry Info */}
          {barometer.latestEntry && (
            <Box mt={4} p={3} bg="gray.50" borderRadius="md">
              <Text fontSize="sm" color="gray.600" mb={1}>
                Seneste registrering: {formatDate(barometer.latestEntry.entryDate)}
              </Text>
              <HStack>
                <Badge colorScheme="blue" size="sm">
                  {barometer.latestEntry.rating}/{barometer.scaleMax}
                </Badge>
                {barometer.recordedByName && (
                  <Text fontSize="xs" color="gray.500">
                    af {barometer.recordedByName}
                  </Text>
                )}
              </HStack>
              {barometer.latestEntry.comment && (
                <Text fontSize="sm" color="gray.700" mt={2} fontStyle="italic">
                  &ldquo;{barometer.latestEntry.comment}&rdquo;
                </Text>
              )}
            </Box>
          )}
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
          isDisabled: deletingBarometer
        }}
        secondaryAction={{
          label: "Annuller",
          onClick: () => setShowDeleteDialog(false)
        }}
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
      >
        <VStack gap={4} align="stretch">
          <Text>
            Er du sikker på, at du vil slette barometeret <strong>"{barometer.topic}"</strong>?
          </Text>
          <Text fontSize="sm" color="red.600">
            ⚠️ Denne handling kan ikke fortrydes. Alle data og registreringer for dette barometer vil blive permanent slettet.
          </Text>
        </VStack>
      </DialogManager>

      {/* Delete Entry Confirmation Dialog */}
      <DialogManager
        trigger={<Button style={{ display: 'none' }}>Hidden Trigger</Button>}
        title="Slet Vurdering"
        primaryAction={{
          label: "Slet",
          onClick: confirmDeleteEntry,
          isLoading: deleting,
          isDisabled: deleting
        }}
        secondaryAction={{
          label: "Annuller",
          onClick: () => setShowDeleteEntryDialog(false)
        }}
        isOpen={showDeleteEntryDialog}
        onOpenChange={setShowDeleteEntryDialog}
      >
        <VStack gap={4} align="stretch">
          <Text>
            Er du sikker på, at du vil slette din vurdering for i dag?
          </Text>
          <Text fontSize="sm" color="orange.600">
            ⚠️ Denne handling kan ikke fortrydes.
          </Text>
        </VStack>
      </DialogManager>
    </Box>
  );
}
