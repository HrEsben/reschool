import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { query } from '@/lib/db';

// Get pending invitations for the current user
export async function GET() {
  try {
    console.log('GET /api/invitations/pending - Starting...');
    const user = await stackServerApp.getUser();
    console.log('GET /api/invitations/pending - User:', user ? { id: user.id, email: user.primaryEmail } : 'null');
    
    if (!user) {
      console.log('GET /api/invitations/pending - No user found, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!user.primaryEmail) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 });
    }

    // Get pending invitations for this user's email
    const result = await query(
      `SELECT 
        i.*,
        c.name as child_name,
        c.slug as child_slug,
        u.display_name as inviter_name,
        u.email as inviter_email,
        ucr.relation as inviter_relation,
        ucr.custom_relation_name as inviter_custom_relation
       FROM invitations i
       JOIN children c ON i.child_id = c.id
       JOIN users u ON i.invited_by = u.id
       JOIN user_child_relations ucr ON ucr.user_id = i.invited_by AND ucr.child_id = i.child_id
       WHERE i.email = $1 AND i.status = 'pending' AND i.expires_at > NOW()
       ORDER BY i.created_at DESC`,
      [user.primaryEmail]
    );

    const invitations = result.rows.map(row => ({
      id: row.id,
      email: row.email,
      childId: row.child_id,
      childName: row.child_name,
      childSlug: row.child_slug,
      invitedBy: row.invited_by,
      relation: row.relation,
      customRelationName: row.custom_relation_name,
      token: row.token,
      status: row.status,
      expiresAt: new Date(row.expires_at).toISOString(),
      createdAt: new Date(row.created_at).toISOString(),
      inviterName: row.inviter_name || row.inviter_email,
      inviterRelation: row.inviter_custom_relation || row.inviter_relation
    }));

    return NextResponse.json({ invitations });

  } catch (error) {
    console.error('Error getting pending invitations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
