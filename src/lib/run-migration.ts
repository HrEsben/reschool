import { query } from './db';

export async function runMigration() {
  try {
    console.log('Running database migration...');

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        stack_auth_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        profile_image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create children table
    await query(`
      CREATE TABLE IF NOT EXISTS children (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create user_child_relations table
    await query(`
      CREATE TABLE IF NOT EXISTS user_child_relations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        child_id INTEGER REFERENCES children(id) ON DELETE CASCADE,
        relation VARCHAR(50) NOT NULL CHECK (relation IN ('Mor', 'Far', 'Underviser', 'Ressourceperson')),
        custom_relation_name VARCHAR(255),
        is_administrator BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, child_id)
      )
    `);

    // Create indexes
    await query(`CREATE INDEX IF NOT EXISTS idx_users_stack_auth_id ON users(stack_auth_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_children_created_by ON children(created_by)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_child_relations_user_id ON user_child_relations(user_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_user_child_relations_child_id ON user_child_relations(child_id)`);

    console.log('Database migration completed successfully!');
    return true;
  } catch (error) {
    console.error('Migration failed:', error);
    return false;
  }
}
