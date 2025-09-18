"use client";

import React, { useState, useEffect } from 'react';
import {
  Button,
  Input,
  VStack,
  Text,
  Flex,
  Box,
} from '@chakra-ui/react';
import { format, isAfter, isBefore } from 'date-fns';
import { da } from 'date-fns/locale';
import { DialogManager } from '@/components/ui/dialog-manager';

interface CompactDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  maxDaysBack?: number; // Maximum days back allowed (default: 90)
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function CompactDatePicker({
  selectedDate,
  onDateChange,
  maxDaysBack = 90,
  disabled = false,
  size = "md"
}: CompactDatePickerProps) {
  const [dateInput, setDateInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Update dateInput when selectedDate changes
  useEffect(() => {
    setDateInput(format(selectedDate, 'yyyy-MM-dd'));
  }, [selectedDate]);

  // All date calculations moved inside mounted guard
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
      setIsOpen(false); // Close dialog after selection
    }
  };

  const handleQuickDateSelect = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    setDateInput(dateString);
    onDateChange(date);
    setIsOpen(false); // Close dialog after selection
  };

  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  
  // Get display text for the button
  const getButtonText = () => {
    if (isToday) {
      return 'I dag';
    }
    
    return format(selectedDate, 'd/M', { locale: da });
  };

  return (
    <>
      <Button
        size={size}
        variant="outline"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        borderColor="cream.300"
        color={isToday ? "sage.700" : "orange.600"}
        borderWidth={isToday ? "1px" : "2px"}
        _hover={{ 
          borderColor: isToday ? "sage.400" : "orange.400",
          bg: isToday ? "sage.50" : "orange.50"
        }}
        _focus={{ 
          boxShadow: isToday ? "0 0 0 1px var(--chakra-colors-sage-400)" : "0 0 0 1px var(--chakra-colors-orange-400)",
          outline: "none"
        }}
        title={`Valgt dato: ${format(selectedDate, 'EEEE d. MMMM yyyy', { locale: da })}`}
      >
        {getButtonText()}
      </Button>
      
      <DialogManager
        trigger={<div style={{ display: 'none' }} />}
        title="Vælg dato for registrering"
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        primaryAction={{
          label: "Vælg",
          onClick: () => setIsOpen(false),
          colorScheme: "sage"
        }}
        secondaryAction={{
          label: "Annuller",
          onClick: () => setIsOpen(false),
          colorScheme: "gray"
        }}
      >
        <VStack align="stretch" gap={4}>
          {/* Date input */}
          <VStack align="start" gap={2}>
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              Vælg specifik dato:
            </Text>
            <Input
              type="date"
              value={dateInput}
              onChange={(e) => handleDateInputChange(e.target.value)}
              min={format(minDate, 'yyyy-MM-dd')}
              max={format(today, 'yyyy-MM-dd')}
              size="md"
              borderColor="cream.300"
              borderRadius="md"
              bg="cream.25"
              _hover={{ borderColor: "cream.400" }}
              _focus={{ 
                borderColor: "sage.400", 
                boxShadow: "0 0 0 1px var(--chakra-colors-sage-400)",
                bg: "white",
                outline: "none"
              }}
            />
          </VStack>

          {/* Quick date selection buttons */}
          <VStack align="stretch" gap={3}>
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              Eller hurtig valg:
            </Text>
            <Flex direction="column" gap={2}>
              {quickDateOptions.map((option) => (
                <Button
                  key={option.label}
                  size="md"
                  variant={format(selectedDate, 'yyyy-MM-dd') === format(option.date, 'yyyy-MM-dd') ? "solid" : "outline"}
                  colorScheme={format(selectedDate, 'yyyy-MM-dd') === format(option.date, 'yyyy-MM-dd') ? "sage" : "gray"}
                  onClick={() => handleQuickDateSelect(option.date)}
                  justifyContent="space-between"
                  fontWeight="normal"
                >
                  {option.label}
                  <Text as="span" fontSize="sm" color="gray.500">
                    {format(option.date, 'd/M')}
                  </Text>
                </Button>
              ))}
            </Flex>
          </VStack>
        </VStack>
      </DialogManager>
    </>
  );
}