import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  getUserByStackAuthId,
  getBarometerById,
  checkUserBarometerAccess,
  getBarometerAccessList
} from '@/lib/database-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barometerId: string }> }
) {
  try {
    const { barometerId: barometerIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const barometerId = parseInt(barometerIdParam);
    if (isNaN(barometerId)) {
      return NextResponse.json({ error: 'Invalid barometer ID' }, { status: 400 });
    }

    // Get the barometer to check permissions
    const barometer = await getBarometerById(barometerId);
    if (!barometer) {
      return NextResponse.json({ error: 'Barometer not found' }, { status: 404 });
    }

    // Check if user has access to this barometer
    const hasAccess = await checkUserBarometerAccess(dbUser.id, barometerId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get the access list for this barometer
    const accessUsers = await getBarometerAccessList(barometerId);

    return NextResponse.json({
      barometerId,
      isPublic: barometer.isPublic,
      accessUsers: accessUsers
    });
  } catch (error) {
    console.error('Error fetching barometer access:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
