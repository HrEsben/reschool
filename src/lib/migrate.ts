import { query } from './db';
import fs from 'fs';
import path from 'path';

export async function runMigration(filename: string) {
  try {
    const migrationPath = path.join(__dirname, 'migrations', filename);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log(`Running migration: ${filename}`);
    await query(migrationSQL);
    console.log(`Migration completed: ${filename}`);
  } catch (error) {
    console.error(`Migration failed: ${filename}`, error);
    throw error;
  }
}

export async function addSlugColumn() {
  await runMigration('add_slug_column.sql');
}
