# OpenMoji SVG Setup

This project uses OpenMoji SVG files for consistent emoji display across all devices and browsers.

## Adding OpenMoji SVG Files

1. **Download OpenMoji SVGs**: Download the complete OpenMoji SVG collection from https://openmoji.org/library/

2. **Place SVG files**: Copy all SVG files to the `/public/emojis/` directory in your project.

3. **File naming**: OpenMoji SVG files should be named using Unicode codepoints (e.g., `1F600.svg` for 😀).

   Example file structure:
   ```
   public/
   └── emojis/
       ├── 1F600.svg  (😀 Grinning Face)
       ├── 1F601.svg  (😁 Beaming Face)
       ├── 1F602.svg  (😂 Face with Tears of Joy)
       └── ...
   ```

## How It Works

The `OpenMojiEmoji` component automatically:
- Converts Unicode emoji strings to SVG filenames
- Loads the corresponding SVG from `/public/emojis/`
- Falls back to Unicode emoji if SVG fails to load
- Provides consistent sizing and styling

## Usage

```tsx
import { OpenMojiEmoji } from '@/components/ui/openmoji-emoji';

// Basic usage
<OpenMojiEmoji unicode="😀" size={24} />

// With custom size and styling
<OpenMojiEmoji 
  unicode="😊" 
  size={48}
  bg="gray.100"
  borderRadius="md"
  p={2}
/>
```

## Benefits

- **Consistent appearance** across all devices and browsers
- **High quality** SVG graphics that scale perfectly
- **Fallback support** to Unicode emoji if SVG fails
- **Performance optimized** with Next.js Image component
- **Accessible** with proper alt text support

## File Format

OpenMoji SVG files should follow the standard naming convention:
- Unicode codepoint in uppercase hexadecimal
- Padded to 4 digits minimum
- Multiple codepoints joined with hyphens
- `.svg` extension

Examples:
- `1F600.svg` for single codepoint emoji
- `1F468-200D-1F469-200D-1F467.svg` for multi-codepoint emoji sequences
