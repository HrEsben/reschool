"use client";

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Skeleton
} from '@chakra-ui/react';
import { AddIcon } from '@/components/ui/icons';
import { IndsatsrappeCard } from './indsatstrappe-card';
import { CreateIndsatsrappeDialog } from './create-indsatstrappe-dialog';
import { EditIndsatsrappeDialog } from './edit-indsatstrappe-dialog';
import { AddMultipleStepsDialog } from './add-multiple-steps-dialog';
import { useActiveIndsatstrappe, useCompleteIndsatsStep, useUncompleteIndsatsStep } from '@/lib/queries';
import { showToast } from '@/components/ui/simple-toast';

interface IndsatsrappeManagerProps {
  childId: number;
  childName: string;
  isUserAdmin: boolean;
}

export function IndsatsrappeManager({
  childId,
  childName,
  isUserAdmin
}: IndsatsrappeManagerProps) {
  const [isAddStepsDialogOpen, setIsAddStepsDialogOpen] = useState(false);
  const [isEditPlanDialogOpen, setIsEditPlanDialogOpen] = useState(false);
  
  // Fetch active indsatstrappe plan
  const { 
    data: activePlan, 
    isLoading, 
    error: queryError 
  } = useActiveIndsatstrappe(childId.toString());
  
  const completeStepMutation = useCompleteIndsatsStep();
  const uncompleteStepMutation = useUncompleteIndsatsStep();
  
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Der opstod en fejl') : null;

  const handleAddStep = () => {
    setIsAddStepsDialogOpen(true);
  };

  const handleCompleteStep = async (stepId: number) => {
    if (!activePlan) return;
    
    try {
      await completeStepMutation.mutateAsync({
        stepId,
        planId: activePlan.id,
        childId: childId.toString()
      });
      
      showToast({
        title: "Trin fuldført",
        description: "Trinnet er markeret som fuldført",
        type: "success"
      });
    } catch {
      showToast({
        title: "Fejl",
        description: "Kunne ikke fuldføre trinnet",
        type: "error"
      });
    }
  };

  const handleNextStep = async (stepId: number) => {
    // Complete the current step and move to next
    await handleCompleteStep(stepId);
  };

  const handlePreviousStep = async () => {
    if (!activePlan) return;
    
    try {
      // Find the current step and the previous step
      const sortedSteps = activePlan.steps.sort((a, b) => a.stepNumber - b.stepNumber);
      const currentStep = activePlan.steps.find(step => !step.isCompleted);
      const currentStepIndex = currentStep ? sortedSteps.findIndex(step => step.id === currentStep.id) : -1;
      const previousStep = currentStepIndex > 0 ? sortedSteps[currentStepIndex - 1] : null;
      
      if (!previousStep) return;
      
      // Uncomplete the previous step to make it the new current step
      await uncompleteStepMutation.mutateAsync({
        stepId: previousStep.id,
        planId: activePlan.id,
        childId: childId.toString()
      });
      
      showToast({
        title: "Trin markeret som ikke-fuldført",
        description: "Du er gået tilbage til det forrige trin",
        type: "success"
      });
    } catch {
      showToast({
        title: "Fejl",
        description: "Kunne ikke gå til forrige trin",
        type: "error"
      });
    }
  };

  const handleEditPlan = () => {
    setIsEditPlanDialogOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <Box 
        bg="bg.surface" 
        borderRadius="xl" 
        border="1px solid" 
        borderColor="border.muted" 
        p={{ base: 4, md: 6 }}
      >
        <VStack gap={4} align="stretch">
          <HStack justify="space-between" align="center">
            <VStack align="start" gap={2}>
              <Skeleton height="28px" width="200px" />
              <Skeleton height="16px" width="320px" />
            </VStack>
            <Skeleton height="32px" width="100px" />
          </HStack>
          
          <Skeleton height="1px" width="100%" />
          
          <VStack gap={3} align="stretch">
            <Skeleton height="20px" width="150px" />
            <Skeleton height="8px" width="100%" />
          </VStack>
          
          <VStack gap={2} align="stretch">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="48px" width="100%" />
            ))}
          </VStack>
        </VStack>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box 
        bg="bg.surface" 
        borderRadius="xl" 
        border="1px solid" 
        borderColor="border.muted" 
        p={{ base: 4, md: 6 }}
      >
        <VStack gap={4} align="stretch">
          <Heading size="lg" color="fg.default" fontWeight="600">
            Indsatstrappe
          </Heading>
          
          <Box 
            p={4} 
            bg="red.50" 
            borderRadius="lg"
            border="1px solid"
            borderColor="red.200"
          >
            <Text color="red.600" fontSize="sm">
              {error}
            </Text>
          </Box>
        </VStack>
      </Box>
    );
  }

  // No active plan state
  if (!activePlan) {
    return (
      <Box 
        bg="bg.surface" 
        borderRadius="xl" 
        border="1px solid" 
        borderColor="border.muted" 
        p={{ base: 4, md: 6 }}
      >
        <VStack gap={4} align="stretch">
          <HStack justify="space-between" align="center">
            <VStack align="start" gap={2}>
              <Heading size="lg" color="fg.default" fontWeight="600">
                Indsatstrappe
              </Heading>
              <Text color="fg.muted" fontSize="sm">
                Struktureret handlingsplan for {childName}
              </Text>
            </VStack>
            
            {isUserAdmin && (
              <CreateIndsatsrappeDialog
                trigger={
                  <Button 
                    colorPalette="sage"
                  >
                    <AddIcon />
                    Opret plan
                  </Button>
                }
                childId={childId}
                childName={childName}
                isUserAdmin={isUserAdmin}
                onSuccess={() => {
                  // Refetch will happen automatically through React Query
                }}
              />
            )}
          </HStack>
          
          <Box 
            textAlign="center" 
            py={8}
            border="2px dashed"
            borderColor="gray.200"
            borderRadius="lg"
          >
            <VStack gap={3}>
              <Text color="fg.muted" fontSize="sm" fontWeight="medium">
                Ingen aktiv indsatstrappe
              </Text>
              <Text color="fg.muted" fontSize="sm">
                En indsatstrappe er en struktureret handlingsplan med trin, der viser vejen mod et mål.
                Værktøjsregistreringer kan knyttes til de aktive trin for at give kontekst.
              </Text>
              
              {isUserAdmin && (
                <CreateIndsatsrappeDialog
                  trigger={
                    <Button 
                      size="sm"
                      colorPalette="sage"
                      variant="outline"
                      mt={2}
                    >
                      <AddIcon />
                      Opret første indsatstrappe
                    </Button>
                  }
                  childId={childId}
                  childName={childName}
                  isUserAdmin={isUserAdmin}
                  onSuccess={() => {
                    // Refetch will happen automatically through React Query
                  }}
                />
              )}
            </VStack>
          </Box>
        </VStack>
      </Box>
    );
  }

  // Display active plan
  return (
    <VStack gap={4} align="stretch">
      {/* Section Header */}
      <VStack align="start" gap={2}>
        <Heading size="lg" color="delft-blue.600" fontWeight="600">
          Indsatstrappe
        </Heading>
        <Box className="w-20 h-1 bg-cambridge-blue-500 rounded-full"></Box>
      </VStack>
      
      {/* Active Plan Card */}
      <IndsatsrappeCard
        plan={activePlan}
        isUserAdmin={isUserAdmin}
        onAddStep={handleAddStep}
        onEditPlan={handleEditPlan}
        onNextStep={handleNextStep}
        onPreviousStep={handlePreviousStep}
      />

      {/* Add Multiple Steps Dialog */}
      {activePlan && (
        <AddMultipleStepsDialog
          isOpen={isAddStepsDialogOpen}
          setIsOpen={setIsAddStepsDialogOpen}
          planId={activePlan.id}
          childId={childId.toString()}
          planTitle={activePlan.title}
        />
      )}

      {/* Edit Plan Dialog */}
      {activePlan && (
        <EditIndsatsrappeDialog
          isOpen={isEditPlanDialogOpen}
          setIsOpen={setIsEditPlanDialogOpen}
          plan={activePlan}
          childId={childId}
          childName={childName}
          isUserAdmin={isUserAdmin}
          onSuccess={() => {
            // Refetch will happen automatically through React Query
          }}
        />
      )}
    </VStack>
  );
}
