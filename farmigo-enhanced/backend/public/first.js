const API = 'https://farmigo-backend-5w4i.onrender.com';

function switchForm(type) {
  document.getElementById('loginForm').classList.toggle('hidden', type !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', type !== 'register');
  document.getElementById('loginTab').classList.toggle('active', type === 'login');
  document.getElementById('registerTab').classList.toggle('active', type !== 'login');
}

function toggleRegFields() {
  const role = document.getElementById('regRole').value;
  document.getElementById('plotField').style.display = role === 'seller' ? 'block' : 'none';
  document.getElementById('aadhaarField').style.display = role === 'buyer' ? 'block' : 'none';
}

function showMsg(id, text, type) {
  const el = document.getElementById(id);
  el.textContent = text;
  el.className = `msg ${type}`;
  el.classList.remove('hidden');
}

// LOGIN
document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const role = document.getElementById('loginRole').value;
  const emailOrMobile = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  if (!role) return showMsg('loginMsg', 'Please select a role', 'error');
  try {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, emailOrMobile, password })
    });
    const data = await res.json();
    if (res.ok) {
      showMsg('loginMsg', '✅ Login successful! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = role === 'seller' ? 'finalseller.html' : 'finalbuyer.html';
      }, 800);
    } else { showMsg('loginMsg', '❌ ' + data.message, 'error'); }
  } catch { showMsg('loginMsg', '❌ Server error. Is the backend running?', 'error'); }
});

// REGISTER
document.getElementById('registerForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const role = document.getElementById('regRole').value;
  if (!role) return showMsg('regMsg', 'Please select a role', 'error');
  const body = {
    role,
    name: { first: document.getElementById('regFirst').value.trim(), last: document.getElementById('regLast').value.trim() },
    email: document.getElementById('regEmail').value.trim(),
    mobile: document.getElementById('regMobile').value.trim(),
    address: { city: document.getElementById('regCity').value.trim(), state: document.getElementById('regState').value.trim(), country: 'India' },
    password: document.getElementById('regPassword').value,
    plotNo: document.getElementById('regPlotNo').value.trim(),
    licenceOrAadhaarNo: document.getElementById('regAadhaar').value.trim()
  };
  try {
    const res = await fetch(`${API}/api/auth/register`, {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) {
      showMsg('regMsg', '✅ Account created! Please login.', 'success');
      setTimeout(() => switchForm('login'), 1500);
    } else { showMsg('regMsg', '❌ ' + data.message, 'error'); }
  } catch { showMsg('regMsg', '❌ Server error. Is the backend running?', 'error'); }
});
