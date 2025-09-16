"use client";

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Badge,
  Button,
  Separator,
  Icon,
  Accordion
} from '@chakra-ui/react';
import { CheckIcon, AddIcon } from '@/components/ui/icons';
import { IndsatstrappePlan } from '@/lib/database-service';

// Target/goal icon component  
const TargetIcon = () => (
  <svg fill="currentColor" viewBox="0 0 20 20" width="1em" height="1em">
    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 100 12 6 6 0 000-12zm0 2a4 4 0 100 8 4 4 0 000-8zm0 2a2 2 0 100 4 2 2 0 000-4z" clipRule="evenodd" />
  </svg>
);

// Arrow icon component for målsætning
const ArrowIcon = () => (
  <svg fill="currentColor" viewBox="0 0 20 20" width="1em" height="1em">
    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

interface IndsatsrappeCardProps {
  plan: IndsatstrappePlan;
  isUserAdmin: boolean;
  onAddStep?: () => void;
  onCompleteStep?: (stepId: number) => void;
  onEditPlan?: () => void;
  onNextStep?: (stepId: number) => void;
  onPreviousStep?: (stepId: number) => void;
}

export function IndsatsrappeCard({
  plan,
  isUserAdmin,
  onAddStep,
  onCompleteStep,
  onEditPlan,
  onNextStep,
  onPreviousStep
}: IndsatsrappeCardProps) {
  const progressPercentage = plan.totalSteps > 0 ? (plan.completedSteps / plan.totalSteps) * 100 : 0;
  const currentStep = plan.steps.find(step => !step.isCompleted);
  
  // Find previous and next steps for navigation
  const sortedSteps = plan.steps.sort((a, b) => a.stepNumber - b.stepNumber);
  const currentStepIndex = currentStep ? sortedSteps.findIndex(step => step.id === currentStep.id) : -1;
  const previousStep = currentStepIndex > 0 ? sortedSteps[currentStepIndex - 1] : null;
  const nextStep = currentStepIndex >= 0 && currentStepIndex < sortedSteps.length - 1 ? sortedSteps[currentStepIndex + 1] : null;
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString('da-DK');
    } catch {
      return null;
    }
  };

  return (
    <Box 
      bg="bg.surface" 
      borderRadius="xl" 
      border="1px solid" 
      borderColor="border.muted" 
      p={{ base: 4, md: 6 }}
    >
      <VStack gap={4} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="start">
          <VStack align="start" gap={2}>
            <HStack align="center" gap={3}>
              <Heading size="lg" color="fg.default" fontWeight="600">
                {plan.title}
              </Heading>
              {plan.isActive && (
                <Badge 
                  colorPalette="sage" 
                  size="sm" 
                  variant="solid"
                  borderRadius="full"
                  px={3}
                >
                  Aktiv
                </Badge>
              )}
            </HStack>
            
            {plan.description && (
              <Text color="fg.muted" fontSize="sm">
                {plan.description}
              </Text>
            )}
            
            {plan.targetDate && (
              <HStack gap={2} align="center">
                <Icon color="fg.muted" size="sm">
                  <TargetIcon />
                </Icon>
                <Text color="fg.muted" fontSize="sm">
                  Målsættelse: {formatDate(plan.targetDate)}
                </Text>
              </HStack>
            )}
          </VStack>

          {isUserAdmin && (
            <HStack gap={2}>
              {onAddStep && (
                <Button 
                  size="sm" 
                  variant="outline"
                  colorPalette="sage"
                  onClick={onAddStep}
                >
                  <AddIcon />
                  Tilføj trin
                </Button>
              )}
              {onEditPlan && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={onEditPlan}
                >
                  Rediger
                </Button>
              )}
            </HStack>
          )}
        </HStack>

        <Separator />

        {/* Progress Overview */}
        <VStack gap={3} align="stretch">
          <HStack justify="space-between" align="center">
            <Text fontSize="sm" fontWeight="medium" color="fg.default">
              Fremskridt
            </Text>
            <Text fontSize="sm" color="fg.muted">
              {plan.completedSteps} af {plan.totalSteps} trin fuldført
            </Text>
          </HStack>
          
          {/* Simple progress bar */}
          <Box 
            w="100%" 
            h="8px" 
            bg="gray.200" 
            borderRadius="full" 
            overflow="hidden"
          >
            <Box
              h="100%"
              w={`${progressPercentage}%`}
              bg="sage.500"
              borderRadius="full"
              transition="width 0.3s ease"
            />
          </Box>
        </VStack>

        {/* Current Step */}
        {currentStep && (
          <>
            <Separator />
            <VStack gap={3} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="fg.default">
                Nuværende trin
              </Text>
              
              <Box 
                p={4} 
                bg="sage.50" 
                borderRadius="lg"
                border="1px solid"
                borderColor="sage.200"
              >
                <VStack gap={3} align="stretch">
                  <VStack align="start" gap={2}>
                    <HStack gap={2} align="center">
                      <Badge 
                        colorPalette="sage" 
                        size="xs" 
                        variant="solid"
                        borderRadius="full"
                      >
                        Trin {currentStep.stepNumber}
                      </Badge>
                      <Text fontSize="sm" fontWeight="medium">
                        {currentStep.title}
                      </Text>
                    </HStack>
                    
                    {currentStep.description && (
                      <Text fontSize="xs" color="fg.muted">
                        {currentStep.description}
                      </Text>
                    )}
                    
                    {currentStep.målsætning && (
                      <VStack align="start" gap={1} mt={2}>
                        <Badge 
                          colorPalette="sage" 
                          variant="subtle" 
                          size="xs"
                          px={2}
                          py={1}
                          borderRadius="md"
                          fontSize="xs"
                          fontWeight="semibold"
                          ml={-1}
                        >
                          Målsætning
                        </Badge>
                        <Text fontSize="xs" color="fg.default" pl={1}>
                          {currentStep.målsætning}
                        </Text>
                      </VStack>
                    )}
                  </VStack>

                  {/* Navigation Buttons */}
                  {isUserAdmin && (
                    <HStack gap={2} justify="flex-end" pt={2}>
                      {previousStep && onPreviousStep && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          colorScheme="gray"
                          onClick={() => onPreviousStep(currentStep.id)}
                        >
                          ← Forrige trin
                        </Button>
                      )}
                      {onNextStep && (
                        <Button 
                          size="sm" 
                          variant="solid"
                          colorScheme="sage"
                          onClick={() => onNextStep(currentStep.id)}
                        >
                          {nextStep ? 'Næste trin →' : 'Fuldfør trinnet ✓'}
                        </Button>
                      )}
                    </HStack>
                  )}
                </VStack>
              </Box>
            </VStack>
          </>
        )}

        {/* All Steps Overview */}
        {plan.steps.length > 0 && (
          <>
            <Separator />
            <VStack gap={3} align="stretch">
              <Text fontSize="sm" fontWeight="medium" color="fg.default">
                Alle trin ({plan.steps.length})
              </Text>
              
              <Accordion.Root collapsible>
                {plan.steps.map((step) => {
                  const isCurrentStep = step.id === currentStep?.id;
                  const isCompleted = step.isCompleted;
                  
                  return (
                    <Accordion.Item key={step.id} value={`step-${step.id}`}>
                      <Accordion.ItemTrigger
                        bg={isCompleted ? "green.50" : isCurrentStep ? "sage.50" : "transparent"}
                        borderColor={isCompleted ? "green.200" : isCurrentStep ? "sage.200" : "gray.200"}
                        _hover={{
                          bg: isCompleted ? "green.100" : isCurrentStep ? "sage.100" : "gray.50"
                        }}
                      >
                        <HStack gap={3} align="center" flex={1}>
                          <Badge 
                            size="md" 
                            variant={isCompleted ? "solid" : isCurrentStep ? "solid" : "outline"}
                            colorPalette={isCompleted ? "green" : isCurrentStep ? "sage" : "gray"}
                            borderRadius="full"
                            minW="10"
                            h="10"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            position="relative"
                            fontSize="sm"
                          >
                            {step.stepNumber}
                            {isCurrentStep && !isCompleted && (
                              <Box
                                position="absolute"
                                top="-1"
                                right="-1"
                                w="3"
                                h="3"
                                bg="sage.500"
                                borderRadius="full"
                                border="2px solid white"
                              />
                            )}
                          </Badge>
                          <Text 
                            fontSize="md" 
                            fontWeight="medium"
                            color={isCompleted ? "green.700" : isCurrentStep ? "sage.700" : "fg.default"}
                            flex={1}
                            textAlign="left"
                          >
                            {step.title}
                          </Text>
                          {isCompleted && (
                            <Icon color="green.600" size="sm">
                              <CheckIcon />
                            </Icon>
                          )}
                          {isCurrentStep && !isCompleted && (
                            <Badge 
                              colorPalette="sage" 
                              variant="subtle" 
                              size="xs"
                              px={2}
                              borderRadius="full"
                            >
                              Aktiv
                            </Badge>
                          )}
                        </HStack>
                        <Accordion.ItemIndicator />
                      </Accordion.ItemTrigger>
                    
                    <Accordion.ItemContent>
                      <Accordion.ItemBody>
                        <Box pl={14} pr={4} pb={3}>
                          <VStack align="start" gap={4}>
                            {/* Step Description */}
                            {step.description && (
                              <Text fontSize="md" color="fg.default" lineHeight="1.6">
                                {step.description}
                              </Text>
                            )}
                            
                            {/* Step Målsætning */}
                            {step.målsætning && (
                              <VStack align="start" gap={2}>
                                <Badge 
                                  colorPalette="sage" 
                                  variant="subtle" 
                                  size="sm"
                                  px={3}
                                  py={1}
                                  borderRadius="md"
                                  fontSize="sm"
                                  fontWeight="semibold"
                                  ml={-2}
                                >
                                  Målsætning
                                </Badge>
                                <Text fontSize="md" color="fg.default" lineHeight="1.6">
                                  {step.målsætning}
                                </Text>
                              </VStack>
                            )}
                            
                            {step.isCompleted && step.completedAt && (
                              <Text fontSize="sm" color="green.600" fontWeight="medium">
                                Fuldført {formatDate(step.completedAt)}
                                {step.completedByName && ` af ${step.completedByName}`}
                              </Text>
                            )}
                          </VStack>
                        </Box>
                      </Accordion.ItemBody>
                    </Accordion.ItemContent>
                  </Accordion.Item>
                  );
                })}
              </Accordion.Root>
            </VStack>
          </>
        )}

        {/* Empty State */}
        {plan.steps.length === 0 && isUserAdmin && (
          <Box 
            textAlign="center" 
            py={6}
            border="2px dashed"
            borderColor="gray.200"
            borderRadius="lg"
          >
            <VStack gap={2}>
              <Text color="fg.muted" fontSize="sm">
                Ingen trin endnu
              </Text>
              {onAddStep && (
                <Button 
                  size="sm" 
                  colorPalette="sage"
                  onClick={onAddStep}
                >
                  <AddIcon />
                  Tilføj første trin
                </Button>
              )}
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
