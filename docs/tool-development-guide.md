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
│   ├── children/[childId]/[tool-name]/  # Main tool API endpoints
│   │   └── route.ts                     # GET/POST for tools
│   └── [tool-name]/[toolId]/            # Individual tool operations
│       ├── route.ts                     # PUT/DELETE tool
│       └── entries/                     # Entry management
│           ├── route.ts                 # GET/POST entries
│           └── [entryId]/
│               └── route.ts             # PUT/DELETE entries
└── lib/
    ├── database-service.ts              # Database operations
    ├── queries.ts                       # React Query hooks
    └── migrations/
        └── add_[tool-name]_table.sql    # Database schema
```

## Database Setup

### Creating Database Schema

**IMPORTANT: All SQL migrations must be run manually in your database console.**

1. Create a new migration file in `src/lib/migrations/` following the naming pattern:
   ```
   add_[tool-name]_table.sql
   ```

2. Follow the established table structure pattern:
   ```sql
   -- Main tool table
   CREATE TABLE IF NOT EXISTS [tool-name] (
     id SERIAL PRIMARY KEY,
     child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
     created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
     topic VARCHAR(255) NOT NULL,
     description TEXT,
     -- tool-specific fields
     is_public BOOLEAN NOT NULL DEFAULT true,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );

   -- Entries table
   CREATE TABLE IF NOT EXISTS [tool-name]_entries (
     id SERIAL PRIMARY KEY,
     [tool-name]_id INTEGER REFERENCES [tool-name](id) ON DELETE CASCADE,
     recorded_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
     entry_date DATE NOT NULL,
     -- entry-specific fields
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     UNIQUE([tool-name]_id, entry_date)
   );

   -- Access control table (for private tools)
   CREATE TABLE IF NOT EXISTS [tool-name]_user_access (
     id SERIAL PRIMARY KEY,
     [tool-name]_id INTEGER REFERENCES [tool-name](id) ON DELETE CASCADE,
     user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
     created_at TIMESTAMP DEFAULT NOW(),
     UNIQUE([tool-name]_id, user_id)
   );

   -- Performance indexes
   CREATE INDEX IF NOT EXISTS idx_[tool-name]_child_id ON [tool-name](child_id);
   CREATE INDEX IF NOT EXISTS idx_[tool-name]_entries_tool_id ON [tool-name]_entries([tool-name]_id);
   CREATE INDEX IF NOT EXISTS idx_[tool-name]_entries_date ON [tool-name]_entries(entry_date);
   ```

3. **Execute the SQL manually** in your Neon database console or preferred database client
4. Do NOT use automatic migration scripts - manual execution ensures data integrity

### Running Migrations Manually

**Always execute SQL migrations manually for data safety:**

1. Open your Neon database console or connect via psql
2. Copy the SQL from your migration file
3. Execute it in the database console
4. Verify the tables were created correctly with `\dt` (in psql) or equivalent
5. Test the application to ensure everything works

Example for Sengetider tool:
```sql
-- Run this in your database console:
-- Copy contents from src/lib/migrations/add_sengetider_table.sql
```

**Why Manual Execution?**
- Prevents accidental data loss
- Allows review before execution
- Easier rollback if issues occur
- More control over timing
- Better suited for production environments

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
  type="default"  // Valid types: 'default' | 'warning' | 'error' | 'success' | 'info'
  maxWidth="600px"
  primaryAction={{
    label: "Create",
    onClick: handleSubmit,
    colorScheme: "sage",
    isLoading: loading  // Use 'isLoading', not 'loading'
  }}
  secondaryAction={{
    label: "Cancel",
    onClick: handleCancel
  }}
>
  {/* Dialog content */}
</DialogManager>
```

**Important DialogManager Notes:**
- Use `isLoading` prop, not `loading` for button states
- Valid `type` values: `'default' | 'warning' | 'error' | 'success' | 'info'`
- Use `'error'` type for delete confirmations, not `'danger'`

### Delete Confirmation Pattern
```tsx
<DialogManager
  trigger={deleteButton}
  title="Slet Tool"
  type="error"  // Use 'error' for destructive actions
  primaryAction={{
    label: "Slet",
    onClick: handleDelete,
    colorScheme: "red",
    isLoading: isDeleting
  }}
  secondaryAction={{
    label: "Annuller"
  }}
>
  <Text>Er du sikker på, at du vil slette dette værktøj?</Text>
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

### API Route Structure
Follow the established pattern for tool API routes:

```
# Main tool operations (child-specific)
GET    /api/children/[childId]/[tool-name]    # Get all tools for child
POST   /api/children/[childId]/[tool-name]    # Create new tool for child

# Individual tool operations
GET    /api/[tool-name]/[toolId]              # Get specific tool
PUT    /api/[tool-name]/[toolId]              # Update specific tool
DELETE /api/[tool-name]/[toolId]              # Delete specific tool

# Entry operations
GET    /api/[tool-name]/[toolId]/entries      # Get entries for tool
POST   /api/[tool-name]/[toolId]/entries      # Create new entry
PUT    /api/[tool-name]/[toolId]/entries/[entryId]    # Update entry
DELETE /api/[tool-name]/[toolId]/entries/[entryId]    # Delete entry
```

### Authentication & Authorization Pattern
All API routes must include:

```typescript
// Standard auth check
const user = await stackServerApp.getUser();
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

const dbUser = await getUserByStackAuthId(user.id);
if (!dbUser) {
  return NextResponse.json({ error: 'User not found' }, { status: 404 });
}

// For tool creation/deletion (admin only)
const isAdmin = await isUserAdministratorForChild(dbUser.id, childId);
if (!isAdmin) {
  return NextResponse.json({ error: 'Only administrators can create/delete tools' }, { status: 403 });
}

// For tool access (check permissions)
const toolData = await getToolById(toolId);
if (!toolData) {
  return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
}
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
Add hooks to `queries.ts` following the established pattern:

```typescript
// 1. First, add to queryKeys object (maintain alphabetical order)
export const queryKeys = {
  // ... existing keys
  sengetider: (childId: string) => ['children', childId, 'sengetider'] as const,
  sengetiderTool: (id: number) => ['sengetider', id] as const,
  sengetiderEntries: (sengetiderId: number) => ['sengetider', sengetiderId, 'entries'] as const,
};

// 2. Add API functions to main api object
const api = {
  // ... existing functions
  async fetchSengetider(childId: string): Promise<Sengetider[]> {
    const response = await fetch(`/api/children/${childId}/sengetider`);
    if (!response.ok) {
      throw new Error('Failed to fetch sengetider');
    }
    const data = await response.json();
    return data.sengetider || [];
  },
};

// 3. Add hook for fetching tools
export function useSengetider(childId: string) {
  return useQuery({
    queryKey: queryKeys.sengetider(childId),
    queryFn: () => api.fetchSengetider(childId),
    enabled: !!childId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

// 4. Add sengetiderApi object for tool-specific operations
const sengetiderApi = {
  async createSengetider(childId: string, data: {
    topic: string;
    description?: string;
    targetBedtime: string;
    isPublic?: boolean;
    accessibleUserIds?: number[];
  }): Promise<Sengetider> {
    const response = await fetch(`/api/children/${childId}/sengetider`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create sengetider');
    }

    return response.json();
  },

  async updateSengetider(sengetiderId: number, data: {
    topic: string;
    description?: string;
    targetBedtime: string;
    isPublic?: boolean;
    accessibleUserIds?: number[];
  }): Promise<Sengetider> {
    const response = await fetch(`/api/sengetider/${sengetiderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update sengetider');
    }

    return response.json();
  },

  async deleteSengetider(sengetiderId: number): Promise<void> {
    const response = await fetch(`/api/sengetider/${sengetiderId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete sengetider');
    }
  },

  async createEntry(sengetiderId: number, data: {
    actualBedtime: string;
    notes?: string;
  }): Promise<SengetiderEntry> {
    const response = await fetch(`/api/sengetider/${sengetiderId}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create entry');
    }

    return response.json();
  },

  async fetchEntries(sengetiderId: number): Promise<SengetiderEntry[]> {
    const response = await fetch(`/api/sengetider/${sengetiderId}/entries`);
    if (!response.ok) {
      throw new Error('Failed to fetch entries');
    }
    const data = await response.json();
    return data.entries || [];
  },

  async deleteEntry(sengetiderId: number, entryId: number): Promise<void> {
    const response = await fetch(`/api/sengetider/${sengetiderId}/entries/${entryId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete entry');
    }
  },
};

// 5. Add creation hook
export function useCreateSengetider() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { childId: string } & Parameters<typeof sengetiderApi.createSengetider>[1]) => 
      sengetiderApi.createSengetider(data.childId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.sengetider(data.childId.toString()) 
      });
    },
  });
}

// 6. Add entry creation hook
export function useCreateSengetiderEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { sengetiderId: number } & Parameters<typeof sengetiderApi.createEntry>[1]) =>
      sengetiderApi.createEntry(data.sengetiderId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sengetider'] });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.sengetiderEntries(data.sengetiderId) 
      });
    },
  });
}

// 7. Add entries fetching hook
export function useSengetiderEntries(sengetiderId: number) {
  return useQuery({
    queryKey: queryKeys.sengetiderEntries(sengetiderId),
    queryFn: () => sengetiderApi.fetchEntries(sengetiderId),
    enabled: !!sengetiderId,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
  });
}
```

// 8. Add deletion hooks
export function useDeleteSengetider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sengetiderId: number) => sengetiderApi.deleteSengetider(sengetiderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sengetider'] });
    },
  });
}

export function useDeleteSengetiderEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sengetiderId, entryId }: { sengetiderId: number; entryId: number }) =>
      sengetiderApi.deleteEntry(sengetiderId, entryId),
    onSuccess: (_, { sengetiderId }) => {
      queryClient.invalidateQueries({ queryKey: ['sengetider'] });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.sengetiderEntries(sengetiderId) 
      });
    },
  });
}
```

**CRITICAL: Cache Invalidation Best Practices**

To ensure immediate UI updates when tools are created, updated, or deleted, **ALWAYS use React Query hooks instead of direct fetch calls**:

```typescript
// ❌ WRONG: Direct fetch calls bypass React Query cache
const handleDelete = async () => {
  const response = await fetch(`/api/sengetider/${id}`, { method: 'DELETE' });
  // UI won't update automatically!
};

// ✅ CORRECT: Use React Query mutation hooks
const deleteToolMutation = useDeleteSengetider();

const handleDelete = async () => {
  await deleteToolMutation.mutateAsync(id);
  // UI updates automatically via cache invalidation!
};
```

**Key React Query Patterns:**
- Use consistent queryKey naming: `[entity]`, `[entity]Tool`, `[entity]Entries`
- Separate API functions into main `api` object and tool-specific objects
- **Always use React Query hooks for ALL API calls** (create, read, update, delete)
- Always invalidate relevant queries in mutation `onSuccess` callbacks
- Use `enabled` option to prevent unnecessary requests
- Set appropriate `staleTime` based on data volatility
- **Never mix direct fetch calls with React Query** - this breaks cache synchronization
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

### Adding Tool to Tools Manager
Complete integration requires updates to `tools-manager.tsx`:

```tsx
// 1. Add imports
import { YourToolCard } from '@/components/your-tool/your-tool-card';
import { EditYourToolDialog } from '@/components/your-tool/edit-your-tool-dialog';
import { useBarometers, useDagensSmiley, useYourTool } from '@/lib/queries';

// 2. Add interfaces
interface YourToolEntry {
  id: number;
  yourToolId: number;
  recordedBy: number;
  entryDate: string;
  // tool-specific fields
  createdAt: string;
  updatedAt: string;
}

interface YourTool {
  id: number;
  childId: number;
  createdBy: number;
  topic: string;
  description?: string;
  // tool-specific fields
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
  latestEntry?: YourToolEntry;
  recordedByName?: string;
}

// 3. Add hook and state
export function ToolsManager({ childId, isUserAdmin, childName }: ToolsManagerProps) {
  const { data: yourTool = [], isLoading: yourToolLoading, error: yourToolError } = useYourTool(childId.toString());
  const [editingYourTool, setEditingYourTool] = useState<YourTool | null>(null);
  const [isYourToolEditDialogOpen, setIsYourToolEditDialogOpen] = useState(false);

  // 4. Update error handling
  const error = queryError || smileyError || yourToolError ? 
    ((queryError instanceof Error ? queryError.message : 
      (smileyError instanceof Error ? smileyError.message : 
       (yourToolError instanceof Error ? yourToolError.message : 'Kunne ikke indlæse værktøjer')))) : null;
  const isLoading = loading || smileyLoading || yourToolLoading;

  // 5. Add handlers
  const handleYourToolEdit = (yourTool: YourTool) => {
    setEditingYourTool(yourTool);
    setIsYourToolEditDialogOpen(true);
  };

  const handleYourToolUpdated = () => {
    setEditingYourTool(null);
    setIsYourToolEditDialogOpen(false);
  };

  // 6. Update total tools count
  const totalTools = barometers.length + dagensSmiley.length + yourTool.length;

  // 7. Add tool section
  {yourTool.length > 0 && (
    <Box>
      <VStack gap={4} align="stretch" width="100%">
        {yourTool.map((tool) => (
          <YourToolCard
            key={tool.id}
            yourTool={tool}
            onEntryRecorded={handleEntryRecorded}
            onYourToolDeleted={handleEntryRecorded}
            onYourToolEdit={isUserAdmin ? handleYourToolEdit : undefined}
            currentUserId={currentUserId || undefined}
            isUserAdmin={isUserAdmin}
            childName={childName}
          />
        ))}
      </VStack>
    </Box>
  )}

  // 8. Add edit dialog
  {isUserAdmin && editingYourTool && (
    <EditYourToolDialog
      yourTool={editingYourTool}
      onYourToolUpdated={handleYourToolUpdated}
      trigger={<Button style={{ display: 'none' }}>Hidden Trigger</Button>}
      isOpen={isYourToolEditDialogOpen}
      onOpenChange={setIsYourToolEditDialogOpen}
    />
  )}
}
```

### Adding Tool to Add Tool Dialog
Update `add-tool-dialog.tsx`:

```tsx
// 1. Add import
import { CreateYourToolDialog } from '@/components/your-tool/create-your-tool-dialog';

// 2. Add to availableTools array
{
  id: 'your-tool',
  name: 'Your Tool Name',
  description: 'Description of what your tool does',
  icon: '🔧', // Choose appropriate emoji
  available: true,
},

// 3. Add state
const [showCreateYourToolDialog, setShowCreateYourToolDialog] = useState(false);

// 4. Add to handleProceed
} else if (selectedTool === 'your-tool') {
  setMainDialogOpen(false);
  setTimeout(() => setShowCreateYourToolDialog(true), 100);
}

// 5. Update handleToolCreated
const handleToolCreated = () => {
  setShowCreateDialog(false);
  setShowCreateSmileyDialog(false);
  setShowCreateYourToolDialog(false);
  setSelectedTool(null);
  setMainDialogOpen(false);
  onToolAdded();
};

// 6. Add creation dialog
<CreateYourToolDialog
  childId={childId}
  onYourToolCreated={handleToolCreated}
  trigger={<div />}
  isOpen={showCreateYourToolDialog}
  onOpenChange={setShowCreateYourToolDialog}
  isUserAdmin={isUserAdmin}
/>
```

## Timeline Component Patterns

### Timeline Structure
Follow the established timeline component pattern:

```tsx
// Timeline ref interface
export interface [ToolName]TimelineRef {
  refresh: () => void;
}

// Component with forwardRef
export const [ToolName]Timeline = forwardRef<[ToolName]TimelineRef, [ToolName]TimelineProps>(
  ({ [toolName]Id, onEntryDeleted }, ref) => {
    const { data: entries = [], isLoading, refetch } = use[ToolName]Entries([toolName]Id);

    useImperativeHandle(ref, () => ({
      refresh: () => {
        refetch();
      }
    }));

    // ... component implementation
  }
);

[ToolName]Timeline.displayName = '[ToolName]Timeline';
```

### Timeline Entry Display
```tsx
<Timeline.Item>
  <Timeline.Indicator />
  <Timeline.Content>
    <Timeline.Title>
      <Flex align="center" gap={{ base: 2, md: 3 }} wrap={{ base: "wrap", sm: "nowrap" }}>
        {/* Primary data display */}
        <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold">
          {primaryValue}
        </Text>
        
        {/* User and relation info */}
        <HStack gap={{ base: 1, md: 2 }} align="center">
          <Text fontSize={{ base: "sm", md: "md" }} fontWeight="medium" color="gray.800">
            {entry.recordedByName || 'Ukendt bruger'}
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
    
    <Timeline.Description>
      <VStack gap={2} align="start">
        <Text fontSize="sm" color="gray.600">
          {formatDate(entry.entryDate)}
        </Text>
        {entry.notes && (
          <Text fontSize="sm" color="gray.700" style={{ whiteSpace: 'pre-wrap' }}>
            {entry.notes}
          </Text>
        )}
      </VStack>
    </Timeline.Description>
  </Timeline.Content>
</Timeline.Item>
```

## Common TypeScript Issues & Solutions

### Interface Naming
- Use PascalCase for interfaces: `SengetiderEntry`, not `sengetiderEntry`
- Match database field names exactly in interfaces
- Use optional fields (`?`) for nullable database columns

### Type Safety in API Routes
```typescript
// Always validate and parse parameters
const toolId = parseInt(toolIdParam);
if (isNaN(toolId)) {
  return NextResponse.json({ error: 'Invalid tool ID' }, { status: 400 });
}

// Use proper typing for request bodies
const body = await request.json();
const { field1, field2 }: { field1: string; field2?: string } = body;
```

### React Component Props
```typescript
interface ComponentProps {
  // Required props
  toolId: number;
  childName: string;
  
  // Optional props with defaults
  isUserAdmin?: boolean;
  
  // Callback functions
  onEntryRecorded: () => void;
  onToolDeleted?: () => void;
}

// Use proper destructuring with defaults
export function Component({ 
  toolId, 
  childName, 
  isUserAdmin = false,
  onEntryRecorded,
  onToolDeleted 
}: ComponentProps) {
  // ...
}
```

### forwardRef Typing
```typescript
// Proper ref interface
export interface TimelineRef {
  refresh: () => void;
}

// Correct forwardRef usage
export const Timeline = forwardRef<TimelineRef, TimelineProps>(
  (props, ref) => {
    // Implementation
  }
);

Timeline.displayName = 'Timeline';
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
- **Barometer Tool**: Rating-based tracking with timeline and scale configuration
- **Dagens Smiley Tool**: Emoji-based daily check-ins with reasoning text
- **Sengetider Tool**: Time-based tracking with target vs actual bedtime comparison

These serve as reference implementations following all the guidelines above.

## Checklist for New Tool Development

### Phase 1: Planning & Design
- [ ] Define tool purpose and data structure
- [ ] Design database schema (main table, entries table, access control table)
- [ ] Plan user interface components and interactions
- [ ] Identify specific fields needed (time inputs, text areas, dropdowns, etc.)

### Phase 2: Database Setup
- [ ] Create migration SQL file in `src/lib/migrations/`
- [ ] **Manually execute SQL in database console** (never use automated migration)
- [ ] Verify tables created with proper indexes
- [ ] Test basic CRUD operations in database

### Phase 3: Backend Implementation
- [ ] Add TypeScript interfaces to `database-service.ts`
- [ ] Implement CRUD functions in `database-service.ts`
- [ ] Create API routes following REST patterns
- [ ] Test API endpoints with proper authentication
- [ ] Add React Query hooks in `queries.ts`

### Phase 4: Frontend Components
- [ ] Create main card component (`[tool-name]-card.tsx`)
- [ ] Create timeline component (`[tool-name]-timeline.tsx`) with forwardRef
- [ ] Create creation dialog (`create-[tool-name]-dialog.tsx`)
- [ ] Create edit dialog (`edit-[tool-name]-dialog.tsx`)
- [ ] Create manager component (`[tool-name]-manager.tsx`)

### Phase 5: Integration
- [ ] Add tool to `tools-manager.tsx`
- [ ] Add tool option to `add-tool-dialog.tsx`
- [ ] Test complete workflow: create → use → edit → delete
- [ ] Verify TypeScript compilation passes
- [ ] Test responsive design on mobile and desktop

### Phase 6: Validation & Cache Verification
- [ ] **CRITICAL**: Verify ALL components use React Query hooks, no direct fetch calls
- [ ] Test tool creation immediately updates child profile display
- [ ] Test tool deletion immediately removes tool from child profile
- [ ] Test entry creation/deletion immediately updates tool timeline
- [ ] Verify timeline displays correctly with forwardRef pattern
- [ ] Test DialogManager with correct prop types (`isLoading`, `type: 'error'`)
- [ ] Ensure proper error handling and user feedback
- [ ] Test with multiple users and complex data scenarios
- [ ] **Search codebase for `fetch(` calls** and replace with React Query mutations

## Common Gotchas & Solutions

### React Query Cache Invalidation (CRITICAL)
**Problem**: Tools not refreshing after creation/deletion due to bypassing React Query cache
**Root Cause**: Using direct `fetch()` calls instead of React Query mutations

This is a **systematic issue** across the codebase where components use direct fetch calls, preventing automatic UI updates.

**❌ WRONG: Direct fetch calls bypass React Query cache**
```typescript
// This pattern is found in many existing components and must be avoided
const handleCreate = async () => {
  const response = await fetch('/api/children/123/sengetider', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  // UI won't refresh! Cache is not invalidated!
};

const handleDelete = async () => {
  const response = await fetch('/api/sengetider/456', { method: 'DELETE' });
  // UI still shows deleted item! Cache is stale!
};
```

**✅ CORRECT: Use React Query mutations for ALL API operations**
```typescript
// Creation
const createSengetiderMutation = useCreateSengetider();

const handleCreate = async () => {
  await createSengetiderMutation.mutateAsync({
    childId,
    topic,
    description,
    targetBedtime,
    isPublic,
    accessibleUserIds
  });
  // UI automatically refreshes via cache invalidation!
};

// Deletion
const deleteSengetiderMutation = useDeleteSengetider();

const handleDelete = async () => {
  await deleteSengetiderMutation.mutateAsync(sengetiderId);
  // UI automatically updates and removes deleted item!
};
```

**Solution Steps for Existing Components:**
1. **Identify components using direct fetch**: Search for `fetch(` in component files
2. **Create React Query hooks**: Add appropriate mutation hooks in `queries.ts`
3. **Update components**: Replace fetch calls with mutation hooks
4. **Verify cache invalidation**: Ensure `onSuccess` callbacks invalidate relevant queries

**Example Conversion (Sengetider pattern):**
```typescript
// Before: Direct fetch in component
const confirmDeleteSengetider = async () => {
  const response = await fetch(`/api/sengetider/${sengetider.id}`, {
    method: 'DELETE'
  });
  // No automatic UI update
};

// After: React Query mutation
const deleteSengetiderMutation = useDeleteSengetider();

const confirmDeleteSengetider = async () => {
  await deleteSengetiderMutation.mutateAsync(sengetider.id);
  // Automatic UI update via cache invalidation
};
```

**Cache Invalidation Best Practices:**
- **Universal Rule**: NEVER use direct fetch calls in components - always use React Query hooks
- Invalidate parent queries: `queryClient.invalidateQueries({ queryKey: ['sengetider'] })`
- Invalidate specific tool queries: `queryClient.invalidateQueries({ queryKey: queryKeys.sengetiderTool(id) })`
- Invalidate related data: entries, access permissions, etc.

### UserWithRelation Interface
**Problem**: Using wrong property names for user data
**Solution**: Always use `user.id` not `user.userId` for UserWithRelation interface

```typescript
// ✅ Correct
const isCreator = user.id.toString() === stackUser?.id;

// ❌ Wrong
const isCreator = user.userId === stackUser?.id;
```

### DialogManager Props
**Problem**: Using wrong prop names or types
**Solution**: Use correct prop names and values

```typescript
// ✅ Correct
<DialogManager
  type="error"           // not 'danger'
  primaryAction={{
    isLoading: loading   // not 'loading'
  }}
/>
```

### forwardRef Patterns
**Problem**: Timeline components not refreshing properly
**Solution**: Use proper forwardRef with useImperativeHandle

```typescript
// ✅ Correct pattern
export interface TimelineRef {
  refresh: () => void;
}

export const Timeline = forwardRef<TimelineRef, TimelineProps>(
  (props, ref) => {
    const { refetch } = useQuery(...);
    
    useImperativeHandle(ref, () => ({
      refresh: () => refetch()
    }));
    
    return <Timeline.Root>...</Timeline.Root>;
  }
);

Timeline.displayName = 'Timeline';
```

### Time Input Components
**Problem**: Browser time inputs can be tricky to style and validate
**Solution**: Use HTML5 time input with proper styling

```typescript
<Input
  type="time"
  value={timeValue}
  onChange={(e) => setTimeValue(e.target.value)}
  borderColor="cream.300"
  borderRadius="lg"
  bg="cream.25"
  _focus={{ 
    borderColor: "sage.400", 
    boxShadow: "0 0 0 3px rgba(129, 178, 154, 0.1)",
    bg: "white"
  }}
/>
```

### Access Control Implementation
**Problem**: Complex visibility logic for tools
**Solution**: Standardize the three access patterns

```typescript
// Standard visibility options
type VisibilityOption = 'alle' | 'kun_mig' | 'custom';

// Helper function for effective users
const getEffectiveSelectedUsers = (): UserWithRelation[] => {
  if (visibilityOption === 'alle') {
    return childUsers;
  } else if (visibilityOption === 'kun_mig') {
    const currentUser = childUsers.find(user => user.id === createdBy);
    return currentUser ? [currentUser] : [];
  } else {
    return childUsers.filter(user => selectedUserIds.includes(user.id));
  }
};
```

### Timeline Badge Consistency
**Problem**: Inconsistent badge usage across tools
**Solution**: Follow established patterns for different badge types

```typescript
// User relation badges (navy)
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

// Tool-specific value badges (sage)
<Badge
  colorPalette="sage"
  size={{ base: "xs", md: "sm" }}
  variant="subtle"
  borderRadius="full"
  px={{ base: 1, md: 2 }}
>
  {toolSpecificValue}
</Badge>
```

## Field-Specific Implementation Patterns

### Time Fields
For bedtime tracking, time comparisons, etc.:

```typescript
// Database schema
target_bedtime TIME NOT NULL,
actual_bedtime TIME NOT NULL,

// TypeScript interface
interface ToolEntry {
  targetBedtime: string; // "20:00" format
  actualBedtime: string; // "20:00" format
}

// UI component
<HStack justify="space-between">
  <Text fontSize="sm" fontWeight="medium">Målsengetid</Text>
  <Text fontSize="sm" color="sage.600">{targetBedtime}</Text>
</HStack>
```

### Notes/Comments Fields
For additional context and details:

```typescript
// Database schema
notes TEXT,

// UI component with proper textarea
<Textarea
  placeholder="Tilføj noter om denne registrering..."
  value={notes}
  onChange={(e) => setNotes(e.target.value)}
  maxLength={1000}
  rows={3}
  borderColor="cream.300"
  borderRadius="lg"
  bg="cream.25"
  _focus={{ 
    borderColor: "sage.400", 
    boxShadow: "0 0 0 3px rgba(129, 178, 154, 0.1)",
    bg: "white"
  }}
/>
```

### Validation Patterns
Common validation patterns for tool creation:

```typescript
const handleSubmit = async () => {
  // Required field validation
  if (!topic.trim()) {
    showToast({
      title: 'Fejl',
      description: 'Navn er påkrævet',
      type: 'error',
      duration: 3000,
    });
    return;
  }

  // Time validation example
  if (targetBedtime && !isValidTime(targetBedtime)) {
    showToast({
      title: 'Fejl',
      description: 'Ugyldig tidformat',
      type: 'error',
      duration: 3000,
    });
    return;
  }

  // ... submit logic
};

function isValidTime(time: string): boolean {
  return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
}
```

## Systematic Cache Issues in Existing Codebase

### Current State Analysis
During the implementation of proper cache invalidation for Sengetider tools, we discovered a **systematic issue** across the ReSchool codebase:

**Problem**: Many existing tool components use direct `fetch()` calls instead of React Query hooks, causing:
- Tools don't immediately appear in child profile after creation
- Deleted tools remain visible until page refresh
- Entry creation/deletion doesn't update timelines in real-time
- Inconsistent user experience across different tools

### Affected Components (Known Issues)
Based on investigation, these components likely have cache invalidation issues:

1. **Barometer Tools**:
   - `src/components/barometer/barometer-card.tsx` - Uses direct fetch in `confirmDeleteBarometer`
   - Missing `useDeleteBarometer` hook

2. **Dagens Smiley Tools**:
   - Likely similar patterns to investigate
   - Need verification of creation/deletion patterns

3. **Other Tool Types**:
   - Any components with `fetch(` calls instead of React Query hooks

### Fixing Cache Invalidation Issues

**Step 1: Identify Components**
```bash
# Search for direct fetch calls in components
grep -r "fetch(" src/components/ --include="*.tsx"
```

**Step 2: Add Missing Hooks**
For each tool type missing deletion hooks, add to `queries.ts`:
```typescript
export function useDeleteBarometer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (barometerId: number) => barometersApi.deleteBarometer(barometerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barometers'] });
    },
  });
}
```

**Step 3: Update Components**
Replace direct fetch calls with React Query mutations:
```typescript
// Replace this pattern:
const handleDelete = async () => {
  const response = await fetch(`/api/barometers/${id}`, { method: 'DELETE' });
};

// With this pattern:
const deleteBarometerMutation = useDeleteBarometer();
const handleDelete = async () => {
  await deleteBarometerMutation.mutateAsync(id);
};
```

**Step 4: Verify Cache Invalidation**
Ensure all mutations properly invalidate related queries:
- Parent tool lists (e.g., `['barometers']`)
- Specific tool data (e.g., `queryKeys.barometerTool(id)`)
- Related entries and access data

### Migration Priority
1. **High Priority**: Tools with creation/deletion operations (affects core workflow)
2. **Medium Priority**: Entry management operations (affects timeline updates)
3. **Low Priority**: Update/edit operations (less frequent, but still important)

### Testing Cache Invalidation
After fixing components, verify:
1. Create tool → immediately appears in child profile
2. Delete tool → immediately disappears from child profile
3. Create entry → immediately appears in timeline
4. Delete entry → immediately disappears from timeline
5. No page refresh required for any operation

This comprehensive guide now includes all the crucial patterns and gotchas discovered during the Sengetider implementation, ensuring future tool development follows established best practices and avoids cache invalidation issues.
