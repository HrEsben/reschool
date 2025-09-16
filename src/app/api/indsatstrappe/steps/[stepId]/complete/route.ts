import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import {
  getUserByStackAuthId,
  completeIndsatsStep
} from '@/lib/database-service';

// POST /api/indsatstrappe/steps/[stepId]/complete
// Mark a step as completed
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

    // Complete the step
    const completedStep = await completeIndsatsStep(stepId, dbUser.id);

    if (!completedStep) {
      return NextResponse.json({ error: 'Step not found' }, { status: 404 });
    }

    return NextResponse.json(completedStep);
  } catch (error) {
    console.error('Error completing step:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
