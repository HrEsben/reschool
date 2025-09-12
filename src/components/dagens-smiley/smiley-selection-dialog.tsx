"use client";

import React, { useState } from 'react';
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
  Button,
  Text,
  VStack,
  SimpleGrid,
  Textarea,
  useBreakpointValue
} from '@chakra-ui/react';
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

  // Responsive settings
  const isMobile = useBreakpointValue({ base: true, md: false });
  const gridColumns = useBreakpointValue({ base: 4, sm: 6, md: 8 });
  const smileySize = "3xl"; // Double the size

  const handleEmojiSelect = (emoji: string) => {
    setSelectedEmoji(selectedEmoji === emoji ? null : emoji);
  };

  const handleSubmit = async () => {
    if (!selectedEmoji) return;
    
    try {
      await onSubmit(selectedEmoji, reasoning);
      // Reset form and close dialog
      setSelectedEmoji(null);
      setReasoning('');
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
    }
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={({ open }) => setIsOpen(open)}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      <DialogContent maxWidth="600px">
        <DialogHeader>
          <DialogTitle>
            Dagens smiley - {smileyTopic}
          </DialogTitle>
        </DialogHeader>
        
        <DialogBody>
          <VStack gap={6} align="stretch">
            {/* Question */}
            <Text fontSize="md" fontWeight="medium" color="gray.700" textAlign="center">
              Hvordan føler du dig omkring {smileyTopic.toLowerCase()} i dag?
            </Text>
            
            {/* Smiley Selection Grid */}
            <SimpleGrid columns={gridColumns} gap={3}>
              {SMILEY_OPTIONS.map((option) => (
                <Button
                  key={option.unicode}
                  variant="outline"
                  size="lg"
                  fontSize={smileySize}
                  h={isMobile ? "64px" : "72px"}
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

            {/* Reasoning Input */}
            {selectedEmoji && (
              <VStack gap={3} align="stretch">
                <Text fontSize="sm" fontWeight="medium" color="gray.700">
                  Hvorfor valgte du denne smiley? {getSmileyByUnicode(selectedEmoji)?.unicode}
                </Text>
                <Textarea
                  value={reasoning}
                  onChange={(e) => setReasoning(e.target.value)}
                  placeholder="Fortæl om dine følelser omkring dette emne..."
                  rows={3}
                  resize="vertical"
                />
              </VStack>
            )}
          </VStack>
        </DialogBody>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Annuller
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedEmoji || loading}
            loading={loading}
            loadingText="Gemmer..."
            colorScheme="blue"
          >
            Gem min smiley
          </Button>
        </DialogFooter>
        
        <DialogCloseTrigger 
          disabled={loading}
          aria-label="Luk dialog"
        />
      </DialogContent>
    </DialogRoot>
  );
};
