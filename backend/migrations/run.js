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
    const migrationFile = path.join(__dirname, '001_create_users_table.sql');
    const sql = fs.readFileSync(migrationFile, 'utf8');
    
    await pool.query(sql);
    console.log('✅ Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();

