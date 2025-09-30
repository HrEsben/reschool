"use client";

import { Box, Heading, VStack, Grid, HStack } from "@chakra-ui/react";
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout";
import { DashboardLoading } from "@/components/layouts/dashboard-loading";
import { 
  LazyChildrenManager, 
  LazyInvitationManager, 
  LazyLatestRegistrations,
  LazyAddChildForm
} from "@/components/dashboard/lazy-dashboard-components";
import { BfcacheOptimizer } from "@/hooks/use-bfcache-optimization";

export default function Dashboard() {
  return (
    <BfcacheOptimizer>
      <AuthenticatedLayout>
      <Box p={{ base: 4, md: 8 }}>
        <DashboardLoading>
          {/* Main Content */}
          <Box maxW="7xl" mx="auto">
            <Grid 
              templateColumns={{ base: "1fr", lg: "1fr 400px" }} 
              gap={{ base: 8, lg: 12 }}
              alignItems="start"
            >
              {/* Left Column - Main Content */}
              <VStack gap={6} align="stretch">
                <HStack justify="space-between" align="center">
                  <Box>
                    <Heading size="xl" className="text-delft-blue-500" mb={2} fontWeight="700">
                      Børn
                    </Heading>
                    <Box className="w-16 h-1 bg-cambridge-blue-500 rounded-full"></Box>
                  </Box>
                  <LazyAddChildForm onChildAdded={() => {
                    // React Query will automatically refetch and update the cache
                  }} />
                </HStack>
                
                {/* Pending Invitations Section */}
                <LazyInvitationManager />
                
                {/* Child Management Section */}
                <LazyChildrenManager />

                {/* Latest Registrations on Mobile */}
                <Box 
                  display={{ base: "block", lg: "none" }}
                  overflow="hidden"
                  width="100%"
                  px={4}
                >
                  <LazyLatestRegistrations limit={5} />
                </Box>
              </VStack>

              {/* Right Column - Latest Registrations on Desktop */}
              <Box 
                display={{ base: "none", lg: "block" }} 
                position="sticky" 
                top="8"
                overflow="hidden"
                width="100%"
              >
                <LazyLatestRegistrations limit={5} />
              </Box>
            </Grid>
          </Box>
        </DashboardLoading>
      </Box>
    </AuthenticatedLayout>
    </BfcacheOptimizer>
  );
}
