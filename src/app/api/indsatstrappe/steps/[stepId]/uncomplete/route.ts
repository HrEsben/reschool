import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import {
  getUserByStackAuthId,
  markIndsatsStepIncomplete
} from '@/lib/database-service';

// POST /api/indsatstrappe/steps/[stepId]/uncomplete
// Mark a step as incomplete (go back functionality)
export async function POST(
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

    // Mark the step as incomplete
    const uncompletedStep = await markIndsatsStepIncomplete(stepId);

    if (!uncompletedStep) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 });
    }

    return NextResponse.json(uncompletedStep);
  } catch (error) {
    console.error('Error marking step as incomplete:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
