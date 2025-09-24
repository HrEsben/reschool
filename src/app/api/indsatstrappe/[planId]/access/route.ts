import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  getUserByStackAuthId,
  checkUserIndsatstrappAccess,
  getIndsatsrappeAccessList,
  setIndsatsrappeUserAccess
} from '@/lib/database-service';

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

    // Check if user has access to this indsatstrappe plan
    const hasAccess = await checkUserIndsatstrappAccess(dbUser.id, planId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get the access list for this plan
    const accessUsers = await getIndsatsrappeAccessList(planId);

    return NextResponse.json({
      planId,
      accessUsers: accessUsers
    });
  } catch (error) {
    console.error('Error fetching indsatstrappe access:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    // Check if user has access to this indsatstrappe plan (only creators/admins can modify access)
    const hasAccess = await checkUserIndsatstrappAccess(dbUser.id, planId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { userIds } = body;

    if (!Array.isArray(userIds)) {
      return NextResponse.json({ error: 'userIds must be an array' }, { status: 400 });
    }

    // Set the new access list
    await setIndsatsrappeUserAccess(planId, userIds);

    // Return the updated access list
    const accessUsers = await getIndsatsrappeAccessList(planId);

    return NextResponse.json({
      planId,
      accessUsers: accessUsers
    });
  } catch (error) {
    console.error('Error updating indsatstrappe access:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}