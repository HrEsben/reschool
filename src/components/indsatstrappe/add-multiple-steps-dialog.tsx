import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Button,
  Box,
  Card,
  Separator,
  IconButton
} from '@chakra-ui/react';
import { DialogManager } from '@/components/ui/dialog-manager';
import { showToast } from '@/components/ui/simple-toast';
import { useAddIndsatsStep } from '@/lib/queries';
import { useQueryClient } from '@tanstack/react-query';
import { PlusIcon, TrashIcon } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
  målsætning: string;
}

interface AddMultipleStepsDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  planId: number;
  childId: string;
  planTitle: string;
}

export function AddMultipleStepsDialog({
  isOpen,
  setIsOpen,
  planId,
  childId,
  planTitle
}: AddMultipleStepsDialogProps) {
  const [steps, setSteps] = useState<Step[]>([
    { id: '1', title: '', description: '', målsætning: '' }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addStepMutation = useAddIndsatsStep();
  const queryClient = useQueryClient();

  const addNewStep = () => {
    const newId = Math.max(...steps.map(s => parseInt(s.id))) + 1;
    setSteps([...steps, { 
      id: newId.toString(), 
      title: '', 
      description: '', 
      målsætning: '' 
    }]);
  };

  const removeStep = (stepId: string) => {
    if (steps.length > 1) {
      setSteps(steps.filter(step => step.id !== stepId));
    }
  };

  const updateStep = (stepId: string, field: keyof Omit<Step, 'id'>, value: string) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, [field]: value } : step
    ));
  };

  const handleSubmit = async () => {
    // Validate that at least one step has a title
    const validSteps = steps.filter(step => step.title.trim());
    
    if (validSteps.length === 0) {
      showToast({
        title: "Fejl",
        description: "Mindst ét trin skal have en titel",
        type: "error"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create steps sequentially to maintain order
      for (const step of validSteps) {
        await addStepMutation.mutateAsync({
          planId,
          childId,
          title: step.title.trim(),
          description: step.description.trim() || undefined,
          målsætning: step.målsætning.trim() || undefined
        });
      }

      // Invalidate queries to refresh the UI
      await queryClient.invalidateQueries({
        queryKey: ['indsatstrappe', 'steps', planId]
      });
      await queryClient.invalidateQueries({
        queryKey: ['indsatstrappe', childId]
      });

      showToast({
        title: "Trin oprettet",
        description: `${validSteps.length} trin er blevet tilføjet til ${planTitle}`,
        type: "success"
      });

      // Reset form
      setSteps([{ id: '1', title: '', description: '', målsætning: '' }]);
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating steps:', error);
      showToast({
        title: "Fejl",
        description: "Kunne ikke oprette trin",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasValidSteps = steps.some(step => step.title.trim());

  return (
    <DialogManager
      trigger={<div style={{ display: 'none' }} />}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      title={`Tilføj trin til ${planTitle}`}
      maxWidth="lg"
      primaryAction={{
        label: isSubmitting ? 'Opretter...' : 'Opret trin',
        onClick: handleSubmit,
        isDisabled: !hasValidSteps || isSubmitting,
        colorScheme: 'sage'
      }}
      secondaryAction={{
        label: 'Annuller',
        onClick: () => setIsOpen(false),
        variant: 'outline'
      }}
    >
      <VStack gap={6} align="stretch">
        {/* Introduction */}
        <Box p={4} bg="sage.50" borderRadius="md" borderLeft="4px solid" borderLeftColor="sage.500">
          <Text fontSize="sm" color="fg.default">
            Tilføj de trin, der skal til for at nå målet med denne handlingsplan. 
            Du kan oprette flere trin på én gang og arrangere dem i den rækkefølge, de skal udføres.
          </Text>
        </Box>

        {/* Steps */}
        <VStack gap={4} align="stretch">
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Trin ({steps.length})
            </Text>
            <Button
              size="sm"
              variant="outline"
              colorScheme="sage"
              onClick={addNewStep}
            >
              <HStack gap={2}>
                <PlusIcon size={16} />
                <Text>Tilføj trin</Text>
              </HStack>
            </Button>
          </HStack>

          {steps.map((step, index) => (
            <Card.Root key={step.id} p={4} bg="gray.50">
              <VStack gap={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <Text fontSize="sm" fontWeight="medium" color="gray.600">
                    Trin {index + 1}
                  </Text>
                  {steps.length > 1 && (
                    <IconButton
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => removeStep(step.id)}
                      aria-label="Fjern trin"
                    >
                      <TrashIcon size={16} />
                    </IconButton>
                  )}
                </HStack>

                <VStack gap={3} align="stretch">
                  {/* Title */}
                  <VStack gap={1} align="stretch">
                    <Text fontSize="sm" fontWeight="medium">
                      Titel <Text as="span" color="red.500">*</Text>
                    </Text>
                    <Input
                      placeholder="F.eks. 'Kontakt skolen for at drøfte fremmøde'"
                      value={step.title}
                      onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                      maxLength={255}
                    />
                  </VStack>

                  {/* Description */}
                  <VStack gap={1} align="stretch">
                    <Text fontSize="sm" fontWeight="medium">Beskrivelse</Text>
                    <Textarea
                      placeholder="Beskriv hvad dette trin indebærer..."
                      value={step.description}
                      onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                      rows={2}
                      resize="vertical"
                    />
                  </VStack>

                  {/* Målsætning */}
                  <VStack gap={1} align="stretch">
                    <Text fontSize="sm" fontWeight="medium">Målsætning</Text>
                    <Textarea
                      placeholder="Hvornår er målet nået? Beskriv hvordan du vil vide at dette trin er gennemført..."
                      value={step.målsætning}
                      onChange={(e) => updateStep(step.id, 'målsætning', e.target.value)}
                      rows={2}
                      resize="vertical"
                    />
                    <Text fontSize="xs" color="fg.muted">
                      Beskriv hvornår og hvordan målet for dette trin er nået
                    </Text>
                  </VStack>
                </VStack>
              </VStack>
            </Card.Root>
          ))}
        </VStack>

        {/* Separator */}
        <Separator />

        {/* Help text */}
        <Box p={3} bg="blue.50" borderRadius="md">
          <VStack gap={2} align="start">
            <Text fontSize="sm" fontWeight="medium" color="blue.800">
              💡 Tips til gode trin:
            </Text>
            <VStack gap={1} align="start" fontSize="xs" color="blue.700">
              <Text>• Vær specifik og handlingsorienteret</Text>
              <Text>• Skriv hvad der skal gøres, hvem der skal gøre det, og hvornår</Text>
              <Text>• Brug klare deadlines for at skabe fremdrift</Text>
              <Text>• Husk at trinene udføres i den rækkefølge, du opretter dem</Text>
            </VStack>
          </VStack>
        </Box>
      </VStack>
    </DialogManager>
  );
}
