import { NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { query } from '@/lib/db';
import { activatePendingNotifications } from '@/lib/notification-service';

export async function GET() {
  try {
    // Get current user
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get current user from database
    const dbUserResult = await query(
      'SELECT * FROM users WHERE stack_auth_id = $1',
      [user.id]
    );
    
    const dbUser = dbUserResult.rows[0];

    // Try to activate pending notifications if we have a user
    let activationResult = null;
    if (dbUser && user.primaryEmail) {
      console.log('Attempting to activate pending notifications for:', user.primaryEmail, 'user ID:', dbUser.id);
      try {
        await activatePendingNotifications(user.primaryEmail, dbUser.id);
        activationResult = 'Activation attempted';
      } catch (error) {
        console.error('Activation error:', error);
        activationResult = 'Activation failed: ' + (error instanceof Error ? error.message : String(error));
      }
    }
    
    // Get all notifications (after potential activation)
    const allNotificationsResult = await query(
      'SELECT * FROM notifications ORDER BY created_at DESC'
    );
    
    // Get all users
    const allUsersResult = await query(
      'SELECT id, email, display_name, stack_auth_id FROM users ORDER BY created_at DESC'
    );

    return NextResponse.json({
      currentStackAuthId: user.id,
      currentDbUser: dbUser || null,
      currentUserEmail: user.primaryEmail,
      activationResult,
      allNotifications: allNotificationsResult.rows,
      allUsers: allUsersResult.rows
    });
    
  } catch (error) {
    console.error('Error in debug endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
