"use client";

import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Stack,
  Text,
  Heading,
  Badge,
  Skeleton,
  Icon,
  Card,
  Separator,
  Table,
  useBreakpointValue,
  Select,
  Portal,
  createListCollection,
  Container
} from '@chakra-ui/react';
import { FaStairs, FaClock, FaClipboardList } from 'react-icons/fa6';
import { Icons } from '@/components/ui/icons';
import { OpenMojiEmoji } from '@/components/ui/openmoji-emoji';
import { Thermometer, Smile, Bed, Edit3 } from 'lucide-react';
import { Tooltip } from '@/components/ui/tooltip';
import { format, parseISO, isValid, differenceInDays } from 'date-fns';
import { da } from 'date-fns/locale';
import { useProgress } from '@/lib/queries';
import { getSmileyForEntry } from '@/lib/simple-smiley-mapper';
import type { ProgressPlan, StepWithGroupedEntries, ProgressEntry } from '@/lib/database-service';

interface ProgressTimelineProps {
  childId: number;
}

type StepActivePeriod = {
  startDate: string;
  endDate?: string;
};

type StepWithActivePeriods = StepWithGroupedEntries & {
  activePeriods?: StepActivePeriod[];
  startDate?: string;
};

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
  const [selectedTools, setSelectedTools] = useState<string[]>([]); // Will be populated after data loads
  const [selectedSteps, setSelectedSteps] = useState<string[]>([]); // Will be populated after data loads
  const [isInitialized, setIsInitialized] = useState(false); // Track if we've set default selections
  
  // Use React Query hook instead of manual fetch
  const { data: progressData, isLoading: loading, error: queryError } = useProgress(childId.toString());
  
  // Breakpoint values for responsive design
  const isMdAndUp = useBreakpointValue({ base: false, md: true }) ?? false;
  const responsiveColumnWidth = useBreakpointValue({ base: "120px", md: "200px" }) ?? "120px";
  const responsiveDayColumnWidth = useBreakpointValue({ base: "30px", md: "40px" }) ?? "30px";
  const responsiveFontSize = useBreakpointValue({ base: "xs", md: "sm" }) ?? "xs";
  
  // Initialize all tools and steps as selected when data loads
  React.useEffect(() => {
    if (progressData && progressData.plans && progressData.plans.length > 0 && !isInitialized) {
      const allToolTitles = Array.from(new Set(
        progressData.plans.flatMap((plan: ProgressPlan) =>
          (plan.stepsWithEntries || []).flatMap((step: StepWithGroupedEntries) => 
            step.groupedEntries
              .filter(entry => entry != null && entry.createdAt != null)
              .map((entry: ProgressEntry) => {
              const displayData = getEntryDisplayData(entry);
              return displayData.title;
            })
          )
        )
      )) as string[];
      
      const allStepTitles = Array.from(new Set(
        progressData.plans.flatMap((plan: ProgressPlan) =>
          (plan.stepsWithEntries || []).map((step: StepWithGroupedEntries) => step.title)
        )
      )) as string[];
      
      setSelectedTools(allToolTitles);
      setSelectedSteps(allStepTitles);
      setIsInitialized(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progressData, isInitialized]);
  
  // Convert query error to string for display
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Der opstod en fejl') : null;

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
    
    (plan.stepsWithEntries || []).forEach((step, stepIndex) => {
      
      step.groupedEntries.forEach((entry: ProgressEntry) => {
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
              const rating = Number(entry.rating) || 0;
              const displayType = String(entry.displayType) || 'smileys';
              const smileyType = String(entry.smileyType) || 'emojis';
              const scaleMin = Number(entry.scaleMin) || 1;
              const scaleMax = Number(entry.scaleMax) || 5;
              
              // Debug logging
              console.log('🔍 transformEntriesForChart - Barometer Entry:', {
                entryId: entry.id,
                toolTopic: entry.toolTopic,
                rating: entry.rating,
                displayType: entry.displayType,
                smileyType: entry.smileyType,
                computed: { rating, displayType, smileyType, scaleMin, scaleMax },
                rawSmileyType: entry.smileyType,
                rawDisplayType: entry.displayType
              });
              
              const result = getSmileyForEntry({
                rating,
                displayType,
                smileyType,
                scaleMin,
                scaleMax
              });
              
              // For transformEntriesForChart, we need string emojis for the table display
              // If the result is a React element (SVG), convert to emoji based on position
              if (typeof result === 'string') {
                iconString = result;
              } else {
                // Calculate position to determine the appropriate emoji
                const range = scaleMax - scaleMin;
                const position = (rating - scaleMin) / range;
                
                if (position <= 0.2) iconString = '😢';
                else if (position <= 0.4) iconString = '😟';
                else if (position <= 0.6) iconString = '😐';
                else if (position <= 0.8) iconString = '😊';
                else iconString = '😄';
              }
              
              console.log('🎯 transformEntriesForChart - getSmileyForEntry result:', { result, iconString, position: (rating - scaleMin) / (scaleMax - scaleMin) });
              break;
            case 'dagens-smiley':
              iconString = String(entry.smileyValue || '😐');
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
          createdAt: entry.createdAt instanceof Date ? entry.createdAt.toISOString() : entry.createdAt,
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
    const uniqueStepTitles = Array.from(new Set((plan.stepsWithEntries || []).map(step => step.title)));
    
    // Filter chart data to only include entries from selected steps
    const stepFilteredData = allChartData.filter(entry => {
      if (selectedSteps.length === 0 || selectedSteps.length === uniqueStepTitles.length) {
        return true; // Show all if no filter or all selected
      }
      // Find which step this entry belongs to
      const entryStep = (plan.stepsWithEntries || []).find(step => 
        step.groupedEntries.some((e: ProgressEntry) => e.id === entry.entryId)
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
        case 'barometer': return <Icons.Barometer size={4} color="navy.400" />;
        case 'dagens-smiley': return <Icons.Smiley size={4} color="sage.400" />;
        case 'sengetider': return <Icons.Bedtime size={4} color="golden.400" />;
        default: return <Icons.Edit size={4} color="navy.400" />;
      }
    };

    // Helper function to get tool icon for select dropdown
    const getToolIcon = (title: string) => {
      const toolType = allChartData.find(item => item.title === title)?.toolType;
      switch (toolType) {
        case 'barometer': return <Icon as={Thermometer} size="xs" color="navy.400" />;
        case 'dagens-smiley': return <Icon as={Smile} size="xs" color="sage.400" />;
        case 'sengetider': return <Icon as={Bed} size="xs" color="golden.400" />;
        default: return <Icon as={Edit3} size="xs" color="navy.400" />;
      }
    };    if (allChartData.length === 0) {
      return (
        <Box h="400px" w="full" display="flex" alignItems="center" justifyContent="center">
          <VStack gap={2}>
            <Text color="navy.500" fontSize="lg">
              Ingen data at vise i oversigten
            </Text>
            <Text color="navy.400" fontSize="sm">
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
      stepsWithEntries: (plan.stepsWithEntries || []).filter(step => 
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
      items: (plan.stepsWithEntries || []).map((step) => ({
        label: step.title,
        value: step.title,
        icon: <Box 
          w={4} h={4} 
          borderRadius="full" 
          bg="cream.400" 
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
      <Box w="full" p={{ base: 2, md: 4 }} bg="cream.50" borderRadius="md">
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
                        ? <HStack gap={1}><FaStairs size={14} color="navy.500" /><Text>Ingen trin valgt</Text></HStack>
                        : selectedSteps.length === uniqueStepTitles.length
                        ? <HStack gap={1}><FaStairs size={14} color="navy.500" /><Text>Alle trin</Text></HStack>
                        : <HStack gap={1}><FaStairs size={14} color="navy.500" /><Text>Flere trin</Text></HStack>
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
          borderColor="border.sage" 
          borderRadius="lg"
          bg="bg.canvas"
          maxH={{ base: "50vh", md: "70vh" }}
        >
          <Table.Root 
            size="sm" 
            stickyHeader 
            variant="outline"
            colorPalette="current"
            showColumnBorder={true}
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
                  borderColor="border.subtle"
                  position="sticky"
                  top={0}
                  zIndex={31}
                >
                  <Text fontSize="sm" fontWeight="600" color="navy.800">
                    Værktøj
                  </Text>
                </Table.ColumnHeader>
                {(() => {
                  // Calculate step spans and render merged cells - handle multiple active periods per step
                  const stepCells: React.ReactElement[] = [];
                  const planStartDate = plan.startDate ? new Date(plan.startDate) : new Date();
                  
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

                  // Helper function to convert day ranges to column spans in the processedDays array
                  const getColumnSpanForDayRange = (startDay: number, endDay: number): { startColumnIndex: number, columnCount: number } => {
                    let startColumnIndex = -1;
                    let endColumnIndex = -1;
                    
                    // Find the column indices for the start and end days
                    for (let i = 0; i < processedDays.length; i++) {
                      const item = processedDays[i];
                      
                      if (item.type === 'day') {
                        // Regular day column
                        if (item.day === startDay && startColumnIndex === -1) {
                          startColumnIndex = i;
                        }
                        if (item.day && item.day <= endDay) {
                          endColumnIndex = i;
                        }
                      } else if (item.type === 'condensed') {
                        // Condensed column - check if any of our days fall within it
                        const condensedDays = item.condensedDays || [];
                        
                        // Check if start day is in this condensed range
                        if (condensedDays.includes(startDay) && startColumnIndex === -1) {
                          startColumnIndex = i;
                        }
                        
                        // Check if any day up to endDay is in this condensed range
                        const hasAnyDayInRange = condensedDays.some(day => day >= startDay && day <= endDay);
                        if (hasAnyDayInRange) {
                          endColumnIndex = i;
                        }
                      }
                    }
                    
                    // Fallback: if we can't find exact matches, find the closest columns
                    if (startColumnIndex === -1) {
                      // Find the first column that contains or comes after startDay
                      for (let i = 0; i < processedDays.length; i++) {
                        const item = processedDays[i];
                        if (item.type === 'day' && item.day && item.day >= startDay) {
                          startColumnIndex = i;
                          break;
                        } else if (item.type === 'condensed') {
                          const condensedDays = item.condensedDays || [];
                          if (condensedDays.some(day => day >= startDay)) {
                            startColumnIndex = i;
                            break;
                          }
                        }
                      }
                    }
                    
                    if (endColumnIndex === -1) {
                      // Find the last column that contains or comes before endDay
                      for (let i = processedDays.length - 1; i >= 0; i--) {
                        const item = processedDays[i];
                        if (item.type === 'day' && item.day && item.day <= endDay) {
                          endColumnIndex = i;
                          break;
                        } else if (item.type === 'condensed') {
                          const condensedDays = item.condensedDays || [];
                          if (condensedDays.some(day => day <= endDay)) {
                            endColumnIndex = i;
                            break;
                          }
                        }
                      }
                    }
                    
                    // Safety fallbacks
                    if (startColumnIndex === -1) startColumnIndex = 0;
                    if (endColumnIndex === -1) endColumnIndex = processedDays.length - 1;
                    if (endColumnIndex < startColumnIndex) endColumnIndex = startColumnIndex;
                    
                    const columnCount = endColumnIndex - startColumnIndex + 1;
                    
                    return { startColumnIndex, columnCount };
                  };
                  
                  (filteredPlan.stepsWithEntries || []).forEach((step, stepIndex) => {
                    // Check if step has multiple active periods (for demoted/restarted steps)
                    const stepWithPeriods = step as StepWithActivePeriods;
                    const rawActivePeriods = stepWithPeriods.activePeriods || [];
                    // Use the original step start date from database, not timePerriod which gets overwritten
                    const stepStartDate = stepWithPeriods.startDate || step.timePerriod?.startDate;
                    
                    
                    // Create complete periods list by filling gaps between step start and first active period
                    let allPeriods: { startDate: string; endDate?: string; isSynthetic?: boolean }[] = [];
                    
                    if (rawActivePeriods.length > 0 && stepStartDate) {
                      // Sort active periods by start date
                      const sortedPeriods = [...rawActivePeriods].sort((a, b) => 
                        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                      );
                      
                      const stepStart = new Date(stepStartDate);
                      const firstPeriodStart = new Date(sortedPeriods[0].startDate);
                      
                      // Check if there's a gap between step start and first active period
                      const daysDiff = differenceInDays(firstPeriodStart, stepStart);
                      
                      // Check if there are intermediate steps between the gap to validate step progression
                      const hasIntermediateSteps = (filteredPlan.stepsWithEntries || []).some(otherStep => {
                        if (otherStep.id === step.id) return false; // Skip self
                        
                        // Check if this other step has entries in the gap period
                        const gapStart = new Date(stepStartDate);
                        const gapEnd = new Date(firstPeriodStart);
                        
                        return otherStep.groupedEntries.some((entry: ProgressEntry) => {
                          const entryDate = new Date(entry.entryDate);
                          return entryDate >= gapStart && entryDate < gapEnd;
                        });
                      });
        
                      
                      if (daysDiff > 1 && hasIntermediateSteps) {
                        // Create synthetic period to fill the gap - only if there are intermediate steps
                        const syntheticEndDate = new Date(firstPeriodStart);
                        syntheticEndDate.setDate(syntheticEndDate.getDate() - 1); // End one day before first period
                        
                   
                        allPeriods.push({
                          startDate: stepStartDate,
                          endDate: syntheticEndDate.toISOString(),
                          isSynthetic: true
                        });
                      } else if (daysDiff > 1 && !hasIntermediateSteps) {
                     // Extend the first active period to start from the original step start date
                        sortedPeriods[0] = {
                          ...sortedPeriods[0],
                          startDate: stepStartDate
                        };
                      }
                      
                      // Add all real active periods
                      allPeriods = allPeriods.concat(sortedPeriods.map(p => ({ ...p, isSynthetic: false })));
                    } else {
                      // Use raw periods if no gaps to fill
                      allPeriods = rawActivePeriods.map((p: StepActivePeriod) => ({ ...p, isSynthetic: false }));
                    }
                    
                    
                    if (allPeriods.length > 0) {
                      // Handle steps with multiple active periods (including synthetic ones)
                      allPeriods.forEach((period: { startDate: string; endDate?: string; isSynthetic?: boolean }, periodIndex: number) => {
                        const periodStart = new Date(period.startDate);
                        const periodEnd = period.endDate ? new Date(period.endDate) : new Date();
                        
                        // Normalize dates to avoid timezone issues
                        const normalizedPlanStart = new Date(planStartDate.getFullYear(), planStartDate.getMonth(), planStartDate.getDate());
                        const normalizedPeriodStart = new Date(periodStart.getFullYear(), periodStart.getMonth(), periodStart.getDate());
                        const normalizedPeriodEnd = new Date(periodEnd.getFullYear(), periodEnd.getMonth(), periodEnd.getDate());
                        
                        const startDay = Math.max(1, differenceInDays(normalizedPeriodStart, normalizedPlanStart) + 1);
                        const endDay = period.endDate 
                          ? differenceInDays(normalizedPeriodEnd, normalizedPlanStart) + 1
                          : Math.min(allDays.length, startDay + 30);
                        
                        // Get the actual column span accounting for condensed columns
                        const { columnCount } = getColumnSpanForDayRange(startDay, endDay);
                
                        if (columnCount <= 0) return;
                        
                        const bgColor = stepColors[stepIndex % stepColors.length];
                        
                        stepCells.push(
                          <Table.ColumnHeader 
                            key={`${step.id}-period-${periodIndex}`}
                            colSpan={columnCount}
                            textAlign="center"
                            bg={bgColor}
                            borderColor="border.subtle"
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
                    } else {
                      // Fallback to single time period for steps without active periods
                      const stepStartDate = step.timePerriod?.startDate;
                      const stepEndDate = step.timePerriod?.endDate;
                      
                      if (!stepStartDate) {
                     return;
                      }
                      
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
                      
                      // Get the actual column span accounting for condensed columns
                      const { columnCount } = getColumnSpanForDayRange(startDay, endDay);
                      
                      if (columnCount <= 0) {
                        return;
                      }
                      
                      const bgColor = stepColors[stepIndex % stepColors.length];
                      
                      stepCells.push(
                        <Table.ColumnHeader 
                          key={step.id}
                          colSpan={columnCount}
                          textAlign="center"
                          bg={bgColor}
                          borderColor="border.subtle"
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
                    }
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
                    borderColor="border.subtle"
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
                          bg="cream.50"
                          borderColor="border.subtle"
                          px={1}
                          py={2}
                          position="relative"
                          borderLeft="2px dashed"
                          borderRight={index === processedDays.length - 1 ? "none" : "2px dashed"}
                          borderLeftColor="cream.300"
                          borderRightColor="cream.300"
                          title={`Ingen data: ${item.dateRange}`}
                        >
                          <Text fontSize="2xs" color="cream.500">⋯</Text>
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
                        borderColor="border.subtle"
                        px={{ base: 0.5, md: 1 }}
                        py={{ base: 1, md: 2 }}
                        position="relative"
                        _hover={{ 
                          bg: entries.length > 0 ? "cream.50" : "bg.subtle",
                          boxShadow: entries.length > 0 ? "0 2px 4px rgba(0, 0, 0, 0.1)" : "none",
                          borderColor: entries.length > 0 ? "cream.300" : "border.subtle"
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
                  borderColor="border.subtle" 
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
                        bg="cream.50"
                        borderColor="border.subtle"
                        px={0.5}
                        py={1}
                        borderLeft="2px dashed"
                        borderRight={index === processedDays.length - 1 ? "none" : "2px dashed"}
                        borderLeftColor="cream.300"
                        borderRightColor="cream.300"
                        title={`Kondenseret periode: ${item.dateRange}`}
                      >
                        <Stack gap={0}>
                          <Text fontSize="2xs" fontWeight="normal" color="cream.500" lineHeight="1">
                            {item.dateRange?.split(' - ')[0]}
                          </Text>
                          <Text fontSize="2xs" fontWeight="normal" color="cream.500" lineHeight="1">
                            ⋯
                          </Text>
                          <Text fontSize="2xs" fontWeight="normal" color="cream.500" lineHeight="1">
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
                      borderColor="border.subtle"
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



  // Helper function to get barometer display value based on display type
  const getBarometerDisplayValue = (rating: number, displayType: string, smileyType?: string, scaleMin = 1, scaleMax = 5): React.ReactNode => {
    const result = getSmileyForEntry({
      rating,
      displayType,
      smileyType,
      scaleMin,
      scaleMax
    }, 20);
    
    // If result is a string emoji, wrap it in OpenMoji component
    if (typeof result === 'string' && displayType === 'smileys') {
      return (
        <OpenMojiEmoji 
          unicode={result} 
          size={20}
          style={{ display: 'inline-block' }}
        />
      );
    }
    
    return result;
  };

  const getEntryDisplayData = (entry: ProgressEntry | null | undefined): {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    color: string;
  } => {
    // Guard clause to handle undefined entry
    if (!entry) {
      return {
        icon: getEmojiIcon('❓'),
        title: 'Ukendt data',
        subtitle: 'Data ikke tilgængelig',
        color: 'gray'
      };
    }

    switch (entry.toolType) {
      case 'barometer':
        const rating = Number(entry?.rating) || 0;
        const displayType = String(entry?.displayType) || 'smileys';
        const smileyType = String(entry?.smileyType) || 'emojis';
        const scaleMin = Number(entry?.scaleMin) || 1;
        const scaleMax = Number(entry?.scaleMax) || 5;
        
        // Debug logging
        console.log('📊 getEntryDisplayData - Barometer Entry:', {
          entryId: entry?.id,
          toolTopic: entry?.toolTopic,
          rawEntry: entry,
          computed: { rating, displayType, smileyType, scaleMin, scaleMax }
        });
        
        const displayValue = getBarometerDisplayValue(rating, displayType, smileyType, scaleMin, scaleMax);
        console.log('📈 getEntryDisplayData - getBarometerDisplayValue result:', displayValue);
        
        return {
          icon: displayValue,
          title: entry?.toolTopic || 'Barometer',
          subtitle: String(entry?.comment || 'Ingen kommentar'),
          color: 'navy'
        };
      case 'dagens-smiley':
        return {
          icon: getEmojiIcon(String(entry?.smileyValue || entry?.comment || '😐')),
          title: entry?.toolTopic || 'Dagens Smiley',
          subtitle: String(entry?.comment || 'Ingen kommentar'),
          color: 'sage'
        };
      case 'sengetider':
        return {
          icon: getEmojiIcon('🛏️'),
          title: entry?.toolTopic || 'Sengetider',
          subtitle: `Sengetid: ${String(entry?.bedtime || 'Ikke angivet')}`,
          color: 'golden'
        };
      default:
        return {
          icon: getEmojiIcon('📝'),
          title: entry?.toolTopic || 'Data registreret',
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
            <Text color="navy.500" fontSize="sm" textAlign="center">
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
            </VStack>
          </Card.Body>
        </Card.Root>
      ))}
      </VStack>
    </Container>
  );
}