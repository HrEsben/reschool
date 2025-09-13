import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  getUserByStackAuthId,
  getLatestRegistrationsForUser
} from '@/lib/database-service';

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get limit from query parameters (default 20, max 50)
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = Math.min(parseInt(limitParam || '20'), 50);

    const registrations = await getLatestRegistrationsForUser(dbUser.id, limit);

    console.log('API: User ID:', dbUser.id, 'Limit:', limit, 'Found registrations:', registrations.length);
    if (registrations.length > 0) {
      console.log('API: First registration:', registrations[0]);
    }

    return NextResponse.json({
      registrations,
      total: registrations.length
    });

  } catch (error) {
    console.error('Error fetching latest registrations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
