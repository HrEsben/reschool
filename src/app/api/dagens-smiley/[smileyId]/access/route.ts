import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  getUserByStackAuthId,
  getDagensSmileyById,
  checkUserDagensSmileyAccess,
  getDagensSmileyAccessList
} from '@/lib/database-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ smileyId: string }> }
) {
  try {
    const { smileyId: smileyIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const smileyId = parseInt(smileyIdParam);
    if (isNaN(smileyId)) {
      return NextResponse.json({ error: 'Invalid smiley ID' }, { status: 400 });
    }

    // Get the smiley to check permissions
    const smiley = await getDagensSmileyById(smileyId);
    if (!smiley) {
      return NextResponse.json({ error: 'Smiley not found' }, { status: 404 });
    }

    // Check if user has access to this smiley
    const hasAccess = await checkUserDagensSmileyAccess(dbUser.id, smileyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get the access list for this smiley
    const accessUsers = await getDagensSmileyAccessList(smileyId);

    return NextResponse.json({
      smileyId,
      isPublic: smiley.isPublic,
      accessUsers: accessUsers
    });
  } catch (error) {
    console.error('Error fetching smiley access:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
