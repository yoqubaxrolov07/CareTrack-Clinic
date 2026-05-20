// Data-access layer for the `users` table.
// Controllers should only ever go through these functions, never raw SQL.

const { pool } = require('../config/db');

const PUBLIC_COLUMNS =
  'id, username, email, full_name, role, is_active, created_at, updated_at';

async function findByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, username, email, password_hash, full_name, role, is_active FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

async function findByUsername(username) {
  const [rows] = await pool.query(
    'SELECT id, username, email, password_hash, full_name, role, is_active FROM users WHERE username = ?',
    [username]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create({ username, email, passwordHash, fullName, role }) {
  const [result] = await pool.query(
    `INSERT INTO users (username, email, password_hash, full_name, role)
     VALUES (?, ?, ?, ?, ?)`,
    [username, email, passwordHash, fullName, role]
  );
  return findById(result.insertId);
}

module.exports = { findByEmail, findByUsername, findById, create };
