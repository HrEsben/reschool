"use client";

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Spinner,
  Card,
  HStack,
  Icon,
  Alert
} from '@chakra-ui/react';

interface InvitationData {
  id: number;
  email: string;
  childId: number;
  invitedBy: number;
  relation: string;
  customRelationName?: string;
  token: string;
  status: string;
  expiresAt: string;
  childName: string;
  inviterName: string;
  inviterRelation: string;
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
      try {
        const response = await fetch(`/api/invitations/${token}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Invitation not found or expired');
          } else {
            setError('Invalid invitation');
          }
          return;
        }

        const data = await response.json();
        setInvitation(data);
      } catch (error) {
        console.error('Error fetching invitation:', error);
        setError('Failed to load invitation');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const handleAcceptInvitation = async () => {
    if (!user || !invitation) return;

    setAccepting(true);
    try {
      const response = await fetch(`/api/invitations/${token}/accept`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to accept invitation');
        return;
      }

      // Redirect to child profile
      router.push(`/${invitation.childName.toLowerCase().replace(/\s+/g, '-')}`);
    } catch (error) {
      console.error('Error accepting invitation:', error);
      setError('Failed to accept invitation');
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
        bg="#f4f1de"
        p={4}
      >
        <VStack gap={4}>
          <Spinner size="xl" color="#3d405b" />
          <Text color="#3d405b" fontSize="lg" fontWeight="500">
            Loading invitation...
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
        bg="#f4f1de"
        p={4}
      >
        <Card.Root maxW="md" bg="white" borderRadius="xl" border="1px solid" borderColor="border.muted">
          <Card.Body p={8}>
            <VStack gap={6} align="center">
              <Icon boxSize={16} color="#e07a5f">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </Icon>
              <Heading size="lg" color="#3d405b" textAlign="center">
                Invitation Error
              </Heading>
              <Text color="fg.muted" textAlign="center">
                {error}
              </Text>
              <Button
                bg="#3d405b"
                color="white"
                _hover={{ bg: "#2a2d47" }}
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Box>
    );
  }

  if (!user) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="#f4f1de"
        p={4}
      >
        <Card.Root maxW="lg" bg="white" borderRadius="xl" border="1px solid" borderColor="border.muted">
          {/* Header */}
          <Box
            bg="linear-gradient(135deg, #81b29a 0%, #f4f1de 100%)"
            p={6}
            borderTopRadius="xl"
          >
            <VStack gap={3} align="center">
              <Icon boxSize={12} color="white">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </Icon>
              <Heading size="xl" color="white" textAlign="center" fontWeight="700">
                You&apos;re Invited!
              </Heading>
            </VStack>
          </Box>

          {/* Content */}
          <Card.Body p={8}>
            <VStack gap={6} align="stretch">
              <Alert.Root status="info" colorPalette="blue">
                <Icon color="blue.500" boxSize={5}>
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </Icon>
                <Alert.Title>Join ReSchool</Alert.Title>
                <Alert.Description>
                  You&apos;ve been invited to connect with <strong>{invitation.childName}</strong> by{' '}
                  <strong>{invitation.inviterName}</strong> ({invitation.inviterRelation}).
                </Alert.Description>
              </Alert.Root>

              <VStack gap={4} align="stretch">
                <Text color="fg.default" fontSize="md" textAlign="center">
                  To accept this invitation, please sign up or sign in with the email address{' '}
                  <Text as="span" fontWeight="600" color="#3d405b">
                    {invitation.email}
                  </Text>
                </Text>

                <HStack gap={3} justify="center">
                  <Button
                    onClick={() => router.push('/handler/sign-up')}
                    bg="#81b29a"
                    color="white"
                    _hover={{ bg: "#6d9985" }}
                    size="lg"
                  >
                    Sign Up
                  </Button>
                  <Button
                    onClick={() => router.push('/handler/sign-in')}
                    variant="outline"
                    colorPalette="green"
                    size="lg"
                  >
                    Sign In
                  </Button>
                </HStack>
              </VStack>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Box>
    );
  }

  // User is logged in, show acceptance interface
  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      bg="#f4f1de"
      p={4}
    >
      <Card.Root maxW="lg" bg="white" borderRadius="xl" border="1px solid" borderColor="border.muted">
        {/* Header */}
        <Box
          bg="linear-gradient(135deg, #81b29a 0%, #f4f1de 100%)"
          p={6}
          borderTopRadius="xl"
        >
          <VStack gap={3} align="center">
            <Icon boxSize={12} color="white">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Icon>
            <Heading size="xl" color="white" textAlign="center" fontWeight="700">
              Accept Invitation
            </Heading>
          </VStack>
        </Box>

        {/* Content */}
        <Card.Body p={8}>
          <VStack gap={6} align="stretch">
            <Alert.Root status="success" colorPalette="green">
              <Icon color="green.500" boxSize={5}>
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </Icon>
              <Alert.Title>Welcome, {user.displayName || user.primaryEmail}!</Alert.Title>
              <Alert.Description>
                You&apos;ve been invited to connect with <strong>{invitation.childName}</strong> as their{' '}
                <strong>{invitation.customRelationName || invitation.relation}</strong>.
              </Alert.Description>
            </Alert.Root>

            <VStack gap={4} align="stretch">
              <Text color="fg.muted" fontSize="sm" textAlign="center">
                Invited by: <strong>{invitation.inviterName}</strong> ({invitation.inviterRelation})
              </Text>

              <Button
                bg="#81b29a"
                color="white"
                _hover={{ bg: "#6d9985" }}
                size="lg"
                onClick={handleAcceptInvitation}
                loading={accepting}
                loadingText="Accepting..."
                w="full"
              >
                Accept Invitation
              </Button>

              <Button
                variant="outline"
                colorPalette="gray"
                size="lg"
                onClick={() => router.push('/dashboard')}
                w="full"
              >
                Cancel
              </Button>
            </VStack>
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}
