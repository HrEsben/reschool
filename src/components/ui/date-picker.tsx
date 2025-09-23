"use client";

import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { Input, Box } from '@chakra-ui/react';
import 'react-datepicker/dist/react-datepicker.css';
import './date-picker.css'; // Custom styles

interface DatePickerProps {
  selected?: Date | null;
  onChange?: (date: Date | null) => void;
  placeholderText?: string;
  minDate?: Date;
  maxDate?: Date;
  excludeDates?: Date[];
  excludeDateIntervals?: Array<{ start: Date; end: Date }>;
  dayClassName?: (date: Date) => string;
  size?: 'sm' | 'md' | 'lg';
  isInvalid?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  // Range selection props
  selectsRange?: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  onDateRangeChange?: (dates: [Date | null, Date | null]) => void;
}

// Custom input component that integrates with Chakra UI
interface CustomInputProps {
  onClick?: () => void;
  value?: string;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  isInvalid?: boolean;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(({ onClick, value, placeholder, size, isInvalid, ...props }, ref) => (
  <Input
    ref={ref}
    onClick={onClick}
    value={value}
    placeholder={placeholder}
    size={size}
    data-invalid={isInvalid}
    borderColor={isInvalid ? 'red.400' : undefined}
    readOnly
    cursor="pointer"
    _hover={{ borderColor: isInvalid ? 'red.400' : 'sage.400' }}
    _focus={{ borderColor: isInvalid ? 'red.400' : 'sage.500', boxShadow: `0 0 0 1px var(--chakra-colors-${isInvalid ? 'red' : 'sage'}-500)` }}
    {...props}
  />
));

CustomInput.displayName = 'CustomInput';

export function CustomDatePicker({
  selected,
  onChange,
  placeholderText = 'Vælg dato',
  minDate,
  maxDate,
  excludeDates,
  excludeDateIntervals,
  dayClassName,
  size = 'sm',
  isInvalid = false,
  disabled = false,
  selectsRange = false,
  startDate,
  endDate,
  onDateRangeChange,
  ...props
}: DatePickerProps) {
  // Handle range selection change
  const handleRangeChange = (dates: [Date | null, Date | null]) => {
    if (onDateRangeChange) {
      onDateRangeChange(dates);
    }
  };

  // For single date selection
  if (!selectsRange) {
    return (
      <Box position="relative">
        <DatePicker
          selected={selected}
          onChange={onChange}
          placeholderText={placeholderText}
          minDate={minDate}
          maxDate={maxDate}
          excludeDates={excludeDates}
          excludeDateIntervals={excludeDateIntervals}
          dayClassName={dayClassName}
          disabled={disabled}
          dateFormat="dd/MM/yyyy"
          locale="da-DK"
          customInput={
            <CustomInput 
              size={size} 
              isInvalid={isInvalid}
            />
          }
          popperClassName="reschool-datepicker-popper"
          wrapperClassName="reschool-datepicker-wrapper"
          calendarClassName="reschool-datepicker-calendar"
          {...props}
        />
      </Box>
    );
  }

  // For range selection
  return (
    <Box position="relative">
      <DatePicker
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={handleRangeChange}
        placeholderText={placeholderText}
        minDate={minDate}
        maxDate={maxDate}
        excludeDates={excludeDates}
        excludeDateIntervals={excludeDateIntervals}
        dayClassName={dayClassName}
        disabled={disabled}
        dateFormat="dd/MM/yyyy"
        locale="da-DK"
        customInput={
          <CustomInput 
            size={size} 
            isInvalid={isInvalid}
          />
        }
        popperClassName="reschool-datepicker-popper"
        wrapperClassName="reschool-datepicker-wrapper"
        calendarClassName="reschool-datepicker-calendar"
        {...props}
      />
    </Box>
  );
}