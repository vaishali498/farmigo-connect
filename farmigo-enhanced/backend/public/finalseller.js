const API = 'http://localhost:5000';
const socket = io(API);

let currentUser = null;
let currentRoomId = null;
let categoryChartInstance = null;
let statusChartInstance = null;

// ===== INIT =====
window.onload = async () => {
  try {
    const res = await fetch(`${API}/api/auth/seller/check-session`, { credentials: 'include' });
    if (!res.ok) { window.location.href = 'login.html'; return; }
    const sess = await fetch(`${API}/api/check-session`, { credentials: 'include' });
    const sessData = await sess.json();
    currentUser = sessData.sellerId;
  } catch { window.location.href = 'login.html'; return; }
  setupHamburger();
  loadDashboard();
  setupFormModal();
  setupProductTab();
};

// ===== HAMBURGER =====
function setupHamburger() {
  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('hidden');
  });
}
function closeMobile() { document.getElementById('mobileMenu').classList.add('hidden'); }

// ===== TABS =====
function showTab(tab) {
  ['Dashboard','Products','Orders','Chat'].forEach(t => {
    document.getElementById(`tab${t}`).classList.add('hidden');
    const btn = document.getElementById(`tabBtn${t}`);
    if (btn) btn.classList.remove('active');
  });
  document.getElementById(`tab${tab.charAt(0).toUpperCase()+tab.slice(1)}`).classList.remove('hidden');
  const btn = document.getElementById(`tabBtn${tab.charAt(0).toUpperCase()+tab.slice(1)}`);
  if (btn) btn.classList.add('active');
  if (tab === 'dashboard') loadDashboard();
  else if (tab === 'products') loadSellerProducts();
  else if (tab === 'orders') loadSellerOrders();
}

// ===== DASHBOARD =====
async function loadDashboard() {
  try {
    const res = await fetch(`${API}/api/orders/dashboard-stats`, { credentials: 'include' });
    const data = await res.json();
    document.getElementById('statOrders').textContent = data.totalOrders;
    document.getElementById('statRevenue').textContent = '₹' + (data.totalRevenue || 0).toFixed(0);
    document.getElementById('statDelivered').textContent = data.delivered;
    document.getElementById('statPending').textContent = data.pending;
    drawCharts(data);
  } catch {}
}

function drawCharts(data) {
  // Category chart
  const catCtx = document.getElementById('categoryChart').getContext('2d');
  if (categoryChartInstance) categoryChartInstance.destroy();
  if (data.categoryStats && data.categoryStats.length) {
    document.getElementById('noChartData').classList.add('hidden');
    categoryChartInstance = new Chart(catCtx, {
      type: 'doughnut',
      data: {
        labels: data.categoryStats.map(c => c.cat),
        datasets: [{ data: data.categoryStats.map(c => c.count), backgroundColor: ['#4caf50','#ffb300','#1976d2','#e53935','#8e24aa','#00897b'] }]
      },
      options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });
  } else {
    document.getElementById('noChartData').classList.remove('hidden');
  }

  // Status chart
  const statCtx = document.getElementById('statusChart').getContext('2d');
  if (statusChartInstance) statusChartInstance.destroy();
  statusChartInstance = new Chart(statCtx, {
    type: 'bar',
    data: {
      labels: ['Placed','Confirmed','Packed','Shipped','Delivered','Cancelled'],
      datasets: [{ label: 'Orders', data: [0,0,0,0, data.delivered || 0, 0], backgroundColor: '#4caf50' }]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
  });
}

// ===== SELLER PRODUCTS =====
async function loadSellerProducts() {
  document.getElementById('loadingSellerProducts').style.display = 'block';
  document.getElementById('sellerProductGrid').innerHTML = '';
  document.getElementById('noSellerProducts').classList.add('hidden');
  try {
    const res = await fetch(`${API}/api/farmer/products`, { credentials: 'include' });
    const products = await res.json();
    document.getElementById('loadingSellerProducts').style.display = 'none';
    if (!products.length) { document.getElementById('noSellerProducts').classList.remove('hidden'); return; }
    products.forEach(p => {
      const imgSrc = p.photos && p.photos.length > 0 ? `${API}/uploads/${p.photos[0]}` : 'https://via.placeholder.com/200x150?text=No+Image';
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${imgSrc}" alt="${p.product}" onerror="this.src='https://via.placeholder.com/200x150?text=No+Image'">
        <div class="card-body">
          <h3>${p.product}</h3>
          <div class="price">₹${p.price}/kg</div>
          <div class="meta">${p.category} | Min: ${p.minOrderQty}kg</div>
        </div>`;
      document.getElementById('sellerProductGrid').appendChild(card);
    });
  } catch { document.getElementById('loadingSellerProducts').style.display = 'none'; }
}

// ===== SELLER ORDERS =====
async function loadSellerOrders() {
  document.getElementById('loadingOrders').style.display = 'block';
  document.getElementById('sellerOrdersList').innerHTML = '';
  document.getElementById('noSellerOrders').classList.add('hidden');
  try {
    const res = await fetch(`${API}/api/orders/seller-orders`, { credentials: 'include' });
    const orders = await res.json();
    document.getElementById('loadingOrders').style.display = 'none';
    if (!orders.length) { document.getElementById('noSellerOrders').classList.remove('hidden'); return; }
    const statuses = ['Placed','Confirmed','Packed','Shipped','Out for Delivery','Delivered','Cancelled'];
    orders.forEach(o => {
      const card = document.createElement('div');
      card.className = 'order-card';
      const options = statuses.map(s => `<option value="${s}" ${s===o.status?'selected':''}>${s}</option>`).join('');
      card.innerHTML = `
        <div class="order-card-header">
          <h3>📦 ${o.productName}</h3>
          <span class="status-badge" style="background:#e8f5e9;color:#2e7d32">${o.status}</span>
        </div>
        <div class="order-details">
          Buyer: ${o.buyerName || 'Buyer'} | Qty: ${o.quantity} kg | Amount: ₹${o.totalAmount || '--'}<br>
          Delivery: ${o.deliveryAddress}<br>
          Ordered: ${new Date(o.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
        </div>
        <div style="margin-top:10px;display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <select class="status-select" id="sel_${o._id}">${options}</select>
          <button class="update-btn" onclick="updateOrderStatus('${o._id}', '${o._id}')">Update Status</button>
        </div>`;
      document.getElementById('sellerOrdersList').appendChild(card);
    });
  } catch { document.getElementById('loadingOrders').style.display = 'none'; }
}

async function updateOrderStatus(orderId, elemId) {
  const status = document.getElementById(`sel_${elemId}`).value;
  try {
    const res = await fetch(`${API}/api/orders/update-status/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status })
    });
    if (res.ok) { alert('✅ Status updated!'); loadSellerOrders(); }
    else { const d = await res.json(); alert('❌ ' + d.message); }
  } catch { alert('Error updating status'); }
}

// ===== FORM MODAL =====
function setupFormModal() {
  document.getElementById('openFormBtn').addEventListener('click', () => {
    document.getElementById('formModal').style.display = 'flex';
  });
  document.getElementById('closeForm').addEventListener('click', () => {
    document.getElementById('formModal').style.display = 'none';
  });
  document.getElementById('listingForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    try {
      const res = await fetch(`${API}/api/farmer/products`, { method: 'POST', body: formData, credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        alert('✅ Product listed successfully!');
        this.reset();
        document.getElementById('formModal').style.display = 'none';
        loadDashboard();
      } else { alert('❌ ' + data.message); }
    } catch { alert('Error submitting product. Is server running?'); }
  });
}

// ===== PRODUCT TAB SETUP =====
function setupProductTab() {
  // Tab button for products loads seller products
}

// ===== CHAT =====
function openSellerChat(roomId, productName) {
  currentRoomId = roomId;
  document.getElementById('chatTitle').textContent = `Chat — ${productName}`;
  document.getElementById('chatMessages').innerHTML = '';
  document.getElementById('chatArea').classList.remove('hidden');
  socket.emit('join-room', roomId);
  socket.off('chat-history');
  socket.off('receive-message');
  socket.on('chat-history', (msgs) => { msgs.forEach(addChatMessage); scrollChat(); });
  socket.on('receive-message', (msg) => { addChatMessage(msg); scrollChat(); });
}
function addChatMessage(msg) {
  const div = document.createElement('div');
  const isMine = msg.sender === currentUser;
  div.className = `chat-msg ${isMine ? 'mine' : 'theirs'}`;
  div.innerHTML = `<div>${msg.message}</div><div class="msg-meta">${msg.senderName || 'User'} · ${new Date(msg.time).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</div>`;
  document.getElementById('chatMessages').appendChild(div);
}
function scrollChat() { const el = document.getElementById('chatMessages'); el.scrollTop = el.scrollHeight; }
function sendChatMsg() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg || !currentRoomId) return;
  socket.emit('send-message', { roomId: currentRoomId, message: msg, sender: currentUser, senderName: 'Seller' });
  input.value = '';
}
document.getElementById('chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMsg(); });
function closeChat() { document.getElementById('chatArea').classList.add('hidden'); }

// ===== LOGOUT =====
async function logout() {
  await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' });
  window.location.href = 'login.html';
}
