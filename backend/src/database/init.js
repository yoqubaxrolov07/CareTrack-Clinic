// One-shot script to create the database, run schema.sql, then seed.sql.
//
// Usage:
//   npm run db:init
//
// This is handy for graders / first-time setup so they don't need to
// open MySQL Workbench. Existing data WILL be wiped (schema.sql drops
// the tables before recreating them).

const fs    = require('fs');
const path  = require('path');
const mysql = require('mysql2/promise');
const env   = require('../config/env');

async function runSqlFile(connection, filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  // multipleStatements is enabled below so we can ship the .sql files as-is.
  await connection.query(sql);
  console.log(`[db:init] Executed ${path.basename(filePath)}`);
}

async function main() {
  // Connect WITHOUT selecting a database -- schema.sql does CREATE DATABASE.
  const connection = await mysql.createConnection({
    host:     env.db.host,
    port:     env.db.port,
    user:     env.db.user,
    password: env.db.password,
    multipleStatements: true,
  });

  try {
    await runSqlFile(connection, path.join(__dirname, 'schema.sql'));
    await runSqlFile(connection, path.join(__dirname, 'seed.sql'));
    console.log('[db:init] Done. Database is ready.');
  } finally {
    await connection.end();
  }
}

main().catch((err) => {
  console.error('[db:init] Failed:', err.message);
  process.exit(1);
});
