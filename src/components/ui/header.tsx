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
      zIndex={100}
      width="100%"
    >
      <HStack justify="space-between" maxW="7xl" mx="auto" position="relative">
        <Heading size="lg" color="blue.600">
          ReSchool
        </Heading>
        
        <Box position="relative">
          {user && <UserAvatar />}
        </Box>
      </HStack>
    </Box>
  );
}
