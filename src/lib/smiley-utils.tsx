import React from 'react';

export interface SmileyConfig {
  displayType: string;
  smileyType?: string;
  scaleMin?: number;
  scaleMax?: number;
}

export type SmileyResult = string | React.ReactNode;

/**
 * Centralized utility for consistent smiley/emoji display across all components
 * This ensures that barometer values are displayed the same way everywhere
 */
export function getSmileyForRating(
  rating: number, 
  config: SmileyConfig,
  size: number = 24
): SmileyResult {
  const { displayType, smileyType = 'emojis', scaleMin = 1, scaleMax = 5 } = config;

  // Handle percentage display
  if (displayType === 'percentage') {
    const percentage = Math.round(((rating - scaleMin) / (scaleMax - scaleMin)) * 100);
    return `${percentage}%`;
  }

  // Handle number display
  if (displayType === 'numbers') {
    return rating.toString();
  }

  // Handle smiley display
  if (displayType === 'smileys') {
    const range = scaleMax - scaleMin;
    const position = (rating - scaleMin) / range;
    
    return getSmileyByTypeAndPosition(smileyType, position, size);
  }

  // Fallback to number
  return rating.toString();
}

/**
 * Get smiley/emoji based on type and position (0-1 range)
 */
export function getSmileyByTypeAndPosition(
  smileyType: string,
  position: number,
  size: number = 24
): SmileyResult {
  if (smileyType === 'emojis') {
    // Traditional emojis for younger children
    if (position <= 0.2) return '😢';
    if (position <= 0.4) return '😟';
    if (position <= 0.6) return '😐';
    if (position <= 0.8) return '😊';
    return '😄';
  }

  if (smileyType === 'simple') {
    // Clean, simple SVG icons for older children - consistent with barometer card
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
          <path d="M8 15.5s1.5-1 4-1 4 1 4 1" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
        </svg>
      );
    }
    if (position <= 0.6) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
          <line x1="8" y1="15" x2="16" y2="15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      );
    }
    if (position <= 0.8) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
          <circle cx="8" cy="10" r="1.5" fill="currentColor"/>
          <circle cx="16" cy="10" r="1.5" fill="currentColor"/>
          <path d="M8 14s1.5 1.5 4 1.5 4-1.5 4-1.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
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
    // More mature/professional looking for teens - consistent with barometer card
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
          <path d="M8 14.5s1.5-1 4-1 4 1 4 1"/>
          <path d="M9 9h.01"/>
          <path d="M15 9h.01"/>
        </svg>
      );
    }
    if (position <= 0.6) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14h8"/>
          <path d="M9 9h.01"/>
          <path d="M15 9h.01"/>
        </svg>
      );
    }
    if (position <= 0.8) {
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 1 4 1 4-1 4-1"/>
          <path d="M9 9h.01"/>
          <path d="M15 9h.01"/>
        </svg>
      );
    }
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
        <path d="M9 9h.01"/>
        <path d="M15 9h.01"/>
      </svg>
    );
  }

  // Fallback to emoji
  if (position <= 0.2) return '😢';
  if (position <= 0.4) return '😟';
  if (position <= 0.6) return '😐';
  if (position <= 0.8) return '😊';
  return '😄';
}

/**
 * Get the emoji string for a given rating and configuration (used for string-only contexts)
 */
export function getSmileyEmojiString(
  rating: number,
  config: SmileyConfig
): string {
  const { displayType, smileyType = 'emojis', scaleMin = 1, scaleMax = 5 } = config;

  // Handle percentage display
  if (displayType === 'percentage') {
    const percentage = Math.round(((rating - scaleMin) / (scaleMax - scaleMin)) * 100);
    return `${percentage}%`;
  }

  // Handle number display
  if (displayType === 'numbers') {
    return rating.toString();
  }

  // Handle smiley display - return emoji strings only
  if (displayType === 'smileys') {
    const range = scaleMax - scaleMin;
    const position = (rating - scaleMin) / range;
    
    if (smileyType === 'emojis') {
      // Traditional emojis for younger children
      if (position <= 0.2) return '😢';
      if (position <= 0.4) return '😟';
      if (position <= 0.6) return '😐';
      if (position <= 0.8) return '😊';
      return '😄';
    }

    if (smileyType === 'simple') {
      // Use emoji equivalents for simple type in string contexts
      if (position <= 0.2) return '☹️';
      if (position <= 0.4) return '😕';
      if (position <= 0.6) return '😐';
      if (position <= 0.8) return '🙂';
      return '😊';
    }

    if (smileyType === 'subtle') {
      // Use emoji equivalents for subtle type in string contexts
      if (position <= 0.2) return '😞';
      if (position <= 0.4) return '😐';
      if (position <= 0.6) return '😌';
      if (position <= 0.8) return '😊';
      return '😁';
    }

    // Fallback to emoji
    if (position <= 0.2) return '😢';
    if (position <= 0.4) return '😟';
    if (position <= 0.6) return '😐';
    if (position <= 0.8) return '😊';
    return '😄';
  }

  // Fallback to number
  return rating.toString();
}