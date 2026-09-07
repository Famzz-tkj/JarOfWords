/* ---------------------------------------------
   Small Wins Jar — shared logic
   --------------------------------------------- */

const COLORS = [
  { name: 'orange', hex: '#d97b45' },
  { name: 'blue',   hex: '#4f7fa0' },
  { name: 'pink',   hex: '#cf7d92' },
  { name: 'green',  hex: '#7c8c5a' },
  { name: 'gold',   hex: '#c79a3a' },
  { name: 'red',    hex: '#b5533f' },
];

const STORAGE_USERS = 'swj_users';
const STORAGE_CURRENT = 'swj_current';
const STORAGE_WINS_PREFIX = 'swj_wins_';

/* ---------- storage helpers ---------- */

function getUsers() {
  try { return JSON.parse(localStorage.getItem(STORAGE_USERS)) || []; }
  catch (e) { return []; }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
}

function addUser(name) {
  const users = getUsers();
  if (!users.includes(name)) {
    users.push(name);
    saveUsers(users);
  }
}

function getCurrentUser() {
  return localStorage.getItem(STORAGE_CURRENT) || '';
}

function setCurrentUser(name) {
  localStorage.setItem(STORAGE_CURRENT, name);
  addUser(name);
}

function winsKey(name) {
  return STORAGE_WINS_PREFIX + name;
}

function getWins(name) {
  try { return JSON.parse(localStorage.getItem(winsKey(name))) || []; }
  catch (e) { return []; }
}

function saveWins(name, wins) {
  localStorage.setItem(winsKey(name), JSON.stringify(wins));
}

/* ---------- win creation ---------- */

function randomColor(avoidHex) {
  let pool = COLORS;
  if (avoidHex) pool = COLORS.filter(c => c.hex !== avoidHex);
  return pool[Math.floor(Math.random() * pool.length)];
}

function seededRand(seed) {
  // simple deterministic pseudo-random from a numeric/string seed
  let x = 0;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) x = (x * 31 + s.charCodeAt(i)) >>> 0;
  x = (x * 9301 + 49297) % 233280;
  return x / 233280;
}

function makeWin(text, lastColorHex) {
  const color = randomColor(lastColorHex);
  const id = Date.now() + '-' + Math.floor(Math.random() * 10000);
  return {
    id,
    text: text.trim(),
    color: color.hex,
    date: new Date().toISOString(),
  };
}

function formatDate(iso) {
  const d = new Date(iso);
  const opts = { month: 'long', day: 'numeric' };
  const now = new Date();
  if (d.getFullYear() !== now.getFullYear()) opts.year = 'numeric';
  return d.toLocaleDateString('en-US', opts);
}

/* ---------- SVG assets ---------- */

function starSVG(hex) {
  return `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2 C21 12 22 18 32 19 C22 20 21 26 20 38 C19 26 18 20 8 19 C18 18 19 12 20 2 Z"
      fill="${hex}" stroke="${hex}" stroke-width="1" stroke-linejoin="round"/>
  </svg>`;
}

function jarSVG() {
  return `<svg class="jar-svg" viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg">
    <path d="M74 8 C73 7 72 10 72 14 L70 34 C50 40 34 54 32 76 L28 208 C27 222 40 236 60 238
             L140 238 C160 236 173 222 172 208 L168 76 C166 54 150 40 130 34 L128 14
             C128 10 127 7 126 8"
      fill="rgba(207,231,238,0.18)" stroke="#8fb4c8" stroke-width="3.5"
      stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M72 34 C90 30 110 30 128 34" fill="none" stroke="#8fb4c8"
      stroke-width="3" stroke-linecap="round"/>
    <path d="M46 90 L44 190" stroke="#bcd8e2" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
  </svg>`;
}

function sparkleSVG(hex, size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2 C21 12 22 18 32 19 C22 20 21 26 20 38 C19 26 18 20 8 19 C18 18 19 12 20 2 Z" fill="${hex}"/>
  </svg>`;
}

function squiggleSVG(hex, w) {
  return `<svg width="${w}" height="24" viewBox="0 0 100 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 12 C 16 2, 26 22, 40 12 S 64 2, 78 12 S 96 20 98 12" fill="none"
      stroke="${hex}" stroke-width="4" stroke-linecap="round"/>
  </svg>`;
}

const DOODLES = [
  { type: 'sparkle', color: '#e3a6b4', size: 20, top: '2%',  left: '4%'  },
  { type: 'sparkle', color: '#6f9db8', size: 20, top: '0%',  right: '6%' },
  { type: 'squiggle', color: '#8fb4c8', w: 80, top: '18%', left: '-6%' },
  { type: 'squiggle', color: '#e3a6b4', w: 70, top: '16%', right: '-8%' },
  { type: 'sparkle', color: '#a3ab6f', size: 14, top: '36%', left: '10%' },
  { type: 'sparkle', color: '#d98a4c', size: 16, top: '34%', right: '10%' },
  { type: 'squiggle', color: '#b79a58', w: 70, top: '52%', left: '-8%' },
  { type: 'squiggle', color: '#8fae86', w: 70, top: '58%', right: '-10%' },
  { type: 'squiggle', color: '#a3ab6f', w: 90, top: '72%', left: '-4%' },
  { type: 'squiggle', color: '#d98a4c', w: 90, top: '76%', right: '-6%' },
];

function renderDoodles(container) {
  container.innerHTML = DOODLES.map(d => {
    const posStyle = [
      `position:absolute`,
      `top:${d.top}`,
      d.left !== undefined ? `left:${d.left}` : `right:${d.right}`,
      `opacity:0.85`,
    ].join(';');
    const svg = d.type === 'sparkle' ? sparkleSVG(d.color, d.size) : squiggleSVG(d.color, d.w);
    return `<div style="${posStyle}">${svg}</div>`;
  }).join('');
}

/* ---------- star layout (deterministic jitter) ---------- */

function starPosition(win, index) {
  // spread stars along the bottom "pool" area of the jar, wrapping into rows
  const cols = 5;
  const col = index % cols;
  const row = Math.floor(index / cols);
  const jitterX = (seededRand(win.id + 'x') - 0.5) * 10;
  const jitterY = (seededRand(win.id + 'y') - 0.5) * 8;
  const baseX = 28 + col * 11; // percent across jar width, roughly 28%-72%
  const baseY = 86 - row * 11; // percent down jar height, stacking upward
  return {
    left: Math.min(78, Math.max(22, baseX + jitterX)) + '%',
    top: Math.max(45, baseY + jitterY) + '%',
  };
}

/* ---------- share encoding ---------- */

function toBase64Url(str) {
  const b64 = btoa(unescape(encodeURIComponent(str)));
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(b64url) {
  let b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return decodeURIComponent(escape(atob(b64)));
}

function encodeShareData(name, wins) {
  const payload = {
    n: name,
    w: wins.map(w => ({ t: w.text, c: w.color, d: w.date })),
  };
  return toBase64Url(JSON.stringify(payload));
}

function decodeShareData(encoded) {
  const payload = JSON.parse(fromBase64Url(encoded));
  const wins = payload.w.map((w, i) => ({
    id: 'shared-' + i + '-' + w.d,
    text: w.t,
    color: w.c,
    date: w.d,
  }));
  return { name: payload.n, wins };
}

function getShareParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get('jar');
}

function buildShareUrl(name, wins) {
  const encoded = encodeShareData(name, wins);
  const base = window.location.origin + window.location.pathname.replace(/log\.html$/, 'index.html');
  return base + '?jar=' + encoded;
}

async function shareLink(url, title, text) {
  if (navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return { method: 'share' };
    } catch (e) {
      // user cancelled or share failed — fall through to copy
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return { method: 'copy' };
  } catch (e) {
    return { method: 'manual' };
  }
}
