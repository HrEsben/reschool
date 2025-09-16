"use client";

import { Box, HStack, VStack, Text } from '@chakra-ui/react';
import { IndsatstrappePlan } from '@/lib/database-service';

interface StaircaseProgressProps {
  plan: IndsatstrappePlan;
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
  showProgress?: boolean;
}

export function StaircaseProgress({ 
  plan, 
  size = 'sm', 
  showTitle = true, 
  showProgress = true 
}: StaircaseProgressProps) {
  // Calculate dimensions based on size
  const stepWidth = size === 'sm' ? 12 : size === 'md' ? 16 : 20;
  const stepHeight = size === 'sm' ? 8 : size === 'md' ? 10 : 12;
  const maxSteps = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
  
  // Only show first maxSteps steps to keep it compact
  const visibleSteps = plan.steps.slice(0, maxSteps);
  const hasMoreSteps = plan.steps.length > maxSteps;
  
  // Calculate progress
  const completedCount = plan.steps.filter(step => step.isCompleted).length;
  const totalCount = plan.steps.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <VStack gap={1} align="stretch">
      {/* Title */}
      {showTitle && (
        <Text 
          fontSize={size === 'sm' ? 'xs' : 'sm'} 
          fontWeight="600" 
          color="delft-blue.600"
          truncate
          title={plan.title}
        >
          {plan.title}
        </Text>
      )}
      
      {/* Staircase visualization */}
      <Box position="relative" height={`${visibleSteps.length * stepHeight + 4}px`}>
        <HStack gap={0.5} align="end" height="100%">
          {visibleSteps.map((step, index) => {
            const isCompleted = step.isCompleted;
            const isCurrent = !isCompleted && plan.steps.slice(0, index).every(s => s.isCompleted);
            
            return (
              <Box
                key={step.id}
                width={`${stepWidth}px`}
                height={`${(index + 1) * stepHeight}px`}
                bg={
                  isCompleted 
                    ? "#81b29a" // Completed: sage green
                    : isCurrent 
                    ? "#f2cc8f" // Current: warm yellow
                    : "#e5e5e5" // Not started: light gray
                }
                borderRadius="sm"
                border="1px solid"
                borderColor={
                  isCompleted 
                    ? "#6da085" 
                    : isCurrent 
                    ? "#e6b366" 
                    : "#d0d0d0"
                }
                position="relative"
                _hover={{
                  filter: "brightness(1.05)"
                }}
                transition="all 0.2s ease"
                title={`Trin ${step.stepNumber}: ${step.title}${isCompleted ? ' ✓' : ''}`}
              >
                {/* Step number */}
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  fontSize={size === 'sm' ? '2xs' : 'xs'}
                  fontWeight="bold"
                  color={
                    isCompleted || isCurrent 
                      ? "white" 
                      : "#666"
                  }
                  textShadow={
                    isCompleted || isCurrent 
                      ? "0 1px 2px rgba(0,0,0,0.3)" 
                      : "none"
                  }
                >
                  {isCompleted ? '✓' : step.stepNumber}
                </Box>
              </Box>
            );
          })}
          
          {/* More steps indicator */}
          {hasMoreSteps && (
            <Box
              width={`${stepWidth}px`}
              height={`${visibleSteps.length * stepHeight}px`}
              bg="#f9f9f9"
              borderRadius="sm"
              border="1px dashed"
              borderColor="#ccc"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize={size === 'sm' ? '2xs' : 'xs'}
              color="#666"
              title={`+${totalCount - maxSteps} flere trin`}
            >
              +{totalCount - maxSteps}
            </Box>
          )}
        </HStack>
      </Box>
      
      {/* Progress text */}
      {showProgress && (
        <Text 
          fontSize={size === 'sm' ? '2xs' : 'xs'} 
          color="#666" 
          textAlign="center"
        >
          {completedCount}/{totalCount} trin ({progressPercent}%)
        </Text>
      )}
    </VStack>
  );
}
