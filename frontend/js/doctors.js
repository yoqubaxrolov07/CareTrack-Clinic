// Doctors page logic — CRUD operations

if (!initPage()) throw new Error('Not authenticated');

const user = getUser();
const tbody = document.getElementById('doctorsTableBody');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('doctorModal');
const viewModal = document.getElementById('viewDoctorModal');
const btnAdd = document.getElementById('btnAddDoctor');
const btnSave = document.getElementById('btnSaveDoctor');
const modalTitle = document.getElementById('modalTitle');

let allDoctors = [];

// ===== LOAD DOCTORS =====
async function loadDoctors(search = '') {
  try {
    const res = await getDoctors(search);
    allDoctors = res.data || [];
    renderTable(allDoctors);
    document.getElementById('statTotal').textContent = allDoctors.length;

    // Count unique departments
    const depts = [...new Set(allDoctors.map(d => d.department))];
    document.getElementById('statDepts').textContent = depts.length;
  } catch (err) {
    showToast(err.message || 'Failed to load doctors', 'error');
  }
}

// ===== RENDER TABLE =====
function renderTable(doctors) {
  if (!doctors.length) {
    tbody.innerHTML = `
      <tr><td colspan="7" class="empty-state">
        <div class="icon"><i data-lucide="stethoscope" style="width:48px;height:48px;color:var(--text-muted);"></i></div>
        <p>No doctors found</p>
      </td></tr>`;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const isAdmin = user.role === 'admin';
  tbody.innerHTML = doctors.map(d => `
    <tr>
      <td>${d.id}</td>
      <td><strong>${d.full_name}</strong></td>
      <td>${d.specialty}</td>
      <td>${d.department}</td>
      <td>${d.email}</td>
      <td>${d.phone || '—'}</td>
      <td>
        <div class="action-btns">
          <button class="btn btn-outline btn-sm" onclick="viewDoctor(${d.id})" title="View"><i data-lucide="eye" style="width:14px;height:14px;"></i></button>
          ${isAdmin ? `
            <button class="btn btn-primary btn-sm" onclick="editDoctor(${d.id})" title="Edit"><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>
            <button class="btn btn-danger btn-sm" onclick="removeDoctor(${d.id})" title="Delete"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
  if (window.lucide) lucide.createIcons();
}

// ===== SEARCH =====
let searchTimeout;
searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadDoctors(e.target.value.trim());
  }, 400);
});

// ===== MODAL FUNCTIONS =====
function openModal(title = 'Add Doctor') {
  modalTitle.textContent = title;
  modal.classList.add('active');
}

function closeModal() {
  modal.classList.remove('active');
  document.getElementById('doctorForm').reset();
  document.getElementById('doctorId').value = '';
}

function closeViewModal() {
  viewModal.classList.remove('active');
}

// ===== ADD DOCTOR =====
if (btnAdd) {
  btnAdd.addEventListener('click', () => {
    openModal('Add New Doctor');
  });
}

// ===== EDIT DOCTOR =====
async function editDoctor(id) {
  try {
    const res = await getDoctor(id);
    const d = res.data;
    document.getElementById('doctorId').value = d.id;
    document.getElementById('fullName').value = d.full_name;
    document.getElementById('specialty').value = d.specialty;
    document.getElementById('department').value = d.department;
    document.getElementById('doctorEmail').value = d.email;
    document.getElementById('doctorPhone').value = d.phone || '';
    openModal('Edit Doctor');
  } catch (err) {
    showToast(err.message || 'Failed to load doctor', 'error');
  }
}

// ===== VIEW DOCTOR =====
async function viewDoctor(id) {
  try {
    const res = await getDoctor(id);
    const d = res.data;
    document.getElementById('viewDoctorContent').innerHTML = `
      <div class="profile-info">
        <div class="profile-info-row">
          <span class="label">Full Name</span>
          <span class="value">${d.full_name}</span>
        </div>
        <div class="profile-info-row">
          <span class="label">Specialty</span>
          <span class="value">${d.specialty}</span>
        </div>
        <div class="profile-info-row">
          <span class="label">Department</span>
          <span class="value">${d.department}</span>
        </div>
        <div class="profile-info-row">
          <span class="label">Email</span>
          <span class="value">${d.email}</span>
        </div>
        <div class="profile-info-row">
          <span class="label">Phone</span>
          <span class="value">${d.phone || '—'}</span>
        </div>
        <div class="profile-info-row">
          <span class="label">Patients</span>
          <span class="value">${d.patient_count || 0} patient(s) assigned</span>
        </div>
        <div class="profile-info-row">
          <span class="label">Registered</span>
          <span class="value">${formatDate(d.created_at)}</span>
        </div>
      </div>
    `;
    viewModal.classList.add('active');
  } catch (err) {
    showToast(err.message || 'Failed to load doctor details', 'error');
  }
}

// ===== DELETE DOCTOR =====
async function removeDoctor(id) {
  const doc = allDoctors.find(d => d.id === id);
  if (!confirmAction(`Are you sure you want to delete ${doc?.full_name || 'this doctor'}?`)) {
    return;
  }
  try {
    await deleteDoctor(id);
    showToast('Doctor deleted successfully');
    loadDoctors();
  } catch (err) {
    showToast(err.message || 'Failed to delete doctor', 'error');
  }
}

// ===== SAVE (CREATE/UPDATE) =====
btnSave.addEventListener('click', async () => {
  const id = document.getElementById('doctorId').value;
  const data = {
    full_name: document.getElementById('fullName').value.trim(),
    specialty: document.getElementById('specialty').value,
    department: document.getElementById('department').value,
    email: document.getElementById('doctorEmail').value.trim(),
    phone: document.getElementById('doctorPhone').value.trim() || null,
  };

  // Basic validation
  if (!data.full_name || !data.specialty || !data.department || !data.email) {
    showToast('Please fill all required fields', 'warning');
    return;
  }

  btnSave.textContent = 'Saving...';
  btnSave.disabled = true;

  try {
    if (id) {
      await updateDoctor(id, data);
      showToast('Doctor updated successfully');
    } else {
      await createDoctor(data);
      showToast('Doctor created successfully');
    }
    closeModal();
    loadDoctors();
  } catch (err) {
    const msg = err.details
      ? err.details.map(d => d.message).join(', ')
      : err.message || 'Failed to save doctor';
    showToast(msg, 'error');
  } finally {
    btnSave.textContent = 'Save Doctor';
    btnSave.disabled = false;
  }
});

// ===== INITIAL LOAD =====
loadDoctors();
