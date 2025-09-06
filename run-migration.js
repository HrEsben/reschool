#!/usr/bin/env node

const { query } = require('./dist/lib/db.js');
const fs = require('fs');

async function runMigration() {
  try {
    console.log('Running barometer migration...');
    const migration = fs.readFileSync('./src/lib/migrations/add_barometers_table.sql', 'utf8');
    await query(migration);
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

runMigration();
