"use client";

import { Box, Skeleton, VStack, Card } from '@chakra-ui/react';
import { usePendingInvitations } from '@/lib/queries';
import { useChildren } from '@/lib/queries';

interface DashboardLoadingProps {
  children: React.ReactNode;
}

export function DashboardLoading({ children }: DashboardLoadingProps) {
  const { isLoading: invitationsLoading } = usePendingInvitations();
  const { isLoading: childrenLoading } = useChildren();

  // Show coordinated loading skeleton for initial load
  if (invitationsLoading && childrenLoading) {
    return (
      <VStack gap={6} align="stretch" maxW="4xl" mx="auto">
        {/* Welcome Section Skeleton */}
        <Box>
          <Skeleton height="40px" width="200px" mb={2} />
          <Skeleton height="4px" width="64px" borderRadius="full" />
        </Box>
        
        {/* Invitations Section Skeleton */}
        <Card.Root className="bg-amber-50 border-l-4 border-l-amber-400 border-t border-r border-b border-amber-200" borderRadius="xl">
          <Card.Header>
            <Box>
              <Skeleton height="24px" width="180px" mb={2} />
              <Skeleton height="16px" width="120px" />
            </Box>
          </Card.Header>
          <Card.Body pt={0}>
            <VStack gap={3}>
              {[1, 2].map((i) => (
                <Card.Root key={i} bg="white" borderRadius="lg" width="100%">
                  <Card.Body>
                    <Box>
                      <Skeleton height="20px" width="60%" mb={2} />
                      <Skeleton height="16px" width="40%" mb={3} />
                      <Box display="flex" gap={2}>
                        <Skeleton height="32px" width="80px" />
                        <Skeleton height="32px" width="80px" />
                      </Box>
                    </Box>
                  </Card.Body>
                </Card.Root>
              ))}
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Children Section Skeleton */}
        <Card.Root className="bg-white border-l-4 border-l-cambridge-blue-500 border-t border-r border-b border-eggshell-300" borderRadius="xl">
          <Card.Header>
            <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
              <Box flex={1} />
              <Skeleton height="40px" width="120px" />
            </Box>
          </Card.Header>
          <Card.Body pt={0}>
            <VStack gap={4}>
              {[1, 2, 3].map((i) => (
                <Box key={i} width="100%" p={4} border="1px solid" borderColor="gray.200" borderRadius="lg">
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box flex={1}>
                      <Skeleton height="24px" width="50%" mb={2} />
                      <Skeleton height="16px" width="30%" />
                    </Box>
                    <Skeleton height="40px" width="100px" />
                  </Box>
                </Box>
              ))}
            </VStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    );
  }

  // Once data starts loading, show the actual components
  return <>{children}</>;
}
