import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import {
  getUserByStackAuthId,
  deleteIndsatsStep,
  updateIndsatsStep
} from '@/lib/database-service';

// DELETE /api/indsatstrappe/steps/[stepId]
// Delete a step
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ stepId: string }> }
) {
  try {
    const { stepId: stepIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const stepId = parseInt(stepIdParam);
    if (isNaN(stepId)) {
      return NextResponse.json({ error: 'Invalid step ID' }, { status: 400 });
    }

    // Delete the step
    const deleted = await deleteIndsatsStep(stepId);

    if (!deleted) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting step:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/indsatstrappe/steps/[stepId]
// Update a step
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ stepId: string }> }
) {
  try {
    const { stepId: stepIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const stepId = parseInt(stepIdParam);
    if (isNaN(stepId)) {
      return NextResponse.json({ error: 'Invalid step ID' }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, målsætning } = body;

    // Validate that at least one field is provided
    if (title === undefined && description === undefined && målsætning === undefined) {
      return NextResponse.json({ error: 'At least one field must be provided' }, { status: 400 });
    }

    // Update the step
    const updated = await updateIndsatsStep(stepId, { title, description, målsætning });

    if (!updated) {
      return NextResponse.json({ error: 'Step not found or no changes made' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating step:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
