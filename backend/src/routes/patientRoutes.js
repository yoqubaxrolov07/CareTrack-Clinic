const router = require('express').Router();
const { body } = require('express-validator');

const c = require('../controllers/patientController');
const authMiddleware  = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler    = require('../utils/asyncHandler');

router.use(authMiddleware);

// READ -- admin, clinician, receptionist.
router.get('/',             asyncHandler(c.getAll));
router.get('/:id',          asyncHandler(c.getById));
router.get('/:id/profile',  asyncHandler(c.getFullProfile));

// CREATE -- admin + receptionist (receptionists register new patients).
router.post(
  '/',
  requireRole('admin', 'receptionist'),
  [
    body('first_name').notEmpty(),
    body('last_name').notEmpty(),
    body('dob').isISO8601().withMessage('dob must be YYYY-MM-DD'),
    body('gender').isIn(['male', 'female', 'other']),
    body('email').optional().isEmail(),
    body('blood_group').optional()
      .isIn(['A+','A-','B+','B-','AB+','AB-','O+','O-','unknown']),
    body('doctor_id').optional({ nullable: true }).isInt({ min: 1 }),
  ],
  validateRequest,
  asyncHandler(c.create),
);

// UPDATE -- admin + clinician.
router.put(
  '/:id',
  requireRole('admin', 'clinician'),
  [
    body('email').optional().isEmail(),
    body('gender').optional().isIn(['male', 'female', 'other']),
    body('blood_group').optional()
      .isIn(['A+','A-','B+','B-','AB+','AB-','O+','O-','unknown']),
  ],
  validateRequest,
  asyncHandler(c.update),
);

// Re-assign patient to a doctor -- admin only.
router.patch(
  '/:id/assign-doctor',
  requireRole('admin'),
  [ body('doctor_id').optional({ nullable: true }).isInt({ min: 1 }) ],
  validateRequest,
  asyncHandler(c.assignDoctor),
);

// DELETE -- admin only.
router.delete('/:id', requireRole('admin'), asyncHandler(c.remove));

module.exports = router;
