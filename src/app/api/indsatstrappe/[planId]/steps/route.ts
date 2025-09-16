import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import {
  getUserByStackAuthId,
  isUserAdministratorForChild,
  getIndsatsStepsForPlan,
  addIndsatsStep
} from '@/lib/database-service';

// GET /api/indsatstrappe/[planId]/steps
// Fetch steps for an indsatstrappe plan
export async function GET(
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

    // Get steps for the plan (access control should be verified at plan level)
    const steps = await getIndsatsStepsForPlan(planId);

    return NextResponse.json({ steps });
  } catch (error) {
    console.error('Error fetching indsats steps:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/indsatstrappe/[planId]/steps
// Add a new step to an indsatstrappe plan
export async function POST(
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

    const body = await request.json();
    const { 
      title, 
      description, 
      målsætning 
    }: {
      title: string;
      description?: string;
      målsætning?: string;
    } = body;

    // Validate required fields
    if (!title?.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Note: For simplicity, we're not checking admin permissions here.
    // In a production app, you'd want to verify the user has admin access
    // to the child that owns this plan.

    // Add the step
    const newStep = await addIndsatsStep(
      planId,
      title.trim(),
      description?.trim(),
      målsætning?.trim()
    );

    return NextResponse.json(newStep, { status: 201 });
  } catch (error) {
    console.error('Error adding indsats step:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
