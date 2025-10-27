// ===== Read players from the starter data =====
const RAW =
  (window.players) ||
  (window.data && (window.data.players || window.data)) ||
  window.PLAYER_DATA ||
  window.PLAYER_STATS ||
  [];

// Fallback sample if data.js غير موجود محلياً
const FALLBACK = [
  { name:"LeBron James", team:"LAL", position:"F", points:25.7, assists:8.3, rebounds:7.3 },
  { name:"Stephen Curry", team:"GSW", position:"G", points:26.4, assists:5.1, rebounds:4.5 },
  { name:"Nikola Jokic", team:"DEN", position:"C", points:26.1, assists:9.0, rebounds:12.1 },
];
const BASE_SRC = Array.isArray(RAW) && RAW.length ? RAW : FALLBACK;

// ===== Normalize different key names to one shape =====
function normalize(p) {
  const name = p.name || p.player || p.full_name || `${p.first_name||''} ${p.last_name||''}`.trim();
  const team = p.team || p.team_abbr || p.teamName || p.team_name || '';
  const pos  = p.pos || p.position || '';
  const pts  = p.ppg || p.points || p.pts || Number(p.PTS) || 0;
  const ast  = p.apg || p.assists || Number(p.AST) || 0;
  const reb  = p.rpg || p.rebounds || Number(p.REB) || 0;
  return { name, team, pos, points: +pts, assists: +ast, rebounds: +reb };
}
const BASE = BASE_SRC.map(normalize);

// ===== DOM refs =====
const $  = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const searchInput = $('#searchInput');
const filterSelect = $('#filterSelect');
const darkToggle   = $('#darkToggle');
const tbody        = $('#tableBody');
const thead        = $('#tableHead');

// ===== State =====
let state = { q:'', filter:'all', sortKey:null, sortDir:'asc' };

// ===== Render =====
function renderTable(rows){
  tbody.innerHTML = '';
  const frag = document.createDocumentFragment();
  rows.forEach(p => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${p.name}</td>
      <td>${p.team || '-'}</td>
      <td><span class="badge">${p.pos || '-'}</span></td>
      <td>${p.points.toFixed(1)}</td>
      <td>${p.rebounds.toFixed(1)}</td>
      <td>${p.assists.toFixed(1)}</td>
    `;

    // مثال mouseover
    tr.addEventListener('mouseover', () => tr.style.background = 'var(--hover)');
    tr.addEventListener('mouseout',  () => tr.style.background = '');

    frag.appendChild(tr);
  });
  tbody.appendChild(frag);
}

function applyFilters(){
  const q = state.q.trim().toLowerCase();
  let rows = BASE.filter(p => {
    const matchesText = !q || p.name.toLowerCase().includes(q);
    const matchesPos  = state.filter === 'all' || p.pos === state.filter;
    return matchesText && matchesPos;
  });

  if (state.sortKey){
    const key = state.sortKey;
    const dir = state.sortDir === 'asc' ? 1 : -1;
    rows.sort((a,b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0) * dir);
  }

  // تحديث سهم الفرز
  $$('#tableHead th').forEach(th => th.classList.remove('sort-asc','sort-desc'));
  if (state.sortKey){
    const th = $(`#tableHead th[data-key="${state.sortKey}"]`);
    if (th) th.classList.add(state.sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
  }

  renderTable(rows);
}

// ===== Events =====
let tId;
searchInput.addEventListener('input', e => {
  clearTimeout(tId);
  tId = setTimeout(() => { state.q = e.target.value || ''; applyFilters(); }, 150);
});
filterSelect.addEventListener('change', e => { state.filter = e.target.value; applyFilters(); });

$('#tableHead').addEventListener('click', e => {
  const th = e.target.closest('th[data-key]');
  if (!th) return;
  const key = th.dataset.key;
  state.sortDir = (state.sortKey === key && state.sortDir === 'asc') ? 'desc' : 'asc';
  state.sortKey = key;
  applyFilters();
});

function setDark(on){
  document.body.classList.toggle('dark', on);
  darkToggle.setAttribute('aria-pressed', String(on));
  darkToggle.textContent = on ? '☀️ Light' : '🌙 Dark';
  try { localStorage.setItem('darkMode', on ? '1' : '0'); } catch {}
}
darkToggle.addEventListener('click', () => setDark(!document.body.classList.contains('dark')));
try { if (localStorage.getItem('darkMode') === '1') setDark(true); } catch {}

// ===== Init =====
applyFilters();
