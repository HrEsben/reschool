import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Webhook endpoint for Stack Auth user events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event_type, user } = body;

    switch (event_type) {
      case 'user.created':
        // Create user in local database
        await query(
          `INSERT INTO users (stack_auth_id, email, display_name, profile_image_url, created_at, updated_at)
           VALUES ($1, $2, $3, $4, NOW(), NOW())
           ON CONFLICT (stack_auth_id) DO NOTHING`,
          [user.id, user.primary_email, user.display_name, user.profile_image_url]
        );
        break;

      case 'user.updated':
        // Update user in local database
        await query(
          `UPDATE users 
           SET email = $2, display_name = $3, profile_image_url = $4, updated_at = NOW()
           WHERE stack_auth_id = $1`,
          [user.id, user.primary_email, user.display_name, user.profile_image_url]
        );
        break;

      case 'user.deleted':
        // Delete user from local database
        await query(
          'DELETE FROM users WHERE stack_auth_id = $1',
          [user.id]
        );
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
