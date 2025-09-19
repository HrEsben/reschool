"use client";

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Skeleton,
  Flex,
  Icon,
  Card,
  Separator,
  Button,
  Timeline
} from '@chakra-ui/react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { FaStairs, FaClock, FaClipboardList } from 'react-icons/fa6';
import { format, parseISO, isValid } from 'date-fns';
import { da } from 'date-fns/locale';
import { useProgress } from '@/lib/queries';
import type { ProgressPlan, StepWithGroupedEntries, ProgressEntry } from '@/lib/database-service';

interface ProgressTimelineProps {
  childId: number;
}

interface ExpandedSteps {
  [stepId: number]: boolean;
}

export function ProgressTimeline({ childId }: ProgressTimelineProps) {
  const [expandedSteps, setExpandedSteps] = useState<ExpandedSteps>({});
  
  // Use React Query hook instead of manual fetch
  const { data: progressData, isLoading: loading, error: queryError } = useProgress(childId.toString());
  
  // Convert query error to string for display
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Der opstod en fejl') : null;

  const toggleStepExpansion = (stepId: number) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Ikke angivet';
    
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Ugyldig dato';
      return format(date, 'dd. MMM yyyy', { locale: da });
    } catch {
      return 'Ugyldig dato';
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Ugyldig dato';
      return format(date, 'dd. MMM yyyy, HH:mm', { locale: da });
    } catch {
      return 'Ugyldig dato';
    }
  };

  const getEntryDisplayData = (entry: ProgressEntry): {
    icon: string;
    title: string;
    subtitle: string;
    color: string;
  } => {
    switch (entry.toolType) {
      case 'barometer':
        return {
          icon: '📊',
          title: `${entry.toolTopic}: ${entry.data.rating}`,
          subtitle: String(entry.data.comment || 'Ingen kommentar'),
          color: 'navy'
        };
      case 'dagens-smiley':
        return {
          icon: String(entry.data.smileyValue || '😐'),
          title: entry.toolTopic,
          subtitle: String(entry.data.comment || 'Ingen kommentar'),
          color: 'sage'
        };
      case 'sengetider':
        return {
          icon: '🛏️',
          title: `${entry.toolTopic}`,
          subtitle: `Sengetid: ${String(entry.data.bedtime || 'Ikke angivet')}`,
          color: 'golden'
        };
      default:
        return {
          icon: '📝',
          title: entry.toolTopic,
          subtitle: 'Data registreret',
          color: 'gray'
        };
    }
  };

  if (loading) {
    return (
      <VStack gap={6} align="stretch" w="full">
        <Skeleton height="40px" />
        <Box>
          <Skeleton height="120px" mb={4} />
          <Skeleton height="80px" mb={4} />
          <Skeleton height="100px" />
        </Box>
      </VStack>
    );
  }

  if (error) {
    return (
      <Card.Root bg="coral.50" borderColor="coral.200">
        <Card.Body>
          <Text color="coral.700">{error}</Text>
        </Card.Body>
      </Card.Root>
    );
  }

  if (!progressData || progressData.plans.length === 0) {
    return (
      <Card.Root bg="cream.50" borderColor="cream.200">
        <Card.Body>
          <VStack gap={4} align="center" py={8}>
            <Icon as={FaStairs} fontSize="3xl" color="gray.400" />
            <Text color="gray.600" fontSize="lg" textAlign="center">
              Ingen indsatstrappe fundet
            </Text>
            <Text color="gray.500" fontSize="sm" textAlign="center">
              Opret en indsatstrappe for at se fremdriftsvisningen
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <VStack gap={8} align="stretch" w="full">
      {/* Summary */}
      <Card.Root bg="cream.50" borderColor="cream.200">
        <Card.Body>
          <HStack justify="space-between" align="center" wrap="wrap">
            <VStack align="start" gap={1}>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                Samlet aktivitet
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="navy.700">
                {progressData.totalEntries} registreringer
              </Text>
            </VStack>
            <VStack align="end" gap={1}>
              <Text fontSize="sm" color="gray.600" fontWeight="medium">
                Aktive planer
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="sage.700">
                {progressData.plans.filter((plan: ProgressPlan) => plan.isActive).length}
              </Text>
            </VStack>
          </HStack>
        </Card.Body>
      </Card.Root>

      {/* Progress Plans */}
      {progressData.plans.map((plan: ProgressPlan) => (
        <Card.Root key={plan.id} bg="bg.surface" borderColor="cream.200">
          <Card.Body>
            <VStack gap={6} align="stretch">
              {/* Plan Header */}
              <Box>
                <HStack justify="space-between" align="start" mb={3}>
                  <VStack align="start" gap={1} flex={1}>
                    <HStack gap={3} align="center">
                      <Icon as={FaStairs} color={plan.isActive ? 'sage.500' : 'gray.400'} />
                      <Heading size="lg" color="navy.700">
                        {plan.title}
                      </Heading>
                      <Badge
                        colorPalette={plan.isActive ? 'sage' : 'gray'}
                        size="sm"
                      >
                        {plan.isActive ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </HStack>
                    {plan.description && (
                      <Text color="gray.600" fontSize="sm">
                        {plan.description}
                      </Text>
                    )}
                  </VStack>
                  <VStack align="end" gap={1}>
                    <Text fontSize="xs" color="gray.500">
                      Fremdrift
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="navy.700">
                      {plan.completedSteps}/{plan.totalSteps} trin
                    </Text>
                  </VStack>
                </HStack>

                <HStack gap={4} fontSize="sm" color="gray.600">
                  <HStack gap={1}>
                    <Icon as={FaClock} />
                    <Text>Start: {formatDate(plan.startDate)}</Text>
                  </HStack>
                  {plan.targetDate && (
                    <HStack gap={1}>
                      <Icon as={FaClock} />
                      <Text>Mål: {formatDate(plan.targetDate)}</Text>
                    </HStack>
                  )}
                  <HStack gap={1}>
                    <Icon as={FaClipboardList} />
                    <Text>{plan.stepsWithEntries.reduce((sum, step) => sum + step.groupedEntries.length, 0)} registreringer</Text>
                  </HStack>
                </HStack>
              </Box>

              <Separator />

              {/* Timeline */}
              <Timeline.Root variant="outline">
                {plan.stepsWithEntries.map((step: StepWithGroupedEntries, index: number) => {
                  const isExpanded = expandedSteps[step.id];
                  const hasEntries = step.groupedEntries.length > 0;
                  const isCurrentStep = index === (plan.currentStepIndex || 0);

                  return (
                    <Timeline.Item key={step.id}>
                      <Timeline.Indicator 
                        bg={step.isCompleted ? 'sage.500' : isCurrentStep ? 'navy.500' : 'gray.300'}
                        borderColor={step.isCompleted ? 'sage.600' : isCurrentStep ? 'navy.600' : 'gray.400'}
                      />
                      <Timeline.Content>
                        <Box>
                          {/* Step Header */}
                          <HStack justify="space-between" align="start" mb={3}>
                            <VStack align="start" gap={2} flex={1}>
                              <HStack gap={3} align="center" wrap="wrap">
                                <Badge
                                  colorPalette={step.isCompleted ? 'sage' : isCurrentStep ? 'navy' : 'gray'}
                                  size="sm"
                                >
                                  Trin {step.stepNumber}
                                </Badge>
                                <Heading size="md" color="navy.700">
                                  {step.title}
                                </Heading>
                                {hasEntries && (
                                  <Badge colorPalette="cream" size="sm">
                                    {step.groupedEntries.length} registreringer
                                  </Badge>
                                )}
                              </HStack>
                              
                              {step.description && (
                                <Text color="gray.600" fontSize="sm">
                                  {step.description}
                                </Text>
                              )}

                              {step.målsætning && (
                                <Box
                                  bg="navy.50"
                                  p={3}
                                  borderRadius="md"
                                  borderLeft="4px solid"
                                  borderColor="navy.200"
                                >
                                  <Text fontSize="sm" color="navy.700" fontWeight="medium">
                                    Målsætning: {step.målsætning}
                                  </Text>
                                </Box>
                              )}

                              <HStack gap={4} fontSize="xs" color="gray.500">
                                {step.timePerriod.startDate && (
                                  <Text>Start: {formatDate(step.timePerriod.startDate)}</Text>
                                )}
                                {step.timePerriod.endDate && (
                                  <Text>Slut: {formatDate(step.timePerriod.endDate)}</Text>
                                )}
                                {step.completedAt && (
                                  <Text>Afsluttet: {formatDateTime(step.completedAt)}</Text>
                                )}
                              </HStack>
                            </VStack>

                            {hasEntries && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleStepExpansion(step.id)}
                              >
                                {isExpanded ? 'Skjul' : 'Vis'} registreringer
                                <Icon as={isExpanded ? IoChevronUp : IoChevronDown} ml={2} />
                              </Button>
                            )}
                          </HStack>

                          {/* Grouped Entries */}
                          {hasEntries && isExpanded && (
                            <Box
                              mt={4}
                              p={4}
                              bg="cream.25"
                              borderRadius="md"
                              border="1px solid"
                              borderColor="cream.200"
                            >
                              <Text fontSize="sm" fontWeight="medium" color="navy.700" mb={3}>
                                Registreringer i denne periode ({step.groupedEntries.length})
                              </Text>
                              
                              <VStack gap={3} align="stretch">
                                {step.groupedEntries.map((entry: ProgressEntry) => {
                                  const displayData = getEntryDisplayData(entry);
                                  
                                  return (
                                    <Box
                                      key={`${entry.toolType}-${entry.id}`}
                                      p={3}
                                      bg="white"
                                      borderRadius="md"
                                      border="1px solid"
                                      borderColor="cream.300"
                                    >
                                      <Flex align="center" gap={3} wrap="wrap">
                                        <Text fontSize="lg">{displayData.icon}</Text>
                                        <VStack align="start" gap={0} flex={1}>
                                          <Text fontSize="sm" fontWeight="medium" color="navy.700">
                                            {displayData.title}
                                          </Text>
                                          <Text fontSize="xs" color="gray.600">
                                            {displayData.subtitle}
                                          </Text>
                                        </VStack>
                                        <VStack align="end" gap={0}>
                                          <Text fontSize="xs" color="gray.500">
                                            {formatDateTime(entry.createdAt)}
                                          </Text>
                                          {entry.recordedByName && (
                                            <Badge
                                              colorPalette="sage"
                                              size="xs"
                                            >
                                              {entry.recordedByName}
                                            </Badge>
                                          )}
                                        </VStack>
                                      </Flex>
                                    </Box>
                                  );
                                })}
                              </VStack>
                            </Box>
                          )}

                          {hasEntries && !isExpanded && (
                            <Box mt={3}>
                              <Text fontSize="xs" color="gray.500">
                                {step.groupedEntries.length} registreringer i denne periode - klik for at vise
                              </Text>
                            </Box>
                          )}
                        </Box>
                      </Timeline.Content>
                    </Timeline.Item>
                  );
                })}
              </Timeline.Root>
            </VStack>
          </Card.Body>
        </Card.Root>
      ))}
    </VStack>
  );
}