"use client";

import { useState } from 'react';
import {
  Box,
  Card,
  Heading,
  VStack,
  HStack,
  Text
} from '@chakra-ui/react';
import { AddChildForm } from './add-child-form';
import { ChildrenList } from './children-list';

export function ChildrenManager() {
  const [childrenRefreshTrigger, setChildrenRefreshTrigger] = useState(0);

  const handleChildAdded = () => {
    setChildrenRefreshTrigger(prev => prev + 1);
  };

  return (
    <Card.Root className="bg-white border-l-4 border-cambridge-blue-500 border-t border-r border-b border-eggshell-300" borderRadius="xl">
      <Card.Header>
        <HStack justify="space-between" align="center">
          <VStack align="start" gap={1}>
            <Heading size="lg" className="text-delft-blue-500" fontWeight="600">Børn i forløb</Heading>
            <Box className="w-12 h-1 bg-sunset-500 rounded-full"></Box>
          </VStack>
          <AddChildForm onChildAdded={handleChildAdded} />
        </HStack>
      </Card.Header>
      
      <Card.Body pt={0}>
        <ChildrenList refreshTrigger={childrenRefreshTrigger} />
      </Card.Body>
    </Card.Root>
  );
}
