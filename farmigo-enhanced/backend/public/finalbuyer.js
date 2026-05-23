const API = 'https://farmigo-backend-5w4i.onrender.com';
const socket = io(API);

let allProducts = [];
let currentProductForOrder = null;
let currentRoomId = null;
let currentUser = null;

// ===== INIT =====
window.onload = async () => {
  try {
    const res = await fetch(`${API}/api/auth/buyer/check-session`, { credentials: 'include' });
    if (!res.ok) { window.location.href = 'login.html'; return; }
    const sess = await fetch(`${API}/api/check-session`, { credentials: 'include' });
    const sessData = await sess.json();
    currentUser = sessData.buyerId;
  } catch { window.location.href = 'login.html'; return; }
  loadProducts();
  setupHamburger();
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
  ['Products','Orders','Chat'].forEach(t => {
    document.getElementById(`tab${t}`).classList.add('hidden');
    const btn = document.getElementById(`tabBtn${t}`);
    if (btn) btn.classList.remove('active');
  });
  document.getElementById(`tab${tab.charAt(0).toUpperCase()+tab.slice(1)}`).classList.remove('hidden');
  const activeBtn = document.getElementById(`tabBtn${tab.charAt(0).toUpperCase()+tab.slice(1)}`);
  if (activeBtn) activeBtn.classList.add('active');
  if (tab === 'orders') loadOrders();
}

// ===== SIDEBAR TOGGLE (MOBILE) =====
function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ===== LOAD PRODUCTS =====
async function loadProducts(query = '', category = '') {
  document.getElementById('loadingProducts').style.display = 'block';
  document.getElementById('productGrid').innerHTML = '';
  document.getElementById('noProducts').classList.add('hidden');
  try {
    const res = await fetch(`${API}/api/farmer/products?query=${encodeURIComponent(query)}`, { credentials: 'include' });
    allProducts = await res.json();
    if (category) allProducts = allProducts.filter(p => p.category === category);
    renderProducts(allProducts);
    renderCategories();
  } catch (e) {
    document.getElementById('productGrid').innerHTML = '<p style="color:red;padding:20px">Error loading products. Is server running?</p>';
  }
  document.getElementById('loadingProducts').style.display = 'none';
}

function renderCategories() {
  const cats = ['All', ...new Set(allProducts.map(p => p.category).filter(Boolean))];
  const ul = document.getElementById('categoryList');
  ul.innerHTML = '';
  cats.forEach(cat => {
    const li = document.createElement('li');
    li.textContent = cat;
    if (cat === 'All') li.classList.add('active');
    li.addEventListener('click', () => {
      document.querySelectorAll('#categoryList li').forEach(x => x.classList.remove('active'));
      li.classList.add('active');
      document.getElementById('selectedCategoryTitle').textContent = cat === 'All' ? 'All Products' : cat;
      const filtered = cat === 'All' ? allProducts : allProducts.filter(p => p.category === cat);
      renderProducts(filtered);
    });
    ul.appendChild(li);
  });
}

function renderProducts(products) {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  if (!products || products.length === 0) {
    document.getElementById('noProducts').classList.remove('hidden');
    return;
  }
  document.getElementById('noProducts').classList.add('hidden');
  products.forEach(p => {
    const imgSrc = p.photos && p.photos.length > 0 ? `${API}/uploads/${p.photos[0]}` : 'https://via.placeholder.com/200x150?text=No+Image';
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <img src="${imgSrc}" alt="${p.product}" onerror="this.src='https://via.placeholder.com/200x150?text=No+Image'">
      <div class="card-body">
        <h3>${p.product}</h3>
        <div class="price">₹${p.price}/kg</div>
        <div class="seller-info">🏪 ${p.sellerName || 'Farmer'}</div>
        <div class="min-qty">Min order: ${p.minOrderQty} kg</div>
        <div class="card-actions">
          <button class="btn-order" onclick='openOrderModal(${JSON.stringify(p)})'>Buy Now</button>
          <button class="btn-chat" onclick='startChat("${p._id}", "${p.sellerName || 'Seller'}")'>💬 Chat</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
}

// ===== SEARCH =====
function searchProducts() {
  const q = document.getElementById('searchInput').value.trim();
  loadProducts(q);
  document.getElementById('selectedCategoryTitle').textContent = q ? `Results for "${q}"` : 'All Products';
}
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') searchProducts();
  });
});

// ===== FILTERS =====
function applyFilters() {
  let filtered = [...allProducts];
  const maxPrice = parseFloat(document.getElementById('maxPrice').value);
  const sortBy = document.getElementById('sortBy').value;
  if (!isNaN(maxPrice) && maxPrice > 0) filtered = filtered.filter(p => parseFloat(p.price) <= maxPrice);
  if (sortBy === 'price-asc') filtered.sort((a,b) => parseFloat(a.price) - parseFloat(b.price));
  else if (sortBy === 'price-desc') filtered.sort((a,b) => parseFloat(b.price) - parseFloat(a.price));
  else if (sortBy === 'newest') filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  renderProducts(filtered);
}
function clearFilters() {
  document.getElementById('maxPrice').value = '';
  document.getElementById('sortBy').value = '';
  renderProducts(allProducts);
}

// ===== ORDER MODAL =====
function openOrderModal(product) {
  currentProductForOrder = product;
  document.getElementById('orderProductInfo').innerHTML = `
    <strong>${product.product}</strong> (${product.category})<br>
    Price: ₹${product.price}/kg | Min Qty: ${product.minOrderQty} kg<br>
    Seller: ${product.sellerName || 'Farmer'}`;
  document.getElementById('orderQty').value = product.minOrderQty || 1;
  document.getElementById('orderQty').min = product.minOrderQty || 1;
  document.getElementById('orderAddress').value = '';
  updateOrderTotal();
  document.getElementById('orderModal').style.display = 'flex';
}
document.getElementById('orderQty').addEventListener('input', updateOrderTotal);
function updateOrderTotal() {
  if (!currentProductForOrder) return;
  const qty = parseInt(document.getElementById('orderQty').value) || 0;
  const price = parseFloat(currentProductForOrder.price) || 0;
  document.getElementById('orderTotal').textContent = `Total: ₹${(qty * price).toFixed(2)}`;
}
function closeOrderModal() { document.getElementById('orderModal').style.display = 'none'; }

async function submitOrder() {
  const qty = parseInt(document.getElementById('orderQty').value);
  const address = document.getElementById('orderAddress').value.trim();
  if (!qty || qty < 1) return alert('Please enter a valid quantity');
  if (!address) return alert('Please enter your delivery address');
  try {
    const res = await fetch(`${API}/api/orders/place`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId: currentProductForOrder._id, quantity: qty, deliveryAddress: address })
    });
    const data = await res.json();
    if (res.ok) {
      alert('✅ Order placed successfully!');
      closeOrderModal();
      showTab('orders');
    } else { alert('❌ ' + data.message); }
  } catch { alert('Error placing order. Try again.'); }
}

// ===== LOAD ORDERS =====
async function loadOrders() {
  document.getElementById('loadingOrders').style.display = 'block';
  document.getElementById('ordersList').innerHTML = '';
  document.getElementById('noOrders').classList.add('hidden');
  try {
    const res = await fetch(`${API}/api/orders/my-orders`, { credentials: 'include' });
    const orders = await res.json();
    document.getElementById('loadingOrders').style.display = 'none';
    if (!orders.length) { document.getElementById('noOrders').classList.remove('hidden'); return; }
    const statuses = ['Placed','Confirmed','Packed','Shipped','Out for Delivery','Delivered'];
    orders.forEach(o => {
      const currIdx = statuses.indexOf(o.status);
      const timeline = statuses.map((s, i) => `
        <div class="timeline-step ${i <= currIdx ? 'done' : ''}">
          <div class="timeline-dot"></div><span>${s}</span>
        </div>`).join('');
      const card = document.createElement('div');
      card.className = 'order-card';
      card.innerHTML = `
        <div class="order-card-header">
          <h3>📦 ${o.productName}</h3>
          <span class="status-badge status-${o.status.replace(/ /g,'-')}">${o.status}</span>
        </div>
        <div class="order-details">
          Qty: ${o.quantity} kg | Amount: ₹${o.totalAmount || '--'}<br>
          Address: ${o.deliveryAddress}<br>
          Ordered: ${new Date(o.createdAt).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}
        </div>
        <div class="order-timeline">${timeline}</div>`;
      document.getElementById('ordersList').appendChild(card);
    });
  } catch { document.getElementById('loadingOrders').style.display = 'none'; }
}

// ===== CHAT =====
function startChat(productId, sellerName) {
  currentRoomId = `room_${productId}`;
  document.getElementById('chatTitle').textContent = `Chat with ${sellerName}`;
  document.getElementById('chatMessages').innerHTML = '';
  document.getElementById('chatArea').classList.remove('hidden');
  showTab('chat');
  socket.emit('join-room', currentRoomId);
  socket.off('chat-history');
  socket.off('receive-message');
  socket.on('chat-history', (msgs) => {
    msgs.forEach(addChatMessage);
    scrollChat();
  });
  socket.on('receive-message', (msg) => {
    addChatMessage(msg);
    scrollChat();
  });
}
function addChatMessage(msg) {
  const div = document.createElement('div');
  const isMine = msg.sender === currentUser;
  div.className = `chat-msg ${isMine ? 'mine' : 'theirs'}`;
  div.innerHTML = `<div>${msg.message}</div><div class="msg-meta">${msg.senderName || 'User'} · ${new Date(msg.time).toLocaleTimeString('en-IN', {hour:'2-digit',minute:'2-digit'})}</div>`;
  document.getElementById('chatMessages').appendChild(div);
}
function scrollChat() {
  const el = document.getElementById('chatMessages');
  el.scrollTop = el.scrollHeight;
}
function sendChatMsg() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg || !currentRoomId) return;
  socket.emit('send-message', { roomId: currentRoomId, message: msg, sender: currentUser, senderName: 'Buyer' });
  input.value = '';
}
document.getElementById('chatInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') sendChatMsg();
});
function closeChat() { document.getElementById('chatArea').classList.add('hidden'); }

// ===== LOGOUT =====
async function logout() {
  await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' });
  window.location.href = 'login.html';
}
