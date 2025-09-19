"use client";

import { useParams } from 'next/navigation';
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Skeleton,
  HStack,
  Icon
} from '@chakra-ui/react';
import { IoArrowBack } from 'react-icons/io5';
import Link from 'next/link';
import { AuthenticatedLayout } from '@/components/layouts/authenticated-layout';
import { ProgressTimeline } from '@/components/progress/progress-timeline';
import { useChildBySlug } from '@/lib/queries';

export default function ProgressPage() {
  const params = useParams();
  
  const slug = params.slug as string;

  // Use React Query hooks
  const { data: childData, isLoading: loading, error: queryError } = useChildBySlug(slug);

  // Convert query error to string for display
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Der opstod en fejl') : null;

  if (loading) {
    return (
      <AuthenticatedLayout>
        <Box w="full" maxW="7xl" mx="auto" px={4} py={8}>
          <VStack align="start" gap={6}>
            <Skeleton height="40px" width="300px" />
            <Skeleton height="20px" width="500px" />
            <Box w="full">
              <Skeleton height="200px" width="full" />
            </Box>
          </VStack>
        </Box>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <Box w="full" maxW="7xl" mx="auto" px={4} py={8}>
          <VStack align="center" gap={4}>
            <Text color="red.500" fontSize="lg">
              {error}
            </Text>
            <Link href="/dashboard">
              <Button>
                Tilbage til dashboard
              </Button>
            </Link>
          </VStack>
        </Box>
      </AuthenticatedLayout>
    );
  }

  if (!childData) {
    return (
      <AuthenticatedLayout>
        <Box w="full" maxW="7xl" mx="auto" px={4} py={8}>
          <VStack align="center" gap={4}>
            <Text fontSize="lg">
              Barnet blev ikke fundet
            </Text>
            <Link href="/dashboard">
              <Button>
                Tilbage til dashboard
              </Button>
            </Link>
          </VStack>
        </Box>
      </AuthenticatedLayout>
    );
  }

  const { child } = childData;

  return (
    <AuthenticatedLayout>
      <Box w="full" maxW="7xl" mx="auto" px={4} py={8}>
        <VStack align="start" gap={6} w="full">
          {/* Header with navigation */}
          <HStack justify="space-between" w="full">
            <VStack align="start" gap={2}>
              <Link href={`/${slug}`}>
                <Button
                  variant="ghost"
                  size="sm"
                >
                  <Icon as={IoArrowBack} mr={2} />
                  Tilbage til {child.name}
                </Button>
              </Link>
              <Heading size="xl">
                Fremdrift for {child.name}
              </Heading>
              <Text color="gray.600">
                Oversigt over indsatstrappe-forløb og værktøjsdata
              </Text>
            </VStack>
          </HStack>

          {/* Progress Timeline */}
          <Box w="full">
            <ProgressTimeline 
              childId={child.id}
            />
          </Box>
        </VStack>
      </Box>
    </AuthenticatedLayout>
  );
}