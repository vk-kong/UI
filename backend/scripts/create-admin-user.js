import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import pool from '../config/database.js';
import { hashPassword } from '../utils/password.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.join(__dirname, '..', '.env.production');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

async function createAdminUser() {
  try {
    const username = 'admin';
    const email = 'admin@example.com';
    const password = 'password';
    
    // Check if admin user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );
    
    if (existingUser.rows.length > 0) {
      console.log('⚠️  Admin user already exists. Updating password...');
      const hashedPassword = await hashPassword(password);
      await pool.query(
        'UPDATE users SET password_hash = $1, is_admin = TRUE WHERE username = $2',
        [hashedPassword, username]
      );
      console.log('✅ Admin user password updated successfully');
    } else {
      // Create admin user
      const hashedPassword = await hashPassword(password);
      await pool.query(
        'INSERT INTO users (username, email, password_hash, is_admin) VALUES ($1, $2, $3, $4)',
        [username, email, hashedPassword, true]
      );
      console.log('✅ Admin user created successfully');
      console.log(`   Username: ${username}`);
      console.log(`   Password: ${password}`);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    process.exit(1);
  }
}

createAdminUser();

