// User sync service - syncs Stack Auth users to Neon database

import { stackServerApp } from "@/stack";
import { syncUserToDatabase, getUserByStackAuthId } from "./database-service";
import { activatePendingNotifications, updateNotificationsWithUserName } from "./notification-service";

export async function ensureUserInDatabase() {
  try {
    // Get current user from Stack Auth
    const user = await stackServerApp.getUser();
    
    if (!user) return null;

    // Check if user already exists in database
    const existingDbUser = await getUserByStackAuthId(user.id);
    
    // Always sync user to database to ensure latest data is updated
    const dbUser = await syncUserToDatabase(user);
    
    // Always check for and activate pending notifications for this email
    if (dbUser && user.primaryEmail) {
      console.log('Checking for pending notifications for email:', user.primaryEmail);
      await activatePendingNotifications(user.primaryEmail, dbUser.id);
      console.log('Notification activation check completed for user ID:', dbUser.id);

      // If user now has a display name (and didn't before, or it changed), 
      // update any notifications that reference them by email
      if (user.displayName && user.primaryEmail) {
        const previousDisplayName = existingDbUser?.displayName;
        if (!previousDisplayName || previousDisplayName !== user.displayName) {
          console.log('Updating notifications with new display name:', user.displayName);
          await updateNotificationsWithUserName(user.primaryEmail, user.displayName);
        }
      }
    }

    return dbUser;
  } catch (error) {
    console.error('Error ensuring user in database:', error);
    return null;
  }
}

// Alternative function for manual syncing
export async function syncCurrentUser() {
  try {
    const user = await stackServerApp.getUser();
    if (!user) return null;

    return await syncUserToDatabase(user);
  } catch (error) {
    console.error('Error syncing current user:', error);
    return null;
  }
}
