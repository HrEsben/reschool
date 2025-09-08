"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Button,
  Card
} from '@chakra-ui/react';

interface InvitationData {
  id: number;
  email: string;
  childName: string;
  inviterName: string;
  inviterRelation: string;
  relation: string;
  customRelationName?: string;
  status: string;
  expiresAt: string;
}

export default function InviteAcceptPage() {
  const params = useParams();
  const router = useRouter();
  const user = useUser();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = params.token as string;

  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setError('Ugyldig invitationslink');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/invitations/${token}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Invitationen blev ikke fundet eller er udløbet');
          } else {
            setError('Der opstod en fejl ved indlæsning af invitationen');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setInvitation(data);

        // Auto-accept invitation if user is logged in and email matches
        if (user && user.primaryEmail === data.email && data.status === 'pending') {
          try {
            const acceptResponse = await fetch(`/api/invitations/${token}/auto-accept`, {
              method: 'POST',
            });

            if (acceptResponse.ok) {
              const acceptData = await acceptResponse.json();
              // Redirect to child profile immediately
              router.push(`/${acceptData.childSlug}`);
              return;
            }
          } catch (autoAcceptError) {
            console.log('Auto-acceptance failed, user can manually accept:', autoAcceptError);
            // Continue to show manual acceptance UI
          }
        }
        
      } catch (error) {
        console.error('Error fetching invitation:', error);
        setError('Der opstod en netværksfejl');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token, user, router]);

  const handleAcceptInvitation = async () => {
    if (!invitation || !user) return;
    
    setAccepting(true);
    
    try {
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Der opstod en fejl ved accept af invitationen');
        return;
      }
      
      // Success - redirect to child profile
      const data = await response.json();
      router.push(`/${data.childSlug}`);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('Der opstod en netværksfejl ved accept af invitationen');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="linear-gradient(135deg, #f4f1de 0%, #e2e8f0 100%)"
        p={4}
      >
        <VStack gap={4}>
          <Spinner size="xl" color="#81b29a" />
          <Text color="fg.muted" fontSize="lg" fontWeight="500">
            Indlæser invitation...
          </Text>
        </VStack>
      </Box>
    );
  }

  if (error || !invitation) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="linear-gradient(135deg, #f4f1de 0%, #e2e8f0 100%)"
        p={4}
      >
        <Card.Root maxW="md" bg="white" borderRadius="xl" p={8}>
          <VStack gap={6} textAlign="center">
            <Box
              w={16}
              h={16}
              bg="rgba(224, 122, 95, 0.1)"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="2xl">⚠️</Text>
            </Box>
            
            <VStack gap={2}>
              <Heading size="lg" color="#3d405b">
                Invitation ikke fundet
              </Heading>
              <Text color="fg.muted" textAlign="center">
                {error || 'Invitationen er ikke gyldig eller er udløbet.'}
              </Text>
            </VStack>
            
            <Button
              bg="#81b29a"
              color="white"
              size="md"
              _hover={{
                bg: "#6a9b82"
              }}
              onClick={() => router.push('/')}
            >
              Gå til forsiden
            </Button>
          </VStack>
        </Card.Root>
      </Box>
    );
  }

  // Check if invitation is expired
  const isExpired = new Date(invitation.expiresAt) < new Date();
  
  if (isExpired) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="linear-gradient(135deg, #f4f1de 0%, #e2e8f0 100%)"
        p={4}
      >
        <Card.Root maxW="md" bg="white" borderRadius="xl" p={8}>
          <VStack gap={6} textAlign="center">
            <Box
              w={16}
              h={16}
              bg="rgba(224, 122, 95, 0.1)"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="2xl">⏰</Text>
            </Box>
            
            <VStack gap={2}>
              <Heading size="lg" color="#3d405b">
                Invitation udløbet
              </Heading>
              <Text color="fg.muted" textAlign="center">
                Denne invitation er desværre udløbet. Kontakt {invitation.inviterName} for en ny invitation.
              </Text>
            </VStack>
            
            <Button
              bg="#81b29a"
              color="white"
              size="md"
              _hover={{
                bg: "#6a9b82"
              }}
              onClick={() => router.push('/')}
            >
              Gå til forsiden
            </Button>
          </VStack>
        </Card.Root>
      </Box>
    );
  }

  // User not logged in - show sign up prompt
  if (!user) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="linear-gradient(135deg, #f4f1de 0%, #e2e8f0 100%)"
        p={4}
      >
        <Card.Root maxW="lg" bg="white" borderRadius="xl" overflow="hidden">
          {/* Header */}
          <Box
            bg="linear-gradient(135deg, #81b29a 0%, #f4f1de 100%)"
            p={8}
            textAlign="center"
          >
            <VStack gap={4}>
              <Box
                w={20}
                h={20}
                bg="rgba(255, 255, 255, 0.2)"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Text fontSize="3xl">👋</Text>
              </Box>
              <VStack gap={2}>
                <Heading size="xl" color="white">
                  Du er inviteret!
                </Heading>
                <Text color="rgba(255, 255, 255, 0.9)" fontSize="lg">
                  Til at følge {invitation.childName} på ReSchool
                </Text>
              </VStack>
            </VStack>
          </Box>

          {/* Content */}
          <VStack p={8} gap={6} align="stretch">
            <VStack gap={4} textAlign="center">
              <Text color="#3d405b" fontSize="lg" lineHeight="1.6">
                <Text as="span" fontWeight="600">{invitation.inviterName || 'Ukendt'}</Text>
                {' '}({invitation.inviterRelation}) har inviteret dig til at følge{' '}
                <Text as="span" fontWeight="600">{invitation.childName || 'ukendt barn'}</Text>
                {' '}som <Text as="span" fontWeight="600" color="#81b29a">
                  {invitation.customRelationName || invitation.relation}
                </Text>.
              </Text>
              
              <Text color="fg.muted">
                ReSchool er en platform hvor forældre, undervisere og andre voksne kan følge et barns udvikling og forløb.
              </Text>
            </VStack>

            <VStack gap={3}>
              <Button
                bg="#81b29a"
                color="white"
                size="lg"
                width="full"
                _hover={{
                  bg: "#6a9b82"
                }}
                onClick={() => router.push(`/signup?redirect=/invite/${token}&email=${encodeURIComponent(invitation.email)}`)}
              >
                Opret konto og acceptér invitation
              </Button>
              
              <Text color="fg.muted" fontSize="sm" textAlign="center">
                Har du allerede en konto?{' '}
                <Button
                  variant="plain"
                  color="#81b29a"
                  fontWeight="600"
                  p={0}
                  h="auto"
                  onClick={() => router.push(`/login?redirect=/invite/${token}&email=${encodeURIComponent(invitation.email)}`)}
                >
                  Log ind her
                </Button>
              </Text>
            </VStack>
          </VStack>
        </Card.Root>
      </Box>
    );
  }

  // User is logged in but email doesn't match invitation
  if (user.primaryEmail !== invitation.email) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="linear-gradient(135deg, #f4f1de 0%, #e2e8f0 100%)"
        p={4}
      >
        <Card.Root maxW="md" bg="white" borderRadius="xl" p={8}>
          <VStack gap={6} textAlign="center">
            <Box
              w={16}
              h={16}
              bg="rgba(224, 122, 95, 0.1)"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="2xl">✉️</Text>
            </Box>
            
            <VStack gap={2}>
              <Heading size="lg" color="#3d405b">
                Forkert email adresse
              </Heading>
              <Text color="fg.muted" textAlign="center">
                Denne invitation er til {invitation.email}, men du er logget ind som {user.primaryEmail}.
              </Text>
              <Text color="fg.muted" textAlign="center" fontSize="sm">
                Log ud og log ind med den korrekte email adresse, eller kontakt {invitation.inviterName} for en ny invitation.
              </Text>
            </VStack>
            
            <HStack gap={3}>
              <Button
                variant="outline"
                size="md"
                onClick={() => router.push('/sign-out')}
              >
                Log ud
              </Button>
              <Button
                bg="#81b29a"
                color="white"
                size="md"
                _hover={{
                  bg: "#6a9b82"
                }}
                onClick={() => router.push('/')}
              >
                Gå til forsiden
              </Button>
            </HStack>
          </VStack>
        </Card.Root>
      </Box>
    );
  }

  // User is logged in with correct email - show accept invitation
  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      bg="linear-gradient(135deg, #f4f1de 0%, #e2e8f0 100%)"
      p={4}
    >
      <Card.Root maxW="lg" bg="white" borderRadius="xl" overflow="hidden">
        {/* Header */}
        <Box
          bg="linear-gradient(135deg, #81b29a 0%, #f4f1de 100%)"
          p={8}
          textAlign="center"
        >
          <VStack gap={4}>
            <Box
              w={20}
              h={20}
              bg="rgba(255, 255, 255, 0.2)"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text fontSize="3xl">🎉</Text>
            </Box>
            <VStack gap={2}>
              <Heading size="xl" color="white">
                Velkommen, {user.displayName || user.primaryEmail}!
              </Heading>
              <Text color="rgba(255, 255, 255, 0.9)" fontSize="lg">
                Du er inviteret til at følge {invitation.childName}
              </Text>
            </VStack>
          </VStack>
        </Box>

        {/* Content */}
        <VStack p={8} gap={6} align="stretch">
          <VStack gap={4} textAlign="center">
            <Text color="#3d405b" fontSize="lg" lineHeight="1.6">
              <Text as="span" fontWeight="600">{invitation.inviterName || 'Ukendt'}</Text>
              {' '}({invitation.inviterRelation}) har inviteret dig til at følge{' '}
              <Text as="span" fontWeight="600">{invitation.childName || 'ukendt barn'}</Text>
              {' '}som <Text as="span" fontWeight="600" color="#81b29a">
                {invitation.customRelationName || invitation.relation}
              </Text>.
            </Text>
            
            <Text color="fg.muted">
              Ved at acceptere denne invitation får du adgang til at følge barnets udvikling og forløb på ReSchool.
            </Text>
          </VStack>

          <Button
            bg="#81b29a"
            color="white"
            size="lg"
            width="full"
            _hover={{
              bg: "#6a9b82"
            }}
            onClick={handleAcceptInvitation}
            loading={accepting}
            loadingText="Accepterer invitation..."
          >
            Acceptér invitation
          </Button>

          {error && (
            <Box
              bg="rgba(224, 122, 95, 0.1)"
              border="1px solid rgba(224, 122, 95, 0.3)"
              borderRadius="md"
              p={4}
            >
              <Text color="#e07a5f" fontSize="sm" fontWeight="500" textAlign="center">
                {error}
              </Text>
            </Box>
          )}
        </VStack>
      </Card.Root>
    </Box>
  );
}
