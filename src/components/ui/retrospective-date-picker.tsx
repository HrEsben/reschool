"use client";

import { useState } from 'react';
import {
  VStack,
  Text,
  Input,
  Button,
  Flex,
  Box,
} from '@chakra-ui/react';
import { format, isAfter, isBefore } from 'date-fns';
import { da } from 'date-fns/locale';

interface RetrospectiveDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  label?: string;
  maxDaysBack?: number; // Maximum days back allowed (default: 90)
  disabled?: boolean;
}

export function RetrospectiveDatePicker({
  selectedDate,
  onDateChange,
  label = "Dato for registrering",
  maxDaysBack = 90,
  disabled = false
}: RetrospectiveDatePickerProps) {
  const [dateInput, setDateInput] = useState(() => {
    return format(selectedDate, 'yyyy-MM-dd');
  });

  // Calculate min date (maxDaysBack ago)
  const today = new Date();
  const minDate = new Date();
  minDate.setDate(today.getDate() - maxDaysBack);

  // Quick date selection buttons
  const quickDateOptions = [
    { label: 'I dag', date: today },
    { label: 'I går', date: new Date(today.getTime() - 24 * 60 * 60 * 1000) },
    { label: 'I forgårs', date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000) },
  ];

  const handleDateInputChange = (value: string) => {
    setDateInput(value);
    
    if (value) {
      const newDate = new Date(value + 'T12:00:00'); // Set to noon to avoid timezone issues
      
      // Validate date is not in the future and not too far back
      if (isAfter(newDate, today)) {
        return; // Don't update if future date
      }
      
      if (isBefore(newDate, minDate)) {
        return; // Don't update if too far back
      }
      
      onDateChange(newDate);
    }
  };

  const handleQuickDateSelect = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    setDateInput(dateString);
    onDateChange(date);
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');

  return (
    <VStack align="stretch" gap={3}>
      <Box>
        <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={2}>
          {label}
        </Text>
        <Input
          type="date"
          value={dateInput}
          onChange={(e) => handleDateInputChange(e.target.value)}
          min={format(minDate, 'yyyy-MM-dd')}
          max={format(today, 'yyyy-MM-dd')}
          size="md"
          borderColor="cream.300"
          borderRadius="lg"
          bg="cream.25"
          disabled={disabled}
          _hover={{ borderColor: "cream.400" }}
          _focus={{ 
            borderColor: "sage.400", 
            boxShadow: "0 0 0 1px var(--chakra-colors-sage-400)",
            bg: "white",
            outline: "none"
          }}
        />
      </Box>

      {/* Quick date selection buttons */}
      <Box>
        <Text fontSize="xs" color="gray.500" mb={2}>
          Eller vælg hurtig:
        </Text>
        <Flex gap={2} wrap="wrap">
          {quickDateOptions.map((option) => (
            <Button
              key={option.label}
              size="sm"
              variant={format(selectedDate, 'yyyy-MM-dd') === format(option.date, 'yyyy-MM-dd') ? "solid" : "outline"}
              colorScheme={format(selectedDate, 'yyyy-MM-dd') === format(option.date, 'yyyy-MM-dd') ? "sage" : "gray"}
              onClick={() => handleQuickDateSelect(option.date)}
              disabled={disabled}
              fontSize="xs"
            >
              {option.label}
            </Button>
          ))}
        </Flex>
      </Box>

      {/* Warning for old dates */}
      {!isToday && (
        <Box>
          <Text fontSize="xs" color="orange.600" fontStyle="italic">
            Du registrerer for en tidligere dato
          </Text>
        </Box>
      )}
    </VStack>
  );
}