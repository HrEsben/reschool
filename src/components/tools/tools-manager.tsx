"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  Spinner,
  Center,
  Heading,
  HStack,
  Icon,
  Separator,
} from '@chakra-ui/react';
import { useUser } from '@stackframe/stack';
import { AddToolDialog } from './add-tool-dialog';
import { BarometerCard } from '@/components/barometer/barometer-card';
import { EditBarometerDialog } from '@/components/barometer/edit-barometer-dialog';

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

interface ToolsManagerProps {
  childId: number;
  isUserAdmin: boolean;
}

export function ToolsManager({ childId, isUserAdmin }: ToolsManagerProps) {
  const [barometers, setBarometers] = useState<Barometer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBarometer, setEditingBarometer] = useState<Barometer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const user = useUser();

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

  const fetchTools = async () => {
    try {
      setError(null);
      // Fetch barometers
      const barometerResponse = await fetch(`/api/children/${childId}/barometers`);
      
      if (!barometerResponse.ok) {
        throw new Error('Failed to fetch tools');
      }

      const barometerData = await barometerResponse.json();
      setBarometers(barometerData.barometers || []);
    } catch (error) {
      console.error('Error fetching tools:', error);
      setError('Kunne ikke indlæse værktøjer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, [childId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToolAdded = () => {
    fetchTools();
  };

  const handleEntryRecorded = () => {
    fetchTools();
  };

  const handleBarometerDeleted = () => {
    fetchTools();
  };

  const handleBarometerEdit = (barometer: Barometer) => {
    setEditingBarometer(barometer);
    setIsEditDialogOpen(true);
  };

  const handleBarometerUpdated = () => {
    fetchTools();
    setEditingBarometer(null);
    setIsEditDialogOpen(false);
  };

  if (loading) {
    return (
      <Center py={8}>
        <Spinner size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Box py={8} textAlign="center">
        <Text color="red.500" mb={4}>
          {error}
        </Text>
        <Button onClick={fetchTools} size="sm">
          Prøv igen
        </Button>
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
