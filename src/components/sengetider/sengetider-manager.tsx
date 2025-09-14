"use client";

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
import { SengetiderCard } from './sengetider-card';
import { useSengetider } from '@/lib/queries';

interface SengetiderManagerProps {
  childId: number;
  isUserAdmin: boolean;
  childName: string;
}

export function SengetiderManager({ childId, isUserAdmin, childName }: SengetiderManagerProps) {
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
            childName={childName}
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
              isUserAdmin={isUserAdmin}
              childName={childName}
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
              childName={childName}
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
    </VStack>
  );
}
