// Centralised environment-variable loader.
// All other files read config from THIS module (never directly from process.env)
// so the app fails fast if something important is missing.

require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing required env variable: ${name}`);
  }
  return value;
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port:    Number(process.env.PORT) || 5000,

  db: {
    host:     required('DB_HOST', 'localhost'),
    port:     Number(process.env.DB_PORT) || 3306,
    user:     required('DB_USER', 'root'),
    password: process.env.DB_PASSWORD || '',
    name:     required('DB_NAME', 'caretrack_mrms'),
  },

  jwt: {
    secret:    required('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },

  bcrypt: {
    saltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  },
};

module.exports = env;
