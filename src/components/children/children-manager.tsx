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
    <Card.Root bg="bg.surface" shadow="lg" borderRadius="xl" border="1px solid" borderColor="border.muted">
      <Card.Header>
        <HStack justify="space-between" align="center">
          <VStack align="start" gap={1}>
            <Heading size="lg" color="fg.default" fontWeight="600">Børneadministration</Heading>
            <Text color="fg.muted" fontSize="sm" fontWeight="500">
              Administrer og tilføj børn til din profil
            </Text>
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
