import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { getUserByStackAuthId } from '@/lib/database-service';
import { novu, addFCMTokenToSubscriber } from '@/lib/novu-eu';

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { fcmToken, platform } = await request.json();

    if (!fcmToken) {
      return NextResponse.json({ error: 'FCM token is required' }, { status: 400 });
    }

    // Validate FCM token format
    if (typeof fcmToken !== 'string' || fcmToken.length < 100) {
      return NextResponse.json({ 
        error: 'Invalid FCM token format',
        message: 'FCM token must be a valid string from Firebase'
      }, { status: 400 });
    }

    console.log(`📱 Registering notifications for user ${user.id} on ${platform || 'unknown'}`);
    console.log(`FCM token: ${fcmToken.substring(0, 20)}...`);

    // Register or update the subscriber with FCM token in Novu
    try {
      // Create or update the subscriber - this handles upsert automatically
      const subscriberResult = await novu.subscribers.create({
        subscriberId: user.id,
        email: dbUser.email,
        firstName: dbUser.displayName?.split(' ')[0] || 'User',
        lastName: dbUser.displayName?.split(' ').slice(1).join(' ') || '',
        data: {
          platform: platform || 'web',
          registeredAt: new Date().toISOString(),
          stackAuthId: user.id
        }
      });

      console.log(`✅ Subscriber created/updated for user ${user.id}`);

      // Add FCM token for push notifications
      const fcmResult = await addFCMTokenToSubscriber(user.id, fcmToken);
      
      if (!fcmResult.success) {
        console.error('❌ Failed to add FCM token:', fcmResult.error);
        return NextResponse.json({ 
          error: 'Failed to register device for push notifications',
          details: 'FCM token could not be registered. Please try again.',
          subscriberCreated: true,
          fcmTokenAdded: false
        }, { status: 500 });
      }

      console.log(`✅ FCM token registered successfully for user ${user.id}`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Push notifications enabled successfully!',
        data: {
          subscriberId: user.id,
          platform: platform || 'web',
          fcmTokenRegistered: true,
          canReceiveNotifications: true
        }
      });

    } catch (novuError: any) {
      console.error('❌ Novu registration error:', novuError);
      
      // Handle specific Novu errors
      if (novuError?.message?.includes('already exists')) {
        // Try to just update the FCM token for existing subscriber
        console.log('Subscriber exists, updating FCM token...');
        const fcmResult = await addFCMTokenToSubscriber(user.id, fcmToken);
        
        if (fcmResult.success) {
          return NextResponse.json({ 
            success: true, 
            message: 'Push notifications updated successfully!',
            data: {
              subscriberId: user.id,
              platform: platform || 'web',
              fcmTokenRegistered: true,
              canReceiveNotifications: true
            }
          });
        }
      }
      
      return NextResponse.json({ 
        error: 'Failed to register with notification service',
        message: 'Could not enable push notifications. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? novuError.message : undefined
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('❌ Error in FCM registration endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Failed to register for push notifications',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
