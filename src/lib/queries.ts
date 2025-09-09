import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types (matching your existing interfaces)
interface Child {
  id: string;
  name: string;
  slug: string;
  relation: 'Mor' | 'Far' | 'Underviser' | 'Ressourceperson';
  customRelationName?: string;
  isAdministrator: boolean;
  createdAt: string;
}

interface BarometerEntry {
  id: number;
  barometerId: number;
  recordedBy: number;
  entryDate: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

interface Barometer {
  id: number;
  childId: number;
  createdBy: number;
  topic: string;
  scaleMin: number;
  scaleMax: number;
  displayType: string;
  smileyType?: string;
  createdAt: string;
  updatedAt: string;
  latestEntry?: BarometerEntry;
  recordedByName?: string;
}

// Query Keys - centralized for easy cache invalidation
export const queryKeys = {
  children: ['children'] as const,
  child: (id: string) => ['children', id] as const,
  barometers: (childId: string) => ['children', childId, 'barometers'] as const,
  barometer: (id: number) => ['barometers', id] as const,
  notifications: ['notifications'] as const,
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
};

// Utility function to refresh all user-related data
export function useRefreshUserData() {
  const queryClient = useQueryClient();
  
  return () => {
    // Invalidate all user-related queries
    queryClient.invalidateQueries({ queryKey: queryKeys.children });
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    queryClient.invalidateQueries({ queryKey: queryKeys.users });
  };
}

// Additional API functions for child by slug
const api = {
  async fetchChildren(): Promise<Child[]> {
    const response = await fetch('/api/children');
    if (!response.ok) {
      throw new Error('Failed to fetch children');
    }
    const data = await response.json();
    return data.children || [];
  },

  async fetchChild(id: string) {
    const response = await fetch(`/api/children/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch child');
    }
    return response.json();
  },

  async fetchChildBySlug(slug: string) {
    const response = await fetch(`/api/children/slug/${slug}`);
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Du har ikke adgang til dette barns profil');
      } else if (response.status === 404) {
        throw new Error('Barnet blev ikke fundet');
      } else {
        throw new Error('Der opstod en fejl ved indlæsning af barnets profil');
      }
    }
    return response.json();
  },

  async fetchBarometers(childId: string): Promise<Barometer[]> {
    const response = await fetch(`/api/children/${childId}/barometers`);
    if (!response.ok) {
      throw new Error('Failed to fetch barometers');
    }
    const data = await response.json();
    return data.barometers || [];
  },

  async createChild(data: { name: string; relation: string; customRelationName?: string }) {
    const response = await fetch('/api/children', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create child');
    }
    return response.json();
  },

  async deleteChild(id: string) {
    const response = await fetch(`/api/children/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete child');
    }
    return response.json();
  },

  async removeUserFromChild(childId: string, userId: string) {
    const response = await fetch(`/api/children/${childId}/users/${userId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to remove user');
    }
    return response.json();
  },

  async deleteInvitation(invitationId: string) {
    const response = await fetch(`/api/invitations/delete/${invitationId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete invitation');
    }
    return response.json();
  },
};

// Hooks
export function useChildren() {
  return useQuery({
    queryKey: queryKeys.children,
    queryFn: api.fetchChildren,
  });
}

export function useChild(id: string) {
  return useQuery({
    queryKey: queryKeys.child(id),
    queryFn: () => api.fetchChild(id),
    enabled: !!id,
  });
}

export function useBarometers(childId: string) {
  return useQuery({
    queryKey: queryKeys.barometers(childId),
    queryFn: () => api.fetchBarometers(childId),
    enabled: !!childId,
  });
}

export function useChildBySlug(slug: string) {
  return useQuery({
    queryKey: queryKeys.child(slug),
    queryFn: () => api.fetchChildBySlug(slug),
    enabled: !!slug && !['dashboard', 'settings', 'api', 'children', 'users', '_next', 'favicon.ico'].includes(slug.toLowerCase()),
  });
}

export function useRemoveUserFromChild() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ childId, userId }: { childId: string; userId: string }) => 
      api.removeUserFromChild(childId, userId),
    onSuccess: (_, { childId }) => {
      // Invalidate the specific child query and the children list
      queryClient.invalidateQueries({ queryKey: queryKeys.child(childId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.children });
      // Also invalidate any queries that start with ['children'] to catch slug-based queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          return query.queryKey[0] === 'children';
        }
      });
    },
  });
}

export function useDeleteInvitation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (invitationId: string) => api.deleteInvitation(invitationId),
    onSuccess: () => {
      // Invalidate all child queries since invitations are part of child data
      queryClient.invalidateQueries({ queryKey: ['children'] });
    },
  });
}

export function useCreateChild() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createChild,
    onSuccess: () => {
      // Invalidate children list and notifications
      queryClient.invalidateQueries({ queryKey: queryKeys.children });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });
}

export function useDeleteChild() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.deleteChild,
    onSuccess: (_, deletedId) => {
      // Remove from cache and invalidate children list
      queryClient.removeQueries({ queryKey: queryKeys.child(deletedId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.children });
    },
  });
}

// Additional useful hooks
export function useCreateBarometer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ childId, data }: { childId: string; data: Record<string, unknown> }) => {
      const response = await fetch(`/api/children/${childId}/barometers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create barometer');
      }
      return response.json();
    },
    onSuccess: (_, { childId }) => {
      // Invalidate barometers for this child
      queryClient.invalidateQueries({ queryKey: queryKeys.barometers(childId) });
    },
  });
}

// Hook for prefetching data (useful for hover states)
export function usePrefetchBarometers() {
  const queryClient = useQueryClient();
  
  return (childId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.barometers(childId),
      queryFn: () => api.fetchBarometers(childId),
      staleTime: 2 * 60 * 1000, // 2 minutes
    });
  };
}
