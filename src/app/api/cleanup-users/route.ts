import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Clean up duplicate users (keeps the most recent for each email)
export async function POST(request: NextRequest) {
  try {
    // Get authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find and delete duplicate users, keeping only the most recent for each email
    const result = await query(`
      DELETE FROM users 
      WHERE id NOT IN (
        SELECT DISTINCT ON (email) id 
        FROM users 
        ORDER BY email, created_at DESC
      )
      RETURNING email, stack_auth_id
    `);

    return NextResponse.json({ 
      success: true, 
      deletedUsers: result.rows,
      message: `Deleted ${result.rows.length} duplicate users`
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
