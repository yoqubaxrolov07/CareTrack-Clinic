// Server entry point. Loads env, tests the DB, then starts Express.

const app = require('./app');
const env = require('./config/env');
const { testConnection } = require('./config/db');

(async () => {
  try {
    await testConnection();
    app.listen(env.port, () => {
      console.log(`[server] CareTrack MRMS API running on http://localhost:${env.port}`);
      console.log(`[server] Mode: ${env.nodeEnv}`);
    });
  } catch (err) {
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  }
})();
