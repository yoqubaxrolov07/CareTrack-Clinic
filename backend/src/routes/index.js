// Aggregator for all API routes.
// app.js mounts this once at /api.

const router = require('express').Router();

router.use('/auth',      require('./authRoutes'));
router.use('/doctors',   require('./doctorRoutes'));
router.use('/patients',  require('./patientRoutes'));
router.use('/diagnoses', require('./diagnosisRoutes'));

module.exports = router;
