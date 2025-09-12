"use client";

import React, { useState } from 'react';
import {
  Button,
  Text,
  VStack,
  SimpleGrid,
  Textarea,
  useBreakpointValue,
  Steps,
  Box
} from '@chakra-ui/react';
import { DialogManager } from '@/components/ui/dialog-manager';
import { OpenMojiEmoji } from '@/components/ui/openmoji-emoji';
import { SMILEY_OPTIONS, getSmileyByUnicode } from '@/lib/openmoji';

interface SmileySelectionDialogProps {
  trigger: React.ReactNode;
  smileyTopic: string;
  onSubmit: (emoji: string, reasoning: string) => Promise<void>;
  loading?: boolean;
}

export const SmileySelectionDialog: React.FC<SmileySelectionDialogProps> = ({
  trigger,
  smileyTopic,
  onSubmit,
  loading = false
}) => {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Responsive settings
  const isMobile = useBreakpointValue({ base: true, md: false });
  const gridColumns = useBreakpointValue({ base: 4, sm: 6, md: 8 });

  const handleEmojiSelect = (emoji: string) => {
    console.log('Selected emoji:', emoji, 'Current selected:', selectedEmoji); // Debug log
    setSelectedEmoji(selectedEmoji === emoji ? null : emoji);
  };

  const handleStepChange = (details: { step: number }) => {
    // Only allow step changes based on our business logic
    if (details.step === 1 && selectedEmoji) {
      setCurrentStep(1);
    } else if (details.step === 0) {
      setCurrentStep(0);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 0 && selectedEmoji) {
      setCompletedSteps(prev => new Set(prev).add(0));
      setCurrentStep(1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 1) {
      setCurrentStep(0);
    }
  };

  const handleSubmit = async () => {
    if (!selectedEmoji || !reasoning.trim()) return;
    
    try {
      setCompletedSteps(prev => new Set(prev).add(1));
      await onSubmit(selectedEmoji, reasoning);
      // Reset form and close dialog
      setSelectedEmoji(null);
      setReasoning('');
      setCurrentStep(0);
      setCompletedSteps(new Set());
      setIsOpen(false);
    } catch (error) {
      // Error handling is done in parent component
      console.error('Error submitting smiley:', error);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setIsOpen(false);
      // Reset form when closing
      setSelectedEmoji(null);
      setReasoning('');
      setCurrentStep(0);
    }
  };

  return (
    <DialogManager
      trigger={trigger}
      title={`Dagens smiley - ${smileyTopic}`}
      type="default"
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      maxWidth="600px"
      primaryAction={
        currentStep === 0
          ? {
              label: "Vælg smiley",
              onClick: handleNextStep,
              colorScheme: "sage",
              isDisabled: !selectedEmoji,
              preventAutoClose: true
            }
          : {
              label: "Gem smiley",
              onClick: handleSubmit,
              colorScheme: "sage",
              isLoading: loading,
              loadingText: "Gemmer...",
              isDisabled: !selectedEmoji || !reasoning.trim()
            }
      }
      secondaryAction={
        currentStep === 0
          ? {
              label: "Annuller",
              onClick: handleClose,
              isDisabled: loading
            }
          : {
              label: "Tilbage",
              onClick: handlePrevStep,
              isDisabled: loading
            }
      }
    >
      <VStack gap={6} align="stretch">
        {/* Steps Component */}
        <Steps.Root 
          step={currentStep} 
          count={2} 
          variant="subtle" 
          size={"sm"}
          onStepChange={handleStepChange}
          css={{
            // Custom styling to match site's sage color palette
            "--steps-indicator-bg": "var(--cambridge-blue-100)",
            "--steps-indicator-color": "var(--cambridge-blue-700)", 
            "--steps-active-indicator-bg": "var(--cambridge-blue-500)",
            "--steps-active-indicator-color": "white",
            "--steps-complete-indicator-bg": "var(--cambridge-blue-600)",
            "--steps-complete-indicator-color": "white",
            "--steps-separator-bg": "var(--cambridge-blue-200)",
            "--steps-active-separator-bg": "var(--cambridge-blue-400)"
          }}
        >
          <Steps.List>
            <Steps.Item index={0}>
              <Steps.Trigger>
                <Steps.Indicator />
                {/* <Steps.Title>Vælg smiley</Steps.Title> */}
              </Steps.Trigger>
              <Steps.Separator />
            </Steps.Item>
            <Steps.Item index={1}>
              <Steps.Trigger>
                <Steps.Indicator />
                {/* <Steps.Title>Beskriv dit valg</Steps.Title> */}
              </Steps.Trigger>
            </Steps.Item>
          </Steps.List>
        </Steps.Root>

        {/* Step Content */}
        {currentStep === 0 && (
          <VStack gap={4} align="stretch">
            <Text fontSize="md" fontWeight="medium" color="gray.700" textAlign="center">
              {smileyTopic}: Hvilken smiley passer bedst i dag?
            </Text>
            
            {/* Smiley Selection Grid */}
            <SimpleGrid columns={gridColumns} gap={3}>
              {SMILEY_OPTIONS.map((option) => (
                <Button
                  key={option.unicode}
                  type="button"
                  variant="outline"
                  size="lg"
                  h={isMobile ? "64px" : "72px"}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEmojiSelect(option.unicode);
                  }}
                  bg={selectedEmoji === option.unicode ? "sage.50" : "white"}
                  borderColor={selectedEmoji === option.unicode ? "sage.400" : "gray.200"}
                  color={selectedEmoji === option.unicode ? "sage.600" : "gray.600"}
                  _hover={{
                    borderColor: "sage.300",
                    bg: "sage.25",
                    transform: "scale(1.05)"
                  }}
                  _active={{
                    transform: "scale(0.95)"
                  }}
                  transition="all 0.2s"
                  title={`${option.name} - ${option.description}`}
                >
                  <OpenMojiEmoji 
                    unicode={option.unicode} 
                    size={isMobile ? 32 : 40}
                  />
                </Button>
              ))}
            </SimpleGrid>
          </VStack>
        )}

        {currentStep === 1 && selectedEmoji && (
          <VStack gap={4} align="stretch">
            {/* Selected Smiley Display */}
            <Box 
              textAlign="center" 
              p={4} 
              bg="sage.50" 
              borderRadius="lg" 
              border="1px solid"
              borderColor="sage.200"
            >
              <OpenMojiEmoji 
                unicode={selectedEmoji} 
                size={64}
                mb={2}
              />
              <Text fontSize="sm" color="gray.600">
                Du valgte: {getSmileyByUnicode(selectedEmoji)?.name}
              </Text>
            </Box>

            {/* Reasoning Input */}
            <VStack gap={3} align="stretch">
              <Text fontSize="md" fontWeight="medium" color="gray.700">
                Hvorfor har du valgt denne smiley?
              </Text>
              <Textarea
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                placeholder="Skriv her hvorfor du valgte denne smiley..."
                rows={4}
                resize="vertical"
                autoFocus
              />
            </VStack>
          </VStack>
        )}
      </VStack>
    </DialogManager>
  );
};
