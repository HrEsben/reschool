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

    // Check if sengetider already exists for this child
    const existingSengetider = await getSengetiderForChild(childId, dbUser.id);
    if (existingSengetider && existingSengetider.length > 0) {
      return NextResponse.json({ error: 'Sengetider already exists for this child. Only one sengetider tool is allowed per child.' }, { status: 400 });
    }

    const body = await request.json();
    const { description, isPublic = true, accessibleUserIds } = body;

    // Create sengetider tool - no topic needed as it's fixed per child
    const sengetiderTool = await createSengetider(
      childId,
      dbUser.id,
      description,
      isPublic,
      accessibleUserIds
    );

    if (!sengetiderTool) {
      return NextResponse.json({ error: 'Failed to create sengetider' }, { status: 500 });
    }

    return NextResponse.json({ sengetider: sengetiderTool }, { status: 201 });

  } catch (error) {
    console.error('Error creating sengetider:', error);
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json({ error: 'Sengetider already exists for this child' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
