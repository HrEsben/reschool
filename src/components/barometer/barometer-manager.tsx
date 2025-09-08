"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { CreateBarometerDialog } from './create-barometer-dialog';
import { EditBarometerDialog } from './edit-barometer-dialog';
import { BarometerCard } from './barometer-card';

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

interface BarometerManagerProps {
  childId: number;
  isUserAdmin: boolean;
}

export function BarometerManager({ childId, isUserAdmin }: BarometerManagerProps) {
  const [barometers, setBarometers] = useState<Barometer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBarometer, setEditingBarometer] = useState<Barometer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchBarometers = async () => {
    try {
      setError(null);
      const response = await fetch(`/api/children/${childId}/barometers`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch barometers');
      }

      const data = await response.json();
      setBarometers(data.barometers || []);
    } catch (error) {
      console.error('Error fetching barometers:', error);
      setError('Kunne ikke indlæse barometre');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarometers();
  }, [childId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBarometerCreated = () => {
    fetchBarometers();
  };

  const handleEntryRecorded = () => {
    fetchBarometers();
  };

  const handleBarometerDeleted = () => {
    fetchBarometers();
  };

  const handleBarometerEdit = (barometer: Barometer) => {
    setEditingBarometer(barometer);
    setIsEditDialogOpen(true);
  };

  const handleBarometerUpdated = () => {
    fetchBarometers();
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
        <Button onClick={fetchBarometers} size="sm">
          Prøv igen
        </Button>
      </Box>
    );
  }

  return (
    <VStack gap={6} align="stretch">
      {/* Header with Create Button */}
      {isUserAdmin && (
        <Box>
          <CreateBarometerDialog
            childId={childId}
            onBarometerCreated={handleBarometerCreated}
            trigger={
              <Button colorScheme="blue" size="sm">
                + Nyt barometer
              </Button>
            }
          />
        </Box>
      )}

      {/* Barometers List */}
      {barometers.length > 0 ? (
        <VStack gap={4} align="stretch" width="100%">
          {barometers.map((barometer) => (
            <BarometerCard
              key={barometer.id}
              barometer={barometer}
              onEntryRecorded={handleEntryRecorded}
              onBarometerDeleted={handleBarometerDeleted}
              onBarometerEdit={handleBarometerEdit}
              isUserAdmin={isUserAdmin}
            />
          ))}
        </VStack>
      ) : (
        <Box py={8} textAlign="center">
          <Text color="gray.500" mb={4}>
            {isUserAdmin 
              ? 'Ingen barometre endnu. Opret det første barometer!' 
              : 'Ingen barometre tilgængelige.'}
          </Text>
          {!isUserAdmin && (
            <Text fontSize="sm" color="gray.400">
              Kun administratorer kan oprette barometre.
            </Text>
          )}
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
