// =====================================================
// CareTrack Clinic MRMS - Utility functions
// Toast notifications, helpers, DOM shortcuts
// =====================================================

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== DATE FORMATTING =====
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
}

// ===== SEVERITY BADGE =====
function severityBadge(severity) {
  return `<span class="badge badge-${severity}">${severity}</span>`;
}

// ===== STATUS BADGE =====
function statusBadge(status) {
  return `<span class="badge badge-${status}">${status}</span>`;
}

// ===== ROLE BADGE =====
function roleBadge(role) {
  return `<span class="badge badge-${role}">${role}</span>`;
}

// ===== CONFIRM DIALOG =====
function confirmAction(message) {
  return confirm(message);
}

// ===== SETUP SIDEBAR =====
function setupSidebar() {
  const user = getUser();
  if (!user) return;

  // Set user info
  const avatarEl = document.querySelector('.user-avatar');
  const nameEl = document.querySelector('.user-name');
  const roleEl = document.querySelector('.user-role');

  if (avatarEl) avatarEl.textContent = user.full_name?.charAt(0) || 'U';
  if (nameEl) nameEl.textContent = user.full_name || user.username;
  if (roleEl) roleEl.textContent = user.role;

  // Highlight active nav
  const currentPage = window.location.pathname.split('/').pop() || 'dashboard.html';
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });

  // Hide links based on role
  const role = user.role;
  document.querySelectorAll('[data-roles]').forEach(el => {
    const allowed = el.dataset.roles.split(',');
    if (!allowed.includes(role)) {
      el.style.display = 'none';
    }
  });
}

// ===== INIT PAGE =====
function initPage() {
  if (!requireAuth()) return false;
  setupSidebar();
  return true;
}
