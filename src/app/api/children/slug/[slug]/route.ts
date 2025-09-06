import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { getChildBySlug, getChildWithUsersAndInvitations, getUserByStackAuthId } from '@/lib/database-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    
    console.log('Child profile request for slug:', slug);

    // Get current user from database
    const currentUser = await getUserByStackAuthId(user.id);
    if (!currentUser) {
      console.log('User not found in database:', user.id);
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // First get the child by slug
    const child = await getChildBySlug(slug);
    if (!child) {
      console.log('Child not found for slug:', slug);
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Get child with all connected users and pending invitations
    const childData = await getChildWithUsersAndInvitations(child.id);
    if (!childData) {
      console.log('Child data not found:', child.id);
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    console.log('Child found:', childData.child.name, 'with', childData.users.length, 'users and', childData.invitations.length, 'pending invitations');

    // Check if current user has access to this child
    const userHasAccess = childData.users.some((u: any) => u.id === currentUser.id);
    if (!userHasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json(childData);
  } catch (error) {
    console.error('Error fetching child profile by slug:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
