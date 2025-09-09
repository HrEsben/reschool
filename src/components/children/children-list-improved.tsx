"use client";

import {
  Box,
  Card,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Spinner,
  Alert
} from '@chakra-ui/react';
import { DeleteChildDialog } from '@/components/ui/delete-child-dialog';
import { useChildren, useDeleteChild } from '@/lib/queries';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ChildrenListImproved() {
  const router = useRouter();
  const [deletingChildId, setDeletingChildId] = useState<string | null>(null);
  
  const { data: children = [], isLoading, error } = useChildren();
  const deleteChildMutation = useDeleteChild();

  const handleDeleteChild = async (child: { id: string; name: string }) => {
    setDeletingChildId(child.id);
    
    try {
      await deleteChildMutation.mutateAsync(child.id);
      // The cache is automatically updated via the mutation's onSuccess
    } catch (error) {
      console.error('Error deleting child:', error);
      // Handle error (show toast, etc.)
    } finally {
      setDeletingChildId(null);
    }
  };

  const getRelationDisplay = (child: { relation: string; customRelationName?: string }) => {
    if (child.relation === 'Ressourceperson' && child.customRelationName) {
      return child.customRelationName;
    }
    return child.relation;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <Spinner size="lg" className="text-delft-blue-500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert.Root status="error">
        <Alert.Description>
          {error instanceof Error ? error.message : 'Der opstod en fejl ved indlæsning af børn'}
        </Alert.Description>
      </Alert.Root>
    );
  }

  if (children.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500" fontSize="lg">
          Du har ikke tilføjet nogen børn endnu.
        </Text>
      </Box>
    );
  }

  return (
    <VStack gap={4} align="stretch">
      {children.map((child) => (
        <Card.Root
          key={child.id}
          className="bg-white border border-eggshell-300 hover:border-cambridge-blue-300 transition-colors duration-200"
          borderRadius="lg"
          cursor="pointer"
          onClick={() => router.push(`/children/${child.id}`)}
          position="relative"
        >
          <Card.Body p={6}>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={3} flex={1}>
                <Box>
                  <Heading size="md" className="text-delft-blue-600" mb={1}>
                    {child.name}
                  </Heading>
                </Box>

                <HStack gap={2} flexWrap="wrap">
                  <Badge
                    variant="subtle"
                    className="bg-cambridge-blue-100 text-cambridge-blue-700"
                  >
                    {getRelationDisplay(child)}
                  </Badge>
                  
                  {child.isAdministrator && (
                    <Badge
                      variant="subtle"
                      className="bg-emerald-100 text-emerald-700"
                    >
                      Administrator
                    </Badge>
                  )}
                </HStack>
              </VStack>

              <Box position="absolute" top={4} right={4}>
                <DeleteChildDialog
                  trigger={<button>Delete</button>}
                  childName={child.name}
                  onConfirm={() => handleDeleteChild(child)}
                  isLoading={deletingChildId === child.id}
                />
              </Box>
            </HStack>
          </Card.Body>
        </Card.Root>
      ))}
    </VStack>
  );
}
