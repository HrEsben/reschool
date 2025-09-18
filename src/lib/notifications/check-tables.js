#!/usr/bin/env node

import { config } from 'dotenv';
import { Client } from 'pg';

config({ path: '.env.local' });

async function checkTables() {
  console.log('🔍 Checking database tables...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Get all tables
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n📋 Available tables:');
    result.rows.forEach(row => {
      console.log(`  • ${row.table_name}`);
    });

  } catch (error) {
    console.error('❌ Error checking tables:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkTables();
