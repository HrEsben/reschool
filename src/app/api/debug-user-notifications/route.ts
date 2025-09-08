import { NextResponse } from 'next/server';
import { stackServerApp } from '@/stack';
import { getUserByStackAuthId } from '@/lib/database-service';
import { getUserNotifications, getUnreadNotificationCount } from '@/lib/notification-service';

export async function GET() {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await getUserByStackAuthId(user.id);
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all notifications for this user
    const notifications = await getUserNotifications(dbUser.id, 50, false);
    const unreadCount = await getUnreadNotificationCount(dbUser.id);

    return NextResponse.json({
      stackAuthId: user.id,
      dbUserId: dbUser.id,
      dbUserEmail: dbUser.email,
      notifications,
      unreadCount,
      message: `Found ${notifications.length} notifications for user ID ${dbUser.id}`
    });
  } catch (error) {
    console.error('Error in debug API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
