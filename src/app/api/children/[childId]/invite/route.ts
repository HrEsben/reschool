import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { getUserByStackAuthId, getChildWithUsers, createInvitation } from '@/lib/database-service';
import { sendInvitationEmail } from '@/lib/email-service';
import { createInvitationNotification } from '@/lib/notification-service';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const childId = parseInt(resolvedParams.childId);
    
    const { email, relation, customRelationName, isAdministrator } = await request.json();

    if (!email || !relation) {
      return NextResponse.json({ error: 'Email and relation are required' }, { status: 400 });
    }

    // Normalize email to lowercase for consistent handling
    const normalizedEmail = email.toLowerCase();

    // Get current user from database
    const currentUser = await getUserByStackAuthId(user.id);
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Check if current user is admin for this child
    const childData = await getChildWithUsers(childId);
    if (!childData) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    const currentUserData = childData.users.find(u => u.id === currentUser.id);
    if (!currentUserData || !currentUserData.isAdministrator) {
      return NextResponse.json({ error: 'Only administrators can send invitations' }, { status: 403 });
    }

    // Check if user is already connected to this child
    const existingUser = childData.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existingUser) {
      // Temporarily allow testing with existing users for email testing
      console.log('Warning: Allowing invitation to existing user for testing purposes');
      // return NextResponse.json({ error: 'This user is already connected to this child' }, { status: 400 });
    }

    // Create invitation record in our database first
    const invitation = await createInvitation(
      normalizedEmail,
      childId,
      currentUser.id,
      relation,
      customRelationName,
      isAdministrator || false
    );

    if (!invitation) {
      return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
    }

        // Create notification for the invitation
    const inviterName = currentUser.displayName || currentUser.email || 'En bruger';
    await createInvitationNotification(
      normalizedEmail,
      childData.child.name,
      inviterName,
      invitation.token
    );

    // Create invitation URL
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${invitation.token}`;

    // Get inviter's relation to the child for the email
    const inviterRelation = currentUserData.customRelationName || currentUserData.relation;

    // Send invitation email using email service
    
    console.log('sendInvitationEmail function:', sendInvitationEmail);
    console.log('typeof sendInvitationEmail:', typeof sendInvitationEmail);
    
    try {
      await sendInvitationEmail({
        to: normalizedEmail,
        childName: childData.child.name,
        inviterName: inviterName,
        inviterRelation: inviterRelation,
        recipientRelation: customRelationName || relation,
        inviteUrl
      });

      console.log(`Invitation email sent successfully to ${normalizedEmail} for child ${childData.child.name}`);

      return NextResponse.json({ 
        success: true, 
        message: `Invitation sent successfully to ${normalizedEmail}`,
        inviteUrl // Include the invite URL in the response for development
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      
      // For development/testing: if email fails due to restrictions, still return success
      // but include the invite URL so it can be shared manually
      if (emailError instanceof Error && emailError.message.includes('Test email restriction')) {
        return NextResponse.json({ 
          success: true, 
          message: `Invitation created successfully! Due to email service restrictions in development mode, please share this link manually: ${inviteUrl}`,
          inviteUrl,
          emailRestriction: true
        });
      }
      
      // For other email errors, return an error response
      return NextResponse.json(
        { error: 'Invitation was created but email could not be sent. Please try again or contact support.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
