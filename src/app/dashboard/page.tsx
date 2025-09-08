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

  // Utility function to generate user slug
  const generateUserSlug = (email: string, displayName?: string) => {
    const generateSlug = (text: string) => {
      return text.toLowerCase()
        .replace(/[æå]/g, 'a')
        .replace(/[ø]/g, 'o')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    };

    return displayName 
      ? generateSlug(displayName)
      : generateSlug(email.split('@')[0]);
  };

  // Redirect based on user state
  useEffect(() => {
    if (user && (!user.displayName || user.displayName.trim() === '')) {
      // User doesn't have a name set - sync and redirect to user profile for setup
      const syncAndRedirect = async () => {
        try {
          const syncResponse = await fetch('/api/sync-user', {
            method: 'POST',
          });
          
          if (syncResponse.ok) {
            const syncData = await syncResponse.json();
            router.push(`/users/${syncData.userSlug}?firstTime=true`);
          } else {
            // Fallback: use email-based slug if sync fails
            const userSlug = generateUserSlug(user.primaryEmail || '', user.displayName || undefined);
            router.push(`/users/${userSlug}?firstTime=true`);
          }
        } catch (error) {
          console.error('Error syncing user:', error);
          // Fallback: use email-based slug if sync fails
          const userSlug = generateUserSlug(user.primaryEmail || '', user.displayName || undefined);
          router.push(`/users/${userSlug}?firstTime=true`);
        }
      };
      
      syncAndRedirect();
    }
  }, [user, router]);

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
