// Tiny wrapper around jsonwebtoken so the rest of the code doesn't
// have to know the library or repeat the secret/expiry options.

const jwt = require('jsonwebtoken');
const env = require('../config/env');

function signToken(payload) {
  return jwt.sign(payload, env.jwt.secret, { expiresIn: env.jwt.expiresIn });
}

function verifyToken(token) {
  // Throws on invalid / expired tokens -- caller handles it.
  return jwt.verify(token, env.jwt.secret);
}

module.exports = { signToken, verifyToken };
