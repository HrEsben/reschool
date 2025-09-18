import { NextRequest, NextResponse } from 'next/server';
import { addFCMTokenToSubscriber } from '@/lib/novu-eu';

export async function POST(request: NextRequest) {
  try {
    const { subscriberId, fcmToken } = await request.json();

    // Use test values if not provided
    const testSubscriberId = subscriberId || 'test-user-inbox';
    const testFcmToken = fcmToken || 'test-fcm-token-' + Date.now();

    console.log('🧪 Testing FCM token addition...');
    console.log('Subscriber ID:', testSubscriberId);
    console.log('FCM Token:', testFcmToken.substring(0, 20) + '...');

    const result = await addFCMTokenToSubscriber(testSubscriberId, testFcmToken);

    if (result.success) {
      console.log('✅ FCM token added successfully');
      return NextResponse.json({
        success: true,
        message: 'FCM token added to subscriber successfully!',
        subscriberId: testSubscriberId,
        fcmToken: testFcmToken.substring(0, 20) + '...',
        result: result.data
      });
    } else {
      console.log('❌ Failed to add FCM token:', result.error);
      return NextResponse.json({
        success: false,
        error: 'Failed to add FCM token',
        details: result.error,
        subscriberId: testSubscriberId
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in test FCM token endpoint:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test FCM token',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'FCM Token Test Endpoint',
    instructions: 'Use POST with { "subscriberId": "test-user-inbox", "fcmToken": "your-token" }',
    endpoint: '/api/test-fcm-token'
  });
}
