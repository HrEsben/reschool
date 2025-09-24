import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { getUserByStackAuthId, getProgressDataWithRLS, getUserChildRelation } from '@/lib/database-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { childId: string } }
) {
  try {
    // Authenticate user
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse and validate childId
    const childId = parseInt(params.childId);
    if (isNaN(childId)) {
      return NextResponse.json({ error: 'Invalid child ID' }, { status: 400 });
    }

    // Check if user has access to this child
    const userRelation = await getUserChildRelation(dbUser.id, childId);
    if (!userRelation) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

        // Get progress data for the child - the RLS policies will automatically filter based on access
    // We pass the user's database ID for RLS context
    const progressData = await getProgressDataWithRLS(childId, dbUser.id);

    if (!progressData) {
      // Return empty structure instead of null for consistency
      return NextResponse.json({
        childId,
        plans: [],
        totalEntries: 0
      });
    }

    return NextResponse.json(progressData);
  } catch (error) {
    console.error('Error fetching progress data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress data' },
      { status: 500 }
    );
  }
}