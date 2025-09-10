import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { 
  getUserByStackAuthId, 
  getInvitationWithDetails,
  addUserToChild,
  getChildById,
  updateInvitationStatus,
  getChildWithUsers,
  syncUserToDatabase
} from '@/lib/database-service';
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

    // Check if the user's email matches the invitation (case-insensitive)
    if (user.primaryEmail?.toLowerCase() !== invitation.email.toLowerCase()) {
      return NextResponse.json({ 
        error: 'Your email address does not match the invitation' 
      }, { status: 400 });
    }

    // Get current user from database - ensure we have the latest data
    let currentUser = await getUserByStackAuthId(user.id);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Refresh user data from Stack Auth to ensure we have the latest display name
    const latestStackUser = await stackServerApp.getUser();
    if (latestStackUser && latestStackUser.displayName !== currentUser.displayName) {
      // Sync the latest user data to database
      const updatedUser = await syncUserToDatabase(latestStackUser);
      if (updatedUser) {
        currentUser = updatedUser;
      }
    }

    // Add user to child with the specified relation
    const userChildRelation = await addUserToChild(
      currentUser.id,
      invitation.childId,
      invitation.relation,
      invitation.customRelationName,
      invitation.isAdministrator
    );

    if (!userChildRelation) {
      return NextResponse.json({ error: 'Failed to add user to child' }, { status: 500 });
    }

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
      message: 'Invitation accepted successfully',
      childSlug: child.slug,
      childName: child.name
    });

  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
