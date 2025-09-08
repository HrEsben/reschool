"use client";

import { Box, Heading, VStack } from "@chakra-ui/react";
import { ChildrenManager } from "@/components/children/children-manager";
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout";

export default function Dashboard() {
  return (
    <AuthenticatedLayout>
      <Box p={8}>
        {/* Welcome Section */}
        <VStack gap={6} align="stretch" maxW="4xl" mx="auto">
          <Box>
            <Heading size="xl" className="text-delft-blue-500" mb={2} fontWeight="700">
              Børn i forløb
            </Heading>
            <Box className="w-16 h-1 bg-cambridge-blue-500 rounded-full"></Box>
          </Box>
          
          {/* Child Management Section */}
          <ChildrenManager />
        </VStack>
      </Box>
    </AuthenticatedLayout>
  );
}
