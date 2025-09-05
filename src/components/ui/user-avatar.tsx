"use client";

import { 
  Button, 
  HStack,
  Text,
  VStack,
  Box,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem
} from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";

export function UserAvatar() {
  const user = useUser();
  const router = useRouter();

  if (!user) return null;

  // Generate initials from display name or email
  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const initials = getInitials(user.displayName, user.primaryEmail);
  const displayName = user.displayName || user.primaryEmail || 'Bruger';

  return (
    <MenuRoot positioning={{ placement: "bottom-end" }}>
      <MenuTrigger asChild>
        <Button 
          variant="ghost" 
          p={2}
          h="auto"
          borderRadius="full"
          _hover={{ bg: "gray.50" }}
          _active={{ bg: "gray.100" }}
          transition="all 0.2s"
        >
          <HStack gap={3}>
            <Avatar.Root size="sm">
              <Avatar.Image 
                src={user.profileImageUrl || undefined}
                alt={displayName}
              />
              <Avatar.Fallback>
                {initials}
              </Avatar.Fallback>
            </Avatar.Root>
            <VStack gap={0} align="start" display={{ base: "none", md: "flex" }}>
              <Text fontSize="sm" fontWeight="medium" lineHeight="1.2">
                {user.displayName || "Ingen navn"}
              </Text>
              <Text fontSize="xs" color="gray.600" lineHeight="1.2">
                {user.primaryEmail}
              </Text>
            </VStack>
          </HStack>
        </Button>
      </MenuTrigger>
      
      <MenuContent
        minW="240px"
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        boxShadow="lg"
        p={2}
        zIndex={1000}
        _focus={{ outline: "none" }}
        position="absolute"
      >
        {/* User info section */}
        <Box p={3} borderBottomWidth={1} borderColor="gray.100" mb={2}>
          <VStack gap={1} align="start">
            <Text fontSize="sm" fontWeight="semibold" color="gray.900">
              {user.displayName || "Ingen navn"}
            </Text>
            <Text fontSize="xs" color="gray.600">
              {user.primaryEmail}
            </Text>
          </VStack>
        </Box>
        
        {/* Settings option */}
        <MenuItem 
          value="settings"
          onClick={() => router.push("/settings")}
          fontSize="sm"
          borderRadius="sm"
          p={2}
          _hover={{ 
            bg: "gray.50"
          }}
          _focus={{
            bg: "gray.50"
          }}
          transition="all 0.15s"
        >
          Indstillinger
        </MenuItem>
        
        {/* Logout option */}
        <MenuItem 
          value="logout"
          onClick={() => user.signOut()}
          color="red.600"
          fontSize="sm"
          borderRadius="sm"
          p={2}
          _hover={{ 
            bg: "red.50",
            color: "red.700"
          }}
          _focus={{
            bg: "red.50",
            color: "red.700"
          }}
          transition="all 0.15s"
        >
          Log ud
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  );
}
