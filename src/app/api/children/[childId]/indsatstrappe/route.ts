import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import {
  getUserByStackAuthId,
  isUserAdministratorForChild,
  getIndsatsrappeForChild,
  createIndsatstrappe,
  getActiveIndsatsrappeForChild
} from '@/lib/database-service';

// GET /api/children/[childId]/indsatstrappe
// Fetch all indsatstrappe plans for a child
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

    // Get all indsatstrappe plans for the child (access control handled in function)
    const plans = await getIndsatsrappeForChild(childId, dbUser.id);

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching indsatstrappe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/children/[childId]/indsatstrappe
// Create a new indsatstrappe plan for a child
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

    // Check if user is administrator for this child
    const isAdmin = await isUserAdministratorForChild(dbUser.id, childId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only administrators can create indsatstrappe plans' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      title, 
      description, 
      targetDate, 
      startDate,
      accessibleUserIds 
    }: {
      title: string;
      description?: string;
      targetDate?: string;
      startDate?: string;
      accessibleUserIds?: number[];
    } = body;

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Create the indsatstrappe plan (isActive defaults to true in database)
    const newPlan = await createIndsatstrappe(
      childId,
      dbUser.id,
      title.trim(),
      description?.trim(),
      true, // Always set as active for now
      startDate,
      targetDate,
      accessibleUserIds
    );

    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    console.error('Error creating indsatstrappe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
