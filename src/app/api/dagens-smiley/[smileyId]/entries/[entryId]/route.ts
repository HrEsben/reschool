import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  getDagensSmileyEntryById,
  deleteDagensSmileyEntry,
  getUserByStackAuthId,
  isUserAdministratorForChild
} from '@/lib/database-service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ smileyId: string; entryId: string }> }
) {
  try {
    const { entryId: entryIdParam } = await params;
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const entryId = parseInt(entryIdParam);
    if (isNaN(entryId)) {
      return NextResponse.json({ error: 'Invalid entry ID' }, { status: 400 });
    }

    // Get the entry to check permissions
    const entry = await getDagensSmileyEntryById(entryId);
    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Check if user can delete this entry (either the creator or admin for the child)
    const isCreator = entry.recordedBy === dbUser.id;
    const isAdmin = await isUserAdministratorForChild(dbUser.id, entry.childId);

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const success = await deleteDagensSmileyEntry(entryId);
    
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Entry deleted successfully' });

  } catch (error) {
    console.error('Error deleting smiley entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
