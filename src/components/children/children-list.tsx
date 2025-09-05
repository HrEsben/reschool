"use client";

import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Heading,
  VStack,
  Text,
  Badge,
  Spinner
} from '@chakra-ui/react';

interface Child {
  id: string;
  name: string;
  relation: 'Mor' | 'Far' | 'Underviser' | 'Ressourceperson';
  customRelationName?: string;
  isAdministrator: boolean;
  createdAt: string;
}

interface ChildrenListProps {
  refreshTrigger: number;
}

export function ChildrenList({ refreshTrigger }: ChildrenListProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChildren = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/children');
      
      if (!response.ok) {
        throw new Error('Fejl ved hentning af børn');
      }
      
      const data = await response.json();
      setChildren(data.children || []);
    } catch (err) {
      console.error('Error fetching children:', err);
      setError(err instanceof Error ? err.message : 'Der opstod en fejl');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [refreshTrigger]);

  const getRelationDisplay = (child: Child) => {
    if (child.relation === 'Ressourceperson' && child.customRelationName) {
      return `${child.relation} (${child.customRelationName})`;
    }
    return child.relation;
  };

  const getRelationColor = (relation: string) => {
    switch (relation) {
      case 'Mor':
        return 'pink';
      case 'Far':
        return 'blue';
      case 'Underviser':
        return 'green';
      case 'Ressourceperson':
        return 'purple';
      default:
        return 'gray';
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <Spinner size="lg" color="blue.500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        p={4}
        borderRadius="md"
        bg="red.50"
        borderLeft="4px solid"
        borderColor="red.400"
      >
        <Text color="red.700">{error}</Text>
      </Box>
    );
  }

  if (children.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="gray.500" fontSize="lg" mb={2}>
          Ingen børn tilføjet endnu
        </Text>
        <Text color="gray.400" fontSize="sm">
          Klik på "Tilføj barn" knappen ovenfor for at komme i gang.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4} display="flex" alignItems="center" gap={2}>
        <Heading size="sm" color="gray.700">
          Mine børn ({children.length})
        </Heading>
      </Box>
      
      <VStack gap={3} align="stretch">
        {children.map((child) => (
          <Card.Root key={child.id} variant="outline">
            <Card.Body p={4}>
              <Box display="flex" justifyContent="space-between" alignItems="start">
                <VStack align="start" gap={2} flex={1}>
                  <Heading size="sm" color="gray.700">
                    {child.name}
                  </Heading>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Badge
                      colorPalette={getRelationColor(child.relation)}
                      variant="solid"
                    >
                      {getRelationDisplay(child)}
                    </Badge>
                    {child.isAdministrator && (
                      <Badge colorPalette="gold" variant="solid">
                        Administrator
                      </Badge>
                    )}
                  </Box>
                  <Text fontSize="xs" color="gray.500">
                    Tilføjet: {new Date(child.createdAt).toLocaleDateString('da-DK')}
                  </Text>
                </VStack>
              </Box>
            </Card.Body>
          </Card.Root>
        ))}
      </VStack>
    </Box>
  );
}
