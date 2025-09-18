// React hook for handling push notifications with Firebase and Novu
'use client';

import { useEffect, useState } from 'react';
import { getFCMToken, requestNotificationPermission, onMessageListener } from '@/lib/firebase';

interface NotificationState {
  permission: NotificationPermission | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useFirebaseNotifications() {
  const [state, setState] = useState<NotificationState>({
    permission: null,
    token: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    // Initialize notification state
    const initializeNotifications = async () => {
      try {
        // Check current permission status
        const currentPermission = Notification.permission;
        setState(prev => ({ ...prev, permission: currentPermission }));

        // If permission is granted, get the FCM token
        if (currentPermission === 'granted') {
          const token = await getFCMToken();
          setState(prev => ({ 
            ...prev, 
            token, 
            isLoading: false,
            error: token ? null : 'Failed to get FCM token'
          }));
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error instanceof Error ? error.message : 'Failed to initialize notifications'
        }));
      }
    };

    initializeNotifications();

    // Listen for foreground messages
    const unsubscribe = onMessageListener()
      .then((payload: any) => {
        console.log('Foreground notification received:', payload);
        
        // Show a custom notification or handle it as needed
        if (payload.notification) {
          // You can customize this to show a toast or in-app notification
          console.log('Notification title:', payload.notification.title);
          console.log('Notification body:', payload.notification.body);
        }
      })
      .catch((error) => {
        console.error('Error listening for messages:', error);
      });

    return () => {
      // Cleanup if needed
    };
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const granted = await requestNotificationPermission();
      
      if (granted) {
        const token = await getFCMToken();
        setState(prev => ({ 
          ...prev, 
          permission: 'granted', 
          token, 
          isLoading: false,
          error: token ? null : 'Failed to get FCM token'
        }));
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          permission: 'denied', 
          isLoading: false,
          error: 'Notification permission denied'
        }));
        return false;
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to request permission'
      }));
      return false;
    }
  };

  return {
    ...state,
    requestPermission,
    isSupported: typeof window !== 'undefined' && 'Notification' in window,
    canRequestPermission: state.permission === 'default'
  };
}

// Hook for integrating FCM token with Novu
export function useNovuIntegration(userId?: string) {
  const { token, permission } = useFirebaseNotifications();
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (token && userId && permission === 'granted') {
      // Register the FCM token with Novu
      registerTokenWithNovu(userId, token);
    }
  }, [token, userId, permission]);

  const registerTokenWithNovu = async (userId: string, fcmToken: string) => {
    try {
      // This would be an API call to your backend to register the FCM token with Novu
      const response = await fetch('/api/notifications/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          fcmToken,
          platform: 'web'
        }),
      });

      if (response.ok) {
        setIsRegistered(true);
        console.log('FCM token registered with Novu successfully');
      } else {
        console.error('Failed to register FCM token with Novu');
      }
    } catch (error) {
      console.error('Error registering FCM token with Novu:', error);
    }
  };

  return {
    isRegistered,
    fcmToken: token
  };
}
