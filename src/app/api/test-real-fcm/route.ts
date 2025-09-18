import { NextRequest, NextResponse } from 'next/server';
import { createNovuSubscriber, addFCMTokenToSubscriber, notifyChildSubmission } from '@/lib/novu-eu';

export async function POST(request: NextRequest) {
  try {
    const { fcmToken, subscriberId } = await request.json();

    if (!fcmToken) {
      return NextResponse.json({
        success: false,
        error: 'FCM token is required',
        instructions: [
          'Get a real FCM token from your frontend using getFCMToken()',
          'Then test with: { "fcmToken": "your-real-token" }'
        ]
      }, { status: 400 });
    }

    const testSubscriberId = subscriberId || `real-test-${Date.now()}`;

    console.log('🧪 Testing with real FCM token...');
    console.log('Subscriber ID:', testSubscriberId);
    console.log('FCM Token (first 30 chars):', fcmToken.substring(0, 30) + '...');
    console.log('FCM Token length:', fcmToken.length);

    // Validate FCM token format
    if (fcmToken.length < 140 || fcmToken.length > 160) {
      console.warn('⚠️ FCM token length seems unusual:', fcmToken.length);
    }

    // Step 1: Create subscriber
    console.log('Creating subscriber...');
    const subscriberResult = await createNovuSubscriber(
      testSubscriberId,
      'realtest@example.com',
      'Real',
      'Test'
    );

    if (!subscriberResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create subscriber',
        details: subscriberResult.error
      }, { status: 500 });
    }

    console.log('✅ Subscriber created');

    // Step 2: Add real FCM token
    console.log('Adding FCM token...');
    const tokenResult = await addFCMTokenToSubscriber(testSubscriberId, fcmToken);
    
    if (!tokenResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to add FCM token',
        details: tokenResult.error
      }, { status: 500 });
    }

    console.log('✅ Real FCM token added');

    // Step 3: Send test notification
    console.log('Sending notification...');
    const notificationResult = await notifyChildSubmission(
      [testSubscriberId],
      'Emma Test',
      'Real FCM Test',
      'barometer',
      'Real Push Tester',
      {
        rating: 5,
        comment: 'Testing with real FCM token - you should receive this push notification!',
        scale_min: 1,
        scale_max: 5
      }
    );

    const success = notificationResult[0]?.success || false;
    
    return NextResponse.json({
      success: true,
      message: success 
        ? '🎉 Real FCM test completed! Check your device for the push notification.'
        : '⚠️ Notification processed but may have delivery issues.',
      results: {
        subscriberCreated: subscriberResult.success,
        fcmTokenAdded: tokenResult.success,
        notificationSent: success,
        transactionId: notificationResult[0]?.data?.result?.transactionId
      },
      testData: {
        subscriberId: testSubscriberId,
        fcmTokenLength: fcmToken.length,
        notificationResult: notificationResult[0]
      },
      nextSteps: [
        'Check your device/browser for the push notification',
        'Check Novu Dashboard → Activity for delivery status',
        'If no push received, check:',
        '  - Device has notification permissions',
        '  - FCM token is from the correct Firebase project',
        '  - Browser/app is properly registered for notifications'
      ]
    });

  } catch (error) {
    console.error('❌ Error in real FCM test:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test real FCM token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Real FCM Token Test',
    instructions: [
      '1. Get a real FCM token from your frontend:',
      '   - Use getFCMToken() function',
      '   - Ensure user has granted notification permission',
      '2. Test with POST request:',
      '   { "fcmToken": "your-real-fcm-token" }',
      '3. Check device for actual push notification'
    ],
    endpoint: '/api/test-real-fcm',
    note: 'This tests with real FCM tokens and should deliver actual push notifications'
  });
}
