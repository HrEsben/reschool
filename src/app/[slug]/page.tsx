"use client";

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@stackframe/stack';
import { FaStairs } from 'react-icons/fa6';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Separator,
  Table,
  Icon,
  Skeleton
} from '@chakra-ui/react';
import { showToast } from '@/components/ui/simple-toast';
import { AuthenticatedLayout } from '@/components/layouts/authenticated-layout';
import { DeleteChildDialog } from '@/components/ui/delete-child-dialog';
import { RemoveUserDialog } from '@/components/ui/remove-user-dialog';
import { InviteUserDialog } from '@/components/ui/invite-user-dialog';
import { DeleteInvitationDialog } from '@/components/ui/delete-invitation-dialog';
import { PromoteUserDialog } from '@/components/ui/promote-user-dialog';
import { DemoteUserDialog } from '@/components/ui/demote-user-dialog';
import { ToolsManager, ToolsManagerRef } from '@/components/tools/tools-manager';
import { AdminStarIcon, DemoteStarIcon } from '@/components/ui/icons';
import { useChildBySlug, useRemoveUserFromChild, useDeleteInvitation, useDeleteChild, usePromoteUserToAdmin, useDemoteUserFromAdmin } from '@/lib/queries';

export default function ChildSlugPage() {
  const params = useParams();
  const router = useRouter();
  const user = useUser();
  const [deletingInvitation, setDeletingInvitation] = useState(false);
  const toolsManagerRef = useRef<ToolsManagerRef>(null);
  
  const slug = params.slug as string;

  // Use React Query hooks
  const { data: childData, isLoading: loading, error: queryError, refetch } = useChildBySlug(slug);
  const removeUserMutation = useRemoveUserFromChild();
  const deleteInvitationMutation = useDeleteInvitation();
  const deleteChildMutation = useDeleteChild();
  const promoteUserMutation = usePromoteUserToAdmin();
  const demoteUserMutation = useDemoteUserFromAdmin();

  // Convert query error to string for display
  const error = queryError ? (queryError instanceof Error ? queryError.message : 'Der opstod en fejl') : null;

  const copyInviteLink = async (invitation: { token: string; email: string }) => {
    const currentUrl = new URL(window.location.href);
    const inviteUrl = `${currentUrl.protocol}//${currentUrl.host}/invite/${invitation.token}`;
    
    try {
      await navigator.clipboard.writeText(inviteUrl);
      showToast({
        title: 'Link kopieret!',
        description: `Invitations-link til ${invitation.email} er kopieret til udklipsholderen`,
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      showToast({
        title: 'Fejl',
        description: 'Kunne ikke kopiere linket til udklipsholderen',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const deleteInvitation = async (invitationId: number, invitationEmail: string) => {
    setDeletingInvitation(true);
    try {
      await deleteInvitationMutation.mutateAsync(invitationId.toString());

      showToast({
        title: 'Invitation slettet',
        description: `Invitationen til ${invitationEmail} er blevet slettet`,
        type: 'success',
        duration: 3000,
      });

      // React Query will automatically update the cache
    } catch (error) {
      console.error('Error deleting invitation:', error);
      showToast({
        title: 'Fejl',
        description: error instanceof Error ? error.message : 'Der opstod en netværksfejl',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setDeletingInvitation(false);
    }
  };

  const getRelationDisplayName = (user: { relation: string; customRelationName?: string }) => {
    if (user.relation === 'Ressourceperson' && user.customRelationName) {
      return user.customRelationName;
    }
    return user.relation;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date string:', dateString);
        return 'Ugyldig dato';
      }
      return date.toLocaleDateString('da-DK');
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Ugyldig dato';
    }
  };

  const getPossessiveForm = (name: string) => {
    // Danish possessive: if name ends with 's', add apostrophe (´), otherwise add 's'
    if (name.toLowerCase().endsWith('s')) {
      return `${name}´`;
    }
    return `${name}s`;
  };

  const handleDeleteChild = async () => {
    if (!childData) return;
    
    try {
      await deleteChildMutation.mutateAsync(childData.child.id.toString());
      
      // Redirect to dashboard after successful deletion
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting child:', error);
      showToast({
        title: 'Fejl',
        description: error instanceof Error ? error.message : 'Der opstod en fejl ved sletning af barnet',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const handleRemoveUser = async (userId: number) => {
    if (!childData) return;
    
    try {
      await removeUserMutation.mutateAsync({
        childId: childData.child.id.toString(),
        userId: userId.toString()
      });
      
      showToast({
        title: 'Bruger fjernet',
        description: 'Brugeren er blevet fjernet fra barnet',
        type: 'success',
        duration: 3000,
      });
      
      // React Query will automatically update the cache
    } catch (error) {
      console.error('Error removing user:', error);
      showToast({
        title: 'Netværksfejl',
        description: error instanceof Error ? error.message : 'Der opstod en netværksfejl ved fjernelse af brugeren',
        type: 'error',
        duration: 5000,
      });
    }
  };

  const handlePromoteUser = async (userId: number, userName: string) => {
    if (!childData) return;
    
    try {
      await promoteUserMutation.mutateAsync({
        childId: childData.child.id.toString(),
        userId: userId.toString()
      });
      
      showToast({
        title: 'Bruger forfremmet',
        description: `${userName} er nu administrator for ${childData.child.name}`,
        type: 'success',
        duration: 3000,
      });
      
      // React Query will automatically update the cache
    } catch (error) {
      console.error('Error promoting user:', error);
      showToast({
        title: 'Netværksfejl',
        description: error instanceof Error ? error.message : 'Der opstod en fejl ved forfremmelse af brugeren',
        type: 'error',
        duration: 5000,
      });
    }
  };

  const handleDemoteUser = async (userId: number, userName: string) => {
    if (!childData) return;
    
    try {
      await demoteUserMutation.mutateAsync({
        childId: childData.child.id.toString(),
        userId: userId.toString()
      });
      
      showToast({
        title: 'Administratorrettigheder fjernet',
        description: `${userName} er ikke længere administrator for ${childData.child.name}`,
        type: 'success',
        duration: 3000,
      });
      
      // React Query will automatically update the cache
    } catch (error) {
      console.error('Error demoting user:', error);
      showToast({
        title: 'Netværksfejl',
        description: error instanceof Error ? error.message : 'Der opstod en fejl ved fjernelse af administratorrettigheder',
        type: 'error',
        duration: 5000,
      });
    }
  };

  // Show loading state while fetching data
  if (loading) {
    return (
      <AuthenticatedLayout>
        <Box p={{ base: 4, md: 8 }}>
          <VStack gap={6} align="stretch" maxW="4xl" mx="auto">
            {/* Child Header Skeleton */}
            <VStack align="start" gap={2}>
              <Skeleton height="40px" width="300px" mb={4} />
              <Skeleton height="4px" width="80px" borderRadius="full" />
            </VStack>

            {/* Tools Section Skeleton */}
            <Box 
              bg="bg.surface" 
              borderRadius="xl" 
              border="1px solid" 
              borderColor="border.muted" 
              p={{ base: 4, md: 6 }}
            >
              <VStack gap={4} align="stretch">
                <HStack justify="space-between" align="center">
                  <VStack align="start" gap={2}>
                    <Skeleton height="28px" width="200px" />
                    <Skeleton height="4px" width="64px" borderRadius="full" />
                  </VStack>
                  <Skeleton height="40px" width="120px" />
                </HStack>
                
                <Separator />
                
                <VStack gap={4}>
                  {[1, 2, 3].map((i) => (
                    <Box key={i} p={4} border="1px solid" borderColor="gray.200" borderRadius="lg" width="100%">
                      <VStack align="stretch" gap={3}>
                        <HStack justify="space-between" align="center">
                          <Skeleton height="20px" width="40%" />
                          <Skeleton height="32px" width="80px" />
                        </HStack>
                        <Skeleton height="60px" width="100%" />
                        <HStack gap={2}>
                          {[1, 2, 3, 4, 5].map((j) => (
                            <Skeleton key={j} height="40px" width="40px" borderRadius="full" />
                          ))}
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              </VStack>
            </Box>

            {/* Connected Users Section Skeleton */}
            <Box 
              bg="bg.surface" 
              borderRadius="xl" 
              border="1px solid" 
              borderColor="border.muted" 
              p={{ base: 4, md: 6 }}
            >
              <VStack align="stretch" gap={4}>
                <HStack justify="space-between" align="center">
                  <VStack align="start" gap={2}>
                    <Skeleton height="28px" width="180px" />
                    <Skeleton height="4px" width="64px" borderRadius="full" />
                  </VStack>
                  <Skeleton height="40px" width="100px" />
                </HStack>
                
                <Separator />

                <Table.ScrollArea borderWidth="1px" rounded="md">
                  <Table.Root size={{ base: "sm", md: "md" }} variant="line" striped>
                    <Table.Header>
                      <Table.Row>
                        <Table.ColumnHeader minW="150px">
                          <Skeleton height="16px" width="60px" />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader minW="200px">
                          <Skeleton height="16px" width="80px" />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader minW="120px">
                          <Skeleton height="16px" width="70px" />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader minW="100px">
                          <Skeleton height="16px" width="50px" />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader minW="100px">
                          <Skeleton height="16px" width="60px" />
                        </Table.ColumnHeader>
                        <Table.ColumnHeader minW="120px">
                          <Skeleton height="16px" width="80px" />
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {[1, 2, 3].map((i) => (
                        <Table.Row key={i}>
                          <Table.Cell>
                            <HStack gap={3}>
                              <Skeleton height="32px" width="32px" borderRadius="full" />
                              <Skeleton height="16px" width="80px" />
                            </HStack>
                          </Table.Cell>
                          <Table.Cell>
                            <Skeleton height="16px" width="120px" />
                          </Table.Cell>
                          <Table.Cell>
                            <Skeleton height="20px" width="60px" />
                          </Table.Cell>
                          <Table.Cell>
                            <Skeleton height="20px" width="50px" />
                          </Table.Cell>
                          <Table.Cell>
                            <Skeleton height="16px" width="70px" />
                          </Table.Cell>
                          <Table.Cell>
                            <Skeleton height="32px" width="70px" />
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Table.ScrollArea>
              </VStack>
            </Box>
          </VStack>
        </Box>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <Box p={{ base: 4, md: 8 }}>
          <VStack gap={6} align="stretch" maxW="4xl" mx="auto">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              alignSelf="flex-start"
              colorPalette="navy"
            >
              ← Tilbage til Dashboard
            </Button>
            
            <Box 
              bg="coral.50" 
              border="1px solid" 
              borderColor="coral.200" 
              borderRadius="lg" 
              p={4}
            >
              <Text color="coral.600" fontWeight="500">
                {error}
              </Text>
            </Box>
          </VStack>
        </Box>
      </AuthenticatedLayout>
    );
  }

  if (!childData) {
    return null;
  }

  const currentUserRelation = childData.users.find((u: { stackAuthId: string; isAdministrator: boolean }) => u.stackAuthId === user?.id);
  const isCurrentUserAdmin = currentUserRelation?.isAdministrator || false;

  return (
    <AuthenticatedLayout>
      <Box p={{ base: 4, md: 8 }}>
        <VStack gap={6} align="stretch" maxW="4xl" mx="auto">
          {/* Child Header with breadcrumb-style tools section */}
          <VStack align="start" gap={2}>
            <HStack align="baseline" gap={3} wrap="wrap" justify="space-between" w="100%">
              <HStack align="baseline" gap={3} wrap="wrap">
                <Heading size="xl" color="navy.800" fontWeight="700">
                  {childData.child.name}
                </Heading>
                <Text color="gray.400" fontSize="xl" fontWeight="300">
                  /
                </Text>
                <Heading size="lg" color="delft-blue.600" fontWeight="600">
                  Værktøjer
                </Heading>
              </HStack>
              
              {/* Action buttons in header */}
              <HStack gap={3}>
                {/* Progress View Button */}
                <Link href={`/${childData.child.slug}/progress`}>
                  <Button
                    bg="sage.500"
                    color="white"
                    size="md"
                    _hover={{
                      bg: "sage.600"
                    }}
                  >
                    <Icon as={FaStairs} mr={2} />
                    Overblik
                  </Button>
                </Link>
                
                {/* Add Tool Button */}
                {isCurrentUserAdmin && (
                  <Button
                    bg="#81b29a"
                    color="white"
                    size="md"
                    _hover={{
                      bg: "#6a9b82"
                    }}
                    onClick={() => {
                      toolsManagerRef.current?.openAddDialog();
                    }}
                  >
                    Tilføj +
                  </Button>
                )}
              </HStack>
            </HStack>
            <Box className="w-20 h-1 bg-sunset-500 rounded-full"></Box>
          </VStack>

          {/* Tools Section - No card wrapper */}
          <ToolsManager 
            ref={toolsManagerRef}
            childId={childData.child.id} 
            isUserAdmin={isCurrentUserAdmin}
            childName={childData.child.name}
            hideAddButton={true}
          />

          {/* Connected Users Section */}
          <Box 
            bg="bg.surface" 
            borderRadius="xl" 
            border="1px solid" 
            borderColor="border.muted" 
            p={{ base: 4, md: 6 }}
          >
            <VStack align="stretch" gap={4}>
              <HStack justify="space-between" align="center">
                <VStack align="start" gap={2}>
                  <Heading size="lg" color="fg.default" fontWeight="600">
                    {getPossessiveForm(childData.child.name)} voksne ({childData.users.length + childData.invitations.length})
                  </Heading>
                  <Box className="w-16 h-1 bg-cambridge-blue-500 rounded-full"></Box>
                </VStack>
                
                {isCurrentUserAdmin && (
                  <InviteUserDialog
                    trigger={
                      <Button
                        bg="#81b29a"
                        color="white"
                        size="md"
                        _hover={{
                          bg: "#6a9b82"
                        }}
                      >
                        <Icon mr={2}>
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                          </svg>
                        </Icon>
                        Invitér
                      </Button>
                    }
                    childId={childData.child.id}
                    childName={childData.child.name}
                    onInviteSuccess={() => {
                      // React Query will automatically refetch when cache is invalidated
                      refetch();
                    }}
                  />
                )}
              </HStack>
              
              <Separator />

              <Table.ScrollArea borderWidth="1px" rounded="md">
                <Table.Root size={{ base: "sm", md: "md" }} variant="line" striped>
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader color="fg.muted" fontWeight="600" minW="150px">Navn</Table.ColumnHeader>
                      <Table.ColumnHeader color="fg.muted" fontWeight="600" minW="200px">Email</Table.ColumnHeader>
                      <Table.ColumnHeader color="fg.muted" fontWeight="600" minW="120px">Relation</Table.ColumnHeader>
                      <Table.ColumnHeader color="fg.muted" fontWeight="600" minW="100px">Rolle</Table.ColumnHeader>
                      <Table.ColumnHeader color="fg.muted" fontWeight="600" minW="100px">Tilføjet</Table.ColumnHeader>
                      {isCurrentUserAdmin && (
                        <Table.ColumnHeader color="fg.muted" fontWeight="600" minW="120px">Handlinger</Table.ColumnHeader>
                      )}
                    </Table.Row>
                  </Table.Header>
                <Table.Body>
                  {/* Existing Users */}
                  {childData.users.map((userData: { 
                    id: number; 
                    stackAuthId: string;
                    displayName?: string; 
                    email: string; 
                    relation: string; 
                    customRelationName?: string; 
                    isAdministrator: boolean; 
                    createdAt: string 
                  }) => (
                    <Table.Row 
                      key={`user-${userData.id}`}
                      _hover={{ bg: "cream.100" }}
                      transition="background-color 0.2s ease"
                    >
                      <Table.Cell>
                        <HStack gap={3}>
                          <Box
                            w={8}
                            h={8}
                            bg="navy.500"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="white"
                            fontWeight="bold"
                            fontSize="sm"
                          >
                            {(userData.displayName || userData.email || 'U').charAt(0).toUpperCase()}
                          </Box>
                          <Text fontWeight="500" color="fg.default">
                            {userData.displayName || 'Navn ikke angivet'}
                          </Text>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>
                        <Text color="fg.muted" fontSize="sm" fontWeight="500">
                          {userData.email}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text color="fg.default" fontSize="sm" fontWeight="500">
                          {getRelationDisplayName(userData)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        {userData.isAdministrator ? (
                          <Text color="fg.default" fontSize="sm" fontWeight="500">
                            Administrator
                          </Text>
                        ) : (
                          <Text color="fg.muted" fontSize="sm" fontWeight="400">
                            Bruger
                          </Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Text color="fg.muted" fontSize="sm" fontWeight="500">
                          {formatDate(userData.createdAt)}
                        </Text>
                      </Table.Cell>
                      {isCurrentUserAdmin && (
                        <Table.Cell>
                          {(() => {
                            // Count administrators
                            const adminCount = childData.users.filter((u: { isAdministrator: boolean }) => u.isAdministrator).length;
                            
                            // Don't show remove button if:
                            // 1. This is the current user and they are the last admin
                            const isCurrentUser = userData.stackAuthId === user?.id;
                            const isLastAdmin = userData.isAdministrator && adminCount <= 1;
                            
                            if (isCurrentUser && isLastAdmin) {
                              return (
                                <Text color="fg.muted" fontSize="xs" fontStyle="italic">
                                  Sidste admin
                                </Text>
                              );
                            }
                            
                            return (
                              <HStack gap={2}>
                                {/* Promote button - only show for non-admin users */}
                                {!userData.isAdministrator && (
                                  <PromoteUserDialog
                                    trigger={
                                      <Button
                                        variant="subtle"
                                        size="sm"
                                        colorPalette="green"
                                        _hover={{
                                          bg: "#81b29a",
                                          color: "white"
                                        }}
                                        bg="rgba(129, 178, 154, 0.1)"
                                        color="#81b29a"
                                        border="1px solid rgba(129, 178, 154, 0.3)"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <AdminStarIcon size={16} />
                                      </Button>
                                    }
                                    userName={userData.displayName || 'Ukendt bruger'}
                                    userEmail={userData.email}
                                    onConfirm={() => handlePromoteUser(userData.id, userData.displayName || userData.email)}
                                    isLoading={promoteUserMutation.isPending}
                                  />
                                )}

                                {/* Demote button - only show for admin users (except last admin) */}
                                {userData.isAdministrator && !(isCurrentUser && isLastAdmin) && (
                                  <DemoteUserDialog
                                    trigger={
                                      <Button
                                        variant="subtle"
                                        size="sm"
                                        colorPalette="orange"
                                        _hover={{
                                          bg: "#f2cc8f",
                                          color: "white"
                                        }}
                                        bg="rgba(242, 204, 143, 0.1)"
                                        color="#e9c46a"
                                        border="1px solid rgba(242, 204, 143, 0.3)"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <DemoteStarIcon size={16} />
                                      </Button>
                                    }
                                    userName={userData.displayName || 'Ukendt bruger'}
                                    userEmail={userData.email}
                                    onConfirm={() => handleDemoteUser(userData.id, userData.displayName || userData.email)}
                                    isLoading={demoteUserMutation.isPending}
                                  />
                                )}
                                
                                {/* Remove button */}
                                <RemoveUserDialog
                                  trigger={
                                    <Button
                                      variant="subtle"
                                      size="sm"
                                      colorPalette="red"
                                      _hover={{
                                        bg: "#e07a5f",
                                        color: "white"
                                      }}
                                      bg="rgba(224, 122, 95, 0.1)"
                                      color="#e07a5f"
                                      border="1px solid rgba(224, 122, 95, 0.3)"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Icon boxSize={4}>
                                        <svg fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53L15.986 5.952l.149.022a.75.75 0 00.23-1.482A48.16 48.16 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                        </svg>
                                      </Icon>
                                    </Button>
                                  }
                                  userName={userData.displayName || 'Ukendt bruger'}
                                  userEmail={userData.email}
                                  onConfirm={() => handleRemoveUser(userData.id)}
                                  isLoading={removeUserMutation.isPending}
                                />
                              </HStack>
                            );
                          })()}
                        </Table.Cell>
                      )}
                    </Table.Row>
                  ))}
                  
                  {/* Pending Invitations */}
                  {childData.invitations.map((invitation: { 
                    id: number; 
                    email: string; 
                    relation: string; 
                    customRelationName?: string; 
                    status: string; 
                    createdAt: string;
                    token: string;
                  }) => (
                    <Table.Row 
                      key={`invitation-${invitation.id}`}
                      bg="rgba(129, 178, 154, 0.05)"
                      border="1px solid rgba(129, 178, 154, 0.2)"
                    >
                      <Table.Cell>
                        <HStack gap={3}>
                          <Box
                            w={8}
                            h={8}
                            bg="rgba(129, 178, 154, 0.3)"
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            color="#3d405b"
                            fontWeight="bold"
                            fontSize="sm"
                            border="2px dashed rgba(129, 178, 154, 0.5)"
                          >
                            <Icon boxSize={4}>
                              <svg fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                              </svg>
                            </Icon>
                          </Box>
                          <VStack align="start" gap={0}>
                            <Text fontWeight="500" color="#3d405b" fontSize="sm">
                              Invitation sendt
                            </Text>
                            <Text color="fg.muted" fontSize="xs">
                              Afventer svar
                            </Text>
                          </VStack>
                        </HStack>
                      </Table.Cell>
                      <Table.Cell>
                        <Text color="fg.muted" fontSize="sm" fontWeight="500">
                          {invitation.email}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text color="#81b29a" fontSize="sm" fontWeight="500">
                          {invitation.customRelationName || invitation.relation}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text color="#81b29a" fontSize="sm" fontWeight="500" fontStyle="italic">
                          Inviteret
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text color="fg.muted" fontSize="sm" fontWeight="500">
                          {formatDate(invitation.createdAt)}
                        </Text>
                      </Table.Cell>
                      {isCurrentUserAdmin && (
                        <Table.Cell>
                          <HStack gap={2}>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyInviteLink(invitation);
                              }}
                              bg="#f4f1de"
                              borderColor="#81b29a"
                              color="#3d405b"
                              _hover={{
                                bg: "#81b29a",
                                color: "white",
                                borderColor: "#81b29a"
                              }}
                              minW="auto"
                              p={2}
                              aspectRatio="1"
                            >
                              <Icon boxSize={4}>
                                <svg fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                                </svg>
                              </Icon>
                            </Button>
                            <DeleteInvitationDialog
                              trigger={
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => e.stopPropagation()}
                                  bg="#f4f1de"
                                  borderColor="#e07a5f"
                                  color="#e07a5f"
                                  _hover={{
                                    bg: "#e07a5f",
                                    color: "white",
                                    borderColor: "#e07a5f"
                                  }}
                                  minW="auto"
                                  p={2}
                                  aspectRatio="1"
                                >
                                  <Icon boxSize={4}>
                                    <svg fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                                    </svg>
                                  </Icon>
                                </Button>
                              }
                              invitationEmail={invitation.email}
                              onConfirm={() => deleteInvitation(invitation.id, invitation.email)}
                              isLoading={deletingInvitation}
                            />
                          </HStack>
                        </Table.Cell>
                      )}
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
              </Table.ScrollArea>

              {childData.users.length === 0 && childData.invitations.length === 0 && (
                <Text color="fg.muted" textAlign="center" py={8} fontWeight="500">
                  Ingen brugere er tilknyttet dette barn endnu
                </Text>
              )}
            </VStack>
          </Box>

          {/* Delete Button - Only for Admins */}
          {isCurrentUserAdmin && (
            <Box mt={8} pt={6} borderTop="1px solid" borderColor="border.muted">
              <HStack justify="center">
                <DeleteChildDialog
                  trigger={
                    <Button
                      variant="subtle"
                      size={{ base: "md", md: "sm" }}
                      colorPalette="red"
                      _hover={{
                        bg: "#e07a5f",
                        color: "white"
                      }}
                      bg="rgba(224, 122, 95, 0.1)"
                      color="#e07a5f"
                      border="1px solid rgba(224, 122, 95, 0.3)"
                      fontWeight="500"
                      px={{ base: 6, md: 4 }}
                      py={{ base: 3, md: 2 }}
                    >
                      <Icon mr={{ base: 3, md: 2 }} boxSize={{ base: 5, md: 4 }}>
                        <svg fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53L15.986 5.952l.149.022a.75.75 0 00.23-1.482A48.16 48.16 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                        </svg>
                      </Icon>
                      <Text fontSize={{ base: "sm", md: "xs" }}>
                        Slet barn
                      </Text>
                    </Button>
                  }
                  childName={childData.child.name}
                  onConfirm={handleDeleteChild}
                  isLoading={deleteChildMutation.isPending}
                />
              </HStack>
            </Box>
          )}

        </VStack>
      </Box>
    </AuthenticatedLayout>
  );
}
