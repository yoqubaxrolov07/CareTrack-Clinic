// =====================================================
// CareTrack Clinic MRMS - API Service Layer
// Handles all HTTP requests to the backend.
// =====================================================

const API_BASE = 'http://localhost:5000/api';

// ===== TOKEN MANAGEMENT =====
function getToken() {
  return localStorage.getItem('caretrack_token');
}

function setToken(token) {
  localStorage.setItem('caretrack_token', token);
}

function removeToken() {
  localStorage.removeItem('caretrack_token');
  localStorage.removeItem('caretrack_user');
}

function getUser() {
  const data = localStorage.getItem('caretrack_user');
  return data ? JSON.parse(data) : null;
}

function setUser(user) {
  localStorage.setItem('caretrack_user', JSON.stringify(user));
}

// ===== CHECK AUTH =====
function isLoggedIn() {
  return !!getToken();
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// ===== HTTP HELPER =====
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: options.method || 'GET',
    headers,
    ...options,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Token expired or invalid
      if (response.status === 401) {
        removeToken();
        window.location.href = 'login.html';
        return;
      }
      throw { status: response.status, ...data };
    }

    return data;
  } catch (err) {
    if (err.status) throw err;
    throw { success: false, message: 'Network error. Is the server running?' };
  }
}

// ===== AUTH API =====
async function login(email, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  if (data.success) {
    setToken(data.data.token);
    setUser(data.data.user);
  }
  return data;
}

function logout() {
  removeToken();
  window.location.href = 'login.html';
}

async function getMe() {
  return apiRequest('/auth/me');
}

// ===== DOCTORS API =====
async function getDoctors(search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiRequest(`/doctors${query}`);
}

async function getDoctor(id) {
  return apiRequest(`/doctors/${id}`);
}

async function createDoctor(data) {
  return apiRequest('/doctors', { method: 'POST', body: data });
}

async function updateDoctor(id, data) {
  return apiRequest(`/doctors/${id}`, { method: 'PUT', body: data });
}

async function deleteDoctor(id) {
  return apiRequest(`/doctors/${id}`, { method: 'DELETE' });
}

// ===== PATIENTS API =====
async function getPatients(search = '', doctorId = '') {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (doctorId) params.set('doctorId', doctorId);
  const query = params.toString() ? `?${params}` : '';
  return apiRequest(`/patients${query}`);
}

async function getPatient(id) {
  return apiRequest(`/patients/${id}`);
}

async function getPatientProfile(id) {
  return apiRequest(`/patients/${id}/profile`);
}

async function createPatient(data) {
  return apiRequest('/patients', { method: 'POST', body: data });
}

async function updatePatient(id, data) {
  return apiRequest(`/patients/${id}`, { method: 'PUT', body: data });
}

async function assignDoctor(patientId, doctorId) {
  return apiRequest(`/patients/${patientId}/assign-doctor`, {
    method: 'PATCH',
    body: { doctor_id: doctorId },
  });
}

async function deletePatient(id) {
  return apiRequest(`/patients/${id}`, { method: 'DELETE' });
}

// ===== DIAGNOSES API =====
async function getDiagnoses(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.patientId) query.set('patientId', params.patientId);
  const qs = query.toString() ? `?${query}` : '';
  return apiRequest(`/diagnoses${qs}`);
}

async function getDiagnosis(id) {
  return apiRequest(`/diagnoses/${id}`);
}

async function createDiagnosis(data) {
  return apiRequest('/diagnoses', { method: 'POST', body: data });
}

async function updateDiagnosis(id, data) {
  return apiRequest(`/diagnoses/${id}`, { method: 'PUT', body: data });
}

async function deleteDiagnosis(id) {
  return apiRequest(`/diagnoses/${id}`, { method: 'DELETE' });
}
