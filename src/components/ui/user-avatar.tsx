"use client";

import { 
  Button, 
  HStack,
  Text,
  VStack,
  MenuRoot,
  MenuTrigger,
  MenuContent,
  MenuItem
} from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
import { useUser } from "@stackframe/stack";

interface UserAvatarProps {
  // We'll get the user from the hook instead of props
}

export function UserAvatar({}: UserAvatarProps = {}) {
  const user = useUser();

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
    <MenuRoot>
      <MenuTrigger asChild>
        <Button 
          variant="ghost" 
          p={2}
          h="auto"
          _hover={{ bg: "gray.100" }}
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
      
      <MenuContent>
        <MenuItem 
          value="logout"
          onClick={() => user.signOut()}
          color="red.600"
          _hover={{ bg: "red.50" }}
        >
          Log ud
        </MenuItem>
      </MenuContent>
    </MenuRoot>
  );
}
