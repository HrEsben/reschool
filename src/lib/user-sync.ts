// User sync service - syncs Stack Auth users to Neon database

import { stackServerApp } from "@/stack";
import { syncUserToDatabase, getUserByStackAuthId } from "./database-service";
import { activatePendingNotifications } from "./notification-service";

export async function ensureUserInDatabase() {
  try {
    // Get current user from Stack Auth
    const user = await stackServerApp.getUser();
    
    if (!user) return null;

    // Check if user already exists in database
    let dbUser = await getUserByStackAuthId(user.id);
    
    // If user doesn't exist, sync them to database
    if (!dbUser) {
      dbUser = await syncUserToDatabase(user);
      
      // Activate any pending notifications for this email
      if (dbUser && user.primaryEmail) {
        await activatePendingNotifications(user.primaryEmail, dbUser.id);
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
