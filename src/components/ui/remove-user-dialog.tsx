"use client";

import {
  Button,
  Dialog,
  HStack,
  Text,
  VStack,
  Icon,
  Box
} from '@chakra-ui/react';

interface RemoveUserDialogProps {
  trigger: React.ReactElement;
  userName: string;
  userEmail: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function RemoveUserDialog({
  trigger,
  userName,
  userEmail,
  onConfirm,
  isLoading = false
}: RemoveUserDialogProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {trigger}
      </Dialog.Trigger>

      <Dialog.Backdrop />

      <Dialog.Positioner>
        <Dialog.Content 
          maxW="md" 
          bg="white"
          borderRadius="xl"
          border="1px solid"
          borderColor="border.muted"
          p={0}
          overflow="hidden"
        >
          {/* Header */}
          <Box
            bg="linear-gradient(135deg, #e07a5f 0%, #f2cc8f 100%)"
            p={6}
            borderTopRadius="xl"
          >
            <HStack gap={3} align="center">
              <Icon boxSize={6} color="white">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </Icon>
              <Dialog.Title
                fontSize="xl"
                fontWeight="700"
                color="white"
                m={0}
              >
                Fjern bruger
              </Dialog.Title>
            </HStack>
          </Box>

          {/* Content */}
          <VStack p={6} gap={4} align="stretch">
            <Text color="fg.default" fontSize="md" lineHeight="1.6">
              Er du sikker på, at du vil fjerne{' '}
              <Text as="span" fontWeight="600" color="#3d405b">
                {userName || userEmail}
              </Text>{' '}
              fra dette barn?
            </Text>
            
            <Text color="fg.muted" fontSize="sm">
              Brugeren vil ikke længere have adgang til barnets profil og data.
            </Text>

            <HStack justify="end" gap={3} pt={4}>
              <Dialog.CloseTrigger asChild>
                <Button
                  variant="outline"
                  size="md"
                  _hover={{
                    bg: "rgba(244, 241, 222, 0.8)",
                    borderColor: "#81b29a"
                  }}
                  color="#3d405b"
                  borderColor="border.muted"
                >
                  Annuller
                </Button>
              </Dialog.CloseTrigger>
              
              <Dialog.CloseTrigger asChild>
                <Button
                  bg="#e07a5f"
                  color="white"
                  size="md"
                  _hover={{
                    bg: "#d16850"
                  }}
                  onClick={onConfirm}
                  loading={isLoading}
                  loadingText="Fjerner..."
                >
                  Fjern bruger
                </Button>
              </Dialog.CloseTrigger>
            </HStack>
          </VStack>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
