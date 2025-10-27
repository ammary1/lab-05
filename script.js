// ======== Data hook ========
// يحاول يقرأ players من صيغ شائعة في الـ starter
const RAW = (window.players) || (window.data && window.data.players) || [];
// مثال fallback لو فتحت الملف لوحده بدون data.js:
const FALLBACK = [
  { name:"LeBron James", team:"LAL", pos:"F", ppg:25.7, apg:8.3, rpg:7.3 },
  { name:"Stephen Curry", team:"GSW", pos:"G", ppg:26.4, apg:5.1, rpg:4.5 },
  { name:"Nikola Jokić", team:"DEN", pos:"C", ppg:26.1, apg:9.0, rpg:12.1 },
  { name:"Jayson Tatum", team:"BOS", pos:"F", ppg:26.9, apg:4.4, rpg:8.1 },
  { name:"Shai Gilgeous-Alexander", team:"OKC", pos:"G", ppg:30.1, apg:6.2, rpg:5.5 }
];
const BASE = (Array.isArray(RAW) && RAW.length) ? RAW : FALLBACK;

// ======== Elements ========
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const searchInput = $('#searchInput');
const filterSelect = $('#filterSelect');
const darkToggle   = $('#darkToggle');
const tbody        = $('#tableBody');
const thead        = $('#tableHead');
const table        = $('#playersTable');

// ======== State ========
let state = {
  q: '',
  filter: 'all',
  sortKey: null,
  sortDir: 'asc' // or 'desc'
};

// ======== Render ========
function renderTable(rows){
  // بناء tbody ديناميكياً (DOM API)
  tbody.innerHTML = '';
  const frag = document.createDocumentFragment();

  rows.forEach(p => {
    const tr = document.createElement('tr');

    const tdName = document.createElement('td');
    tdName.textContent = p.name;

    const tdTeam = document.createElement('td');
    tdTeam.textContent = p.team;

    const tdPos = document.createElement('td');
    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = p.pos;
    tdPos.appendChild(badge);

    const tdPPG = document.createElement('td'); tdPPG.textContent = Number(p.ppg).toFixed(1);
    const tdAPG = document.createElement('td'); tdAPG.textContent = Number(p.apg).toFixed(1);
    const tdRPG = document.createElement('td'); tdRPG.textContent = Number(p.rpg).toFixed(1);

    // مثال على mouseover: تظليل الخلية
    [tdPPG, tdAPG, tdRPG].forEach(td => {
      td.addEventListener('mouseover', () => td.style.fontWeight = '700');
      td.addEventListener('mouseout',  () => td.style.fontWeight = '400');
    });

    tr.append(tdName, tdTeam, tdPos, tdPPG, tdAPG, tdRPG);
    frag.appendChild(tr);
  });

  tbody.appendChild(frag);
}

function applyFilters(){
  const q = state.q.trim().toLowerCase();
  let rows = BASE.filter(p => {
    const matchesText = !q || p.name.toLowerCase().includes(q);
    const matchesPos  = (state.filter === 'all') || (p.pos === state.filter);
    return matchesText && matchesPos;
  });

  if (state.sortKey){
    const key = state.sortKey;
    const dir = state.sortDir === 'asc' ? 1 : -1;
    rows.sort((a,b) => {
      const av = a[key], bv = b[key];
      const aN = typeof av === 'number' ? av : String(av).toLowerCase();
      const bN = typeof bv === 'number' ? bv : String(bv).toLowerCase();
      if (aN < bN) return -1 * dir;
      if (aN > bN) return  1 * dir;
      return 0;
    });
  }

  // تحديث مظهر السهم على رأس العمود
  $$('#tableHead th').forEach(th => th.classList.remove('sort-asc','sort-desc'));
  if (state.sortKey){
    const th = $(`#tableHead th[data-key="${state.sortKey}"]`);
    if (th) th.classList.add(state.sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
  }

  renderTable(rows);
}

// ======== Events ========

// (1) Search input (مع debounce بسيط)
let tId;
searchInput.addEventListener('input', (e) => {
  clearTimeout(tId);
  tId = setTimeout(() => {
    state.q = e.target.value || '';
    applyFilters();
  }, 150);
});

// (2) Filter dropdown (change)
filterSelect.addEventListener('change', (e) => {
  state.filter = e.target.value;
  applyFilters();
});

// (3) Header click sorting (event delegation)
thead.addEventListener('click', (e) => {
  const th = e.target.closest('th[data-key]');
  if (!th) return;
  const key = th.getAttribute('data-key');
  if (state.sortKey === key){
    state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    state.sortKey = key;
    // لو العمود رقمي خليه يبدأ desc افتراضياً
    const isNum = th.getAttribute('data-type') === 'number';
    state.sortDir = isNum ? 'desc' : 'asc';
  }
  applyFilters();
});

// (4) Dark mode toggle (click) + حفظ الحالة
function setDarkMode(on){
  document.body.classList.toggle('dark', on);
  darkToggle.setAttribute('aria-pressed', String(on));
  darkToggle.textContent = on ? '☀️ Light' : '🌙 Dark';
  try { localStorage.setItem('darkMode', on ? '1' : '0'); } catch {}
}
darkToggle.addEventListener('click', () => {
  const on = !document.body.classList.contains('dark');
  setDarkMode(on);
});

// استعادة الوضع من التخزين
try {
  const saved = localStorage.getItem('darkMode');
  if (saved === '1') setDarkMode(true);
} catch {}

// ======== Init ========
(function init(){
  // تعبئة قائمة المراكز من البيانات (لو تبغى توّسع)
  // const positions = [...new Set(BASE.map(p=>p.pos))].sort();
  // positions.forEach(pos => {
  //   const opt = document.createElement('option');
  //   opt.value = pos; opt.textContent = pos;
  //   filterSelect.appendChild(opt);
  // });

  applyFilters();
})();
