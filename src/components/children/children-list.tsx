"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Card,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Spinner,
  Button,
  Icon
} from '@chakra-ui/react';
import { DeleteChildDialog } from '@/components/ui/delete-child-dialog';

interface Child {
  id: string;
  name: string;
  slug: string;
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

  const getBadgeInfo = (child: Child) => {
    const relation = getRelationDisplay(child);
    const badges = [];
    
    // Relation badge - using neutral color for all relations
    badges.push({
      label: `Din relation: ${relation}`,
      color: 'gray',
      variant: 'subtle' as const,
      type: 'text' as const
    });
    
    // Administrator badge
    if (child.isAdministrator) {
      badges.push({
        label: 'Administrator',
        color: 'gray',
        variant: 'subtle' as const,
        type: 'icon' as const
      });
    }
    
    return badges;
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
        className="bg-burnt-sienna-900 border-l-4 border-burnt-sienna-400"
        borderRadius="lg"
      >
        <Text className="text-burnt-sienna-600" fontWeight="500">{error}</Text>
      </Box>
    );
  }

  if (children.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text className="text-delft-blue-600" fontSize="lg" mb={2} fontWeight="500">
          Ingen børn tilføjet endnu
        </Text>
        <Text className="text-delft-blue-400" fontSize="sm">
          Klik på &quot;Tilføj barn&quot; knappen ovenfor for at komme i gang.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Box mb={4} display="flex" alignItems="center" gap={2}>
      </Box>
      
      <VStack gap={4} align="stretch">
        {children.map((child) => (
          <Card.Root 
            key={child.id} 
            variant="outline"
            bg="#f4f1de"
            borderRadius="xl"
            borderWidth={1}
            borderColor="#81b29a"
            _hover={{ 
              borderColor: "#3d405b"
            }}
            transition="all 0.3s ease"
            overflow="hidden"
          >
            <Card.Body p={0}>
              {/* Header section with soft gradient */}
              <Box 
                bg="linear-gradient(135deg, #81b29a, #f4f1de)"
                px={6}
                py={4}
              >
                <HStack justify="space-between" align="center">
                  <Heading size="md" color="white" fontWeight="600" letterSpacing="-0.02em">
                    {child.name}
                  </Heading>
                  <HStack gap={2}>
                    {getBadgeInfo(child).map((badge, index) => (
                      badge.type === 'icon' ? (
                        <HStack
                          key={index}
                          bg="rgba(255, 255, 255, 0.9)"
                          px={2}
                          py={0.5}
                          borderRadius="sm"
                          gap={1}
                          align="center"
                        >
                          <Icon color="#3d405b" boxSize={3}>
                            <svg fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 2L13 7l5.5 1-4 4 1 5.5L10 15l-5.5 2.5 1-5.5-4-4L7 7l3-5z" clipRule="evenodd" />
                            </svg>
                          </Icon>
                          <Text fontSize="xs" color="#3d405b" fontWeight="500">
                            Administrator
                          </Text>
                        </HStack>
                      ) : (
                        <Badge
                          key={index}
                          colorPalette={badge.color}
                          variant={badge.variant}
                          size="sm"
                          fontWeight="500"
                          px={2}
                          py={0.5}
                          borderRadius="sm"
                          bg="rgba(255, 255, 255, 0.9)"
                          color="#3d405b"
                          borderWidth={0}
                          fontSize="xs"
                        >
                          {badge.label}
                        </Badge>
                      )
                    ))}
                  </HStack>
                </HStack>
              </Box>

              {/* Content section */}
              <Box px={6} py={4}>
                <HStack justify="space-between" align="center">
                  {/* Future tools section */}
                  <HStack gap={2}>
                    <Text fontSize="sm" color="#3d405b" fontWeight="500">
                      Værktøjer kommer snart
                    </Text>
                    {/* Placeholder for future tool icons */}
                    <Box display="flex" gap={1}>
                      <Box w={6} h={6} bg="#e07a5f" opacity={0.3} borderRadius="sm" />
                      <Box w={6} h={6} bg="#81b29a" opacity={0.3} borderRadius="sm" />
                      <Box w={6} h={6} bg="#f2cc8f" opacity={0.3} borderRadius="sm" />
                    </Box>
                  </HStack>
                  
                  {/* Action buttons */}
                  <HStack gap={3}>
                    <Button
                      size="sm"
                      bg="#81b29a"
                      color="white"
                      variant="solid"
                      onClick={() => router.push(`/${child.slug}`)}
                      fontWeight="500"
                      px={6}
                      borderRadius="full"
                      _hover={{
                        bg: "#6da085",
                        shadow: "md"
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
                            borderColor="#e07a5f"
                            color="#e07a5f"
                            variant="outline"
                            fontWeight="500"
                            p={2}
                            borderRadius="full"
                            _hover={{
                              bg: "#e07a5f",
                              color: "white",
                              shadow: "md"
                            }}
                            transition="all 0.2s ease"
                            aria-label="Slet barn"
                          >
                            <Icon boxSize={4}>
                              <svg fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53L15.986 5.952l.149.022a.75.75 0 00.23-1.482A48.16 48.16 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                              </svg>
                            </Icon>
                          </Button>
                        }
                        childName={child.name}
                        onConfirm={() => handleDeleteChild(child)}
                        isLoading={deletingChildId === child.id}
                      />
                    )}
                  </HStack>
                </HStack>
              </Box>
            </Card.Body>
          </Card.Root>
        ))}
      </VStack>
    </Box>
  );
}
