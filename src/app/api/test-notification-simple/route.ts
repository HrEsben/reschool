import { NextRequest, NextResponse } from 'next/server';
import { notifyChildSubmission } from '@/lib/novu-eu';

export async function POST(request: NextRequest) {
  try {
    // This is a simple test endpoint that doesn't require authentication
    // It uses hardcoded test data to verify the notification workflow
    
    const testSubscriberIds = ['test-user-123']; // Replace with actual subscriber ID for testing
    const childName = 'Test Child';
    const toolName = 'Test Barometer';
    const toolType = 'barometer' as const;
    const submittedByName = 'Test Parent';
    const submissionData = {
      rating: 4,
      comment: 'Child is doing well today',
      scale_min: 1,
      scale_max: 5
    };

    console.log('🧪 Testing child submission notification...');
    console.log('Subscriber IDs:', testSubscriberIds);
    console.log('Child Name:', childName);
    console.log('Tool:', toolName, '(' + toolType + ')');
    console.log('Submitted by:', submittedByName);
    console.log('Data:', submissionData);

    const results = await notifyChildSubmission(
      testSubscriberIds,
      childName,
      toolName,
      toolType,
      submittedByName,
      submissionData
    );

    console.log('✅ Notification results:', results);

    return NextResponse.json({
      success: true,
      message: 'Test notification sent successfully',
      results: results,
      testData: {
        subscriberIds: testSubscriberIds,
        childName,
        toolName,
        toolType,
        submittedByName,
        submissionData
      }
    });

  } catch (error) {
    console.error('❌ Error testing notification:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
