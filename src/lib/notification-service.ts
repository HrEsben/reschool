// Notification service for managing user notifications

import { query } from './db';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
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
      isRead: row.is_read || false,
      createdAt: new Date(row.created_at).toISOString()
    };
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
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
      isRead: row.is_read || false,
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
  userId: number,
  childName: string,
  inviterName: string,
  invitationToken: string
): Promise<Notification | null> {
  return createNotification(
    userId,
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
