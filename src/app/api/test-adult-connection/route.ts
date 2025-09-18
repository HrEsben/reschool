import { NextRequest, NextResponse } from 'next/server';
import { notifyAdultConnectedToChild } from '@/lib/novu-eu';

export async function POST(request: NextRequest) {
  try {
    const { subscriberId } = await request.json();
    
    const testSubscriberId = subscriberId || 'test-user-inbox';

    console.log('🧪 Testing ny-voksen-til-barn workflow...');
    console.log('Subscriber ID:', testSubscriberId);

    const results = await notifyAdultConnectedToChild(
      [testSubscriberId],
      'Maria Hansen',        // adult_name
      'Emma Test',          // child_name  
      'Mor',                // adult_relation
      'Lars Testsen'        // inviter_name
    );

    const success = results[0]?.success || false;
    
    if (success) {
      console.log('✅ ny-voksen-til-barn notification sent successfully');
      return NextResponse.json({
        success: true,
        message: 'Adult connection notification sent!',
        result: results[0],
        testData: {
          subscriberId: testSubscriberId,
          adult_name: 'Maria Hansen',
          child_name: 'Emma Test',
          adult_relation: 'Mor', 
          inviter_name: 'Lars Testsen'
        }
      });
    } else {
      console.log('❌ ny-voksen-til-barn notification failed:', results[0]?.error);
      return NextResponse.json({
        success: false,
        error: 'Notification failed',
        details: results[0]?.error,
        needsSchemaFix: true,
        schemaRequired: {
          adult_name: "string",
          child_name: "string", 
          adult_relation: "string",
          inviter_name: "string",
          timestamp: "string"
        }
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error testing ny-voksen-til-barn:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test ny-voksen-til-barn Workflow',
    instructions: 'Use POST with optional { "subscriberId": "test-user-inbox" }',
    workflowId: 'ny-voksen-til-barn',
    endpoint: '/api/test-adult-connection'
  });
}
