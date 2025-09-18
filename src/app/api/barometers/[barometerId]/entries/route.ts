import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  recordBarometerEntry, 
  getBarometerById,
  getUserByStackAuthId,
  isUserAdministratorForChild,
  getBarometerEntries
} from '@/lib/database-service';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barometerId: string }> }
) {
  try {
    const { barometerId: barometerIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const barometerId = parseInt(barometerIdParam);
    if (isNaN(barometerId)) {
      return NextResponse.json({ error: 'Invalid barometer ID' }, { status: 400 });
    }

    // Check if barometer exists and user has access
    const barometer = await getBarometerById(barometerId);
    if (!barometer) {
      return NextResponse.json({ error: 'Barometer not found' }, { status: 404 });
    }

    // Get entries for this barometer
    const entries = await getBarometerEntries(barometerId, 50); // Get last 50 entries

    return NextResponse.json({ entries });

  } catch (error) {
    console.error('Error fetching barometer entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ barometerId: string }> }
) {
  try {
    const { barometerId: barometerIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const barometerId = parseInt(barometerIdParam);
    if (isNaN(barometerId)) {
      return NextResponse.json({ error: 'Invalid barometer ID' }, { status: 400 });
    }

    // Check if barometer exists
    const barometer = await getBarometerById(barometerId);
    if (!barometer) {
      return NextResponse.json({ error: 'Barometer not found' }, { status: 404 });
    }

    const body = await request.json();
    const { rating, comment, entryDate } = body;

    if (typeof rating !== 'number' || rating < barometer.scaleMin || rating > barometer.scaleMax) {
      return NextResponse.json({ 
        error: `Rating must be between ${barometer.scaleMin} and ${barometer.scaleMax}` 
      }, { status: 400 });
    }

    // Validate entryDate format if provided (YYYY-MM-DD)
    if (entryDate && !/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    const entry = await recordBarometerEntry(
      barometerId, 
      dbUser.id, 
      rating, 
      comment || undefined,
      entryDate // Pass the optional entryDate
    );
    
    if (!entry) {
      return NextResponse.json({ error: 'Failed to record entry' }, { status: 500 });
    }

    return NextResponse.json({ entry }, { status: 201 });

  } catch (error) {
    console.error('Error recording barometer entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ barometerId: string }> }
) {
  try {
    const { barometerId: barometerIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const barometerId = parseInt(barometerIdParam);
    if (isNaN(barometerId)) {
      return NextResponse.json({ error: 'Invalid barometer ID' }, { status: 400 });
    }

    // Get the barometer to check child ownership
    const barometer = await getBarometerById(barometerId);
    if (!barometer) {
      return NextResponse.json({ error: 'Barometer not found' }, { status: 404 });
    }

    // Check if user is admin for this child
    const isAdmin = await isUserAdministratorForChild(dbUser.id, barometer.childId);
    if (!isAdmin) {
      return NextResponse.json({ 
        error: 'Only administrators can delete all entries' 
      }, { status: 403 });
    }

    // Delete all entries for this barometer
    const result = await query(
      'DELETE FROM barometer_entries WHERE barometer_id = $1',
      [barometerId]
    );

    return NextResponse.json({ 
      success: true, 
      deletedCount: result.rowCount || 0 
    });

  } catch (error) {
    console.error('Error deleting all barometer entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
