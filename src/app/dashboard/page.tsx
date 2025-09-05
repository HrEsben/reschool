"use client";

import { useUser } from "@stackframe/stack";
import { Box, Heading, VStack } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ChildrenManager } from "@/components/children/children-manager";
import { AuthenticatedLayout } from "@/components/layouts/authenticated-layout";

export default function Dashboard() {
  const user = useUser();
  const router = useRouter();

  // Redirect based on user state
  useEffect(() => {
    if (user && (!user.displayName || user.displayName.trim() === '')) {
      // User doesn't have a name set - redirect to settings
      router.push("/settings?firstTime=true");
    }
  }, [user, router]);

  return (
    <AuthenticatedLayout>
      <Box p={8}>
        {/* Welcome Section */}
        <VStack gap={6} align="stretch" maxW="4xl" mx="auto">
          <Box>
            <Heading size="xl" className="text-delft-blue-500" mb={2} fontWeight="700">
              Dashboard
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
