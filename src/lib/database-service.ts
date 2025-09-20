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
  isAdministrator: boolean;
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
  description?: string;
  scaleMin: number;
  scaleMax: number;
  displayType: string;
  smileyType?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BarometerUserAccess {
  id: number;
  barometerId: number;
  userId: number;
  createdAt: string;
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

export interface DagensSmiley {
  id: number;
  childId: number;
  createdBy: number;
  topic: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DagensSmileyUserAccess {
  id: number;
  smileyId: number;
  userId: number;
  createdAt: string;
}

export interface DagensSmileyEntry {
  id: number;
  smileyId: number;
  recordedBy: number;
  entryDate: string; // YYYY-MM-DD format
  selectedEmoji: string; // Unicode emoji
  reasoning?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DagensSmileyWithLatestEntry extends DagensSmiley {
  latestEntry?: DagensSmileyEntry;
  recordedByName?: string;
}

export interface Sengetider {
  id: number;
  childId: number;
  createdBy: number;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SengetiderUserAccess {
  id: number;
  sengetiderId: number;
  userId: number;
  createdAt: string;
}

export interface SengetiderEntry {
  id: number;
  sengetiderId: number;
  recordedBy: number;
  entryDate: string; // YYYY-MM-DD format
  puttetid: string | null; // TIME format HH:MM:SS - time put to bed
  sovKl: string | null; // TIME format HH:MM:SS - time fell asleep
  vaagnede: string | null; // TIME format HH:MM:SS - time woke up
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SengetiderWithLatestEntry extends Sengetider {
  latestEntry?: SengetiderEntry;
  recordedByName?: string;
}

// Indsatstrappe (intervention ladder/action plan) interfaces
export interface Indsatstrappe {
  id: number;
  childId: number;
  createdBy: number;
  title: string;
  description?: string;
  isActive: boolean;
  startDate: string; // DATE format YYYY-MM-DD
  targetDate?: string; // DATE format YYYY-MM-DD (estimated completion)
  completedDate?: string; // DATE format YYYY-MM-DD (actual completion)
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IndsatstrappePlan extends Indsatstrappe {
  steps: IndsatsSteps[];
  currentStepIndex?: number; // Index of the current active step
  totalSteps: number;
  completedSteps: number;
  createdByName?: string;
}

// Step period tracking - records when a step was active
export interface IndsatsStepPeriod {
  id: number;
  stepId: number;
  startDate: string; // When this period started
  endDate?: string; // When this period ended (undefined means currently active)
  activatedBy?: number;
  deactivatedBy?: number;
  activatedByName?: string;
  deactivatedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IndsatsSteps {
  id: number;
  indsatstrapeId: number;
  stepNumber: number;
  title: string;
  description?: string;
  målsætning?: string; // Text describing when/how the goal is achieved
  startDate?: string; // DATE format YYYY-MM-DD
  targetEndDate?: string; // DATE format YYYY-MM-DD
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: number;
  completedByName?: string;
  createdAt: string;
  updatedAt: string;
  // Array of all periods when this step was active
  activePeriods?: IndsatsStepPeriod[];
}

export interface IndsatsStepsWithEntries extends IndsatsSteps {
  linkedEntries: IndsatstrappePlanEntry[];
  entryCount: number;
}

export interface Indsatstrappe_UserAccess {
  id: number;
  indsatstrapeId: number;
  userId: number;
  createdAt: string;
}

// Link between tool entries and indsatstrappe steps
export interface IndsatstrappePlanEntry {
  id: number;
  indsatsStepId: number;
  barometerEntryId?: number;
  dagensSmileyEntryId?: number;
  sengetiderEntryId?: number;
  notes?: string;
  createdAt: string;
  
  // Populated data for display
  entryType?: 'barometer' | 'dagens-smiley' | 'sengetider';
  entryData?: Record<string, unknown>; // The actual entry data from the respective tool
  toolInfo?: {
    id: number;
    topic: string;
    type: string;
  };
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
  customRelationName?: string,
  isAdministrator: boolean = false
): Promise<UserChildRelation | null> {
  try {
    const result = await query(
      `INSERT INTO user_child_relations 
       (user_id, child_id, relation, custom_relation_name, is_administrator)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, childId, relation, customRelationName, isAdministrator]
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

// Promote user to administrator for a child
export async function promoteUserToAdmin(
  childId: number,
  userId: number
): Promise<boolean> {
  try {
    const result = await query(
      'UPDATE user_child_relations SET is_administrator = TRUE WHERE child_id = $1 AND user_id = $2',
      [childId, userId]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error promoting user to admin:', error);
    return false;
  }
}

// Demote user from administrator for a child
export async function demoteUserFromAdmin(
  childId: string,
  userId: string
): Promise<boolean> {
  try {
    const result = await query(
      'UPDATE user_child_relations SET is_administrator = FALSE WHERE child_id = $1 AND user_id = $2',
      [parseInt(childId), parseInt(userId)]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error demoting user from admin:', error);
    return false;
  }
}

// Invitation functions
export async function createInvitation(
  email: string,
  childId: number,
  invitedBy: number,
  relation: Invitation['relation'],
  customRelationName?: string,
  isAdministrator: boolean = false
): Promise<Invitation | null> {
  try {
    // Normalize email to lowercase for consistent storage
    const normalizedEmail = email.toLowerCase();
    
    // Generate unique token
    const token = crypto.randomUUID();
    
    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const result = await query(
      `INSERT INTO invitations 
       (email, child_id, invited_by, relation, custom_relation_name, token, expires_at, is_administrator)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       ON CONFLICT (email, child_id) 
       DO UPDATE SET 
         relation = EXCLUDED.relation,
         custom_relation_name = EXCLUDED.custom_relation_name,
         token = EXCLUDED.token,
         expires_at = EXCLUDED.expires_at,
         is_administrator = EXCLUDED.is_administrator,
         status = 'pending',
         updated_at = NOW()
       RETURNING *`,
      [normalizedEmail, childId, invitedBy, relation, customRelationName, token, expiresAt, isAdministrator]
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
      updatedAt: new Date(row.updated_at),
      isAdministrator: row.is_administrator
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
      updatedAt: new Date(row.updated_at),
      isAdministrator: row.is_administrator || false
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
      updatedAt: new Date(row.updated_at),
      isAdministrator: row.is_administrator || false
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
      updatedAt: new Date(row.updated_at),
      isAdministrator: row.is_administrator || false
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

// Get user-child relation to check access
export async function getUserChildRelation(userId: number, childId: number): Promise<UserChildRelation | null> {
  try {
    const result = await query(
      'SELECT * FROM user_child_relations WHERE user_id = $1 AND child_id = $2',
      [userId, childId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      userId: row.user_id,
      childId: row.child_id,
      relation: row.relation,
      customRelationName: row.custom_relation_name,
      isAdministrator: row.is_administrator,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  } catch (error) {
    console.error('Error fetching user-child relation:', error);
    return null;
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
      updatedAt: new Date(row.updated_at),
      isAdministrator: row.is_administrator || false
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
  smileyType: string = 'emojis',
  description?: string,
  isPublic: boolean = true,
  accessibleUserIds?: number[]
): Promise<Barometer | null> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO barometers (child_id, created_by, topic, description, scale_min, scale_max, display_type, smiley_type, is_public)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [childId, createdBy, topic, description || null, scaleMin, scaleMax, displayType, smileyType, isPublic]
    );

    const row = result.rows[0];
    const barometer: Barometer = {
      id: row.id,
      childId: row.child_id,
      createdBy: row.created_by,
      topic: row.topic,
      description: row.description,
      scaleMin: row.scale_min,
      scaleMax: row.scale_max,
      displayType: row.display_type,
      smileyType: row.smiley_type,
      isPublic: row.is_public,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };

    // If not public, add access records
    if (!isPublic) {
      // Always include the creator
      const usersWithAccess = new Set([createdBy]);
      
      // Add specified users if provided
      if (accessibleUserIds && accessibleUserIds.length > 0) {
        accessibleUserIds.forEach(userId => usersWithAccess.add(userId));
      }
      
      // Insert access records for all users
      for (const userId of usersWithAccess) {
        await client.query(
          `INSERT INTO barometer_user_access (barometer_id, user_id) VALUES ($1, $2)`,
          [barometer.id, userId]
        );
      }
    }

    await client.query('COMMIT');
    return barometer;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating barometer:', error);
    return null;
  } finally {
    client.release();
  }
}

// Update an existing barometer
export async function updateBarometer(
  barometerId: number,
  topic: string,
  scaleMin: number,
  scaleMax: number,
  displayType: string,
  smileyType?: string,
  description?: string,
  isPublic?: boolean,
  accessibleUserIds?: number[]
): Promise<Barometer | null> {
  try {
    // Update the barometer itself
    const result = await query(
      `UPDATE barometers 
       SET topic = $1, description = $2, scale_min = $3, scale_max = $4, display_type = $5, smiley_type = $6, is_public = $7, updated_at = NOW()
       WHERE id = $8 
       RETURNING *`,
      [topic, description || null, scaleMin, scaleMax, displayType, smileyType, isPublic !== undefined ? isPublic : true, barometerId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Handle access control updates if visibility settings were provided
    if (isPublic !== undefined) {
      if (!isPublic) {
        // Delete existing access records
        await query(
          'DELETE FROM barometer_user_access WHERE barometer_id = $1',
          [barometerId]
        );

        // Get the creator ID of the barometer
        const creatorResult = await query(
          'SELECT created_by FROM barometers WHERE id = $1',
          [barometerId]
        );
        
        if (creatorResult.rows.length > 0) {
          const createdBy = creatorResult.rows[0].created_by;
          
          // Always include the creator
          const usersWithAccess = new Set([createdBy]);
          
          // Add specified users if provided
          if (accessibleUserIds && accessibleUserIds.length > 0) {
            accessibleUserIds.forEach(userId => usersWithAccess.add(userId));
          }
          
          // Insert new access records for all users
          for (const userId of usersWithAccess) {
            await query(
              'INSERT INTO barometer_user_access (barometer_id, user_id) VALUES ($1, $2) ON CONFLICT (barometer_id, user_id) DO NOTHING',
              [barometerId, userId]
            );
          }
        }
      } else {
        // If public, remove all access records
        await query(
          'DELETE FROM barometer_user_access WHERE barometer_id = $1',
          [barometerId]
        );
      }
    }

    const row = result.rows[0];
    return {
      id: row.id,
      childId: row.child_id,
      createdBy: row.created_by,
      topic: row.topic,
      description: row.description,
      scaleMin: row.scale_min,
      scaleMax: row.scale_max,
      displayType: row.display_type,
      smileyType: row.smiley_type,
      isPublic: row.is_public ?? true, // Default to true for existing records
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
        description: row.description,
        scaleMin: row.scale_min,
        scaleMax: row.scale_max,
        displayType: row.display_type || 'numbers',
        smileyType: row.smiley_type,
        isPublic: row.is_public ?? true, // Default to true for existing records
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
      description: row.description,
      scaleMin: row.scale_min,
      scaleMax: row.scale_max,
      displayType: row.display_type || 'numbers',
      smileyType: row.smiley_type,
      isPublic: row.is_public ?? true, // Default to true for existing records
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
): Promise<(BarometerEntry & { recordedByName?: string; userRelation?: string; customRelationName?: string })[]> {
  try {
    const result = await query(
      `SELECT 
         be.*,
         u.display_name as recorded_by_name,
         ucr.relation as user_relation,
         ucr.custom_relation_name
       FROM barometer_entries be
       LEFT JOIN users u ON be.recorded_by = u.id
       LEFT JOIN barometers b ON be.barometer_id = b.id
       LEFT JOIN user_child_relations ucr ON u.id = ucr.user_id AND b.child_id = ucr.child_id
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
      recordedByName: row.recorded_by_name,
      userRelation: row.user_relation,
      customRelationName: row.custom_relation_name
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

// ================== BAROMETER ACCESS CONTROL FUNCTIONS ==================

// Add access for specific users to a barometer
export async function addBarometerUserAccess(barometerId: number, userIds: number[]): Promise<boolean> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    for (const userId of userIds) {
      await client.query(
        `INSERT INTO barometer_user_access (barometer_id, user_id) 
         VALUES ($1, $2) 
         ON CONFLICT (barometer_id, user_id) DO NOTHING`,
        [barometerId, userId]
      );
    }
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding barometer user access:', error);
    return false;
  } finally {
    client.release();
  }
}

// Remove access for specific users from a barometer
export async function removeBarometerUserAccess(barometerId: number, userIds: number[]): Promise<boolean> {
  try {
    const result = await query(
      `DELETE FROM barometer_user_access 
       WHERE barometer_id = $1 AND user_id = ANY($2::int[])`,
      [barometerId, userIds]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error removing barometer user access:', error);
    return false;
  }
}

// Get users who have access to a barometer
export async function getBarometerAccessUsers(barometerId: number): Promise<UserWithRelation[]> {
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
         bua.created_at
       FROM barometer_user_access bua
       JOIN users u ON bua.user_id = u.id
       JOIN barometers b ON bua.barometer_id = b.id
       JOIN user_child_relations ucr ON u.id = ucr.user_id AND b.child_id = ucr.child_id
       WHERE bua.barometer_id = $1
       ORDER BY ucr.is_administrator DESC, bua.created_at ASC`,
      [barometerId]
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
    console.error('Error getting barometer access users:', error);
    return [];
  }
}

// Check if a user has access to a barometer
export async function checkUserBarometerAccess(userId: number, barometerId: number): Promise<boolean> {
  try {
    const result = await query(
      `SELECT b.is_public, b.child_id, b.created_by,
              bua.user_id as has_specific_access,
              ucr.user_id as is_child_user
       FROM barometers b
       LEFT JOIN barometer_user_access bua ON b.id = bua.barometer_id AND bua.user_id = $1
       LEFT JOIN user_child_relations ucr ON b.child_id = ucr.child_id AND ucr.user_id = $1
       WHERE b.id = $2`,
      [userId, barometerId]
    );

    if (result.rows.length === 0) {
      return false; // Barometer doesn't exist
    }

    const row = result.rows[0];
    
    // User must be connected to the child
    if (!row.is_child_user) {
      return false;
    }

    // If barometer is public, all connected users have access
    if (row.is_public) {
      return true;
    }

    // If user is the creator, they always have access
    if (row.created_by === userId) {
      return true;
    }

    // If barometer is private, user must have specific access
    return !!row.has_specific_access;
  } catch (error) {
    console.error('Error checking user barometer access:', error);
    return false;
  }
}

// Get barometer access list
export async function getBarometerAccessList(barometerId: number): Promise<{ user_id: number; display_name: string; email: string }[]> {
  try {
    const result = await query(
      `SELECT bua.user_id, u.display_name, u.email 
       FROM barometer_user_access bua 
       JOIN users u ON bua.user_id = u.id 
       WHERE bua.barometer_id = $1`,
      [barometerId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting barometer access list:', error);
    return [];
  }
}

// Get barometers for a child that a specific user has access to
export async function getAccessibleBarometersForChild(childId: number, userId: number): Promise<BarometerWithLatestEntry[]> {
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
       AND (
         b.is_public = true 
         OR b.created_by = $2
         OR EXISTS (
           SELECT 1 FROM barometer_user_access bua 
           WHERE bua.barometer_id = b.id AND bua.user_id = $2
         )
       )
       AND EXISTS (
         SELECT 1 FROM user_child_relations ucr 
         WHERE ucr.child_id = $1 AND ucr.user_id = $2
       )
       ORDER BY b.created_at DESC`,
      [childId, userId]
    );

    return result.rows.map(row => {
      const barometer: BarometerWithLatestEntry = {
        id: row.id,
        childId: row.child_id,
        createdBy: row.created_by,
        topic: row.topic,
        description: row.description,
        scaleMin: row.scale_min,
        scaleMax: row.scale_max,
        displayType: row.display_type || 'numbers',
        smileyType: row.smiley_type,
        isPublic: row.is_public,
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
    console.error('Error getting accessible barometers for child:', error);
    return [];
  }
}

// ================== DAGENS SMILEY FUNCTIONS ==================

// Create a new dagens smiley
export async function createDagensSmiley(
  childId: number,
  createdBy: number,
  topic: string,
  description?: string,
  isPublic: boolean = true,
  accessibleUserIds?: number[]
): Promise<DagensSmiley | null> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO dagens_smiley (child_id, created_by, topic, description, is_public)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [childId, createdBy, topic, description || null, isPublic]
    );

    const row = result.rows[0];
    const smiley: DagensSmiley = {
      id: row.id,
      childId: row.child_id,
      createdBy: row.created_by,
      topic: row.topic,
      description: row.description,
      isPublic: row.is_public,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };

    // If not public, add access records
    if (!isPublic) {
      const userIds = new Set([createdBy]); // Creator always has access
      if (accessibleUserIds && accessibleUserIds.length > 0) {
        accessibleUserIds.forEach(id => userIds.add(id));
      }

      for (const userId of userIds) {
        await client.query(
          'INSERT INTO dagens_smiley_user_access (smiley_id, user_id) VALUES ($1, $2)',
          [smiley.id, userId]
        );
      }
    }

    await client.query('COMMIT');
    return smiley;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating dagens smiley:', error);
    return null;
  } finally {
    client.release();
  }
}

// Update an existing dagens smiley
export async function updateDagensSmiley(
  smileyId: number,
  topic: string,
  description?: string,
  isPublic?: boolean,
  accessibleUserIds?: number[]
): Promise<DagensSmiley | null> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    // Update the smiley
    const result = await client.query(
      `UPDATE dagens_smiley 
       SET topic = $2, description = $3, is_public = $4, updated_at = NOW()
       WHERE id = $1 RETURNING *`,
      [smileyId, topic, description || null, isPublic]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    const row = result.rows[0];
    const smiley: DagensSmiley = {
      id: row.id,
      childId: row.child_id,
      createdBy: row.created_by,
      topic: row.topic,
      description: row.description,
      isPublic: row.is_public,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };

    // Handle access control changes if specified
    if (isPublic !== undefined && accessibleUserIds !== undefined) {
      if (!isPublic) {
        // Remove all existing access
        await client.query('DELETE FROM dagens_smiley_user_access WHERE smiley_id = $1', [smileyId]);
        
        // Add new access
        const userIds = new Set([smiley.createdBy]); // Creator always has access
        if (accessibleUserIds.length > 0) {
          accessibleUserIds.forEach(id => userIds.add(id));
        }

        for (const userId of userIds) {
          await client.query(
            'INSERT INTO dagens_smiley_user_access (smiley_id, user_id) VALUES ($1, $2)',
            [smileyId, userId]
          );
        }
      } else {
        // If making public, remove all access records
        await client.query('DELETE FROM dagens_smiley_user_access WHERE smiley_id = $1', [smileyId]);
      }
    }

    await client.query('COMMIT');
    return smiley;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating dagens smiley:', error);
    return null;
  } finally {
    client.release();
  }
}

// Get all dagens smiley for a child
export async function getDagensSmileyForChild(childId: number): Promise<DagensSmileyWithLatestEntry[]> {
  try {
    const result = await query(
      `SELECT 
         ds.*,
         dse.id as latest_entry_id,
         dse.recorded_by as latest_recorded_by,
         dse.entry_date as latest_entry_date,
         dse.selected_emoji as latest_selected_emoji,
         dse.reasoning as latest_reasoning,
         dse.created_at as latest_entry_created_at,
         u.display_name as recorded_by_name
       FROM dagens_smiley ds
       LEFT JOIN dagens_smiley_entries dse ON ds.id = dse.smiley_id 
         AND dse.id = (
           SELECT id FROM dagens_smiley_entries dse2 
           WHERE dse2.smiley_id = ds.id 
           ORDER BY dse2.entry_date DESC 
           LIMIT 1
         )
       LEFT JOIN users u ON dse.recorded_by = u.id
       WHERE ds.child_id = $1
       ORDER BY ds.created_at DESC`,
      [childId]
    );

    return result.rows.map(row => {
      const smiley: DagensSmileyWithLatestEntry = {
        id: row.id,
        childId: row.child_id,
        createdBy: row.created_by,
        topic: row.topic,
        description: row.description,
        isPublic: row.is_public,
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString()
      };

      if (row.latest_entry_id) {
        smiley.latestEntry = {
          id: row.latest_entry_id,
          smileyId: row.id,
          recordedBy: row.latest_recorded_by,
          entryDate: row.latest_entry_date,
          selectedEmoji: row.latest_selected_emoji,
          reasoning: row.latest_reasoning,
          createdAt: new Date(row.latest_entry_created_at).toISOString(),
          updatedAt: new Date(row.latest_entry_created_at).toISOString()
        };
        smiley.recordedByName = row.recorded_by_name;
      }

      return smiley;
    });
  } catch (error) {
    console.error('Error getting dagens smiley for child:', error);
    return [];
  }
}

// Get a single dagens smiley by ID
export async function getDagensSmileyById(smileyId: number): Promise<DagensSmiley | null> {
  try {
    const result = await query(
      'SELECT * FROM dagens_smiley WHERE id = $1',
      [smileyId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      childId: row.child_id,
      createdBy: row.created_by,
      topic: row.topic,
      description: row.description,
      isPublic: row.is_public,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    console.error('Error getting dagens smiley by ID:', error);
    return null;
  }
}

// Create or update a dagens smiley entry for today
export async function recordDagensSmileyEntry(
  smileyId: number,
  recordedBy: number,
  selectedEmoji: string,
  reasoning?: string,
  entryDate?: string // Optional, defaults to today
): Promise<DagensSmileyEntry | null> {
  try {
    const date = entryDate || new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // First, try to update existing entry for today
    const updateResult = await query(
      `UPDATE dagens_smiley_entries 
       SET selected_emoji = $3, reasoning = $4, updated_at = NOW()
       WHERE smiley_id = $1 AND entry_date = $2 
       RETURNING *`,
      [smileyId, date, selectedEmoji, reasoning || null]
    );

    if (updateResult.rows.length > 0) {
      // Entry updated
      const row = updateResult.rows[0];
      return {
        id: row.id,
        smileyId: row.smiley_id,
        recordedBy: row.recorded_by,
        entryDate: row.entry_date,
        selectedEmoji: row.selected_emoji,
        reasoning: row.reasoning,
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString()
      };
    }

    // If no existing entry, create new one
    const insertResult = await query(
      `INSERT INTO dagens_smiley_entries (smiley_id, recorded_by, entry_date, selected_emoji, reasoning)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [smileyId, recordedBy, date, selectedEmoji, reasoning || null]
    );

    if (insertResult.rows.length === 0) return null;

    const row = insertResult.rows[0];
    return {
      id: row.id,
      smileyId: row.smiley_id,
      recordedBy: row.recorded_by,
      entryDate: row.entry_date,
      selectedEmoji: row.selected_emoji,
      reasoning: row.reasoning,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    console.error('Error recording dagens smiley entry:', error);
    return null;
  }
}

// Get dagens smiley entries for a specific smiley
export async function getDagensSmileyEntries(
  smileyId: number,
  limit: number = 30
): Promise<(DagensSmileyEntry & { recordedByName?: string; userRelation?: string; customRelationName?: string })[]> {
  try {
    const result = await query(
      `SELECT 
         dse.*,
         u.display_name as recorded_by_name,
         ucr.relation as user_relation,
         ucr.custom_relation_name
       FROM dagens_smiley_entries dse
       LEFT JOIN users u ON dse.recorded_by = u.id
       LEFT JOIN dagens_smiley ds ON dse.smiley_id = ds.id
       LEFT JOIN user_child_relations ucr ON u.id = ucr.user_id AND ds.child_id = ucr.child_id
       WHERE dse.smiley_id = $1
       ORDER BY dse.entry_date DESC
       LIMIT $2`,
      [smileyId, limit]
    );

    return result.rows.map(row => ({
      id: row.id,
      smileyId: row.smiley_id,
      recordedBy: row.recorded_by,
      entryDate: row.entry_date,
      selectedEmoji: row.selected_emoji,
      reasoning: row.reasoning,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      recordedByName: row.recorded_by_name,
      userRelation: row.user_relation,
      customRelationName: row.custom_relation_name
    }));
  } catch (error) {
    console.error('Error getting dagens smiley entries:', error);
    return [];
  }
}

// Delete a dagens smiley (and all its entries)
export async function deleteDagensSmiley(smileyId: number): Promise<boolean> {
  try {
    const result = await query(
      'DELETE FROM dagens_smiley WHERE id = $1',
      [smileyId]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error deleting dagens smiley:', error);
    return false;
  }
}

// Get a dagens smiley entry by ID with child information
export async function getDagensSmileyEntryById(entryId: number): Promise<(DagensSmileyEntry & { childId: number }) | null> {
  try {
    const result = await query(
      `SELECT dse.*, ds.child_id 
       FROM dagens_smiley_entries dse 
       JOIN dagens_smiley ds ON dse.smiley_id = ds.id 
       WHERE dse.id = $1`,
      [entryId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      id: row.id,
      smileyId: row.smiley_id,
      recordedBy: row.recorded_by,
      entryDate: row.entry_date,
      selectedEmoji: row.selected_emoji,
      reasoning: row.reasoning,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      childId: row.child_id
    };
  } catch (error) {
    console.error('Error getting dagens smiley entry by ID:', error);
    return null;
  }
}

// Delete a dagens smiley entry
export async function deleteDagensSmileyEntry(entryId: number): Promise<boolean> {
  try {
    const result = await query(
      'DELETE FROM dagens_smiley_entries WHERE id = $1',
      [entryId]
    );

    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('Error deleting dagens smiley entry:', error);
    return false;
  }
}

// ================== DAGENS SMILEY ACCESS CONTROL FUNCTIONS ==================

// Add access for specific users to a dagens smiley
export async function addDagensSmileyUserAccess(smileyId: number, userIds: number[]): Promise<boolean> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    for (const userId of userIds) {
      await client.query(
        `INSERT INTO dagens_smiley_user_access (smiley_id, user_id) 
         VALUES ($1, $2) 
         ON CONFLICT (smiley_id, user_id) DO NOTHING`,
        [smileyId, userId]
      );
    }
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error adding dagens smiley user access:', error);
    return false;
  } finally {
    client.release();
  }
}

// Remove access for specific users from a dagens smiley
export async function removeDagensSmileyUserAccess(smileyId: number, userIds: number[]): Promise<boolean> {
  try {
    await query(
      'DELETE FROM dagens_smiley_user_access WHERE smiley_id = $1 AND user_id = ANY($2)',
      [smileyId, userIds]
    );
    return true;
  } catch (error) {
    console.error('Error removing dagens smiley user access:', error);
    return false;
  }
}

// Get users who have access to a dagens smiley
export async function getDagensSmileyAccessUsers(smileyId: number): Promise<UserWithRelation[]> {
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
         dsua.created_at
       FROM dagens_smiley_user_access dsua
       JOIN users u ON dsua.user_id = u.id
       JOIN dagens_smiley ds ON dsua.smiley_id = ds.id
       JOIN user_child_relations ucr ON u.id = ucr.user_id AND ds.child_id = ucr.child_id
       WHERE dsua.smiley_id = $1
       ORDER BY ucr.is_administrator DESC, dsua.created_at ASC`,
      [smileyId]
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
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.created_at).toISOString() // Using created_at as updated_at
    }));
  } catch (error) {
    console.error('Error getting dagens smiley access users:', error);
    return [];
  }
}

// Check if a user has access to a dagens smiley
export async function checkUserDagensSmileyAccess(userId: number, smileyId: number): Promise<boolean> {
  try {
    // Get the smiley to check if it's public
    const smiley = await getDagensSmileyById(smileyId);
    if (!smiley) return false;
    
    // If public, check if user has access to the child
    if (smiley.isPublic) {
      const result = await query(
        `SELECT 1 FROM user_child_relations ucr 
         WHERE ucr.child_id = $1 AND ucr.user_id = $2`,
        [smiley.childId, userId]
      );
      return result.rows.length > 0;
    }
    
    // If private, check specific access
    const result = await query(
      'SELECT 1 FROM dagens_smiley_user_access WHERE smiley_id = $1 AND user_id = $2',
      [smileyId, userId]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking user dagens smiley access:', error);
    return false;
  }
}

// Get dagens smiley access list
export async function getDagensSmileyAccessList(smileyId: number): Promise<{ user_id: number; display_name: string; email: string }[]> {
  try {
    const result = await query(
      `SELECT dsua.user_id, u.display_name, u.email 
       FROM dagens_smiley_user_access dsua 
       JOIN users u ON dsua.user_id = u.id 
       WHERE dsua.smiley_id = $1`,
      [smileyId]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting dagens smiley access list:', error);
    return [];
  }
}

// Get dagens smiley for a child that a specific user has access to
export async function getAccessibleDagensSmileyForChild(childId: number, userId: number): Promise<DagensSmileyWithLatestEntry[]> {
  try {
    const result = await query(
      `SELECT 
         ds.*,
         dse.id as latest_entry_id,
         dse.recorded_by as latest_recorded_by,
         dse.entry_date as latest_entry_date,
         dse.selected_emoji as latest_selected_emoji,
         dse.reasoning as latest_reasoning,
         dse.created_at as latest_entry_created_at,
         u.display_name as recorded_by_name
       FROM dagens_smiley ds
       LEFT JOIN dagens_smiley_entries dse ON ds.id = dse.smiley_id 
         AND dse.id = (
           SELECT id FROM dagens_smiley_entries dse2 
           WHERE dse2.smiley_id = ds.id 
           ORDER BY dse2.entry_date DESC 
           LIMIT 1
         )
       LEFT JOIN users u ON dse.recorded_by = u.id
       WHERE ds.child_id = $1
       AND (
         ds.is_public = true 
         OR EXISTS (
           SELECT 1 FROM dagens_smiley_user_access dsua 
           WHERE dsua.smiley_id = ds.id AND dsua.user_id = $2
         )
       )
       AND EXISTS (
         SELECT 1 FROM user_child_relations ucr 
         WHERE ucr.child_id = $1 AND ucr.user_id = $2
       )
       ORDER BY ds.created_at DESC`,
      [childId, userId]
    );

    return result.rows.map(row => {
      const smiley: DagensSmileyWithLatestEntry = {
        id: row.id,
        childId: row.child_id,
        createdBy: row.created_by,
        topic: row.topic,
        description: row.description,
        isPublic: row.is_public,
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString()
      };

      if (row.latest_entry_id) {
        smiley.latestEntry = {
          id: row.latest_entry_id,
          smileyId: row.id,
          recordedBy: row.latest_recorded_by,
          entryDate: row.latest_entry_date,
          selectedEmoji: row.latest_selected_emoji,
          reasoning: row.latest_reasoning,
          createdAt: new Date(row.latest_entry_created_at).toISOString(),
          updatedAt: new Date(row.latest_entry_created_at).toISOString()
        };
        smiley.recordedByName = row.recorded_by_name;
      }

      return smiley;
    });
  } catch (error) {
    console.error('Error getting accessible dagens smiley for child:', error);
    return [];
  }
}

// Interface for unified registration entries
export interface RegistrationEntry {
  id: number;
  type: 'barometer' | 'smiley';
  childId: number;
  childName: string;
  toolName: string;
  entryDate: string;
  createdAt: string;
  recordedByName?: string;
  userRelation?: string;
  customRelationName?: string;
  // Type-specific data
  rating?: number; // for barometer
  comment?: string; // for barometer
  selectedEmoji?: string; // for smiley
  reasoning?: string; // for smiley
}

// Get latest registrations across all children for a user
export async function getLatestRegistrationsForUser(
  userId: number,
  limit: number = 20
): Promise<RegistrationEntry[]> {
  try {
    // First check what children this user has access to
    const childrenCheck = await query(
      `SELECT child_id FROM user_child_relations WHERE user_id = $1`,
      [userId]
    );
    console.log('DB: User', userId, 'has access to children:', childrenCheck.rows);

    const mainResult = await query(
      `WITH user_children AS (
        SELECT child_id FROM user_child_relations WHERE user_id = $1
      ),
      barometer_entries_with_info AS (
        SELECT 
          be.id,
          'barometer' as type,
          c.id as child_id,
          c.name as child_name,
          b.topic as tool_name,
          be.entry_date,
          be.created_at,
          u.display_name as recorded_by_name,
          ucr.relation as user_relation,
          ucr.custom_relation_name,
          be.rating::text as rating,
          be.comment,
          NULL as selected_emoji,
          NULL as reasoning
        FROM barometer_entries be
        JOIN barometers b ON be.barometer_id = b.id
        JOIN children c ON b.child_id = c.id
        JOIN user_children uc ON c.id = uc.child_id
        LEFT JOIN users u ON be.recorded_by = u.id
        LEFT JOIN user_child_relations ucr ON u.id = ucr.user_id AND c.id = ucr.child_id
        WHERE (b.is_public = true OR EXISTS (
          SELECT 1 FROM barometer_user_access bua WHERE bua.barometer_id = b.id AND bua.user_id = $1
        ))
      ),
      smiley_entries_with_info AS (
        SELECT 
          dse.id,
          'smiley' as type,
          c.id as child_id,
          c.name as child_name,
          ds.topic as tool_name,
          dse.entry_date,
          dse.created_at,
          u.display_name as recorded_by_name,
          ucr.relation as user_relation,
          ucr.custom_relation_name,
          NULL as rating,
          NULL as comment,
          dse.selected_emoji,
          dse.reasoning
        FROM dagens_smiley_entries dse
        JOIN dagens_smiley ds ON dse.smiley_id = ds.id
        JOIN children c ON ds.child_id = c.id
        JOIN user_children uc ON c.id = uc.child_id
        LEFT JOIN users u ON dse.recorded_by = u.id
        LEFT JOIN user_child_relations ucr ON u.id = ucr.user_id AND c.id = ucr.child_id
        WHERE (ds.is_public = true OR EXISTS (
          SELECT 1 FROM dagens_smiley_user_access dsua WHERE dsua.smiley_id = ds.id AND dsua.user_id = $1
        ))
      )
      SELECT * FROM (
        SELECT * FROM barometer_entries_with_info
        UNION ALL
        SELECT * FROM smiley_entries_with_info
      ) combined_entries
      ORDER BY created_at DESC
      LIMIT $2`,
      [userId, limit]
    );

    console.log('DB: Query for userId:', userId, 'returned', mainResult.rows.length, 'rows');
    if (mainResult.rows.length > 0) {
      console.log('DB: Sample row:', mainResult.rows[0]);
    }

    return mainResult.rows.map(row => ({
      id: row.id,
      type: row.type,
      childId: row.child_id,
      childName: row.child_name,
      toolName: row.tool_name,
      entryDate: row.entry_date,
      createdAt: new Date(row.created_at).toISOString(),
      recordedByName: row.recorded_by_name,
      userRelation: row.user_relation,
      customRelationName: row.custom_relation_name,
      rating: row.rating ? parseInt(row.rating) : undefined,
      comment: row.comment,
      selectedEmoji: row.selected_emoji,
      reasoning: row.reasoning
    }));
  } catch (error) {
    console.error('Error getting latest registrations for user:', error);
    return [];
  }
}

// Sengetider (Bedtime tracking) functions

// Create a new sengetider
export async function createSengetider(
  childId: number,
  createdBy: number,
  description?: string,
  isPublic: boolean = true,
  accessibleUserIds?: number[]
): Promise<Sengetider | null> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO sengetider (child_id, created_by, description, is_public)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [childId, createdBy, description || null, isPublic]
    );

    const row = result.rows[0];
    const sengetider: Sengetider = {
      id: row.id,
      childId: row.child_id,
      createdBy: row.created_by,
      description: row.description,
      isPublic: row.is_public,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };

    // If not public, add access records
    if (!isPublic) {
      const userIds = new Set([createdBy]); // Creator always has access
      if (accessibleUserIds && accessibleUserIds.length > 0) {
        accessibleUserIds.forEach(id => userIds.add(id));
      }

      for (const userId of userIds) {
        await client.query(
          'INSERT INTO sengetider_user_access (sengetider_id, user_id) VALUES ($1, $2)',
          [sengetider.id, userId]
        );
      }
    }

    await client.query('COMMIT');
    return sengetider;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating sengetider:', error);
    return null;
  } finally {
    client.release();
  }
}

// Get sengetider for a child
export async function getSengetiderForChild(
  childId: number,
  userId: number
): Promise<SengetiderWithLatestEntry[]> {
  try {
    const result = await query(
      `SELECT 
         s.*,
         se.id as latest_entry_id,
         se.entry_date as latest_entry_date,
         se.puttetid as latest_puttetid,
         se.sov_kl as latest_sov_kl,
         se.vaagnede as latest_vaagnede,
         se.notes as latest_notes,
         se.recorded_by as latest_recorded_by,
         se.created_at as latest_entry_created_at,
         se.updated_at as latest_entry_updated_at,
         u.display_name as recorded_by_name
       FROM sengetider s
       LEFT JOIN LATERAL (
         SELECT * FROM sengetider_entries se
         WHERE se.sengetider_id = s.id
         ORDER BY se.entry_date DESC
         LIMIT 1
       ) se ON true
       LEFT JOIN users u ON se.recorded_by = u.id
       WHERE s.child_id = $1
       AND (s.is_public = true OR EXISTS (
         SELECT 1 FROM sengetider_user_access sua WHERE sua.sengetider_id = s.id AND sua.user_id = $2
       ))
       ORDER BY s.created_at DESC`,
      [childId, userId]
    );

    return result.rows.map(row => ({
      id: row.id,
      childId: row.child_id,
      createdBy: row.created_by,
      description: row.description,
      isPublic: row.is_public,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      latestEntry: row.latest_entry_id ? {
        id: row.latest_entry_id,
        sengetiderId: row.id,
        recordedBy: row.latest_recorded_by || 0,
        entryDate: row.latest_entry_date,
        puttetid: row.latest_puttetid,
        sovKl: row.latest_sov_kl,
        vaagnede: row.latest_vaagnede,
        notes: row.latest_notes,
        createdAt: new Date(row.latest_entry_created_at).toISOString(),
        updatedAt: new Date(row.latest_entry_updated_at).toISOString()
      } : undefined,
      recordedByName: row.recorded_by_name
    }));
  } catch (error) {
    console.error('Error getting sengetider for child:', error);
    return [];
  }
}

// Create a new sengetider entry
export async function createSengetiderEntry(
  sengetiderId: number,
  recordedBy: number,
  entryDate: string, // YYYY-MM-DD format
  puttetid: string | null, // HH:MM:SS format - time put to bed
  sovKl: string | null, // HH:MM:SS format - time fell asleep
  vaagnede: string | null, // HH:MM:SS format - time woke up
  notes?: string
): Promise<SengetiderEntry | null> {
  try {
    const result = await query(
      `INSERT INTO sengetider_entries (sengetider_id, recorded_by, entry_date, puttetid, sov_kl, vaagnede, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [sengetiderId, recordedBy, entryDate, puttetid, sovKl, vaagnede, notes || null]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      sengetiderId: row.sengetider_id,
      recordedBy: row.recorded_by,
      entryDate: row.entry_date,
      puttetid: row.puttetid,
      sovKl: row.sov_kl,
      vaagnede: row.vaagnede,
      notes: row.notes,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    console.error('Error creating sengetider entry:', error);
    return null;
  }
}

// Get a single sengetider by ID
export async function getSengetiderById(sengetiderId: number): Promise<Sengetider | null> {
  try {
    const result = await query(
      'SELECT * FROM sengetider WHERE id = $1',
      [sengetiderId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      childId: row.child_id,
      createdBy: row.created_by,
      description: row.description,
      isPublic: row.is_public,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    console.error('Error getting sengetider by ID:', error);
    return null;
  }
}

// Get sengetider entries for a specific sengetider
export async function getSengetiderEntries(
  sengetiderId: number,
  limit: number = 30
): Promise<(SengetiderEntry & { recordedByName?: string; userRelation?: string; customRelationName?: string })[]> {
  try {
    const result = await query(
      `SELECT 
         se.*,
         u.display_name as recorded_by_name,
         ucr.relation as user_relation,
         ucr.custom_relation_name
       FROM sengetider_entries se
       LEFT JOIN users u ON se.recorded_by = u.id
       LEFT JOIN sengetider s ON se.sengetider_id = s.id
       LEFT JOIN user_child_relations ucr ON u.id = ucr.user_id AND s.child_id = ucr.child_id
       WHERE se.sengetider_id = $1
       ORDER BY se.entry_date DESC
       LIMIT $2`,
      [sengetiderId, limit]
    );

    return result.rows.map(row => ({
      id: row.id,
      sengetiderId: row.sengetider_id,
      recordedBy: row.recorded_by,
      entryDate: row.entry_date,
      puttetid: row.puttetid,
      sovKl: row.sov_kl,
      vaagnede: row.vaagnede,
      notes: row.notes,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
      recordedByName: row.recorded_by_name,
      userRelation: row.user_relation,
      customRelationName: row.custom_relation_name
    }));
  } catch (error) {
    console.error('Error getting sengetider entries:', error);
    return [];
  }
}

// Update a sengetider
export async function updateSengetider(
  id: number,
  updates: Partial<Omit<Sengetider, 'id' | 'childId' | 'createdBy' | 'createdAt' | 'updatedAt'>>
): Promise<Sengetider | null> {
  try {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(updates.description);
    }
    if (updates.isPublic !== undefined) {
      fields.push(`is_public = $${paramIndex++}`);
      values.push(updates.isPublic);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE sengetider SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      childId: row.child_id,
      createdBy: row.created_by,
      description: row.description,
      isPublic: row.is_public,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    console.error('Error updating sengetider:', error);
    return null;
  }
}

// Delete a sengetider
export async function deleteSengetider(id: number): Promise<boolean> {
  try {
    const result = await query('DELETE FROM sengetider WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting sengetider:', error);
    return false;
  }
}

// Delete a sengetider entry
export async function deleteSengetiderEntry(id: number): Promise<boolean> {
  try {
    const result = await query('DELETE FROM sengetider_entries WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting sengetider entry:', error);
    return false;
  }
}

// Update a sengetider entry
export async function updateSengetiderEntry(
  id: number,
  updates: Partial<Omit<SengetiderEntry, 'id' | 'sengetiderId' | 'recordedBy' | 'createdAt' | 'updatedAt'>>
): Promise<SengetiderEntry | null> {
  try {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.entryDate !== undefined) {
      fields.push(`entry_date = $${paramIndex++}`);
      values.push(updates.entryDate);
    }
    if (updates.puttetid !== undefined) {
      fields.push(`puttetid = $${paramIndex++}`);
      values.push(updates.puttetid);
    }
    if (updates.sovKl !== undefined) {
      fields.push(`sov_kl = $${paramIndex++}`);
      values.push(updates.sovKl);
    }
    if (updates.vaagnede !== undefined) {
      fields.push(`vaagnede = $${paramIndex++}`);
      values.push(updates.vaagnede);
    }
    if (updates.notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`);
      values.push(updates.notes);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE sengetider_entries SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      sengetiderId: row.sengetider_id,
      recordedBy: row.recorded_by,
      entryDate: row.entry_date,
      puttetid: row.puttetid,
      sovKl: row.sov_kl,
      vaagnede: row.vaagnede,
      notes: row.notes,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    console.error('Error updating sengetider entry:', error);
    return null;
  }
}

// ====================================================================
// INDSATSTRAPPE (Intervention Ladder) Functions
// ====================================================================

// Create a new indsatstrappe plan
export async function createIndsatstrappe(
  childId: number,
  createdBy: number,
  title: string,
  description?: string,
  isActive: boolean = true,
  startDate?: string, // Optional start date, defaults to today
  targetDate?: string,
  accessibleUserIds?: number[]
): Promise<Indsatstrappe> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    // Deactivate other plans if this one is active
    if (isActive) {
      await client.query(
        'UPDATE indsatstrappe SET is_active = false WHERE child_id = $1 AND is_active = true',
        [childId]
      );
    }

    // Create the plan with start_date defaulting to today if not provided
    const planResult = await client.query(
      `INSERT INTO indsatstrappe (child_id, created_by, title, description, is_active, start_date, target_date, updated_at)
       VALUES ($1, $2, $3, $4, $5, COALESCE($6, CURRENT_DATE), $7, NOW())
       RETURNING *`,
      [childId, createdBy, title, description, isActive, startDate, targetDate]
    );

    const plan = planResult.rows[0];

    // Add user access control if specified
    if (accessibleUserIds && accessibleUserIds.length > 0) {
      const accessValues = accessibleUserIds.map((_, index) => 
        `($1, $${index + 2})`
      ).join(', ');

      await client.query(
        `INSERT INTO indsatstrappe_user_access (indsatstrappe_id, user_id)
         VALUES ${accessValues}`,
        [plan.id, ...accessibleUserIds]
      );
    }

    await client.query('COMMIT');

    return {
      id: plan.id,
      childId: plan.child_id,
      createdBy: plan.created_by,
      title: plan.title,
      description: plan.description,
      isActive: plan.is_active,
      startDate: plan.start_date,
      targetDate: plan.target_date,
      completedDate: plan.completed_date,
      isCompleted: plan.is_completed,
      createdAt: new Date(plan.created_at).toISOString(),
      updatedAt: new Date(plan.updated_at).toISOString()
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating indsatstrappe:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Get all indsatstrappe plans for a child
export async function getIndsatsrappeForChild(
  childId: number,
  userId?: number
): Promise<IndsatstrappePlan[]> {
  try {
    let queryText = `
      SELECT 
        i.*,
        u.display_name as created_by_name,
        COUNT(s.id) as total_steps,
        COUNT(CASE WHEN s.is_completed = true THEN 1 END) as completed_steps
      FROM indsatstrappe i
      LEFT JOIN users u ON i.created_by = u.id
      LEFT JOIN indsatstrappe_steps s ON i.id = s.indsatstrappe_id
      WHERE i.child_id = $1
    `;
    
    const queryParams = [childId];

    // Add access control if userId is provided
    if (userId) {
      queryText += `
        AND (i.created_by = $2 OR 
             EXISTS (SELECT 1 FROM indsatstrappe_user_access iua WHERE iua.indsatstrappe_id = i.id AND iua.user_id = $2) OR
             EXISTS (SELECT 1 FROM user_child_relations ucr WHERE ucr.child_id = i.child_id AND ucr.user_id = $2 AND ucr.is_administrator = true))
      `;
      queryParams.push(userId);
    }

    queryText += `
      GROUP BY i.id, u.display_name
      ORDER BY i.is_active DESC, i.created_at DESC
    `;

    const result = await query(queryText, queryParams);
    
    // For each plan, get its steps
    const plans: IndsatstrappePlan[] = [];
    
    for (const row of result.rows) {
      const steps = await getIndsatsStepsForPlan(row.id);
      const currentStepIndex = steps.findIndex(step => !step.isCompleted);
      
      plans.push({
        id: row.id,
        childId: row.child_id,
        createdBy: row.created_by,
        title: row.title,
        description: row.description,
        isActive: row.is_active,
        startDate: row.start_date,
        targetDate: row.target_date,
        completedDate: row.completed_date,
        isCompleted: row.is_completed,
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString(),
        steps,
        currentStepIndex: currentStepIndex >= 0 ? currentStepIndex : undefined,
        totalSteps: parseInt(row.total_steps),
        completedSteps: parseInt(row.completed_steps),
        createdByName: row.created_by_name
      });
    }

    return plans;
  } catch (error) {
    console.error('Error fetching indsatstrappe for child:', error);
    return [];
  }
}

// Get steps for an indsatstrappe plan
export async function getIndsatsStepsForPlan(planId: number): Promise<IndsatsSteps[]> {
  try {
    const result = await query(
      `SELECT 
         s.*,
         u.display_name as completed_by_name
       FROM indsatstrappe_steps s
       LEFT JOIN users u ON s.completed_by = u.id
       WHERE s.indsatstrappe_id = $1
       ORDER BY s.step_number ASC`,
      [planId]
    );

    const steps = result.rows.map(row => ({
      id: row.id,
      indsatstrapeId: row.indsatstrappe_id,
      stepNumber: row.step_number,
      title: row.title,
      description: row.description,
      målsætning: row.målsætning,
      startDate: row.start_date,
      targetEndDate: row.target_end_date,
      isCompleted: row.is_completed,
      completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : undefined,
      completedBy: row.completed_by,
      completedByName: row.completed_by_name,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    }));
    
    // Get periods for all steps
    const stepIds = steps.map(step => step.id);
    const periodsByStep = await getPeriodsForSteps(stepIds);

    // Add periods to each step
    return steps.map(step => ({
      ...step,
      activePeriods: periodsByStep[step.id] || []
    }));
  } catch (error) {
    console.error('Error fetching indsats steps for plan:', error);
    return [];
  }
}

// Get all periods for a step
export async function getStepPeriods(stepId: number): Promise<IndsatsStepPeriod[]> {
  try {
    const result = await query(`
      SELECT 
        sp.*,
        u1.display_name as activated_by_name,
        u2.display_name as deactivated_by_name
      FROM indsatstrappe_step_periods sp
      LEFT JOIN users u1 ON sp.activated_by = u1.id
      LEFT JOIN users u2 ON sp.deactivated_by = u2.id
      WHERE sp.step_id = $1
      ORDER BY sp.start_date ASC
    `, [stepId]);

    return result.rows.map(row => ({
      id: row.id,
      stepId: row.step_id,
      startDate: new Date(row.start_date).toISOString(),
      endDate: row.end_date ? new Date(row.end_date).toISOString() : undefined,
      activatedBy: row.activated_by,
      deactivatedBy: row.deactivated_by,
      activatedByName: row.activated_by_name,
      deactivatedByName: row.deactivated_by_name,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    }));
  } catch (error) {
    console.error('Error fetching step periods:', error);
    return [];
  }
}

// Get periods for multiple steps
export async function getPeriodsForSteps(stepIds: number[]): Promise<{ [stepId: number]: IndsatsStepPeriod[] }> {
  if (stepIds.length === 0) return {};
  
  try {
    const result = await query(`
      SELECT 
        sp.*,
        u1.display_name as activated_by_name,
        u2.display_name as deactivated_by_name
      FROM indsatstrappe_step_periods sp
      LEFT JOIN users u1 ON sp.activated_by = u1.id
      LEFT JOIN users u2 ON sp.deactivated_by = u2.id
      WHERE sp.step_id = ANY($1)
      ORDER BY sp.step_id, sp.start_date ASC
    `, [stepIds]);

    const periodsByStep: { [stepId: number]: IndsatsStepPeriod[] } = {};
    
    for (const row of result.rows) {
      const stepId = row.step_id;
      if (!periodsByStep[stepId]) {
        periodsByStep[stepId] = [];
      }
      
      periodsByStep[stepId].push({
        id: row.id,
        stepId: row.step_id,
        startDate: new Date(row.start_date).toISOString(),
        endDate: row.end_date ? new Date(row.end_date).toISOString() : undefined,
        activatedBy: row.activated_by,
        deactivatedBy: row.deactivated_by,
        activatedByName: row.activated_by_name,
        deactivatedByName: row.deactivated_by_name,
        createdAt: new Date(row.created_at).toISOString(),
        updatedAt: new Date(row.updated_at).toISOString()
      });
    }
    
    return periodsByStep;
  } catch (error) {
    console.error('Error fetching periods for steps:', error);
    return {};
  }
}

// Create a new step period (when step becomes active)
export async function createStepPeriod(
  stepId: number, 
  activatedBy: number,
  startDate?: Date
): Promise<IndsatsStepPeriod | null> {
  try {
    // First, end any currently active period for this step
    await query(`
      UPDATE indsatstrappe_step_periods 
      SET end_date = NOW(), deactivated_by = $2, updated_at = NOW()
      WHERE step_id = $1 AND end_date IS NULL
    `, [stepId, activatedBy]);
    
    // Create new active period
    const result = await query(`
      INSERT INTO indsatstrappe_step_periods (step_id, start_date, activated_by)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [stepId, startDate || new Date(), activatedBy]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      stepId: row.step_id,
      startDate: new Date(row.start_date).toISOString(),
      endDate: row.end_date ? new Date(row.end_date).toISOString() : undefined,
      activatedBy: row.activated_by,
      deactivatedBy: row.deactivated_by,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    console.error('Error creating step period:', error);
    return null;
  }
}

// End the current active period for a step
export async function endStepPeriod(
  stepId: number,
  deactivatedBy: number,
  endDate?: Date
): Promise<IndsatsStepPeriod | null> {
  try {
    const result = await query(`
      UPDATE indsatstrappe_step_periods 
      SET end_date = $3, deactivated_by = $2, updated_at = NOW()
      WHERE step_id = $1 AND end_date IS NULL
      RETURNING *
    `, [stepId, deactivatedBy, endDate || new Date()]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const row = result.rows[0];
    return {
      id: row.id,
      stepId: row.step_id,
      startDate: new Date(row.start_date).toISOString(),
      endDate: row.end_date ? new Date(row.end_date).toISOString() : undefined,
      activatedBy: row.activated_by,
      deactivatedBy: row.deactivated_by,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    console.error('Error ending step period:', error);
    return null;
  }
}

// Add a step to an indsatstrappe plan
export async function addIndsatsStep(
  planId: number,
  title: string,
  description?: string,
  målsætning?: string
): Promise<IndsatsSteps> {
  try {
    // Get the next step number
    const maxStepResult = await query(
      'SELECT COALESCE(MAX(step_number), 0) as max_step FROM indsatstrappe_steps WHERE indsatstrappe_id = $1',
      [planId]
    );
    
    const nextStepNumber = (maxStepResult.rows[0]?.max_step || 0) + 1;

    const result = await query(
      `INSERT INTO indsatstrappe_steps (indsatstrappe_id, step_number, title, description, målsætning, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [planId, nextStepNumber, title, description, målsætning]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      indsatstrapeId: row.indsatstrappe_id,
      stepNumber: row.step_number,
      title: row.title,
      description: row.description,
      målsætning: row.målsætning,
      startDate: row.start_date,
      targetEndDate: row.target_end_date,
      isCompleted: row.is_completed,
      completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : undefined,
      completedBy: row.completed_by,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    console.error('Error adding indsats step:', error);
    throw error;
  }
}

// Complete a step
export async function completeIndsatsStep(
  stepId: number,
  completedBy: number
): Promise<IndsatsSteps | null> {
  try {
    const result = await query(
      `UPDATE indsatstrappe_steps 
       SET is_completed = true, completed_at = NOW(), completed_by = $2, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [stepId, completedBy]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // End the current active period for this step
    await endStepPeriod(stepId, completedBy);

    const row = result.rows[0];
    return {
      id: row.id,
      indsatstrapeId: row.indsatstrappe_id,
      stepNumber: row.step_number,
      title: row.title,
      description: row.description,
      målsætning: row.målsætning,
      startDate: row.start_date,
      targetEndDate: row.target_end_date,
      isCompleted: row.is_completed,
      completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : undefined,
      completedBy: row.completed_by,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    console.error('Error completing indsats step:', error);
    return null;
  }
}

// Mark a step as incomplete (go back functionality)
export async function markIndsatsStepIncomplete(
  stepId: number,
  uncompletedBy: number
): Promise<IndsatsSteps | null> {
  try {
    const result = await query(
      `UPDATE indsatstrappe_steps 
       SET is_completed = false, completed_at = NULL, completed_by = NULL, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [stepId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Create a new active period for this step (step back means the step becomes active again)
    await createStepPeriod(stepId, uncompletedBy);

    const row = result.rows[0];
    return {
      id: row.id,
      indsatstrapeId: row.indsatstrappe_id,
      stepNumber: row.step_number,
      title: row.title,
      description: row.description,
      målsætning: row.målsætning,
      startDate: row.start_date,
      targetEndDate: row.target_end_date,
      isCompleted: row.is_completed,
      completedAt: row.completed_at ? new Date(row.completed_at).toISOString() : undefined,
      completedBy: row.completed_by,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    console.error('Error marking indsats step as incomplete:', error);
    return null;
  }
}

// Link a tool entry to an indsatstrappe step
export async function linkToolEntryToStep(
  stepId: number,
  entryType: 'barometer' | 'dagens-smiley' | 'sengetider',
  entryId: number,
  notes?: string
): Promise<IndsatstrappePlanEntry> {
  try {
    let columnName: string;
    switch (entryType) {
      case 'barometer':
        columnName = 'barometer_entry_id';
        break;
      case 'dagens-smiley':
        columnName = 'dagens_smiley_entry_id';
        break;
      case 'sengetider':
        columnName = 'sengetider_entry_id';
        break;
      default:
        throw new Error(`Unknown entry type: ${entryType}`);
    }

    const result = await query(
      `INSERT INTO indsatstrappe_tool_entries (indsatstrappe_step_id, ${columnName}, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [stepId, entryId, notes]
    );

    const row = result.rows[0];
    return {
      id: row.id,
      indsatsStepId: row.indsatstrappe_step_id,
      barometerEntryId: row.barometer_entry_id,
      dagensSmileyEntryId: row.dagens_smiley_entry_id,
      sengetiderEntryId: row.sengetider_entry_id,
      notes: row.notes,
      createdAt: new Date(row.created_at).toISOString(),
      entryType
    };
  } catch (error) {
    console.error('Error linking tool entry to step:', error);
    throw error;
  }
}

// Get the active indsatstrappe plan for a child
export async function getActiveIndsatsrappeForChild(
  childId: number,
  userId?: number
): Promise<IndsatstrappePlan | null> {
  try {
    const plans = await getIndsatsrappeForChild(childId, userId);
    return plans.find(plan => plan.isActive) || null;
  } catch (error) {
    console.error('Error fetching active indsatstrappe for child:', error);
    return null;
  }
}

// Update indsatstrappe plan
export async function updateIndsatstrappe(
  id: number,
  data: {
    title?: string;
    description?: string;
    isActive?: boolean;
    targetDate?: string;
    accessibleUserIds?: number[];
  }
): Promise<Indsatstrappe | null> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    // If setting this plan as active, deactivate others for the same child
    if (data.isActive === true) {
      await client.query(
        `UPDATE indsatstrappe 
         SET is_active = false 
         WHERE child_id = (SELECT child_id FROM indsatstrappe WHERE id = $1) 
         AND id != $1`,
        [id]
      );
    }

    // Update the plan
    const updateFields = [];
    const updateValues = [];
    let valueIndex = 1;

    if (data.title !== undefined) {
      updateFields.push(`title = $${valueIndex}`);
      updateValues.push(data.title);
      valueIndex++;
    }
    if (data.description !== undefined) {
      updateFields.push(`description = $${valueIndex}`);
      updateValues.push(data.description);
      valueIndex++;
    }
    if (data.isActive !== undefined) {
      updateFields.push(`is_active = $${valueIndex}`);
      updateValues.push(data.isActive);
      valueIndex++;
    }
    if (data.targetDate !== undefined) {
      updateFields.push(`target_date = $${valueIndex}`);
      updateValues.push(data.targetDate);
      valueIndex++;
    }

    updateFields.push(`updated_at = NOW()`);
    updateValues.push(id);

    const result = await client.query(
      `UPDATE indsatstrappe SET ${updateFields.join(', ')} WHERE id = $${valueIndex} RETURNING *`,
      updateValues
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    // Update access control if specified
    if (data.accessibleUserIds !== undefined) {
      // Remove existing access
      await client.query('DELETE FROM indsatstrappe_user_access WHERE indsatstrappe_id = $1', [id]);
      
      // Add new access
      if (data.accessibleUserIds.length > 0) {
        const accessValues = data.accessibleUserIds.map((_, index) => 
          `($1, $${index + 2})`
        ).join(', ');

        await client.query(
          `INSERT INTO indsatstrappe_user_access (indsatstrappe_id, user_id)
           VALUES ${accessValues}`,
          [id, ...data.accessibleUserIds]
        );
      }
    }

    await client.query('COMMIT');

    const row = result.rows[0];
    return {
      id: row.id,
      childId: row.child_id,
      createdBy: row.created_by,
      title: row.title,
      description: row.description,
      isActive: row.is_active,
      startDate: row.start_date,
      targetDate: row.target_date,
      completedDate: row.completed_date,
      isCompleted: row.is_completed,
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString()
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating indsatstrappe:', error);
    return null;
  } finally {
    client.release();
  }
}

// Delete indsatstrappe plan
export async function deleteIndsatstrappe(id: number): Promise<boolean> {
  try {
    const result = await query('DELETE FROM indsatstrappe WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting indsatstrappe:', error);
    return false;
  }
}

// Update indsatstrappe step
export async function updateIndsatsStep(
  id: number, 
  updates: { title?: string; description?: string; målsætning?: string }
): Promise<boolean> {
  try {
    const fields = [];
    const values = [];
    let paramCount = 0;

    if (updates.title !== undefined) {
      fields.push(`title = $${++paramCount}`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${++paramCount}`);
      values.push(updates.description);
    }
    if (updates.målsætning !== undefined) {
      fields.push(`målsætning = $${++paramCount}`);
      values.push(updates.målsætning);
    }

    if (fields.length === 0) {
      return true; // No updates needed
    }

    fields.push(`updated_at = $${++paramCount}`);
    values.push(new Date());
    values.push(id); // Add id as the last parameter

    const updateQuery = `UPDATE indsatstrappe_steps SET ${fields.join(', ')} WHERE id = $${++paramCount}`;
    const result = await query(updateQuery, values);
    
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error updating indsats step:', error);
    return false;
  }
}

// Delete indsatstrappe step
export async function deleteIndsatsStep(id: number): Promise<boolean> {
  try {
    const result = await query('DELETE FROM indsatstrappe_steps WHERE id = $1', [id]);
    return result.rowCount !== null && result.rowCount > 0;
  } catch (error) {
    console.error('Error deleting indsats step:', error);
    return false;
  }
}

// PROGRESS VIEW FUNCTIONS
// Get progress data for a child - includes all indsatstrappe plans, steps, and tool entries grouped by timing
export async function getProgressDataForChild(
  childId: number,
  userId?: number
): Promise<ProgressData | null> {
  try {
    // Get all indsatstrappe plans for this child
    const plans = await getIndsatsrappeForChild(childId, userId);
    
    if (plans.length === 0) {
      return null;
    }

    // Get all tool entries for this child with timing information
    const allEntries = await getAllToolEntriesForChild(childId);
    
    // For each plan, get steps with their linked tool entries
    const progressPlans: ProgressPlan[] = [];
    
    for (const plan of plans) {
      const stepsWithEntries = await getStepsWithEntriesForPlan(plan.id);
      
      // Group remaining tool entries by timing relative to step periods
      const groupedEntries = groupEntriesByStepTiming(stepsWithEntries, allEntries);
      
      progressPlans.push({
        ...plan,
        stepsWithEntries: groupedEntries,
        totalEntries: allEntries.length
      });
    }
    
    return {
      childId,
      plans: progressPlans,
      totalEntries: allEntries.length
    };
  } catch (error) {
    console.error('Error fetching progress data:', error);
    return null;
  }
}

// Get all tool entries for a child across all tools
export async function getAllToolEntriesForChild(childId: number): Promise<ProgressEntry[]> {
  try {
    const entries: ProgressEntry[] = [];
    
    // Get barometer entries
    const barometerResult = await query(`
      SELECT 
        be.id, be.barometer_id as tool_id, be.recorded_by, be.entry_date, 
        be.rating, be.comment, be.created_at, be.updated_at,
        b.topic, b.display_type,
        u.display_name as recorded_by_name
      FROM barometer_entries be
      JOIN barometers b ON be.barometer_id = b.id
      LEFT JOIN users u ON be.recorded_by = u.id
      WHERE b.child_id = $1
      ORDER BY be.created_at DESC
    `, [childId]);
    
    for (const row of barometerResult.rows) {
      entries.push({
        id: row.id,
        toolId: row.tool_id,
        toolType: 'barometer',
        toolTopic: row.topic,
        entryDate: row.entry_date,
        createdAt: new Date(row.created_at).toISOString(),
        recordedBy: row.recorded_by,
        recordedByName: row.recorded_by_name,
        data: {
          rating: row.rating,
          comment: row.comment,
          displayType: row.display_type
        }
      });
    }
    
    // Get dagens smiley entries
    const smileyResult = await query(`
      SELECT 
        dse.id, dse.smiley_id as tool_id, dse.recorded_by, dse.entry_date,
        dse.selected_emoji, dse.reasoning, dse.created_at, dse.updated_at,
        ds.topic,
        u.display_name as recorded_by_name
      FROM dagens_smiley_entries dse
      JOIN dagens_smiley ds ON dse.smiley_id = ds.id
      LEFT JOIN users u ON dse.recorded_by = u.id
      WHERE ds.child_id = $1
      ORDER BY dse.created_at DESC
    `, [childId]);
    
    for (const row of smileyResult.rows) {
      entries.push({
        id: row.id,
        toolId: row.tool_id,
        toolType: 'dagens-smiley',
        toolTopic: row.topic,
        entryDate: row.entry_date,
        createdAt: new Date(row.created_at).toISOString(),
        recordedBy: row.recorded_by,
        recordedByName: row.recorded_by_name,
        data: {
          smileyValue: row.selected_emoji,
          comment: row.reasoning
        }
      });
    }
    
    // Get sengetider entries
    const sengetiderResult = await query(`
      SELECT 
        se.id, se.sengetider_id as tool_id, se.recorded_by, se.entry_date,
        se.puttetid, se.sov_kl, se.vaagnede, se.notes,
        se.created_at, se.updated_at,
        s.description as topic,
        u.display_name as recorded_by_name
      FROM sengetider_entries se
      JOIN sengetider s ON se.sengetider_id = s.id
      LEFT JOIN users u ON se.recorded_by = u.id
      WHERE s.child_id = $1
      ORDER BY se.created_at DESC
    `, [childId]);
    
    for (const row of sengetiderResult.rows) {
      entries.push({
        id: row.id,
        toolId: row.tool_id,
        toolType: 'sengetider',
        toolTopic: row.topic,
        entryDate: row.entry_date,
        createdAt: new Date(row.created_at).toISOString(),
        recordedBy: row.recorded_by,
        recordedByName: row.recorded_by_name,
        data: {
          bedtime: row.puttetid,
          sleepTime: row.sov_kl,
          wakeTime: row.vaagnede,
          sleepQuality: null, // Not available in current schema
          comment: row.notes
        }
      });
    }
    
    // Sort all entries by creation date
    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return entries;
  } catch (error) {
    console.error('Error fetching all tool entries:', error);
    return [];
  }
}

// Get steps with their linked tool entries for a plan
export async function getStepsWithEntriesForPlan(planId: number): Promise<IndsatsStepsWithEntries[]> {
  try {
    const steps = await getIndsatsStepsForPlan(planId);
    const stepsWithEntries: IndsatsStepsWithEntries[] = [];
    
    for (const step of steps) {
      // Get linked entries for this step
      const linkedResult = await query(`
        SELECT 
          ite.id, ite.indsatstrappe_step_id, ite.barometer_entry_id,
          ite.dagens_smiley_entry_id, ite.sengetider_entry_id, ite.notes,
          ite.created_at
        FROM indsatstrappe_tool_entries ite
        WHERE ite.indsatstrappe_step_id = $1
        ORDER BY ite.created_at DESC
      `, [step.id]);
      
      const linkedEntries: IndsatstrappePlanEntry[] = linkedResult.rows.map(row => ({
        id: row.id,
        indsatsStepId: row.indsatstrappe_step_id,
        barometerEntryId: row.barometer_entry_id,
        dagensSmileyEntryId: row.dagens_smiley_entry_id,
        sengetiderEntryId: row.sengetider_entry_id,
        notes: row.notes,
        createdAt: new Date(row.created_at).toISOString()
      }));
      
      stepsWithEntries.push({
        ...step,
        linkedEntries,
        entryCount: linkedEntries.length
      });
    }
    
    return stepsWithEntries;
  } catch (error) {
    console.error('Error fetching steps with entries:', error);
    return [];
  }
}

// Group tool entries by step timing - entries are grouped with the step that was active when they were created
function groupEntriesByStepTiming(
  steps: IndsatsStepsWithEntries[], 
  allEntries: ProgressEntry[]
): StepWithGroupedEntries[] {
  const groupedSteps: StepWithGroupedEntries[] = [];
  
  console.log('=== GROUPING ENTRIES BY STEP TIMING ===');
  console.log(`Total steps: ${steps.length}, Total entries: ${allEntries.length}`);
  
  // Sort steps by step number
  const sortedSteps = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);
  
  // If we have no steps, return empty
  if (sortedSteps.length === 0) {
    return [];
  }
  
  // Track which entries have been assigned to avoid duplicates
  const assignedEntries = new Set<string>();
  
  // First pass: assign entries to steps with specific periods (most precise)
  for (const step of sortedSteps) {
    const periods = step.activePeriods || [];
    
    const stepEntries = allEntries.filter(entry => {
      // Skip if entry already assigned
      const entryKey = `${entry.id}-${entry.toolType}`;
      if (assignedEntries.has(entryKey)) return false;
      
      // Only include barometer and dagens smiley entries (exclude sengetider)
      if (entry.toolType === 'sengetider') return false;
      
      const entryDate = new Date(entry.createdAt);
      
      // Check if this entry falls within any of this step's periods
      if (periods.length > 0) {
        const isInThisPeriod = periods.some(period => {
          const periodStart = new Date(period.startDate);
          const periodEnd = period.endDate ? new Date(period.endDate) : null;
          
          const afterStart = entryDate >= periodStart;
          const beforeEnd = !periodEnd || entryDate <= periodEnd;
          
          return afterStart && beforeEnd;
        });
        
        if (isInThisPeriod) {
          assignedEntries.add(entryKey);
          console.log(`  Entry ${entry.id} (${entry.toolType}) assigned to step ${step.stepNumber} via period matching`);
          return true;
        }
      }
      
      return false;
    });
    
    console.log(`Step ${step.stepNumber} matched ${stepEntries.length} entries via periods`);
    
    // Calculate time range and duration for this step
    let overallStartDate: string | null = null;
    let overallEndDate: string | null = null;
    let totalDurationDays: number | null = null;
    
    if (periods.length > 0) {
      // Overall start is the earliest period start
      overallStartDate = periods.reduce((earliest: string | null, period) => {
        return !earliest || period.startDate < earliest ? period.startDate : earliest;
      }, null as string | null);
      
      // Overall end is the latest period end (or null if any period is ongoing)
      const hasOngoingPeriod = periods.some(p => !p.endDate);
      if (!hasOngoingPeriod) {
        overallEndDate = periods.reduce((latest: string | null, period) => {
          const periodEndDate = period.endDate || null;
          return !latest || !periodEndDate || periodEndDate > latest ? periodEndDate : latest;
        }, null as string | null);
      }
      
      // Calculate total duration across all periods
      if (overallStartDate) {
        const startDate = new Date(overallStartDate);
        const endDate = overallEndDate ? new Date(overallEndDate) : new Date();
        totalDurationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      }
    }
    
    // Fallback to step's own dates if no periods exist
    if (!overallStartDate && !overallEndDate) {
      overallStartDate = step.startDate || null;
      overallEndDate = step.targetEndDate || null;
      
      // Calculate duration if we have step dates
      if (overallStartDate) {
        const startDate = new Date(overallStartDate);
        const endDate = overallEndDate ? new Date(overallEndDate) : new Date();
        totalDurationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    groupedSteps.push({
      ...step,
      groupedEntries: stepEntries,
      timePerriod: {
        startDate: overallStartDate,
        endDate: overallEndDate
      },
      durationDays: totalDurationDays
    });
  }
  
  // Second pass: distribute remaining unassigned entries chronologically
  const unassignedEntries = allEntries.filter(entry => {
    const entryKey = `${entry.id}-${entry.toolType}`;
    return !assignedEntries.has(entryKey) && entry.toolType !== 'sengetider';
  });
  
  if (unassignedEntries.length > 0) {
    console.log(`Distributing ${unassignedEntries.length} unassigned entries chronologically`);
    
    // Sort entries by creation date
    const sortedUnassignedEntries = unassignedEntries.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    
    // Find steps that don't have periods or have no entries yet
    const stepsForDistribution = groupedSteps.filter(step => 
      !step.activePeriods || step.activePeriods.length === 0 || step.groupedEntries.length === 0
    );
    
    if (stepsForDistribution.length > 0) {
      const entriesPerStep = Math.ceil(sortedUnassignedEntries.length / stepsForDistribution.length);
      
      for (let i = 0; i < stepsForDistribution.length; i++) {
        const step = stepsForDistribution[i];
        const startIndex = i * entriesPerStep;
        const endIndex = Math.min(startIndex + entriesPerStep, sortedUnassignedEntries.length);
        const entriesToAdd = sortedUnassignedEntries.slice(startIndex, endIndex);
        
        // Add to existing entries (from period matching)
        step.groupedEntries = [...step.groupedEntries, ...entriesToAdd];
        
        console.log(`Step ${step.stepNumber} received ${entriesToAdd.length} chronologically distributed entries`);
      }
    } else {
      // If all steps have periods, assign remaining entries to the last active step
      const lastStep = groupedSteps[groupedSteps.length - 1];
      if (lastStep) {
        lastStep.groupedEntries = [...lastStep.groupedEntries, ...sortedUnassignedEntries];
        console.log(`All ${sortedUnassignedEntries.length} unassigned entries added to last step ${lastStep.stepNumber}`);
      }
    }
  }
  
  // Log final distribution
  const totalAssigned = groupedSteps.reduce((sum, step) => sum + step.groupedEntries.length, 0);
  console.log(`Final distribution: ${totalAssigned} entries assigned across ${groupedSteps.length} steps`);
  
  return groupedSteps;
}

// Progress data interfaces
export interface ProgressData {
  childId: number;
  plans: ProgressPlan[];
  totalEntries: number;
}

export interface ProgressPlan extends IndsatstrappePlan {
  stepsWithEntries: StepWithGroupedEntries[];
  totalEntries: number;
}

export interface StepWithGroupedEntries extends IndsatsStepsWithEntries {
  groupedEntries: ProgressEntry[];
  timePerriod: {
    startDate: string | null;
    endDate: string | null;
  };
  durationDays?: number | null;
}

export interface ProgressEntry {
  id: number;
  toolId: number;
  toolType: 'barometer' | 'dagens-smiley' | 'sengetider';
  toolTopic: string;
  entryDate: string;
  createdAt: string;
  recordedBy: number;
  recordedByName?: string;
  data: Record<string, unknown>;
}
