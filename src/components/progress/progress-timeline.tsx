"use client";

import React, { useState, useEffect } from 'react';
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
  Timeline,
  Table,
  useBreakpointValue,
  Select,
  Portal,
  createListCollection
} from '@chakra-ui/react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { FaStairs, FaClock, FaClipboardList } from 'react-icons/fa6';
import { Icons } from '@/components/ui/icons';
import { Thermometer, Smile, Bed, Edit3 } from 'lucide-react';
import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { da } from 'date-fns/locale';
import { useProgress } from '@/lib/queries';
import type { ProgressData, ProgressPlan, StepWithGroupedEntries, ProgressEntry } from '@/lib/database-service';

interface ProgressTimelineProps {
  childId: number;
}

interface ExpandedSteps {
  [stepId: number]: boolean;
}

interface ExpandedDescriptions {
  [stepId: number]: boolean;
}

export function ProgressTimeline({ childId }: ProgressTimelineProps) {
  const [expandedSteps, setExpandedSteps] = useState<ExpandedSteps>({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<ExpandedDescriptions>({});
  const [selectedTools, setSelectedTools] = useState<string[]>([]); // Will be populated after data loads
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]); // Will be populated after data loads
  const [isInitialized, setIsInitialized] = useState(false); // Track if we've set default selections
  
  // Use React Query hook instead of manual fetch
  const { data: progressData, isLoading: loading, error: queryError } = useProgress(childId.toString());
  
  // Initialize all tools and steps as selected when data loads
  React.useEffect(() => {
    if (progressData && progressData.plans && progressData.plans.length > 0 && !isInitialized) {
      const allToolTitles = Array.from(new Set(
        progressData.plans.flatMap((plan: ProgressPlan) =>
          plan.stepsWithEntries.flatMap((step: StepWithGroupedEntries) => 
            step.groupedEntries.map((entry: ProgressEntry) => {
              const displayData = getEntryDisplayData(entry);
              return displayData.title;
            })
          )
        )
      )) as string[];
      
      const allStepTitles = Array.from(new Set(
        progressData.plans.flatMap((plan: ProgressPlan) =>
          plan.stepsWithEntries.map((step: StepWithGroupedEntries) => step.title)
        )
      )) as string[];
      
      setSelectedTools(allToolTitles);
      setSelectedSteps(allStepTitles);
      setIsInitialized(true);
    }
  }, [progressData, isInitialized]);
  
  // Convert query error to string for display
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Der opstod en fejl') : null;

  const toggleStepExpansion = (stepId: number) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const toggleDescriptionExpansion = (stepId: number) => {
    setExpandedDescriptions(prev => ({
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
  
  const formatDateRange = (startDate: string | null, endDate: string | null, durationDays?: number | null) => {
    if (!startDate && !endDate) {
      return null;
    }
    
    const start = startDate ? formatDate(startDate) : 'Start ikke angivet';
    const end = endDate ? formatDate(endDate) : 'Igangværende';
    
    if (durationDays !== null && durationDays !== undefined) {
      const dayText = durationDays === 1 ? 'dag' : 'dage';
      return `${start} - ${end} (${durationDays} ${dayText})`;
    }
    
    return `${start} - ${end}`;
  };

  // Transform entries data for scatter chart
  const transformEntriesForChart = (plan: ProgressPlan) => {
    const chartData: Array<{
      x: number;
      y: number;
      stepTitle: string;
      stepId: number;
      icon: string;
      title: string;
      subtitle: string;
      createdAt: string;
      toolType: string;
      entryId: number;
      recordedByName: string;
      date: string;
      time: string;
    }> = [];
    const baseDate = plan.startDate ? new Date(plan.startDate) : new Date();
    
    plan.stepsWithEntries.forEach((step, stepIndex) => {
      
      step.groupedEntries.forEach((entry) => {
        const entryDate = new Date(entry.createdAt);
        const daysSinceStart = differenceInDays(entryDate, baseDate);
        const displayData = getEntryDisplayData(entry);
        
        chartData.push({
          x: daysSinceStart,
          y: stepIndex + 1,
          stepTitle: step.title,
          stepId: step.id,
          icon: displayData.icon,
          title: displayData.title,
          subtitle: displayData.subtitle,
          createdAt: entry.createdAt,
          toolType: entry.toolType,
          entryId: entry.id,
          recordedByName: entry.recordedByName || 'Ukendt',
          date: format(entryDate, 'dd. MMM yyyy', { locale: da }),
          time: format(entryDate, 'HH:mm'),
        });
      });
    });
    
    return chartData;
  };

  // Create a custom timeline chart component
  const ProgressTimelineChart = ({ plan }: { plan: ProgressPlan }) => {
    const allChartData = transformEntriesForChart(plan);
    
    // Get unique tool titles for rows (group by title instead of toolType)
    const uniqueToolTitles = Array.from(new Set(allChartData.map(entry => entry.title)));
    
    // Get unique step titles for steps filter
    const uniqueStepTitles = Array.from(new Set(plan.stepsWithEntries.map(step => step.title)));

    // Group entries by tool title and date
    const entriesByTitleAndDate = allChartData.reduce((acc, entry) => {
      const titleKey = entry.title;
      const dateKey = entry.x + 1; // Start at day 1 instead of day 0
      
      if (!acc[titleKey]) {
        acc[titleKey] = {};
      }
      if (!acc[titleKey][dateKey]) {
        acc[titleKey][dateKey] = [];
      }
      acc[titleKey][dateKey].push(entry);
      return acc;
    }, {} as Record<string, Record<number, typeof allChartData>>);

    // Create a map of title to toolType for descriptions
    const titleToToolType = allChartData.reduce((acc, entry) => {
      acc[entry.title] = entry.toolType;
      return acc;
    }, {} as Record<string, string>);

    // Calculate the full timespan - from day 1 to the latest day with data (or at least 30 days)
    const maxDay = Math.max(...allChartData.map(entry => entry.x + 1), 30);
    const allDays = Array.from({ length: maxDay }, (_, i) => i + 1); // [1, 2, 3, ..., maxDay]

    // Helper function to get tool icon for activity rows
    const getActivityRowIcon = (toolType: string) => {
      switch (toolType) {
        case 'barometer': return <Icons.Barometer size={4} color="gray.400" />;
        case 'dagens-smiley': return <Icons.Smiley size={4} color="gray.400" />;
        case 'sengetider': return <Icons.Bedtime size={4} color="gray.400" />;
        default: return <Icons.Edit size={4} color="gray.400" />;
      }
    };

    // Helper function to get tool icon for select dropdown
    const getToolIcon = (title: string) => {
      const toolType = allChartData.find(item => item.title === title)?.toolType;
      switch (toolType) {
        case 'barometer': return <Icon as={Thermometer} size="xs" color="gray.400" />;
        case 'dagens-smiley': return <Icon as={Smile} size="xs" color="gray.400" />;
        case 'sengetider': return <Icon as={Bed} size="xs" color="gray.400" />;
        default: return <Icon as={Edit3} size="xs" color="gray.400" />;
      }
    };    if (allChartData.length === 0) {
      return (
        <Box h="400px" w="full" display="flex" alignItems="center" justifyContent="center">
          <VStack gap={2}>
            <Text color="gray.500" fontSize="lg">
              Ingen data at vise i oversigten
            </Text>
            <Text color="gray.400" fontSize="sm">
              Der er endnu ikke registreret nogen data for denne plan
            </Text>
          </VStack>
        </Box>
      );
    }

    // Filter titles based on selected tools (when all are selected, show all)
    const displayTitles = selectedTools.length === 0 || selectedTools.length === uniqueToolTitles.length
      ? uniqueToolTitles 
      : uniqueToolTitles.filter(title => selectedTools.includes(title));
    
    const filteredData = displayTitles.reduce((acc, title) => {
      acc[title] = entriesByTitleAndDate[title] || {};
      return acc;
    }, {} as Record<string, Record<number, typeof allChartData>>);

    // Filter plan steps based on selected steps
    const filteredPlan = {
      ...plan,
      stepsWithEntries: plan.stepsWithEntries.filter(step => 
        selectedSteps.length === 0 || 
        selectedSteps.length === uniqueStepTitles.length ||
        selectedSteps.includes(step.title)
      )
    };

    // Create collection for the multiselect
    const toolCollection = createListCollection({
      items: uniqueToolTitles.map(title => ({
        label: title,
        value: title,
        icon: getToolIcon(title)
      }))
    });

    // Create collection for steps filter
    const stepsCollection = createListCollection({
      items: uniqueStepTitles.map((title: string, index: number) => ({
        label: title,
        value: title,
        icon: <Box 
          w={4} h={4} 
          borderRadius="full" 
          bg="gray.400" 
          color="white" 
          fontSize="10px" 
          fontWeight="bold" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
        >
          {index + 1}
        </Box>
      }))
    });

    return (
      <Box w="full" p={4} bg="gray.50" borderRadius="md">
        {/* Header with filters */}
        <HStack justify="space-between" mb={4} align="start">
          <Text fontSize="lg" fontWeight="bold">
            Overblik ({allChartData.length} indtastninger)
          </Text>
          
          <HStack gap={3} align="start">
            {/* Tools filter */}
            <Box minWidth="250px" maxWidth="300px">
              <Select.Root
                collection={toolCollection}
                multiple
                value={selectedTools}
                onValueChange={(details) => setSelectedTools(details.value)}
                size="sm"
                positioning={{ sameWidth: true }}
              >
                <Select.Label srOnly>Vælg værktøjer</Select.Label>
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Vælg værktøjer">
                      {selectedTools.length === 0 
                        ? "Ingen værktøjer valgt" 
                        : selectedTools.length === uniqueToolTitles.length
                        ? "Alle værktøjer"
                        : "Flere værktøjer"
                      }
                    </Select.ValueText>
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {toolCollection.items.map((tool) => (
                        <Select.Item key={tool.value} item={tool}>
                          <HStack gap={2} w="full" alignItems="center">
                            <Box flexShrink={0} bg="transparent" w={3} h={3} display="flex" alignItems="center" justifyContent="center">
                              {tool.icon}
                            </Box>
                            <Text fontSize="sm" fontWeight="medium" lineClamp={1} flex={1} minW={0}>
                              {tool.label}
                            </Text>
                          </HStack>
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
                <Select.HiddenSelect />
              </Select.Root>
            </Box>

            {/* Steps filter */}
            <Box minWidth="250px" maxWidth="300px">
              <Select.Root
                collection={stepsCollection}
                multiple
                value={selectedSteps}
                onValueChange={(details) => setSelectedSteps(details.value)}
                size="sm"
                positioning={{ sameWidth: true }}
              >
                <Select.Label srOnly>Vælg trin</Select.Label>
                <Select.Control>
                  <Select.Trigger>
                    <Select.ValueText placeholder="Vælg trin">
                      {selectedSteps.length === 0 
                        ? <HStack gap={1}><FaStairs size={14} color="gray.500" /><Text>Ingen trin valgt</Text></HStack>
                        : selectedSteps.length === uniqueStepTitles.length
                        ? <HStack gap={1}><FaStairs size={14} color="gray.500" /><Text>Alle trin</Text></HStack>
                        : <HStack gap={1}><FaStairs size={14} color="gray.500" /><Text>Flere trin</Text></HStack>
                      }
                    </Select.ValueText>
                  </Select.Trigger>
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                  <Select.Positioner>
                    <Select.Content>
                      {stepsCollection.items.map((step) => (
                        <Select.Item key={step.value} item={step}>
                          <HStack gap={2} w="full">
                            <Box flexShrink={0} bg="transparent">
                              {step.icon}
                            </Box>
                            <Text fontSize="sm" fontWeight="medium" lineClamp={1} flex={1} minW={0}>
                              {step.label}
                            </Text>
                          </HStack>
                          <Select.ItemIndicator />
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Portal>
                <Select.HiddenSelect />
              </Select.Root>
            </Box>
          </HStack>
        </HStack>
        
        <Table.ScrollArea 
          borderWidth="1px" 
          borderColor="border.default" 
          borderRadius="lg"
          bg="bg.canvas"
        >
          <Table.Root 
            size="sm" 
            stickyHeader 
            showColumnBorder
            variant="outline"
          >
            {/* Column definitions */}
            <Table.ColumnGroup>
              <Table.Column htmlWidth="200px" />
              {allDays.map((dayNumber) => (
                <Table.Column key={dayNumber} htmlWidth="40px" />
              ))}
            </Table.ColumnGroup>
            
            {/* Header with step spans */}
            <Table.Header>
              {/* Step spans row */}
              <Table.Row 
                bg="white" 
                position="sticky" 
                top={0} 
                zIndex={30}
                borderBottom="2px solid"
                borderColor="sage.200"
              >
                <Table.ColumnHeader 
                  textAlign="center" 
                  bg="bg.subtle" 
                  borderColor="border.default"
                  position="sticky"
                  top={0}
                  zIndex={31}
                >
                  <Text fontSize="sm" fontWeight="600" color="navy.800">
                    Værktøj
                  </Text>
                </Table.ColumnHeader>
                {(() => {
                  // Calculate step spans and render merged cells
                  const stepCells: React.ReactElement[] = [];
                  
                  filteredPlan.stepsWithEntries.forEach((step, stepIndex) => {
                    const stepStartDate = step.timePerriod?.startDate;
                    const stepEndDate = step.timePerriod?.endDate;
                    
                    if (!stepStartDate) return;
                    
                    const planStartDate = plan.startDate ? new Date(plan.startDate) : new Date();
                    const stepStart = new Date(stepStartDate);
                    const stepEnd = stepEndDate ? new Date(stepEndDate) : new Date();
                    
                    const startDay = Math.max(1, differenceInDays(stepStart, planStartDate) + 1);
                    const endDay = stepEndDate 
                      ? differenceInDays(stepEnd, planStartDate) + 1
                      : Math.min(allDays.length, startDay + 30);
                    
                    const spanDays = Math.max(1, endDay - startDay + 1);
                    
                    // Color coding using site's palette
                    const stepColors = [
                      'sage.200',    // Step 1 - primary brand color
                      'navy.200',    // Step 2 - secondary brand color
                      'golden.200',  // Step 3 - accent color
                      'coral.200',   // Step 4 - coral accent
                      'cream.200',   // Step 5 - cream accent
                      'sage.300',    // Step 6 - darker sage
                      'navy.300',    // Step 7 - darker navy
                    ];
                    
                    const bgColor = stepColors[stepIndex % stepColors.length];
                    
                    stepCells.push(
                      <Table.ColumnHeader 
                        key={step.id} 
                        colSpan={spanDays}
                        textAlign="center"
                        bg={bgColor}
                        borderColor="border.default"
                        px={2}
                        position="sticky"
                        top={0}
                        zIndex={30}
                        _hover={{ bg: stepColors[(stepIndex + 3) % stepColors.length] }}
                        transition="all 0.2s"
                      >
                        <Text fontSize="xs" fontWeight="600" color="navy.800" lineHeight="1.2">
                          Trin {stepIndex + 1}: {step.title}
                        </Text>
                      </Table.ColumnHeader>
                    );
                  });
                  
                  return stepCells;
                })()}
              </Table.Row>
            </Table.Header>
            
            {/* Body with activity rows */}
            <Table.Body>
              {displayTitles.map((title) => (
                <Table.Row key={title}>
                  {/* Activity title cell */}
                  <Table.Cell 
                    bg="bg.subtle" 
                    px={4} 
                    py={3}
                    borderColor="border.default"
                    position="sticky"
                    left={0}
                    zIndex={20}
                    _hover={{ bg: "sage.50" }}
                    transition="all 0.2s"
                  >
                    <HStack gap={1} alignItems="center">
                      {getActivityRowIcon(titleToToolType[title])}
                      <Text fontSize="sm" fontWeight="600" color="navy.800" lineHeight="1.2">
                        {title}
                      </Text>
                    </HStack>
                  </Table.Cell>
                  
                  {/* Data cells for each day */}
                  {allDays.map((dayNumber) => {
                    const entries = filteredData[title][dayNumber] || [];
                    
                    return (
                      <Table.Cell 
                        key={dayNumber}
                        textAlign="center"
                        bg={entries.length > 0 ? "bg.canvas" : "bg.muted"}
                        borderColor="border.default"
                        px={1}
                        py={2}
                        position="relative"
                        _hover={{ 
                          bg: entries.length > 0 ? "sage.50" : "bg.subtle",
                          transform: entries.length > 0 ? "scale(1.02)" : "none"
                        }}
                        transition="all 0.2s"
                        cursor={entries.length > 0 ? "pointer" : "default"}
                      >
                        {entries.length === 0 ? (
                          <Text fontSize="xs" color="gray.300">·</Text>
                        ) : entries.length === 1 ? (
                          <Box
                            fontSize="lg" 
                            _hover={{ transform: "scale(1.3)" }}
                            transition="all 0.2s"
                            title={`${entries[0].stepTitle}: ${entries[0].title} - ${entries[0].subtitle} (${entries[0].time})`}
                          >
                            {entries[0].icon}
                          </Box>
                        ) : (
                          <VStack gap={0} title={`${entries.length} registreringer`}>
                            <Text fontSize="sm" fontWeight="600" color="sage.600">
                              {entries.length}
                            </Text>
                            <Text fontSize="xs" color="navy.500">
                              {entries[0].icon}
                            </Text>
                          </VStack>
                        )}
                      </Table.Cell>
                    );
                  })}
                </Table.Row>
              ))}
            </Table.Body>
            
            {/* Footer with dates - sticky at bottom */}
            <Table.Footer>
              <Table.Row 
                position="sticky" 
                bottom={0} 
                bg="bg.subtle" 
                borderTop="2px solid"
                borderColor="sage.200"
                zIndex={20}
                _hover={{ bg: "sage.50" }}
                transition="all 0.2s"
              >
                {/* Empty cell for activity column */}
                <Table.Cell 
                  bg="bg.subtle" 
                  borderColor="border.default" 
                  position="sticky" 
                  left={0} 
                  zIndex={25}
                />
                
                {/* Date cells */}
                {allDays.map((dayNumber) => {
                  const baseDate = plan.startDate ? new Date(plan.startDate) : new Date();
                  const currentDate = new Date(baseDate);
                  currentDate.setDate(currentDate.getDate() + (dayNumber - 1));
                  
                  return (
                    <Table.Cell 
                      key={dayNumber}
                      textAlign="center"
                      bg="bg.subtle"
                      borderColor="border.default"
                      px={1}
                      py={2}
                    >
                      <Text fontSize="xs" fontWeight="600" color="navy.700">
                        {format(currentDate, 'dd/MM', { locale: da })}
                      </Text>
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            </Table.Footer>
          </Table.Root>
        </Table.ScrollArea>
      </Box>
    );
  };

  // Helper function to generate date range for a step
  const generateDateRange = (startDate: string | null, endDate: string | null): Date[] => {
    if (!startDate) return [];
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const dates: Date[] = [];
    
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  };

  // Helper function to group entries by date
  const groupEntriesByDate = (entries: ProgressEntry[]): { [dateKey: string]: ProgressEntry[] } => {
    const grouped: { [dateKey: string]: ProgressEntry[] } = {};
    
    entries.forEach(entry => {
      const entryDate = new Date(entry.createdAt);
      const dateKey = format(entryDate, 'yyyy-MM-dd');
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });
    
    return grouped;
  };

  // Dated Timeline Component
  const DatedTimeline = ({ step }: { step: StepWithGroupedEntries }) => {
    const isHorizontal = useBreakpointValue({ base: false, md: true });
    const dateRange = generateDateRange(step.timePerriod.startDate, step.timePerriod.endDate);
    const entriesByDate = groupEntriesByDate(step.groupedEntries);
    
    if (dateRange.length === 0) {
      // Fallback to simple entry list if no date range
      return (
        <VStack gap={3} align="stretch">
          {step.groupedEntries.map((entry: ProgressEntry) => {
            const displayData = getEntryDisplayData(entry);
            
            return (
              <Box
                key={`${entry.toolType}-${entry.id}-simple`}
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
                      <Badge colorPalette="sage" size="xs">
                        {entry.recordedByName}
                      </Badge>
                    )}
                  </VStack>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      );
    }

    return (
      <Box w="full">
        <Text fontSize="sm" fontWeight="medium" color="navy.700" mb={4}>
          Tidsbaseret registreringsoversigt
        </Text>
        
        {isHorizontal ? (
          // Horizontal timeline for larger screens
          <Box overflowX="auto" pb={4}>
            <HStack gap={4} align="start" minW="fit-content">
              {dateRange.map(date => {
                const dateKey = format(date, 'yyyy-MM-dd');
                const entriesForDate = entriesByDate[dateKey] || [];
                const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                
                return (
                  <VStack
                    key={dateKey}
                    gap={2}
                    align="center"
                    minW="120px"
                    p={3}
                    bg={entriesForDate.length > 0 ? "sage.50" : "gray.50"}
                    borderRadius="md"
                    border="2px solid"
                    borderColor={isToday ? "sage.300" : entriesForDate.length > 0 ? "sage.200" : "gray.200"}
                  >
                    <VStack gap={0} align="center">
                      <Text fontSize="xs" color="gray.600" fontWeight="medium">
                        {format(date, 'EEE', { locale: da })}
                      </Text>
                      <Text fontSize="sm" fontWeight="bold" color={isToday ? "sage.700" : "gray.900"}>
                        {format(date, 'd. MMM', { locale: da })}
                      </Text>
                    </VStack>
                    
                    {entriesForDate.length > 0 && (
                      <VStack gap={1} align="center" w="full">
                        {entriesForDate.map(entry => {
                          const displayData = getEntryDisplayData(entry);
                          return (
                            <Box
                              key={`${entry.toolType}-${entry.id}-timeline`}
                              p={2}
                              bg="white"
                              borderRadius="sm"
                              border="1px solid"
                              borderColor="sage.300"
                              w="full"
                              textAlign="center"
                            >
                              <Text fontSize="md" mb={1}>{displayData.icon}</Text>
                              <Text fontSize="xs" color="navy.700" fontWeight="medium" lineClamp={2}>
                                {entry.toolTopic}
                              </Text>
                              {entry.recordedByName && (
                                <Badge colorPalette="sage" size="xs" mt={1}>
                                  {entry.recordedByName}
                                </Badge>
                              )}
                            </Box>
                          );
                        })}
                      </VStack>
                    )}
                    
                    {entriesForDate.length === 0 && (
                      <Text fontSize="xs" color="gray.400">
                        Ingen
                      </Text>
                    )}
                  </VStack>
                );
              })}
            </HStack>
          </Box>
        ) : (
          // Vertical timeline for smaller screens
          <VStack gap={3} align="stretch">
            {dateRange.map(date => {
              const dateKey = format(date, 'yyyy-MM-dd');
              const entriesForDate = entriesByDate[dateKey] || [];
              const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              
              if (entriesForDate.length === 0) return null;
              
              return (
                <Box
                  key={dateKey}
                  p={3}
                  bg="sage.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor={isToday ? "sage.300" : "sage.200"}
                >
                  <HStack mb={3}>
                    <Text fontSize="sm" fontWeight="bold" color={isToday ? "sage.700" : "gray.900"}>
                      {format(date, 'EEEE d. MMMM', { locale: da })}
                    </Text>
                    {isToday && (
                      <Badge colorPalette="sage" size="xs">
                        I dag
                      </Badge>
                    )}
                  </HStack>
                  
                  <VStack gap={2} align="stretch">
                    {entriesForDate.map(entry => {
                      const displayData = getEntryDisplayData(entry);
                      return (
                        <Box
                          key={`${entry.toolType}-${entry.id}-vertical`}
                          p={2}
                          bg="white"
                          borderRadius="sm"
                          border="1px solid"
                          borderColor="sage.300"
                        >
                          <Flex align="center" gap={3}>
                            <Text fontSize="lg">{displayData.icon}</Text>
                            <VStack align="start" gap={0} flex={1}>
                              <Text fontSize="sm" fontWeight="medium" color="navy.700">
                                {displayData.title}
                              </Text>
                              <Text fontSize="xs" color="gray.600">
                                {displayData.subtitle}
                              </Text>
                            </VStack>
                            {entry.recordedByName && (
                              <Badge colorPalette="sage" size="xs">
                                {entry.recordedByName}
                              </Badge>
                            )}
                          </Flex>
                        </Box>
                      );
                    })}
                  </VStack>
                </Box>
              );
            })}
          </VStack>
        )}
      </Box>
    );
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
          icon: String(entry.data.rating || '?'),
          title: entry.toolTopic,
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
                    <Text>{plan.totalEntries} registreringer</Text>
                  </HStack>
                </HStack>
              </Box>

              <Separator />

              {/* Scatter Chart Timeline */}
              <Box mb={8}>
                <Text fontSize="lg" fontWeight="medium" color="navy.700" mb={4}>
                  Registreringer over tid (graf)
                </Text>
                <ProgressTimelineChart plan={plan} />
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
                              
                              {(step.description || step.målsætning) && (
                                <Box>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleDescriptionExpansion(step.id)}
                                    fontSize="xs"
                                    color="gray.500"
                                    p={1}
                                    h="auto"
                                    fontWeight="normal"
                                  >
                                    {expandedDescriptions[step.id] ? 'Skjul detaljer' : 'Vis detaljer'}
                                    <Icon as={expandedDescriptions[step.id] ? IoChevronUp : IoChevronDown} ml={1} />
                                  </Button>
                                  
                                  {expandedDescriptions[step.id] && (
                                    <VStack align="start" mt={2} gap={2}>
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
                                          w="full"
                                        >
                                          <Text fontSize="sm" color="navy.700" fontWeight="medium">
                                            Målsætning: {step.målsætning}
                                          </Text>
                                        </Box>
                                      )}
                                    </VStack>
                                  )}
                                </Box>
                              )}

                              {/* Inline Emoji Timeline */}
                              {hasEntries && (
                                <Box
                                  bg="cream.25"
                                  p={3}
                                  borderRadius="md"
                                  border="1px solid"
                                  borderColor="cream.200"
                                >
                                  <Text fontSize="xs" color="gray.600" mb={2} fontWeight="medium">
                                    Registreringer ({step.groupedEntries.length})
                                  </Text>
                                  <HStack gap={2} wrap="wrap">
                                    {step.groupedEntries.map((entry: ProgressEntry) => {
                                      const displayData = getEntryDisplayData(entry);
                                      
                                      return (
                                        <Box
                                          key={`${entry.toolType}-${entry.id}-inline`}
                                          position="relative"
                                          display="inline-flex"
                                          alignItems="center"
                                          justifyContent="center"
                                          w="32px"
                                          h="32px"
                                          bg="white"
                                          borderRadius="full"
                                          border="2px solid"
                                          borderColor={displayData.color === 'navy' ? 'navy.200' : 
                                                      displayData.color === 'sage' ? 'sage.200' : 'gray.200'}
                                          cursor="pointer"
                                          title={`${displayData.title} - ${formatDateTime(entry.createdAt)}`}
                                          _hover={{
                                            transform: 'scale(1.1)',
                                            borderColor: displayData.color === 'navy' ? 'navy.400' : 
                                                        displayData.color === 'sage' ? 'sage.400' : 'gray.400'
                                          }}
                                          transition="all 0.2s"
                                        >
                                          <Text fontSize="lg" lineHeight="1">
                                            {displayData.icon}
                                          </Text>
                                        </Box>
                                      );
                                    })}
                                  </HStack>
                                </Box>
                              )}

                              <HStack gap={4} fontSize="xs" color="gray.500" wrap="wrap">
                                {/* Date Range Badge */}
                                {formatDateRange(step.timePerriod.startDate, step.timePerriod.endDate, step.durationDays) && (
                                  <Badge
                                    colorPalette={step.isCompleted ? 'sage' : 'navy'}
                                    size="sm"
                                    px={3}
                                    py={1}
                                  >
                                    {formatDateRange(step.timePerriod.startDate, step.timePerriod.endDate, step.durationDays)}
                                  </Badge>
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

                          {/* Dated Timeline View */}
                          {hasEntries && isExpanded && (
                            <Box
                              mt={4}
                              p={4}
                              bg="cream.25"
                              borderRadius="md"
                              border="1px solid"
                              borderColor="cream.200"
                            >
                              <DatedTimeline step={step} />
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