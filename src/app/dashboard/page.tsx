"use client";

import { Box, Heading, VStack, Grid } from "@chakra-ui/react";
import { ChildrenManager } from "@/components/children/children-manager";
import { InvitationManager } from "@/components/invitations/invitation-manager";
import { LatestRegistrations } from "@/components/dashboard/latest-registrations";
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout";
import { DashboardLoading } from "@/components/layouts/dashboard-loading";

export default function Dashboard() {
  return (
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
                <Box>
                  <Heading size="xl" className="text-delft-blue-500" mb={2} fontWeight="700">
                    Børn
                  </Heading>
                  <Box className="w-16 h-1 bg-cambridge-blue-500 rounded-full"></Box>
                </Box>
                
                {/* Pending Invitations Section */}
                <InvitationManager />
                
                {/* Child Management Section */}
                <ChildrenManager />

                {/* Latest Registrations on Mobile */}
                <Box display={{ base: "block", lg: "none" }}>
                  <LatestRegistrations limit={8} />
                </Box>
              </VStack>

              {/* Right Column - Latest Registrations on Desktop */}
              <Box display={{ base: "none", lg: "block" }} position="sticky" top="8">
                <LatestRegistrations limit={8} />
              </Box>
            </Grid>
          </Box>
        </DashboardLoading>
      </Box>
    </AuthenticatedLayout>
  );
}
