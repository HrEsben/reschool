// Notification service for managing user notifications

import { query } from './db';

export interface Notification {
  id: number;
  userId?: number; // Optional for pending notifications
  pendingEmail?: string; // For notifications before user exists
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export type NotificationType = 
  | 'invitation_received'
  | 'invitation_accepted'
  | 'child_added'
  | 'barometer_entry'
  | 'user_joined_child'
  | 'system';

export interface CreateNotificationData {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

// Create a new notification
// Create a notification for an existing user
export async function createNotification(
  userId: number,
  type: string,
  title: string,
  message: string,
  data?: Record<string, unknown>
): Promise<Notification | null> {
  try {
    const result = await query(
      `INSERT INTO notifications (user_id, type, title, message, data, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [
        userId,
        type,
        title,
        message,
        data ? JSON.stringify(data) : null
      ]
    );

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      data: row.data ? JSON.parse(row.data) : null,
      read: row.read || false,
      createdAt: new Date(row.created_at).toISOString()
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
}

// Create a pending notification for an email (user doesn't exist yet)
export async function createPendingNotification(
  email: string,
  type: string,
  title: string,
  message: string,
  data?: Record<string, unknown>
): Promise<Notification | null> {
  try {
    const result = await query(
      `INSERT INTO notifications (pending_email, type, title, message, data, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [
        email,
        type,
        title,
        message,
        data ? JSON.stringify(data) : null
      ]
    );

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      pendingEmail: row.pending_email,
      type: row.type,
      title: row.title,
      message: row.message,
      data: row.data ? JSON.parse(row.data) : null,
      read: row.read || false,
      createdAt: new Date(row.created_at).toISOString()
    };
  } catch (error) {
    console.error('Error creating pending notification:', error);
    return null;
  }
}

// Activate pending notifications when user signs up
export async function activatePendingNotifications(email: string, userId: number): Promise<void> {
  try {
    await query(
      `UPDATE notifications 
       SET user_id = $1, pending_email = NULL, updated_at = NOW()
       WHERE pending_email = $2`,
      [userId, email]
    );
  } catch (error) {
    console.error('Error activating pending notifications:', error);
  }
}

// Check if user exists by email
export async function getUserByEmail(email: string): Promise<any> {
  try {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

// Smart notification creation - creates for user if exists, pending if not
export async function createNotificationForEmail(
  email: string,
  type: string,
  title: string,
  message: string,
  data?: Record<string, unknown>
): Promise<Notification | null> {
  const existingUser = await getUserByEmail(email);
  
  if (existingUser) {
    // User exists, create notification immediately
    return createNotification(existingUser.id, type, title, message, data);
  } else {
    // User doesn't exist, create pending notification
    return createPendingNotification(email, type, title, message, data);
  }
}

// Get notifications for a user
export async function getUserNotifications(
  userId: number,
  limit: number = 50,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  try {
    let query_text = `
      SELECT * FROM notifications 
      WHERE user_id = $1
    `;
    
    const params: any[] = [userId];
    
    if (unreadOnly) {
      query_text += ` AND read = FALSE`;
    }
    
    query_text += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await query(query_text, params);

    return result.rows.map(row => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      data: row.data ? JSON.parse(row.data) : null,
      read: row.read || false,
      createdAt: new Date(row.created_at).toISOString()
    }));
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return [];
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: number): Promise<boolean> {
  try {
    const result = await query(
      `UPDATE notifications SET read = TRUE, updated_at = NOW() 
       WHERE id = $1`,
      [notificationId]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: number): Promise<boolean> {
  try {
    const result = await query(
      `UPDATE notifications SET read = TRUE, updated_at = NOW() 
       WHERE user_id = $1 AND read = FALSE`,
      [userId]
    );

    return (result.rowCount ?? 0) >= 0;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: number): Promise<number> {
  try {
    const result = await query(
      `SELECT COUNT(*) as count FROM notifications 
       WHERE user_id = $1 AND read = FALSE`,
      [userId]
    );

    return parseInt(result.rows[0]?.count || '0');
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
}

// Delete a notification
export async function deleteNotification(notificationId: number): Promise<boolean> {
  try {
    const result = await query(
      `DELETE FROM notifications WHERE id = $1`,
      [notificationId]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error deleting notification:', error);
    return false;
  }
}

// Helper functions for creating specific types of notifications

export async function createInvitationNotification(
  email: string,
  childName: string,
  inviterName: string,
  invitationToken: string
): Promise<void> {
  // Always create a pending notification for invitations since we only have email
  await createPendingNotification(
    email,
    'invitation_received',
    'Ny invitation',
    `${inviterName} har inviteret dig til at følge ${childName}`,
    {
      childName,
      inviterName,
      invitationToken,
      actionUrl: `/invite/${invitationToken}`
    }
  );
}

export async function createChildAddedNotification(
  userId: number,
  childName: string,
  childSlug: string
): Promise<Notification | null> {
  return createNotification(
    userId,
    'child_added',
    'Barn tilføjet',
    `Du kan nu følge ${childName}`,
    {
      childName,
      childSlug,
      actionUrl: `/${childSlug}`
    }
  );
}

export async function createUserJoinedChildNotification(
  userId: number,
  userName: string,
  childName: string,
  childSlug: string
): Promise<Notification | null> {
  return createNotification(
    userId,
    'user_joined_child',
    'Ny bruger tilsluttet',
    `${userName} følger nu ${childName}`,
    {
      userName,
      childName,
      childSlug,
      actionUrl: `/${childSlug}`
    }
  );
}

export async function createBarometerEntryNotification(
  userId: number,
  childName: string,
  childSlug: string,
  entryDate: string
): Promise<Notification | null> {
  return createNotification(
    userId,
    'barometer_entry',
    'Ny barometer registrering',
    `Der er registreret en ny måling for ${childName}`,
    {
      childName,
      childSlug,
      entryDate,
      actionUrl: `/${childSlug}`
    }
  );
}
