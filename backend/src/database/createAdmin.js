// =====================================================
// Creates a default admin user directly in the database.
//
// Usage:
//   node src/database/createAdmin.js
//
// This bypasses the API so you can use it when there
// are no admin accounts yet (fresh database).
// =====================================================

require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql  = require('mysql2/promise');
const env    = require('../config/env');

async function main() {
  const connection = await mysql.createConnection({
    host:     env.db.host,
    port:     env.db.port,
    user:     env.db.user,
    password: env.db.password,
    database: env.db.name,
  });

  const admin = {
    username:  'admin',
    email:     'admin@caretrack.test',
    password:  'Admin@123',
    full_name: 'System Administrator',
    role:      'admin',
  };

  const hash = await bcrypt.hash(admin.password, env.bcrypt.saltRounds);

  try {
    await connection.query(
      `INSERT INTO users (username, email, password_hash, full_name, role)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
      [admin.username, admin.email, hash, admin.full_name, admin.role]
    );
    console.log('✅ Admin user created/updated successfully!');
    console.log('   Email:    admin@caretrack.test');
    console.log('   Password: Admin@123');
    console.log('   Role:     admin');
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
