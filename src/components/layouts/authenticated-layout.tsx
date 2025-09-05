"use client";

import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Box, Spinner, Text } from "@chakra-ui/react";
import { AppLayout } from "@/components/ui/app-layout";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.push("/");
    }
  }, [user, router]);

  // Show loading state while checking authentication
  if (user === undefined) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        flexDirection="column"
        gap={4}
        className="bg-eggshell-900"
      >
        <Spinner size="xl" className="text-delft-blue-500" />
        <Text className="text-delft-blue-600" fontSize="lg" fontWeight="500">
          Indlæser...
        </Text>
      </Box>
    );
  }

  // Don't render if user is not authenticated (will redirect)
  if (user === null) {
    return null;
  }

  return (
    <AppLayout>
      {children}
    </AppLayout>
  );
}
