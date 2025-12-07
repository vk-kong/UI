import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import pool from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env.production if it exists
const envPath = path.join(__dirname, '..', '.env.production');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('✅ Loaded .env.production from:', envPath);
} else {
  // Fallback to .env if .env.production doesn't exist
  dotenv.config();
  console.log('⚠️  Using default .env file');
}

// Debug: Check if password is loaded (masked for security)
const dbPassword = process.env.DB_PASSWORD;
if (dbPassword) {
  console.log('✅ DB_PASSWORD is set (length:', dbPassword.length, ', type:', typeof dbPassword, ')');
} else {
  console.error('❌ DB_PASSWORD is not set!');
  console.log('Available env vars:', Object.keys(process.env).filter(k => k.startsWith('DB_')));
}

async function runMigrations() {
  try {
    // Run all migrations in order
    const migrations = [
      '001_create_users_table.sql',
      '002_add_is_admin_to_users.sql'
    ];
    
    for (const migrationFile of migrations) {
      const migrationPath = path.join(__dirname, migrationFile);
      if (fs.existsSync(migrationPath)) {
        console.log(`Running migration: ${migrationFile}`);
        const sql = fs.readFileSync(migrationPath, 'utf8');
        await pool.query(sql);
        console.log(`✅ ${migrationFile} completed`);
      } else {
        console.log(`⚠️  Migration file not found: ${migrationFile}, skipping...`);
      }
    }
    
    console.log('✅ All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();

