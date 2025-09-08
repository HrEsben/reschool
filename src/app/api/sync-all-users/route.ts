import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { query } from '@/lib/db';

// Sync all Stack Auth users to local database
// Call this periodically (e.g., via cron job)
export async function POST(request: NextRequest) {
  try {
    // Get authorization header to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.SYNC_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all users from Stack Auth
    const stackUsers = await stackServerApp.listUsers();
    
    // Get all users from local database
    const localUsersResult = await query('SELECT stack_auth_id FROM users');
    const localUserIds = new Set(localUsersResult.rows.map(row => row.stack_auth_id));

    let synced = 0;
    let deleted = 0;

    // Sync each Stack Auth user to local database
    for (const user of stackUsers) {
      await query(
        `INSERT INTO users (stack_auth_id, email, display_name, profile_image_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (stack_auth_id) 
         DO UPDATE SET 
           email = EXCLUDED.email,
           display_name = EXCLUDED.display_name,
           profile_image_url = EXCLUDED.profile_image_url,
           updated_at = NOW()`,
        [user.id, user.primaryEmail, user.displayName, user.profileImageUrl]
      );
      
      localUserIds.delete(user.id); // Remove from set (these exist in Stack Auth)
      synced++;
    }

    // Delete users that exist locally but not in Stack Auth
    for (const orphanedUserId of localUserIds) {
      await query('DELETE FROM users WHERE stack_auth_id = $1', [orphanedUserId]);
      deleted++;
    }

    return NextResponse.json({ 
      success: true, 
      synced, 
      deleted,
      message: `Synced ${synced} users, deleted ${deleted} orphaned users`
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}
