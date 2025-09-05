import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { getUserByStackAuthId, removeUserFromChild, getChildWithUsers } from '@/lib/database-service';

export async function DELETE(
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
      return NextResponse.json({ error: 'Only administrators can remove users' }, { status: 403 });
    }

    // Check if user to be removed exists
    const userToRemove = childData.users.find(u => u.id === parseInt(userId));
    if (!userToRemove) {
      return NextResponse.json({ error: 'User not found for this child' }, { status: 404 });
    }

    // Prevent removing the last administrator
    const adminCount = childData.users.filter(u => u.isAdministrator).length;
    if (userToRemove.isAdministrator && adminCount <= 1) {
      return NextResponse.json({ 
        error: 'Cannot remove the last administrator. There must always be at least one administrator.' 
      }, { status: 400 });
    }

    // Remove user from child
    await removeUserFromChild(parseInt(childId), parseInt(userId));

    return NextResponse.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Error removing user from child:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
