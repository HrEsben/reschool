import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  updateSengetiderEntry,
  deleteSengetiderEntry,
  getUserByStackAuthId,
  getSengetiderById
} from '@/lib/database-service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sengetiderId: string; entryId: string }> }
) {
  try {
    const { sengetiderId: sengetiderIdParam, entryId: entryIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sengetiderId = parseInt(sengetiderIdParam);
    const entryId = parseInt(entryIdParam);
    if (isNaN(sengetiderId) || isNaN(entryId)) {
      return NextResponse.json({ error: 'Invalid sengetider or entry ID' }, { status: 400 });
    }

    // Check if user has access to this sengetider
    const sengetiderTool = await getSengetiderById(sengetiderId);
    if (!sengetiderTool) {
      return NextResponse.json({ error: 'Sengetider not found' }, { status: 404 });
    }
    
    // Additional access check would go here

    const body = await request.json();
    const { entryDate, actualBedtime, notes } = body;

    // Validate date format if provided
    if (entryDate && !/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    // Validate time format if provided
    if (actualBedtime && !/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(actualBedtime)) {
      return NextResponse.json({ error: 'Invalid time format. Use HH:MM or HH:MM:SS' }, { status: 400 });
    }

    // Convert HH:MM to HH:MM:SS if needed
    const formattedBedtime = actualBedtime && actualBedtime.includes(':') && actualBedtime.split(':').length === 2 ? 
      `${actualBedtime}:00` : actualBedtime;

    const updatedEntry = await updateSengetiderEntry(entryId, {
      entryDate,
      actualBedtime: formattedBedtime,
      notes
    });

    if (!updatedEntry) {
      return NextResponse.json({ error: 'Failed to update sengetider entry' }, { status: 500 });
    }

    return NextResponse.json({ entry: updatedEntry }, { status: 200 });

  } catch (error) {
    console.error('Error updating sengetider entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sengetiderId: string; entryId: string }> }
) {
  try {
    const { sengetiderId: sengetiderIdParam, entryId: entryIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sengetiderId = parseInt(sengetiderIdParam);
    const entryId = parseInt(entryIdParam);
    if (isNaN(sengetiderId) || isNaN(entryId)) {
      return NextResponse.json({ error: 'Invalid sengetider or entry ID' }, { status: 400 });
    }

    // Check if user has access to this sengetider
    const sengetiderTool = await getSengetiderById(sengetiderId);
    if (!sengetiderTool) {
      return NextResponse.json({ error: 'Sengetider not found' }, { status: 404 });
    }
    
    // Additional access check would go here

    const success = await deleteSengetiderEntry(entryId);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete sengetider entry' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Sengetider entry deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting sengetider entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
