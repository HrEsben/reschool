"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  Heading,
  VStack,
  Text,
  Badge,
  Spinner,
  Button
} from '@chakra-ui/react';
import { DeleteChildDialog } from '@/components/ui/delete-child-dialog';

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
  const [deletingChildId, setDeletingChildId] = useState<string | null>(null);
  const router = useRouter();

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-');
  };

  const handleDeleteChild = async (child: Child) => {
    setDeletingChildId(child.id);
    
    try {
      const response = await fetch(`/api/children/${child.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Der opstod en fejl ved sletning af barnet');
        return;
      }
      
      // Refresh the children list
      fetchChildren();
    } catch (error) {
      console.error('Error deleting child:', error);
      setError('Der opstod en netværksfejl ved sletning af barnet');
    } finally {
      setDeletingChildId(null);
    }
  };

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
      return child.customRelationName;
    }
    return child.relation;
  };

  const getRelationColor = (relation: string) => {
    switch (relation) {
      case 'Mor':
        return 'coral';
      case 'Far':
        return 'navy';
      case 'Underviser':
        return 'sage';
      case 'Ressourceperson':
        return 'golden';
      default:
        return 'gray';
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <Spinner size="lg" colorPalette="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        p={4}
        bg="coral.50"
        borderRadius="lg"
        borderLeft="4px solid"
        borderColor="coral.400"
      >
        <Text color="coral.700" fontWeight="500">{error}</Text>
      </Box>
    );
  }

  if (children.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text color="fg.muted" fontSize="lg" mb={2} fontWeight="500">
          Ingen børn tilføjet endnu
        </Text>
        <Text color="fg.subtle" fontSize="sm">
          Klik på "Tilføj barn" knappen ovenfor for at komme i gang.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4} display="flex" alignItems="center" gap={2}>
      </Box>
      
      <VStack gap={3} align="stretch">
        {children.map((child) => (
          <Card.Root 
            key={child.id} 
            variant="outline" 
            borderColor="border.muted"
            bg="bg.surface"
            shadow="sm"
            _hover={{ 
              shadow: "md", 
              cursor: "pointer",
              transform: "translateY(-1px)",
              borderColor: "primary.200"
            }}
            transition="all 0.2s ease"
            borderRadius="lg"
          >
            <Card.Body p={4}>
              <Box display="flex" justifyContent="space-between" alignItems="start">
                <VStack align="start" gap={2} flex={1}>
                  <Heading size="sm" color="fg.default" fontWeight="600">
                    {child.name}
                  </Heading>
                  <Box display="flex" gap={2} flexWrap="wrap">
                    <Badge
                      colorPalette={getRelationColor(child.relation)}
                      variant="solid"
                      fontWeight="500"
                    >
                      {getRelationDisplay(child)}
                    </Badge>
                    {child.isAdministrator && (
                      <Badge colorPalette="golden" variant="solid" fontWeight="500">
                        Administrator
                      </Badge>
                    )}
                  </Box>
                </VStack>
                <VStack gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    colorPalette="navy"
                    onClick={() => router.push(`/${generateSlug(child.name)}`)}
                    fontWeight="500"
                    _hover={{
                      transform: "translateY(-1px)",
                      shadow: "sm"
                    }}
                    transition="all 0.2s ease"
                  >
                    Se profil
                  </Button>
                  {child.isAdministrator && (
                    <DeleteChildDialog
                      trigger={
                        <Button
                          size="sm"
                          colorPalette="coral"
                          variant="outline"
                          fontWeight="500"
                        >
                          Slet
                        </Button>
                      }
                      childName={child.name}
                      onConfirm={() => handleDeleteChild(child)}
                      isLoading={deletingChildId === child.id}
                    />
                  )}
                </VStack>
              </Box>
            </Card.Body>
          </Card.Root>
        ))}
      </VStack>
    </Box>
  );
}
