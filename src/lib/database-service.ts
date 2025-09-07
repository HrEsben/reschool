import { query, getClient } from './db';
import crypto from 'crypto';

// User management
export interface User {
  id: number;
  stackAuthId: string;
  email: string;
  displayName?: string;
  profileImageUrl?: string;
  createdAt: string; // Changed from Date to string for consistency
  updatedAt: string; // Changed from Date to string for consistency
}

export interface Child {
  id: number;
  name: string;
  slug: string;
  createdBy: number;
  createdAt: string; // Changed from Date to string for consistency
  updatedAt: string; // Changed from Date to string for consistency
}

export interface UserChildRelation {
  id: number;
  userId: number;
  childId: number;
  relation: 'Mor' | 'Far' | 'Underviser' | 'Ressourceperson';
  customRelationName?: string;
  isAdministrator: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invitation {
  id: number;
  email: string;
  childId: number;
  invitedBy: number;
  relation: 'Mor' | 'Far' | 'Underviser' | 'Ressourceperson';
  customRelationName?: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChildWithRelation extends Child {
  relation: string;
  customRelationName?: string;
  isAdministrator: boolean;
}

export interface Barometer {
  id: number;
  childId: number;
  createdBy: number;
  topic: string;
  scaleMin: number;
  scaleMax: number;
  displayType: string;
  smileyType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BarometerEntry {
  id: number;
  barometerId: number;
  recordedBy: number;
  entryDate: string; // YYYY-MM-DD format
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BarometerWithLatestEntry extends Barometer {
  latestEntry?: BarometerEntry;
  recordedByName?: string;
}

interface StackAuthUser {
  id: string;
  primaryEmail: string | null;
  displayName: string | null | undefined;
  profileImageUrl: string | null | undefined;
}

// User service functions
export async function syncUserToDatabase(stackAuthUser: StackAuthUser): Promise<User | null> {
  try {
    // Check if user has an email
    if (!stackAuthUser.primaryEmail) {
      console.error('User has no primary email, cannot sync to database');
      return null;
    }

    const result = await query(
      `INSERT INTO users (stack_auth_id, email, display_name, profile_image_url, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (stack_auth_id) 
       DO UPDATE SET 
         email = EXCLUDED.email,
         display_name = EXCLUDED.display_name,
         profile_image_url = EXCLUDED.profile_image_url,
         updated_at = NOW()
       RETURNING *`,
      [
        stackAuthUser.id,
        stackAuthUser.primaryEmail,
        stackAuthUser.displayName,
        stackAuthUser.profileImageUrl
      ]
    );

    return result.rows[0] as User;
  } catch (error) {
    console.error('Error syncing user to database:', error);
    return null;
  }
}

export async function getUserByStackAuthId(stackAuthId: string): Promise<User | null> {
  try {
    const result = await query(
      'SELECT * FROM users WHERE stack_auth_id = $1',
      [stackAuthId]
    );

    const row = result.rows[0];
    if (!row) return null;

    return {
      id: row.id,
      stackAuthId: row.stack_auth_id,
      email: row.email,
      displayName: row.display_name,
      profileImageUrl: row.profile_image_url,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    } as User;
  } catch (error) {
    console.error('Error getting user by Stack Auth ID:', error);
    return null;
  }
}

export async function getUserBySlug(userSlug: string): Promise<User | null> {
  try {
    // Function to generate slug from name or email
    const generateUserSlug = (text: string) => {
      return text.toLowerCase()
        .replace(/[æå]/g, 'a')
        .replace(/[ø]/g, 'o')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    };

    // Get all users to check slug matches
    const result = await query('SELECT * FROM users', []);
    
    // Find user by comparing generated slugs
    for (const dbUser of result.rows) {
      const nameSlug = dbUser.display_name ? generateUserSlug(dbUser.display_name) : null;
      const emailSlug = generateUserSlug(dbUser.email.split('@')[0]); // Use part before @
      
      if (nameSlug === userSlug || emailSlug === userSlug) {
        return {
          id: dbUser.id,
          stackAuthId: dbUser.stack_auth_id,
          email: dbUser.email,
          displayName: dbUser.display_name,
          profileImageUrl: dbUser.profile_image_url,
          createdAt: new Date(dbUser.created_at).toISOString(),
          updatedAt: new Date(dbUser.updated_at).toISOString()
        } as User;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting user by slug:', error);
    return null;
  }
}

// Child service functions
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-æøå]/g, '') // Remove special characters but keep Danish characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

export async function createChild(
  name: string,
  createdByUserId: number,
  relation: UserChildRelation['relation'],
  customRelationName?: string
): Promise<{ child: Child; relation: UserChildRelation } | null> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const slug = generateSlug(name);

    // Create the child
    const childResult = await client.query(
      'INSERT INTO children (name, slug, created_by) VALUES ($1, $2, $3) RETURNING *',
      [name, slug, createdByUserId]
    );

    const child = childResult.rows[0] as Child;

    // Create the user-child relation (creator is automatically administrator)
    const relationResult = await client.query(
      `INSERT INTO user_child_relations 
       (user_id, child_id, relation, custom_relation_name, is_administrator)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [createdByUserId, child.id, relation, customRelationName, true]
    );

    const userChildRelation = relationResult.rows[0] as UserChildRelation;

    await client.query('COMMIT');
    
    return { child, relation: userChildRelation };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating child:', error);
    return null;
  } finally {
    client.release();
  }
}

export async function getChildrenForUser(userId: number): Promise<ChildWithRelation[]> {
  try {
    const result = await query(
      `SELECT 
         c.*,
         ucr.relation,
         ucr.custom_relation_name,
         ucr.is_administrator
       FROM children c
       JOIN user_child_relations ucr ON c.id = ucr.child_id
       WHERE ucr.user_id = $1
       ORDER BY c.created_at DESC`,
      [userId]
    );

    return result.rows.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      relation: row.relation,
      customRelationName: row.custom_relation_name,
      isAdministrator: row.is_administrator
    }));
  } catch (error) {
    console.error('Error getting children for user:', error);
    return [];
  }
}

export async function addUserToChild(
  userId: number,
  childId: number,
  relation: UserChildRelation['relation'],
  customRelationName?: string
): Promise<UserChildRelation | null> {
  try {
    const result = await query(
      `INSERT INTO user_child_relations 
       (user_id, child_id, relation, custom_relation_name, is_administrator)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, childId, relation, customRelationName, false]
    );

    return result.rows[0] as UserChildRelation;
  } catch (error) {
    console.error('Error adding user to child:', error);
    return null;
  }
}

export async function removeUserFromChild(
  childId: number,
  userId: number
): Promise<boolean> {
  try {
    const result = await query(
      'DELETE FROM user_child_relations WHERE child_id = $1 AND user_id = $2',
      [childId, userId]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error removing user from child:', error);
    return false;
  }
}

// Invitation functions
export async function createInvitation(
  email: string,
  childId: number,
  invitedBy: number,
  relation: Invitation['relation'],
  customRelationName?: string
): Promise<Invitation | null> {
  try {
    // Generate unique token
    const token = crypto.randomUUID();
    
    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const result = await query(
      `INSERT INTO invitations 
       (email, child_id, invited_by, relation, custom_relation_name, token, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       ON CONFLICT (email, child_id) 
       DO UPDATE SET 
         relation = EXCLUDED.relation,
         custom_relation_name = EXCLUDED.custom_relation_name,
         token = EXCLUDED.token,
         expires_at = EXCLUDED.expires_at,
         status = 'pending',
         updated_at = NOW()
       RETURNING *`,
      [email, childId, invitedBy, relation, customRelationName, token, expiresAt]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      childId: row.child_id,
      invitedBy: row.invited_by,
      relation: row.relation,
      customRelationName: row.custom_relation_name,
      token: row.token,
      status: row.status,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  } catch (error) {
    console.error('Error creating invitation:', error);
    return null;
  }
}

export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  try {
    const result = await query(
      'SELECT * FROM invitations WHERE token = $1',
      [token]
    );

    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      childId: row.child_id,
      invitedBy: row.invited_by,
      relation: row.relation,
      customRelationName: row.custom_relation_name,
      token: row.token,
      status: row.status,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  } catch (error) {
    console.error('Error getting invitation by token:', error);
    return null;
  }
}

export async function getInvitationWithDetails(token: string): Promise<{
  invitation: Invitation;
  childName: string;
  inviterName: string;
  inviterRelation: string;
} | null> {
  try {
    const result = await query(
      `SELECT 
        i.*,
        c.name as child_name,
        u.display_name as inviter_name,
        u.email as inviter_email,
        ucr.relation as inviter_relation,
        ucr.custom_relation_name as inviter_custom_relation
       FROM invitations i
       JOIN children c ON i.child_id = c.id
       JOIN users u ON i.invited_by = u.id
       JOIN user_child_relations ucr ON ucr.user_id = i.invited_by AND ucr.child_id = i.child_id
       WHERE i.token = $1`,
      [token]
    );

    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    
    const invitation: Invitation = {
      id: row.id,
      email: row.email,
      childId: row.child_id,
      invitedBy: row.invited_by,
      relation: row.relation,
      customRelationName: row.custom_relation_name,
      token: row.token,
      status: row.status,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };

    return {
      invitation,
      childName: row.child_name,
      inviterName: row.inviter_name || row.inviter_email,
      inviterRelation: row.inviter_custom_relation || row.inviter_relation
    };
  } catch (error) {
    console.error('Error getting invitation with details:', error);
    return null;
  }
}

export async function updateInvitationStatus(
  invitationId: number, 
  status: 'pending' | 'accepted' | 'expired'
): Promise<boolean> {
  try {
    const result = await query(
      'UPDATE invitations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, invitationId]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error updating invitation status:', error);
    return false;
  }
}

export async function getInvitationsForChild(childId: number): Promise<Invitation[]> {
  try {
    const result = await query(
      'SELECT * FROM invitations WHERE child_id = $1 AND status = $2 ORDER BY created_at DESC',
      [childId, 'pending']
    );

    return result.rows.map(row => ({
      id: row.id,
      email: row.email,
      childId: row.child_id,
      invitedBy: row.invited_by,
      relation: row.relation,
      customRelationName: row.custom_relation_name,
      token: row.token,
      status: row.status,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }));
  } catch (error) {
    console.error('Error getting invitations for child:', error);
    return [];
  }
}

export async function acceptInvitation(token: string, userId: number): Promise<boolean> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    // Get invitation
    const invitationResult = await client.query(
      'SELECT * FROM invitations WHERE token = $1 AND status = $2 AND expires_at > NOW()',
      [token, 'pending']
    );

    if (invitationResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return false;
    }

    const invitation = invitationResult.rows[0];

    // Create user-child relation
    await client.query(
      `INSERT INTO user_child_relations 
       (user_id, child_id, relation, custom_relation_name, is_administrator)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, child_id) DO NOTHING`,
      [userId, invitation.child_id, invitation.relation, invitation.custom_relation_name, false]
    );

    // Mark invitation as accepted
    await client.query(
      'UPDATE invitations SET status = $1, updated_at = NOW() WHERE token = $2',
      ['accepted', token]
    );

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error accepting invitation:', error);
    return false;
  } finally {
    client.release();
  }
}

export async function getChildById(childId: number): Promise<Child | null> {
  try {
    const result = await query(
      'SELECT * FROM children WHERE id = $1',
      [childId]
    );

    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    console.error('Error getting child by ID:', error);
    return null;
  }
}

export async function getChildBySlug(slug: string): Promise<Child | null> {
  try {
    const result = await query(
      'SELECT * FROM children WHERE slug = $1',
      [slug]
    );

    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      createdBy: row.created_by,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    console.error('Error getting child by slug:', error);
    return null;
  }
}

export interface UserWithRelation {
  id: number;
  stackAuthId: string;
  email: string;
  displayName?: string;
  profileImageUrl?: string;
  relation: string;
  customRelationName?: string;
  isAdministrator: boolean;
  createdAt: string; // Changed from Date to string for consistency
}

export async function getUsersForChild(childId: number): Promise<UserWithRelation[]> {
  try {
    const result = await query(
      `SELECT 
         u.id,
         u.stack_auth_id,
         u.email,
         u.display_name,
         u.profile_image_url,
         ucr.relation,
         ucr.custom_relation_name,
         ucr.is_administrator,
         ucr.created_at
       FROM users u
       JOIN user_child_relations ucr ON u.id = ucr.user_id
       WHERE ucr.child_id = $1
       ORDER BY ucr.is_administrator DESC, ucr.created_at ASC`,
      [childId]
    );

    return result.rows.map(row => ({
      id: row.id,
      stackAuthId: row.stack_auth_id,
      email: row.email,
      displayName: row.display_name,
      profileImageUrl: row.profile_image_url,
      relation: row.relation,
      customRelationName: row.custom_relation_name,
      isAdministrator: row.is_administrator,
      createdAt: new Date(row.created_at).toISOString()
    }));
  } catch (error) {
    console.error('Error getting users for child:', error);
    return [];
  }
}

export async function getChildWithUsers(childId: number): Promise<{child: Child; users: UserWithRelation[]} | null> {
  try {
    const child = await getChildById(childId);
    if (!child) return null;

    const users = await getUsersForChild(childId);
    
    return { child, users };
  } catch (error) {
    console.error('Error getting child with users:', error);
    return null;
  }
}

export async function getChildWithUsersAndInvitations(childId: number): Promise<{
  child: Child; 
  users: UserWithRelation[];
  invitations: Invitation[];
} | null> {
  try {
    const child = await getChildById(childId);
    if (!child) return null;

    const users = await getUsersForChild(childId);
    const invitations = await getInvitationsForChild(childId);
    
    return { child, users, invitations };
  } catch (error) {
    console.error('Error getting child with users and invitations:', error);
    return null;
  }
}

export async function isUserAdministratorForChild(userId: number, childId: number): Promise<boolean> {
  try {
    const result = await query(
      'SELECT is_administrator FROM user_child_relations WHERE user_id = $1 AND child_id = $2',
      [userId, childId]
    );

    return result.rows.length > 0 && result.rows[0].is_administrator;
  } catch (error) {
    console.error('Error checking administrator status:', error);
    return false;
  }
}

export async function deleteChild(childId: number, requestingUserId: number): Promise<boolean> {
  const client = await getClient();
  
  try {
    // First check if the requesting user is an administrator for this child
    const isAdmin = await isUserAdministratorForChild(requestingUserId, childId);
    if (!isAdmin) {
      console.error('User is not authorized to delete this child');
      return false;
    }

    await client.query('BEGIN');

    // Delete all user-child relations first (due to foreign key constraints)
    await client.query(
      'DELETE FROM user_child_relations WHERE child_id = $1',
      [childId]
    );

    // Delete the child
    const result = await client.query(
      'DELETE FROM children WHERE id = $1',
      [childId]
    );

    if (result.rowCount === 0) {
      await client.query('ROLLBACK');
      return false;
    }

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting child:', error);
    return false;
  } finally {
    client.release();
  }
}

// Get invitation by ID
export async function getInvitationById(invitationId: number): Promise<Invitation | null> {
  try {
    const result = await query(
      'SELECT * FROM invitations WHERE id = $1',
      [invitationId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      email: row.email,
      childId: row.child_id,
      invitedBy: row.invited_by,
      relation: row.relation,
      customRelationName: row.custom_relation_name,
      token: row.token,
      status: row.status,
      expiresAt: new Date(row.expires_at),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  } catch (error) {
    console.error('Error getting invitation by ID:', error);
    return null;
  }
}

// Delete invitation
export async function deleteInvitation(invitationId: number): Promise<boolean> {
  try {
    const result = await query(
      'DELETE FROM invitations WHERE id = $1',
      [invitationId]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error deleting invitation:', error);
    return false;
  }
}

// Check if user is admin of a child
export async function checkUserIsChildAdmin(userId: number, childId: number): Promise<boolean> {
  try {
    const result = await query(
      `SELECT is_administrator FROM user_child_relations 
       WHERE user_id = $1 AND child_id = $2`,
      [userId, childId]
    );
    
    return result.rows.length > 0 && result.rows[0].is_administrator;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// ================== BAROMETER FUNCTIONS ==================

// Create a new barometer
export async function createBarometer(
  childId: number,
  createdBy: number,
  topic: string,
  scaleMin: number = 1,
  scaleMax: number = 5,
  displayType: string = 'numbers',
  smileyType: string = 'emojis'
): Promise<Barometer | null> {
  try {
    const result = await query(
      `INSERT INTO barometers (child_id, created_by, topic, scale_min, scale_max, display_type, smiley_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [childId, createdBy, topic, scaleMin, scaleMax, displayType, smileyType]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      childId: row.child_id,
      createdBy: row.created_by,
      topic: row.topic,
      scaleMin: row.scale_min,
      scaleMax: row.scale_max,
      displayType: row.display_type,
      smileyType: row.smiley_type,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    console.error('Error creating barometer:', error);
    return null;
  }
}

// Update an existing barometer
export async function updateBarometer(
  barometerId: number,
  topic: string,
  scaleMin: number,
  scaleMax: number,
  displayType: string,
  smileyType?: string
): Promise<Barometer | null> {
  try {
    const result = await query(
      `UPDATE barometers 
       SET topic = $1, scale_min = $2, scale_max = $3, display_type = $4, smiley_type = $5, updated_at = NOW()
       WHERE id = $6 
       RETURNING *`,
      [topic, scaleMin, scaleMax, displayType, smileyType, barometerId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      childId: row.child_id,
      createdBy: row.created_by,
      topic: row.topic,
      scaleMin: row.scale_min,
      scaleMax: row.scale_max,
      displayType: row.display_type,
      smileyType: row.smiley_type,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    console.error('Error updating barometer:', error);
    return null;
  }
}

// Get all barometers for a child
export async function getBarometersForChild(childId: number): Promise<BarometerWithLatestEntry[]> {
  try {
    const result = await query(
      `SELECT 
         b.*,
         be.id as latest_entry_id,
         be.entry_date as latest_entry_date,
         be.rating as latest_rating,
         be.comment as latest_comment,
         be.recorded_by as latest_recorded_by,
         be.created_at as latest_entry_created_at,
         u.display_name as recorded_by_name
       FROM barometers b
       LEFT JOIN LATERAL (
         SELECT * FROM barometer_entries 
         WHERE barometer_id = b.id 
         ORDER BY entry_date DESC 
         LIMIT 1
       ) be ON true
       LEFT JOIN users u ON be.recorded_by = u.id
       WHERE b.child_id = $1
       ORDER BY b.created_at DESC`,
      [childId]
    );

    return result.rows.map(row => {
      const barometer: BarometerWithLatestEntry = {
        id: row.id,
        childId: row.child_id,
        createdBy: row.created_by,
        topic: row.topic,
        scaleMin: row.scale_min,
        scaleMax: row.scale_max,
        displayType: row.display_type || 'numbers',
        smileyType: row.smiley_type,
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString()
      };

      if (row.latest_entry_id) {
        barometer.latestEntry = {
          id: row.latest_entry_id,
          barometerId: row.id,
          recordedBy: row.latest_recorded_by,
          entryDate: row.latest_entry_date,
          rating: row.latest_rating,
          comment: row.latest_comment,
          createdAt: new Date(row.latest_entry_created_at).toISOString(),
          updatedAt: new Date(row.latest_entry_created_at).toISOString()
        };
        barometer.recordedByName = row.recorded_by_name;
      }

      return barometer;
    });
  } catch (error) {
    console.error('Error getting barometers for child:', error);
    return [];
  }
}

// Get a single barometer by ID
export async function getBarometerById(barometerId: number): Promise<Barometer | null> {
  try {
    const result = await query(
      'SELECT * FROM barometers WHERE id = $1',
      [barometerId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      childId: row.child_id,
      createdBy: row.created_by,
      topic: row.topic,
      scaleMin: row.scale_min,
      scaleMax: row.scale_max,
      displayType: row.display_type || 'numbers',
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    console.error('Error getting barometer by ID:', error);
    return null;
  }
}

// Create or update a barometer entry for today
export async function recordBarometerEntry(
  barometerId: number,
  recordedBy: number,
  rating: number,
  comment?: string,
  entryDate?: string // Optional, defaults to today
): Promise<BarometerEntry | null> {
  try {
    const date = entryDate || new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const result = await query(
      `INSERT INTO barometer_entries (barometer_id, recorded_by, entry_date, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (barometer_id, entry_date)
       DO UPDATE SET
         rating = EXCLUDED.rating,
         comment = EXCLUDED.comment,
         recorded_by = EXCLUDED.recorded_by,
         updated_at = NOW()
       RETURNING *`,
      [barometerId, recordedBy, date, rating, comment]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      barometerId: row.barometer_id,
      recordedBy: row.recorded_by,
      entryDate: row.entry_date,
      rating: row.rating,
      comment: row.comment,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    console.error('Error recording barometer entry:', error);
    return null;
  }
}

// Get barometer entries for a specific barometer
export async function getBarometerEntries(
  barometerId: number,
  limit: number = 30
): Promise<(BarometerEntry & { recordedByName?: string })[]> {
  try {
    const result = await query(
      `SELECT 
         be.*,
         u.display_name as recorded_by_name
       FROM barometer_entries be
       LEFT JOIN users u ON be.recorded_by = u.id
       WHERE be.barometer_id = $1
       ORDER BY be.entry_date DESC
       LIMIT $2`,
      [barometerId, limit]
    );

    return result.rows.map(row => ({
      id: row.id,
      barometerId: row.barometer_id,
      recordedBy: row.recorded_by,
      entryDate: row.entry_date,
      rating: row.rating,
      comment: row.comment,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      recordedByName: row.recorded_by_name
    }));
  } catch (error) {
    console.error('Error getting barometer entries:', error);
    return [];
  }
}

// Delete a barometer (and all its entries)
export async function deleteBarometer(barometerId: number): Promise<boolean> {
  try {
    const result = await query(
      'DELETE FROM barometers WHERE id = $1',
      [barometerId]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error deleting barometer:', error);
    return false;
  }
}

// Get a barometer entry by ID with child information
export async function getBarometerEntryById(entryId: number): Promise<(BarometerEntry & { childId: number }) | null> {
  try {
    const result = await query(
      `SELECT be.*, b.child_id 
       FROM barometer_entries be
       JOIN barometers b ON be.barometer_id = b.id
       WHERE be.id = $1`,
      [entryId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      barometerId: row.barometer_id,
      recordedBy: row.recorded_by,
      entryDate: row.entry_date,
      rating: row.rating,
      comment: row.comment,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      childId: row.child_id
    };
  } catch (error) {
    console.error('Error getting barometer entry:', error);
    return null;
  }
}

// Delete a barometer entry
export async function deleteBarometerEntry(entryId: number): Promise<boolean> {
  try {
    const result = await query(
      'DELETE FROM barometer_entries WHERE id = $1',
      [entryId]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error deleting barometer entry:', error);
    return false;
  }
}
