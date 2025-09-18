import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { createNovuSubscriber, updateNovuSubscriber } from '@/lib/novu-eu';

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sync user to Novu EU
    const result = await createNovuSubscriber(
      user.id,
      user.primaryEmail || undefined,
      user.displayName?.split(' ')[0] || undefined,
      user.displayName?.split(' ')[1] || undefined
    );

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'User synced to Novu EU successfully',
        subscriberId: user.id,
        region: 'EU (GDPR compliant)'
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to sync user to Novu EU',
        details: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error syncing user to Novu EU:', error);
    return NextResponse.json({ 
      error: 'Failed to sync user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriberData } = await request.json();

    // Update user in Novu EU
    const result = await updateNovuSubscriber(user.id, {
      email: user.primaryEmail || undefined,
      firstName: user.displayName?.split(' ')[0] || undefined,
      lastName: user.displayName?.split(' ')[1] || undefined,
      ...subscriberData
    });

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'User updated in Novu EU successfully',
        subscriberId: user.id
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to update user in Novu EU',
        details: result.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating user in Novu EU:', error);
    return NextResponse.json({ 
      error: 'Failed to update user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
