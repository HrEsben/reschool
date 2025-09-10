import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { getUserByStackAuthId, promoteUserToAdmin, getChildWithUsers } from '@/lib/database-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string; userId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { childId, userId } = resolvedParams;

    // Get current user from database
    const currentUser = await getUserByStackAuthId(user.id);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Check if current user is admin for this child
    const childData = await getChildWithUsers(parseInt(childId));
    if (!childData) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    const currentUserData = childData.users.find(u => u.id === currentUser.id);
    if (!currentUserData || !currentUserData.isAdministrator) {
      return NextResponse.json({ error: 'Only administrators can promote users to admin' }, { status: 403 });
    }

    // Check if user to be promoted exists
    const userToPromote = childData.users.find(u => u.id === parseInt(userId));
    if (!userToPromote) {
      return NextResponse.json({ error: 'User not found for this child' }, { status: 404 });
    }

    // Check if user is already an admin
    if (userToPromote.isAdministrator) {
      return NextResponse.json({ error: 'User is already an administrator' }, { status: 400 });
    }

    // Promote user to admin
    const success = await promoteUserToAdmin(parseInt(childId), parseInt(userId));
    if (!success) {
      return NextResponse.json({ error: 'Failed to promote user to admin' }, { status: 500 });
    }

    return NextResponse.json({ message: 'User promoted to administrator successfully' });
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
