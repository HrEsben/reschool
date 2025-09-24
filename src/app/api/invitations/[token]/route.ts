import { NextRequest, NextResponse } from 'next/server';
import { getInvitationWithDetails } from '@/lib/database-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const resolvedParams = await params;
    const token = resolvedParams.token;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const invitationData = await getInvitationWithDetails(token);
    
    if (!invitationData) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 });
    }

    const { invitation, childName, inviterName, inviterRelation } = invitationData;

    // Check if invitation is expired
    if (new Date(invitation.expiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invitation has expired' }, { status: 410 });
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: 'Invitation is no longer valid' }, { status: 410 });
    }

    return NextResponse.json({
      id: invitation.id,
      email: invitation.email,
      childName,
      inviterName,
      inviterRelation,
      relation: invitation.relation,
      customRelationName: invitation.customRelationName,
      status: invitation.status,
      expiresAt: invitation.expiresAt
    });

  } catch (error) {
    console.error('Error fetching invitation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
