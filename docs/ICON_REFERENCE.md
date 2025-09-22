# Quick Icon Reference

This is a quick reference for developers working with ReSchool's icon system.

## Tool Icons (Use these for consistency)

```typescript
import { Icons } from '@/components/ui/icons';

// Tool-specific icons
<Icons.Barometer />     // Thermometer icon for barometer tools
<Icons.Smiley />        // Smile icon for dagens-smiley tools  
<Icons.Bedtime />       // Bed icon for sengetider tools
<Icons.Steps />         // Stairs icon for indsatstrappe tools
```

## Common UI Icons

```typescript
// Actions
<Icons.Edit />          // Edit/modify content
<Icons.Save />          // Save changes
<Icons.Add />           // Add new item
<Icons.Close />         // Close/cancel
<Icons.Settings />      // Settings/configuration

// Status & Feedback
<Icons.Check />         // Success/completed
<Icons.Warning />       // Warning state
<Icons.Error />         // Error state
<Icons.Info />          // Information

// Navigation
<Icons.Menu />          // Hamburger menu
<Icons.DragHandle />    // Drag and drop handle
<Icons.Eye />           // View/visibility

// Content
<Icons.Star />          // Ratings/favorites
<Icons.User />          // User profile
<Icons.Trash />         // Delete action
```

## Usage Patterns

### In Components
```typescript
// Basic usage
<Icons.Barometer size="sm" />

// With styling
<Icons.Smiley size="md" color="sage.600" />

// In buttons
<IconButton aria-label="Edit">
  <Icons.Edit />
</IconButton>
```

### Tool Type Mapping
```typescript
const getToolIcon = (toolType: string) => {
  switch (toolType) {
    case 'barometer': return <Icons.Barometer />;
    case 'dagens-smiley': return <Icons.Smiley />;
    case 'sengetider': return <Icons.Bedtime />;
    case 'indsatstrappe': return <Icons.Steps />;
    default: return <Icons.Edit />;
  }
};
```

## Sizes
- `xs`: 12px
- `sm`: 16px  
- `md`: 20px (default)
- `lg`: 24px
- `xl`: 32px

## Quick Checklist
- [ ] Using consistent tool icons across all interfaces?
- [ ] Applied appropriate size for context?
- [ ] Added aria-label for standalone icons?
- [ ] Using Icons from centralized system?