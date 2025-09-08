"use client";

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Timeline,
  Spinner,
} from '@chakra-ui/react';
import { showToast } from '@/components/ui/simple-toast';
import { DialogManager } from '@/components/ui/dialog-manager';

interface BarometerEntry {
  id: number;
  barometerId: number;
  recordedBy: number;
  entryDate: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  recordedByName?: string;
}

interface Barometer {
  id: number;
  childId: number;
  createdBy: number;
  topic: string;
  description?: string;
  scaleMin: number;
  scaleMax: number;
  displayType: string;
  smileyType?: string;
  createdAt: string;
  updatedAt: string;
}

interface BarometerTimelineProps {
  barometer: Barometer;
  trigger: React.ReactNode;
}

export function BarometerTimeline({ barometer, trigger }: BarometerTimelineProps) {
  const [entries, setEntries] = useState<BarometerEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/barometers/${barometer.id}/entries`);
      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }
      const data = await response.json();
      setEntries(data.entries || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
      showToast({
        title: 'Fejl',
        description: 'Kunne ikke hente historik',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [barometer.id]);

  useEffect(() => {
    if (isOpen) {
      fetchEntries();
    }
  }, [isOpen, fetchEntries]);

  // Calculate color based on rating position in scale
  const getRatingColor = (rating: number) => {
    const range = barometer.scaleMax - barometer.scaleMin;
    const position = (rating - barometer.scaleMin) / range; // 0 to 1
    
    if (position <= 0.5) {
      // Coral to Golden (0 to 0.5)
      const ratio = position * 2; // 0 to 1
      const red = Math.round(224 + (242 - 224) * ratio);
      const green = Math.round(122 + (204 - 122) * ratio);
      const blue = Math.round(95 + (143 - 95) * ratio);
      return `rgb(${red}, ${green}, ${blue})`;
    } else {
      // Golden to Sage (0.5 to 1)
      const ratio = (position - 0.5) * 2; // 0 to 1
      const red = Math.round(242 + (129 - 242) * ratio);
      const green = Math.round(204 + (178 - 204) * ratio);
      const blue = Math.round(143 + (154 - 143) * ratio);
      return `rgb(${red}, ${green}, ${blue})`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('da-DK', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const getDisplayValue = () => {
    switch (barometer.displayType) {
      case 'percentage':
        return (rating: number) => `${rating}%`;
      default:
        return (rating: number) => rating.toString();
    }
  };

  return (
    <DialogManager
      trigger={trigger}
      title={`Historik: ${barometer.topic}`}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      maxWidth="600px"
      customActions={[
        {
          label: 'Luk',
          variant: 'outline',
          onClick: () => setIsOpen(false),
        },
      ]}
    >
      <Box p={4}>
        {loading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="lg" color="blue.500" />
            <Text mt={4} color="gray.600">Henter historik...</Text>
          </Box>
        ) : entries.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Text color="gray.600">Ingen registreringer endnu</Text>
          </Box>
        ) : (
          <Timeline.Root>
            {entries.map((entry, index) => (
              <Timeline.Item key={entry.id}>
                <Timeline.Separator>
                  <Timeline.Indicator 
                    bg={getRatingColor(entry.rating)}
                    color="white"
                    fontWeight="bold"
                    fontSize="sm"
                  >
                    {getDisplayValue()(entry.rating)}
                  </Timeline.Indicator>
                  {index < entries.length - 1 && <Timeline.Connector />}
                </Timeline.Separator>
                <Timeline.Content>
                  <VStack align="start" gap={2}>
                    <HStack justify="space-between" width="100%">
                      <Text fontWeight="medium" fontSize="sm">
                        {formatDate(entry.entryDate)}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {entry.recordedByName || 'Anonym'}
                      </Text>
                    </HStack>
                                          {entry.comment && (
                        <Text fontSize="sm" color="gray.600" fontStyle="italic">
                          &ldquo;{entry.comment}&rdquo;
                        </Text>
                      )}
                  </VStack>
                </Timeline.Content>
              </Timeline.Item>
            ))}
          </Timeline.Root>
        )}
      </Box>
    </DialogManager>
  );
}
