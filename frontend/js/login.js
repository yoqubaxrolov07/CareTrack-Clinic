// Login page logic

// If already logged in, redirect to dashboard
if (isLoggedIn()) {
  window.location.href = 'dashboard.html';
}

const form = document.getElementById('loginForm');
const errorEl = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.classList.remove('show');

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    errorEl.textContent = 'Please enter email and password.';
    errorEl.classList.add('show');
    return;
  }

  loginBtn.textContent = 'Signing in...';
  loginBtn.disabled = true;

  try {
    const data = await login(email, password);
    if (data.success) {
      window.location.href = 'dashboard.html';
    }
  } catch (err) {
    errorEl.textContent = err.message || 'Invalid email or password.';
    errorEl.classList.add('show');
  } finally {
    loginBtn.textContent = 'Sign In';
    loginBtn.disabled = false;
  }
});
