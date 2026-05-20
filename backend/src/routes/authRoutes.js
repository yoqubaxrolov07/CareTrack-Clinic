const router = require('express').Router();
const { body } = require('express-validator');

const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler    = require('../utils/asyncHandler');

// POST /api/auth/register  (admin only -- the brief says admins manage staff)
router.post(
  '/register',
  authMiddleware,
  requireRole('admin'),
  [
    body('username').isLength({ min: 3 }).withMessage('username min 3 chars'),
    body('email').isEmail().withMessage('valid email required'),
    body('password').isLength({ min: 6 }).withMessage('password min 6 chars'),
    body('full_name').notEmpty().withMessage('full_name required'),
    body('role').isIn(['admin', 'clinician', 'receptionist']),
  ],
  validateRequest,
  asyncHandler(authController.register),
);

// POST /api/auth/login  (public)
router.post(
  '/login',
  [
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  validateRequest,
  asyncHandler(authController.login),
);

// GET /api/auth/me  (any logged-in user)
router.get('/me', authMiddleware, asyncHandler(authController.me));

module.exports = router;
