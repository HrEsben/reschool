import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  getUserBySlug, 
  getChildrenForUser,
  getUserByStackAuthId,
  type User,
  type ChildWithRelation
} from '@/lib/database-service';

interface UserProfileResponse {
  user: User;
  children: ChildWithRelation[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userSlug: string } }
) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Ikke autoriseret' }, { status: 401 });
    }

    const userSlug = params.userSlug;
    
    // Get the target user by slug
    const targetUser = await getUserBySlug(userSlug);

    if (!targetUser) {
      return NextResponse.json({ error: 'Bruger ikke fundet' }, { status: 404 });
    }

    // Get the current user from database
    const currentUser = await getUserByStackAuthId(user.id);
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Aktuel bruger ikke fundet' }, { status: 401 });
    }

    // Get the children this user is connected to
    const childConnections = await getChildrenForUser(targetUser.id);

    // Check if current user has access to view this profile
    // They can view if it's their own profile or if they share any children
    let hasAccess = targetUser.stackAuthId === user.id;
    
    if (!hasAccess) {
      // Check if they share any children
      const currentUserChildren = await getChildrenForUser(currentUser.id);
      const sharedChildren = childConnections.filter(targetChild => 
        currentUserChildren.some(currentChild => currentChild.id === targetChild.id)
      );
      hasAccess = sharedChildren.length > 0;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: 'Du har ikke adgang til denne brugerprofil' }, { status: 403 });
    }

    // Format the response
    const userProfile: UserProfileResponse = {
      user: targetUser,
      children: childConnections
    };

    return NextResponse.json(userProfile);

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Der opstod en fejl ved hentning af brugerprofilen' },
      { status: 500 }
    );
  }
}
