"use client";

import { useState } from 'react';
import {
  Box,
  Input,
  VStack,
  Text,
  HStack,
  Button,
  Flex,
  Badge,
  Heading,
  Tabs,
  CheckboxCard,
  Textarea,
} from '@chakra-ui/react';
import { DialogManager } from '@/components/ui/dialog-manager';
import { showToast } from '@/components/ui/simple-toast';
import { useChildUsers } from '@/lib/queries';
import { UserWithRelation } from '@/lib/database-service';
import { useUser } from '@stackframe/stack';
import { SMILEY_OPTIONS } from '@/lib/openmoji';

interface CreateDagensSmileyDialogProps {
  childId: number;
  onSmileyCreated: () => void;
  trigger: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isUserAdmin?: boolean;
}

export function CreateDagensSmileyDialog({ childId, onSmileyCreated, trigger, isOpen, onOpenChange, isUserAdmin = false }: CreateDagensSmileyDialogProps) {
  const stackUser = useUser();
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Visibility control state
  const [visibilityOption, setVisibilityOption] = useState<'alle' | 'kun_mig' | 'custom'>('alle');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  
  // Fetch child users for access control selection
  const { data: childUsers = [] } = useChildUsers(childId.toString());

  const handleSubmit = async () => {
    if (!stackUser || !topic.trim()) {
      showToast({
        title: 'Fejl',
        description: 'Udfyld venligst alle påkrævede felter',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      // Determine visibility settings
      const isPublic = visibilityOption === 'alle';
      const accessibleUserIds = visibilityOption === 'custom' ? selectedUserIds : [];

      const response = await fetch(`/api/children/${childId}/dagens-smiley`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          description: description.trim() || undefined,
          isPublic,
          accessibleUserIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create dagens smiley');
      }

      showToast({
        title: 'Succes',
        description: 'Dagens smiley oprettet',
        type: 'success',
        duration: 3000,
      });

      // Reset form
      setTopic('');
      setDescription('');
      setVisibilityOption('alle');
      setSelectedUserIds([]);
      
      onSmileyCreated();
      if (onOpenChange) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error creating dagens smiley:', error);
      showToast({
        title: 'Fejl',
        description: 'Kunne ikke oprette dagens smiley',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTopic('');
    setDescription('');
    setVisibilityOption('alle');
    setSelectedUserIds([]);
    if (onOpenChange) {
      onOpenChange(false);
    }
  };

  // Visibility control handlers
  const handleVisibilityChange = (option: 'alle' | 'kun_mig' | 'custom') => {
    setVisibilityOption(option);
    if (option !== 'custom') {
      setSelectedUserIds([]);
    }
  };

  const handleUserSelection = (userId: number, checked: boolean) => {
    setSelectedUserIds(prev => 
      checked 
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  };

  const generatePreview = () => {
    return (
      <VStack gap={3} align="stretch">
        {/* Mini Smiley Tool Preview */}
        <Box 
          bg="white" 
          borderRadius="md" 
          border="1px solid" 
          borderColor="gray.200" 
          p={3}
          shadow="sm"
        >
          <VStack gap={3} align="stretch">
            {/* Header */}
            <HStack justify="space-between">
              <Heading 
                size="sm" 
                color={topic.trim() ? "black" : "gray.400"}
              >
                {topic.trim() || "Emne"}
              </Heading>
              <HStack gap={1}>
                <Badge colorScheme="blue" fontSize="xs">
                  Dagens smiley
                </Badge>
              </HStack>
            </HStack>
            
            {/* Description */}
            {description.trim() && (
              <Text fontSize="xs" color="gray.600">
                {description.trim()}
              </Text>
            )}

            {/* Emoji Selection Preview */}
            <Box>
              <Text mb={2} fontWeight="medium" fontSize="xs" color="gray.600">
                Vælg hvordan du har det i dag:
              </Text>
              <HStack gap={1} wrap="wrap">
                {SMILEY_OPTIONS.slice(0, 8).map((smiley) => (
                  <Button
                    key={smiley.unicode}
                    variant="outline"
                    size="xs"
                    minW="30px"
                    h="30px"
                    fontSize="sm"
                    cursor="default"
                    borderColor="gray.300"
                    color="gray.800"
                    _hover={{}}
                  >
                    {smiley.unicode}
                  </Button>
                ))}
                <Text fontSize="xs" color="gray.500">...</Text>
              </HStack>
            </Box>
          </VStack>
        </Box>
      </VStack>
    );
  };

  return (
    <DialogManager
      trigger={trigger}
      title="Opret dagens smiley"
      type="default"
      primaryAction={{
        label: "Opret",
        onClick: handleSubmit,
        colorScheme: "sage",
        isLoading: loading,
        loadingText: "Opretter..."
      }}
      secondaryAction={{
        label: "Annuller",
        onClick: handleCancel,
        colorScheme: "gray"
      }}
      maxWidth="4xl"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
    >
      <Tabs.Root defaultValue="indstillinger" variant="enclosed">
        <Tabs.List>
          <Tabs.Trigger value="indstillinger">Indstillinger</Tabs.Trigger>
          {isUserAdmin && (
            <Tabs.Trigger value="synlighed">Synlighed</Tabs.Trigger>
          )}
        </Tabs.List>

        <Tabs.Content value="indstillinger">
          <Flex 
            direction={{ base: "column", lg: "row" }}
            gap={{ base: 6, lg: 0 }}
            align="start"
          >
            {/* Left side - Form */}
            <VStack 
              gap={4} 
              align="stretch" 
              flex={1} 
              pr={{ base: 0, lg: 6 }}
            >
              {/* Topic Input */}
              <Box>
                <Text mb={2} fontWeight="medium">Emne *</Text>
                <Input
                  placeholder="Hvad handler det om? (f.eks. 'Hvordan har jeg det i dag?')"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  maxLength={100}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {topic.length}/100 tegn
                </Text>
              </Box>

              {/* Description Input */}
              <Box>
                <Text mb={2} fontWeight="medium">Beskrivelse</Text>
                <Textarea
                  placeholder="Uddyb gerne hvad dette værktøj skal bruges til..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {description.length}/500 tegn
                </Text>
              </Box>

              {/* Info about dagens smiley */}
              <Box p={3} bg="blue.50" borderRadius="md" border="1px solid" borderColor="blue.200">
                <Text fontSize="sm" color="blue.800" fontWeight="medium" mb={1}>
                  Om dagens smiley
                </Text>
                <Text fontSize="xs" color="blue.700">
                  Barnet vælger en smiley og kan derefter forklare hvorfor de valgte netop den smiley. 
                  Det hjælper med at sætte ord på følelser og reflektere over dagens oplevelser.
                </Text>
              </Box>
            </VStack>

            {/* Right side - Preview */}
            <Box 
              flex={1}
              pl={{ base: 0, lg: 6 }}
              minW={0}
            >
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                Forhåndsvisning:
              </Text>
              
              {generatePreview()}
            </Box>
          </Flex>
        </Tabs.Content>

        {isUserAdmin && (
          <Tabs.Content value="synlighed">
            <VStack gap={6} align="stretch">
              {/* Visibility Options */}
              <Box>
                <Text mb={3} fontWeight="medium">Hvem skal have adgang?</Text>
                <VStack gap={3} align="stretch">
                  {/* Public option */}
                  <Box
                    p={3}
                    borderRadius="md"
                    border="2px solid"
                    borderColor={visibilityOption === 'alle' ? 'sage.500' : 'gray.200'}
                    bg={visibilityOption === 'alle' ? 'sage.50' : 'white'}
                    cursor="pointer"
                    onClick={() => handleVisibilityChange('alle')}
                    _hover={{ borderColor: 'sage.300' }}
                  >
                    <HStack gap={3}>
                      <Box
                        w={4}
                        h={4}
                        borderRadius="full"
                        border="2px solid"
                        borderColor={visibilityOption === 'alle' ? 'sage.500' : 'gray.300'}
                        bg={visibilityOption === 'alle' ? 'sage.500' : 'white'}
                        position="relative"
                      >
                        {visibilityOption === 'alle' && (
                          <Box
                            position="absolute"
                            top="50%"
                            left="50%"
                            transform="translate(-50%, -50%)"
                            w={2}
                            h={2}
                            borderRadius="full"
                            bg="white"
                          />
                        )}
                      </Box>
                      <VStack gap={1} align="start">
                        <Text fontWeight="medium">Alle voksne</Text>
                        <Text fontSize="sm" color="gray.600">
                          Alle voksne tilknyttet barnet kan se og bruge dette værktøj
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  {/* Creator only option */}
                  <Box
                    p={3}
                    borderRadius="md"
                    border="2px solid"
                    borderColor={visibilityOption === 'kun_mig' ? 'sage.500' : 'gray.200'}
                    bg={visibilityOption === 'kun_mig' ? 'sage.50' : 'white'}
                    cursor="pointer"
                    onClick={() => handleVisibilityChange('kun_mig')}
                    _hover={{ borderColor: 'sage.300' }}
                  >
                    <HStack gap={3}>
                      <Box
                        w={4}
                        h={4}
                        borderRadius="full"
                        border="2px solid"
                        borderColor={visibilityOption === 'kun_mig' ? 'sage.500' : 'gray.300'}
                        bg={visibilityOption === 'kun_mig' ? 'sage.500' : 'white'}
                        position="relative"
                      >
                        {visibilityOption === 'kun_mig' && (
                          <Box
                            position="absolute"
                            top="50%"
                            left="50%"
                            transform="translate(-50%, -50%)"
                            w={2}
                            h={2}
                            borderRadius="full"
                            bg="white"
                          />
                        )}
                      </Box>
                      <VStack gap={1} align="start">
                        <Text fontWeight="medium">Kun mig</Text>
                        <Text fontSize="sm" color="gray.600">
                          Kun du kan se og bruge dette værktøj
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>

                  {/* Custom access option */}
                  <Box
                    p={3}
                    borderRadius="md"
                    border="2px solid"
                    borderColor={visibilityOption === 'custom' ? 'sage.500' : 'gray.200'}
                    bg={visibilityOption === 'custom' ? 'sage.50' : 'white'}
                    cursor="pointer"
                    onClick={() => handleVisibilityChange('custom')}
                    _hover={{ borderColor: 'sage.300' }}
                  >
                    <HStack gap={3}>
                      <Box
                        w={4}
                        h={4}
                        borderRadius="full"
                        border="2px solid"
                        borderColor={visibilityOption === 'custom' ? 'sage.500' : 'gray.300'}
                        bg={visibilityOption === 'custom' ? 'sage.500' : 'white'}
                        position="relative"
                      >
                        {visibilityOption === 'custom' && (
                          <Box
                            position="absolute"
                            top="50%"
                            left="50%"
                            transform="translate(-50%, -50%)"
                            w={2}
                            h={2}
                            borderRadius="full"
                            bg="white"
                          />
                        )}
                      </Box>
                      <VStack gap={1} align="start">
                        <Text fontWeight="medium">Udvalgte personer</Text>
                        <Text fontSize="sm" color="gray.600">
                          Vælg specifikke personer der skal have adgang
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                </VStack>
              </Box>

              {/* User Selection */}
              {visibilityOption === 'custom' && (
                <Box>
                  <Text mb={3} fontWeight="medium">Vælg personer:</Text>
                  <VStack gap={2} align="stretch" maxH="300px" overflowY="auto">
                    {childUsers.map((user: UserWithRelation) => (
                      <CheckboxCard.Root
                        key={user.id}
                        checked={selectedUserIds.includes(user.id)}
                        onCheckedChange={(checked) => handleUserSelection(user.id, !!checked.checked)}
                      >
                        <CheckboxCard.HiddenInput />
                        <CheckboxCard.Control>
                          <CheckboxCard.Indicator />
                        </CheckboxCard.Control>
                        <CheckboxCard.Content>
                          <VStack gap={1} align="start">
                            <Text fontWeight="medium">{user.displayName}</Text>
                            <HStack gap={2}>
                              <Text fontSize="sm" color="gray.600">
                                {user.customRelationName || user.relation}
                              </Text>
                              {user.isAdministrator && (
                                <Badge colorScheme="blue" size="sm">Administrator</Badge>
                              )}
                            </HStack>
                          </VStack>
                        </CheckboxCard.Content>
                      </CheckboxCard.Root>
                    ))}
                  </VStack>
                </Box>
              )}
            </VStack>
          </Tabs.Content>
        )}
      </Tabs.Root>
    </DialogManager>
  );
}
