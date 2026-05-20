// Doctor CRUD controller.
// Per the brief, only admins manage doctor profiles.

const doctorModel = require('../models/doctorModel');
const ApiError    = require('../utils/ApiError');

// GET /api/doctors?search=cardio
exports.getAll = async (req, res) => {
  const doctors = await doctorModel.findAll({ search: req.query.search });
  res.json({ success: true, count: doctors.length, data: doctors });
};

// GET /api/doctors/:id
exports.getById = async (req, res) => {
  const doctor = await doctorModel.findById(req.params.id);
  if (!doctor) throw ApiError.notFound('Doctor not found');
  const patientCount = await doctorModel.countPatients(doctor.id);
  res.json({ success: true, data: { ...doctor, patient_count: patientCount } });
};

// POST /api/doctors
exports.create = async (req, res) => {
  const doctor = await doctorModel.create(req.body);
  res.status(201).json({ success: true, data: doctor });
};

// PUT /api/doctors/:id
exports.update = async (req, res) => {
  const existing = await doctorModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Doctor not found');
  const updated = await doctorModel.update(req.params.id, req.body);
  res.json({ success: true, data: updated });
};

// DELETE /api/doctors/:id
exports.remove = async (req, res) => {
  const existing = await doctorModel.findById(req.params.id);
  if (!existing) throw ApiError.notFound('Doctor not found');
  await doctorModel.remove(req.params.id);
  res.json({ success: true, message: 'Doctor deleted' });
};
