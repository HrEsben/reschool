#!/usr/bin/env node

// Setup script to install database triggers for push notifications
// This script runs the SQL to set up PostgreSQL triggers for real-time notifications

import dotenv from 'dotenv'
import { Client } from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: '.env.local' })

async function setupTriggers() {
  console.log('🔧 Setting up database triggers for push notifications...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Read the SQL file
    const sqlPath = path.join(__dirname, 'setup-triggers.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    await client.query(sql);
    console.log('✅ Database triggers setup complete!');

    console.log('\n📋 The following triggers have been created:');
    console.log('  • notify_new_registration (children table)');
    console.log('  • notify_sengetid_entry (sengetider_entries table)');
    console.log('  • notify_barometer_entry (barometer_entries table)');
    console.log('  • notify_smiley_entry (dagens_smiley_entries table)');
    console.log('  • notify_indsatstrappe_update (indsatstrappe_steps table)');

    console.log('\n🚀 To start the notification listener, run:');
    console.log('  npm run notifications:listen');

  } catch (error) {
    console.error('❌ Error setting up triggers:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupTriggers();
