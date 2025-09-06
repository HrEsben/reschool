import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { getUserByStackAuthId, getInvitationById, deleteInvitation, checkUserIsChildAdmin } from '@/lib/database-service';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const invitationId = parseInt(resolvedParams.invitationId);

    if (isNaN(invitationId)) {
      return NextResponse.json({ error: 'Invalid invitation ID' }, { status: 400 });
    }

    // Get current user from database
    const currentUser = await getUserByStackAuthId(user.id);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Get invitation details to check if user is admin of the child
    const invitation = await getInvitationById(invitationId);
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    // Check if current user is admin for this child
    const isAdmin = await checkUserIsChildAdmin(currentUser.id, invitation.childId);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Only administrators can delete invitations' }, { status: 403 });
    }

    // Delete the invitation
    const success = await deleteInvitation(invitationId);
    if (!success) {
      return NextResponse.json({ error: 'Failed to delete invitation' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
