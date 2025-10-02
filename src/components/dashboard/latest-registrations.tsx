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
import { SimpleSmiley } from '@/components/ui/simple-smiley';
import { Thermometer, Smile, Bed } from 'lucide-react';
import { FaStairs } from 'react-icons/fa6';

interface LatestRegistrationsProps {
  limit?: number;
}

// Helper function to get the appropriate icon for each tool type (matching anchor nav)
const getToolIcon = (type: string) => {
  switch (type) {
    case 'barometer':
      return Thermometer;
    case 'smiley':
      return Smile;
    case 'sengetider':
      return Bed;
    case 'indsatstrappe':
      return FaStairs;
    default:
      return null;
  }
};

function RegistrationItem({ registration }: { registration: RegistrationEntry }) {
  // Simple component to display barometer values
  const BarometerValue = ({ rating, displayType, smileyType }: { rating: number, displayType?: string, smileyType?: string }) => {
    // Handle different display types
    if (displayType === 'percentage') {
      return <Text fontSize="sm" fontWeight="medium" color="gray.900">{rating}%</Text>;
    }
    
    if (displayType === 'numbers') {
      return <Text fontSize="sm" fontWeight="medium" color="gray.900">{rating}</Text>;
    }
    
    // For smileys display type
    if (displayType === 'smileys' && smileyType === 'simple') {
      return <SimpleSmiley value={rating} size={18} />;
    }
    
    // Default to emoji smileys
    const emojiMap: { [key: number]: string } = {
      1: '😢',
      2: '😟', 
      3: '😐',
      4: '😊',
      5: '😄'
    };
    
    return <Text fontSize="sm" fontWeight="medium" color="gray.900">{emojiMap[rating] || rating}</Text>;
  };

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

  // Color mapping for different tool types
  const getToolColor = (type: string): string => {
    switch (type) {
      case 'barometer':
        return 'sage';
      case 'smiley':
        return 'orange';
      case 'sengetider':
        return 'blue';
      case 'indsatstrappe':
        return 'purple';
      default:
        return 'gray';
    }
  };

  const toolColor = getToolColor(registration.type);

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
              <VStack align="start" gap={2} flex={1} minW={0}>
                <HStack gap={2} align="center" wrap="wrap" minW={0} width="100%">
                  {(() => {
                    const ToolIcon = getToolIcon(registration.type);
                    return ToolIcon ? (
                      <ToolIcon size={16} style={{ color: `var(--chakra-colors-${toolColor}-500)` }} />
                    ) : null;
                  })()}
                  <Text fontSize="sm" fontWeight="medium" color="gray.900" lineClamp={1} wordBreak="break-word" flex={1} minW={0}>
                    {registration.toolName}
                  </Text>
                  <Badge variant="subtle" colorScheme="gray" size="sm" flexShrink={0}>
                    {registration.childName}
                  </Badge>
                </HStack>
                <HStack gap={2} fontSize="xs" color="gray.600">
                  <Text>{formatDate(registration.createdAt)}</Text>
                </HStack>
              </VStack>
            </HStack>

            {registration.type === 'barometer' && (
              <VStack gap={2} align="stretch">
                <HStack gap={2} align="center">
                  <Text fontSize="sm" color="gray.600">Værdi:</Text>
                  {registration.rating ? (
                    <BarometerValue 
                      rating={registration.rating} 
                      displayType={registration.displayType} 
                      smileyType={registration.smileyType} 
                    />
                  ) : (
                    <Text fontSize="sm" fontWeight="medium" color="gray.900">-</Text>
                  )}
                </HStack>
                {registration.comment && (
                  <Box
                    maxH="80px"
                    overflowY="auto"
                    bg="gray.50"
                    p={2}
                    borderRadius="md"
                    css={{
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#cbd5e0',
                        borderRadius: '2px',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: '#a0aec0',
                      },
                    }}
                  >
                    <Text fontSize="sm" color="gray.700" wordBreak="break-word">
                      &ldquo;{registration.comment}&rdquo;
                    </Text>
                  </Box>
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
                  <Box
                    maxH="80px"
                    overflowY="auto"
                    bg="gray.50"
                    p={2}
                    borderRadius="md"
                    css={{
                      '&::-webkit-scrollbar': {
                        width: '4px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: 'transparent',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#cbd5e0',
                        borderRadius: '2px',
                      },
                      '&::-webkit-scrollbar-thumb:hover': {
                        background: '#a0aec0',
                      },
                    }}
                  >
                    <Text fontSize="sm" color="gray.700" wordBreak="break-word">
                      &ldquo;{registration.reasoning}&rdquo;
                    </Text>
                  </Box>
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

      {/* Mobile Layout - Card with borders */}
      <Card.Root 
        display={{ base: "block", lg: "none" }}
        size="sm" 
        variant="outline" 
        width="100%" 
        maxW="100%" 
        overflow="hidden"
      >
        <Card.Body p={4}>
        <VStack gap={3} align="stretch" width="100%" maxW="100%">
          <HStack justify="space-between" align="start">
            <VStack align="start" gap={2} flex={1} minW={0}>
              <HStack gap={2} align="center" wrap="wrap" minW={0} width="100%">
                {(() => {
                  const ToolIcon = getToolIcon(registration.type);
                  return ToolIcon ? (
                    <ToolIcon size={16} style={{ color: `var(--chakra-colors-${toolColor}-500)` }} />
                  ) : null;
                })()}
                <Text fontSize="sm" fontWeight="medium" color="gray.900" lineClamp={1} wordBreak="break-word" flex={1} minW={0}>
                  {registration.toolName}
                </Text>
                <Badge variant="subtle" colorScheme="gray" size="sm" flexShrink={0}>
                  {registration.childName}
                </Badge>
              </HStack>
              <HStack gap={2} fontSize="xs" color="gray.600">
                <Text>{formatDate(registration.createdAt)}</Text>
              </HStack>
            </VStack>
          </HStack>

          {registration.type === 'barometer' && (
            <VStack gap={2} align="stretch">
              <HStack gap={2} align="center">
                <Text fontSize="sm" color="gray.600">Værdi:</Text>
                {registration.rating ? (
                  <BarometerValue 
                    rating={registration.rating} 
                    displayType={registration.displayType} 
                    smileyType={registration.smileyType} 
                  />
                ) : (
                  <Text fontSize="sm" fontWeight="medium" color="gray.900">-</Text>
                )}
              </HStack>
              {registration.comment && (
                <Box
                  maxH="80px"
                  overflowY="auto"
                  bg="white"
                  p={2}
                  borderRadius="md"
                  css={{
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#cbd5e0',
                      borderRadius: '2px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: '#a0aec0',
                    },
                  }}
                >
                  <Text fontSize="sm" color="gray.700" wordBreak="break-word">
                    &ldquo;{registration.comment}&rdquo;
                  </Text>
                </Box>
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
                <Box
                  maxH="80px"
                  overflowY="auto"
                  bg="white"
                  p={2}
                  borderRadius="md"
                  css={{
                    '&::-webkit-scrollbar': {
                      width: '4px',
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: '#cbd5e0',
                      borderRadius: '2px',
                    },
                    '&::-webkit-scrollbar-thumb:hover': {
                      background: '#a0aec0',
                    },
                  }}
                >
                  <Text fontSize="sm" color="gray.700" wordBreak="break-word">
                    &ldquo;{registration.reasoning}&rdquo;
                  </Text>
                </Box>
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
