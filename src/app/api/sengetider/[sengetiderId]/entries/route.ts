import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  createSengetiderEntry, 
  getSengetiderEntries,
  getUserByStackAuthId,
  getSengetiderById
} from '@/lib/database-service';

export async function GET(
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

    // Check if user has access to this sengetider
    const sengetiderTool = await getSengetiderById(sengetiderId);
    if (!sengetiderTool) {
      return NextResponse.json({ error: 'Sengetider not found' }, { status: 404 });
    }
    
    // Additional access check would go here (check if user has access to the child)
    // For now, we'll assume if the sengetider exists, the user can access it

    const entries = await getSengetiderEntries(sengetiderId);
    return NextResponse.json({ entries });

  } catch (error) {
    console.error('Error fetching sengetider entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
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

    // Check if user has access to this sengetider
    const sengetiderTool = await getSengetiderById(sengetiderId);
    if (!sengetiderTool) {
      return NextResponse.json({ error: 'Sengetider not found' }, { status: 404 });
    }
    
    // Additional access check would go here (check if user has access to the child)
    // For now, we'll assume if the sengetider exists, the user can access it

    const body = await request.json();
    const { entryDate, actualBedtime, notes } = body;

    // Validate required fields
    if (!entryDate || !actualBedtime) {
      return NextResponse.json({ error: 'Entry date and actual bedtime are required' }, { status: 400 });
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    // Validate time format
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(actualBedtime)) {
      return NextResponse.json({ error: 'Invalid time format. Use HH:MM or HH:MM:SS' }, { status: 400 });
    }

    // Convert HH:MM to HH:MM:SS if needed
    const formattedBedtime = actualBedtime.includes(':') && actualBedtime.split(':').length === 2 ? 
      `${actualBedtime}:00` : actualBedtime;

    const entry = await createSengetiderEntry(
      sengetiderId,
      dbUser.id,
      entryDate,
      formattedBedtime,
      notes
    );

    if (!entry) {
      return NextResponse.json({ error: 'Failed to create sengetider entry' }, { status: 500 });
    }

    return NextResponse.json({ entry }, { status: 201 });

  } catch (error) {
    console.error('Error creating sengetider entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
