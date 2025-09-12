# Tool Development Guide

This guide outlines the standards and conventions for creating new tools in the ReSchool application to ensure consistency and maintainability.

## Overview

Tools in ReSchool are modular components that provide specific functionality for tracking and analyzing child development data. Examples include barometers for rating-based tracking and "Dagens Smiley" for daily emotional check-ins.

## Project Structure

### File Organization
```
src/
├── components/
│   ├── [tool-name]/
│   │   ├── [tool-name]-card.tsx         # Main card component
│   │   ├── [tool-name]-manager.tsx      # Management/CRUD operations
│   │   ├── [tool-name]-timeline.tsx     # Timeline display component
│   │   └── create-[tool-name]-dialog.tsx # Creation dialog
│   └── tools/
│       └── tools-manager.tsx            # Integration point
├── app/api/
│   └── [tool-name]/
│       ├── route.ts                     # CRUD API endpoints
│       └── [id]/
└── lib/
    ├── database-service.ts              # Database operations
    └── queries.ts                       # React Query hooks
```

## Design Standards

### Color Palette
The application uses a consistent color scheme based on natural, calming tones:

```typescript
// Primary colors
sage: {
  25: '#f6f8f6',
  50: '#eef2ef', 
  100: '#d5e0d6',
  200: '#abc0ad',
  300: '#81a084',
  400: '#5f7d61',
  500: '#486249',    // Primary sage
  600: '#3a4f3b',
  700: '#2d3d2e',
  800: '#1f2a20',
  900: '#121712'
}

cream: {
  25: '#fdfcfa',
  50: '#f9f6f0',
  100: '#f2ebd9',
  200: '#e6d4b1',
  300: '#d9bc88',
  400: '#cca55f',
  500: '#bf8e36',    // Primary cream/gold
  600: '#9c722b',
  700: '#785620',
  800: '#553b15',
  900: '#32200a'
}

navy: {
  25: '#f5f6f8',
  50: '#ebeef2',
  100: '#ced6e0',
  200: '#9bb0c4',
  300: '#688aa8',
  400: '#4a6d8c',
  500: '#3d5a75',    // Primary navy
  600: '#2f455a',
  700: '#21303f',
  800: '#131b24',
  900: '#050609'
}
```

### Component Design Patterns

#### 1. Card Components
Main display components that show tool data and provide interaction:

```tsx
// Standard card structure
<Box 
  bg="bg.surface" 
  borderRadius="xl" 
  border="1px solid" 
  borderColor="border.muted" 
  p={{ base: 4, md: 6 }}
>
  <VStack gap={4} align="stretch">
    {/* Header */}
    <Flex justify="space-between" align="center">
      <Heading size="lg" color="sage.600">{tool.topic}</Heading>
      {/* Actions */}
    </Flex>
    
    {/* Content */}
    {/* Timeline */}
  </VStack>
</Box>
```

#### 2. Timeline Components
Consistent timeline display for historical data:

```tsx
// Standard timeline entry structure
<Timeline.Title>
  <Flex align="center" gap={{ base: 2, md: 3 }} wrap={{ base: "wrap", sm: "nowrap" }}>
    {/* Primary data display (emoji, rating, etc.) */}
    <Flex align="center" gap={{ base: 1, md: 2 }}>
      {primaryDataElement}
      {primaryBadge && (
        <Badge
          colorPalette="sage"
          size={{ base: "xs", md: "sm" }}
          variant="subtle"
          borderRadius="full"
          px={{ base: 1, md: 2 }}
        >
          {primaryBadge}
        </Badge>
      )}
    </Flex>
    
    {/* User and relation info */}
    <HStack gap={{ base: 1, md: 2 }} align="center">
      <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium" color="gray.800">
        {recordedByName || 'Ukendt bruger'}
      </Text>
      {relationName && (
        <Badge
          size={{ base: "xs", md: "sm" }}
          colorPalette="navy"
          variant="subtle"
          borderRadius="full"
          px={{ base: 1, md: 2 }}
          flexShrink={0}
        >
          {relationName}
        </Badge>
      )}
    </HStack>
  </Flex>
</Timeline.Title>
```

#### 3. Badge Usage Standards

**Relation Badges** (navy):
```tsx
<Badge
  size={{ base: "xs", md: "sm" }}
  colorPalette="navy"
  variant="subtle"
  borderRadius="full"
  px={{ base: 1, md: 2 }}
  flexShrink={0}
>
  {relationName}
</Badge>
```

**Attribution Badges** (sage):
```tsx
<Badge
  colorPalette="sage"
  size={{ base: "xs", md: "sm" }}
  variant="subtle"
  borderRadius="full"
  px={{ base: 1, md: 2 }}
>
  Udfyldt af {childName}
</Badge>
```

**Status/Value Badges** (conditional colors):
```tsx
<Badge
  colorPalette={
    value >= threshold ? 'success' : 
    value >= midpoint ? 'warning' : 'coral'
  }
  size={{ base: "xs", md: "sm" }}
  borderRadius="full"
  px={{ base: 1, md: 2 }}
>
  {value}
</Badge>
```

## Dialog Patterns

### Creation/Edit Dialogs
Use the `DialogManager` component for consistent dialog behavior:

```tsx
<DialogManager
  trigger={triggerElement}
  title="Create New Tool"
  type="default"
  maxWidth="600px"
  primaryAction={{
    label: "Create",
    onClick: handleSubmit,
    colorScheme: "sage",
    isLoading: loading
  }}
  secondaryAction={{
    label: "Cancel",
    onClick: handleCancel
  }}
>
  {/* Dialog content */}
</DialogManager>
```

### Multi-step Dialogs
For complex creation flows, use the `Steps` component:

```tsx
<Steps.Root currentStep={currentStep} variant="solid" colorPalette="sage">
  <Steps.List>
    <Steps.Item index={0} title="Select" />
    <Steps.Item index={1} title="Configure" />
  </Steps.List>
</Steps.Root>
```

## Database Integration

### API Routes
Follow RESTful conventions:

```
GET    /api/[tool-name]           # List all
POST   /api/[tool-name]           # Create new
GET    /api/[tool-name]/[id]      # Get specific
PUT    /api/[tool-name]/[id]      # Update specific
DELETE /api/[tool-name]/[id]      # Delete specific
```

### Database Service Functions
Add functions to `database-service.ts`:

```typescript
// Create
export async function createToolEntry(data: ToolEntryData): Promise<ToolEntry> {
  // Implementation
}

// Read
export async function getToolEntries(toolId: string): Promise<ToolEntry[]> {
  // Implementation
}

// Update
export async function updateToolEntry(id: string, data: Partial<ToolEntryData>): Promise<ToolEntry> {
  // Implementation
}

// Delete
export async function deleteToolEntry(id: string): Promise<void> {
  // Implementation
}
```

### React Query Integration
Add hooks to `queries.ts`:

```typescript
export function useToolEntries(toolId: string) {
  return useQuery({
    queryKey: ['tool-entries', toolId],
    queryFn: () => getToolEntries(toolId),
    enabled: !!toolId
  });
}

export function useCreateToolEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createToolEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tool-entries'] });
    }
  });
}
```

## UI/UX Guidelines

### Responsive Design
- Use Chakra UI's responsive props: `{{ base: "value", md: "value" }}`
- Mobile-first approach
- Ensure touch targets are at least 44px on mobile

### Accessibility
- Include proper ARIA labels
- Ensure keyboard navigation works
- Use semantic HTML elements
- Provide alternative text for images/icons

### Error Handling
- Use `showToast` for user feedback
- Implement loading states
- Gracefully handle network errors
- Provide clear error messages

### Loading States
```tsx
// Use Skeleton for loading content
{isLoading ? (
  <Skeleton height="40px" />
) : (
  <ActualContent />
)}

// Use spinner for actions
<Button isLoading={isSubmitting} loadingText="Saving...">
  Save
</Button>
```

## Integration with Tools Manager

### Registration
Add your tool to `tools-manager.tsx`:

```tsx
// Import your components
import { YourToolCard } from '@/components/your-tool/your-tool-card';

// Add to the tools section
{yourToolData.length > 0 && (
  <Box>
    <VStack gap={4} align="stretch" width="100%">
      {yourToolData.map((tool) => (
        <YourToolCard
          key={tool.id}
          tool={tool}
          onEntryRecorded={handleEntryRecorded}
          currentUserId={currentUserId}
          isUserAdmin={isUserAdmin}
          childName={childName}
        />
      ))}
    </VStack>
  </Box>
)}
```

## Testing Guidelines

### Component Testing
- Test user interactions
- Test loading and error states
- Test responsive behavior
- Test accessibility features

### API Testing
- Test all CRUD operations
- Test error handling
- Test authentication/authorization
- Test data validation

## Performance Considerations

### React Query
- Use appropriate cache times
- Implement optimistic updates where suitable
- Use `enabled` option to prevent unnecessary requests

### Code Splitting
- Lazy load heavy components
- Use dynamic imports for large dependencies

### Image Optimization
- Use Next.js `Image` component
- Provide appropriate sizes and formats
- Implement lazy loading

## Deployment

### Build Verification
Always run before deployment:
```bash
npm run build
npm run type-check
npm run lint
```

### Environment Variables
Document any new environment variables needed for your tool.

## Examples

Refer to existing tools for implementation examples:
- **Barometer Tool**: Rating-based tracking with timeline
- **Dagens Smiley Tool**: Emoji-based daily check-ins with reasoning

These serve as reference implementations following all the guidelines above.
