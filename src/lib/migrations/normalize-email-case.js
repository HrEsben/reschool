// Migration to normalize email addresses to lowercase
// This migration addresses the case sensitivity issue in the invitation flow

const { neon } = require('@neondatabase/serverless');

async function normalizeEmailCase() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('Starting email case normalization migration...');
  
  try {
    // Get counts before migration
    const invitationsBefore = await sql`
      SELECT COUNT(*) as count 
      FROM invitations 
      WHERE email != LOWER(email)
    `;
    
    const notificationsBefore = await sql`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE pending_email IS NOT NULL 
        AND pending_email != LOWER(pending_email)
    `;
    
    const usersBefore = await sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE email != LOWER(email)
    `;
    
    console.log(`Records to update:`);
    console.log(`- Invitations: ${invitationsBefore[0].count}`);
    console.log(`- Notifications: ${notificationsBefore[0].count}`);
    console.log(`- Users: ${usersBefore[0].count}`);
    
    // Update invitations table
    await sql`
      UPDATE invitations 
      SET email = LOWER(email) 
      WHERE email != LOWER(email)
    `;
    
    // Update notifications table
    await sql`
      UPDATE notifications 
      SET pending_email = LOWER(pending_email) 
      WHERE pending_email IS NOT NULL 
        AND pending_email != LOWER(pending_email)
    `;
    
    // Update users table
    await sql`
      UPDATE users 
      SET email = LOWER(email) 
      WHERE email != LOWER(email)
    `;
    
    // Add comments
    await sql`
      COMMENT ON COLUMN invitations.email IS 'Email address normalized to lowercase for case-insensitive comparisons'
    `;
    
    await sql`
      COMMENT ON COLUMN notifications.pending_email IS 'Pending email address normalized to lowercase for case-insensitive comparisons'
    `;
    
    await sql`
      COMMENT ON COLUMN users.email IS 'Email address normalized to lowercase for case-insensitive comparisons'
    `;
    
    console.log('✅ Email case normalization migration completed successfully');
    
    // Verify the migration
    const invitationsAfter = await sql`
      SELECT COUNT(*) as count 
      FROM invitations 
      WHERE email != LOWER(email)
    `;
    
    const notificationsAfter = await sql`
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE pending_email IS NOT NULL 
        AND pending_email != LOWER(pending_email)
    `;
    
    const usersAfter = await sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE email != LOWER(email)
    `;
    
    console.log(`Verification - remaining non-lowercase emails:`);
    console.log(`- Invitations: ${invitationsAfter[0].count}`);
    console.log(`- Notifications: ${notificationsAfter[0].count}`);
    console.log(`- Users: ${usersAfter[0].count}`);
    
    return {
      success: true,
      updated: {
        invitations: invitationsBefore[0].count,
        notifications: notificationsBefore[0].count,
        users: usersBefore[0].count
      }
    };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  normalizeEmailCase()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { normalizeEmailCase };
