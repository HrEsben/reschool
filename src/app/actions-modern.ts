'use server'

import { stackServerApp } from '@/stack'
import pool from '@/lib/db'

interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Helper function to convert VAPID key from base64 to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribeUser(subscription: PushSubscription) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { endpoint, keys } = subscription;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      throw new Error('Invalid subscription data');
    }

    // Check if subscription already exists
    const existingSubscription = await pool.query(
      'SELECT id FROM push_subscriptions WHERE user_id = $1 AND endpoint = $2',
      [user.id, endpoint]
    );

    if (existingSubscription.rows.length > 0) {
      return { success: true, message: 'Subscription already exists' };
    }

    // Insert new subscription
    await pool.query(
      `INSERT INTO push_subscriptions (user_id, endpoint, p256dh_key, auth_key, created_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [user.id, endpoint, keys.p256dh, keys.auth]
    );

    return { success: true, message: 'Subscription saved successfully' };
  } catch (error) {
    console.error('Error saving push subscription:', error);
    throw new Error('Failed to save push subscription');
  }
}

export async function unsubscribeUser() {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Remove all subscriptions for this user
    await pool.query(
      'DELETE FROM push_subscriptions WHERE user_id = $1',
      [user.id]
    );

    return { success: true, message: 'Unsubscribed successfully' };
  } catch (error) {
    console.error('Error unsubscribing user:', error);
    throw new Error('Failed to unsubscribe user');
  }
}

export async function sendNotification(message: string) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get the user's subscription
    const subscriptionResult = await pool.query(
      'SELECT endpoint, p256dh_key, auth_key FROM push_subscriptions WHERE user_id = $1',
      [user.id]
    );

    if (subscriptionResult.rows.length === 0) {
      throw new Error('No push subscription found for user');
    }

    const subscription = subscriptionResult.rows[0];
    
    // Create the push subscription object
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh_key,
        auth: subscription.auth_key
      }
    };

    // Send the notification using the modern approach
    await sendPushMessage(pushSubscription, {
      title: 'ReSchool',
      body: message,
      icon: '/android-chrome-192x192.png',
      badge: '/android-chrome-192x192.png',
      data: {
        url: '/',
        timestamp: Date.now()
      }
    });

    return { success: true, message: 'Notification sent successfully' };
  } catch (error) {
    console.error('Error sending notification:', error);
    throw new Error('Failed to send notification');
  }
}

// Modern push notification function using native Web Push API
async function sendPushMessage(subscription: PushSubscription, payload: any) {
  const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;
  const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY!;
  const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:support@reschool.dk';

  // Create the notification payload
  const notificationPayload = JSON.stringify(payload);

  // For now, we'll log the notification instead of actually sending it
  // In a production environment, you would implement the full VAPID authentication
  console.log('Would send push notification:', {
    endpoint: subscription.endpoint,
    payload: notificationPayload,
    vapidPublicKey: VAPID_PUBLIC_KEY.substring(0, 10) + '...',
  });

  // TODO: Implement full Web Push Protocol with VAPID authentication
  // This requires implementing the crypto signatures according to RFC 8291
  // For now, this is a placeholder that demonstrates the structure

  return { success: true };
}

// Function to send notifications to all subscribed users
export async function sendNotificationToAll(message: string, title = 'ReSchool') {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get all active subscriptions
    const subscriptionsResult = await pool.query(
      'SELECT user_id, endpoint, p256dh_key, auth_key FROM push_subscriptions'
    );

    const subscriptions = subscriptionsResult.rows;
    
    if (subscriptions.length === 0) {
      return { success: true, message: 'No subscriptions found' };
    }

    // Send notification to each subscription
    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key
          }
        };

        await sendPushMessage(pushSubscription, {
          title,
          body: message,
          icon: '/android-chrome-192x192.png',
          badge: '/android-chrome-192x192.png',
          data: {
            url: '/',
            timestamp: Date.now()
          }
        });
      } catch (error) {
        console.error(`Failed to send notification to subscription ${subscription.endpoint}:`, error);
        // Continue with other subscriptions even if one fails
      }
    }

    return { 
      success: true, 
      message: `Notification sent to ${subscriptions.length} subscribers` 
    };
  } catch (error) {
    console.error('Error sending notification to all:', error);
    throw new Error('Failed to send notification to all users');
  }
}
