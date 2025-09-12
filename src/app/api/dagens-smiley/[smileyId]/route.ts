import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  deleteDagensSmiley, 
  getUserByStackAuthId,
  getDagensSmileyById,
  isUserAdministratorForChild,
  updateDagensSmiley 
} from '@/lib/database-service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ smileyId: string }> }
) {
  try {
    const { smileyId: smileyIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const smileyId = parseInt(smileyIdParam);
    if (isNaN(smileyId)) {
      return NextResponse.json({ error: 'Invalid smiley ID' }, { status: 400 });
    }

    // Get the smiley to check child ID
    const smiley = await getDagensSmileyById(smileyId);
    if (!smiley) {
      return NextResponse.json({ error: 'Smiley not found' }, { status: 404 });
    }

    // Check if user is admin for the child this smiley belongs to
    const isAdmin = await isUserAdministratorForChild(dbUser.id, smiley.childId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only administrators can delete dagens smiley tools' }, { status: 403 });
    }

    const success = await deleteDagensSmiley(smileyId);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete dagens smiley' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Dagens smiley deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting dagens smiley:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ smileyId: string }> }
) {
  try {
    const { smileyId: smileyIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const smileyId = parseInt(smileyIdParam);
    if (isNaN(smileyId)) {
      return NextResponse.json({ error: 'Invalid smiley ID' }, { status: 400 });
    }

    const { topic, description, isPublic, accessibleUserIds } = await request.json();

    // Basic validation
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    // Get existing smiley to check permissions
    const existingSmiley = await getDagensSmileyById(smileyId);
    if (!existingSmiley) {
      return NextResponse.json({ error: 'Smiley not found' }, { status: 404 });
    }

    // Check if user owns the smiley or is admin for the child
    const isOwner = existingSmiley.createdBy === dbUser.id;
    const isAdmin = await isUserAdministratorForChild(dbUser.id, existingSmiley.childId);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the smiley
    const updatedSmiley = await updateDagensSmiley(
      smileyId,
      topic.trim(),
      description?.trim(),
      isPublic,
      accessibleUserIds
    );

    if (!updatedSmiley) {
      return NextResponse.json({ error: 'Failed to update dagens smiley' }, { status: 500 });
    }

    return NextResponse.json(updatedSmiley);

  } catch (error) {
    console.error('Error updating dagens smiley:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
