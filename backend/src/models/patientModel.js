// Data-access layer for the `patients` table.

const { pool } = require('../config/db');

const COLUMNS = `
  id, first_name, last_name, dob, gender, phone, email, address,
  emergency_contact, blood_group, doctor_id, created_at, updated_at
`;

async function findAll({ search, doctorId } = {}) {
  const where  = [];
  const params = [];

  if (search) {
    where.push('(first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)');
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  if (doctorId) {
    where.push('doctor_id = ?');
    params.push(doctorId);
  }

  const sql = `
    SELECT ${COLUMNS} FROM patients
    ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
    ORDER BY last_name, first_name
  `;
  const [rows] = await pool.query(sql, params);
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM patients WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

// Full profile = patient + assigned doctor + all diagnoses.
// Mirrors the brief: "View a full Patient profile showing their assigned
// Doctor and all linked Disease/Diagnosis records".
async function findFullProfile(id) {
  const patient = await findById(id);
  if (!patient) return null;

  const [doctorRows] = patient.doctor_id
    ? await pool.query(
        `SELECT id, full_name, specialty, department, email, phone
         FROM doctors WHERE id = ?`,
        [patient.doctor_id]
      )
    : [[]];

  const [diagnoses] = await pool.query(
    `SELECT id, icd_code, description, severity, treatment, status,
            diagnosed_at, created_by, created_at
     FROM   diagnoses
     WHERE  patient_id = ?
     ORDER BY diagnosed_at DESC`,
    [id]
  );

  return { ...patient, doctor: doctorRows[0] || null, diagnoses };
}

async function create(data) {
  const {
    first_name, last_name, dob, gender,
    phone = null, email = null, address = null,
    emergency_contact = null, blood_group = 'unknown',
    doctor_id = null,
  } = data;

  const [result] = await pool.query(
    `INSERT INTO patients
       (first_name, last_name, dob, gender, phone, email, address,
        emergency_contact, blood_group, doctor_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, dob, gender, phone, email, address,
     emergency_contact, blood_group, doctor_id]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const allowed = [
    'first_name', 'last_name', 'dob', 'gender', 'phone', 'email',
    'address', 'emergency_contact', 'blood_group', 'doctor_id',
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
  await pool.query(`UPDATE patients SET ${fields.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

async function assignDoctor(patientId, doctorId) {
  await pool.query(
    'UPDATE patients SET doctor_id = ? WHERE id = ?',
    [doctorId, patientId]
  );
  return findById(patientId);
}

async function remove(id) {
  const [result] = await pool.query('DELETE FROM patients WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findAll, findById, findFullProfile,
  create, update, assignDoctor, remove,
};
