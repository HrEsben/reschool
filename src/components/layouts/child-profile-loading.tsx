"use client";

import { 
  Box, 
  Skeleton, 
  VStack, 
  HStack, 
  Table,
  Separator 
} from '@chakra-ui/react';
import { useChildBySlug } from '@/lib/queries';

interface ChildProfileLoadingProps {
  children: React.ReactNode;
  slug: string;
}

export function ChildProfileLoading({ children, slug }: ChildProfileLoadingProps) {
  const { isLoading: childLoading } = useChildBySlug(slug);

  // Show coordinated loading skeleton for initial load
  if (childLoading) {
    return (
      <VStack gap={6} align="stretch" maxW="4xl" mx="auto">
        {/* Child Header Skeleton */}
        <VStack align="start" gap={2}>
          <Skeleton height="40px" width="300px" mb={4} />
          <Skeleton height="4px" width="80px" borderRadius="full" />
        </VStack>

        {/* Tools Section Skeleton */}
        <Box 
          bg="bg.surface" 
          borderRadius="xl" 
          border="1px solid" 
          borderColor="border.muted" 
          p={{ base: 4, md: 6 }}
        >
          <VStack gap={4} align="stretch">
            {/* Tools Header Skeleton */}
            <HStack justify="space-between" align="center">
              <VStack align="start" gap={2}>
                <Skeleton height="28px" width="200px" />
                <Skeleton height="4px" width="64px" borderRadius="full" />
              </VStack>
              <Skeleton height="40px" width="120px" />
            </HStack>
            
            <Separator />
            
            {/* Tools Grid Skeleton */}
            <VStack gap={4}>
              {[1, 2, 3].map((i) => (
                <Box key={i} p={4} border="1px solid" borderColor="gray.200" borderRadius="lg" width="100%">
                  <VStack align="stretch" gap={3}>
                    <HStack justify="space-between" align="center">
                      <Skeleton height="20px" width="40%" />
                      <Skeleton height="32px" width="80px" />
                    </HStack>
                    <Skeleton height="60px" width="100%" />
                    <HStack gap={2}>
                      {[1, 2, 3, 4, 5].map((j) => (
                        <Skeleton key={j} height="40px" width="40px" borderRadius="full" />
                      ))}
                    </HStack>
                  </VStack>
                </Box>
              ))}
            </VStack>
          </VStack>
        </Box>

        {/* Connected Users Section Skeleton */}
        <Box 
          bg="bg.surface" 
          borderRadius="xl" 
          border="1px solid" 
          borderColor="border.muted" 
          p={{ base: 4, md: 6 }}
        >
          <VStack align="stretch" gap={4}>
            <HStack justify="space-between" align="center">
              <VStack align="start" gap={2}>
                <Skeleton height="28px" width="180px" />
                <Skeleton height="4px" width="64px" borderRadius="full" />
              </VStack>
              <Skeleton height="40px" width="100px" />
            </HStack>
            
            <Separator />

            <Table.ScrollArea borderWidth="1px" rounded="md">
              <Table.Root size={{ base: "sm", md: "md" }} variant="line" striped>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader minW="150px">
                      <Skeleton height="16px" width="60px" />
                    </Table.ColumnHeader>
                    <Table.ColumnHeader minW="200px">
                      <Skeleton height="16px" width="80px" />
                    </Table.ColumnHeader>
                    <Table.ColumnHeader minW="120px">
                      <Skeleton height="16px" width="70px" />
                    </Table.ColumnHeader>
                    <Table.ColumnHeader minW="100px">
                      <Skeleton height="16px" width="50px" />
                    </Table.ColumnHeader>
                    <Table.ColumnHeader minW="100px">
                      <Skeleton height="16px" width="60px" />
                    </Table.ColumnHeader>
                    <Table.ColumnHeader minW="120px">
                      <Skeleton height="16px" width="80px" />
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {[1, 2, 3, 4].map((i) => (
                    <Table.Row key={i}>
                      <Table.Cell>
                        <HStack gap={3}>
                          <Skeleton height="32px" width="32px" borderRadius="full" />
                          <Skeleton height="16px" width="80px" />
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>
                        <Skeleton height="16px" width="120px" />
                      </Table.Cell>
                      <Table.Cell>
                        <Skeleton height="20px" width="60px" />
                      </Table.Cell>
                      <Table.Cell>
                        <Skeleton height="20px" width="50px" />
                      </Table.Cell>
                      <Table.Cell>
                        <Skeleton height="16px" width="70px" />
                      </Table.Cell>
                      <Table.Cell>
                        <Skeleton height="32px" width="70px" />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Table.ScrollArea>
          </VStack>
        </Box>

        {/* Admin Actions Skeleton (if needed) */}
        <Box 
          bg="red.50" 
          border="1px solid" 
          borderColor="red.200" 
          borderRadius="lg" 
          p={4}
        >
          <VStack align="start" gap={3}>
            <Skeleton height="20px" width="140px" />
            <Skeleton height="16px" width="280px" />
            <Skeleton height="36px" width="100px" />
          </VStack>
        </Box>
      </VStack>
    );
  }

  // Once child data loads, show the actual components
  return <>{children}</>;
}
