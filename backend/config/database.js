import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.production if it exists, otherwise fallback to .env
// Only load if DB_PASSWORD is not already set (to avoid overriding)
if (!process.env.DB_PASSWORD) {
  const envProductionPath = path.join(__dirname, '..', '.env.production');
  const envPath = path.join(__dirname, '..', '.env');

  if (fs.existsSync(envProductionPath)) {
    dotenv.config({ path: envProductionPath, override: false });
  } else if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  } else {
    dotenv.config({ override: false });
  }
}

const { Pool } = pg;

// Ensure password is a string
const dbPassword = process.env.DB_PASSWORD;
if (!dbPassword) {
  console.error('❌ DB_PASSWORD environment variable is not set');
  process.exit(1);
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'kong',
  user: process.env.DB_USER || 'kong',
  password: String(dbPassword),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

export default pool;

