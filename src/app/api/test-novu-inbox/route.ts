import { NextRequest, NextResponse } from 'next/server';
import { notifyChildSubmission } from '@/lib/novu-eu';

export async function POST(request: NextRequest) {
  try {
    // Simple test without authentication - using hardcoded test data
    // This will send a notification that you'll see in your Novu inbox
    
    const testSubscriberIds = ['test-user-inbox']; // Test subscriber ID for inbox
    const childName = 'Emma Testsen';
    const toolName = 'Følelsesbarometer';
    const toolType = 'barometer' as const;
    const submittedByName = 'Mor/Far Test';
    const submissionData = {
      rating: 4,
      comment: 'Emma havde en rigtig god dag i dag og var glad for at lege med sine venner',
      scale_min: 1,
      scale_max: 5
    };

    console.log('🧪 Testing Novu inbox notification...');
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

    console.log('✅ Novu notification sent:', results);

    return NextResponse.json({
      success: true,
      message: 'Novu inbox test notification sent! Check your Novu inbox.',
      results: results,
      instructions: 'This notification should appear in your Novu inbox at https://eu.dashboard.novu.co/',
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
    console.error('❌ Error sending Novu test notification:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send test notification',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Novu Inbox Test Endpoint',
    instructions: 'Use POST to send a test notification to your Novu inbox',
    endpoint: '/api/test-novu-inbox'
  });
}
