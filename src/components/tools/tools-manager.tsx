"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  Skeleton,
  Heading,
  HStack,
  Icon,
  Separator,
} from '@chakra-ui/react';
import { useUser } from '@stackframe/stack';
import { AddToolDialog } from './add-tool-dialog';
import { BarometerCard } from '@/components/barometer/barometer-card';
import { EditBarometerDialog } from '@/components/barometer/edit-barometer-dialog';
import { useBarometers } from '@/lib/queries';

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

interface ToolsManagerProps {
  childId: number;
  isUserAdmin: boolean;
}

export function ToolsManager({ childId, isUserAdmin }: ToolsManagerProps) {
  const { data: barometers = [], isLoading: loading, error: queryError } = useBarometers(childId.toString());
  const [editingBarometer, setEditingBarometer] = useState<Barometer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const user = useUser();

  // Convert query error to string for display
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Kunne ikke indlæse værktøjer') : null;

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

  if (loading) {
    return (
      <VStack gap={4} align="stretch">
        {/* Tools Header Skeleton */}
        <HStack justify="space-between" align="center">
          <VStack align="start" gap={2}>
            <Skeleton height="28px" width="200px" />
            <Skeleton height="4px" width="64px" borderRadius="full" />
          </VStack>
          <Skeleton height="40px" width="120px" />
        </HStack>
        
        <Separator />
        
        {/* Tools Grid Skeleton */}
        <Box>
          <VStack gap={4}>
            {[1, 2, 3].map((i) => (
              <Box key={i} p={4} border="1px solid" borderColor="gray.200" borderRadius="lg" width="100%">
                <VStack align="stretch" gap={3}>
                  <HStack justify="space-between" align="center">
                    <Skeleton height="20px" width="40%" />
                    <Skeleton height="32px" width="80px" />
                  </HStack>
                  <Skeleton height="60px" width="100%" />
                  <HStack gap={2}>
                    {[1, 2, 3, 4, 5].map((j) => (
                      <Skeleton key={j} height="40px" width="40px" borderRadius="full" />
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

  const totalTools = barometers.length;
  const hasTools = totalTools > 0;

  return (
    <VStack gap={4} align="stretch">
      {/* Header with Add Tool Button - styled like Voksne section */}
      <HStack justify="space-between" align="start">
        <VStack align="start" gap={2}>
          <Heading size="lg" color="fg.default" fontWeight="600">
            Værktøjer
          </Heading>
          <Box className="w-16 h-1 bg-delft-blue-500 rounded-full"></Box>
        </VStack>
        
        <Box>
          {isUserAdmin && (
            <AddToolDialog
              childId={childId}
              onToolAdded={handleToolAdded}
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
          )}
        </Box>
      </HStack>

      <Separator />

      {/* Tools Display */}
      {hasTools ? (
        <VStack gap={6} align="stretch">
          {/* Barometers Section */}
          {barometers.length > 0 && (
            <Box>
              <VStack gap={4} align="stretch" width="100%">
                {barometers.map((barometer) => (
                  <BarometerCard
                    key={barometer.id}
                    barometer={barometer}
                    onEntryRecorded={handleEntryRecorded}
                    onBarometerDeleted={handleBarometerDeleted}
                    onBarometerEdit={handleBarometerEdit}
                    currentUserId={currentUserId || undefined}
                    isUserAdmin={isUserAdmin}
                  />
                ))}
              </VStack>
            </Box>
          )}

          {/* Future tool sections will be added here */}
        </VStack>
      ) : (
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
      )}

      {/* Edit Barometer Dialog */}
      {editingBarometer && (
        <EditBarometerDialog
          barometer={editingBarometer}
          onBarometerUpdated={handleBarometerUpdated}
          trigger={<Button style={{ display: 'none' }}>Hidden Trigger</Button>}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </VStack>
  );
}
