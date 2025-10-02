import React from 'react';

// Simple interface for barometer entry data
interface EntryData {
  rating: number;
  displayType?: string;
  smileyType?: string;
  scaleMin?: number;
  scaleMax?: number;
}

// Simple mapping function to get the correct smiley for a saved entry
export const getSmileyForEntry = (entry: EntryData, size: number = 24): string | React.ReactNode => {
  const { rating, displayType = 'smileys', smileyType = 'emojis', scaleMin = 1, scaleMax = 5 } = entry;

  // For non-smiley types, return the rating number
  if (displayType !== 'smileys') {
    if (displayType === 'percentage') {
      return `${rating}%`;
    }
    return rating.toString();
  }

  // Calculate position (0-1) based on rating and scale
  const range = scaleMax - scaleMin;
  const position = (rating - scaleMin) / range;

  // Return smiley based on type and position
  return getSmileyByPosition(position, smileyType, size);
};

// Helper to get smiley by position and type
const getSmileyByPosition = (position: number, smileyType: string = 'emojis', size: number = 24): string | React.ReactNode => {
  if (smileyType === 'emojis') {
    if (position <= 0.2) return '😢';
    if (position <= 0.4) return '😟';
    if (position <= 0.6) return '😐';
    if (position <= 0.8) return '😊';
    return '😄';
  }
  
  if (smileyType === 'simple') {
    if (position <= 0.2) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
          <path d="M8 16s1.5-2 4-2 4 2 4 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    }
    if (position <= 0.4) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
          <path d="M10 16h4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    }
    if (position <= 0.6) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
          <path d="M9 16h6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    }
    if (position <= 0.8) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    }
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
        <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
        <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
        <path d="M8 14s1.5 2.5 4 2.5 4-2.5 4-2.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </svg>
    );
  }
  
  if (smileyType === 'subtle') {
    if (position <= 0.2) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 15s1.5-2 4-2 4 2 4 2"/>
          <path d="M9 9h.01"/>
          <path d="M15 9h.01"/>
        </svg>
      );
    }
    if (position <= 0.4) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 15h8"/>
          <path d="M9 9h.01"/>
          <path d="M15 9h.01"/>
        </svg>
      );
    }
    if (position <= 0.6) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9 9h.01"/>
          <path d="M15 9h.01"/>
        </svg>
      );
    }
    if (position <= 0.8) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 13s1.5 2 4 2 4-2 4-2"/>
          <path d="M9 9h.01"/>
          <path d="M15 9h.01"/>
        </svg>
      );
    }
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 3 4 3 4-3 4-3"/>
        <path d="M9 9h.01"/>
        <path d="M15 9h.01"/>
      </svg>
    );
  }

  // Fallback to emojis
  if (position <= 0.2) return '😢';
  if (position <= 0.4) return '😟';
  if (position <= 0.6) return '😐';
  if (position <= 0.8) return '😊';
  return '😄';
};