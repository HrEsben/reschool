import { query, getClient } from './db';

// User management
export interface User {
  id: number;
  stackAuthId: string;
  email: string;
  displayName?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Child {
  id: number;
  name: string;
  createdBy: number;
  createdAt: Date;
  updatedAt: Date;
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

// User service functions
export async function syncUserToDatabase(stackAuthUser: any): Promise<User | null> {
  try {
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

    return result.rows[0] as User || null;
  } catch (error) {
    console.error('Error getting user by Stack Auth ID:', error);
    return null;
  }
}

// Child service functions
export async function createChild(
  name: string,
  createdByUserId: number,
  relation: UserChildRelation['relation'],
  customRelationName?: string
): Promise<{ child: Child; relation: UserChildRelation } | null> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    // Create the child
    const childResult = await client.query(
      'INSERT INTO children (name, created_by) VALUES ($1, $2) RETURNING *',
      [name, createdByUserId]
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
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
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

    return result.rows[0] as Child || null;
  } catch (error) {
    console.error('Error getting child by ID:', error);
    return null;
  }
}
