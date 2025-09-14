"use client";

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  Skeleton,
  HStack,
  Icon,
  Separator,
} from '@chakra-ui/react';
import { useUser } from '@stackframe/stack';
import { AddToolDialog } from './add-tool-dialog';
import { BarometerCard } from '@/components/barometer/barometer-card';
import { EditBarometerDialog } from '@/components/barometer/edit-barometer-dialog';
import { DagensSmileyCard } from '@/components/dagens-smiley/dagens-smiley-card';
import { EditDagensSmileyDialog } from '@/components/dagens-smiley/edit-dagens-smiley-dialog';
import { SengetiderCard } from '@/components/sengetider/sengetider-card';
import { ToolsAnchorNav } from '@/components/ui/tools-anchor-nav';
import { useToolsNavigation } from '@/hooks/use-tools-navigation';
import { useBarometers, useDagensSmiley, useSengetider } from '@/lib/queries';

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

interface ToolsManagerProps {
  childId: number;
  isUserAdmin: boolean;
  childName: string;
  hideAddButton?: boolean; // New prop to hide internal add buttons
}

export interface ToolsManagerRef {
  openAddDialog: () => void;
}

export const ToolsManager = forwardRef<ToolsManagerRef, ToolsManagerProps>(
  function ToolsManager({ childId, isUserAdmin, childName, hideAddButton = false }, ref) {
  const { data: barometers = [], isLoading: loading, error: queryError } = useBarometers(childId.toString());
  const { data: dagensSmiley = [], isLoading: smileyLoading, error: smileyError } = useDagensSmiley(childId.toString());
  const { data: sengetider = [], isLoading: sengetiderLoading, error: sengetiderError } = useSengetider(childId.toString());
  const [editingBarometer, setEditingBarometer] = useState<Barometer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSmiley, setEditingSmiley] = useState<DagensSmiley | null>(null);
  const [isSmileyEditDialogOpen, setIsSmileyEditDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const addDialogTriggerRef = useRef<HTMLButtonElement>(null);
  const user = useUser();

  // Tools navigation hook
  const {
    tools: navigationTools,
    isReorderMode,
    toggleReorderMode,
    handleReorder,
  } = useToolsNavigation({
    barometers: barometers.map(b => ({ id: b.id, topic: b.topic })),
    dagensSmiley: dagensSmiley.map(s => ({ id: s.id, topic: s.topic })),
    sengetider: sengetider.map(s => ({ id: s.id })),
  });

  // Expose openAddDialog method to parent via ref
  useImperativeHandle(ref, () => ({
    openAddDialog: () => {
      // Programmatically trigger the add dialog
      if (addDialogTriggerRef.current) {
        addDialogTriggerRef.current.click();
      }
    }
  }), []);

  // Convert query error to string for display
  const error = queryError || smileyError || sengetiderError ? 
    ((queryError instanceof Error ? queryError.message : (smileyError instanceof Error ? smileyError.message : (sengetiderError instanceof Error ? sengetiderError.message : 'Kunne ikke indlæse værktøjer')))) : null;
  const isLoading = loading || smileyLoading || sengetiderLoading;

  // Get current user's database ID
  useEffect(() => {
    const getCurrentUserId = async () => {
      if (user) {
        try {
          const response = await fetch('/api/users/me');
          if (response.ok) {
            const userData = await response.json();
            setCurrentUserId(userData.user.id);
          }
        } catch (error) {
          console.error('Error getting current user ID:', error);
        }
      }
    };

    getCurrentUserId();
  }, [user]);

  const handleToolAdded = () => {
    // TanStack Query will automatically refresh due to cache invalidation
  };

  const handleEntryRecorded = () => {
    // TanStack Query will automatically refresh due to cache invalidation
  };

  const handleBarometerDeleted = () => {
    // TanStack Query will automatically refresh due to cache invalidation
  };

  const handleBarometerEdit = (barometer: Barometer) => {
    setEditingBarometer(barometer);
    setIsEditDialogOpen(true);
  };

  const handleBarometerUpdated = () => {
    // TanStack Query will automatically refresh due to cache invalidation
    setEditingBarometer(null);
    setIsEditDialogOpen(false);
  };

  const handleSmileyEdit = (smiley: DagensSmiley) => {
    setEditingSmiley(smiley);
    setIsSmileyEditDialogOpen(true);
  };

  const handleSmileyUpdated = () => {
    // TanStack Query will automatically refresh due to cache invalidation
    setEditingSmiley(null);
    setIsSmileyEditDialogOpen(false);
  };

  const handleSengetiderUpdated = () => {
    // TanStack Query will automatically refresh due to cache invalidation
  };

  if (isLoading) {
    return (
      <VStack gap={4} align="stretch">
        {/* Tools Header Skeleton */}
        <HStack justify="space-between" align="center">
          <VStack align="start" gap={2}>
            <Skeleton 
              height="28px" 
              width="200px" 
              variant="shine"
              css={{
                "--start-color": "#f5f5f5",
                "--end-color": "#e5e5e5",
              }}
            />
            <Skeleton 
              height="4px" 
              width="64px" 
              borderRadius="full" 
              variant="shine"
              css={{
                "--start-color": "#e5e5e5",
                "--end-color": "#d4d4d4",
              }}
            />
          </VStack>
          <Skeleton 
            height="40px" 
            width="120px" 
            variant="shine"
            css={{
              "--start-color": "#f0f4f3",
              "--end-color": "#e5e5e5",
            }}
          />
        </HStack>
        
        <Separator />
        
        {/* Tools Grid Skeleton */}
        <Box>
          <VStack gap={4}>
            {[1, 2, 3].map((i) => (
              <Box key={i} p={4} border="1px solid" borderColor="gray.200" borderRadius="lg" width="100%">
                <VStack align="stretch" gap={3}>
                  <HStack justify="space-between" align="center">
                    <Skeleton 
                      height="20px" 
                      width="40%" 
                      variant="shine"
                      css={{
                        "--start-color": "#f5f5f5",
                        "--end-color": "#e5e5e5",
                      }}
                    />
                    <Skeleton 
                      height="32px" 
                      width="80px" 
                      variant="shine"
                      css={{
                        "--start-color": "#f0f4f3",
                        "--end-color": "#e5e5e5",
                      }}
                    />
                  </HStack>
                  <Skeleton 
                    height="60px" 
                    width="100%" 
                    variant="shine"
                    css={{
                      "--start-color": "#f8f8f8",
                      "--end-color": "#f0f0f0",
                    }}
                  />
                  <HStack gap={2}>
                    {[1, 2, 3, 4, 5].map((j) => (
                      <Skeleton 
                        key={j} 
                        height="40px" 
                        width="40px" 
                        borderRadius="full" 
                        variant="shine"
                        css={{
                          "--start-color": "#f5f5f5",
                          "--end-color": "#e8e8e8",
                        }}
                      />
                    ))}
                  </HStack>
                </VStack>
              </Box>
            ))}
          </VStack>
        </Box>
      </VStack>
    );
  }

  if (error) {
    return (
      <Box py={8} textAlign="center">
        <Text color="red.500" mb={4}>
          {error}
        </Text>
        <Text fontSize="sm" color="gray.600">
          Prøv at genindlæse siden
        </Text>
      </Box>
    );
  }

  const totalTools = barometers.length + dagensSmiley.length + sengetider.length;
  const hasTools = totalTools > 0;

  return (
    <>
      {/* Anchor Navigation - Only show if there are tools and more than one section */}
      {hasTools && navigationTools.length > 1 && (
        <ToolsAnchorNav
          tools={navigationTools}
          onReorder={handleReorder}
          isReorderMode={isReorderMode}
          onToggleReorderMode={toggleReorderMode}
        />
      )}

      <VStack gap={4} align="stretch">
      {/* Tools Display */}
      {hasTools ? (
        <VStack gap={6} align="stretch">
          {/* Render tools in the order specified by navigation */}
          {navigationTools.map((navTool) => {
            if (navTool.type === 'barometer') {
              const barometerId = parseInt(navTool.id.replace('barometer-', ''));
              const barometer = barometers.find(b => b.id === barometerId);
              
              if (!barometer) return null;
              
              return (
                <Box key={navTool.id} id={`tool-section-${navTool.id}`}>
                  <BarometerCard
                    barometer={barometer}
                    onEntryRecorded={handleEntryRecorded}
                    onBarometerDeleted={handleBarometerDeleted}
                    onBarometerEdit={isUserAdmin ? handleBarometerEdit : undefined}
                    currentUserId={currentUserId || undefined}
                    isUserAdmin={isUserAdmin}
                  />
                </Box>
              );
            }
            
            if (navTool.type === 'dagens-smiley') {
              const smileyId = parseInt(navTool.id.replace('dagens-smiley-', ''));
              const smiley = dagensSmiley.find(s => s.id === smileyId);
              
              if (!smiley) return null;
              
              return (
                <Box key={navTool.id} id={`tool-section-${navTool.id}`}>
                  <DagensSmileyCard
                    smiley={smiley}
                    onEntryRecorded={handleEntryRecorded}
                    onSmileyDeleted={handleEntryRecorded}
                    onSmileyEdit={isUserAdmin ? handleSmileyEdit : undefined}
                    onSmileyUpdated={handleSmileyUpdated}
                    currentUserId={currentUserId || undefined}
                    isUserAdmin={isUserAdmin}
                    childName={childName}
                  />
                </Box>
              );
            }
            
            if (navTool.type === 'sengetider' && sengetider.length > 0) {
              const sengetiderItem = sengetider[0]; // Always just one sengetider
              
              return (
                <Box key={navTool.id} id={`tool-section-${navTool.id}`}>
                  <SengetiderCard
                    sengetider={sengetiderItem}
                    onEntryRecorded={() => {}} // Placeholder - entries are recorded within the card
                    onSengetiderDeleted={handleSengetiderUpdated}
                    isUserAdmin={isUserAdmin}
                    childName={childName}
                  />
                </Box>
              );
            }
            
            return null;
          })}

          {/* Add Tool Button - moved below tools */}
          {isUserAdmin && !hideAddButton && (
            <Box pt={4}>
              <Separator mb={4} />
              <Box display="flex" justifyContent="flex-end">
                <AddToolDialog
                  childId={childId}
                  childName={childName}
                  onToolAdded={handleToolAdded}
                  isUserAdmin={isUserAdmin}
                  trigger={
                    <Button
                      bg="#81b29a"
                      color="white"
                      size="md"
                      _hover={{
                        bg: "#6a9b82"
                      }}
                    >
                      <Icon mr={2}>
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                      </Icon>
                      Tilføj
                    </Button>
                  }
                />
              </Box>
            </Box>
          )}
        </VStack>
      ) : (
        <VStack gap={4} align="stretch">
          <Box py={8} textAlign="center">
            <Text color="gray.500" fontSize="md">
              {isUserAdmin 
                ? 'Ingen værktøjer endnu' 
                : 'Ingen værktøjer tilgængelige'}
            </Text>
            <Text color="gray.400" fontSize="sm" mt={2}>
              {isUserAdmin 
                ? 'Klik på "Tilføj" for at komme i gang med at spore barnets udvikling'
                : 'Administratorer kan tilføje værktøjer til at spore barnets udvikling'}
            </Text>
          </Box>
          
          {/* Add Tool Button - shown even when no tools exist */}
          {isUserAdmin && !hideAddButton && (
            <Box display="flex" justifyContent="flex-end">
              <AddToolDialog
                childId={childId}
                childName={childName}
                onToolAdded={handleToolAdded}
                isUserAdmin={isUserAdmin}
                trigger={
                  <Button
                    bg="#81b29a"
                    color="white"
                    size="md"
                    _hover={{
                      bg: "#6a9b82"
                    }}
                  >
                    <Icon mr={2}>
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </Icon>
                    Tilføj
                  </Button>
                }
              />
            </Box>
          )}
        </VStack>
      )}

      {/* Edit Barometer Dialog */}
      {isUserAdmin && editingBarometer && (
        <EditBarometerDialog
          barometer={editingBarometer}
          onBarometerUpdated={handleBarometerUpdated}
          trigger={<Button style={{ display: 'none' }}>Hidden Trigger</Button>}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}

      {/* Edit Dagens Smiley Dialog */}
      {isUserAdmin && editingSmiley && (
        <EditDagensSmileyDialog
          smiley={editingSmiley}
          onSmileyUpdated={handleSmileyUpdated}
          trigger={<Button style={{ display: 'none' }}>Hidden Trigger</Button>}
          isOpen={isSmileyEditDialogOpen}
          onOpenChange={setIsSmileyEditDialogOpen}
          isUserAdmin={isUserAdmin}
        />
      )}

      {/* External Add Tool Dialog - controlled from parent */}
      {hideAddButton && isUserAdmin && (
        <AddToolDialog
          childId={childId}
          childName={childName}
          onToolAdded={handleToolAdded}
          isUserAdmin={isUserAdmin}
          trigger={
            <button 
              ref={addDialogTriggerRef}
              style={{ display: 'none' }}
            >
              Hidden Trigger
            </button>
          }
        />
      )}
    </VStack>
    </>
  );
});

ToolsManager.displayName = 'ToolsManager';
