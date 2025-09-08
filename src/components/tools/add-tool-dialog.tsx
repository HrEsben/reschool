"use client";

import { useState } from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  Grid,
} from '@chakra-ui/react';
import { DialogManager } from '@/components/ui/dialog-manager';
import { CreateBarometerDialog } from '@/components/barometer/create-barometer-dialog';

interface AddToolDialogProps {
  childId: number;
  onToolAdded: () => void;
  trigger: React.ReactNode;
}

interface ToolOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
}

const availableTools: ToolOption[] = [
  {
    id: 'barometer',
    name: 'Barometer',
    description: 'Log daglige stemninger og følelser med en simpel skala',
    icon: '📊',
    available: true,
  },
  // Future tools can be added here
  // {
  //   id: 'habit-tracker',
  //   name: 'Vanetræner',
  //   description: 'Spor daglige vaner og rutiner',
  //   icon: '✅',
  //   available: false,
  // }
];

export function AddToolDialog({ childId, onToolAdded, trigger }: AddToolDialogProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [mainDialogOpen, setMainDialogOpen] = useState(false);

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };

  const handleProceed = () => {
    if (selectedTool === 'barometer') {
      setMainDialogOpen(false); // Close main dialog first
      setTimeout(() => setShowCreateDialog(true), 100); // Then open create dialog
    }
    // Future tools will have their own handlers
  };

  const handleToolCreated = () => {
    setShowCreateDialog(false);
    setSelectedTool(null);
    setMainDialogOpen(false);
    onToolAdded();
  };

  const handleCancel = () => {
    setSelectedTool(null);
    setMainDialogOpen(false);
  };

  return (
    <>
      <DialogManager
        trigger={trigger}
        title="Tilføj værktøj"
        type="info"
        maxWidth="600px"
        isOpen={mainDialogOpen}
        onOpenChange={setMainDialogOpen}
        primaryAction={
          selectedTool
            ? {
                label: 'Fortsæt',
                onClick: handleProceed,
                colorScheme: 'blue',
              }
            : undefined
        }
        secondaryAction={{
          label: 'Annuller',
          onClick: handleCancel,
          variant: 'outline',
        }}
      >
        <VStack gap={4} align="stretch">
          <Text color="gray.600" fontSize="sm">
            Vælg hvilket værktøj du vil tilføje til barnets profil:
          </Text>

          <Grid templateColumns="1fr" gap={3}>
            {availableTools.map((tool) => (
              <Box
                key={tool.id}
                p={4}
                border="2px solid"
                borderColor={
                  selectedTool === tool.id
                    ? 'blue.300'
                    : tool.available
                    ? 'gray.200'
                    : 'gray.100'
                }
                borderRadius="lg"
                cursor={tool.available ? 'pointer' : 'not-allowed'}
                bg={
                  selectedTool === tool.id
                    ? 'blue.50'
                    : tool.available
                    ? 'white'
                    : 'gray.50'
                }
                opacity={tool.available ? 1 : 0.6}
                _hover={
                  tool.available
                    ? {
                        borderColor: selectedTool === tool.id ? 'blue.400' : 'gray.300',
                        shadow: 'sm',
                      }
                    : {}
                }
                onClick={() => tool.available && handleToolSelect(tool.id)}
              >
                <HStack gap={3}>
                  <Text fontSize="2xl">{tool.icon || '🔧'}</Text>
                  <VStack align="start" gap={1} flex={1}>
                    <HStack>
                      <Text fontWeight="semibold" color={tool.available ? 'gray.800' : 'gray.500'}>
                        {tool.name}
                      </Text>
                      {!tool.available && (
                        <Text fontSize="xs" color="gray.400" fontWeight="medium">
                          (Kommer snart)
                        </Text>
                      )}
                    </HStack>
                    <Text fontSize="sm" color={tool.available ? 'gray.600' : 'gray.400'}>
                      {tool.description}
                    </Text>
                  </VStack>
                  {selectedTool === tool.id && (
                    <Box color="blue.500">
                      <Icon boxSize={5}>
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </Icon>
                    </Box>
                  )}
                </HStack>
              </Box>
            ))}
          </Grid>
        </VStack>
      </DialogManager>

      {/* Barometer Creation Dialog */}
      <CreateBarometerDialog
        childId={childId}
        onBarometerCreated={handleToolCreated}
        trigger={<div />} // Empty trigger since we control it programmatically
        isOpen={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}
