import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  createDagensSmiley, 
  getAccessibleDagensSmileyForChild, 
  getUserByStackAuthId,
  isUserAdministratorForChild,
  getUsersForChild
} from '@/lib/database-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const { childId: childIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const childId = parseInt(childIdParam);
    if (isNaN(childId)) {
      return NextResponse.json({ error: 'Invalid child ID' }, { status: 400 });
    }

    const smileys = await getAccessibleDagensSmileyForChild(childId, dbUser.id);
    return NextResponse.json({ smileys });

  } catch (error) {
    console.error('Error fetching dagens smiley:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const { childId: childIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const childId = parseInt(childIdParam);
    if (isNaN(childId)) {
      return NextResponse.json({ error: 'Invalid child ID' }, { status: 400 });
    }

    // Check if user is admin for this child
    const isAdmin = await isUserAdministratorForChild(dbUser.id, childId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only administrators can create dagens smiley tools' }, { status: 403 });
    }

    const { topic, description, isPublic = true, accessibleUserIds = [] } = await request.json();

    // Basic validation
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // If not public and accessibleUserIds provided, validate they are all related to this child
    if (!isPublic && accessibleUserIds.length > 0) {
      const childUsers = await getUsersForChild(childId);
      const validUserIds = childUsers.map(u => u.id);
      
      const invalidUserIds = accessibleUserIds.filter((id: number) => !validUserIds.includes(id));
      if (invalidUserIds.length > 0) {
        return NextResponse.json({ 
          error: 'Some user IDs do not have access to this child' 
        }, { status: 400 });
      }
    }

    const smiley = await createDagensSmiley(
      childId,
      dbUser.id,
      topic.trim(),
      description?.trim(),
      isPublic,
      accessibleUserIds
    );

    if (!smiley) {
      return NextResponse.json({ error: 'Failed to create dagens smiley' }, { status: 500 });
    }

    return NextResponse.json(smiley, { status: 201 });

  } catch (error) {
    console.error('Error creating dagens smiley:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
