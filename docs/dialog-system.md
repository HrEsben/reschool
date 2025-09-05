# Dialog Manager System

A comprehensive, reusable dialog system for consistent UI across the application.

## Overview

The Dialog Manager provides a unified way to create dialogs with consistent styling, behavior, and user experience. All dialogs share the same visual design, positioning, and interaction patterns.

## Core Components

### DialogManager
The main component that handles all dialog functionality.

```tsx
import { DialogManager } from '@/components/ui/dialog-manager';

<DialogManager
  trigger={<Button>Open Dialog</Button>}
  title="Dialog Title"
  type="warning"
  primaryAction={{
    label: "Confirm",
    onClick: handleConfirm,
    colorScheme: "red"
  }}
  secondaryAction={{
    label: "Cancel",
    onClick: handleCancel,
    variant: "outline"
  }}
>
  <Text>Dialog content goes here</Text>
</DialogManager>
```

### Convenience Components
Pre-configured components for common dialog types:

- `WarningDialog` - Orange theme for warnings
- `ErrorDialog` - Red theme for errors/destructive actions
- `SuccessDialog` - Green theme for success messages
- `InfoDialog` - Blue theme for information

## Props Reference

### DialogManager Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `trigger` | `ReactNode` | - | Element that opens the dialog |
| `title` | `string` | - | Dialog title text |
| `children` | `ReactNode` | - | Dialog content/body |
| `type` | `'default' \| 'warning' \| 'error' \| 'success' \| 'info'` | `'default'` | Dialog type affecting colors |
| `primaryAction` | `DialogAction` | - | Main action button |
| `secondaryAction` | `DialogAction` | - | Secondary action (usually cancel) |
| `customActions` | `DialogAction[]` | `[]` | Additional action buttons |
| `maxWidth` | `string` | `'md'` | Maximum dialog width |
| `showCloseButton` | `boolean` | `true` | Show X close button |
| `icon` | `string` | - | Icon for dialog header |
| `isOpen` | `boolean` | - | Controlled open state |
| `onOpenChange` | `(open: boolean) => void` | - | Open state change callback |

### DialogAction Interface

```tsx
interface DialogAction {
  label: string;
  onClick: () => void;
  variant?: 'solid' | 'outline' | 'ghost';
  colorScheme?: string;
  isLoading?: boolean;
  loadingText?: string;
  isDisabled?: boolean;
}
```

## Dialog Types & Styling

Each dialog type has its own color scheme:

- **default**: Gray theme
- **warning**: Orange theme with warning styles
- **error**: Red theme for destructive actions
- **success**: Green theme for positive feedback
- **info**: Blue theme for informational content

## Usage Examples

### Delete Confirmation Dialog

```tsx
import { ErrorDialog } from '@/components/ui/dialog-manager';

<ErrorDialog
  trigger={<Button colorScheme="red">Delete</Button>}
  title="Delete Item"
  icon="⚠️"
  primaryAction={{
    label: "Delete",
    onClick: handleDelete,
    colorScheme: "red",
    isLoading: isDeleting
  }}
  secondaryAction={{
    label: "Cancel",
    onClick: () => {},
    variant: "outline"
  }}
>
  <Text>Are you sure you want to delete this item?</Text>
</ErrorDialog>
```

### Success Notification

```tsx
import { SuccessDialog } from '@/components/ui/dialog-manager';

<SuccessDialog
  trigger={<Button>Show Success</Button>}
  title="Success!"
  icon="✅"
  primaryAction={{
    label: "OK",
    onClick: handleClose,
    colorScheme: "green"
  }}
>
  <Text>Operation completed successfully!</Text>
</SuccessDialog>
```

### Info Dialog with Custom Actions

```tsx
import { InfoDialog } from '@/components/ui/dialog-manager';

<InfoDialog
  trigger={<Button>More Info</Button>}
  title="Information"
  icon="ℹ️"
  customActions={[
    {
      label: "Learn More",
      onClick: openDocumentation,
      variant: "outline",
      colorScheme: "blue"
    },
    {
      label: "Got it",
      onClick: handleClose,
      colorScheme: "blue"
    }
  ]}
>
  <Text>Here's some important information...</Text>
</InfoDialog>
```

## Consistency Features

### Visual Design
- Consistent border radius, shadows, and spacing
- Type-based color schemes
- Professional header/body/footer layout
- Responsive design (90vw width on mobile)

### Behavior
- Center-screen positioning
- Backdrop overlay
- Keyboard navigation support
- Auto-close on action completion
- Loading states for async operations

### Accessibility
- Proper ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

## Migration Guide

### Before (Custom Dialog)
```tsx
<DialogRoot>
  <DialogTrigger>...</DialogTrigger>
  <DialogBackdrop />
  <DialogContent>
    <DialogHeader>...</DialogHeader>
    <DialogBody>...</DialogBody>
    <DialogFooter>...</DialogFooter>
  </DialogContent>
</DialogRoot>
```

### After (Dialog Manager)
```tsx
<DialogManager
  trigger={...}
  title="..."
  primaryAction={{...}}
  secondaryAction={{...}}
>
  ...content...
</DialogManager>
```

## Best Practices

1. **Use type-specific dialogs** for common patterns (WarningDialog, ErrorDialog, etc.)
2. **Keep titles concise** and action-oriented
3. **Use appropriate icons** that match the dialog type
4. **Provide clear action labels** (avoid generic "OK"/"Cancel" when possible)
5. **Handle loading states** for async operations
6. **Group related actions** using customActions when needed
7. **Test keyboard navigation** for accessibility

## Future Enhancements

- Form integration helpers
- Animation customization options
- Size variants (xs, sm, md, lg, xl)
- Toast notification integration
- Confirmation prompt helpers
