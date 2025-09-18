import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  getUserByStackAuthId,
  getChildrenForUser,
  getUsersForChild
} from '@/lib/database-service';
import { notifyChildSubmission } from '@/lib/novu-eu';

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

    // Get first child for this user
    const children = await getChildrenForUser(dbUser.id);
    if (children.length === 0) {
      return NextResponse.json({ error: 'No children found for user' }, { status: 404 });
    }

    const firstChild = children[0];
    
    // Get all users for this child
    const childUsers = await getUsersForChild(firstChild.id);
    
    // Get subscriber IDs (exclude the current user)
    const subscriberIds = childUsers
      .filter(user => user.id !== dbUser.id)
      .map(user => user.stackAuthId)
      .filter(Boolean);

    if (subscriberIds.length === 0) {
      return NextResponse.json({ 
        message: 'No other users to notify',
        child: firstChild.name,
        totalUsers: childUsers.length
      });
    }

    // Test notification
    const results = await notifyChildSubmission(
      subscriberIds,
      firstChild.name,
      'Test Barometer',
      'barometer',
      dbUser.displayName || 'Test bruger',
      {
        rating: 4,
        comment: 'Dette er en test registrering',
        scale_min: 1,
        scale_max: 5
      }
    );

    return NextResponse.json({
      message: 'Test notification sent',
      child: firstChild.name,
      notifiedUsers: subscriberIds.length,
      results: results
    });

  } catch (error) {
    console.error('Error testing submission notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
