// Data-access layer for the `diagnoses` table.

const { pool } = require('../config/db');

const COLUMNS = `
  id, patient_id, icd_code, description, severity, treatment,
  status, diagnosed_at, created_by, created_at, updated_at
`;

async function findAll({ search, status, patientId } = {}) {
  const where  = [];
  const params = [];

  if (search) {
    where.push('(icd_code LIKE ? OR description LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like);
  }
  if (status) {
    where.push('status = ?');
    params.push(status);
  }
  if (patientId) {
    where.push('patient_id = ?');
    params.push(patientId);
  }

  const sql = `
    SELECT ${COLUMNS} FROM diagnoses
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY diagnosed_at DESC
  `;
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM diagnoses WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function findByPatient(patientId) {
  return findAll({ patientId });
}

async function create(data) {
  const {
    patient_id, icd_code, description, severity,
    treatment = null, status = 'active',
    diagnosed_at, created_by = null,
  } = data;

  const [result] = await pool.query(
    `INSERT INTO diagnoses
       (patient_id, icd_code, description, severity, treatment, status,
        diagnosed_at, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [patient_id, icd_code, description, severity, treatment, status,
     diagnosed_at, created_by]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const allowed = [
    'icd_code', 'description', 'severity',
    'treatment', 'status', 'diagnosed_at',
  ];
  const fields = [];
  const values = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return findById(id);

  values.push(id);
  await pool.query(`UPDATE diagnoses SET ${fields.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM diagnoses WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = { findAll, findById, findByPatient, create, update, remove };
