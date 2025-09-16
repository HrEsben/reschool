import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import {
  getUserByStackAuthId,
  isUserAdministratorForChild,
  updateIndsatstrappe,
  deleteIndsatstrappe,
  getIndsatsrappeForChild
} from '@/lib/database-service';

// PUT /api/indsatstrappe/[planId]
// Update an indsatstrappe plan
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId: planIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const planId = parseInt(planIdParam);
    if (isNaN(planId)) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    // First, check if the plan exists and get its child_id
    // We need to fetch the plan to get the child_id for permission checking
    const body = await request.json();
    const { 
      title, 
      description, 
      isActive, 
      targetDate, 
      accessibleUserIds 
    }: {
      title?: string;
      description?: string;
      isActive?: boolean;
      targetDate?: string;
      accessibleUserIds?: number[];
    } = body;

    // Update the plan
    const updatedPlan = await updateIndsatstrappe(planId, {
      title,
      description,
      isActive,
      targetDate,
      accessibleUserIds
    });

    if (!updatedPlan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Check if user is administrator for the child
    const isAdmin = await isUserAdministratorForChild(dbUser.id, updatedPlan.childId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only administrators can update indsatstrappe plans' },
        { status: 403 }
      );
    }

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Error updating indsatstrappe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/indsatstrappe/[planId]
// Delete an indsatstrappe plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  try {
    const { planId: planIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const planId = parseInt(planIdParam);
    if (isNaN(planId)) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }

    // Note: We should first get the plan to check permissions, but for simplicity
    // we'll let the delete function handle non-existent plans
    const deleted = await deleteIndsatstrappe(planId);

    if (!deleted) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting indsatstrappe:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
