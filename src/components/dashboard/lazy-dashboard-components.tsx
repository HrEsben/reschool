import dynamic from 'next/dynamic';
import { Skeleton, VStack, Box } from '@chakra-ui/react';

// Loading components for better UX
const ChildrenManagerSkeleton = () => (
  <VStack gap={4} align="stretch">
    <Skeleton height="40px" />
    <Skeleton height="200px" />
    <Skeleton height="120px" />
  </VStack>
);

const InvitationManagerSkeleton = () => (
  <VStack gap={4} align="stretch">
    <Skeleton height="30px" width="200px" />
    <Skeleton height="100px" />
  </VStack>
);

const LatestRegistrationsSkeleton = () => (
  <VStack gap={3} align="stretch">
    <Skeleton height="24px" width="150px" />
    {Array.from({ length: 5 }).map((_, i) => (
      <Box key={i} p={3} borderWidth="1px" borderRadius="md">
        <Skeleton height="20px" mb={2} />
        <Skeleton height="16px" width="60%" />
      </Box>
    ))}
  </VStack>
);

// Lazy-loaded dashboard components
export const LazyChildrenManager = dynamic(
  () => import('@/components/children/children-manager').then(mod => ({ default: mod.ChildrenManager })),
  {
    loading: () => <ChildrenManagerSkeleton />,
    ssr: false,
  }
);

export const LazyInvitationManager = dynamic(
  () => import('@/components/invitations/invitation-manager').then(mod => ({ default: mod.InvitationManager })),
  {
    loading: () => <InvitationManagerSkeleton />,
    ssr: false,
  }
);

export const LazyLatestRegistrations = dynamic(
  () => import('@/components/dashboard/latest-registrations').then(mod => ({ default: mod.LatestRegistrations })),
  {
    loading: () => <LatestRegistrationsSkeleton />,
    ssr: false,
  }
);
