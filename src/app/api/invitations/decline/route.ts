import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { query } from '@/lib/db';

// Decline an invitation
export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { invitationId } = body;

    if (!invitationId || isNaN(parseInt(invitationId))) {
      return NextResponse.json({ error: 'Invalid invitation ID' }, { status: 400 });
    }

    const id = parseInt(invitationId);

    // Verify the invitation belongs to this user and is still pending
    const checkResult = await query(
      'SELECT * FROM invitations WHERE id = $1 AND email = $2 AND status = $3',
      [id, user.primaryEmail, 'pending']
    );

    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Invitation not found or already processed' }, { status: 404 });
    }

    // Update invitation status to declined
    await query(
      'UPDATE invitations SET status = $1, updated_at = NOW() WHERE id = $2',
      ['expired', id] // Using 'expired' as declined status
    );

    return NextResponse.json({ success: true, message: 'Invitation declined' });

  } catch (error) {
    console.error('Error declining invitation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
