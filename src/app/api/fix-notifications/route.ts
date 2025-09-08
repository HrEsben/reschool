import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Get the specific case from the debug output
    const email = 'hej@skolr.dk';
    const userId = 10;
    
    console.log('Manually activating notifications for:', email, 'to user ID:', userId);
    
    // Find pending notifications
    const pendingResult = await query(
      'SELECT * FROM notifications WHERE pending_email = $1',
      [email]
    );
    
    console.log('Found pending notifications:', pendingResult.rows);
    
    // Activate them
    const updateResult = await query(
      'UPDATE notifications SET user_id = $1, pending_email = NULL WHERE pending_email = $2',
      [userId, email]
    );
    
    console.log('Update result:', updateResult);
    
    // Verify the fix
    const verifyResult = await query(
      'SELECT * FROM notifications WHERE user_id = $1',
      [userId]
    );
    
    return NextResponse.json({
      success: true,
      pendingFound: pendingResult.rows.length,
      activated: updateResult.rowCount,
      userNotifications: verifyResult.rows
    });
    
  } catch (error) {
    console.error('Error fixing notifications:', error);
    return NextResponse.json({ error: 'Failed to fix notifications' }, { status: 500 });
  }
}
