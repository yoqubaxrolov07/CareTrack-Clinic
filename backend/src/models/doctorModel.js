// Data-access layer for the `doctors` table.

const { pool } = require('../config/db');

const COLUMNS =
  'id, user_id, full_name, specialty, department, email, phone, created_at, updated_at';

async function findAll({ search } = {}) {
  if (search) {
    const like = `%${search}%`;
    const [rows] = await pool.query(
      `SELECT ${COLUMNS} FROM doctors
       WHERE full_name LIKE ? OR specialty LIKE ? OR department LIKE ?
       ORDER BY full_name`,
      [like, like, like]
    );
    return rows;
  }
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM doctors ORDER BY full_name`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM doctors WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const { user_id = null, full_name, specialty, department, email, phone = null } = data;
  const [result] = await pool.query(
    `INSERT INTO doctors (user_id, full_name, specialty, department, email, phone)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [user_id, full_name, specialty, department, email, phone]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  // Only update fields that were provided (partial update).
  const allowed = ['user_id', 'full_name', 'specialty', 'department', 'email', 'phone'];
  const fields  = [];
  const values  = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return findById(id);

  values.push(id);
  await pool.query(`UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM doctors WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function countPatients(doctorId) {
  const [rows] = await pool.query(
    'SELECT COUNT(*) AS count FROM patients WHERE doctor_id = ?',
    [doctorId]
  );
  return rows[0].count;
}

module.exports = { findAll, findById, create, update, remove, countPatients };
