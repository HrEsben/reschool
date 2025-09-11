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
  Button,
  Icon,
  Alert,
  Flex,
  Skeleton
} from '@chakra-ui/react';
import { DeleteChildDialog } from '@/components/ui/delete-child-dialog';
import { useChildren, useDeleteChild, usePrefetchBarometers } from '@/lib/queries';
import { PocketKnife } from 'lucide-react';

interface Child {
  id: string;
  name: string;
  slug: string;
  relation: 'Mor' | 'Far' | 'Underviser' | 'Ressourceperson';
  customRelationName?: string;
  isAdministrator: boolean;
  createdAt: string;
}

interface ChildSummary {
  usersCount: number;
  barometersCount: number;
  recentEntriesCount: number;
}

interface ChildrenListProps {
  // No props needed - React Query handles all data management
  className?: string;
}

export function ChildrenList({}: ChildrenListProps) {
  const [deletingChildId, setDeletingChildId] = useState<string | null>(null);
  const [childSummaries, setChildSummaries] = useState<Record<string, ChildSummary>>({});
  const [summariesLoading, setSummariesLoading] = useState(false);
  const router = useRouter();

  // Use React Query hooks
  const { data: children = [], isLoading, error } = useChildren();
  const deleteChildMutation = useDeleteChild();
  const prefetchBarometers = usePrefetchBarometers();

  // Fetch summary data for each child
  useEffect(() => {
    const fetchChildSummaries = async () => {
      if (children.length === 0) return;
      
      setSummariesLoading(true);
      const summaries: Record<string, ChildSummary> = {};
      
      for (const child of children) {
        try {
          // Fetch users count and barometers data in parallel
          const [usersResponse, barometersResponse] = await Promise.all([
            fetch(`/api/children/slug/${child.slug}`),
            fetch(`/api/children/${child.id}/barometers`)
          ]);

          if (usersResponse.ok && barometersResponse.ok) {
            const userData = await usersResponse.json();
            const barometersData = await barometersResponse.json();
            
            // Count recent entries (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            
            let recentEntriesCount = 0;
            for (const barometer of barometersData.barometers || []) {
              if (barometer.latestEntry && new Date(barometer.latestEntry.createdAt) >= sevenDaysAgo) {
                recentEntriesCount++;
              }
            }

            summaries[child.id] = {
              usersCount: (userData.users?.length || 0) + (userData.invitations?.length || 0),
              barometersCount: barometersData.barometers?.length || 0,
              recentEntriesCount
            };
          }
        } catch (error) {
          console.error(`Error fetching data for child ${child.id}:`, error);
          summaries[child.id] = {
            usersCount: 0,
            barometersCount: 0,
            recentEntriesCount: 0
          };
        }
      }
      
      setChildSummaries(summaries);
      setSummariesLoading(false);
    };

    fetchChildSummaries();
  }, [children]);

  const handleDeleteChild = async (child: Child) => {
    setDeletingChildId(child.id);
    
    try {
      await deleteChildMutation.mutateAsync(child.id);
      // The cache is automatically updated via the mutation's onSuccess
    } catch (error) {
      console.error('Error deleting child:', error);
      // You can add toast notification here if needed
    } finally {
      setDeletingChildId(null);
    }
  };

  // Prefetch barometers when hovering over a child card for better UX
  const handleChildHover = (childId: string) => {
    prefetchBarometers(childId);
  };

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
      <VStack gap={4}>
        {[1, 2, 3].map((i) => (
          <Card.Root 
            key={i}
            variant="outline"
            bg="#f4f1de"
            borderRadius="xl"
            borderWidth={1}
            borderColor="#81b29a"
            overflow="hidden"
          >
            <Card.Body p={0}>
              {/* Header section skeleton */}
              <Box 
                bg="linear-gradient(135deg, #81b29a, #f4f1de)"
                px={{ base: 4, md: 6 }}
                py={4}
              >
                <HStack justify="space-between" align="center">
                  <Skeleton 
                    height="28px" 
                    width="40%" 
                    borderRadius="md" 
                    variant="shine"
                    css={{
                      "--start-color": "#e07a5f",
                      "--end-color": "#f2cc8f",
                    }}
                  />
                  <HStack gap={2} display={{ base: "none", md: "flex" }}>
                    <Skeleton 
                      height="24px" 
                      width="80px" 
                      borderRadius="sm" 
                      variant="shine"
                      css={{
                        "--start-color": "#81b29a",
                        "--end-color": "#f2cc8f",
                      }}
                    />
                    <Skeleton 
                      height="24px" 
                      width="100px" 
                      borderRadius="sm" 
                      variant="shine"
                      css={{
                        "--start-color": "#3d405b",
                        "--end-color": "#81b29a",
                      }}
                    />
                  </HStack>
                </HStack>
              </Box>

              {/* Content section skeleton */}
              <Box px={{ base: 4, md: 6 }} py={{ base: 3, md: 4 }}>
                <VStack gap={3} align="stretch">
                  {/* Mobile badges skeleton */}
                  <HStack 
                    gap={2} 
                    display={{ base: "flex", md: "none" }}
                    flexWrap="wrap"
                  >
                    <Skeleton 
                      height="28px" 
                      width="120px" 
                      borderRadius="md" 
                      variant="shine"
                      css={{
                        "--start-color": "#e07a5f",
                        "--end-color": "#81b29a",
                      }}
                    />
                    <Skeleton 
                      height="28px" 
                      width="100px" 
                      borderRadius="md" 
                      variant="shine"
                      css={{
                        "--start-color": "#3d405b",
                        "--end-color": "#f2cc8f",
                      }}
                    />
                  </HStack>

                  {/* Summary stats skeleton */}
                  <Flex 
                    direction={{ base: "column", sm: "row" }} 
                    gap={{ base: 2, sm: 4 }} 
                    align={{ base: "stretch", sm: "center" }}
                    justify="space-between"
                  >
                    <HStack gap={{ base: 2, md: 4 }} flexWrap="wrap">
                      {/* Users count skeleton */}
                      <HStack gap={1} align="center">
                        <Skeleton 
                          height="16px" 
                          width="16px" 
                          borderRadius="full" 
                          variant="shine"
                          css={{
                            "--start-color": "#3d405b",
                            "--end-color": "#81b29a",
                          }}
                        />
                        <Skeleton 
                          height="16px" 
                          width="60px" 
                          borderRadius="sm" 
                          variant="shine"
                          css={{
                            "--start-color": "#e07a5f",
                            "--end-color": "#f2cc8f",
                          }}
                        />
                      </HStack>

                      {/* Tools count skeleton */}
                      <HStack gap={1} align="center">
                        <Skeleton 
                          height="16px" 
                          width="16px" 
                          borderRadius="full" 
                          variant="shine"
                          css={{
                            "--start-color": "#81b29a",
                            "--end-color": "#f2cc8f",
                          }}
                        />
                        <Skeleton 
                          height="16px" 
                          width="70px" 
                          borderRadius="sm" 
                          variant="shine"
                          css={{
                            "--start-color": "#3d405b",
                            "--end-color": "#81b29a",
                          }}
                        />
                      </HStack>

                      {/* Activity skeleton */}
                      <HStack gap={1} align="center">
                        <Skeleton 
                          height="16px" 
                          width="16px" 
                          borderRadius="full" 
                          variant="shine"
                          css={{
                            "--start-color": "#f2cc8f",
                            "--end-color": "#e07a5f",
                          }}
                        />
                        <Skeleton 
                          height="16px" 
                          width="50px" 
                          borderRadius="sm" 
                          variant="shine"
                          css={{
                            "--start-color": "#81b29a",
                            "--end-color": "#f2cc8f",
                          }}
                        />
                      </HStack>
                    </HStack>
                    
                    {/* Action buttons skeleton */}
                    <HStack gap={{ base: 2, md: 3 }} flexShrink={0}>
                      <Skeleton 
                        height="36px" 
                        width="90px" 
                        borderRadius="full" 
                        variant="shine"
                        css={{
                          "--start-color": "#81b29a",
                          "--end-color": "#f2cc8f",
                        }}
                      />
                      <Skeleton 
                        height="36px" 
                        width="36px" 
                        borderRadius="full" 
                        variant="shine"
                        css={{
                          "--start-color": "#e07a5f",
                          "--end-color": "#3d405b",
                        }}
                      />
                    </HStack>
                  </Flex>
                </VStack>
              </Box>
            </Card.Body>
          </Card.Root>
        ))}
      </VStack>
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
            onMouseEnter={() => handleChildHover(child.id)}
          >
            <Card.Body p={0}>
              {/* Header section with soft gradient */}
              <Box 
                bg="linear-gradient(135deg, #81b29a, #f4f1de)"
                px={{ base: 4, md: 6 }}
                py={4}
              >
                <HStack justify="space-between" align="center">
                  <Heading 
                    size={{ base: "lg", md: "md" }} 
                    color="white" 
                    fontWeight="600" 
                    letterSpacing="-0.02em"
                    flex="1"
                    pr={{ base: 2, md: 0 }}
                  >
                    {child.name}
                  </Heading>
                  {/* Show badges only on desktop */}
                  <HStack gap={2} display={{ base: "none", md: "flex" }}>
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
              <Box 
                px={{ base: 4, md: 6 }} 
                pt={{ base: 3, md: 4 }}
              >
                <VStack gap={3} align="stretch">
                  {/* Badges section - visible on mobile, hidden on desktop */}
                  <HStack 
                    gap={2} 
                    display={{ base: "flex", md: "none" }}
                    flexWrap="wrap"
                    justify="flex-start"
                  >
                    {getBadgeInfo(child).map((badge, index) => (
                      badge.type === 'icon' ? (
                        <HStack
                          key={index}
                          bg="#f4f1de"
                          border="1px solid #81b29a"
                          px={2}
                          py={1}
                          borderRadius="md"
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
                          variant="outline"
                          size="sm"
                          fontWeight="500"
                          px={2}
                          py={1}
                          borderRadius="md"
                          bg="#f4f1de"
                          borderColor="#81b29a"
                          color="#3d405b"
                          fontSize="xs"
                        >
                          {badge.label}
                        </Badge>
                      )
                    ))}
                  </HStack>

                  {/* Summary stats */}
                  <Flex 
                    direction={{ base: "column", sm: "row" }} 
                    gap={{ base: 2, sm: 4 }} 
                    align={{ base: "stretch", sm: "center" }}
                    justify="space-between"
                  >
                    <HStack gap={{ base: 2, md: 4 }} flexWrap="wrap">
                      {/* Users count */}
                      <HStack gap={1} align="center">
                        <Icon color="#3d405b" boxSize={{ base: 3, md: 4 }}>
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                          </svg>
                        </Icon>
                        {summariesLoading ? (
                          <Skeleton 
                            height="16px" 
                            width="60px" 
                            borderRadius="sm" 
                            variant="shine"
                            css={{
                              "--start-color": "#e07a5f",
                              "--end-color": "#81b29a",
                            }}
                          />
                        ) : (
                          <Text fontSize={{ base: "xs", md: "sm" }} color="#3d405b" fontWeight="500">
                            {childSummaries[child.id]?.usersCount || 0} voksne
                          </Text>
                        )}
                      </HStack>

                      {/* Tools count */}
                      <HStack gap={1} align="center">
                        <Icon color="rgb(129, 178, 154)" boxSize={{ base: 3, md: 4 }}>
                          <PocketKnife />
                        </Icon>
                        {summariesLoading ? (
                          <Skeleton 
                            height="16px" 
                            width="70px" 
                            borderRadius="sm" 
                            variant="shine"
                            css={{
                              "--start-color": "#3d405b",
                              "--end-color": "#f2cc8f",
                            }}
                          />
                        ) : (
                          <Text fontSize={{ base: "xs", md: "sm" }} color="#3d405b" fontWeight="500">
                            {childSummaries[child.id]?.barometersCount || 0} værktøjer
                          </Text>
                        )}
                      </HStack>

                      {/* Recent activity */}
                      {summariesLoading ? (
                        <HStack gap={1} align="center">
                          <Skeleton 
                            height="16px" 
                            width="16px" 
                            borderRadius="full" 
                            variant="shine"
                            css={{
                              "--start-color": "#f2cc8f",
                              "--end-color": "#e07a5f",
                            }}
                          />
                          <Skeleton 
                            height="16px" 
                            width="50px" 
                            borderRadius="sm" 
                            variant="shine"
                            css={{
                              "--start-color": "#81b29a",
                              "--end-color": "#f2cc8f",
                            }}
                          />
                        </HStack>
                      ) : (
                        (childSummaries[child.id]?.recentEntriesCount || 0) > 0 && (
                          <HStack gap={1} align="center">
                            <Icon color="#f2cc8f" boxSize={{ base: 3, md: 4 }}>
                              <svg fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                              </svg>
                            </Icon>
                            <Text fontSize={{ base: "xs", md: "sm" }} color="#3d405b" fontWeight="500">
                              {childSummaries[child.id]?.recentEntriesCount} nye
                            </Text>
                          </HStack>
                        )
                      )}
                    </HStack>
                  </Flex>
                </VStack>
              </Box>

              {/* Divider */}
              <Box height="1px" bg="#e5e5e5" />

              {/* Footer section with action buttons */}
              <Box px={{ base: 4, md: 6 }} py={{ base: 3, md: 4 }}>
                <HStack gap={{ base: 2, md: 3 }} justify="flex-end">
                  <Button
                    size={{ base: "sm", md: "md" }}
                    bg="#81b29a"
                    color="white"
                    variant="solid"
                    onClick={() => router.push(`/${child.slug}`)}
                    fontWeight="500"
                    px={{ base: 4, md: 6 }}
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
                          size={{ base: "sm", md: "md" }}
                          borderColor="#e07a5f"
                          color="#e07a5f"
                          variant="outline"
                          fontWeight="500"
                          p={{ base: 1.5, md: 2 }}
                          borderRadius="full"
                          _hover={{
                            bg: "#e07a5f",
                            color: "white"
                          }}
                          transition="all 0.2s ease"
                          aria-label="Slet barn"
                        >
                          <Icon boxSize={{ base: 3, md: 4 }}>
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
              </Box>
            </Card.Body>
          </Card.Root>
        ))}
      </VStack>
    </Box>
  );
}
