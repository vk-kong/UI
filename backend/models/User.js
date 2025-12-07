import pool from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';

class User {
  static async create(username, email, password, isAdmin = false) {
    const hashedPassword = await hashPassword(password);
    const query = `
      INSERT INTO users (username, email, password_hash, is_admin)
      VALUES ($1, $2, $3, $4)
      RETURNING id, username, email, is_admin, created_at
    `;
    const result = await pool.query(query, [username, email, hashedPassword, isAdmin]);
    return result.rows[0];
  }

  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, username, email, is_admin, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async verifyPassword(password, hash) {
    return await comparePassword(password, hash);
  }
}

export default User;

