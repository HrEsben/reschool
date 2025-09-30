import { query } from './db';
import fs from 'fs';
import path from 'path';

export async function runMigration(filename: string) {
  try {
    const migrationPath = path.join(__dirname, 'migrations', filename);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
   await query(migrationSQL);
 } catch (error) {
    console.error(`Migration failed: ${filename}`, error);
    throw error;
  }
}

export async function addSlugColumn() {
  await runMigration('add_slug_column.sql');
}
