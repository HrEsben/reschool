import { query, getClient } from './db';

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

export interface ChildWithRelation extends Child {
  relation: string;
  customRelationName?: string;
  isAdministrator: boolean;
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
