// Diagnosis (Disease record) CRUD controller.
// Permissions (from the brief):
//   admin     -> full CRUD
//   clinician -> create / read / update / mark resolved
//   receptionist -> NO access (handled by routes)

const diagnosisModel = require('../models/diagnosisModel');
const patientModel   = require('../models/patientModel');
const ApiError       = require('../utils/ApiError');

// GET /api/diagnoses?search=diabetes&status=active&patientId=1
exports.getAll = async (req, res) => {
  const diagnoses = await diagnosisModel.findAll({
    search:    req.query.search,
    status:    req.query.status,
    patientId: req.query.patientId,
  });
  res.json({ success: true, count: diagnoses.length, data: diagnoses });
};

// GET /api/diagnoses/:id
exports.getById = async (req, res) => {
  const dx = await diagnosisModel.findById(req.params.id);
  if (!dx) throw ApiError.notFound('Diagnosis not found');
  res.json({ success: true, data: dx });
};

// POST /api/diagnoses
exports.create = async (req, res) => {
  const patient = await patientModel.findById(req.body.patient_id);
  if (!patient) throw ApiError.badRequest('Patient does not exist');

  const dx = await diagnosisModel.create({
    ...req.body,
    created_by: req.user.id,         // attach the logged-in user
  });
  res.status(201).json({ success: true, data: dx });
};

// PUT /api/diagnoses/:id
exports.update = async (req, res) => {
  const existing = await diagnosisModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Diagnosis not found');
  const updated = await diagnosisModel.update(req.params.id, req.body);
  res.json({ success: true, data: updated });
};

// DELETE /api/diagnoses/:id
exports.remove = async (req, res) => {
  const existing = await diagnosisModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Diagnosis not found');
  await diagnosisModel.remove(req.params.id);
  res.json({ success: true, message: 'Diagnosis deleted' });
};
