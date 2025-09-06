import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  getBarometerEntryById,
  deleteBarometerEntry,
  getUserByStackAuthId,
  isUserAdministratorForChild
} from '@/lib/database-service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ barometerId: string; entryId: string }> }
) {
  try {
    const { barometerId: barometerIdParam, entryId: entryIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const barometerId = parseInt(barometerIdParam);
    const entryId = parseInt(entryIdParam);
    
    if (isNaN(barometerId) || isNaN(entryId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Get the entry to check permissions
    const entry = await getBarometerEntryById(entryId);
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    if (entry.barometerId !== barometerId) {
      return NextResponse.json({ error: 'Entry does not belong to this barometer' }, { status: 400 });
    }

    // Check permissions: either the user who created the entry or an admin
    const isAdmin = await isUserAdministratorForChild(dbUser.id, entry.childId);
    const isOwner = entry.recordedBy === dbUser.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ 
        error: 'You can only delete your own entries unless you are an administrator' 
      }, { status: 403 });
    }

    const success = await deleteBarometerEntry(entryId);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting barometer entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
