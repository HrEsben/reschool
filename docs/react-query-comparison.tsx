// BEFORE: Manual state management with fetch
"use client";

import { useState, useEffect } from 'react';

export function OldChildrenList() {
  const [children, setChildren] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Manual fetch function
  const fetchChildren = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/children');
      if (!response.ok) {
        throw new Error('Failed to fetch children');
      }
      
      const data = await response.json();
      setChildren(data.children || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Manual effect to trigger fetches
  useEffect(() => {
    fetchChildren();
  }, [refreshTrigger]);

  // Manual delete with refetch
  const handleDelete = async (childId: string) => {
    try {
      const response = await fetch(`/api/children/${childId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete');
      
      // Manual refetch after deletion
      fetchChildren();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Delete failed');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {children.map(child => (
        <div key={child.id}>
          {child.name}
          <button onClick={() => handleDelete(child.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

// AFTER: React Query with automatic caching and coordination
"use client";

import { useChildren, useDeleteChild } from '@/lib/queries';

export function NewChildrenList() {
  // Single hook gives us data, loading, error states
  const { data: children = [], isLoading, error } = useChildren();
  const deleteChildMutation = useDeleteChild();

  // Optimistic mutation with automatic cache updates
  const handleDelete = async (childId: string) => {
    try {
      await deleteChildMutation.mutateAsync(childId);
      // Cache automatically updated by mutation's onSuccess
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {children.map(child => (
        <div key={child.id}>
          {child.name}
          <button 
            onClick={() => handleDelete(child.id)}
            disabled={deleteChildMutation.isPending}
          >
            {deleteChildMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      ))}
    </div>
  );
}

/* 
BENEFITS OF THE NEW APPROACH:

1. ✅ Automatic Caching: Data is cached and shared between components
2. ✅ Background Refetching: Data stays fresh automatically  
3. ✅ Optimistic Updates: UI feels instant with proper rollback on errors
4. ✅ Loading States: Built-in loading states for mutations
5. ✅ Error Handling: Automatic retry logic and error boundaries
6. ✅ Cache Invalidation: Smart cache updates when data changes
7. ✅ Reduced Boilerplate: Less code, more functionality
8. ✅ Better UX: Instant navigation with prefetched data

WHEN TO USE EACH PATTERN:

Use React Query for:
- Lists that change frequently (children, barometers)
- Data shared between multiple components
- Complex state coordination
- Background sync requirements

Keep simple fetch for:
- One-time operations (form submissions)
- Simple page-specific data
- Data that doesn't need caching
*/
