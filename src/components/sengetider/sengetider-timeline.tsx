"use client";

import React, { forwardRef, useImperativeHandle } from 'react';
import {
  VStack,
  Text,
  Box,
  HStack,
  Spinner,
  Heading,
  Flex
} from '@chakra-ui/react';
import { useSengetiderEntries } from '@/lib/queries';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import { da } from 'date-fns/locale';

export interface SengetiderTimelineHandle {
  refresh: () => void;
}

interface SengetiderTimelineProps {
  sengetiderId: number;
  targetBedtime: string | undefined;
  childName: string | undefined;
}

export const SengetiderTimeline = forwardRef<SengetiderTimelineHandle, SengetiderTimelineProps>(
  ({ sengetiderId, targetBedtime, childName }, ref) => {
    const { 
      data: entries = [], 
      isLoading, 
      error, 
      refetch 
    } = useSengetiderEntries(sengetiderId);

    useImperativeHandle(ref, () => ({
      refresh: () => {
        refetch();
      }
    }));

    // Handle undefined values
    if (!targetBedtime || !childName) {
      return (
        <Box
          p={4}
          bg="gray.50"
          borderRadius="md"
          border="1px solid"
          borderColor="gray.200"
        >
          <Text color="gray.600">
            Manglende data for sengetider-visning.
          </Text>
        </Box>
      );
    }

    const getTimeDifference = (actualBedtime: string, targetBedtime: string) => {
      const actual = new Date(`1970-01-01T${actualBedtime}`);
      const target = new Date(`1970-01-01T${targetBedtime}`);
      const diffMinutes = (actual.getTime() - target.getTime()) / (1000 * 60);
      
      if (diffMinutes > 0) {
        return { type: 'late', minutes: Math.round(diffMinutes) };
      } else if (diffMinutes < 0) {
        return { type: 'early', minutes: Math.round(Math.abs(diffMinutes)) };
      } else {
        return { type: 'ontime', minutes: 0 };
      }
    };

    const getTimeIcon = (type: string) => {
      switch (type) {
        case 'early':
          return '🌟'; // Star for early bedtime
        case 'ontime':
          return '✅'; // Check mark for on time
        case 'late':
          return '🌙'; // Moon for late bedtime
        default:
          return '⏰'; // Clock for default
      }
    };

    const getTimeColor = (type: string) => {
      switch (type) {
        case 'early':
          return 'sage.500';
        case 'ontime':
          return 'sage.600';
        case 'late':
          return 'coral.500';
        default:
          return 'gray.500';
      }
    };

    if (isLoading) {
      return (
        <VStack gap={4} align="center" py={8}>
          <Spinner size="md" color="sage.500" />
          <Text color="gray.600">Indlæser sengetider...</Text>
        </VStack>
      );
    }

    if (error) {
      return (
        <Box
          p={4}
          bg="coral.50"
          borderRadius="md"
          border="1px solid"
          borderColor="coral.200"
        >
          <Text color="coral.700">
            Kunne ikke indlæse sengetider. Prøv igen senere.
          </Text>
        </Box>
      );
    }

    if (entries.length === 0) {
      return (
        <VStack gap={4} align="center" py={8}>
          <Text fontSize="3xl">🛏️</Text>
          <Text color="gray.600" textAlign="center">
            Ingen sengetider registreret endnu.
            <br />
            Registrer {childName}s første sengetid!
          </Text>
        </VStack>
      );
    }

    return (
      <VStack gap={4} align="stretch">
        <Heading size="sm" color="navy.700" mb={2}>
          Sengetids-historik
        </Heading>
        
        <VStack gap={3} align="stretch" maxH="400px" overflowY="auto">
          {entries.map((entry) => {
            const timeDiff = getTimeDifference(entry.actualBedtime, targetBedtime);
            const entryDate = parseISO(entry.entryDate);
            
            return (
              <Box
                key={entry.id}
                p={4}
                bg="white"
                borderRadius="md"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ borderColor: 'sage.300' }}
                transition="border-color 0.2s"
              >
                <Flex justify="space-between" align="start" gap={4}>
                  <VStack align="start" gap={1} flex={1}>
                    <HStack gap={2}>
                      <Text fontSize="lg">{getTimeIcon(timeDiff.type)}</Text>
                      <Text fontWeight="semibold" color="navy.700">
                        {format(entryDate, 'EEEE d. MMMM', { locale: da })}
                      </Text>
                    </HStack>
                    
                    <HStack gap={4} fontSize="sm" color="gray.600">
                      <Text>
                        <strong>Måltid:</strong> {entry.actualBedtime}
                      </Text>
                      <Text>
                        <strong>Mål:</strong> {targetBedtime}
                      </Text>
                    </HStack>
                    
                    {entry.notes && (
                      <Text fontSize="sm" color="gray.700" mt={1}>
                        <strong>Noter:</strong> {entry.notes}
                      </Text>
                    )}
                  </VStack>
                  
                  <VStack align="end" gap={1}>
                    <Text 
                      fontSize="sm" 
                      fontWeight="semibold"
                      color={getTimeColor(timeDiff.type)}
                    >
                      {timeDiff.type === 'ontime' && 'Præcis tid!'}
                      {timeDiff.type === 'early' && `${timeDiff.minutes} min. tidligt`}
                      {timeDiff.type === 'late' && `${timeDiff.minutes} min. sent`}
                    </Text>
                    
                    <Text fontSize="xs" color="gray.500">
                      {formatDistanceToNow(entryDate, { 
                        addSuffix: true, 
                        locale: da 
                      })}
                    </Text>
                  </VStack>
                </Flex>
              </Box>
            );
          })}
        </VStack>
      </VStack>
    );
  }
);

SengetiderTimeline.displayName = 'SengetiderTimeline';
