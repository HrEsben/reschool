# OpenMoji Integration Guide

This project now supports the full OpenMoji emoji collection as SVG files, providing consistent and high-quality emoji rendering across all platforms.

## What's Implemented

### OpenMoji Component
- **File**: `src/components/ui/openmoji-emoji.tsx`
- **Purpose**: Renders OpenMoji SVG emojis with fallback to Unicode
- **Features**:
  - Automatic filename conversion from Unicode to OpenMoji format
  - Configurable size (supports responsive values)
  - Fallback to Unicode emoji if SVG fails to load
  - Optimized with Next.js Image component

### Updated Components
The following components now use OpenMoji SVGs instead of system emojis:

1. **Smiley Selection Dialog** (`smiley-selection-dialog.tsx`)
   - Grid of OpenMoji emojis for selection
   - Selected emoji preview

2. **Dagens Smiley Card** (`dagens-smiley-card.tsx`)
   - Today's smiley display (large)
   - Latest entry display (medium)

3. **Smiley Timeline** (`smiley-timeline.tsx`)
   - Timeline entries with consistent OpenMoji rendering
   - Responsive sizing (28px mobile, 36px desktop)

## File Structure

```
public/
  emojis/                    # OpenMoji SVG files
    1F600.svg               # 😀 Grinning Face
    1F60A.svg               # 😊 Smiling Face with Smiling Eyes
    1F62D.svg               # 😭 Loudly Crying Face
    ...                     # All other OpenMoji files
```

## Naming Convention

OpenMoji files follow Unicode codepoint naming:
- **Format**: `{CODEPOINT}.svg` (e.g., `1F600.svg`)
- **Multi-codepoint**: `{CODEPOINT1}-{CODEPOINT2}.svg` (e.g., `1F468-200D-1F373.svg` for 👨‍🍳)

## Usage Examples

### Basic Usage
```tsx
import { OpenMojiEmoji } from '@/components/ui/openmoji-emoji';

// Simple emoji
<OpenMojiEmoji unicode="😊" size={24} />

// With custom styling
<OpenMojiEmoji 
  unicode="🥰" 
  size={48}
  alt="Smiling face with hearts"
/>

// Responsive sizing with useBreakpointValue
const emojiSize = useBreakpointValue({ base: 24, md: 32 }) || 24;
<OpenMojiEmoji unicode="😎" size={emojiSize} />
```

### Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `unicode` | `string` | - | The Unicode emoji character |
| `size` | `number \| string` | `24` | Size in pixels or CSS value |
| `alt` | `string` | `unicode` | Alt text for accessibility |
| `fallback` | `boolean` | `true` | Show Unicode fallback if SVG fails |
| `...boxProps` | `BoxProps` | - | Additional Chakra UI Box props |

## Benefits

### Visual Consistency
- ✅ Identical rendering across all browsers and operating systems
- ✅ Consistent style matching OpenMoji design language
- ✅ High-quality vector graphics that scale perfectly

### Performance
- ✅ Optimized with Next.js Image component
- ✅ Proper caching and loading
- ✅ Fallback handling for missing emojis

### Accessibility
- ✅ Proper alt text support
- ✅ Screen reader compatibility
- ✅ Keyboard navigation support

## File Management

### Adding New Emojis
1. Download SVG from [OpenMoji](https://openmoji.org/)
2. Name using Unicode codepoint format
3. Place in `public/emojis/` directory

### Checking Emoji Availability
```bash
# Check if specific emoji file exists
ls public/emojis/1F60A.svg

# Count total emoji files
ls public/emojis/*.svg | wc -l
```

### Unicode to Filename Conversion
```javascript
// Convert emoji to filename
function unicodeToFilename(unicode) {
  return unicode
    .split('')
    .map(char => {
      const codePoint = char.codePointAt(0);
      return codePoint ? codePoint.toString(16).toUpperCase() : '';
    })
    .filter(code => code !== '')
    .join('-') + '.svg';
}

// Example
unicodeToFilename('😊'); // Returns: "1F60A.svg"
```

## Technical Details

### Component Architecture
- **Base Component**: Uses Chakra UI `Box` for layout
- **Image Handling**: Next.js `Image` component with error handling
- **Fallback Strategy**: Displays Unicode emoji if SVG fails to load
- **Type Safety**: Full TypeScript support with proper prop types

### Error Handling
- SVG loading failures automatically fall back to Unicode
- Missing files gracefully degrade to system emojis
- Console warnings for debugging missing emoji files

### Performance Considerations
- Images are optimized by Next.js
- Proper caching headers for static assets
- Lazy loading for off-screen emojis
- Minimal bundle size impact

## Migration Notes

### From System Emojis
All existing emoji usage has been automatically migrated:
- `<Text fontSize="2xl">{emoji}</Text>` → `<OpenMojiEmoji unicode={emoji} size={32} />`
- Responsive sizing handled with `useBreakpointValue`
- No breaking changes to existing functionality

### Backward Compatibility
- Original Unicode strings still work as input
- Fallback ensures no broken emoji displays
- Gradual migration possible (component by component)

## Troubleshooting

### Common Issues

**Emoji not displaying:**
1. Check if SVG file exists in `public/emojis/`
2. Verify Unicode to filename conversion
3. Check browser console for loading errors

**Size issues:**
- Use number values for pixel sizes
- Use `useBreakpointValue` for responsive sizing
- Avoid passing responsive objects directly to `size` prop

**Performance concerns:**
- Ensure proper caching headers for `/emojis/` directory
- Consider lazy loading for large emoji lists
- Monitor bundle size if adding many emoji files

### Debug Tools
```javascript

// Test emoji file existence
fetch('/emojis/1F60A.svg').then(r => console.log(r.ok));
```
