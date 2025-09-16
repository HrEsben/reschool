import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import {
  getUserByStackAuthId,
  deleteIndsatsStep
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
