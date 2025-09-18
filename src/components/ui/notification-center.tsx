'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Button, 
  Text, 
  VStack, 
  HStack, 
  Badge,
  IconButton,
  Spinner
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { BellIcon, CheckIcon } from 'lucide-react';
import { useUser } from '@stackframe/stack';
import { AcceptInvitationDialog } from './accept-invitation-dialog';

export interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationCenter({ isOpen, onClose }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const user = useUser();

  const fetchNotifications = useCallback(async (retryCount = 0) => {
    // Don't fetch if user is not authenticated
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      if (retryCount === 0) setLoading(true);
      
      const response = await fetch('/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        setLoading(false);
      } else if (response.status === 401) {
        // User is not authenticated
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
      } else {
        console.error('Failed to fetch notifications:', response.status);
        if (retryCount < 2) {
          setTimeout(() => fetchNotifications(retryCount + 1), 1000 * (retryCount + 1));
        } else {
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (retryCount < 2) {
        setTimeout(() => fetchNotifications(retryCount + 1), 1000 * (retryCount + 1));
      } else {
        setLoading(false);
      }
    }
  }, [user]);  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  const markAsRead = async (notificationId: number) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => 
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else if (response.status === 401) {
        console.warn('User not authenticated for marking notification as read');
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true }))
        );
        setUnreadCount(0);
      } else if (response.status === 401) {
        console.warn('User not authenticated for marking all notifications as read');
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // For invitation notifications, we handle them specially
    if (notification.type === 'invitation_received') {
      // Don't redirect - the dialog will be opened from the notification item itself
      return;
    }
    
    // For other notification types, use the actionUrl
    if (notification.data?.actionUrl && typeof notification.data.actionUrl === 'string') {
      router.push(notification.data.actionUrl);
      onClose();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'Lige nu';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}t`;
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString('da-DK');
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'invitation_received': return 'blue';
      case 'invitation_accepted': return 'green';
      case 'child_added': return 'green';
      case 'user_joined_child': return 'purple';
      case 'barometer_entry': return 'orange';
      default: return 'gray';
    }
  };

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top="0"
      right="0"
      width={{ base: "100vw", md: "400px" }}
      height="100vh"
      bg="white"
      boxShadow="xl"
      zIndex={1000}
      borderLeft={{ base: "none", md: "1px solid" }}
      borderColor="gray.200"
    >
      <VStack gap={0} height="100%">
        {/* Header */}
        <HStack
          p={4}
          borderBottom="1px solid"
          borderColor="gray.200"
          width="100%"
          justifyContent="space-between"
        >
          <HStack>
            <BellIcon size={20} className="text-delft-blue-500" />
            <Text fontWeight="600" className="text-delft-blue-600">
              Notifikationer
            </Text>
            {unreadCount > 0 && (
              <Badge colorScheme="red" borderRadius="full">
                {unreadCount}
              </Badge>
            )}
          </HStack>
          <HStack>
            {unreadCount > 0 && (
              <Button size="sm" variant="ghost" onClick={markAllAsRead}>
                <CheckIcon size={16} />
                Markér alle
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </HStack>
        </HStack>

        {/* Content */}
        <Box flex={1} width="100%" overflowY="auto">
          {loading ? (
            <Box p={8} textAlign="center">
              <Spinner size="lg" className="text-delft-blue-500" />
            </Box>
          ) : notifications.length === 0 ? (
            <Box p={8} textAlign="center">
              <Text className="text-gray-500">Ingen notifikationer</Text>
            </Box>
          ) : (
            <VStack gap={0} align="stretch">
              {notifications.map((notification) => {
                const notificationContent = (
                  <Box
                    key={notification.id}
                    p={4}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    cursor="pointer"
                    bg={notification.read ? 'white' : 'blue.50'}
                    _hover={{ bg: notification.read ? 'gray.50' : 'blue.100' }}
                    onClick={() => notification.type !== 'invitation_received' ? handleNotificationClick(notification) : undefined}
                  >
                    <HStack align="start" gap={3}>
                      <Badge
                        colorScheme={getNotificationTypeColor(notification.type)}
                        size="sm"
                        borderRadius="full"
                      >
                        {notification.type === 'invitation_received' && '📬'}
                        {notification.type === 'invitation_accepted' && '✅'}
                        {notification.type === 'child_added' && '👶'}
                        {notification.type === 'user_joined_child' && '👥'}
                        {notification.type === 'barometer_entry' && '📊'}
                      </Badge>
                      <VStack align="start" gap={1} flex={1}>
                        <Text
                          fontWeight={notification.read ? 'normal' : 'semibold'}
                          fontSize="sm"
                          className="text-delft-blue-600"
                        >
                          {notification.title}
                        </Text>
                        <Text
                          fontSize="xs"
                          className="text-gray-600"
                          lineHeight="1.4"
                        >
                          {notification.message}
                        </Text>
                        <Text fontSize="xs" className="text-gray-400">
                          {formatTime(notification.createdAt)}
                        </Text>
                      </VStack>
                      {!notification.read && (
                        <Box
                          width="8px"
                          height="8px"
                          borderRadius="full"
                          bg="blue.500"
                        />
                      )}
                    </HStack>
                  </Box>
                );

                // Wrap invitation notifications with the AcceptInvitationDialog
                if (notification.type === 'invitation_received' && notification.data) {
                  return (
                    <AcceptInvitationDialog
                      key={notification.id}
                      trigger={notificationContent}
                      invitationToken={notification.data.invitationToken as string}
                      childName={notification.data.childName as string}
                      inviterName={notification.data.inviterName as string}
                      onAccept={() => {
                        markAsRead(notification.id);
                        onClose();
                        fetchNotifications(); // Refresh notifications
                      }}
                    />
                  );
                }

                return notificationContent;
              })}
            </VStack>
          )}
        </Box>
      </VStack>
    </Box>
  );
}

interface NotificationBellProps {
  onClick: () => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const user = useUser();

  const fetchUnreadCount = useCallback(async (retryCount = 0) => {
    // Don't fetch if user is not authenticated
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const response = await fetch('/api/notifications?unreadOnly=true', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      } else if (response.status === 401) {
        // User is not authenticated, reset count
        setUnreadCount(0);
      } else {
        console.warn(`Failed to fetch notifications: ${response.status}`);
        if (retryCount < 2) {
          // Retry after a short delay
          setTimeout(() => fetchUnreadCount(retryCount + 1), 1000 * (retryCount + 1));
        }
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
      if (retryCount < 2) {
        // Retry after a short delay for network errors
        setTimeout(() => fetchUnreadCount(retryCount + 1), 1000 * (retryCount + 1));
      }
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();
    
    // Only set up polling if user is authenticated
    if (user) {
      // Refresh count every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchUnreadCount, user]);

  return (
    <Box position="relative">
      <IconButton
        aria-label="Notifikationer"
        variant="ghost"
        onClick={onClick}
        size="sm"
      >
        <BellIcon size={20} className="text-delft-blue-500" />
      </IconButton>
      {unreadCount > 0 && (
        <Badge
          position="absolute"
          top="-2px"
          right="-2px"
          colorScheme="red"
          borderRadius="full"
          fontSize="xs"
          minWidth="18px"
          height="18px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1}
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Box>
  );
}
