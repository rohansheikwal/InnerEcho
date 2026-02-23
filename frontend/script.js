/* InnerEcho - frontend/script.js */

const API = '';

/* Emoji constants using codepoints - encoding-safe */
const E = {
  eye:    String.fromCodePoint(0x1F441),
  seeNo:  String.fromCodePoint(0x1F648),
  user:   String.fromCodePoint(0x1F464),
  like:   String.fromCodePoint(0x1F44D),
  love:   String.fromCodePoint(0x2764) + String.fromCodePoint(0xFE0F),
  laugh:  String.fromCodePoint(0x1F602),
  clock:  String.fromCodePoint(0x1F550),
  party:  String.fromCodePoint(0x1F389),
  pencil: String.fromCodePoint(0x270F) + String.fromCodePoint(0xFE0F),
  trash:  String.fromCodePoint(0x1F5D1) + String.fromCodePoint(0xFE0F),
  check:  String.fromCodePoint(0x2705),
  key:    String.fromCodePoint(0x1F511),
  sun:    String.fromCodePoint(0x2600) + String.fromCodePoint(0xFE0F),
  moon:   String.fromCodePoint(0x1F319),
  fire:   String.fromCodePoint(0x1F525),
  cal:    String.fromCodePoint(0x1F4C5),
};

/* LOCAL-STORAGE HELPERS */
const REACTIONS_KEY = 'ie_reactions';
function reactionsKey() {
  return currentUser ? REACTIONS_KEY + '_' + currentUser.id : REACTIONS_KEY + '_guest';
}
function getReactions() {
  try { return JSON.parse(localStorage.getItem(reactionsKey())) || {}; }
  catch { return {}; }
}
function saveReaction(id, type) {
  const r = getReactions();
  r[id] = type;
  localStorage.setItem(reactionsKey(), JSON.stringify(r));
}
function removeReaction(id) {
  const r = getReactions();
  delete r[id];
  localStorage.setItem(reactionsKey(), JSON.stringify(r));
}
function myReaction(id) { return getReactions()[id] || null; }

/* THEME */
const THEME_KEY = 'ie_theme';
function initTheme() {
  if (localStorage.getItem(THEME_KEY) === 'light') document.body.classList.add('light');
  updateThemeBtn();
}
function toggleTheme() {
  document.body.classList.toggle('light');
  localStorage.setItem(THEME_KEY, document.body.classList.contains('light') ? 'light' : 'dark');
  updateThemeBtn();
}
function updateThemeBtn() {
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = document.body.classList.contains('light') ? E.moon + ' Dark' : E.sun + ' Light';
}

/* TOAST */
function showToast(msg, type) {
  const area = document.getElementById('toastArea');
  const el   = document.createElement('div');
  el.className   = 'toast ' + (type || 'success');
  el.textContent = msg;
  area.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

/* CONFETTI */
function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx    = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors = ['#c9748a','#e8a98c','#b56060','#d4936c','#f4d0c0','#e8c4c4','#fddde6','#d4a3a3'];
  const pieces = Array.from({ length: 120 }, () => ({
    x:    Math.random() * canvas.width,
    y:    -20 - Math.random() * 200,
    w:    Math.random() * 10 + 5,
    h:    Math.random() * 5  + 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    vx:   (Math.random() - 0.5) * 5,
    vy:   Math.random() * 4 + 1,
    rot:  Math.random() * 360,
    vrot: (Math.random() - 0.5) * 8,
    alpha: 1,
  }));
  let tick = 0, frame;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot * Math.PI / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
      p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.rot += p.vrot;
      if (tick > 80) p.alpha -= 0.015;
    });
    tick++;
    if (tick < 140) frame = requestAnimationFrame(draw);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  cancelAnimationFrame(frame);
  draw();
}

/* SORT */
let currentSort = 'newest';
function setSort(s) {
  currentSort = s;
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('sort-' + s).classList.add('active');
  renderConfessions(allConfessions);
}
function getSorted(data) {
  const d = [...data];
  if (currentSort === 'oldest')  return d.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
  if (currentSort === 'reacted') return d.sort((a,b) =>
    (b.reactions.like+b.reactions.love+b.reactions.laugh) - (a.reactions.like+a.reactions.love+a.reactions.laugh));
  return d.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
}
function toggleVisibility(inputId, btn) {
  const el = document.getElementById(inputId);
  if (el.type === 'password') { el.type = 'text'; btn.textContent = E.seeNo; }
  else { el.type = 'password'; btn.textContent = E.eye; }
}

/* CHAR COUNT */
function updateCount() {
  const len  = (document.getElementById('confessionText').value || '').length;
  const span = document.getElementById('charCount');
  span.textContent = len;
  const wrap = span.closest('.char-count');
  if (wrap) wrap.style.color = len > 4500 ? 'var(--error)' : len > 3500 ? 'var(--orange2)' : '';
}

/* PAGE SWITCHING */
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  if (page === 'feed') {
    document.getElementById('navFeedBtn').classList.add('active');
    document.getElementById('navSearchWrap').style.display = '';
    loadConfessions();
  } else {
    document.getElementById('navConfessBtn').classList.add('active');
    document.getElementById('navSearchWrap').style.display = 'none';
    syncConfessForm();
  }
}

/* AUTH */
let currentUser = null;
async function checkUser() {
  try {
    const res = await fetch(API + '/api/user');
    currentUser = await res.json();
    const greetingEl = document.getElementById('userGreeting');
    const loginBtn   = document.getElementById('loginBtn');
    const userArea   = document.getElementById('userArea');
    if (currentUser) {
      greetingEl.textContent = E.user + ' ' + (currentUser.displayName || 'Anonymous');
      loginBtn.classList.add('hide');
      userArea.classList.remove('hide');
    } else {
      loginBtn.classList.remove('hide');
      userArea.classList.add('hide');
    }
    syncConfessForm();
  } catch (e) { console.error('User check failed:', e); }
}

function syncConfessForm() {
  const banner = document.getElementById('loginBanner');
  const form   = document.getElementById('confessForm');
  if (!banner || !form) return;
  if (currentUser) { banner.classList.add('hide'); form.style.display = ''; }
  else { banner.classList.remove('hide'); form.style.display = 'none'; }
}

/* FORM FEEDBACK */
function showMsg(elId, text, type) {
  type = type || 'success';
  const el = document.getElementById(elId);
  if (!el) return;
  el.textContent = text;
  el.className = 'form-msg ' + type;
  setTimeout(() => { el.textContent = ''; el.className = 'form-msg'; }, 3500);
}

/* CONFESSIONS */
let allConfessions = [];

async function loadConfessions() {
  const container = document.getElementById('confessionList');
  container.innerHTML = '<div class="loading">Loading confessions...</div>';
  try {
    const res = await fetch(API + '/confessions');
    allConfessions = await res.json();
    renderConfessions(allConfessions);
  } catch {
    container.innerHTML = '<div class="loading" style="color:var(--error)">Failed to load confessions.</div>';
  }
}

function renderConfessions(data) {
  const container = document.getElementById('confessionList');
  const countEl   = document.getElementById('confessionCount');
  const sorted    = getSorted(data);
  countEl.textContent = sorted.length + ' confession' + (sorted.length !== 1 ? 's' : '');
  if (!sorted.length) {
    container.innerHTML = renderEmpty();
    return;
  }
  container.innerHTML = '';
  sorted.forEach(c => container.appendChild(buildCard(c)));
}

function renderEmpty() {
  return '<div class="empty-state">' +
    '<svg width="110" height="110" viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="55" cy="55" r="50" fill="rgba(201,116,138,0.12)" stroke="rgba(201,116,138,0.35)" stroke-width="2"/>' +
    '<ellipse cx="40" cy="50" rx="6" ry="7" fill="rgba(250,230,225,0.55)"/>' +
    '<ellipse cx="70" cy="50" rx="6" ry="7" fill="rgba(250,230,225,0.55)"/>' +
    '<path d="M38 72 Q55 60 72 72" stroke="rgba(250,230,225,0.55)" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<path d="M28 34 Q55 20 82 34" stroke="rgba(201,116,138,0.4)" stroke-width="2" fill="none" stroke-linecap="round" stroke-dasharray="5,4"/>' +
    '</svg>' +
    '<h3>No confessions yet</h3>' +
    '<p>Be the first to share something.<br>Your secret is safe here. ' + E.party + '</p>' +
    '</div>';
}

/* SEARCH */
function filterConfessions() {
  const q = (document.getElementById('searchInput').value || '').toLowerCase().trim();
  if (!q) return renderConfessions(allConfessions);
  renderConfessions(allConfessions.filter(c => c.text.toLowerCase().includes(q)));
}

/* BUILD CARD */
function buildCard(c) {
  const mine    = myReaction(c._id);
  const reacted = !!mine;
  const div = document.createElement('div');
  div.className = 'confession-card';
  div.id = 'card-' + c._id;

  const reactions = [
    { type: 'like',  emoji: E.like  },
    { type: 'love',  emoji: E.love  },
    { type: 'laugh', emoji: E.laugh },
  ];

  const reactionHTML = reactions.map(r => {
    const isThisOne  = mine === r.type;
    const isDisabled = reacted && !isThisOne;
    const cls = 'react-btn' + (isThisOne ? ' reacted' : '') + (isDisabled ? ' disabled' : '');
    const dis = isDisabled ? ' disabled' : '';
    const ttl = isDisabled ? 'You already reacted' : 'React with ' + r.type;
    return '<button class="' + cls + '"' +
      ' onclick="react(\'' + c._id + '\', \'' + r.type + '\')"' +
      dis +
      ' title="' + ttl + '">' +
      r.emoji + ' <span>' + c.reactions[r.type] + '</span></button>';
  }).join('');

  div.innerHTML =
    '<p class="confession-text">' + escapeHTML(c.text) + '</p>' +
    '<p class="confession-meta">' + E.clock + ' ' + formatDate(c.createdAt) + '</p>' +
    '<div class="reactions-row">' + reactionHTML + '</div>' +
    '<div class="actions-row">' +
      '<button class="btn-action" onclick="openEditModal(\'' + c._id + '\')">' + E.pencil + ' Edit</button>' +
      '<button class="btn-action danger" onclick="openDeleteModal(\'' + c._id + '\')">' + E.trash + ' Delete</button>' +
    '</div>';
  return div;
}

/* SUBMIT */
async function submitConfession() {
  const text       = document.getElementById('confessionText').value.trim();
  const secretCode = document.getElementById('secretCode').value;
  if (!text) return showMsg('formMsg', 'Confession cannot be empty.', 'error');
  if (text.length > 5000) return showMsg('formMsg', 'Confession exceeds 5000 characters.', 'error');
  if (!secretCode || secretCode.length < 4) return showMsg('formMsg', 'Secret code must be at least 4 characters.', 'error');
  try {
    const res  = await fetch(API + '/confessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, secretCode })
    });
    const data = await res.json();
    if (data.error) { showMsg('formMsg', data.error, 'error'); }
    else {
      launchConfetti();
      showToast(E.check + ' Confession posted!', 'success');
      document.getElementById('confessionText').value = '';
      document.getElementById('secretCode').value = '';
      document.getElementById('charCount').textContent = '0';
      setTimeout(() => showPage('feed'), 1400);
    }
  } catch { showMsg('formMsg', 'Network error. Try again.', 'error'); }
}

/* REACT */
async function react(id, type) {
  const existing = myReaction(id);
  if (existing === type) {
    try {
      const res  = await fetch(API + '/confessions/' + id + '/react', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (!data.error) { removeReaction(id); updateCardReactions(id, data.reactions); }
    } catch { console.error('Unreact failed'); }
  } else if (!existing) {
    try {
      const res  = await fetch(API + '/confessions/' + id + '/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (!data.error) { saveReaction(id, type); updateCardReactions(id, data.reactions); }
    } catch { console.error('Reaction failed'); }
  }
}

function updateCardReactions(id, reactions) {
  const conf = allConfessions.find(c => c._id === id);
  if (conf) conf.reactions = reactions;
  const card = document.getElementById('card-' + id);
  if (!card) return;
  const mine    = myReaction(id);
  const reacted = !!mine;
  const types   = [
    { type: 'like',  emoji: E.like  },
    { type: 'love',  emoji: E.love  },
    { type: 'laugh', emoji: E.laugh },
  ];
  const row = card.querySelector('.reactions-row');
  if (!row) return;
  row.innerHTML = types.map(r => {
    const isThisOne  = mine === r.type;
    const isDisabled = reacted && !isThisOne;
    const cls = 'react-btn' + (isThisOne ? ' reacted' : '') + (isDisabled ? ' disabled' : '');
    const dis = isDisabled ? ' disabled' : '';
    const ttl = isDisabled ? 'You already reacted' : 'React with ' + r.type;
    return '<button class="' + cls + '" onclick="react(\'' + id + '\', \'' + r.type + '\')"' +
      dis + ' title="' + ttl + '">' + r.emoji + ' <span>' + reactions[r.type] + '</span></button>';
  }).join('');
  const active = row.querySelector('.react-btn.reacted span');
  if (active) {
    void active.offsetWidth;
    active.classList.add('pop');
    setTimeout(() => active.classList.remove('pop'), 300);
  }
}

/* MODAL */
let ownerModeActive = false;

function activateOwnerMode() {
  ownerModeActive = true;
  document.getElementById('modalCodeGroup').style.display = 'none';
  document.getElementById('ownerBypassWrap').innerHTML =
    '<span style="color:var(--success)">' + E.check + ' Using your Google account for verification</span>';
}

function openModal(opts) {
  ownerModeActive = false;
  document.getElementById('modalTitle').textContent    = opts.title;
  document.getElementById('modalSubtitle').textContent = opts.subtitle || '';
  document.getElementById('modalCode').value           = '';
  document.getElementById('modalMsg').textContent      = '';
  document.getElementById('modalMsg').className        = 'form-msg';
  document.getElementById('modalCodeGroup').style.display = '';
  const wrap = document.getElementById('modalNewTextWrap');
  wrap.style.display = opts.showNewText ? '' : 'none';
  if (opts.showNewText) document.getElementById('modalNewText').value = opts.initialText || '';
  const btn = document.getElementById('modalConfirmBtn');
  btn.textContent = opts.confirmLabel || 'Confirm';
  btn.onclick     = opts.onConfirm;
  const bypassWrap = document.getElementById('ownerBypassWrap');
  if (opts.isOwner) {
    bypassWrap.classList.remove('hide');
    bypassWrap.innerHTML =
      '<span>This is your confession — forgot your code?</span>' +
      '<button type="button" class="bypass-btn" onclick="activateOwnerMode()">Use Google account instead</button>';
  } else {
    bypassWrap.classList.add('hide');
    bypassWrap.innerHTML = '';
  }
  document.getElementById('modal').classList.add('open');
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modal')) return;
  document.getElementById('modal').classList.remove('open');
}

function openEditModal(id) {
  const confession = allConfessions.find(c => c._id === id);
  const isOwner    = !!(currentUser && confession && confession.userId === currentUser.id);
  openModal({
    title: E.pencil + ' Edit Confession',
    subtitle: 'Edit your confession and enter your secret code.',
    showNewText: true,
    initialText: confession ? confession.text : '',
    confirmLabel: 'Save Changes',
    isOwner,
    onConfirm: () => confirmEdit(id)
  });
}

function openDeleteModal(id) {
  const confession = allConfessions.find(c => c._id === id);
  const isOwner    = !!(currentUser && confession && confession.userId === currentUser.id);
  openModal({
    title: E.trash + ' Delete Confession',
    subtitle: 'Enter your secret code to permanently delete.',
    showNewText: false,
    confirmLabel: 'Delete',
    isOwner,
    onConfirm: () => confirmDelete(id)
  });
}

async function confirmEdit(id) {
  const newText = document.getElementById('modalNewText').value.trim();
  const code    = document.getElementById('modalCode').value;
  if (!newText) return showMsg('modalMsg', 'New text cannot be empty.', 'error');
  if (!ownerModeActive && !code) return showMsg('modalMsg', 'Please enter your secret code.', 'error');
  try {
    const res  = await fetch(API + '/confessions/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newText, secretCode: code, ownerAuth: ownerModeActive })
    });
    const data = await res.json();
    if (data.error) showMsg('modalMsg', data.error, 'error');
    else {
      document.getElementById('modal').classList.remove('open');
      showToast(E.check + ' Confession updated!', 'success');
      loadConfessions();
    }
  } catch { showMsg('modalMsg', 'Network error.', 'error'); }
}

async function confirmDelete(id) {
  const code = document.getElementById('modalCode').value;
  if (!ownerModeActive && !code) return showMsg('modalMsg', 'Please enter your secret code.', 'error');
  try {
    const res  = await fetch(API + '/confessions/' + id, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secretCode: code, ownerAuth: ownerModeActive })
    });
    const data = await res.json();
    if (data.error) showMsg('modalMsg', data.error, 'error');
    else {
      document.getElementById('modal').classList.remove('open');
      showToast(E.trash + ' Confession deleted.', 'info');
      loadConfessions();
    }
  } catch { showMsg('modalMsg', 'Network error.', 'error'); }
}

/* UTILS */
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function formatDate(iso) {
  const d = new Date(iso), diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
  return d.toLocaleDateString();
}

/* QUOTE ROTATOR */
const QUOTES = [
  'The truth will set you free, but first it will make you uncomfortable.',
  'Confession is not weakness. It is the courage to be honest with yourself.',
  'We are only as sick as our secrets.',
  'Everyone you meet is carrying something heavy you know nothing about.',
  'Letting go of what weighs you down is the beginning of flying.',
  'Secrets are like splinters — the longer they stay in, the more they hurt.',
  'You don\'t heal by staying silent. You heal by finally saying it.',
  'There is a kind of freedom in being completely honest, even just once.',
  'Sometimes the bravest thing you can say is the thing you\'ve never said.',
  'Your words matter. Someone out there needs to read exactly what you\'re feeling.',
];
let quoteIdx = 0;
function startQuoteRotator() {
  const el = document.getElementById('confessQuote');
  if (!el) return;
  el.textContent = QUOTES[quoteIdx];
  setInterval(() => {
    el.style.opacity = '0';
    setTimeout(() => {
      quoteIdx = (quoteIdx + 1) % QUOTES.length;
      el.textContent = QUOTES[quoteIdx];
      el.style.opacity = '1';
    }, 500);
  }, 5000);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') document.getElementById('modal').classList.remove('open');
});

checkUser();
showPage('feed');
initTheme();
startQuoteRotator();
