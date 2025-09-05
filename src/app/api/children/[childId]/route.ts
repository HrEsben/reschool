import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { getChildWithUsers, getUserByStackAuthId, deleteChild } from '@/lib/database-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const childId = parseInt(resolvedParams.childId);
    console.log('Child profile request for ID:', childId);
    
    if (isNaN(childId)) {
      console.log('Invalid child ID:', resolvedParams.childId);
      return NextResponse.json({ error: 'Invalid child ID' }, { status: 400 });
    }

    // Get current user from database
    const currentUser = await getUserByStackAuthId(user.id);
    if (!currentUser) {
      console.log('User not found in database:', user.id);
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    console.log('Current user:', currentUser.id, currentUser.email);

    // Get child with all connected users
    const childData = await getChildWithUsers(childId);
    if (!childData) {
      console.log('Child not found:', childId);
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    console.log('Child found:', childData.child.name, 'with', childData.users.length, 'users');

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const childId = parseInt(resolvedParams.childId);
    
    if (isNaN(childId)) {
      return NextResponse.json({ error: 'Invalid child ID' }, { status: 400 });
    }

    // Get current user from database
    const currentUser = await getUserByStackAuthId(user.id);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Attempt to delete the child (this will check admin permissions)
    const success = await deleteChild(childId, currentUser.id);
    
    if (!success) {
      return NextResponse.json({ 
        error: 'Failed to delete child. You must be an administrator to delete a child.' 
      }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting child:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
