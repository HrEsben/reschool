"use client";

import { Box, Text } from '@chakra-ui/react';
import { ToggleTip } from '@/components/ui/toggle-tip';
import { Eye } from 'lucide-react';

interface AccessUser {
  user_id: number;
  display_name: string;
  email: string;
}

interface VisibilityBadgeProps {
  isPublic?: boolean;
  accessUsers?: AccessUser[];
  onOpenChange?: (open: boolean) => void;
  fetchAccessData?: () => void;
  accessDataLoaded?: boolean;
}

export function VisibilityBadge({ 
  isPublic, 
  accessUsers = [], 
  onOpenChange, 
  fetchAccessData,
  accessDataLoaded = false 
}: VisibilityBadgeProps) {
  
  const getToggleTipContent = () => {
    if (isPublic) {
      return (
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="gray.700">Alle voksne</Text>
          <Text fontSize="xs" color="gray.500">Alle voksne tilknyttet barnet kan se dette værktøj</Text>
        </Box>
      );
    }

    if (!accessDataLoaded) {
      return (
        <Text fontSize="sm" color="gray.600">Indlæser adgangsoplysninger...</Text>
      );
    }

    if (accessUsers.length === 0) {
      return (
        <Box>
          <Text fontSize="sm" fontWeight="medium" color="gray.700">Kun dig</Text>
          <Text fontSize="xs" color="gray.500">Kun du kan se dette værktøj</Text>
        </Box>
      );
    }

    const maxShow = 5;
    const showUsers = accessUsers.slice(0, maxShow);
    const remaining = accessUsers.length - maxShow;

    return (
      <Box>
        <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>Har adgang:</Text>
        {showUsers.map((user, index) => (
          <Text key={index} fontSize="xs" color="gray.600">{user.display_name}</Text>
        ))}
        {remaining > 0 && (
          <Text fontSize="xs" color="gray.500">+{remaining} flere</Text>
        )}
      </Box>
    );
  };

  const handleOpenChange = (details: { open: boolean }) => {
    if (details.open && fetchAccessData) {
      fetchAccessData();
    }
    if (onOpenChange) {
      onOpenChange(details.open);
    }
  };

  return (
    <ToggleTip 
      content={getToggleTipContent()}
      onOpenChange={handleOpenChange}
      positioning={{ placement: "bottom" }}
    >
      <Box
        as="button"
        px={2}
        py={1}
        borderRadius="md"
        bg="gray.100"
        color="gray.700"
        border="1px solid"
        borderColor="gray.200"
        fontSize="xs"
        fontWeight="medium"
        cursor="help"
        _hover={{ bg: "gray.200", borderColor: "gray.300" }}
        display="flex"
        alignItems="center"
        gap={1}
      >
        <Eye size={12} />
        <Text>Alle</Text>
      </Box>
    </ToggleTip>
  );
}
