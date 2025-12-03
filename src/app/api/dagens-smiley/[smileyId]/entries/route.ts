import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  recordDagensSmileyEntry, 
  getDagensSmileyById,
  getUserByStackAuthId,
  checkUserDagensSmileyAccess,
  getDagensSmileyEntries,
  getChildById,
  notifyUsersOfNewToolEntry
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

    // Check if smiley exists
    const smiley = await getDagensSmileyById(smileyId);
    if (!smiley) {
      return NextResponse.json({ error: 'Smiley not found' }, { status: 404 });
    }

    // Check if user has access to this smiley
    const hasAccess = await checkUserDagensSmileyAccess(dbUser.id, smileyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const entries = await getDagensSmileyEntries(smileyId, 500); // Get all entries (up to 500)
    return NextResponse.json({ entries });

  } catch (error) {
    console.error('Error fetching smiley entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
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

    // Check if smiley exists
    const smiley = await getDagensSmileyById(smileyId);
    if (!smiley) {
      return NextResponse.json({ error: 'Smiley not found' }, { status: 404 });
    }

    // Check if user has access to this smiley
    const hasAccess = await checkUserDagensSmileyAccess(dbUser.id, smileyId);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const { selectedEmoji, reasoning, entryDate } = await request.json();

    // Validate input
    if (!selectedEmoji || typeof selectedEmoji !== 'string') {
      return NextResponse.json({ error: 'Selected emoji is required' }, { status: 400 });
    }

    // Validate entryDate format if provided (YYYY-MM-DD)
    if (entryDate && !/^\d{4}-\d{2}-\d{2}$/.test(entryDate)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    const entry = await recordDagensSmileyEntry(
      smileyId,
      dbUser.id,
      selectedEmoji,
      reasoning,
      entryDate // Pass the optional entryDate
    );

    if (!entry) {
      return NextResponse.json({ error: 'Failed to record entry' }, { status: 500 });
    }

    // Get child information for notifications using the smiley we already fetched
    const child = await getChildById(smiley.childId);
    
    if (child && child.slug) {
      // Notify all other users who have access to this child about the new entry
      await notifyUsersOfNewToolEntry(
        smiley.childId,
        dbUser.id, // Exclude the user who created the entry
        child.name,
        child.slug,
        'Dagens Smiley',
        smiley.topic,
        dbUser.displayName || dbUser.email,
        entry.entryDate
      );
    }

    return NextResponse.json(entry, { status: 201 });

  } catch (error) {
    console.error('Error recording smiley entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
