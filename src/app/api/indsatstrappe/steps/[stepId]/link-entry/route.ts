import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import {
  getUserByStackAuthId,
  linkToolEntryToStep
} from '@/lib/database-service';

// POST /api/indsatstrappe/steps/[stepId]/link-entry
// Link a tool entry to a step
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

    const body = await request.json();
    const { 
      entryType, 
      entryId, 
      notes 
    }: {
      entryType: 'barometer' | 'dagens-smiley' | 'sengetider';
      entryId: number;
      notes?: string;
    } = body;

    // Validate required fields
    if (!entryType || !entryId) {
      return NextResponse.json(
        { error: 'Entry type and entry ID are required' },
        { status: 400 }
      );
    }

    // Validate entry type
    const validEntryTypes = ['barometer', 'dagens-smiley', 'sengetider'];
    if (!validEntryTypes.includes(entryType)) {
      return NextResponse.json(
        { error: 'Invalid entry type' },
        { status: 400 }
      );
    }

    // Link the tool entry to the step
    const linkedEntry = await linkToolEntryToStep(
      stepId,
      entryType,
      entryId,
      notes
    );

    return NextResponse.json(linkedEntry, { status: 201 });
  } catch (error) {
    console.error('Error linking tool entry to step:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
