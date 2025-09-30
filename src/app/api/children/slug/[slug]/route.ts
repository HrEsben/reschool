import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { getChildBySlug, getChildWithUsersAndInvitations, getUserByStackAuthId, UserWithRelation } from '@/lib/database-service';

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
    

    // Get current user from database
    const currentUser = await getUserByStackAuthId(user.id);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // First get the child by slug
    const child = await getChildBySlug(slug);
    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Get child with all connected users and pending invitations
    const childData = await getChildWithUsersAndInvitations(child.id);
    if (!childData) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Check if current user has access to this child
    const userHasAccess = childData.users.some((u: UserWithRelation) => u.id === currentUser.id);
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
