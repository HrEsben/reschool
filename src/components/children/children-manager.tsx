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
    <Card.Root>
      <Card.Header>
        <HStack justify="space-between" align="center">
          <VStack align="start" gap={1}>
            <Heading size="lg">Børneadministration</Heading>
            <Text color="gray.600" fontSize="sm">
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
