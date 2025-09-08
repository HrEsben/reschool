'use client';

import { useState, useEffect } from 'react';
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

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const markAsRead = async (notificationId: number) => {
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
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
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
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
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
      width="400px"
      height="100vh"
      bg="white"
      boxShadow="xl"
      zIndex={1000}
      borderLeft="1px solid"
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
              {notifications.map((notification) => (
                <Box
                  key={notification.id}
                  p={4}
                  borderBottom="1px solid"
                  borderColor="gray.100"
                  cursor="pointer"
                  bg={notification.read ? 'white' : 'blue.50'}
                  _hover={{ bg: notification.read ? 'gray.50' : 'blue.100' }}
                  onClick={() => handleNotificationClick(notification)}
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
              ))}
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

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/notifications?unreadOnly=true');
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

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
