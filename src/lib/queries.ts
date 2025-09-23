import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Sengetider, 
  SengetiderEntry, 
  SengetiderWithLatestEntry,
  Indsatstrappe,
  IndsatstrappePlan,
  IndsatsSteps,
  IndsatstrappePlanEntry,
  IndsatsStepPeriod
} from '@/lib/database-service';

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
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
  latestEntry?: BarometerEntry;
  recordedByName?: string;
}

interface DagensSmileyEntry {
  id: number;
  smileyId: number;
  recordedBy: number;
  entryDate: string;
  selectedEmoji: string;
  reasoning?: string;
  createdAt: string;
  updatedAt: string;
}

interface DagensSmiley {
  id: number;
  childId: number;
  createdBy: number;
  topic: string;
  description?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
  latestEntry?: DagensSmileyEntry;
  recordedByName?: string;
}

// Query Keys - centralized for easy cache invalidation
export const queryKeys = {
  children: ['children'] as const,
  child: (id: string) => ['children', id] as const,
  barometers: (childId: string) => ['children', childId, 'barometers'] as const,
  barometer: (id: number) => ['barometers', id] as const,
  dagensSmiley: (childId: string) => ['children', childId, 'dagens-smiley'] as const,
  smiley: (id: number) => ['dagens-smiley', id] as const,
  indsatstrappe: (childId: string) => ['children', childId, 'indsatstrappe'] as const,
  indsatsplan: (id: number) => ['indsatstrappe', id] as const,
  indsatsSteps: (planId: number) => ['indsatstrappe', planId, 'steps'] as const,
  activeIndsatsplan: (childId: string) => ['children', childId, 'indsatstrappe', 'active'] as const,
  progress: (childId: string) => ['children', childId, 'progress'] as const,
  sengetider: (childId: string) => ['children', childId, 'sengetider'] as const,
  sengetiderTool: (id: number) => ['sengetider', id] as const,
  sengetiderEntries: (sengetiderId: number) => ['sengetider', sengetiderId, 'entries'] as const,
  notifications: ['notifications'] as const,
  users: ['users'] as const,
  user: (id: string) => ['users', id] as const,
  invitations: ['invitations'] as const,
  pendingInvitations: ['invitations', 'pending'] as const,
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

  async fetchSengetider(childId: string): Promise<SengetiderWithLatestEntry[]> {
    const response = await fetch(`/api/children/${childId}/sengetider`);
    if (!response.ok) {
      throw new Error('Failed to fetch sengetider');
    }
    const data = await response.json();
    return data.sengetider || [];
  },

  async fetchProgress(childId: string) {
    const response = await fetch(`/api/children/${childId}/progress`);
    if (!response.ok) {
      throw new Error('Failed to fetch progress data');
    }
    return response.json();
  },

  async fetchDagensSmiley(childId: string): Promise<DagensSmiley[]> {
    const response = await fetch(`/api/children/${childId}/dagens-smiley`);
    if (!response.ok) {
      throw new Error('Failed to fetch dagens smiley');
    }
    const data = await response.json();
    return data.smileys || [];
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

  async fetchChildUsers(childId: string) {
    const response = await fetch(`/api/children/${childId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch child users');
    }
    const data = await response.json();
    return data.users || [];
  },

  async fetchIndsatstrappe(childId: string): Promise<IndsatstrappePlan[]> {
    const response = await fetch(`/api/children/${childId}/indsatstrappe`);
    if (!response.ok) {
      throw new Error('Failed to fetch indsatstrappe');
    }
    const data = await response.json();
    return data.plans || [];
  },

  async fetchActiveIndsatstrappe(childId: string): Promise<IndsatstrappePlan | null> {
    const response = await fetch(`/api/children/${childId}/indsatstrappe/active`);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No active plan
      }
      throw new Error('Failed to fetch active indsatstrappe');
    }
    const data = await response.json();
    return data.plan || null;
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

export function useChildUsers(childId: string) {
  return useQuery({
    queryKey: [...queryKeys.child(childId), 'users'],
    queryFn: () => api.fetchChildUsers(childId),
    enabled: !!childId,
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

export function usePromoteUserToAdmin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ childId, userId }: { childId: string; userId: string }) => {
      const response = await fetch(`/api/children/${childId}/users/${userId}/promote`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to promote user to admin');
      }
    },
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

export function useDemoteUserFromAdmin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ childId, userId }: { childId: string; userId: string }) => {
      const response = await fetch(`/api/children/${childId}/users/${userId}/demote`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to demote user from admin');
      }
    },
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

export function useRecordBarometerEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ barometerId, rating, comment, childId }: { // eslint-disable-line @typescript-eslint/no-unused-vars
      barometerId: number; 
      rating: number; 
      comment?: string;
      childId: string;
    }) => {
      const response = await fetch(`/api/barometers/${barometerId}/entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      });
      if (!response.ok) {
        throw new Error('Failed to record barometer entry');
      }
      return response.json();
    },
    onSuccess: (_, { childId }) => {
      // Invalidate barometers for this child and latest registrations
      queryClient.invalidateQueries({ queryKey: queryKeys.barometers(childId) });
      queryClient.invalidateQueries({ queryKey: ['latest-registrations'] });
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

// Invitation types
interface PendingInvitation {
  id: number;
  email: string;
  childId: number;
  childName: string;
  childSlug: string;
  invitedBy: number;
  relation: string;
  customRelationName?: string;
  token: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  inviterName: string;
  inviterRelation: string;
}

// Invitation API functions
const invitationApi = {
  fetchPendingInvitations: async (): Promise<PendingInvitation[]> => {
    const response = await fetch('/api/invitations/pending', {
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to fetch pending invitations');
    }
    const data = await response.json();
    return data.invitations;
  },

  declineInvitation: async (invitationId: number): Promise<void> => {
    const response = await fetch('/api/invitations/decline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitationId }),
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to decline invitation');
    }
  },
};

// Invitation hooks
export function usePendingInvitations() {
  return useQuery({
    queryKey: queryKeys.pendingInvitations,
    queryFn: invitationApi.fetchPendingInvitations,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: invitationApi.declineInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingInvitations });
    },
  });
}

// ================== DAGENS SMILEY API & HOOKS ==================

const dagensSmileyApi = {
  async fetchDagensSmiley(childId: string): Promise<DagensSmiley[]> {
    const response = await fetch(`/api/children/${childId}/dagens-smiley`);
    if (!response.ok) {
      throw new Error('Failed to fetch dagens smiley');
    }
    const data = await response.json();
    return data.smileys || [];
  },

  async createDagensSmiley(childId: string, data: {
    topic: string;
    description?: string;
    isPublic?: boolean;
    accessibleUserIds?: number[];
  }): Promise<DagensSmiley> {
    const response = await fetch(`/api/children/${childId}/dagens-smiley`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to create dagens smiley');
    }
    return response.json();
  },

  async updateDagensSmiley(smileyId: number, data: {
    topic: string;
    description?: string;
    isPublic?: boolean;
    accessibleUserIds?: number[];
  }): Promise<DagensSmiley> {
    const response = await fetch(`/api/dagens-smiley/${smileyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to update dagens smiley');
    }
    return response.json();
  },

  async deleteDagensSmiley(smileyId: number): Promise<void> {
    const response = await fetch(`/api/dagens-smiley/${smileyId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete dagens smiley');
    }
  },

  async recordEntry(smileyId: number, data: {
    selectedEmoji: string;
    reasoning?: string;
  }): Promise<DagensSmileyEntry> {
    const response = await fetch(`/api/dagens-smiley/${smileyId}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('Failed to record smiley entry');
    }
    return response.json();
  },

  async fetchEntries(smileyId: number): Promise<DagensSmileyEntry[]> {
    const response = await fetch(`/api/dagens-smiley/${smileyId}/entries`);
    if (!response.ok) {
      throw new Error('Failed to fetch smiley entries');
    }
    const data = await response.json();
    return data.entries || [];
  },

  async deleteEntry(smileyId: number, entryId: number): Promise<void> {
    const response = await fetch(`/api/dagens-smiley/${smileyId}/entries/${entryId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete smiley entry');
    }
  },
};

// Dagens Smiley hooks
export function useDagensSmiley(childId: string) {
  return useQuery({
    queryKey: queryKeys.dagensSmiley(childId),
    queryFn: () => dagensSmileyApi.fetchDagensSmiley(childId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}

export function useCreateDagensSmiley() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ childId, data }: { childId: string; data: Parameters<typeof dagensSmileyApi.createDagensSmiley>[1] }) =>
      dagensSmileyApi.createDagensSmiley(childId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dagensSmiley(data.childId.toString()) });
    },
  });
}

export function useUpdateDagensSmiley() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ smileyId, data }: { smileyId: number; data: Parameters<typeof dagensSmileyApi.updateDagensSmiley>[1] }) =>
      dagensSmileyApi.updateDagensSmiley(smileyId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dagensSmiley(data.childId.toString()) });
      queryClient.invalidateQueries({ queryKey: queryKeys.smiley(data.id) });
    },
  });
}

export function useDeleteDagensSmiley() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ smileyId, childId }: { smileyId: number; childId: string }) => {
      return dagensSmileyApi.deleteDagensSmiley(smileyId).then(() => ({ childId }));
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dagensSmiley(data.childId) });
    },
  });
}

export function useRecordSmileyEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ smileyId, data, childId }: { 
      smileyId: number; 
      data: Parameters<typeof dagensSmileyApi.recordEntry>[1];
      childId: string;
    }) => {
      return dagensSmileyApi.recordEntry(smileyId, data).then(result => ({ result, childId }));
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dagensSmiley(data.childId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.smiley(data.result.smileyId) });
      queryClient.invalidateQueries({ queryKey: ['latest-registrations'] });
    },
  });
}

export function useSmileyEntries(smileyId: number) {
  return useQuery({
    queryKey: ['smiley-entries', smileyId],
    queryFn: () => dagensSmileyApi.fetchEntries(smileyId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
  });
}

export function useDeleteSmileyEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ smileyId, entryId, childId }: { smileyId: number; entryId: number; childId: string }) => {
      return dagensSmileyApi.deleteEntry(smileyId, entryId).then(() => ({ smileyId, childId }));
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dagensSmiley(data.childId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.smiley(data.smileyId) });
      queryClient.invalidateQueries({ queryKey: ['smiley-entries', data.smileyId] });
      queryClient.invalidateQueries({ queryKey: ['latest-registrations'] });
    },
  });
}

// Latest Registrations Types and Hooks
export interface RegistrationEntry {
  id: number;
  type: 'barometer' | 'smiley';
  childId: number;
  childName: string;
  toolName: string;
  entryDate: string;
  createdAt: string;
  recordedByName?: string;
  userRelation?: string;
  customRelationName?: string;
  // Type-specific data
  rating?: number; // for barometer
  comment?: string; // for barometer
  selectedEmoji?: string; // for smiley
  reasoning?: string; // for smiley
}

export function useLatestRegistrations(limit: number = 20) {
  return useQuery({
    queryKey: ['latest-registrations', limit],
    queryFn: async () => {
      const response = await fetch(`/api/registrations/latest?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch latest registrations');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: true,
  });
}

// Sengetider API object
const sengetiderApi = {
  async createSengetider(childId: number, data: {
    description?: string;
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

  async createEntry(sengetiderId: number, data: {
    entryDate: string;
    puttetid: string | null;
    sovKl?: string | null;
    vaagnede?: string | null;
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

  async deleteSengetider(sengetiderId: number): Promise<void> {
    const response = await fetch(`/api/sengetider/${sengetiderId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete sengetider');
    }
  },
};

// Indsatstrappe (Intervention ladder) API
const indsatsrappeApi = {
  async createIndsatstrappe(childId: string, data: {
    title: string;
    description?: string;
    startDate?: string;
    accessibleUserIds?: number[];
  }): Promise<Indsatstrappe> {
    const response = await fetch(`/api/children/${childId}/indsatstrappe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create indsatstrappe');
    }
    return response.json();
  },

  async updateIndsatstrappe(planId: number, data: {
    title?: string;
    description?: string;
    isActive?: boolean;
    targetDate?: string;
    accessibleUserIds?: number[];
  }): Promise<Indsatstrappe> {
    const response = await fetch(`/api/indsatstrappe/${planId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update indsatstrappe');
    }
    return response.json();
  },

  async deleteIndsatstrappe(planId: number): Promise<void> {
    const response = await fetch(`/api/indsatstrappe/${planId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete indsatstrappe');
    }
  },

  async addStep(planId: number, data: {
    title: string;
    description?: string;
    målsætning?: string;
    stepStartDate?: string; // Optional start date for the step period
  }): Promise<IndsatsSteps> {
    const response = await fetch(`/api/indsatstrappe/${planId}/steps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add step');
    }
    return response.json();
  },

  // Step period management
  async getStepPeriods(planId: number, stepId: number): Promise<IndsatsStepPeriod[]> {
    const response = await fetch(`/api/indsatstrappe/${planId}/steps/${stepId}/periods`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch step periods');
    }
    return response.json();
  },

  async createStepPeriod(
    planId: number, 
    stepId: number, 
    data: { 
      startDate?: string; 
      endDate?: string; 
      isCustomPeriod?: boolean 
    }
  ): Promise<IndsatsStepPeriod> {
    const response = await fetch(`/api/indsatstrappe/${planId}/steps/${stepId}/periods`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create step period');
    }
    return response.json();
  },

  async completeStep(stepId: number): Promise<IndsatsSteps> {
    const response = await fetch(`/api/indsatstrappe/steps/${stepId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to complete step');
    }
    return response.json();
  },

  async uncompleteStep(stepId: number): Promise<IndsatsSteps> {
    const response = await fetch(`/api/indsatstrappe/steps/${stepId}/uncomplete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to mark step as incomplete');
    }
    return response.json();
  },

  async updateStep(stepId: number, data: {
    title: string;
    description?: string;
    målsætning?: string;
    startDate?: string;
    targetEndDate?: string;
  }): Promise<IndsatsSteps> {
    const response = await fetch(`/api/indsatstrappe/steps/${stepId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update step');
    }
    return response.json();
  },

  async deleteStep(stepId: number): Promise<void> {
    const response = await fetch(`/api/indsatstrappe/steps/${stepId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete step');
    }
  },

  async linkToolEntry(stepId: number, data: {
    entryType: 'barometer' | 'dagens-smiley' | 'sengetider';
    entryId: number;
    notes?: string;
  }): Promise<IndsatstrappePlanEntry> {
    const response = await fetch(`/api/indsatstrappe/steps/${stepId}/link-entry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to link tool entry');
    }
    return response.json();
  },

  async fetchSteps(planId: number): Promise<IndsatsSteps[]> {
    const response = await fetch(`/api/indsatstrappe/${planId}/steps`);
    if (!response.ok) {
      throw new Error('Failed to fetch steps');
    }
    const data = await response.json();
    return data.steps || [];
  },
};

// Sengetider (Bedtime tracking) hooks

export function useSengetider(childId: string) {
  return useQuery({
    queryKey: queryKeys.sengetider(childId),
    queryFn: () => api.fetchSengetider(childId),
    enabled: !!childId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

export function useCreateSengetider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { childId: number } & Parameters<typeof sengetiderApi.createSengetider>[1]) => 
      sengetiderApi.createSengetider(data.childId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.sengetider(data.childId.toString()) 
      });
    },
  });
}

export function useUpdateSengetider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: number;
      description?: string;
      isPublic?: boolean;
    }) => {
      const { id, ...updates } = data;
      const response = await fetch(`/api/sengetider/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update sengetider');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate sengetider data for this child
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.sengetider(data.sengetider.childId.toString()) 
      });
    },
  });
}

export function useDeleteSengetider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: number; childId: string }) => {
      const response = await fetch(`/api/sengetider/${data.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete sengetider');
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      // Invalidate sengetider data for this child
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.sengetider(variables.childId) 
      });
    },
  });
}

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

export function useSengetiderEntries(sengetiderId: number) {
  return useQuery({
    queryKey: queryKeys.sengetiderTool(sengetiderId),
    queryFn: async () => {
      const response = await fetch(`/api/sengetider/${sengetiderId}/entries`);
      if (!response.ok) {
        throw new Error('Failed to fetch sengetider entries');
      }
      const data = await response.json();
      return data.entries as (SengetiderEntry & { 
        recordedByName?: string; 
        userRelation?: string; 
        customRelationName?: string; 
      })[];
    },
    enabled: !!sengetiderId,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
  });
}

export function useUpdateSengetiderEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: number;
      entryDate?: string;
      puttetid?: string | null;
      sovKl?: string | null;
      vaagnede?: string | null;
      notes?: string;
    }) => {
      const { id, ...updates } = data;
      const response = await fetch(`/api/sengetider/entries/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update sengetider entry');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate sengetider data to show the updated entry
      queryClient.invalidateQueries({ queryKey: ['sengetider'] });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.sengetiderTool(data.entry.sengetiderId) 
      });
    },
  });
}

export function useDeleteSengetiderEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: number; sengetiderId: number }) => {
      const response = await fetch(`/api/sengetider/entries/${data.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete sengetider entry');
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      // Invalidate sengetider data to remove the deleted entry
      queryClient.invalidateQueries({ queryKey: ['sengetider'] });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.sengetiderTool(variables.sengetiderId) 
      });
    },
  });
}

// ====================================================================
// PROGRESS VIEW HOOKS
// ====================================================================

export function useProgress(childId: string) {
  return useQuery({
    queryKey: queryKeys.progress(childId),
    queryFn: () => api.fetchProgress(childId),
    enabled: !!childId,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes (shorter than other tools since this aggregates data)
  });
}

// ====================================================================
// INDSATSTRAPPE (Intervention Ladder) Hooks
// ====================================================================

export function useIndsatstrappe(childId: string) {
  return useQuery({
    queryKey: queryKeys.indsatstrappe(childId),
    queryFn: () => api.fetchIndsatstrappe(childId),
    enabled: !!childId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });
}

export function useActiveIndsatstrappe(childId: string) {
  return useQuery({
    queryKey: queryKeys.activeIndsatsplan(childId),
    queryFn: () => api.fetchActiveIndsatstrappe(childId),
    enabled: !!childId,
    staleTime: 1000 * 60 * 2, // Shorter stale time for active plan
  });
}

export function useCreateIndsatstrappe() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { childId: string } & Parameters<typeof indsatsrappeApi.createIndsatstrappe>[1]) => 
      indsatsrappeApi.createIndsatstrappe(data.childId, data),
    onSuccess: (data, variables) => {
      // Invalidate indsatstrappe queries for the child
      queryClient.invalidateQueries({ queryKey: queryKeys.indsatstrappe(variables.childId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeIndsatsplan(variables.childId) });
      // Also invalidate child data since it may affect child profile display
      queryClient.invalidateQueries({ queryKey: queryKeys.child(variables.childId) });
    },
  });
}

export function useUpdateIndsatstrappe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { planId: number; childId: string } & Parameters<typeof indsatsrappeApi.updateIndsatstrappe>[1]) => 
      indsatsrappeApi.updateIndsatstrappe(data.planId, data),
    onSuccess: (data, variables) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.indsatstrappe(variables.childId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeIndsatsplan(variables.childId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.indsatsplan(variables.planId) });
    },
  });
}

export function useDeleteIndsatstrappe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { planId: number; childId: string }) => {
      await indsatsrappeApi.deleteIndsatstrappe(data.planId);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate indsatstrappe queries for the child
      queryClient.invalidateQueries({ queryKey: queryKeys.indsatstrappe(data.childId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeIndsatsplan(data.childId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.indsatsplan(data.planId) });
    },
  });
}

export function useAddIndsatsStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { planId: number; childId: string } & Parameters<typeof indsatsrappeApi.addStep>[1]) => 
      indsatsrappeApi.addStep(data.planId, data),
    onSuccess: (data, variables) => {
      // Invalidate plan and step queries
      queryClient.invalidateQueries({ queryKey: queryKeys.indsatstrappe(variables.childId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.indsatsplan(variables.planId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.indsatsSteps(variables.planId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeIndsatsplan(variables.childId) });
    },
  });
}

export function useCompleteIndsatsStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { stepId: number; planId: number; childId: string }) => 
      indsatsrappeApi.completeStep(data.stepId),
    onSuccess: async (data, variables) => {
      // Force immediate refetch of all related queries
      await queryClient.refetchQueries({ queryKey: queryKeys.activeIndsatsplan(variables.childId) });
      await queryClient.refetchQueries({ queryKey: queryKeys.indsatstrappe(variables.childId) });
      await queryClient.refetchQueries({ queryKey: queryKeys.indsatsplan(variables.planId) });
      await queryClient.refetchQueries({ queryKey: queryKeys.indsatsSteps(variables.planId) });
    },
  });
}

export function useUncompleteIndsatsStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { stepId: number; planId: number; childId: string }) => 
      indsatsrappeApi.uncompleteStep(data.stepId),
    onSuccess: async (data, variables) => {
      // Force immediate refetch of all related queries
      await queryClient.refetchQueries({ queryKey: queryKeys.activeIndsatsplan(variables.childId) });
      await queryClient.refetchQueries({ queryKey: queryKeys.indsatstrappe(variables.childId) });
      await queryClient.refetchQueries({ queryKey: queryKeys.indsatsplan(variables.planId) });
      await queryClient.refetchQueries({ queryKey: queryKeys.indsatsSteps(variables.planId) });
    },
  });
}

export function useUpdateIndsatsStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { stepId: number; planId: number; childId: string } & Parameters<typeof indsatsrappeApi.updateStep>[1]) => 
      indsatsrappeApi.updateStep(data.stepId, data),
    onSuccess: (data, variables) => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.indsatstrappe(variables.childId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.indsatsplan(variables.planId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.indsatsSteps(variables.planId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeIndsatsplan(variables.childId) });
    },
  });
}

export function useDeleteIndsatsStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { stepId: number; planId: number; childId: string }) => {
      await indsatsrappeApi.deleteStep(data.stepId);
      return data;
    },
    onSuccess: (data) => {
      // Invalidate plan and step queries
      queryClient.invalidateQueries({ queryKey: queryKeys.indsatstrappe(data.childId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.indsatsplan(data.planId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.indsatsSteps(data.planId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeIndsatsplan(data.childId) });
    },
  });
}

export function useLinkToolEntryToStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { stepId: number; planId: number; childId: string } & Parameters<typeof indsatsrappeApi.linkToolEntry>[1]) => 
      indsatsrappeApi.linkToolEntry(data.stepId, data),
    onSuccess: (data, variables) => {
      // Invalidate step and plan queries
      queryClient.invalidateQueries({ queryKey: queryKeys.indsatstrappe(variables.childId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.indsatsplan(variables.planId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.indsatsSteps(variables.planId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.activeIndsatsplan(variables.childId) });
    },
  });
}

export function useIndsatsSteps(planId: number) {
  return useQuery({
    queryKey: queryKeys.indsatsSteps(planId),
    queryFn: () => indsatsrappeApi.fetchSteps(planId),
    enabled: !!planId,
    staleTime: 1000 * 60 * 3, // Consider data fresh for 3 minutes
  });
}

// ====================================================================
// STEP PERIODS HOOKS
// ====================================================================

export function useStepPeriods(planId: number, stepId: number) {
  return useQuery({
    queryKey: ['stepPeriods', planId, stepId],
    queryFn: () => indsatsrappeApi.getStepPeriods(planId, stepId),
    enabled: !!planId && !!stepId,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
  });
}

export function useCreateStepPeriod() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { 
      planId: number; 
      stepId: number; 
      startDate?: string; 
      endDate?: string; 
      isCustomPeriod?: boolean 
    }) => 
      indsatsrappeApi.createStepPeriod(data.planId, data.stepId, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch step periods
      queryClient.invalidateQueries({ 
        queryKey: ['stepPeriods', variables.planId, variables.stepId] 
      });
      // Also invalidate the overview to refresh registration counts
      queryClient.invalidateQueries({ 
        queryKey: ['indsatsrappeOverview', variables.planId] 
      });
      // And invalidate the plan data to refresh step statuses
      queryClient.invalidateQueries({ 
        queryKey: ['indsatstrappe', variables.planId] 
      });
    }
  });
}
