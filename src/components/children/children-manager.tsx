"use client";

import {
  Box,
  Card,
  HStack
} from '@chakra-ui/react';
import { AddChildForm } from './add-child-form';
import { ChildrenList } from './children-list';

export function ChildrenManager() {
  const handleChildAdded = () => {
    // With React Query, we don't need manual refresh triggers
    // The cache will be invalidated automatically by the mutation
  };

  return (
    <Card.Root className="bg-white border-l-4 border-cambridge-blue-500 border-t border-r border-b border-eggshell-300" borderRadius="xl">
      <Card.Header>
        <HStack justify="space-between" align="center">
          <Box>
            {/* Header removed - cleaner design */}
          </Box>
          <AddChildForm onChildAdded={handleChildAdded} />
        </HStack>
      </Card.Header>
      
      <Card.Body pt={0}>
        <ChildrenList />
      </Card.Body>
    </Card.Root>
  );
}
