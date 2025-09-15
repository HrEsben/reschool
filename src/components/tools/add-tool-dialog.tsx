"use client";

import { useState } from 'react';
import {
  Text,
  VStack,
  HStack,
  CheckboxCard,
} from '@chakra-ui/react';
import { DialogManager } from '@/components/ui/dialog-manager';
import { CreateBarometerDialog } from '@/components/barometer/create-barometer-dialog';
import { CreateDagensSmileyDialog } from '@/components/dagens-smiley/create-dagens-smiley-dialog';
import { CreateSengetiderDialog } from '@/components/sengetider/create-sengetider-dialog';
import { Thermometer, Smile, Bed, Wrench } from 'lucide-react';

interface AddToolDialogProps {
  childId: number;
  childName: string;
  onToolAdded: () => void;
  trigger: React.ReactNode;
  isUserAdmin?: boolean;
}

interface ToolOption {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  available: boolean;
}

const availableTools: ToolOption[] = [
  {
    id: 'barometer',
    name: 'Barometer',
    description: 'Log daglige stemninger og følelser med en simpel skala',
    icon: Thermometer,
    available: true,
  },
  {
    id: 'dagens-smiley',
    name: 'Dagens smiley',
    description: 'Vælg en smiley og forklar hvorfor du valgte den',
    icon: Smile,
    available: true,
  },
  {
    id: 'sengetider',
    name: 'Sengetider',
    description: 'Spor barnets sengetider og rutiner',
    icon: Bed,
    available: true,
  },
  // Future tools can be added here
  // {
  //   id: 'habit-tracker',
  //   name: 'Vanetræner',
  //   description: 'Spor daglige vaner og rutiner',
  //   icon: CheckSquare,
  //   available: false,
  // }
];

export function AddToolDialog({ childId, childName, onToolAdded, trigger, isUserAdmin = false }: AddToolDialogProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreateSmileyDialog, setShowCreateSmileyDialog] = useState(false);
  const [showCreateSengetiderDialog, setShowCreateSengetiderDialog] = useState(false);
  const [mainDialogOpen, setMainDialogOpen] = useState(false);

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
  };

  const handleProceed = () => {
    if (selectedTool === 'barometer') {
      setMainDialogOpen(false); // Close main dialog first
      setTimeout(() => setShowCreateDialog(true), 100); // Then open create dialog
    } else if (selectedTool === 'dagens-smiley') {
      setMainDialogOpen(false); // Close main dialog first
      setTimeout(() => setShowCreateSmileyDialog(true), 100); // Then open smiley create dialog
    } else if (selectedTool === 'sengetider') {
      setMainDialogOpen(false); // Close main dialog first
      setTimeout(() => setShowCreateSengetiderDialog(true), 100); // Then open sengetider create dialog
    }
    // Future tools will have their own handlers
  };

  const handleToolCreated = () => {
    setShowCreateDialog(false);
    setShowCreateSmileyDialog(false);
    setShowCreateSengetiderDialog(false);
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

          <VStack gap={3} align="stretch">
            {availableTools.map((tool) => (
              <CheckboxCard.Root
                key={tool.id}
                checked={selectedTool === tool.id}
                disabled={!tool.available}
                onCheckedChange={(details) => {
                  if (tool.available && details.checked) {
                    handleToolSelect(tool.id);
                  } else if (!details.checked && selectedTool === tool.id) {
                    setSelectedTool(null);
                  }
                }}
                outline="none"
                _focus={{ outline: "none", boxShadow: "none" }}
                _focusVisible={{ outline: "none", boxShadow: "none" }}
                opacity={tool.available ? 1 : 0.6}
                width="100%"
              >
                <CheckboxCard.HiddenInput />
                <CheckboxCard.Control>
                  <CheckboxCard.Content>
                    <HStack gap={3} align="center">
                      {tool.icon ? (
                        <tool.icon size={20} className="text-gray-600" />
                      ) : (
                        <Wrench size={20} className="text-gray-600" />
                      )}
                      <VStack align="start" gap={1} flex={1}>
                        <HStack>
                          <CheckboxCard.Label fontSize="sm" fontWeight="medium" color={tool.available ? 'gray.800' : 'gray.500'}>
                            {tool.name}
                          </CheckboxCard.Label>
                          {!tool.available && (
                            <Text fontSize="xs" color="gray.400" fontWeight="medium">
                              (Kommer snart)
                            </Text>
                          )}
                        </HStack>
                        <CheckboxCard.Description fontSize="sm" color={tool.available ? 'gray.600' : 'gray.400'}>
                          {tool.description}
                        </CheckboxCard.Description>
                      </VStack>
                    </HStack>
                  </CheckboxCard.Content>
                  <CheckboxCard.Indicator />
                </CheckboxCard.Control>
              </CheckboxCard.Root>
            ))}
          </VStack>
        </VStack>
      </DialogManager>

      {/* Barometer Creation Dialog */}
      <CreateBarometerDialog
        childId={childId}
        onBarometerCreated={handleToolCreated}
        trigger={<div />} // Empty trigger since we control it programmatically
        isOpen={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        isUserAdmin={isUserAdmin}
      />

      {/* Dagens Smiley Creation Dialog */}
      <CreateDagensSmileyDialog
        childId={childId}
        onSmileyCreated={handleToolCreated}
        trigger={<div />} // Empty trigger since we control it programmatically
        isOpen={showCreateSmileyDialog}
        onOpenChange={setShowCreateSmileyDialog}
        isUserAdmin={isUserAdmin}
      />

      {/* Sengetider Creation Dialog */}
      <CreateSengetiderDialog
        childId={childId}
        childName={childName}
        onSengetiderCreated={handleToolCreated}
        trigger={<div />} // Empty trigger since we control it programmatically
        isOpen={showCreateSengetiderDialog}
        onOpenChange={setShowCreateSengetiderDialog}
        isUserAdmin={isUserAdmin}
      />
    </>
  );
}
