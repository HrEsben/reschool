"use client";

import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Box, Spinner, Text } from "@chakra-ui/react";
import { AppLayout } from "@/components/ui/app-layout";
import { CollectNameDialog } from "@/components/ui/collect-name-dialog";

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const user = useUser();
  const router = useRouter();
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [isCheckingName, setIsCheckingName] = useState(true);

  useEffect(() => {
    if (user === null) {
      router.push("/");
    } else if (user && isCheckingName) {
      // Check if user has a display name
      if (!user.displayName) {
        setShowNameDialog(true);
      }
      setIsCheckingName(false);
    }
  }, [user, router, isCheckingName]);

  const handleNameComplete = async () => {
    setShowNameDialog(false);
    // The dialog already handles updating the user and syncing to database
    // Force a page reload to ensure the updated user data is used
    window.location.reload();
  };

  // Show loading state while checking authentication
  if (user === undefined || isCheckingName) {
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
    <>
      <CollectNameDialog 
        isOpen={showNameDialog} 
        onComplete={handleNameComplete} 
      />
      <AppLayout>
        {children}
      </AppLayout>
    </>
  );
}
