'use client';

import { Box, Skeleton, VStack, HStack } from '@chakra-ui/react';

interface LoadingSkeletonProps {
  type?: 'page' | 'table' | 'card' | 'list';
  lines?: number;
}

export function LoadingSkeleton({ type = 'page', lines = 3 }: LoadingSkeletonProps) {
  if (type === 'table') {
    return (
      <VStack gap={2} align="stretch">
        <HStack gap={4}>
          <Skeleton height="20px" width="100px" />
          <Skeleton height="20px" width="150px" />
          <Skeleton height="20px" width="80px" />
          <Skeleton height="20px" width="120px" />
        </HStack>
        {Array.from({ length: lines }).map((_, i) => (
          <HStack key={i} gap={4}>
            <Skeleton height="16px" width="100px" />
            <Skeleton height="16px" width="150px" />
            <Skeleton height="16px" width="80px" />
            <Skeleton height="16px" width="120px" />
          </HStack>
        ))}
      </VStack>
    );
  }

  if (type === 'card') {
    return (
      <Box p={6} borderRadius="lg" border="1px solid" borderColor="gray.200">
        <VStack gap={3} align="stretch">
          <Skeleton height="24px" width="200px" />
          <Skeleton height="16px" width="100%" />
          <Skeleton height="16px" width="80%" />
          <HStack gap={2} mt={4}>
            <Skeleton height="32px" width="80px" />
            <Skeleton height="32px" width="80px" />
          </HStack>
        </VStack>
      </Box>
    );
  }

  if (type === 'list') {
    return (
      <VStack gap={3} align="stretch">
        {Array.from({ length: lines }).map((_, i) => (
          <HStack key={i} gap={3}>
            <Skeleton height="40px" width="40px" borderRadius="full" />
            <VStack align="start" flex={1} gap={1}>
              <Skeleton height="16px" width="60%" />
              <Skeleton height="14px" width="40%" />
            </VStack>
          </HStack>
        ))}
      </VStack>
    );
  }

  // Default page skeleton
  return (
    <VStack gap={4} align="stretch" p={4}>
      <Skeleton height="32px" width="300px" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height="20px" width={`${90 - i * 10}%`} />
      ))}
      <HStack gap={3} mt={6}>
        <Skeleton height="40px" width="100px" />
        <Skeleton height="40px" width="80px" />
      </HStack>
    </VStack>
  );
}

// Optimized loading component with reduced animations for better performance
export function FastLoadingSkeleton() {
  return (
    <Box className="loading-skeleton" height="20px" borderRadius="md" />
  );
}