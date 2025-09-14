import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  deleteSengetider, 
  getUserByStackAuthId,
  updateSengetider,
  getSengetiderById,
  isUserAdministratorForChild
} from '@/lib/database-service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sengetiderId: string }> }
) {
  try {
    const { sengetiderId: sengetiderIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sengetiderId = parseInt(sengetiderIdParam);
    if (isNaN(sengetiderId)) {
      return NextResponse.json({ error: 'Invalid sengetider ID' }, { status: 400 });
    }

    // Get the sengetider to check permissions
    const sengetiderTool = await getSengetiderById(sengetiderId);
    
    if (!sengetiderTool) {
      return NextResponse.json({ error: 'Sengetider not found' }, { status: 404 });
    }

    // Check if user is admin for the child this sengetider belongs to
    const isAdmin = await isUserAdministratorForChild(dbUser.id, sengetiderTool.childId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only administrators can delete sengetider' }, { status: 403 });
    }

    const success = await deleteSengetider(sengetiderId);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete sengetider' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Sengetider deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting sengetider:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sengetiderId: string }> }
) {
  try {
    const { sengetiderId: sengetiderIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sengetiderId = parseInt(sengetiderIdParam);
    if (isNaN(sengetiderId)) {
      return NextResponse.json({ error: 'Invalid sengetider ID' }, { status: 400 });
    }

    const body = await request.json();
    const { description, isPublic } = body;

    // For security, get the sengetider first to check permissions
    const sengetiderTool = await getSengetiderById(sengetiderId);
    
    if (!sengetiderTool) {
      return NextResponse.json({ error: 'Sengetider not found' }, { status: 404 });
    }

    // Check if user is admin for the child this sengetider belongs to
    const isAdmin = await isUserAdministratorForChild(dbUser.id, sengetiderTool.childId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only administrators can update sengetider' }, { status: 403 });
    }

    const updatedSengetider = await updateSengetider(sengetiderId, {
      description,
      isPublic
    });

    if (!updatedSengetider) {
      return NextResponse.json({ error: 'Failed to update sengetider' }, { status: 500 });
    }

    return NextResponse.json({ sengetider: updatedSengetider }, { status: 200 });

  } catch (error) {
    console.error('Error updating sengetider:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
