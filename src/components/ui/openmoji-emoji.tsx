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

export const OpenMojiEmoji = memo<OpenMojiEmojiProps>(({ 
  unicode, 
  size = 24, 
  alt,
  fallback = true,
  ...boxProps 
}) => {
  const filename = unicodeToFilename(unicode);
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
        style={{ 
          width: size,
          height: size,
          objectFit: 'contain'
        }}
        onError={(e) => {
          if (fallback) {
            // If SVG fails to load, show unicode fallback
            const target = e.target as HTMLImageElement;
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
