const router = require('express').Router();
const { body } = require('express-validator');

const c = require('../controllers/diagnosisController');
const authMiddleware  = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const validateRequest = require('../middleware/validateRequest');
const asyncHandler    = require('../utils/asyncHandler');

router.use(authMiddleware);

// READ -- admin + clinician (receptionists do not see medical records).
router.get('/',    requireRole('admin', 'clinician'), asyncHandler(c.getAll));
router.get('/:id', requireRole('admin', 'clinician'), asyncHandler(c.getById));

// CREATE -- admin + clinician.
router.post(
  '/',
  requireRole('admin', 'clinician'),
  [
    body('patient_id').isInt({ min: 1 }),
    body('icd_code').notEmpty(),
    body('description').notEmpty(),
    body('severity').isIn(['mild', 'moderate', 'severe', 'critical']),
    body('status').optional().isIn(['active', 'resolved']),
    body('diagnosed_at').isISO8601().withMessage('diagnosed_at must be YYYY-MM-DD'),
  ],
  validateRequest,
  asyncHandler(c.create),
);

// UPDATE -- admin + clinician.
router.put(
  '/:id',
  requireRole('admin', 'clinician'),
  [
    body('severity').optional().isIn(['mild', 'moderate', 'severe', 'critical']),
    body('status').optional().isIn(['active', 'resolved']),
    body('diagnosed_at').optional().isISO8601(),
  ],
  validateRequest,
  asyncHandler(c.update),
);

// DELETE -- admin only.
router.delete('/:id', requireRole('admin'), asyncHandler(c.remove));

module.exports = router;
