'use strict';

/* ══ STATE ════════════════════════════════════════════════════════════════ */
let isDark = true;
let activeFilter = 'all';
let searchQuery = '';

/* ══ THEME ════════════════════════════════════════════════════════════════ */
function toggleTheme(){
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('theme-btn').textContent = isDark ? '☀️' : '🌙';
}

/* ══ TOTAL COUNT ══════════════════════════════════════════════════════════ */
const TOTAL = CATEGORIES.reduce((s,c)=>s+c.links.length,0);
document.getElementById('total-count').textContent = TOTAL;
document.getElementById('footer-count').textContent = TOTAL + ' resources across ' + CATEGORIES.length + ' categories';

/* ══ CATEGORY NAV ════════════════════════════════════════════════════════ */
function renderCatNav(){
  const nav = document.getElementById('cat-nav');
  // ALL pill
  nav.innerHTML = `<button class="cat-pill ${activeFilter==='all'?'active':''}" onclick="setFilter('all',this)">
    <span class="cat-pill-dot" style="background:#fff"></span>All
    <span class="cat-count">${TOTAL}</span>
  </button>`;
  CATEGORIES.forEach(cat=>{
    const visible = cat.links.filter(l=>matchesSearch(l,cat)).length;
    nav.innerHTML += `<button class="cat-pill ${activeFilter===cat.id?'active':''}" onclick="setFilter('${cat.id}',this)">
      <span class="cat-pill-dot" style="background:${cat.color}"></span>${cat.name}
      <span class="cat-count">${cat.links.length}</span>
    </button>`;
  });
}

function setFilter(id, btn){
  activeFilter = id;
  document.querySelectorAll('.cat-pill').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  renderMain();
}

/* ══ SEARCH ═══════════════════════════════════════════════════════════════ */
document.getElementById('search').addEventListener('input', e=>{
  searchQuery = e.target.value.trim().toLowerCase();
  renderCatNav();
  renderMain();
});

// ⌘K / Ctrl+K focus
document.addEventListener('keydown', e=>{
  if((e.metaKey||e.ctrlKey)&&e.key==='k'){
    e.preventDefault();
    document.getElementById('search').focus();
    document.getElementById('search').select();
  }
  if(e.key==='Escape') document.getElementById('search').blur();
});

function matchesSearch(link, cat){
  if(!searchQuery) return true;
  return (
    link.name.toLowerCase().includes(searchQuery) ||
    link.desc.toLowerCase().includes(searchQuery) ||
    link.tag.toLowerCase().includes(searchQuery) ||
    cat.name.toLowerCase().includes(searchQuery)
  );
}

/* ══ FAVICON HELPER ══════════════════════════════════════════════════════ */
function faviconUrl(url){
  try{
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  }catch(e){ return null; }
}

/* ══ RENDER MAIN ═════════════════════════════════════════════════════════ */
function renderMain(){
  const main = document.getElementById('main');
  const empty = document.getElementById('empty');
  let totalVisible = 0;
  let html = '';

  const cats = activeFilter === 'all'
    ? CATEGORIES
    : CATEGORIES.filter(c=>c.id===activeFilter);

  cats.forEach((cat, ci)=>{
    const links = cat.links.filter(l=>matchesSearch(l,cat));
    if(!links.length) return;
    totalVisible += links.length;

    html += `<div class="section" style="animation-delay:${ci*0.05}s">
      <div class="section-header">
        <span class="section-dot" style="background:${cat.color};box-shadow:0 0 8px ${cat.color}66"></span>
        <span class="section-title" style="color:${cat.color}">${cat.name}</span>
        <span class="section-line"></span>
        <span class="section-count">${links.length} links</span>
      </div>
      <div class="cards-grid">`;

    links.forEach(link=>{
      const fav = faviconUrl(link.url);
      html += `<a class="card" href="${link.url}" target="_blank" rel="noopener noreferrer"
        style="--c-accent:${cat.color}"
        title="${link.name} — ${link.desc}">
        <div class="card-fav">
          ${fav ? `<img src="${fav}" alt="${link.name}" loading="lazy" onerror="this.parentNode.innerHTML='${cat.name[0]}'">` : cat.name[0]}
        </div>
        <div class="card-body">
          <div class="card-name">${esc(link.name)}</div>
          <div class="card-desc">${esc(link.desc)}</div>
          <span class="card-tag" style="color:${cat.color};border-color:${cat.color}33;background:${cat.color}11">${link.tag}</span>
        </div>
      </a>`;
    });

    html += `</div></div>`;
  });

  if(totalVisible === 0){
    main.innerHTML = '';
    main.style.display = 'none';
    empty.classList.add('show');
    document.getElementById('empty-q').textContent = searchQuery;
  } else {
    main.innerHTML = html;
    main.style.display = '';
    empty.classList.remove('show');
  }
}

/* ══ UTIL ════════════════════════════════════════════════════════════════ */
function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') }

/* ══ INIT ════════════════════════════════════════════════════════════════ */
renderCatNav();
renderMain();