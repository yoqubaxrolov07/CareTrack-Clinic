// MySQL connection pool.
//
// We use mysql2's promise API so controllers can use async/await.
// A POOL is preferred over a single connection because each HTTP request
// borrows a connection and returns it when done -- much better under load.

const mysql = require('mysql2/promise');
const env   = require('./env');

const pool = mysql.createPool({
  host:            env.db.host,
  port:            env.db.port,
  user:            env.db.user,
  password:        env.db.password,
  database:        env.db.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit:      0,
  // Returns DATE columns as 'YYYY-MM-DD' strings instead of JS Date objects
  dateStrings:     true,
});

// Quick health check on startup so problems show up immediately
// instead of on the first request.
async function testConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.query('SELECT 1');
    console.log(`[db] Connected to MySQL "${env.db.name}" on ${env.db.host}:${env.db.port}`);
  } finally {
    conn.release();
  }
}

module.exports = { pool, testConnection };
