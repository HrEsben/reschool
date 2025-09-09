import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  getUserByStackAuthId, 
  getInvitationWithDetails,
  addUserToChild,
  getChildById,
  updateInvitationStatus,
  getChildWithUsers
} from '@/lib/database-service';
import { ensureUserInDatabase } from '@/lib/user-sync';
import { createChildAddedNotification, createUserJoinedChildNotification } from '@/lib/notification-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const token = resolvedParams.token;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Ensure user exists in our database first
    await ensureUserInDatabase();

    // Get invitation details
    const invitationData = await getInvitationWithDetails(token);
    if (!invitationData) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const { invitation } = invitationData;

    // Check if invitation is expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: 'Invitation is no longer valid' }, { status: 410 });
    }

    // Check if the user's email matches the invitation
    if (user.primaryEmail !== invitation.email) {
      return NextResponse.json({ 
        error: 'Your email address does not match the invitation' 
      }, { status: 400 });
    }

    // Get current user from database - ensure we have the latest data
    let currentUser = await getUserByStackAuthId(user.id);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // If user doesn't have a display name, we can't auto-accept yet
    // Let them go through the normal flow to provide their name first
    if (!user.displayName || !currentUser.displayName) {
      return NextResponse.json({ 
        error: 'User must complete profile setup first',
        requiresManualAccept: true 
      }, { status: 400 });
    }

    // Add user to child with the specified relation
    const userChildRelation = await addUserToChild(
      currentUser.id,
      invitation.childId,
      invitation.relation,
      invitation.customRelationName
    );

    if (!userChildRelation) {
      return NextResponse.json({ error: 'Failed to add user to child' }, { status: 500 });
    }

    // Update invitation status to accepted
    const updated = await updateInvitationStatus(invitation.id, 'accepted');
    if (!updated) {
      console.error('Failed to update invitation status, but user was added successfully');
    }

    // Get child details for redirect
    const child = await getChildById(invitation.childId);
    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Create notifications
    try {
      // Notify the new user that they've been added to the child
      await createChildAddedNotification(
        currentUser.id,
        child.name,
        child.slug
      );

      // Notify other users of the child that a new user has joined
      const childWithUsers = await getChildWithUsers(invitation.childId);
      if (childWithUsers) {
        const otherUsers = childWithUsers.users.filter(u => u.id !== currentUser.id);
        for (const otherUser of otherUsers) {
          await createUserJoinedChildNotification(
            otherUser.id,
            currentUser.displayName || currentUser.email,
            child.name,
            child.slug
          );
        }
      }
    } catch (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Don't fail the invitation acceptance if notifications fail
    }

    return NextResponse.json({
      message: 'Invitation accepted automatically',
      childSlug: child.slug,
      childName: child.name,
      autoAccepted: true
    });

  } catch (error) {
    console.error('Error auto-accepting invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
