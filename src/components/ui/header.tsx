"use client";

import { useUser } from "@stackframe/stack";
import { Box, HStack, Heading } from "@chakra-ui/react";
import { UserAvatar } from "./user-avatar";

export function Header() {
  const user = useUser();

  return (
    <Box 
      borderBottomWidth={1} 
      borderColor="gray.200" 
      bg="white" 
      px={8} 
      py={4}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <HStack justify="space-between" maxW="7xl" mx="auto">
        <Heading size="lg" color="blue.600">
          ReSchool
        </Heading>
        
        {user && <UserAvatar />}
      </HStack>
    </Box>
  );
}
