"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  Spinner,
  Center,
  Alert
} from '@chakra-ui/react';
import { CreateBarometerDialog } from './create-barometer-dialog';
import { EditBarometerDialog } from './edit-barometer-dialog';
import { BarometerCard } from './barometer-card';
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

interface BarometerManagerProps {
  childId: number;
  isUserAdmin: boolean;
}

export function BarometerManager({ childId, isUserAdmin }: BarometerManagerProps) {
  const [editingBarometer, setEditingBarometer] = useState<Barometer | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Use React Query hook
  const { data: barometers = [], isLoading, error, refetch } = useBarometers(childId.toString());

  const handleBarometerCreated = () => {
    // React Query will automatically refetch when the cache is invalidated
    refetch();
  };

  const handleEntryRecorded = () => {
    refetch();
  };

  const handleBarometerDeleted = () => {
    refetch();
  };

  const handleBarometerEdit = (barometer: Barometer) => {
    setEditingBarometer(barometer);
    setIsEditDialogOpen(true);
  };

  const handleBarometerUpdated = () => {
    refetch();
    setEditingBarometer(null);
    setIsEditDialogOpen(false);
  };

  if (isLoading) {
    return (
      <Center py={8}>
        <Spinner size="lg" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Description>
          {error instanceof Error ? error.message : 'Kunne ikke indlæse barometre'}
        </Alert.Description>
        <Button onClick={() => refetch()} size="sm" mt={2}>
          Prøv igen
        </Button>
      </Alert.Root>
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
            isUserAdmin={isUserAdmin}
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
              onBarometerUpdated={handleBarometerUpdated}
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
