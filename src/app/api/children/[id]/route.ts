import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { getChildWithUsers, getUserByStackAuthId } from '@/lib/database-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const childId = parseInt(params.id);
    if (isNaN(childId)) {
      return NextResponse.json({ error: 'Invalid child ID' }, { status: 400 });
    }

    // Get current user from database
    const currentUser = await getUserByStackAuthId(user.id);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Get child with all connected users
    const childData = await getChildWithUsers(childId);
    if (!childData) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Check if current user has access to this child
    const userHasAccess = childData.users.some(u => u.id === currentUser.id);
    if (!userHasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(childData);
  } catch (error) {
    console.error('Error fetching child profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
