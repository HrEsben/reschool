"use client";

import React, { useState, useEffect } from 'react';
import {
  VStack,
  Input,
  Textarea,
  Text,
  Box,
  Button,
  HStack
} from '@chakra-ui/react';
import { DialogManager } from '@/components/ui/dialog-manager';
import { useUpdateIndsatsStep, useDeleteIndsatsStep } from '@/lib/queries';
import { showToast } from '@/components/ui/simple-toast';
import { IndsatsSteps } from '@/lib/database-service';
import { TrashIcon } from '@/components/ui/icons';
import { CustomDatePicker } from '@/components/ui/date-picker';

interface EditStepDialogProps {
  trigger?: React.ReactElement;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  step: IndsatsSteps;
  planId: number;
  childId: string;
  planStartDate: string; // DATE format YYYY-MM-DD from the indsatstrappe plan
  otherSteps: IndsatsSteps[]; // All other steps in the plan (excluding current step)
  onSuccess?: () => void;
  onDelete?: () => void;
}

export function EditStepDialog({
  trigger,
  isOpen: controlledIsOpen,
  setIsOpen: controlledSetIsOpen,
  step,
  planId,
  childId,
  planStartDate,
  otherSteps,
  onSuccess,
  onDelete
}: EditStepDialogProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [title, setTitle] = useState(step.title);
  const [description, setDescription] = useState(step.description || '');
  const [målsætning, setMålsætning] = useState(step.målsætning || '');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Destructure date range for convenience
  const [startDate, targetEndDate] = dateRange;

  // Use controlled or internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledSetIsOpen || setInternalIsOpen;

  const updateStepMutation = useUpdateIndsatsStep();
  const deleteStepMutation = useDeleteIndsatsStep();

  // Initialize form data when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTitle(step.title);
      setDescription(step.description || '');
      setMålsætning(step.målsætning || '');
      // Convert ISO strings to Date objects and set as range
      const start = step.startDate ? new Date(step.startDate) : null;
      const end = step.targetEndDate ? new Date(step.targetEndDate) : null;
      setDateRange([start, end]);
      setShowDeleteConfirm(false);
    }
  }, [isOpen, step]);

  // Helper function to validate if a date is before the plan start date
  const isDateBeforePlanStart = (date: Date | null): boolean => {
    if (!date || !planStartDate) return false;
    
    const planStart = new Date(planStartDate + 'T00:00:00');
    
    return date < planStart;
  };

  // Helper function to format date for display
  const formatPlanStartDate = (): string => {
    if (!planStartDate) return '';
    try {
      return new Date(planStartDate).toLocaleDateString('da-DK');
    } catch {
      return planStartDate;
    }
  };

  // Helper function to get all occupied date ranges from other steps
  const getOccupiedDateRanges = () => {
    const ranges: Array<{stepId: number, stepTitle: string, startDate: Date, endDate?: Date}> = [];
    
    otherSteps.forEach(otherStep => {
      // Add ranges from step's direct startDate/targetEndDate
      if (otherStep.startDate) {
        ranges.push({
          stepId: otherStep.id,
          stepTitle: otherStep.title,
          startDate: new Date(otherStep.startDate),
          endDate: otherStep.targetEndDate ? new Date(otherStep.targetEndDate) : undefined
        });
      }
      
      // Add ranges from step's active periods
      if (otherStep.activePeriods) {
        otherStep.activePeriods.forEach(period => {
          ranges.push({
            stepId: otherStep.id,
            stepTitle: otherStep.title,
            startDate: new Date(period.startDate),
            endDate: period.endDate ? new Date(period.endDate) : undefined
          });
        });
      }
    });
    
    return ranges;
  };

  // Helper function to check if a date conflicts with other steps
  const checkDateConflict = (date: Date | null) => {
    if (!date) return null;
    
    const occupiedRanges = getOccupiedDateRanges();
    
    for (const range of occupiedRanges) {
      const rangeEnd = range.endDate || new Date(); // Current date if no end
      
      if (date >= range.startDate && date <= rangeEnd) {
        return {
          conflictingStep: range.stepTitle,
          rangeStart: range.startDate.toLocaleDateString('da-DK'),
          rangeEnd: range.endDate?.toLocaleDateString('da-DK')
        };
      }
    }
    
    return null;
  };

  // Helper function to check if a date range conflicts with other steps
  const checkRangeConflict = (startDateInput: Date | null, endDateInput: Date | null) => {
    if (!startDateInput || !endDateInput) return null;
    
    const occupiedRanges = getOccupiedDateRanges();
    
    for (const range of occupiedRanges) {
      const rangeEnd = range.endDate || new Date();
      
      // Check if ranges overlap
      if (startDateInput <= rangeEnd && endDateInput >= range.startDate) {
        return {
          conflictingStep: range.stepTitle,
          rangeStart: range.startDate.toLocaleDateString('da-DK'),
          rangeEnd: range.endDate?.toLocaleDateString('da-DK')
        };
      }
    }
    
    return null;
  };

  // Get excluded date intervals for DatePicker
  const getExcludedDateIntervals = () => {
    return getOccupiedDateRanges().map(range => ({
      start: range.startDate,
      end: range.endDate || new Date()
    }));
  };

  // Custom day class name function for styling
  const getDayClassName = (date: Date): string => {
    const conflict = checkDateConflict(date);
    return conflict ? 'reschool-day-conflict' : '';
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      showToast({
        title: "Fejl",
        description: "Titel er påkrævet",
        type: "error"
      });
      return;
    }

    // Validate that step dates are not before the plan start date
    if (startDate && isDateBeforePlanStart(startDate)) {
      showToast({
        title: "Ugyldig startdato",
        description: `Trinnet kan ikke starte før indsatstrappen begyndte (${formatPlanStartDate()})`,
        type: "error"
      });
      return;
    }

    if (targetEndDate && isDateBeforePlanStart(targetEndDate)) {
      showToast({
        title: "Ugyldig slutdato",
        description: `Trinnet kan ikke slutte før indsatstrappen begyndte (${formatPlanStartDate()})`,
        type: "error"
      });
      return;
    }

    // Check for conflicts with other steps
    if (startDate) {
      const conflict = checkDateConflict(startDate);
      if (conflict) {
        showToast({
          title: "Datokonflikt",
          description: `Startdatoen konflikter med "${conflict.conflictingStep}" som er aktiv ${conflict.rangeStart}${conflict.rangeEnd ? ` - ${conflict.rangeEnd}` : ' (igangværende)'}`,
          type: "error"
        });
        return;
      }
    }

    if (targetEndDate) {
      const conflict = checkDateConflict(targetEndDate);
      if (conflict) {
        showToast({
          title: "Datokonflikt",
          description: `Slutdatoen konflikter med "${conflict.conflictingStep}" som er aktiv ${conflict.rangeStart}${conflict.rangeEnd ? ` - ${conflict.rangeEnd}` : ' (igangværende)'}`,
          type: "error"
        });
        return;
      }
    }

    // Check if the entire range conflicts
    if (startDate && targetEndDate) {
      const conflict = checkRangeConflict(startDate, targetEndDate);
      if (conflict) {
        showToast({
          title: "Datokonflikt",
          description: `Perioden konflikter med "${conflict.conflictingStep}" som er aktiv ${conflict.rangeStart}${conflict.rangeEnd ? ` - ${conflict.rangeEnd}` : ' (igangværende)'}`,
          type: "error"
        });
        return;
      }
    }

    try {
      await updateStepMutation.mutateAsync({
        stepId: step.id,
        planId,
        childId,
        title: title.trim(),
        description: description.trim() || undefined,
        målsætning: målsætning.trim() || undefined,
        startDate: startDate ? startDate.toISOString() : undefined,
        targetEndDate: targetEndDate ? targetEndDate.toISOString() : undefined
      });

      showToast({
        title: "Trin opdateret",
        description: `"${title}" er blevet opdateret`,
        type: "success"
      });

      setIsOpen(false);
      onSuccess?.();
    } catch {
      showToast({
        title: "Fejl",
        description: "Kunne ikke opdatere trinnet",
        type: "error"
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStepMutation.mutateAsync({
        stepId: step.id,
        planId,
        childId
      });

      showToast({
        title: "Trin slettet",
        description: `"${step.title}" er blevet slettet`,
        type: "success"
      });

      setIsOpen(false);
      onDelete?.();
      onSuccess?.();
    } catch {
      showToast({
        title: "Fejl",
        description: "Kunne ikke slette trinnet",
        type: "error"
      });
    }
  };

  if (showDeleteConfirm) {
    return (
      <DialogManager
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        trigger={trigger || <div style={{ display: 'none' }} />}
        title="Slet trin"
        primaryAction={{
          label: "Slet trin",
          onClick: handleDelete,
          colorScheme: "red"
        }}
        secondaryAction={{
          label: "Annuller",
          onClick: () => setShowDeleteConfirm(false)
        }}
      >
        <VStack gap={4} align="stretch">
          <Text>
            Er du sikker på, at du vil slette trinnet <strong>&quot;{step.title}&quot;</strong>?
          </Text>
          <Text fontSize="sm" color="fg.muted">
            Denne handling kan ikke fortrydes. Trinnet vil blive permanent slettet.
          </Text>
          {step.isCompleted && (
            <Box 
              p={3} 
              bg="yellow.50" 
              borderRadius="md" 
              border="1px solid" 
              borderColor="yellow.200"
            >
              <Text fontSize="sm" color="yellow.700" fontWeight="medium">
                ⚠️ Dette trin er allerede fuldført
              </Text>
              <Text fontSize="xs" color="yellow.600" mt={1}>
                Sletning af fuldførte trin kan påvirke progresstatistikker.
              </Text>
            </Box>
          )}
        </VStack>
      </DialogManager>
    );
  }

  return (
    <DialogManager
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      trigger={trigger || <div style={{ display: 'none' }} />}
      title="Rediger trin"
      primaryAction={{
        label: "Gem ændringer",
        onClick: handleSubmit,
        colorScheme: "sage"
      }}
      secondaryAction={{
        label: "Annuller",
        onClick: () => setIsOpen(false)
      }}
    >
      <VStack gap={6} align="stretch">
        {/* Title */}
        <VStack gap={2} align="stretch">
          <Text fontSize="sm" fontWeight="medium">
            Titel *
          </Text>
          <Input
            placeholder="F.eks. Introduktion til skolen"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </VStack>

        {/* Description */}
        <VStack gap={2} align="stretch">
          <Text fontSize="sm" fontWeight="medium">
            Beskrivelse
          </Text>
          <Textarea
            placeholder="Beskriv hvad der skal ske i dette trin..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </VStack>

        {/* Målsætning */}
        <VStack gap={2} align="stretch">
          <Text fontSize="sm" fontWeight="medium">
            Målsætning
          </Text>
          <Textarea
            placeholder="Hvad er målet med dette trin? Hvad skal opnås?"
            value={målsætning}
            onChange={(e) => setMålsætning(e.target.value)}
            rows={2}
          />
        </VStack>

        {/* Date Fields */}
        <VStack gap={4} align="stretch">
          <VStack gap={1} align="stretch">
            <Text fontSize="sm" fontWeight="medium" color="sage.600">
              Aktiv periode
            </Text>
            <Text fontSize="xs" color="gray.600">
              Her kan du angive en periode hvor trinnet var aktivt (hvis det fx ligger tilbage i tiden)
            </Text>
          </VStack>
          
          <HStack gap={4}>
            {/* Date Range Picker */}
            <VStack gap={2} align="stretch" flex={1}>
              <Text fontSize="xs" fontWeight="medium">
                Periode (Start - Slut)
              </Text>
              <CustomDatePicker
                selectsRange={true}
                startDate={startDate}
                endDate={targetEndDate}
                onDateRangeChange={(dates) => setDateRange(dates)}
                placeholderText="Vælg periode"
                minDate={new Date(planStartDate + 'T00:00:00')}
                excludeDateIntervals={getExcludedDateIntervals()}
                dayClassName={getDayClassName}
                size="sm"
                isInvalid={!!(
                  (startDate && (isDateBeforePlanStart(startDate) || checkDateConflict(startDate))) ||
                  (targetEndDate && (isDateBeforePlanStart(targetEndDate) || checkDateConflict(targetEndDate)))
                )}
              />
              {startDate && isDateBeforePlanStart(startDate) && (
                <Text fontSize="xs" color="red.500">
                  Startdato er før indsatstrappens start
                </Text>
              )}
              {targetEndDate && isDateBeforePlanStart(targetEndDate) && (
                <Text fontSize="xs" color="red.500">
                  Slutdato er før indsatstrappens start
                </Text>
              )}
              {startDate && checkDateConflict(startDate) && (
                <Text fontSize="xs" color="red.500">
                  Startdato konflikter med &quot;{checkDateConflict(startDate)?.conflictingStep}&quot;
                </Text>
              )}
              {targetEndDate && checkDateConflict(targetEndDate) && (
                <Text fontSize="xs" color="red.500">
                  Slutdato konflikter med &quot;{checkDateConflict(targetEndDate)?.conflictingStep}&quot;
                </Text>
              )}
            </VStack>
          </HStack>
        </VStack>

        {/* Step Information */}
        <Box 
          p={3} 
          bg="sage.50" 
          borderRadius="md" 
          border="1px solid" 
          borderColor="sage.200"
        >
          <HStack justify="space-between" align="center">
            <VStack align="start" gap={1}>
              <Text fontSize="sm" color="sage.700" fontWeight="medium">
                Trin {step.stepNumber}
              </Text>
              <Text fontSize="xs" color="sage.600">
                Status: {step.isCompleted ? 'Fuldført' : 'Ikke fuldført'}
              </Text>
              {step.isCompleted && step.activePeriods && step.activePeriods.length > 0 && (
                <Text fontSize="xs" color="sage.600">
                  {(() => {
                    // Find the latest end date from all active periods
                    const endDates = step.activePeriods
                      .filter(period => period.endDate)
                      .map(period => period.endDate!)
                      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
                    
                    const latestEndDate = endDates[0];
                    const latestPeriod = step.activePeriods.find(period => period.endDate === latestEndDate);
                    
                    return `Fuldført: ${new Date(latestEndDate).toLocaleDateString('da-DK')}${latestPeriod?.deactivatedByName ? ` af ${latestPeriod.deactivatedByName}` : ''}`;
                  })()}
                </Text>
              )}
              {(step.startDate || step.targetEndDate) && (
                <Text fontSize="xs" color="sage.600">
                  {step.startDate && `Start: ${new Date(step.startDate).toLocaleDateString('da-DK')}`}
                  {step.startDate && step.targetEndDate && ' • '}
                  {step.targetEndDate && `Slut: ${new Date(step.targetEndDate).toLocaleDateString('da-DK')}`}
                </Text>
              )}
            </VStack>
            
            <Button
              size="sm"
              variant="outline"
              colorScheme="red"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <TrashIcon />
              Slet trin
            </Button>
          </HStack>
        </Box>
      </VStack>
    </DialogManager>
  );
}
