// ── Storage ──────────────────────────────────────────────────────
const users = [];
let loggedInUser = null;

// ── Router ───────────────────────────────────────────────────────
const pages = document.querySelectorAll('.page');
const navLinks = document.querySelectorAll('.nav-links a');

function showPage(id) {
  pages.forEach(p => p.classList.add('hidden'));
  navLinks.forEach(a => a.classList.remove('active'));

  const target = document.getElementById(id);
  const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);

  if (target) target.classList.remove('hidden');
  if (activeLink) activeLink.classList.add('active');
  if (id === 'dashboard') renderDashboard();
}

window.addEventListener('hashchange', () => {
  showPage(location.hash.replace('#', '') || 'register');
});

window.addEventListener('load', () => {
  showPage(location.hash.replace('#', '') || 'register');
});

// ── Password Strength ────────────────────────────────────────────
document.getElementById('reg-password').addEventListener('input', function () {
  const val = this.value;
  const fill = document.getElementById('strength-fill');
  const text = document.getElementById('strength-text');

  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { label: '',       color: '',        width: '0%'   },
    { label: 'Weak',   color: '#e74c3c', width: '25%'  },
    { label: 'Fair',   color: '#e67e22', width: '50%'  },
    { label: 'Good',   color: '#f1c40f', width: '75%'  },
    { label: 'Strong', color: '#27ae60', width: '100%' },
  ];

  const level = levels[score];
  fill.style.width = level.width;
  fill.style.background = level.color;
  text.textContent = level.label;
  text.style.color = level.color;
});

// ── Register ─────────────────────────────────────────────────────
document.getElementById('reg-btn').addEventListener('click', function () {
  clearErrors();
  const username = document.getElementById('reg-username').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm  = document.getElementById('reg-confirm').value;

  let valid = true;

  if (username.length < 3) {
    showError('err-username', 'Username must be at least 3 characters.');
    setInvalid('reg-username');
    valid = false;
  } else { setValid('reg-username'); }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('err-email', 'Enter a valid email address.');
    setInvalid('reg-email');
    valid = false;
  } else if (users.find(u => u.email === email)) {
    showError('err-email', 'Email already registered.');
    setInvalid('reg-email');
    valid = false;
  } else { setValid('reg-email'); }

  if (password.length < 8) {
    showError('err-password', 'Password must be at least 8 characters.');
    setInvalid('reg-password');
    valid = false;
  } else if (!/[A-Z]/.test(password)) {
    showError('err-password', 'Must include at least one uppercase letter.');
    setInvalid('reg-password');
    valid = false;
  } else if (!/[0-9]/.test(password)) {
    showError('err-password', 'Must include at least one number.');
    setInvalid('reg-password');
    valid = false;
  } else { setValid('reg-password'); }

  if (password !== confirm) {
    showError('err-confirm', 'Passwords do not match.');
    setInvalid('reg-confirm');
    valid = false;
  } else if (confirm) { setValid('reg-confirm'); }

  if (!valid) return;

  users.push({ username, email, password });

  const el = document.getElementById('register-success');
  el.textContent = `✅ Registered successfully! Welcome, ${username}!`;
  el.classList.remove('hidden');

  // clear form
  ['reg-username','reg-email','reg-password','reg-confirm'].forEach(id => {
    document.getElementById(id).value = '';
    document.getElementById(id).classList.remove('valid');
  });
  document.getElementById('strength-fill').style.width = '0%';
  document.getElementById('strength-text').textContent = '';

  setTimeout(() => {
    el.classList.add('hidden');
    location.hash = '#login';
  }, 1800);
});

// ── Login ────────────────────────────────────────────────────────
document.getElementById('login-btn').addEventListener('click', function () {
  clearErrors();
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  let valid = true;

  if (!email) {
    showError('err-login-email', 'Email is required.');
    setInvalid('login-email');
    valid = false;
  } else { setValid('login-email'); }

  if (!password) {
    showError('err-login-password', 'Password is required.');
    setInvalid('login-password');
    valid = false;
  } else { setValid('login-password'); }

  if (!valid) return;

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    showError('err-login-password', 'Invalid email or password.');
    setInvalid('login-password');
    return;
  }

  loggedInUser = user;

  const el = document.getElementById('login-success');
  el.textContent = `✅ Welcome back, ${user.username}!`;
  el.classList.remove('hidden');

  setTimeout(() => {
    el.classList.add('hidden');
    location.hash = '#dashboard';
  }, 1500);
});

// ── Dashboard ────────────────────────────────────────────────────
function renderDashboard() {
  const welcome = document.getElementById('dash-welcome');
  const list    = document.getElementById('user-list');

  if (!loggedInUser) {
    welcome.textContent = 'Please log in first.';
    list.innerHTML = '';
    return;
  }

  welcome.textContent = `👋 Hello, ${loggedInUser.username}! Registered users:`;
  list.innerHTML = '';

  users.forEach((u, i) => {
    const card = document.createElement('div');
    card.className = 'user-card';
    card.innerHTML = `
      <span><strong>${u.username}</strong> — ${u.email}</span>
      <button onclick="removeUser(${i})">Remove</button>
    `;
    list.appendChild(card);
  });
}

function removeUser(index) {
  if (users[index].email === loggedInUser.email) {
    alert("You can't remove yourself!");
    return;
  }
  users.splice(index, 1);
  renderDashboard();
}

// ── Helpers ──────────────────────────────────────────────────────
function showError(id, msg) {
  document.getElementById(id).textContent = msg;
}

function clearErrors() {
  document.querySelectorAll('.error').forEach(e => e.textContent = '');
  document.querySelectorAll('input').forEach(i => {
    i.classList.remove('invalid', 'valid');
  });
}

function setInvalid(id) { 
  document.getElementById(id).classList.add('invalid'); 
}

function setValid(id) { 
  document.getElementById(id).classList.remove('invalid');
  document.getElementById(id).classList.add('valid'); 
}