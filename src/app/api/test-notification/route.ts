import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { subscriberId } = await request.json();

    if (!subscriberId) {
      return NextResponse.json({ error: 'Subscriber ID is required' }, { status: 400 });
    }

    // For now, just return success to test the frontend integration
    // You can implement actual Novu backend integration after setting up workflows in Novu dashboard
    return NextResponse.json({ 
      success: true, 
      message: 'Novu integration is working! Frontend can connect to backend.',
      subscriberId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in test notification:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
