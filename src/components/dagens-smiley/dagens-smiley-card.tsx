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
  useBreakpointValue,
  SimpleGrid,
} from '@chakra-ui/react';
import { showToast } from '@/components/ui/simple-toast';
import { DialogManager } from '@/components/ui/dialog-manager';
import { ToggleTip } from '@/components/ui/toggle-tip';
import { SettingsIcon, TrashIcon } from '@/components/ui/icons';
import { SmileyTimeline, SmileyTimelineRef } from '@/components/smiley/smiley-timeline';
import { SMILEY_OPTIONS, getSmileyByUnicode } from '@/lib/openmoji';

interface DagensSmileyEntry {
  id: number;
  smileyId: number;
  recordedBy: number;
  entryDate: string;
  selectedEmoji: string;
  reasoning?: string;
  createdAt: string;
  updatedAt: string;
}

interface AccessUser {
  user_id: number;
  display_name: string;
  email: string;
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
  latestEntry?: DagensSmileyEntry;
  recordedByName?: string;
}

interface DagensSmileyCardProps {
  smiley: DagensSmiley;
  onEntryRecorded: () => void;
  onSmileyDeleted?: () => void;
  onSmileyEdit?: (smiley: DagensSmiley) => void;
  currentUserId?: number;
  isUserAdmin?: boolean;
  onSmileyUpdated?: () => void;
}

export function DagensSmileyCard({ 
  smiley, 
  onEntryRecorded, 
  onSmileyDeleted, 
  onSmileyEdit, 
  currentUserId, // eslint-disable-line @typescript-eslint/no-unused-vars
  isUserAdmin, 
  onSmileyUpdated // eslint-disable-line @typescript-eslint/no-unused-vars
}: DagensSmileyCardProps) {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingSmiley, setDeletingSmiley] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [accessUsers, setAccessUsers] = useState<AccessUser[]>([]);
  const [accessDataLoaded, setAccessDataLoaded] = useState(false);
  const timelineRef = useRef<SmileyTimelineRef>(null);

  // Responsive settings
  const isMobile = useBreakpointValue({ base: true, md: false });
  const smileySize = useBreakpointValue({ base: '32px', md: '40px' });
  const gridColumns = useBreakpointValue({ base: 6, sm: 8, md: 10, lg: 12 });

  // Fetch access data when needed (for lazy loading on hover/click)
  const fetchAccessData = async () => {
    if (accessDataLoaded || smiley.isPublic) return;
    
    try {
      const response = await fetch(`/api/dagens-smiley/${smiley.id}/access`);
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

  // Reset form when smiley changes or when a new entry is recorded
  useEffect(() => {
    setSelectedEmoji(null);
    setReasoning('');
  }, [smiley.id]);

  const handleEmojiSelect = useCallback((emoji: string) => {
    setSelectedEmoji(selectedEmoji === emoji ? null : emoji);
  }, [selectedEmoji]);

  const handleSubmit = async () => {
    if (!selectedEmoji) {
      showToast({
        title: 'Fejl',
        description: 'Vælg venligst en smiley',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/dagens-smiley/${smiley.id}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedEmoji,
          reasoning: reasoning.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record entry');
      }

      showToast({
        title: 'Succes',
        description: 'Din smiley er registreret!',
        type: 'success',
        duration: 3000,
      });

      setSelectedEmoji(null);
      setReasoning('');
      onEntryRecorded();

      // Refresh timeline if it's open
      if (timelineRef.current) {
        timelineRef.current.refresh();
      }
    } catch (error) {
      console.error('Error recording entry:', error);
      showToast({
        title: 'Fejl',
        description: 'Kunne ikke registrere smiley',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSmiley = () => {
    if (onSmileyEdit) {
      onSmileyEdit(smiley);
    }
  };

  const handleDeleteSmiley = async () => {
    setDeletingSmiley(true);
    try {
      const response = await fetch(`/api/dagens-smiley/${smiley.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete smiley');
      }

      showToast({
        title: 'Succes',
        description: 'Dagens smiley slettet',
        type: 'success',
        duration: 3000,
      });

      setShowDeleteDialog(false);
      if (onSmileyDeleted) {
        onSmileyDeleted();
      }
    } catch (error) {
      console.error('Error deleting smiley:', error);
      showToast({
        title: 'Fejl',
        description: 'Kunne ikke slette dagens smiley',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setDeletingSmiley(false);
    }
  };

  const handleDeleteEntry = async (entryId: number) => {
    try {
      const response = await fetch(`/api/dagens-smiley/${smiley.id}/entries/${entryId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      showToast({
        title: 'Succes',
        description: 'Registrering slettet',
        type: 'success',
        duration: 3000,
      });

      // Refresh timeline
      if (timelineRef.current) {
        timelineRef.current.refresh();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      showToast({
        title: 'Fejl',
        description: 'Kunne ikke slette registrering',
        type: 'error',
        duration: 3000,
      });
    }
  };

  // Get visibility info for display
  const getVisibilityInfo = () => {
    if (smiley.isPublic) {
      return {
        text: 'Alle voksne',
        bg: 'green.100',
        color: 'green.700',
        borderColor: 'green.200'
      };
    }

    // For non-public smileys, we need access data
    if (!accessDataLoaded) {
      fetchAccessData();
      return {
        text: 'Begrænset adgang',
        bg: 'orange.100',
        color: 'orange.700',
        borderColor: 'orange.200'
      };
    }

    // Check if it's creator-only (no specific access users)
    if (accessUsers.length === 0) {
      return {
        text: 'Kun dig',
        bg: 'blue.100',
        color: 'blue.700',
        borderColor: 'blue.200'
      };
    }

    // Show number of users with access
    if (accessUsers.length > 0) {
      const count = accessUsers.length;
      const text = count === 1 ? `${count} voksen` : `${count} voksne`;
      return {
        text,
        bg: 'orange.100',
        color: 'orange.700',
        borderColor: 'orange.200'
      };
    }

    // Fallback
    return {
      text: 'Begrænset adgang',
      bg: 'orange.100',
      color: 'orange.700',
      borderColor: 'orange.200'
    };
  };

  // Get formatted user names for ToggleTip content
  const getToggleTipContent = () => {
    if (smiley.isPublic) {
      return (
        <VStack gap={1} align="start">
          <Text fontSize="sm" fontWeight="medium" color="gray.700">Alle voksne</Text>
          <Text fontSize="xs" color="gray.500">Alle voksne tilknyttet barnet kan se dette værktøj</Text>
        </VStack>
      );
    }

    if (!accessDataLoaded) {
      return (
        <Text fontSize="sm" color="gray.600">Indlæser adgangsoplysninger...</Text>
      );
    }

    if (accessUsers.length === 0) {
      return (
        <VStack gap={1} align="start">
          <Text fontSize="sm" fontWeight="medium" color="gray.700">Kun dig</Text>
          <Text fontSize="xs" color="gray.500">Kun du kan se dette værktøj</Text>
        </VStack>
      );
    }

    const maxShow = 5;
    const showUsers = accessUsers.slice(0, maxShow);
    const remaining = accessUsers.length - maxShow;

    return (
      <VStack gap={1} align="start">
        <Text fontSize="sm" fontWeight="medium" color="gray.700">Har adgang:</Text>
        {showUsers.map((user, index) => (
          <Text key={index} fontSize="xs" color="gray.600">{user.display_name}</Text>
        ))}
        {remaining > 0 && (
          <Text fontSize="xs" color="gray.500">+{remaining} flere</Text>
        )}
      </VStack>
    );
  };

  const visibilityInfo = getVisibilityInfo();

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
            <Heading 
              size="md" 
              color="navy.800"
              lineClamp={1}
              wordBreak="break-word"
            >
              {smiley.topic}
            </Heading>
            {smiley.description && (
              <Text fontSize="sm" color="gray.600" lineClamp={2}>
                {smiley.description}
              </Text>
            )}
          </VStack>
          <HStack gap={2}>
            {/* Visibility Badge */}
            <ToggleTip 
              content={getToggleTipContent()}
              onOpenChange={(open) => { if (open) fetchAccessData(); }}
            >
              <Box
                as="button"
                px={2}
                py={1}
                borderRadius="md"
                bg={visibilityInfo.bg}
                color={visibilityInfo.color}
                border="1px solid"
                borderColor={visibilityInfo.borderColor}
                fontSize="xs"
                fontWeight="medium"
                cursor="help"
                _hover={{ opacity: 0.8 }}
              >
                {visibilityInfo.text}
              </Box>
            </ToggleTip>

            {isUserAdmin && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditSmiley}
                  title="Rediger dagens smiley"
                  p={1}
                  minW="auto"
                  color="navy.600"
                  _hover={{ bg: "navy.50", color: "navy.700" }}
                >
                  <SettingsIcon size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  title="Slet dagens smiley"
                  p={1}
                  minW="auto"
                  color="red.600"
                  _hover={{ bg: "red.50", color: "red.700" }}
                >
                  <TrashIcon size={16} />
                </Button>
              </>
            )}
          </HStack>
        </Flex>
      </Box>

      {/* Content */}
      <Box p={6}>
        <VStack gap={6} align="stretch">
          {/* Latest Entry Display */}
          {smiley.latestEntry && (
            <Box
              bg="sage.50"
              p={4}
              borderRadius="lg"
              border="1px solid"
              borderColor="sage.200"
            >
              <VStack gap={2} align="start">
                <HStack gap={2} align="center">
                  <Text fontSize="sm" fontWeight="medium" color="sage.700">
                    Seneste valg:
                  </Text>
                  <Text fontSize="2xl">{smiley.latestEntry.selectedEmoji}</Text>
                  <Text fontSize="sm" color="gray.600">
                    {new Date(smiley.latestEntry.entryDate).toLocaleDateString('da-DK')}
                  </Text>
                </HStack>
                {smiley.latestEntry.reasoning && (
                  <Text fontSize="sm" color="gray.700">
                    <strong>Begrundelse:</strong> {smiley.latestEntry.reasoning}
                  </Text>
                )}
                {smiley.recordedByName && (
                  <Text fontSize="xs" color="gray.500">
                    Registreret af: {smiley.recordedByName}
                  </Text>
                )}
              </VStack>
            </Box>
          )}

          {/* Smiley Selection */}
          <VStack gap={4} align="stretch">
            <Text fontSize="md" fontWeight="medium" color="gray.700">
              Hvordan føler du dig omkring {smiley.topic.toLowerCase()} i dag?
            </Text>
            
            <SimpleGrid columns={gridColumns} gap={2}>
              {SMILEY_OPTIONS.map((option) => (
                <Button
                  key={option.unicode}
                  variant="outline"
                  size="lg"
                  fontSize={smileySize}
                  h={isMobile ? "48px" : "56px"}
                  onClick={() => handleEmojiSelect(option.unicode)}
                  bg={selectedEmoji === option.unicode ? "blue.50" : "white"}
                  borderColor={selectedEmoji === option.unicode ? "blue.400" : "gray.200"}
                  color={selectedEmoji === option.unicode ? "blue.600" : "gray.600"}
                  _hover={{
                    borderColor: "blue.300",
                    bg: "blue.25",
                    transform: "scale(1.05)"
                  }}
                  _active={{
                    transform: "scale(0.95)"
                  }}
                  transition="all 0.2s"
                  title={`${option.name} - ${option.description}`}
                >
                  {option.unicode}
                </Button>
              ))}
            </SimpleGrid>
          </VStack>

          {/* Reasoning Input */}
          {selectedEmoji && (
            <VStack gap={3} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Hvorfor valgte du denne smiley? {getSmileyByUnicode(selectedEmoji)?.unicode}
              </Text>
              <Textarea
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                placeholder="Beskriv hvorfor du føler dig sådan..."
                resize="vertical"
                minH="80px"
                bg="white"
                borderColor="gray.200"
                _focus={{
                  borderColor: "blue.400",
                  boxShadow: "0 0 0 1px var(--chakra-colors-blue-400)"
                }}
              />
            </VStack>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            loading={loading}
            loadingText="Gemmer..."
            colorScheme="blue"
            size="lg"
            disabled={!selectedEmoji}
            _disabled={{
              opacity: 0.6,
              cursor: 'not-allowed'
            }}
          >
            Gem min smiley
          </Button>

          {/* Timeline */}
          <SmileyTimeline
            ref={timelineRef}
            entries={[]} // You'll need to fetch entries separately or pass them as prop
            smiley={smiley}
            canDelete={isUserAdmin}
            onDeleteEntry={handleDeleteEntry}
          />
        </VStack>
      </Box>

      {/* Delete Dialog */}
      <DialogManager
        trigger={<></>}
        title="Slet dagens smiley"
        type="error"
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        primaryAction={{
          label: deletingSmiley ? "Sletter..." : "Slet",
          onClick: handleDeleteSmiley,
          isLoading: deletingSmiley,
          colorScheme: "red"
        }}
        secondaryAction={{
          label: "Annuller",
          onClick: () => setShowDeleteDialog(false),
          colorScheme: "gray"
        }}
      >
        <VStack gap={4} align="start">
          <Text>
            Er du sikker på, at du vil slette <strong>&ldquo;{smiley.topic}&rdquo;</strong>?
          </Text>
          <Text fontSize="sm" color="gray.600">
            Dette vil slette værktøjet og alle tilhørende indgange permanent. 
            Denne handling kan ikke fortrydes.
          </Text>
        </VStack>
      </DialogManager>
    </Box>
  );
}
