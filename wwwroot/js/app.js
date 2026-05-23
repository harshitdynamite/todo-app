/* ── State ──────────────────────────────────────────────────────── */
let todos = [];
let filterStatus   = 'all';
let filterPriority = 'all';
let editingId      = null;

const PRIORITY_LABELS = { 4: 'Critical', 3: 'High', 2: 'Medium', 1: 'Low' };
const PRIORITY_CLASSES = { 4: 'critical', 3: 'high', 2: 'medium', 1: 'low' };
const STATUS_LABELS = { 0: 'To Do', 1: 'In Progress', 2: 'Done' };

/* ── API helpers ────────────────────────────────────────────────── */
const api = {
  async get(path)           { const r = await fetch(path); return r.json(); },
  async post(path, body)    { const r = await fetch(path, { method: 'POST',   headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) }); return r.json(); },
  async put(path, body)     { const r = await fetch(path, { method: 'PUT',    headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) }); return r.json(); },
  async patch(path, body)   { const r = await fetch(path, { method: 'PATCH',  headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) }); return r.json(); },
  async delete(path)        { await fetch(path, { method: 'DELETE' }); }
};

/* ── Load ───────────────────────────────────────────────────────── */
async function loadTodos() {
  todos = await api.get('/api/todos');
  renderBoard();
}

/* ── Render ─────────────────────────────────────────────────────── */
function renderBoard() {
  const board = document.getElementById('board');
  const empty = document.getElementById('empty-state');

  let filtered = todos.filter(t => {
    const statusOk   = filterStatus   === 'all' || t.status   === parseInt(filterStatus);
    const priorityOk = filterPriority === 'all' || t.priority === parseInt(filterPriority);
    return statusOk && priorityOk;
  });

  // Remove existing cards (keep empty state element)
  board.querySelectorAll('.todo-card').forEach(el => el.remove());

  if (filtered.length === 0) {
    empty.style.display = 'flex';
  } else {
    empty.style.display = 'none';
    filtered.forEach(todo => {
      board.appendChild(buildCard(todo));
    });
  }

  updateStats();
}

function buildCard(todo) {
  const card = document.createElement('div');
  card.className = 'todo-card';
  card.dataset.id       = todo.id;
  card.dataset.priority = todo.priority;
  card.dataset.status   = todo.status;

  const pClass = PRIORITY_CLASSES[todo.priority] || 'medium';
  const pLabel = PRIORITY_LABELS[todo.priority]  || 'Medium';
  const sLabel = STATUS_LABELS[todo.status]       || 'To Do';
  const date   = new Date(todo.createdAt).toLocaleDateString('en-GB', { day:'numeric', month:'short' });

  card.innerHTML = `
    <div class="card-top">
      <div class="card-badges">
        <span class="badge badge--${pClass}">${pLabel}</span>
        <span class="badge badge--status">${sLabel}</span>
      </div>
      <div class="card-actions">
        <button class="card-btn card-btn--edit" title="Edit" onclick="openEdit('${todo.id}')">✎</button>
        <button class="card-btn card-btn--delete" title="Delete" onclick="deleteTodo('${todo.id}')">✕</button>
      </div>
    </div>
    <div class="card-title">${escHtml(todo.title)}</div>
    ${todo.description ? `<div class="card-desc">${escHtml(todo.description)}</div>` : ''}
    <div class="card-footer">
      <span class="card-date">${date}</span>
      <select class="status-select" onchange="changeStatus('${todo.id}', this.value)">
        <option value="0" ${todo.status === 0 ? 'selected' : ''}>To Do</option>
        <option value="1" ${todo.status === 1 ? 'selected' : ''}>In Progress</option>
        <option value="2" ${todo.status === 2 ? 'selected' : ''}>Done</option>
      </select>
    </div>
  `;

  return card;
}

function updateStats() {
  const total = todos.length;
  const done  = todos.filter(t => t.status === 2).length;
  document.querySelector('#stat-total .stat-num').textContent = total;
  document.querySelector('#stat-done .stat-num').textContent  = done;
}

/* ── Add ────────────────────────────────────────────────────────── */
document.getElementById('btn-add').addEventListener('click', async () => {
  const title    = document.getElementById('title').value.trim();
  const desc     = document.getElementById('description').value.trim();
  const priority = parseInt(document.getElementById('priority').value);
  const status   = parseInt(document.getElementById('status').value);

  if (!title) { shake(document.getElementById('title')); return; }

  const created = await api.post('/api/todos', { title, description: desc, priority, status });
  todos.unshift(created);

  // Re-sort by priority desc
  todos.sort((a, b) => b.priority - a.priority || new Date(a.createdAt) - new Date(b.createdAt));

  document.getElementById('title').value       = '';
  document.getElementById('description').value = '';

  renderBoard();
  toast('Task added');
});

/* ── Delete ─────────────────────────────────────────────────────── */
async function deleteTodo(id) {
  await api.delete(`/api/todos/${id}`);
  todos = todos.filter(t => t.id !== id);
  renderBoard();
  toast('Task deleted');
}

/* ── Status change (inline) ─────────────────────────────────────── */
async function changeStatus(id, statusValue) {
  const status = parseInt(statusValue);
  const updated = await api.patch(`/api/todos/${id}/status`, { status });
  const idx = todos.findIndex(t => t.id === id);
  if (idx !== -1) todos[idx] = updated;
  renderBoard();
}

/* ── Edit modal ─────────────────────────────────────────────────── */
function openEdit(id) {
  const todo = todos.find(t => t.id === id);
  if (!todo) return;
  editingId = id;

  document.getElementById('edit-title').value       = todo.title;
  document.getElementById('edit-description').value = todo.description;
  document.getElementById('edit-priority').value    = todo.priority;
  document.getElementById('edit-status').value      = todo.status;

  document.getElementById('modal-backdrop').classList.add('open');
}

function closeModal() {
  document.getElementById('modal-backdrop').classList.remove('open');
  editingId = null;
}

document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('btn-cancel').addEventListener('click', closeModal);
document.getElementById('modal-backdrop').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-backdrop')) closeModal();
});

document.getElementById('btn-save').addEventListener('click', async () => {
  if (!editingId) return;

  const title    = document.getElementById('edit-title').value.trim();
  const desc     = document.getElementById('edit-description').value.trim();
  const priority = parseInt(document.getElementById('edit-priority').value);
  const status   = parseInt(document.getElementById('edit-status').value);

  if (!title) { shake(document.getElementById('edit-title')); return; }

  const updated = await api.put(`/api/todos/${editingId}`, { title, description: desc, priority, status });
  const idx = todos.findIndex(t => t.id === editingId);
  if (idx !== -1) todos[idx] = updated;

  todos.sort((a, b) => b.priority - a.priority || new Date(a.createdAt) - new Date(b.createdAt));

  closeModal();
  renderBoard();
  toast('Task updated');
});

/* ── Filters ─────────────────────────────────────────────────────── */
function setupPillFilter(groupId, onChange) {
  document.getElementById(groupId).addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;

    document.getElementById(groupId)
      .querySelectorAll('.pill')
      .forEach(p => p.classList.remove('pill--active'));

    pill.classList.add('pill--active');
    onChange(pill.dataset.value);
  });
}

setupPillFilter('filter-status',   v => { filterStatus   = v; renderBoard(); });
setupPillFilter('filter-priority', v => { filterPriority = v; renderBoard(); });

/* ── Helpers ─────────────────────────────────────────────────────── */
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toast(msg) {
  document.querySelectorAll('.toast').forEach(el => el.remove());
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

function shake(el) {
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.3s ease';
  el.style.borderColor = 'var(--critical)';
  setTimeout(() => { el.style.borderColor = ''; el.style.animation = ''; }, 600);
}

// add shake keyframes dynamically
const style = document.createElement('style');
style.textContent = `@keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }`;
document.head.appendChild(style);

/* ── Enter key on title ─────────────────────────────────────────── */
document.getElementById('title').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('btn-add').click();
});

/* ── Init ────────────────────────────────────────────────────────── */
loadTodos();
