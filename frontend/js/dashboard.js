// Dashboard page logic

if (!initPage()) throw new Error('Not authenticated');

const user = getUser();
document.getElementById('welcomeName').textContent = user.full_name || user.username;

// Load stats
async function loadDashboard() {
  try {
    // Load doctors count
    const doctorsRes = await getDoctors();
    document.getElementById('statDoctors').textContent = doctorsRes.count || 0;

    // Load patients count
    const patientsRes = await getPatients();
    document.getElementById('statPatients').textContent = patientsRes.count || 0;

    // Load diagnoses (only admin/clinician can access)
    if (user.role === 'admin' || user.role === 'clinician') {
      const activeDx = await getDiagnoses({ status: 'active' });
      const resolvedDx = await getDiagnoses({ status: 'resolved' });
      document.getElementById('statActiveDx').textContent = activeDx.count || 0;
      document.getElementById('statResolvedDx').textContent = resolvedDx.count || 0;
    } else {
      document.getElementById('statActiveDx').textContent = '—';
      document.getElementById('statResolvedDx').textContent = '—';
    }

    // Load recent patients (first 5)
    renderRecentPatients(patientsRes.data ? patientsRes.data.slice(0, 5) : []);
  } catch (err) {
    showToast(err.message || 'Failed to load dashboard', 'error');
  }
}

function renderRecentPatients(patients) {
  const tbody = document.getElementById('recentPatientsBody');
  if (!patients.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No patients found</td></tr>';
    return;
  }
  tbody.innerHTML = patients.map(p => `
    <tr>
      <td><strong>${p.first_name} ${p.last_name}</strong></td>
      <td>${p.gender}</td>
      <td>${p.blood_group || '—'}</td>
      <td>${p.doctor_id ? 'Doctor #' + p.doctor_id : '—'}</td>
    </tr>
  `).join('');
}

loadDashboard();
