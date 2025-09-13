import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  createSengetider, 
  getSengetiderForChild, 
  getUserByStackAuthId,
  isUserAdministratorForChild
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

    const sengetider = await getSengetiderForChild(childId, dbUser.id);
    return NextResponse.json({ sengetider });

  } catch (error) {
    console.error('Error fetching sengetider:', error);
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
      return NextResponse.json({ error: 'Only administrators can create sengetider' }, { status: 403 });
    }

    const body = await request.json();
    const { topic, description, targetBedtime, isPublic = true, accessibleUserIds } = body;

    // Validate required fields
    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Validate time format if provided
    if (targetBedtime && !/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(targetBedtime)) {
      return NextResponse.json({ error: 'Invalid time format. Use HH:MM or HH:MM:SS' }, { status: 400 });
    }

    // Convert HH:MM to HH:MM:SS if needed
    const formattedTargetBedtime = targetBedtime && !targetBedtime.includes(':') ? 
      `${targetBedtime}:00` : targetBedtime;

    const sengetiderTool = await createSengetider(
      childId,
      dbUser.id,
      topic,
      description,
      formattedTargetBedtime,
      isPublic,
      accessibleUserIds
    );

    if (!sengetiderTool) {
      return NextResponse.json({ error: 'Failed to create sengetider' }, { status: 500 });
    }

    return NextResponse.json({ sengetider: sengetiderTool }, { status: 201 });

  } catch (error) {
    console.error('Error creating sengetider:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
