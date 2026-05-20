// Patient CRUD controller.
// Permissions (from the brief):
//   admin        -> full CRUD
//   receptionist -> create + read
//   clinician    -> read + update

const patientModel = require('../models/patientModel');
const doctorModel  = require('../models/doctorModel');
const ApiError     = require('../utils/ApiError');

// GET /api/patients?search=ali&doctorId=1
exports.getAll = async (req, res) => {
  const patients = await patientModel.findAll({
    search:   req.query.search,
    doctorId: req.query.doctorId,
  });
  res.json({ success: true, count: patients.length, data: patients });
};

// GET /api/patients/:id
exports.getById = async (req, res) => {
  const patient = await patientModel.findById(req.params.id);
  if (!patient) throw ApiError.notFound('Patient not found');
  res.json({ success: true, data: patient });
};

// GET /api/patients/:id/profile
//   Full profile = patient + doctor + all diagnoses
exports.getFullProfile = async (req, res) => {
  const profile = await patientModel.findFullProfile(req.params.id);
  if (!profile) throw ApiError.notFound('Patient not found');
  res.json({ success: true, data: profile });
};

// POST /api/patients
exports.create = async (req, res) => {
  if (req.body.doctor_id) {
    const doctor = await doctorModel.findById(req.body.doctor_id);
    if (!doctor) throw ApiError.badRequest('Assigned doctor does not exist');
  }
  const patient = await patientModel.create(req.body);
  res.status(201).json({ success: true, data: patient });
};

// PUT /api/patients/:id
exports.update = async (req, res) => {
  const existing = await patientModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Patient not found');

  if (req.body.doctor_id) {
    const doctor = await doctorModel.findById(req.body.doctor_id);
    if (!doctor) throw ApiError.badRequest('Assigned doctor does not exist');
  }

  const updated = await patientModel.update(req.params.id, req.body);
  res.json({ success: true, data: updated });
};

// PATCH /api/patients/:id/assign-doctor
exports.assignDoctor = async (req, res) => {
  const { doctor_id } = req.body;
  const existing = await patientModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Patient not found');

  if (doctor_id) {
    const doctor = await doctorModel.findById(doctor_id);
    if (!doctor) throw ApiError.badRequest('Doctor does not exist');
  }

  const updated = await patientModel.assignDoctor(req.params.id, doctor_id || null);
  res.json({ success: true, data: updated });
};

// DELETE /api/patients/:id
exports.remove = async (req, res) => {
  const existing = await patientModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Patient not found');
  await patientModel.remove(req.params.id);
  res.json({ success: true, message: 'Patient deleted' });
};
