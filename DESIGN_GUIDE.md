# ReSchool Design Guide

This document outlines the design system, conventions, and guidelines for consistent development across the ReSchool application.

## Table of Contents

- [Color Palette](#color-palette)
- [Icons System](#icons-system)
- [Typography](#typography)
- [Component Guidelines](#component-guidelines)
- [Tool-Specific Design](#tool-specific-design)
- [Layout Patterns](#layout-patterns)
- [Accessibility](#accessibility)

## Color Palette

ReSchool uses a custom color palette based on natural, calming tones that work well in educational environments.

### Primary Colors

```typescript
// Color tokens defined in Chakra UI theme
const colors = {
  sage: {
    25: '#f6f8f6',
    50: '#e8f0e8',
    100: '#d1e2d1',
    200: '#a3c5a3',
    300: '#75a875',
    400: '#478b47',
    500: '#196e19',
    600: '#145814',
    700: '#0f420f',
    800: '#0a2c0a',
    900: '#051605'
  },
  navy: {
    25: '#f5f7fa',
    50: '#e6ecf5',
    100: '#ccd9eb',
    200: '#99b3d7',
    300: '#668dc3',
    400: '#3367af',
    500: '#00419b',
    600: '#00347c',
    700: '#00275d',
    800: '#001a3e',
    900: '#000d1f'
  },
  golden: {
    25: '#fefdf9',
    50: '#fdf8e8',
    100: '#fbf1d1',
    200: '#f7e3a3',
    300: '#f3d575',
    400: '#efc747',
    500: '#ebb919',
    600: '#bc9414',
    700: '#8d6f0f',
    800: '#5e4a0a',
    900: '#2f2505'
  },
  coral: {
    25: '#fef9f8',
    50: '#fdeae6',
    100: '#fbd5cc',
    200: '#f7ab99',
    300: '#f38166',
    400: '#ef5733',
    500: '#eb2d00',
    600: '#bc2400',
    700: '#8d1b00',
    800: '#5e1200',
    900: '#2f0900'
  },
  cream: {
    25: '#fefefe',
    50: '#fdfcfa',
    100: '#faf8f5',
    200: '#f5f1eb',
    300: '#f0eae1',
    400: '#ebe3d7',
    500: '#e6dccd',
    600: '#b8b0a4',
    700: '#8a847b',
    800: '#5c5852',
    900: '#2e2c29'
  }
};
```

### Usage Guidelines

- **Navy**: Primary actions, headers, important text
- **Sage**: Success states, positive feedback, nature-related tools
- **Golden**: Warnings, highlights, bedtime/routine tools
- **Coral**: Errors, urgent actions, alerts
- **Cream**: Backgrounds, subtle borders, neutral elements

## Icons System

### Tool Icons

ReSchool uses consistent icons across all interfaces. All tool icons are sourced from **Lucide React** and **React Icons** for consistency.

```typescript
// Tool-specific icons (matching anchor navigation)
const toolIcons = {
  'barometer': <Thermometer />,      // Lucide React
  'dagens-smiley': <Smile />,        // Lucide React  
  'sengetider': <Bed />,             // Lucide React
  'indsatstrappe': <FaStairs />      // React Icons (fa6)
};
```

### System Icons

```typescript
// Common UI icons
const systemIcons = {
  // Actions
  edit: <MdEdit />,           // Material Design
  save: <MdSave />,
  close: <MdClose />,
  add: <MdAdd />,
  settings: <MdSettings />,
  
  // Status
  check: <MdCheck />,
  warning: <MdWarning />,
  error: <MdError />,
  info: <MdInfo />,
  
  // Navigation
  menu: <MenuIcon />,         // Custom SVG
  dragHandle: <DragHandleIcon />, // Custom SVG
  
  // Content
  star: <MdStar />,
  eye: <EyeIcon />,           // Custom SVG
  user: <UserIcon />          // Custom SVG
};
```

### Icon Usage Rules

1. **Consistency**: Always use the same icon for the same concept across the app
2. **Size**: Use the standardized size system (xs: 12px, sm: 16px, md: 20px, lg: 24px, xl: 32px)
3. **Color**: Icons inherit text color unless specifically overridden
4. **Accessibility**: Always provide `aria-label` or `title` for standalone icons

### Adding New Icons

1. **Tool Icons**: Add to `@/components/ui/icons.tsx` following the naming pattern `{ToolName}Icon`
2. **Import Source**: Prefer Lucide React > Material Design > Custom SVG
3. **Export**: Add to the `Icons` object for centralized access
4. **Update Guide**: Document the new icon in this guide

## Typography

### Font Hierarchy

```typescript
// Chakra UI text styles
const textStyles = {
  // Headings
  h1: { fontSize: '2xl', fontWeight: 'bold', lineHeight: 'shorter' },
  h2: { fontSize: 'xl', fontWeight: 'semibold', lineHeight: 'short' },
  h3: { fontSize: 'lg', fontWeight: 'medium', lineHeight: 'short' },
  
  // Body text
  body: { fontSize: 'md', lineHeight: 'base' },
  bodySmall: { fontSize: 'sm', lineHeight: 'base' },
  caption: { fontSize: 'xs', lineHeight: 'short' },
  
  // UI elements
  button: { fontSize: 'sm', fontWeight: 'medium' },
  label: { fontSize: 'sm', fontWeight: 'medium' },
  badge: { fontSize: 'xs', fontWeight: 'medium' }
};
```

### Usage Guidelines

- **Headers**: Use semantic heading levels (h1, h2, h3)
- **Body Text**: Default to `md` size for readability
- **UI Text**: Use `sm` for most interface elements
- **Captions**: Use `xs` for secondary information only

## Component Guidelines

### Buttons

```typescript
// Button variants and usage
const buttonStyles = {
  // Primary actions
  solid: { 
    colorPalette: 'navy',     // Main actions
    usage: 'Save, Submit, Primary CTA'
  },
  
  // Secondary actions  
  outline: {
    colorPalette: 'sage',     // Secondary actions
    usage: 'Cancel, Alternative actions'
  },
  
  // Tertiary actions
  ghost: {
    colorPalette: 'gray',     // Minimal actions
    usage: 'Navigation, Menu items'
  }
};
```

### Cards

```typescript
// Card styling patterns
const cardStyles = {
  default: {
    bg: 'white',
    border: '1px solid',
    borderColor: 'cream.200',
    borderRadius: 'md',
    p: 4
  },
  
  elevated: {
    bg: 'white',
    boxShadow: 'sm',
    borderRadius: 'lg',
    p: 6
  },
  
  colored: {
    // Use tool color as background
    bg: '{toolColor}.25',
    border: '1px solid',
    borderColor: '{toolColor}.200'
  }
};
```

### Forms

```typescript
// Form field patterns
const formStyles = {
  field: {
    label: { fontSize: 'sm', fontWeight: 'medium', color: 'navy.700' },
    input: { borderColor: 'cream.300', _focus: { borderColor: 'navy.500' } },
    error: { fontSize: 'xs', color: 'coral.600' },
    helper: { fontSize: 'xs', color: 'gray.500' }
  }
};
```

## Tool-Specific Design

### Tool Color Mapping

```typescript
const toolColors = {
  'barometer': 'navy',        // Temperature/measurement theme
  'dagens-smiley': 'sage',    // Positive/growth theme
  'sengetider': 'golden',     // Routine/time theme
  'indsatstrappe': 'coral'    // Action/intervention theme
};
```

### Tool Icon Guidelines

1. **Barometer** (`<Thermometer />`): Used for rating scales, measurements
2. **Dagens Smiley** (`<Smile />`): Used for mood tracking, daily check-ins
3. **Sengetider** (`<Bed />`): Used for bedtime routines, sleep tracking
4. **Indsatstrappe** (`<FaStairs />`): Used for step-by-step interventions

### Consistent Implementation

When implementing tool-related features:

1. **Use the same icon** across all interfaces (forms, lists, navigation, progress views)
2. **Apply consistent colors** using the tool color mapping
3. **Maintain visual hierarchy** with appropriate sizes and spacing
4. **Ensure accessibility** with proper labels and contrast

## Layout Patterns

### Grid System

```typescript
// Common layout patterns
const layouts = {
  // Page layouts
  singleColumn: { maxW: '2xl', mx: 'auto', px: 4 },
  twoColumn: { display: 'grid', gridTemplateColumns: '1fr 300px', gap: 6 },
  threeColumn: { display: 'grid', gridTemplateColumns: '200px 1fr 300px', gap: 6 },
  
  // Content layouts
  card: { p: 6, gap: 4 },
  form: { gap: 4, maxW: 'md' },
  list: { gap: 2 }
};
```

### Responsive Breakpoints

```typescript
// Chakra UI breakpoints
const breakpoints = {
  base: '0px',      // Mobile first
  sm: '480px',      // Large mobile
  md: '768px',      // Tablet
  lg: '992px',      // Desktop
  xl: '1280px',     // Large desktop
  '2xl': '1536px'   // Extra large
};
```

### Spacing System

```typescript
// Consistent spacing scale
const spacing = {
  xs: 1,    // 4px
  sm: 2,    // 8px  
  md: 4,    // 16px
  lg: 6,    // 24px
  xl: 8,    // 32px
  '2xl': 12 // 48px
};
```

## Accessibility

### ARIA Labels

```typescript
// Required ARIA patterns
const ariaPatterns = {
  buttons: 'aria-label or descriptive text content',
  icons: 'aria-label when standalone, aria-hidden when decorative',
  forms: 'aria-describedby for help text, aria-invalid for errors',
  navigation: 'aria-current for active states'
};
```

### Color Contrast

- **Text on background**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 contrast ratio  
- **Interactive elements**: Ensure focus states are clearly visible
- **Error states**: Use color + icon + text for clarity

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Focus indicators must be clearly visible
- Logical tab order throughout the interface
- Escape key closes modals and dropdowns

## Development Guidelines

### File Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   │   ├── icons.tsx # Centralized icon system
│   │   └── ...
│   └── [feature]/    # Feature-specific components
├── styles/           # Theme and global styles
└── lib/             # Utilities and helpers
```

### Component Naming

- **UI Components**: PascalCase, descriptive (`ToolsAnchorNav`, `ProgressTimeline`)
- **Icon Components**: PascalCase with "Icon" suffix (`BarometerIcon`, `SmileyIcon`)
- **Props interfaces**: Component name + "Props" (`ToolsAnchorNavProps`)

### Code Conventions

1. **Import Order**: React → Chakra UI → Local components → Utils
2. **Props Destructuring**: Destructure props in function signature
3. **Type Safety**: Use TypeScript interfaces for all props
4. **Accessibility**: Include ARIA attributes where needed

### Testing Checklist

- [ ] Component renders correctly across breakpoints
- [ ] Colors match the design system
- [ ] Icons are consistent with the tool mapping
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility
- [ ] Focus states are visible
- [ ] Error states are clear

---

## Updating This Guide

This design guide should be updated whenever:

- New tools are added to the system
- Color palette changes are made
- New icon patterns are established
- Component patterns evolve
- Accessibility requirements change

**Last Updated**: September 22, 2025
**Version**: 1.0.0