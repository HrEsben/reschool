"use client";

import { 
  Box, 
  VStack, 
  Text, 
  HStack, 
  Badge, 
  Skeleton,
  Icon,
  Card,
  Heading,
  Button
} from '@chakra-ui/react';
import { useLatestRegistrations, RegistrationEntry } from '@/lib/queries';
import { OpenMojiEmoji } from '@/components/ui/openmoji-emoji';
import { useState } from 'react';

interface LatestRegistrationsProps {
  limit?: number;
}

function RegistrationItem({ registration }: { registration: RegistrationEntry }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        return diffInMinutes < 1 ? 'Lige nu' : `${diffInMinutes} min siden`;
      }
      return `${diffInHours} time${diffInHours > 1 ? 'r' : ''} siden`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) {
        return `${diffInDays} dag${diffInDays > 1 ? 'e' : ''} siden`;
      }
      return date.toLocaleDateString('da-DK', { 
        day: 'numeric', 
        month: 'short',
        year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getRelationDisplayName = (relation: string, customName?: string): string => {
    if (customName) return customName;
    
    const relationMap: { [key: string]: string } = {
      'mor': 'Mor',
      'far': 'Far',
      'stepmor': 'Stedmor',
      'stepfar': 'Stedfar',
      'bedsteforælder': 'Bedsteforælder',
      'værge': 'Værge',
      'pædagog': 'Pædagog',
      'anden': 'Anden'
    };
    return relationMap[relation] || relation;
  };

  const typeConfig = {
    barometer: {
      color: 'sage',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
      label: 'Barometer'
    },
    smiley: {
      color: 'orange',
      icon: (
        <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" />
        </svg>
      ),
      label: 'Dagens smiley'
    }
  };

  const config = typeConfig[registration.type];

  return (
    <>
      {/* Desktop Card Layout */}
      <Card.Root 
        size="sm" 
        variant="outline" 
        width="100%" 
        maxW="100%" 
        overflow="hidden"
        display={{ base: "none", lg: "block" }}
      >
        <Card.Body p={4}>
          <VStack gap={3} align="stretch" width="100%" maxW="100%">
            <HStack justify="space-between" align="start">
              <VStack align="start" gap={1} flex={1} minW={0}>
                <HStack gap={2} align="center">
                  <Icon color={`${config.color}.500`}>
                    {config.icon}
                  </Icon>
                  <Badge variant="subtle" colorScheme={config.color} size="sm">
                    {config.label}
                  </Badge>
                </HStack>
                <Text fontSize="sm" fontWeight="medium" color="gray.900" lineClamp={1} wordBreak="break-word">
                  {registration.toolName}
                </Text>
                <HStack gap={2} fontSize="xs" color="gray.600" minW={0} width="100%">
                  <Text lineClamp={1} wordBreak="break-word">{registration.childName}</Text>
                  <Text>•</Text>
                  <Text>{formatDate(registration.createdAt)}</Text>
                </HStack>
              </VStack>
            </HStack>

            {registration.type === 'barometer' && (
              <VStack gap={2} align="stretch">
                <HStack gap={2} align="center">
                  <Text fontSize="sm" color="gray.600">Værdi:</Text>
                  <Badge variant="solid" colorScheme="sage">
                    {registration.rating}
                  </Badge>
                </HStack>
                {registration.comment && (
                  <Text fontSize="sm" color="gray.700" bg="gray.50" p={2} borderRadius="md" wordBreak="break-word" lineClamp={3}>
                    &ldquo;{registration.comment}&rdquo;
                  </Text>
                )}
              </VStack>
            )}

            {registration.type === 'smiley' && (
              <VStack gap={2} align="stretch">
                <HStack gap={2} align="center">
                  <Text fontSize="sm" color="gray.600">Smiley:</Text>
                  {registration.selectedEmoji && (
                    <OpenMojiEmoji unicode={registration.selectedEmoji} size={20} />
                  )}
                </HStack>
                {registration.reasoning && (
                  <Text fontSize="sm" color="gray.700" bg="gray.50" p={2} borderRadius="md" wordBreak="break-word" lineClamp={3}>
                    &ldquo;{registration.reasoning}&rdquo;
                  </Text>
                )}
              </VStack>
            )}

            {registration.recordedByName && (
              <HStack gap={1} fontSize="xs" color="gray.500">
                <Text>Registreret af</Text>
                <Text fontWeight="medium">{registration.recordedByName}</Text>
                {registration.userRelation && (
                  <>
                    <Text>•</Text>
                    <Text>{getRelationDisplayName(registration.userRelation, registration.customRelationName)}</Text>
                  </>
                )}
              </HStack>
            )}
          </VStack>
        </Card.Body>
      </Card.Root>

      {/* Mobile Layout - No Card, with padding */}
      <Box 
        display={{ base: "block", lg: "none" }}
        p={4}
        bg="gray.50"
        borderRadius="md"
        width="100%" 
        maxW="100%" 
        overflow="hidden"
      >
        <VStack gap={3} align="stretch" width="100%" maxW="100%">
          <HStack justify="space-between" align="start">
            <VStack align="start" gap={1} flex={1} minW={0}>
              <HStack gap={2} align="center">
                <Icon color={`${config.color}.500`}>
                  {config.icon}
                </Icon>
                <Badge variant="subtle" colorScheme={config.color} size="sm">
                  {config.label}
                </Badge>
              </HStack>
              <Text fontSize="sm" fontWeight="medium" color="gray.900" lineClamp={1} wordBreak="break-word">
                {registration.toolName}
              </Text>
              <HStack gap={2} fontSize="xs" color="gray.600" minW={0} width="100%">
                <Text lineClamp={1} wordBreak="break-word">{registration.childName}</Text>
                <Text>•</Text>
                <Text>{formatDate(registration.createdAt)}</Text>
              </HStack>
            </VStack>
          </HStack>

          {registration.type === 'barometer' && (
            <VStack gap={2} align="stretch">
              <HStack gap={2} align="center">
                <Text fontSize="sm" color="gray.600">Værdi:</Text>
                <Badge variant="solid" colorScheme="sage">
                  {registration.rating}
                </Badge>
              </HStack>
              {registration.comment && (
                <Text fontSize="sm" color="gray.700" bg="white" p={2} borderRadius="md" wordBreak="break-word" lineClamp={3}>
                  &ldquo;{registration.comment}&rdquo;
                </Text>
              )}
            </VStack>
          )}

          {registration.type === 'smiley' && (
            <VStack gap={2} align="stretch">
              <HStack gap={2} align="center">
                <Text fontSize="sm" color="gray.600">Smiley:</Text>
                {registration.selectedEmoji && (
                  <OpenMojiEmoji unicode={registration.selectedEmoji} size={20} />
                )}
              </HStack>
              {registration.reasoning && (
                <Text fontSize="sm" color="gray.700" bg="white" p={2} borderRadius="md" wordBreak="break-word" lineClamp={3}>
                  &ldquo;{registration.reasoning}&rdquo;
                </Text>
              )}
            </VStack>
          )}

          {registration.recordedByName && (
            <HStack gap={1} fontSize="xs" color="gray.500">
              <Text>Registreret af</Text>
              <Text fontWeight="medium">{registration.recordedByName}</Text>
              {registration.userRelation && (
                <>
                  <Text>•</Text>
                  <Text>{getRelationDisplayName(registration.userRelation, registration.customRelationName)}</Text>
                </>
              )}
            </HStack>
          )}
        </VStack>
      </Box>
    </>
  );
}

function SkeletonItem() {
  return (
    <Card.Root size="sm" variant="outline">
      <Card.Body p={4}>
        <VStack gap={3} align="stretch">
          <HStack justify="space-between">
            <VStack align="start" gap={1} flex={1}>
              <HStack gap={2}>
                <Skeleton height="20px" width="20px" />
                <Skeleton height="20px" width="60px" />
              </HStack>
              <Skeleton height="16px" width="200px" />
              <Skeleton height="12px" width="120px" />
            </VStack>
          </HStack>
          <Skeleton height="40px" width="100%" />
        </VStack>
      </Card.Body>
    </Card.Root>
  );
}

export function LatestRegistrations({ limit = 10 }: LatestRegistrationsProps) {
  const [showAll, setShowAll] = useState(false);
  const { data, isLoading, error } = useLatestRegistrations(showAll ? 20 : limit);
  
  const displayLimit = showAll ? 20 : limit;
  const registrations = data?.registrations || [];
  const displayedRegistrations = registrations.slice(0, displayLimit);
  const hasMore = registrations.length > limit && !showAll;

  if (error) {
    return (
      <Box p={4} bg="red.50" borderRadius="md" border="1px solid" borderColor="red.200">
        <Text color="red.700" fontSize="sm">
          Der opstod en fejl ved indlæsning af registreringer
        </Text>
      </Box>
    );
  }

  return (
    <VStack gap={4} align="stretch" width="100%" maxW="100%" overflow="hidden">
      <Box>
        <Heading size="xl" className="text-delft-blue-500" mb={2} fontWeight="700">
          Seneste registreringer
        </Heading>
        <Box className="w-16 h-1 bg-cambridge-blue-500 rounded-full"></Box>
      </Box>

      {isLoading ? (
        <VStack gap={3} align="stretch">
          {Array.from({ length: limit }).map((_, index) => (
            <SkeletonItem key={index} />
          ))}
        </VStack>
      ) : displayedRegistrations.length === 0 ? (
        <Card.Root variant="outline">
          <Card.Body p={6} textAlign="center">
            <VStack gap={2}>
              <Icon fontSize="2xl" color="gray.400">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
              </Icon>
              <Text color="gray.600" fontSize="sm">
                Ingen registreringer at vise endnu
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>
      ) : (
        <VStack gap={3} align="stretch">
          {displayedRegistrations.map((registration: RegistrationEntry) => (
            <RegistrationItem key={`${registration.type}-${registration.id}`} registration={registration} />
          ))}
          
          {hasMore && (
            <Box textAlign="center" pt={2}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(true)}
                color="sage.600"
                _hover={{ bg: "sage.50" }}
              >
                Vis flere registreringer
              </Button>
            </Box>
          )}
        </VStack>
      )}
    </VStack>
  );
}
