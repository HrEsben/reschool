import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  deleteBarometer, 
  getUserByStackAuthId,
  getBarometerById,
  isUserAdministratorForChild,
  updateBarometer 
} from '@/lib/database-service';

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

    // Get the barometer to check child ID
    const barometer = await getBarometerById(barometerId);
    if (!barometer) {
      return NextResponse.json({ error: 'Barometer not found' }, { status: 404 });
    }

    // Check if user is admin for the child this barometer belongs to
    const isAdmin = await isUserAdministratorForChild(dbUser.id, barometer.childId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only administrators can delete barometers' }, { status: 403 });
    }

    const success = await deleteBarometer(barometerId);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete barometer' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Barometer deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting barometer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
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

    const body = await request.json();
    const { topic, description, scaleMin, scaleMax, displayType, smileyType, isPublic, accessibleUserIds } = body;

    // Validate required fields
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    if (typeof scaleMin !== 'number' || typeof scaleMax !== 'number') {
      return NextResponse.json({ error: 'Scale min and max must be numbers' }, { status: 400 });
    }

    if (scaleMin >= scaleMax) {
      return NextResponse.json({ error: 'Scale min must be less than scale max' }, { status: 400 });
    }

    if (scaleMax > 100) {
      return NextResponse.json({ error: 'Scale max cannot exceed 100' }, { status: 400 });
    }

    // Validate scale range based on display type
    if (displayType === 'percentage') {
      // For percentage barometers, scale should be 0-100
      if (scaleMin !== 0 || scaleMax !== 100) {
        return NextResponse.json({ error: 'Percentage barometers must use 0-100 scale' }, { status: 400 });
      }
    } else {
      // For numbers and smileys, ensure minimum is at least 1
      if (scaleMin < 1) {
        return NextResponse.json({ error: 'Scale minimum must be at least 1 for non-percentage barometers' }, { status: 400 });
      }
    }

    if (!displayType || !['numbers', 'smileys', 'percentage'].includes(displayType)) {
      return NextResponse.json({ error: 'Invalid display type' }, { status: 400 });
    }

    // Get the existing barometer to check permissions
    const existingBarometer = await getBarometerById(barometerId);
    if (!existingBarometer) {
      return NextResponse.json({ error: 'Barometer not found' }, { status: 404 });
    }

    // Check if user owns the barometer or is admin for the child
    const isOwner = existingBarometer.createdBy === dbUser.id;
    const isAdmin = await isUserAdministratorForChild(dbUser.id, existingBarometer.childId);

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update the barometer
    const updatedBarometer = await updateBarometer(
      barometerId,
      topic.trim(),
      scaleMin,
      scaleMax,
      displayType,
      displayType === 'smileys' ? smileyType : null,
      description?.trim(),
      isPublic,
      accessibleUserIds
    );

    if (!updatedBarometer) {
      return NextResponse.json({ error: 'Failed to update barometer' }, { status: 500 });
    }

    return NextResponse.json(updatedBarometer);
  } catch (error) {
    console.error('Error updating barometer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
