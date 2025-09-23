"use client";

import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Stack,
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
  createListCollection,
  Container
} from '@chakra-ui/react';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { FaStairs, FaClock, FaClipboardList } from 'react-icons/fa6';
import { Icons } from '@/components/ui/icons';
import { OpenMojiEmoji } from '@/components/ui/openmoji-emoji';
import { Thermometer, Smile, Bed, Edit3 } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { da } from 'date-fns/locale';
import { useProgress } from '@/lib/queries';
import type { ProgressPlan, StepWithGroupedEntries, ProgressEntry } from '@/lib/database-service';

interface ProgressTimelineProps {
  childId: number;
}

interface ExpandedSteps {
  [stepId: number]: boolean;
}

interface ExpandedDescriptions {
  [stepId: number]: boolean;
}

// Enhanced Tooltip component using Chakra UI's built-in Tooltip
interface EnhancedTooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
}

const EnhancedTooltip = ({ content, children }: EnhancedTooltipProps) => {
  return (
    <Tooltip
      content={content}
      openDelay={300}
      closeDelay={150}
      showArrow={true}
      positioning={{ 
        placement: "top",
        gutter: 8,
        offset: { mainAxis: 6 }
      }}
      contentProps={{
        css: {
          "--tooltip-bg": "var(--chakra-colors-bg-panel)",
          "--tooltip-border-color": "var(--chakra-colors-border-subtle)",
        },
        color: "fg",
        fontSize: "sm",
        fontWeight: "500",
        borderRadius: "lg",
        px: 4,
        py: 3,
        maxW: "320px",
        minW: "200px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        border: "1px solid",
        borderColor: "border.subtle",
        whiteSpace: "pre-line" as const,
        lineHeight: "1.5"
      }}
    >
      <Box
        cursor="pointer"
        position="relative"
        display="inline-block"
        _hover={{
          transform: "scale(1.05)",
          transition: "transform 0.2s ease"
        }}
      >
        {children}
      </Box>
    </Tooltip>
  );
};

export function ProgressTimeline({ childId }: ProgressTimelineProps) {
  const [expandedSteps, setExpandedSteps] = useState<ExpandedSteps>({});
  const [expandedDescriptions, setExpandedDescriptions] = useState<ExpandedDescriptions>({});
  const [selectedTools, setSelectedTools] = useState<string[]>([]); // Will be populated after data loads
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]); // Will be populated after data loads
  const [isInitialized, setIsInitialized] = useState(false); // Track if we've set default selections
  
  // Use React Query hook instead of manual fetch
  const { data: progressData, isLoading: loading, error: queryError } = useProgress(childId.toString());
  
  // Breakpoint values for responsive design
  const isMdAndUp = useBreakpointValue({ base: false, md: true }) ?? false;
  const isSmallScreen = !isMdAndUp;
  const responsiveColumnWidth = useBreakpointValue({ base: "120px", md: "200px" }) ?? "120px";
  const responsiveDayColumnWidth = useBreakpointValue({ base: "30px", md: "40px" }) ?? "30px";
  const responsiveFontSize = useBreakpointValue({ base: "xs", md: "sm" }) ?? "xs";
  
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
        const entryDate = new Date(entry.entryDate);
        // Normalize both dates to avoid timezone issues
        const normalizedEntryDate = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
        const normalizedBaseDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
        
        const daysSinceStart = differenceInDays(normalizedEntryDate, normalizedBaseDate);
        const displayData = getEntryDisplayData(entry);
        
        // For chart data, we need string representation of icons
        let iconString = '';
        if (typeof displayData.icon === 'string') {
          iconString = displayData.icon;
        } else {
          // For ReactNode icons, extract the emoji from the entry data directly
          switch (entry.toolType) {
            case 'barometer':
              const rating = Number(entry.data.rating) || 0;
              const displayType = String(entry.data.displayType) || 'numbers';
              const smileyType = String(entry.data.smileyType) || 'emojis';
              
              if (displayType === 'percentage') {
                const percentage = Math.round(((rating - 1) / (5 - 1)) * 100);
                iconString = `${percentage}%`;
              } else if (displayType === 'numbers') {
                iconString = String(rating);
              } else if (displayType === 'smileys') {
                const range = 5 - 1;
                const position = (rating - 1) / range;
                const currentSmileyType = smileyType || 'emojis';
                
                if (currentSmileyType === 'emojis') {
                  if (position <= 0.2) iconString = '😢';
                  else if (position <= 0.4) iconString = '😟';
                  else if (position <= 0.6) iconString = '😐';
                  else if (position <= 0.8) iconString = '😊';
                  else iconString = '😄';
                } else if (currentSmileyType === 'simple') {
                  if (position <= 0.2) iconString = '☹️';
                  else if (position <= 0.4) iconString = '😕';
                  else if (position <= 0.6) iconString = '😐';
                  else if (position <= 0.8) iconString = '🙂';
                  else iconString = '😊';
                } else if (currentSmileyType === 'subtle') {
                  if (position <= 0.2) iconString = '😞';
                  else if (position <= 0.4) iconString = '😐';
                  else if (position <= 0.6) iconString = '😌';
                  else if (position <= 0.8) iconString = '😊';
                  else iconString = '😁';
                }
              }
              break;
            case 'dagens-smiley':
              iconString = String(entry.data.smileyValue || '😐');
              break;
            case 'sengetider':
              iconString = '🛏️';
              break;
            default:
              iconString = '📝';
              break;
          }
        }
        
        chartData.push({
          x: daysSinceStart,
          y: stepIndex + 1,
          stepTitle: step.title,
          stepId: step.id,
          icon: iconString,
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
    
    // Get unique step titles for steps filter - define this first since it's used in filtering
    const uniqueStepTitles = Array.from(new Set(plan.stepsWithEntries.map(step => step.title)));
    
    // Filter chart data to only include entries from selected steps
    const stepFilteredData = allChartData.filter(entry => {
      if (selectedSteps.length === 0 || selectedSteps.length === uniqueStepTitles.length) {
        return true; // Show all if no filter or all selected
      }
      // Find which step this entry belongs to
      const entryStep = plan.stepsWithEntries.find(step => 
        step.groupedEntries.some(e => e.id === entry.entryId)
      );
      return entryStep ? selectedSteps.includes(entryStep.title) : false;
    });

    // Get unique tool titles for rows (group by title instead of toolType) - from filtered data
    const uniqueToolTitles = Array.from(new Set(stepFilteredData.map(entry => entry.title)));

    // Group entries by tool title and date - using filtered data
    const entriesByTitleAndDate = stepFilteredData.reduce((acc, entry) => {
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

    // Calculate the date range - only show days with data, and never beyond today
    const daysWithData = allChartData.map(entry => entry.x + 1);
    const today = new Date();
    const planStartDate = plan.startDate ? new Date(plan.startDate) : new Date();
    const daysSinceStart = Math.floor((today.getTime() - planStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Only include days that either have data or are not in the future
    const maxDay = daysWithData.length > 0 ? Math.max(...daysWithData) : daysSinceStart;
    const cappedMaxDay = Math.min(maxDay, daysSinceStart); // Don't show future dates
    
    const allDays = Array.from({ length: cappedMaxDay }, (_, i) => i + 1); // [1, 2, 3, ..., cappedMaxDay]

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

    // Group consecutive empty days into condensed columns
    const processedDays = (() => {
      const result: Array<{ type: 'day' | 'condensed', day?: number, condensedDays?: number[], dateRange?: string }> = [];
      let emptyStreak: number[] = [];
      
      const hasDataForDay = (day: number) => {
        // Calculate the actual date for this day
        const baseDate = plan.startDate ? new Date(plan.startDate) : new Date();
        const currentDate = new Date(baseDate);
        currentDate.setDate(currentDate.getDate() + (day - 1));
        
        // Don't condense future dates - they should always be shown individually
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);
        
        if (currentDate >= today) {
          return true; // Treat future dates as having "data" to prevent condensation
        }
        
        return displayTitles.some(title => filteredData[title] && filteredData[title][day] && filteredData[title][day].length > 0);
      };
      
      allDays.forEach((day, index) => {
        const hasData = hasDataForDay(day);
        
        if (!hasData) {
          emptyStreak.push(day);
        } else {
          // If we have an empty streak of 2 or more days, condense them
          if (emptyStreak.length >= 2) {
            const baseDate = plan.startDate ? new Date(plan.startDate) : new Date();
            const startDate = new Date(baseDate);
            startDate.setDate(startDate.getDate() + (emptyStreak[0] - 1));
            const endDate = new Date(baseDate);
            endDate.setDate(endDate.getDate() + (emptyStreak[emptyStreak.length - 1] - 1));
            
            result.push({
              type: 'condensed',
              condensedDays: [...emptyStreak],
              dateRange: `${format(startDate, 'dd/MM', { locale: da })} - ${format(endDate, 'dd/MM', { locale: da })}`
            });
          } else {
            // Add individual empty days if streak is too short
            emptyStreak.forEach(emptyDay => {
              result.push({ type: 'day', day: emptyDay });
            });
          }
          emptyStreak = [];
          result.push({ type: 'day', day });
        }
        
        // Handle remaining empty streak at the end
        if (index === allDays.length - 1 && emptyStreak.length >= 2) {
          const baseDate = plan.startDate ? new Date(plan.startDate) : new Date();
          const startDate = new Date(baseDate);
          startDate.setDate(startDate.getDate() + (emptyStreak[0] - 1));
          const endDate = new Date(baseDate);
          endDate.setDate(endDate.getDate() + (emptyStreak[emptyStreak.length - 1] - 1));
          
          result.push({
            type: 'condensed',
            condensedDays: [...emptyStreak],
            dateRange: `${format(startDate, 'dd/MM', { locale: da })} - ${format(endDate, 'dd/MM', { locale: da })}`
          });
        } else if (index === allDays.length - 1 && emptyStreak.length > 0) {
          emptyStreak.forEach(emptyDay => {
            result.push({ type: 'day', day: emptyDay });
          });
        }
      });
      
      return result;
    })();

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
      items: plan.stepsWithEntries.map((step) => ({
        label: step.title,
        value: step.title,
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
          {step.stepNumber}
        </Box>
      }))
    });

    return (
      <Box w="full" p={{ base: 2, md: 4 }} bg="gray.50" borderRadius="md">
        {/* Header with filters */}
        <VStack gap={4} mb={4} align="stretch">
          <Text fontSize="lg" fontWeight="bold">
            Overblik ({allChartData.length} indtastninger)
          </Text>
          
          <Stack direction={{ base: "column", md: "row" }} gap={3} align="stretch">
            {/* Tools filter */}
            <Box flex={1} minW={{ base: "auto", md: "250px" }} maxW={{ base: "none", md: "300px" }}>
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
            <Box flex={1} minW={{ base: "auto", md: "250px" }} maxW={{ base: "none", md: "300px" }}>
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
          </Stack>
        </VStack>
        
        <Table.ScrollArea 
          borderWidth="1px" 
          borderColor="border.default" 
          borderRadius="lg"
          bg="bg.canvas"
          maxH={{ base: "50vh", md: "70vh" }}
        >
          <Table.Root 
            size="sm" 
            stickyHeader 
            variant="outline"
            colorPalette="gray"
          >
            {/* Column definitions */}
            <Table.ColumnGroup>
              <Table.Column htmlWidth={responsiveColumnWidth} />
              {processedDays.map((item, index) => (
                <Table.Column 
                  key={item.type === 'day' ? item.day : `condensed-${index}`} 
                  htmlWidth={responsiveDayColumnWidth} 
                />
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
                h="60px"
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
                    
                    // Normalize dates to avoid timezone issues
                    const normalizedPlanStart = new Date(planStartDate.getFullYear(), planStartDate.getMonth(), planStartDate.getDate());
                    const normalizedStepStart = new Date(stepStart.getFullYear(), stepStart.getMonth(), stepStart.getDate());
                    const normalizedStepEnd = new Date(stepEnd.getFullYear(), stepEnd.getMonth(), stepEnd.getDate());
                    
                    const startDay = Math.max(1, differenceInDays(normalizedStepStart, normalizedPlanStart) + 1);
                    const endDay = stepEndDate 
                      ? differenceInDays(normalizedStepEnd, normalizedPlanStart) + 1
                      : Math.min(allDays.length, startDay + 30);
                    
                    // Calculate span based on processed days
                    let spanCount = 0;
                    processedDays.forEach(item => {
                      if (item.type === 'day' && item.day! >= startDay && item.day! <= endDay) {
                        spanCount++;
                      } else if (item.type === 'condensed') {
                        const condensedInRange = item.condensedDays!.filter(day => day >= startDay && day <= endDay);
                        if (condensedInRange.length > 0) {
                          spanCount++; // Condensed column counts as 1 span regardless of how many days it represents
                        }
                      }
                    });
                    
                    if (spanCount === 0) return;
                    
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
                        colSpan={spanCount}
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
                          Trin {step.stepNumber}: {step.title}
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
                    px={{ base: 2, md: 4 }} 
                    py={{ base: 2, md: 3 }}
                    borderColor="border.default"
                    position="sticky"
                    left={0}
                    zIndex={20}
                    _hover={{ bg: "sage.50" }}
                    transition="all 0.2s"
                  >
                    <HStack gap={1} alignItems="center">
                      {isMdAndUp && getActivityRowIcon(titleToToolType[title])}
                      <Text fontSize={responsiveFontSize} fontWeight="600" color="navy.800" lineHeight="1.2" lineClamp={2}>
                        {title}
                      </Text>
                    </HStack>
                  </Table.Cell>
                  
                  {/* Data cells for each day */}
                  {processedDays.map((item, index) => {
                    if (item.type === 'condensed') {
                      // Condensed column - show subtle indication
                      return (
                        <Table.Cell 
                          key={`condensed-${index}`}
                          textAlign="center"
                          bg="gray.50"
                          borderColor="border.default"
                          px={1}
                          py={2}
                          position="relative"
                          borderLeft="2px dashed"
                          borderRight={index === processedDays.length - 1 ? "none" : "2px dashed"}
                          borderLeftColor="gray.300"
                          borderRightColor="gray.300"
                          title={`Ingen data: ${item.dateRange}`}
                        >
                          <Text fontSize="2xs" color="gray.300">⋯</Text>
                        </Table.Cell>
                      );
                    }
                    
                    // Regular day column
                    const dayNumber = item.day!;
                    const entries = filteredData[title][dayNumber] || [];
                    
                    return (
                      <Table.Cell 
                        key={dayNumber}
                        textAlign="center"
                        bg={entries.length > 0 ? "bg.canvas" : "bg.muted"}
                        borderColor="border.default"
                        px={{ base: 0.5, md: 1 }}
                        py={{ base: 1, md: 2 }}
                        position="relative"
                        _hover={{ 
                          bg: entries.length > 0 ? "gray.50" : "bg.subtle",
                          boxShadow: entries.length > 0 ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "none",
                          borderColor: entries.length > 0 ? "gray.300" : "border.default"
                        }}
                        transition="all 0.2s ease"
                        cursor={entries.length > 0 ? "pointer" : "default"}
                      >
                        {entries.length === 0 ? (
                          <Text fontSize="xs" color="gray.300">·</Text>
                        ) : entries.length === 1 ? (
                          <EnhancedTooltip 
                            content={formatTooltipContent(entries)}
                          >
                            <Box
                              fontSize="xl"
                              _hover={{ 
                                transform: "scale(1.2)",
                                filter: "brightness(1.1)"
                              }}
                              transition="all 0.2s ease"
                              position="relative"
                              zIndex={1}
                            >
                              {getEmojiIcon(entries[0].icon, 24)}
                            </Box>
                          </EnhancedTooltip>
                        ) : (
                          <EnhancedTooltip 
                            content={formatTooltipContent(entries)}
                          >
                            <VStack gap={0}>
                              <Text 
                                fontSize="sm" 
                                fontWeight="600" 
                                color="gray.600"
                                _groupHover={{ color: "gray.700" }}
                                transition="color 0.2s ease"
                              >
                                {entries.length}
                              </Text>
                              <Box 
                                fontSize="sm" 
                                color="blue.500"
                                _groupHover={{ 
                                  transform: "scale(1.1)",
                                  filter: "brightness(1.1)"
                                }}
                                transition="all 0.2s ease"
                              >
                                {getEmojiIcon(entries[0].icon, 18)}
                              </Box>
                            </VStack>
                          </EnhancedTooltip>
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
                h="50px"
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
                {processedDays.map((item, index) => {
                  if (item.type === 'condensed') {
                    return (
                      <Table.Cell 
                        key={`condensed-dates-${index}`}
                        textAlign="center"
                        bg="gray.50"
                        borderColor="border.default"
                        px={0.5}
                        py={1}
                        borderLeft="2px dashed"
                        borderRight={index === processedDays.length - 1 ? "none" : "2px dashed"}
                        borderLeftColor="gray.300"
                        borderRightColor="gray.300"
                        title={`Kondenseret periode: ${item.dateRange}`}
                      >
                        <Stack gap={0}>
                          <Text fontSize="2xs" fontWeight="normal" color="gray.400" lineHeight="1">
                            {item.dateRange?.split(' - ')[0]}
                          </Text>
                          <Text fontSize="2xs" fontWeight="normal" color="gray.400" lineHeight="1">
                            ⋯
                          </Text>
                          <Text fontSize="2xs" fontWeight="normal" color="gray.400" lineHeight="1">
                            {item.dateRange?.split(' - ')[1]}
                          </Text>
                        </Stack>
                      </Table.Cell>
                    );
                  }
                  
                  const dayNumber = item.day!;
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
                      <Text fontSize="xs" fontWeight="normal" color="navy.700">
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
      const entryDate = new Date(entry.entryDate);
      // Normalize date to avoid timezone issues
      const normalizedEntryDate = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
      const dateKey = format(normalizedEntryDate, 'yyyy-MM-dd');
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });
    
    return grouped;
  };

  // Dated Timeline Component
  const DatedTimeline = ({ step, isHorizontal }: { step: StepWithGroupedEntries; isHorizontal: boolean }) => {
    const entriesByDate = groupEntriesByDate(step.groupedEntries);
    
    // Generate date range based on actual entries, not the full step period
    const entryDates = Object.keys(entriesByDate).map(dateKey => new Date(dateKey)).sort((a, b) => a.getTime() - b.getTime());
    
    let dateRange: Date[] = [];
    if (entryDates.length > 0) {
      const firstEntryDate = entryDates[0];
      const lastEntryDate = entryDates[entryDates.length - 1];
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to start of day
      
      // Don't show dates beyond today
      const effectiveLastDate = lastEntryDate > today ? today : lastEntryDate;
      
      console.log(`DatedTimeline: Step ${step.title}, Entries from ${format(firstEntryDate, 'dd/MM')} to ${format(effectiveLastDate, 'dd/MM')}`);
      
      // Generate range from first entry to last entry (only dates with entries)
      const current = new Date(firstEntryDate);
      while (current <= effectiveLastDate) {
        const dateKey = format(current, 'yyyy-MM-dd');
        // Only include dates that have entries
        if (entriesByDate[dateKey]) {
          dateRange.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
      }
    }
    
    console.log(`DatedTimeline: Showing ${dateRange.length} dates for step ${step.title}`);
    
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
                  <Box fontSize="xl">
                    {displayData.icon}
                  </Box>
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
                              <Box fontSize="lg" mb={1}>
                                {displayData.icon}
                              </Box>
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
                            <Box fontSize="xl">
                              {displayData.icon}
                            </Box>
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

  // Helper function to get OpenMoji component for any emoji
  const getEmojiIcon = (content: string, size = 20) => {
    // Check if content is an emoji (simple check for common emoji patterns)
    const isEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|😐|😊|😄|😢|😟|🛏️|📝|☹️|😕|🙂|😞|😌|😁/u.test(content);
    
    if (isEmoji) {
      return (
        <OpenMojiEmoji 
          unicode={content || '😐'} 
          size={size}
          style={{ display: 'inline-block' }}
        />
      );
    }
    
    // Return as text if not an emoji
    return <Text>{content}</Text>;
  };

  // Helper function specifically for dagens smiley (backwards compatibility)
  const getDagensSmileyIcon = (smileyValue: string, size = 20) => {
    return getEmojiIcon(smileyValue, size);
  };

  // Helper function to get barometer display value based on display type
  const getBarometerDisplayValue = (rating: number, displayType: string, smileyType?: string, scaleMin = 1, scaleMax = 5): React.ReactNode => {
    if (displayType === 'percentage') {
      const percentage = Math.round(((rating - scaleMin) / (scaleMax - scaleMin)) * 100);
      return `${percentage}%`;
    }
    
    if (displayType === 'numbers') {
      return String(rating);
    }
    
    if (displayType === 'smileys') {
      const range = scaleMax - scaleMin;
      const position = (rating - scaleMin) / range;
      const currentSmileyType = smileyType || 'emojis';
      
      let emoji = '😐'; // default
      
      if (currentSmileyType === 'emojis') {
        // Traditional emojis for younger children
        if (position <= 0.2) emoji = '😢';
        else if (position <= 0.4) emoji = '😟';
        else if (position <= 0.6) emoji = '😐';
        else if (position <= 0.8) emoji = '😊';
        else emoji = '😄';
      } else if (currentSmileyType === 'simple') {
        // Simple text representations for table display
        if (position <= 0.2) emoji = '☹️';
        else if (position <= 0.4) emoji = '😕';
        else if (position <= 0.6) emoji = '😐';
        else if (position <= 0.8) emoji = '🙂';
        else emoji = '😊';
      } else if (currentSmileyType === 'subtle') {
        // More mature representations
        if (position <= 0.2) emoji = '😞';
        else if (position <= 0.4) emoji = '😐';
        else if (position <= 0.6) emoji = '😌';
        else if (position <= 0.8) emoji = '😊';
        else emoji = '😁';
      }
      
      // Return OpenMoji component for emoji display
      return (
        <OpenMojiEmoji 
          unicode={emoji} 
          size={20}
          style={{ display: 'inline-block' }}
        />
      );
    }
    
    // Fallback to rating number
    return String(rating);
  };

  const getEntryDisplayData = (entry: ProgressEntry): {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    color: string;
  } => {
    switch (entry.toolType) {
      case 'barometer':
        const rating = Number(entry.data.rating) || 0;
        const displayType = String(entry.data.displayType) || 'numbers';
        const smileyType = String(entry.data.smileyType) || 'emojis';
        
        return {
          icon: getBarometerDisplayValue(rating, displayType, smileyType),
          title: entry.toolTopic,
          subtitle: String(entry.data.comment || 'Ingen kommentar'),
          color: 'navy'
        };
      case 'dagens-smiley':
        return {
          icon: getEmojiIcon(String(entry.data.smileyValue || '😐')),
          title: entry.toolTopic,
          subtitle: String(entry.data.comment || 'Ingen kommentar'),
          color: 'sage'
        };
      case 'sengetider':
        return {
          icon: getEmojiIcon('🛏️'),
          title: `${entry.toolTopic}`,
          subtitle: `Sengetid: ${String(entry.data.bedtime || 'Ikke angivet')}`,
          color: 'golden'
        };
      default:
        return {
          icon: getEmojiIcon('📝'),
          title: entry.toolTopic,
          subtitle: 'Data registreret',
          color: 'gray'
        };
    }
  };

  // Helper function to format tooltip content for table cells
  const formatTooltipContent = (entries: Array<{
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
  }>) => {
    if (entries.length === 1) {
      const entry = entries[0];
      
      // Check if there's a comment
      const hasComment = entry.subtitle && !entry.subtitle.includes('Ingen kommentar');
      let comment = '';
      if (hasComment) {
        // Clean up the subtitle by removing redundant prefixes
        comment = entry.subtitle;
        if (comment.startsWith('Kommentar: ')) {
          comment = comment.replace('Kommentar: ', '');
        }
      }
      
      // Create tooltip content with badge for name
      return (
        <VStack align="start" gap={2}>
          {comment && (
            <Text fontSize="sm" lineHeight="1.4">
              {comment}
            </Text>
          )}
          {entry.recordedByName && (
            <Badge 
              variant="subtle" 
              colorScheme="blue" 
              size="sm"
              borderRadius="full"
            >
              {entry.recordedByName}
            </Badge>
          )}
          {!comment && !entry.recordedByName && (
            <Text fontSize="sm" color="fg.muted">
              Registrering gennemført
            </Text>
          )}
        </VStack>
      );
    } else {
      // Multiple entries - show simple summary
      return `${entries.length} registreringer`;
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
              Opret en indsatstrappe for at se overblikket
            </Text>
          </VStack>
        </Card.Body>
      </Card.Root>
    );
  }

  return (
    <Container maxW="8xl" px={{ base: 2, md: 4 }}>
      <VStack gap={{ base: 6, md: 8 }} align="stretch" w="full">

      {/* Progress Plans */}
      {progressData.plans.map((plan: ProgressPlan) => (
        <Card.Root key={plan.id} bg="bg.surface" borderColor="cream.200">
          <Card.Body>
            <VStack gap={6} align="stretch">
              {/* Plan Header */}
              <Box>
                <Stack direction={{ base: "column", lg: "row" }} justify="space-between" align={{ base: "stretch", lg: "start" }} gap={3} mb={3}>
                  <VStack align="start" gap={1} flex={1}>
                    <Stack direction={{ base: "column", sm: "row" }} gap={3} align={{ base: "start", sm: "center" }} wrap="wrap">
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
                    </Stack>
                    {plan.description && (
                      <Text color="gray.600" fontSize="sm">
                        {plan.description}
                      </Text>
                    )}
                  </VStack>
                  <VStack align="end" gap={1}>
                    <Text fontSize="xs" color="gray.500">
                      Overblik
                    </Text>
                    <Text fontSize="sm" fontWeight="medium" color="navy.700">
                      {plan.completedSteps}/{plan.totalSteps} trin
                    </Text>
                  </VStack>
                </Stack>

                <Stack direction={{ base: "column", sm: "row" }} gap={{ base: 2, sm: 4 }} fontSize="sm" color="gray.600" wrap="wrap">
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
                </Stack>
              </Box>

              <Separator />

              {/* Overview Table */}
              <ProgressTimelineChart plan={plan} />

             
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
                          <Stack direction={{ base: "column", lg: "row" }} justify="space-between" align={{ base: "stretch", lg: "start" }} gap={3} mb={3}>
                            <VStack align="start" gap={2} flex={1}>
                              <Stack direction={{ base: "column", sm: "row" }} gap={3} align={{ base: "start", sm: "center" }} wrap="wrap">
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
                              </Stack>
                              
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
                                          <Box fontSize="lg" lineHeight="1">
                                            {displayData.icon}
                                          </Box>
                                        </Box>
                                      );
                                    })}
                                  </HStack>
                                </Box>
                              )}

                              <Stack direction={{ base: "column", sm: "row" }} gap={{ base: 2, sm: 4 }} fontSize="xs" color="gray.500" wrap="wrap">
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
                              </Stack>
                            </VStack>

                            {isMdAndUp && hasEntries && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleStepExpansion(step.id)}
                                >
                                  {isExpanded ? 'Skjul' : 'Vis'} registreringer
                                  <Icon as={isExpanded ? IoChevronUp : IoChevronDown} ml={2} />
                                </Button>
                              )}
                          </Stack>

                          
                          {/* Mobile expand button */}
                          {isSmallScreen && hasEntries && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleStepExpansion(step.id)}
                                w="full"
                                justifyContent="center"
                              >
                                {isExpanded ? 'Skjul' : 'Vis'} registreringer
                                <Icon as={isExpanded ? IoChevronUp : IoChevronDown} ml={2} />
                              </Button>
                            )}

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
                              <DatedTimeline step={step} isHorizontal={isMdAndUp} />
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
    </Container>
  );
}