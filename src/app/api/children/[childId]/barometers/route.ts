import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  createBarometer, 
  getAccessibleBarometersForChild, 
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

    const barometers = await getAccessibleBarometersForChild(childId, dbUser.id);
    return NextResponse.json({ barometers });

  } catch (error) {
    console.error('Error fetching barometers:', error);
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
      return NextResponse.json({ error: 'Only administrators can create barometers' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      topic, 
      description, 
      scaleMin = 1, 
      scaleMax = 5, 
      displayType = 'numbers', 
      smileyType = 'emojis',
      isPublic = true,
      accessibleUserIds = []
    } = body;

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Validate scale range based on display type
    if (displayType === 'percentage') {
      // For percentage barometers, scale should be 0-100
      if (scaleMin !== 0 || scaleMax !== 100) {
        return NextResponse.json({ error: 'Percentage barometers must use 0-100 scale' }, { status: 400 });
      }
    } else {
      // For numbers and smileys, scale should be 1-5 or 1-10
      if (scaleMin >= scaleMax || scaleMin < 1 || scaleMax > 100) {
        return NextResponse.json({ error: 'Invalid scale range' }, { status: 400 });
      }
    }

    const validDisplayTypes = ['numbers', 'smileys', 'percentage'];
    if (!validDisplayTypes.includes(displayType)) {
      return NextResponse.json({ error: 'Invalid display type' }, { status: 400 });
    }

    const validSmileyTypes = ['emojis', 'simple', 'subtle'];
    if (displayType === 'smileys' && !validSmileyTypes.includes(smileyType)) {
      return NextResponse.json({ error: 'Invalid smiley type' }, { status: 400 });
    }

    // Validate access control parameters
    if (typeof isPublic !== 'boolean') {
      return NextResponse.json({ error: 'isPublic must be a boolean' }, { status: 400 });
    }

    if (!Array.isArray(accessibleUserIds)) {
      return NextResponse.json({ error: 'accessibleUserIds must be an array' }, { status: 400 });
    }

    // If not public, validate that accessibleUserIds contains valid user IDs for this child
    if (!isPublic && accessibleUserIds.length > 0) {
      const childUsers = await getUsersForChild(childId);
      const validUserIds = childUsers.map(user => user.id);
      const invalidUserIds = accessibleUserIds.filter(id => !validUserIds.includes(id));
      
      if (invalidUserIds.length > 0) {
        return NextResponse.json({ 
          error: `Invalid user IDs: ${invalidUserIds.join(', ')}. Users must be connected to this child.` 
        }, { status: 400 });
      }
    }

    const barometer = await createBarometer(
      childId, 
      dbUser.id, 
      topic.trim(), 
      scaleMin, 
      scaleMax, 
      displayType, 
      smileyType, 
      description?.trim(),
      isPublic,
      !isPublic ? accessibleUserIds : undefined
    );
    
    if (!barometer) {
      return NextResponse.json({ error: 'Failed to create barometer' }, { status: 500 });
    }

    return NextResponse.json({ barometer }, { status: 201 });

  } catch (error) {
    console.error('Error creating barometer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
