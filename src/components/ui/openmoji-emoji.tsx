"use client";

import { memo } from 'react';
import Image from 'next/image';
import { Box, BoxProps } from '@chakra-ui/react';

interface OpenMojiEmojiProps extends Omit<BoxProps, 'children'> {
  unicode: string;
  size?: number | string;
  alt?: string;
  fallback?: boolean; // Whether to show unicode fallback if SVG fails
}

// Convert Unicode emoji to OpenMoji filename
// OpenMoji files are named with the codepoint (e.g., "1F600.svg" for 😀)
function unicodeToFilename(unicode: string): string {
  const codePoints: string[] = [];
  for (let i = 0; i < unicode.length; i++) {
    const codePoint = unicode.codePointAt(i);
    if (codePoint) {
      codePoints.push(codePoint.toString(16).toUpperCase());
      // Skip next character if it's a surrogate pair
      if (codePoint > 0xFFFF) {
        i++;
      }
    }
  }
  return codePoints.join('-') + '.svg';
}

// Helper function to get fallback filename without variation selector (FE0F)
function getFallbackFilename(unicode: string): string | null {
  const codePoints: string[] = [];
  for (let i = 0; i < unicode.length; i++) {
    const codePoint = unicode.codePointAt(i);
    if (codePoint) {
      // Skip variation selectors (FE0F, FE0E, etc.)
      if (codePoint !== 0xFE0F && codePoint !== 0xFE0E) {
        codePoints.push(codePoint.toString(16).toUpperCase());
      }
      // Skip next character if it's a surrogate pair
      if (codePoint > 0xFFFF) {
        i++;
      }
    }
  }
  // Only return fallback if we actually removed a variation selector
  if (codePoints.length < unicode.split('').filter(char => char.codePointAt(0)! > 0xFFFF ? 2 : 1).length) {
    return codePoints.join('-') + '.svg';
  }
  return null;
}

export const OpenMojiEmoji = memo<OpenMojiEmojiProps>(({ 
  unicode, 
  size = 24, 
  alt,
  fallback = true,
  ...boxProps 
}) => {
  const filename = unicodeToFilename(unicode);
  const fallbackFilename = getFallbackFilename(unicode);
  const src = `/emojis/${filename}`;
  
  return (
    <Box 
      display="inline-flex" 
      alignItems="center" 
      justifyContent="center"
      {...boxProps}
    >
      <Image
        src={src}
        alt={alt || unicode}
        width={typeof size === 'number' ? size : 24}
        height={typeof size === 'number' ? size : 24}
        loading="lazy"
        placeholder="empty"
        priority={false}
        style={{ 
          width: size,
          height: size,
          objectFit: 'contain'
        }}
        onError={(e) => {
          if (fallback) {
            const target = e.target as HTMLImageElement;
            
            // First, try fallback filename without variation selector
            if (fallbackFilename && target.src.includes(filename)) {
              target.src = `/emojis/${fallbackFilename}`;
              return;
            }
            
            // If both SVG attempts fail, show unicode fallback
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = unicode;
              parent.style.fontSize = typeof size === 'number' ? `${size}px` : size;
            }
          }
        }}
      />
    </Box>
  );
});

OpenMojiEmoji.displayName = 'OpenMojiEmoji';
