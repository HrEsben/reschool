// Frontend utility for registering push notifications
import { getFCMToken, requestNotificationPermission } from './firebase';

interface NotificationRegistrationResult {
  success: boolean;
  message: string;
  canReceiveNotifications?: boolean;
  error?: string;
}

/**
 * Register the current user for push notifications
 * This should be called when user wants to enable notifications
 */
export async function registerForPushNotifications(platform: string = 'web'): Promise<NotificationRegistrationResult> {
  try {
    console.log('📱 Starting push notification registration...');

    // Step 1: Request notification permission
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return {
        success: false,
        message: 'Notification permission denied. Please enable notifications in your browser settings.',
        error: 'PERMISSION_DENIED'
      };
    }

    console.log('✅ Notification permission granted');

    // Step 2: Get FCM token
    const fcmToken = await getFCMToken();
    if (!fcmToken) {
      return {
        success: false,
        message: 'Failed to get device token. Please try again.',
        error: 'TOKEN_FAILED'
      };
    }

    console.log('✅ FCM token obtained:', fcmToken.substring(0, 20) + '...');

    // Step 3: Register with backend
    const response = await fetch('/api/notifications/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fcmToken,
        platform
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Registration failed:', result);
      return {
        success: false,
        message: result.message || 'Failed to register for push notifications',
        error: 'REGISTRATION_FAILED'
      };
    }

    console.log('✅ Push notifications registered successfully');
    return {
      success: true,
      message: result.message || 'Push notifications enabled!',
      canReceiveNotifications: result.data?.canReceiveNotifications || true
    };

  } catch (error) {
    console.error('❌ Error registering for push notifications:', error);
    return {
      success: false,
      message: 'An unexpected error occurred while setting up notifications',
      error: 'UNEXPECTED_ERROR'
    };
  }
}

/**
 * Check if the browser supports push notifications
 */
export function isPushNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Get current notification permission status
 */
export function getNotificationPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isPushNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
}

/**
 * Hook for React components to handle push notification registration
 */
export function usePushNotifications() {
  const isSupported = isPushNotificationSupported();
  const permission = getNotificationPermissionStatus();

  const register = async (platform?: string) => {
    return await registerForPushNotifications(platform);
  };

  return {
    isSupported,
    permission,
    register,
    canRegister: isSupported && permission !== 'denied'
  };
}
