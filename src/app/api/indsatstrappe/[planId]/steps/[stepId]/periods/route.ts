import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { createStepPeriod, createCustomStepPeriod, getStepPeriods } from '@/lib/database-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { stepId: string } }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stepId = parseInt(params.stepId);
    if (isNaN(stepId)) {
      return NextResponse.json({ error: 'Invalid step ID' }, { status: 400 });
    }

    const periods = await getStepPeriods(stepId);
    return NextResponse.json(periods);
  } catch (error) {
    console.error('Error fetching step periods:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { stepId: string } }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stepId = parseInt(params.stepId);
    if (isNaN(stepId)) {
      return NextResponse.json({ error: 'Invalid step ID' }, { status: 400 });
    }

    const { startDate, endDate, isCustomPeriod } = await request.json();
    
    let period;
    if (isCustomPeriod) {
      // Create a custom period with specific start and end dates (for backdating)
      period = await createCustomStepPeriod(
        stepId,
        parseInt(user.id),
        new Date(startDate),
        endDate ? new Date(endDate) : undefined
      );
    } else {
      // Create a regular period (activate step now or at specific date)
      period = await createStepPeriod(
        stepId,
        parseInt(user.id),
        startDate ? new Date(startDate) : undefined
      );
    }

    if (!period) {
      return NextResponse.json({ error: 'Failed to create step period' }, { status: 500 });
    }

    return NextResponse.json(period);
  } catch (error) {
    console.error('Error creating step period:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}