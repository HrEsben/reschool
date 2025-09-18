import { NextRequest, NextResponse } from 'next/server';
import { createNovuSubscriber, addFCMTokenToSubscriber, notifyChildSubmission } from '@/lib/novu-eu';

export async function POST(request: NextRequest) {
  try {
    const { realFcmToken } = await request.json();

    const testSubscriberId = 'test-user-push-' + Date.now();
    
    // Use provided FCM token or generate a realistic test one
    const fcmToken = realFcmToken || generateRealisticFCMToken();

    console.log('🧪 Testing complete push notification flow...');
    console.log('Subscriber ID:', testSubscriberId);
    console.log('FCM Token:', fcmToken.substring(0, 30) + '...');

    // Step 1: Create subscriber first
    const subscriberResult = await createNovuSubscriber(
      testSubscriberId,
      'test@example.com',
      'Test',
      'User'
    );

    if (!subscriberResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to create subscriber',
        details: subscriberResult.error
      }, { status: 500 });
    }

    console.log('✅ Subscriber created successfully');

    // Step 2: Add FCM token to subscriber
    const tokenResult = await addFCMTokenToSubscriber(testSubscriberId, fcmToken);
    
    if (!tokenResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to add FCM token',
        details: tokenResult.error
      }, { status: 500 });
    }

    console.log('✅ FCM token added successfully');

    // Step 3: Send notification with both In-App and Push
    const notificationResult = await notifyChildSubmission(
      [testSubscriberId],
      'Test Child',
      'Complete Push Test',
      'barometer',
      'Push Tester',
      {
        rating: 5,
        comment: 'Testing complete push notification flow with real FCM setup',
        scale_min: 1,
        scale_max: 5
      }
    );

    console.log('📱 Notification sent:', notificationResult);

    return NextResponse.json({
      success: true,
      message: 'Complete push notification test completed!',
      steps: {
        subscriberCreated: subscriberResult.success,
        fcmTokenAdded: tokenResult.success,
        notificationSent: notificationResult[0]?.success || false
      },
      testData: {
        subscriberId: testSubscriberId,
        fcmToken: fcmToken.substring(0, 30) + '...',
        notificationResult: notificationResult[0]
      },
      instructions: [
        'Check Novu Dashboard Activity Log for delivery status',
        'For real push delivery, ensure:',
        '1. FCM service account JSON is correctly configured in Novu',
        '2. The FCM token belongs to a real device/browser',
        '3. Workflow has both In-App and Push steps enabled'
      ]
    });

  } catch (error) {
    console.error('❌ Error in complete push test:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to complete push test',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

function generateRealisticFCMToken(): string {
  // Generate a more realistic FCM token format for testing
  // Real FCM tokens are base64url encoded and ~152 characters
  // Note: This is still fake and will be rejected by FCM, but tests our integration
  const segments = [
    'eHcWrg0CTB0', // ~11 chars
    Math.random().toString(36).substring(2, 15), // ~13 chars  
    'APA91bG', // FCM prefix pattern
    Array.from({length: 120}, () => 
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
      .charAt(Math.floor(Math.random() * 64))
    ).join('')
  ];
  return segments.join('');
}

export async function GET() {
  return NextResponse.json({
    message: 'Complete Push Notification Test',
    instructions: 'Use POST with optional { "realFcmToken": "your-actual-fcm-token" }',
    note: 'This will create a new test subscriber, add FCM token, and send notification',
    endpoint: '/api/test-complete-push'
  });
}
