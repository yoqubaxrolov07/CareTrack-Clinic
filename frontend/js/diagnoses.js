// Diagnoses page logic — CRUD

if (!initPage()) throw new Error('Not authenticated');

const user = getUser();
const tbody = document.getElementById('diagnosesTableBody');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const modal = document.getElementById('diagnosisModal');
const btnAdd = document.getElementById('btnAddDiagnosis');
const btnSave = document.getElementById('btnSaveDiagnosis');
const modalTitle = document.getElementById('modalTitle');

let allDiagnoses = [];
let patientsList = [];

// ===== LOAD =====
async function loadDiagnoses() {
  const search = searchInput.value.trim();
  const status = statusFilter.value;
  try {
    const res = await getDiagnoses({ search, status });
    allDiagnoses = res.data || [];
    renderTable(allDiagnoses);

    // Stats
    const allRes = await getDiagnoses({});
    const all = allRes.data || [];
    document.getElementById('statTotal').textContent = all.length;
    document.getElementById('statActive').textContent = all.filter(d => d.status === 'active').length;
    document.getElementById('statResolved').textContent = all.filter(d => d.status === 'resolved').length;
  } catch (err) {
    showToast(err.message || 'Failed to load diagnoses', 'error');
  }
}

async function loadPatientsList() {
  try {
    const res = await getPatients();
    patientsList = res.data || [];
    const select = document.getElementById('patientSelect');
    select.innerHTML = '<option value="">Select patient</option>';
    patientsList.forEach(p => {
      select.innerHTML += `<option value="${p.id}">${p.first_name} ${p.last_name}</option>`;
    });
  } catch (err) {
    console.error('Could not load patients list');
  }
}

// ===== RENDER =====
function renderTable(diagnoses) {
  if (!diagnoses.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-state">
      <div class="icon"><i data-lucide="file-text" style="width:48px;height:48px;color:var(--text-muted);"></i></div><p>No diagnoses found</p>
    </td></tr>`;
    return;
  }

  const canEdit = user.role === 'admin' || user.role === 'clinician';
  const canDelete = user.role === 'admin';

  tbody.innerHTML = diagnoses.map(dx => {
    const patient = patientsList.find(p => p.id === dx.patient_id);
    const patientName = patient ? `${patient.first_name} ${patient.last_name}` : `Patient #${dx.patient_id}`;
    return `
    <tr>
      <td>${dx.id}</td>
      <td><strong>${patientName}</strong></td>
      <td><code>${dx.icd_code}</code></td>
      <td>${dx.description}</td>
      <td>${severityBadge(dx.severity)}</td>
      <td>${statusBadge(dx.status)}</td>
      <td>${formatDate(dx.diagnosed_at)}</td>
      <td>
        <div class="action-btns">
          ${canEdit ? `<button class="btn btn-primary btn-sm" onclick="editDiagnosis(${dx.id})" title="Edit"><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>` : ''}
          ${canDelete ? `<button class="btn btn-danger btn-sm" onclick="removeDiagnosis(${dx.id})" title="Delete"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
  if (window.lucide) lucide.createIcons();
}

// ===== SEARCH & FILTER =====
let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(loadDiagnoses, 400);
});
statusFilter.addEventListener('change', loadDiagnoses);

// ===== MODAL =====
function openModal(title = 'Add Diagnosis') {
  modalTitle.textContent = title;
  modal.classList.add('active');
}

function closeModal() {
  modal.classList.remove('active');
  document.getElementById('diagnosisForm').reset();
  document.getElementById('diagnosisId').value = '';
}

// ===== ADD =====
if (btnAdd) {
  btnAdd.addEventListener('click', () => {
    document.getElementById('diagnosedAt').value = new Date().toISOString().split('T')[0];
    openModal('Add New Diagnosis');
  });
}

// ===== EDIT =====
async function editDiagnosis(id) {
  try {
    const res = await getDiagnosis(id);
    const dx = res.data;
    document.getElementById('diagnosisId').value = dx.id;
    document.getElementById('patientSelect').value = dx.patient_id;
    document.getElementById('icdCode').value = dx.icd_code;
    document.getElementById('diagnosedAt').value = dx.diagnosed_at;
    document.getElementById('description').value = dx.description;
    document.getElementById('severity').value = dx.severity;
    document.getElementById('status').value = dx.status;
    document.getElementById('treatment').value = dx.treatment || '';
    openModal('Edit Diagnosis');
  } catch (err) {
    showToast(err.message || 'Failed to load diagnosis', 'error');
  }
}

// ===== DELETE =====
async function removeDiagnosis(id) {
  if (!confirmAction('Delete this diagnosis record?')) return;
  try {
    await deleteDiagnosis(id);
    showToast('Diagnosis deleted successfully');
    loadDiagnoses();
  } catch (err) {
    showToast(err.message || 'Failed to delete', 'error');
  }
}

// ===== SAVE =====
btnSave.addEventListener('click', async () => {
  const id = document.getElementById('diagnosisId').value;
  const data = {
    patient_id: parseInt(document.getElementById('patientSelect').value),
    icd_code: document.getElementById('icdCode').value.trim(),
    description: document.getElementById('description').value.trim(),
    severity: document.getElementById('severity').value,
    status: document.getElementById('status').value,
    diagnosed_at: document.getElementById('diagnosedAt').value,
    treatment: document.getElementById('treatment').value.trim() || null,
  };

  if (!data.patient_id || !data.icd_code || !data.description || !data.severity || !data.diagnosed_at) {
    showToast('Please fill all required fields', 'warning');
    return;
  }

  btnSave.textContent = 'Saving...';
  btnSave.disabled = true;

  try {
    if (id) {
      await updateDiagnosis(id, data);
      showToast('Diagnosis updated successfully');
    } else {
      await createDiagnosis(data);
      showToast('Diagnosis created successfully');
    }
    closeModal();
    loadDiagnoses();
  } catch (err) {
    const msg = err.details ? err.details.map(d => d.message).join(', ') : err.message;
    showToast(msg || 'Failed to save', 'error');
  } finally {
    btnSave.textContent = 'Save Diagnosis';
    btnSave.disabled = false;
  }
});

// ===== INIT =====
loadPatientsList().then(() => loadDiagnoses());
