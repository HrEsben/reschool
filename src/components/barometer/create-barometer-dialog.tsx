"use client";

import { useState } from 'react';
import {
  Box,
  Input,
  VStack,
  Text,
  HStack,
  Button,
  Flex,
  Badge,
  Heading,
  SegmentGroup,
  Slider,
} from '@chakra-ui/react';
import { DialogManager } from '@/components/ui/dialog-manager';
import { showToast } from '@/components/ui/simple-toast';
import { GoNumber } from "react-icons/go";

interface CreateBarometerDialogProps {
  childId: number;
  onBarometerCreated: () => void;
  trigger: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateBarometerDialog({ childId, onBarometerCreated, trigger, isOpen, onOpenChange }: CreateBarometerDialogProps) {
  const [topic, setTopic] = useState('');
  const [scaleMin, setScaleMin] = useState(1);
  const [scaleMax, setScaleMax] = useState(5);
  const [displayType, setDisplayType] = useState(['numbers']);
  const [percentageValue, setPercentageValue] = useState([50]); // For slider preview
  const [loading, setLoading] = useState(false);

  // Auto-set scale when display type changes
  const handleDisplayTypeChange = (newDisplayType: string[]) => {
    setDisplayType(newDisplayType);
    if (newDisplayType[0] === 'smileys') {
      setScaleMin(1);
      setScaleMax(5);
    }
  };

  // Calculate color based on rating position in scale
  const getRatingColor = (rating: number) => {
    let range, position;
    
    if (displayType[0] === 'percentage') {
      // For percentage, always use 0-100 range
      range = 100;
      position = rating / 100; // 0 to 1
    } else {
      // For numbers and smileys, use the current scale
      range = scaleMax - scaleMin;
      position = (rating - scaleMin) / range; // 0 to 1
    }
    
    if (position <= 0.5) {
      // Red to Yellow (0 to 0.5)
      const ratio = position * 2; // 0 to 1
      const red = 255;
      const green = Math.round(255 * ratio);
      const blue = 0;
      return `rgb(${red}, ${green}, ${blue})`;
    } else {
      // Yellow to Green (0.5 to 1)
      const ratio = (position - 0.5) * 2; // 0 to 1
      const red = Math.round(255 * (1 - ratio));
      const green = 255;
      const blue = 0;
      return `rgb(${red}, ${green}, ${blue})`;
    }
  };

  const getSmiley = (rating: number) => {
    const range = scaleMax - scaleMin;
    const position = (rating - scaleMin) / range;
    
    if (position <= 0.2) {
      // Sad face
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1" fill="currentColor"/>
          <circle cx="16" cy="10" r="1" fill="currentColor"/>
          <path d="M8 16s1.5-2 4-2 4 2 4 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    }
    if (position <= 0.4) {
      // Slightly sad face
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1" fill="currentColor"/>
          <circle cx="16" cy="10" r="1" fill="currentColor"/>
          <line x1="8" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    if (position <= 0.6) {
      // Neutral face
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1" fill="currentColor"/>
          <circle cx="16" cy="10" r="1" fill="currentColor"/>
          <line x1="8" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="1.5"/>
        </svg>
      );
    }
    if (position <= 0.8) {
      // Slightly happy face
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1" fill="currentColor"/>
          <circle cx="16" cy="10" r="1" fill="currentColor"/>
          <path d="M8 14s1.5 1 4 1 4-1 4-1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    }
    // Very happy face
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
        <circle cx="8" cy="10" r="1" fill="currentColor"/>
        <circle cx="16" cy="10" r="1" fill="currentColor"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    );
  };

  const generatePreviewRating = () => {
    const currentDisplayType = displayType[0] || 'numbers';
    
    if (currentDisplayType === 'smileys') {
      const buttons = [];
      const maxButtons = Math.min(scaleMax - scaleMin + 1, 8); // Limit for preview
      const step = maxButtons < (scaleMax - scaleMin + 1) ? Math.ceil((scaleMax - scaleMin + 1) / maxButtons) : 1;
      
      for (let i = scaleMin; i <= scaleMax; i += step) {
        if (buttons.length >= maxButtons) break;
        const color = getRatingColor(i);
        buttons.push(
          <Button
            key={i}
            variant="outline"
            size="sm"
            minW="45px"
            h="45px"
            fontSize="lg"
            cursor="default"
            borderColor={color}
            color={color}
            _hover={{}}
          >
            {getSmiley(i)}
          </Button>
        );
      }
      return (
        <Flex flexWrap="wrap" gap={2} justifyContent="space-evenly" alignItems="center" width="100%">
          {buttons}
        </Flex>
      );
    } else if (currentDisplayType === 'percentage') {
      // For percentage, show a simple message since we have the interactive slider above
      return (
        <Box textAlign="center" p={4} bg="gray.50" borderRadius="md">
          <Text fontSize="sm" color="gray.600">
            Brugere vil se en slider som den ovenfor til at vælge procent
          </Text>
        </Box>
      );
    } else {
      // Numbers display
      const buttons = [];
      const maxButtons = Math.min(scaleMax - scaleMin + 1, 10); // Limit for preview
      const step = maxButtons < (scaleMax - scaleMin + 1) ? Math.ceil((scaleMax - scaleMin + 1) / maxButtons) : 1;
      
      for (let i = scaleMin; i <= scaleMax; i += step) {
        if (buttons.length >= maxButtons) break;
        const color = getRatingColor(i);
        buttons.push(
          <Button
            key={i}
            variant="outline"
            size="sm"
            minW="40px"
            h="40px"
            fontSize="sm"
            fontWeight="bold"
            cursor="default"
            borderColor={color}
            color={color}
            _hover={{}}
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
    }
  };

  const handleSubmit = async () => {
    if (!topic.trim()) {
      showToast({
        title: 'Fejl',
        description: 'Emne er påkrævet',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    if (scaleMin >= scaleMax) {
      showToast({
        title: 'Fejl',
        description: 'Minimum skal være mindre end maksimum',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    if (scaleMax > 100) {
      showToast({
        title: 'Fejl',
        description: 'Maksimum kan ikke være højere end 100',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      // Set scale values based on display type
      let finalScaleMin = scaleMin;
      let finalScaleMax = scaleMax;
      
      if (displayType[0] === 'percentage') {
        finalScaleMin = 0;
        finalScaleMax = 100;
      }
      
      const response = await fetch(`/api/children/${childId}/barometers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          scaleMin: finalScaleMin,
          scaleMax: finalScaleMax,
          displayType: displayType[0] || 'numbers',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create barometer');
      }

      showToast({
        title: 'Succes',
        description: 'Barometer oprettet',
        type: 'success',
        duration: 3000,
      });

      // Reset form
      setTopic('');
      setScaleMin(1);
      setScaleMax(5);
      setDisplayType(['numbers']);
      
      if (onOpenChange) {
        onOpenChange(false);
      }
      onBarometerCreated();
    } catch (error) {
      console.error('Error creating barometer:', error);
      showToast({
        title: 'Fejl',
        description: 'Kunne ikke oprette barometer',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form
    setTopic('');
    setScaleMin(1);
    setScaleMax(5);
    setDisplayType(['numbers']);
    
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  return (
    <DialogManager
      trigger={trigger}
      title="Opret nyt barometer" 
      primaryAction={{
        label: "Opret barometer",
        onClick: handleSubmit,
        isDisabled: !topic.trim() || scaleMin >= scaleMax
      }}
      secondaryAction={{
        label: "Annuller",
        onClick: handleCancel
      }}
      maxWidth="4xl"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <HStack gap={0} align="start">
        {/* Form Section */}
        <VStack gap={4} align="stretch" flex={1} pr={6}>
          <Box>
            <Text mb={2} fontWeight="medium">Emne</Text>
            <Input
              placeholder="Hvad skal barometeret måle? (f.eks. 'Humør', 'Energi', 'Fokus')"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              maxLength={255}
            />
          </Box>
          
          <Box>
            <Text mb={2} fontWeight="medium">Visningstype</Text>
            <SegmentGroup.Root 
              value={displayType[0]} 
              onValueChange={(details) => {
                if (details.value) {
                  handleDisplayTypeChange([details.value]);
                }
              }}
              size="md"
            >
              <SegmentGroup.Indicator />
              <SegmentGroup.Item value="numbers">
                <SegmentGroup.ItemText>
                  <HStack gap={2}>
                    <GoNumber size={18} />
                    <Text>Tal</Text>
                  </HStack>
                </SegmentGroup.ItemText>
                <SegmentGroup.ItemHiddenInput />
              </SegmentGroup.Item>
              <SegmentGroup.Item value="smileys">
                <SegmentGroup.ItemText>
                  <HStack gap={2}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <circle cx="8" cy="10" r="1" fill="currentColor"/>
                      <circle cx="16" cy="10" r="1" fill="currentColor"/>
                      <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    </svg>
                    <Text>Smileys</Text>
                  </HStack>
                </SegmentGroup.ItemText>
                <SegmentGroup.ItemHiddenInput />
              </SegmentGroup.Item>
              <SegmentGroup.Item value="percentage">
                <SegmentGroup.ItemText>
                  <HStack gap={2}>
                    <Text fontSize="lg" fontWeight="bold">%</Text>
                    <Text>Procent</Text>
                  </HStack>
                </SegmentGroup.ItemText>
                <SegmentGroup.ItemHiddenInput />
              </SegmentGroup.Item>
            </SegmentGroup.Root>
          </Box>
          
          {displayType[0] !== 'percentage' && (
            <Box>
              <Text mb={2} fontWeight="medium">Skala</Text>
              <SegmentGroup.Root 
                value={`${scaleMin}-${scaleMax}`}
                onValueChange={(details) => {
                  if (details.value) {
                    const [min, max] = details.value.split('-').map(Number);
                    setScaleMin(min);
                    setScaleMax(max);
                  }
                }}
                size="md"
              >
                <SegmentGroup.Indicator />
                <SegmentGroup.Item value="1-5">
                  <SegmentGroup.ItemText>1 til 5</SegmentGroup.ItemText>
                  <SegmentGroup.ItemHiddenInput />
                </SegmentGroup.Item>
                {displayType[0] !== 'smileys' && (
                  <SegmentGroup.Item value="1-10">
                    <SegmentGroup.ItemText>1 til 10</SegmentGroup.ItemText>
                    <SegmentGroup.ItemHiddenInput />
                  </SegmentGroup.Item>
                )}
              </SegmentGroup.Root>
            </Box>
          )}
          
          {displayType[0] === 'percentage' && (
            <Box>
              <Text mb={2} fontWeight="medium">Slider Preview</Text>
              <VStack gap={4} align="stretch">
                <Box textAlign="center">
                  <Text fontSize="4xl" fontWeight="bold" color={getRatingColor(percentageValue[0])}>
                    {percentageValue[0]}%
                  </Text>
                </Box>
                <Slider.Root 
                  value={percentageValue} 
                  onValueChange={(details) => setPercentageValue(details.value)}
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
            </Box>
          )}
        </VStack>

        {/* Vertical Divider */}
        <Box w="1px" bg="gray.200" alignSelf="stretch" minH="400px" />

        {/* Preview Section */}
        <VStack gap={4} align="stretch" flex={1} pl={6}>
          <Text fontSize="sm" fontWeight="medium" color="gray.700">
            Forhåndsvisning:
          </Text>
          
          <VStack gap={3} align="stretch">
            {/* Mini Barometer Preview */}
            <Box 
              bg="white" 
              borderRadius="md" 
              border="1px solid" 
              borderColor="gray.200" 
              p={3}
              shadow="sm"
            >
              <VStack gap={3} align="stretch">
                {/* Header */}
                <HStack justify="space-between">
                  <Heading 
                    size="sm" 
                    color={topic.trim() ? "black" : "gray.400"}
                  >
                    {topic.trim() || "Emne"}
                  </Heading>
                  <HStack gap={1}>
                    <Badge colorScheme="gray" fontSize="xs">
                      {scaleMin}-{scaleMax}
                    </Badge>
                    <Badge colorScheme="blue" fontSize="xs">
                      {displayType[0] || 'numbers'}
                    </Badge>
                  </HStack>
                </HStack>
                
                {/* Rating Preview */}
                <Box>
                  <Text mb={2} fontWeight="medium" fontSize="xs" color="gray.600">
                    Hvordan er det i dag? ({scaleMin} = lavest, {scaleMax} = højest)
                  </Text>
                  {generatePreviewRating()}
                </Box>
                
                {/* Example comment area */}
                <Box>
                  <Text mb={1} fontWeight="medium" fontSize="xs" color="gray.600">
                    Kommentar (valgfri)
                  </Text>
                  <Box 
                    h="6" 
                    bg="gray.50" 
                    borderRadius="sm" 
                    border="1px solid" 
                    borderColor="gray.200"
                    display="flex"
                    alignItems="center"
                    px={2}
                  >
                    <Text fontSize="xs" color="gray.400">Tilføj en kort kommentar...</Text>
                  </Box>
                </Box>
              </VStack>
            </Box>
            
            {scaleMax - scaleMin > 15 && (
              <Text fontSize="xs" color="gray.600" fontStyle="italic">
                * Forhåndsvisning viser kun et udvalg af knapper
              </Text>
            )}
          </VStack>
        </VStack>
      </HStack>
    </DialogManager>
  );
}
