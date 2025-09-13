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
import { CreateSengetiderDialog } from './create-sengetider-dialog';
import { EditSengetiderDialog } from './edit-sengetider-dialog';
import { SengetiderCard } from './sengetider-card';
import { useSengetider } from '@/lib/queries';

interface SengetiderEntry {
  id: number;
  sengetiderId: number;
  recordedBy: number;
  entryDate: string;
  actualBedtime: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Sengetider {
  id: number;
  childId: number;
  createdBy: number;
  topic: string;
  description?: string;
  targetBedtime?: string;
  isPublic?: boolean;
  createdAt: string;
  updatedAt: string;
  latestEntry?: SengetiderEntry;
  recordedByName?: string;
}

interface SengetiderManagerProps {
  childId: number;
  isUserAdmin: boolean;
}

export function SengetiderManager({ childId, isUserAdmin }: SengetiderManagerProps) {
  const [editingSengetider, setEditingSengetider] = useState<Sengetider | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Use React Query hook
  const { data: sengetider = [], isLoading, error, refetch } = useSengetider(childId.toString());

  const handleSengetiderCreated = () => {
    // React Query will automatically refetch when the cache is invalidated
    refetch();
  };

  const handleEntryRecorded = () => {
    refetch();
  };

  const handleSengetiderDeleted = () => {
    refetch();
  };

  const handleSengetiderEdit = (sengetider: Sengetider) => {
    setEditingSengetider(sengetider);
    setIsEditDialogOpen(true);
  };

  const handleSengetiderUpdated = () => {
    refetch();
    setEditingSengetider(null);
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
          {error instanceof Error ? error.message : 'Kunne ikke indlæse sengetider'}
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
          <CreateSengetiderDialog
            childId={childId}
            onSengetiderCreated={handleSengetiderCreated}
            isUserAdmin={isUserAdmin}
            trigger={
              <Button colorScheme="blue" size="sm">
                + Ny sengetider
              </Button>
            }
          />
        </Box>
      )}

      {/* Sengetider List */}
      {sengetider.length > 0 ? (
        <VStack gap={4} align="stretch" width="100%">
          {sengetider.map((sengetiderItem) => (
            <SengetiderCard
              key={sengetiderItem.id}
              sengetider={sengetiderItem}
              onEntryRecorded={handleEntryRecorded}
              onSengetiderDeleted={handleSengetiderDeleted}
              onSengetiderEdit={isUserAdmin ? handleSengetiderEdit : undefined}
              isUserAdmin={isUserAdmin}
            />
          ))}
        </VStack>
      ) : (
        <Box py={8} textAlign="center">
          <Text color="gray.500" mb={4}>
            {isUserAdmin 
              ? 'Ingen sengetider endnu. Opret den første sengetider!' 
              : 'Ingen sengetider tilgængelige.'}
          </Text>
          {isUserAdmin && (
            <CreateSengetiderDialog
              childId={childId}
              onSengetiderCreated={handleSengetiderCreated}
              isUserAdmin={isUserAdmin}
              trigger={
                <Button colorScheme="blue" size="md">
                  Opret sengetider
                </Button>
              }
            />
          )}
        </Box>
      )}

      {/* Edit Sengetider Dialog */}
      {isUserAdmin && editingSengetider && (
        <EditSengetiderDialog
          sengetider={editingSengetider}
          onSengetiderUpdated={handleSengetiderUpdated}
          trigger={<Button style={{ display: 'none' }}>Hidden Trigger</Button>}
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      )}
    </VStack>
  );
}
