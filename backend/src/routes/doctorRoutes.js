const router = require('express').Router();
const { body } = require('express-validator');

const c = require('../controllers/doctorController');
const authMiddleware  = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler    = require('../utils/asyncHandler');

// All doctor endpoints require login.
router.use(authMiddleware);

// READ -- everyone logged in can browse doctor profiles.
router.get('/',    asyncHandler(c.getAll));
router.get('/:id', asyncHandler(c.getById));

// WRITE -- admin only (per the brief).
router.post(
  '/',
  requireRole('admin'),
  [
    body('full_name').notEmpty(),
    body('specialty').notEmpty(),
    body('department').notEmpty(),
    body('email').isEmail(),
  ],
  validateRequest,
  asyncHandler(c.create),
);

router.put(
  '/:id',
  requireRole('admin'),
  [ body('email').optional().isEmail() ],
  validateRequest,
  asyncHandler(c.update),
);

router.delete('/:id', requireRole('admin'), asyncHandler(c.remove));

module.exports = router;
