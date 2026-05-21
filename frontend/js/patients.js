// Patients page logic — CRUD + profile view

if (!initPage()) throw new Error('Not authenticated');

const user = getUser();
const tbody = document.getElementById('patientsTableBody');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('patientModal');
const profileModal = document.getElementById('profileModal');
const btnAdd = document.getElementById('btnAddPatient');
const btnSave = document.getElementById('btnSavePatient');
const modalTitle = document.getElementById('modalTitle');

let allPatients = [];
let doctorsList = [];

// ===== LOAD DATA =====
async function loadPatients(search = '') {
  try {
    const res = await getPatients(search);
    allPatients = res.data || [];
    renderTable(allPatients);

    // Stats
    document.getElementById('statTotal').textContent = allPatients.length;
    const assigned = allPatients.filter(p => p.doctor_id).length;
    document.getElementById('statAssigned').textContent = assigned;
    document.getElementById('statUnassigned').textContent = allPatients.length - assigned;
  } catch (err) {
    showToast(err.message || 'Failed to load patients', 'error');
  }
}

async function loadDoctorsList() {
  try {
    const res = await getDoctors();
    doctorsList = res.data || [];
    const select = document.getElementById('doctorSelect');
    select.innerHTML = '<option value="">No doctor assigned</option>';
    doctorsList.forEach(d => {
      select.innerHTML += `<option value="${d.id}">${d.full_name} (${d.specialty})</option>`;
    });
  } catch (err) {
    console.error('Could not load doctors list');
  }
}

// ===== RENDER TABLE =====
function renderTable(patients) {
  if (!patients.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">
      <div class="icon"><i data-lucide="users" style="width:48px;height:48px;color:var(--text-muted);"></i></div><p>No patients found</p>
    </td></tr>`;
    return;
  }

  const canEdit = user.role === 'admin' || user.role === 'clinician';
  const canDelete = user.role === 'admin';

  tbody.innerHTML = patients.map(p => {
    const doctor = doctorsList.find(d => d.id === p.doctor_id);
    return `
    <tr>
      <td>${p.id}</td>
      <td><strong>${p.first_name} ${p.last_name}</strong></td>
      <td>${formatDate(p.dob)}</td>
      <td>${p.gender}</td>
      <td>${p.blood_group || '—'}</td>
      <td>${p.phone || '—'}</td>
      <td>${doctor ? doctor.full_name : '<span style="color:#999">Unassigned</span>'}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-outline btn-sm" onclick="viewProfile(${p.id})" title="Full Profile"><i data-lucide="eye" style="width:14px;height:14px;"></i></button>
          ${canEdit ? `<button class="btn btn-primary btn-sm" onclick="editPatient(${p.id})" title="Edit"><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>` : ''}
          ${canDelete ? `<button class="btn btn-danger btn-sm" onclick="removePatient(${p.id})" title="Delete"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
  if (window.lucide) lucide.createIcons();
}

// ===== SEARCH =====
let searchTimeout;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => loadPatients(e.target.value.trim()), 400);
});

// ===== MODAL FUNCTIONS =====
function openModal(title = 'Add Patient') {
  modalTitle.textContent = title;
  modal.classList.add('active');
}

function closeModal() {
  modal.classList.remove('active');
  document.getElementById('patientForm').reset();
  document.getElementById('patientId').value = '';
}

function closeProfileModal() {
  profileModal.classList.remove('active');
}

// ===== ADD =====
if (btnAdd) {
  btnAdd.addEventListener('click', () => openModal('Add New Patient'));
}

// ===== EDIT =====
async function editPatient(id) {
  try {
    const res = await getPatient(id);
    const p = res.data;
    document.getElementById('patientId').value = p.id;
    document.getElementById('firstName').value = p.first_name;
    document.getElementById('lastName').value = p.last_name;
    document.getElementById('dob').value = p.dob;
    document.getElementById('gender').value = p.gender;
    document.getElementById('patientPhone').value = p.phone || '';
    document.getElementById('patientEmail').value = p.email || '';
    document.getElementById('address').value = p.address || '';
    document.getElementById('emergencyContact').value = p.emergency_contact || '';
    document.getElementById('bloodGroup').value = p.blood_group || 'unknown';
    document.getElementById('doctorSelect').value = p.doctor_id || '';
    openModal('Edit Patient');
  } catch (err) {
    showToast(err.message || 'Failed to load patient', 'error');
  }
}

// ===== VIEW FULL PROFILE =====
async function viewProfile(id) {
  try {
    const res = await getPatientProfile(id);
    const p = res.data;
    const content = document.getElementById('profileContent');

    let diagnosesHtml = '';
    if (p.diagnoses && p.diagnoses.length) {
      diagnosesHtml = `
        <h3 style="margin-top:20px; color:var(--primary); border-bottom:2px solid var(--accent-light); padding-bottom:8px;">
          Diagnosis History (${p.diagnoses.length})
        </h3>
        <table class="data-table" style="margin-top:12px;">
          <thead><tr><th>Date</th><th>ICD</th><th>Description</th><th>Severity</th><th>Status</th></tr></thead>
          <tbody>
            ${p.diagnoses.map(dx => `
              <tr>
                <td>${formatDate(dx.diagnosed_at)}</td>
                <td><strong>${dx.icd_code}</strong></td>
                <td>${dx.description}</td>
                <td>${severityBadge(dx.severity)}</td>
                <td>${statusBadge(dx.status)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>`;
    } else {
      diagnosesHtml = '<p style="margin-top:20px; color:#999;">No diagnoses recorded.</p>';
    }

    content.innerHTML = `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
        <div>
          <h3 style="color:var(--primary); border-bottom:2px solid var(--accent-light); padding-bottom:8px; margin-bottom:12px;">
            Personal Information
          </h3>
          <div class="profile-info">
            <div class="profile-info-row"><span class="label">Name</span><span class="value">${p.first_name} ${p.last_name}</span></div>
            <div class="profile-info-row"><span class="label">DOB</span><span class="value">${formatDate(p.dob)}</span></div>
            <div class="profile-info-row"><span class="label">Gender</span><span class="value">${p.gender}</span></div>
            <div class="profile-info-row"><span class="label">Blood Group</span><span class="value">${p.blood_group || '—'}</span></div>
            <div class="profile-info-row"><span class="label">Phone</span><span class="value">${p.phone || '—'}</span></div>
            <div class="profile-info-row"><span class="label">Email</span><span class="value">${p.email || '—'}</span></div>
            <div class="profile-info-row"><span class="label">Address</span><span class="value">${p.address || '—'}</span></div>
            <div class="profile-info-row"><span class="label">Emergency</span><span class="value">${p.emergency_contact || '—'}</span></div>
          </div>
        </div>
        <div>
          <h3 style="color:var(--primary); border-bottom:2px solid var(--accent-light); padding-bottom:8px; margin-bottom:12px;">
            Assigned Doctor
          </h3>
          ${p.doctor ? `
            <div class="profile-info">
              <div class="profile-info-row"><span class="label">Name</span><span class="value">${p.doctor.full_name}</span></div>
              <div class="profile-info-row"><span class="label">Specialty</span><span class="value">${p.doctor.specialty}</span></div>
              <div class="profile-info-row"><span class="label">Department</span><span class="value">${p.doctor.department || '—'}</span></div>
              <div class="profile-info-row"><span class="label">Email</span><span class="value">${p.doctor.email}</span></div>
              <div class="profile-info-row"><span class="label">Phone</span><span class="value">${p.doctor.phone || '—'}</span></div>
            </div>
          ` : '<p style="color:#999;">No doctor assigned.</p>'}
        </div>
      </div>
      ${diagnosesHtml}
    `;
    profileModal.classList.add('active');
  } catch (err) {
    showToast(err.message || 'Failed to load profile', 'error');
  }
}

// ===== DELETE =====
async function removePatient(id) {
  const p = allPatients.find(x => x.id === id);
  if (!confirmAction(`Delete ${p?.first_name} ${p?.last_name}? This will also delete all their diagnoses!`)) return;
  try {
    await deletePatient(id);
    showToast('Patient deleted successfully');
    loadPatients();
  } catch (err) {
    showToast(err.message || 'Failed to delete patient', 'error');
  }
}

// ===== SAVE (CREATE/UPDATE) =====
btnSave.addEventListener('click', async () => {
  const id = document.getElementById('patientId').value;
  const data = {
    first_name: document.getElementById('firstName').value.trim(),
    last_name: document.getElementById('lastName').value.trim(),
    dob: document.getElementById('dob').value,
    gender: document.getElementById('gender').value,
    phone: document.getElementById('patientPhone').value.trim() || null,
    email: document.getElementById('patientEmail').value.trim() || null,
    address: document.getElementById('address').value.trim() || null,
    emergency_contact: document.getElementById('emergencyContact').value.trim() || null,
    blood_group: document.getElementById('bloodGroup').value,
    doctor_id: document.getElementById('doctorSelect').value || null,
  };

  if (!data.first_name || !data.last_name || !data.dob || !data.gender) {
    showToast('Please fill all required fields', 'warning');
    return;
  }

  if (data.doctor_id) data.doctor_id = parseInt(data.doctor_id);

  btnSave.textContent = 'Saving...';
  btnSave.disabled = true;

  try {
    if (id) {
      await updatePatient(id, data);
      showToast('Patient updated successfully');
    } else {
      await createPatient(data);
      showToast('Patient created successfully');
    }
    closeModal();
    loadPatients();
  } catch (err) {
    const msg = err.details ? err.details.map(d => d.message).join(', ') : err.message;
    showToast(msg || 'Failed to save patient', 'error');
  } finally {
    btnSave.textContent = 'Save Patient';
    btnSave.disabled = false;
  }
});

// ===== INITIAL LOAD =====
loadDoctorsList().then(() => loadPatients());
