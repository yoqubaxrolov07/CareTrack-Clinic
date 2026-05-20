// Authentication controller: register, login, current user.

const bcrypt   = require('bcryptjs');
const userModel= require('../models/userModel');
const env      = require('../config/env');
const { signToken } = require('../utils/jwt');
const ApiError      = require('../utils/ApiError');

const ALLOWED_ROLES = ['admin', 'clinician', 'receptionist'];

// POST /api/auth/register   (admin only -- enforced in routes)
exports.register = async (req, res) => {
  const { username, email, password, full_name, role } = req.body;

  if (!ALLOWED_ROLES.includes(role)) {
    throw ApiError.badRequest(`Role must be one of: ${ALLOWED_ROLES.join(', ')}`);
  }

  if (await userModel.findByEmail(email)) {
    throw ApiError.conflict('Email already in use');
  }
  if (await userModel.findByUsername(username)) {
    throw ApiError.conflict('Username already in use');
  }

  const passwordHash = await bcrypt.hash(password, env.bcrypt.saltRounds);
  const user = await userModel.create({
    username, email, passwordHash, fullName: full_name, role,
  });

  res.status(201).json({ success: true, data: user });
};

// POST /api/auth/login   (public)
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findByEmail(email);
  if (!user || !user.is_active) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken({
    id:        user.id,
    username:  user.username,
    role:      user.role,
    full_name: user.full_name,
  });

  res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id, username: user.username, email: user.email,
        full_name: user.full_name, role: user.role,
      },
    },
  });
};

// GET /api/auth/me   (any logged-in user)
exports.me = async (req, res) => {
  const user = await userModel.findById(req.user.id);
  if (!user) throw ApiError.notFound('User not found');
  res.json({ success: true, data: user });
};
