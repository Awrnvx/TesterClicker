'use strict';
/* ============================================================
   ТЕСТОВЫЙ СЛОЙ редизайна админки. Без Firebase: демо в localStorage.

   ОБНОВЫ заданы списком ниже (UPDATES) - создавать их из админки нельзя.
   У обновы ровно три действия:
     - СИНХРО          : только с включённым таймером работ (в проде обнова выйдет у игроков по катсцене)
     - Включить обнову : включает сразу, без всяких анимаций
     - Убрать обнову   : скрывает всё (баннеры, декор, баннер ивента)
   Toggle нет. Катсцены в админке тоже нет - она живёт только в игре.
   ============================================================ */
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, '0');
const clock = ms => {
  ms = Math.max(0, Math.round(ms / 1000));
  const d = Math.floor(ms / 86400), h = Math.floor(ms % 86400 / 3600), m = Math.floor(ms % 3600 / 60), s = ms % 60;
  return (d ? d + 'д ' : '') + (h || d ? h + ':' : '') + pad(m) + ':' + pad(s);
};
const dateStr = ts => new Date(ts).toLocaleString('ru-RU', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const fmt = n => Math.round(n).toLocaleString('ru-RU');
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* ---------- ОБНОВЫ: список задаётся в коде ---------- */
/* Единственная обнова — Диликовый Хэллоуин. Ничего другого не добавляем. */
const UPDATES = [
  { id: 'halloween-2026', theme: 'halloween', title: 'Диликовый Хэллоуин 2026' }
];

/* ---------- темы экрана работ ---------- */
const SCREEN_THEMES = {
  classic: { name: 'Обычные', emoji: '🔧', decor: '⚙️✨🔧' },
  halloween: { name: 'Хэллоуин', emoji: '🎃', decor: '🕸️🍬🕷️' }
};

/* ---------- демо-игроки ---------- */
/* ADMIN_UID: в проде uid создателя объявлен в firebase-config.js как CREATOR_ID.
   Локально (admin-preview.html без Firebase) — демо-идентификатор.
   Своё const CREATOR_ID в этом файле объявлять нельзя: будет конфликт имён в одной
   глобальной области, и весь скрипт админки не выполнится ни на строчке. */
const ADMIN_UID = (function () { try { return CREATOR_ID || 'creator_dilik'; } catch (e) { return 'creator_dilik'; } })();
const DEMO_USERS = [
  { id: ADMIN_UID, name: 'Дилик', username: 'dilik' },
  { id: 'u_kkirill', name: 'kkirill', username: 'kkirill' },
  { id: 'u_masha', name: 'masha_k', username: 'masha_k' },
  { id: 'u_ronin', name: 'ronin', username: 'ronin' },
  { id: 'u_sanya', name: 'Sanya_Pro', username: 'sanya_pro' },
  { id: 'u_vera', name: 'vera', username: 'vera' },
  { id: 'u_nikita', name: 'nikita228', username: 'nikita228' },
  { id: 'u_liza', name: 'lisa_the_cat', username: 'lisa_the_cat' },
  { id: 'u_mrcheat', name: 'mrcheater', username: 'mrcheater' }
];

/* игроки подтягиваются из Firebase /users; до загрузки — пустой список */
let USERS_CACHE = [];

/* ---------- состояние ---------- */
const KEY = 'dilig_admin_preview_v5';
const DEFAULTS = {
  screens: { theme: 'halloween', type: 'timer', endsAt: 0, startedAt: 0 },
  updates: UPDATES.map(u => ({ id: u.id, theme: u.theme, title: u.title, active: false, scheduled: false })),
  events: {
    halloween: { active: false, endsAt: 0, total: 7 * 864e5, goal: 1000000, paidTop: false },
    wheel: { active: true, endsAt: Date.now() + 90 * 864e5, total: 150 * 864e5, spinCost: 2500 }
  },
  top: [{ n: 'Дилик', id: ADMIN_UID, v: 642500 }, { n: 'kkirill', id: 'u_kkirill', v: 412300 }, { n: 'masha_k', id: 'u_masha', v: 198400 }, { n: 'ronin', id: 'u_ronin', v: 88100 }, { n: 'Sanya_Pro', id: 'u_sanya', v: 41200 }],
  announcements: [{ id: 'a1', text: '🎃 Хэллоуин стартует в 20:00 по Москве', at: Date.now() - 36e5 * 4 }],
  poll: null,
  bans: [{ id: 'u_mrcheat', name: 'mrcheater', reason: 'накрутка кликов', until: Date.now() + 20 * 36e5 }],
  log: []
};
/* ============================================================
   FIREBASE-СЛОЙ. Единственная запись preview-админки живёт по пути
   /adminPreviewState — состояние экрана работ, обнов и демо-логов.
   Ивенты/копила/опросы/анонсы/баны/награды пишутся В РЕАЛЬНЫЕ узлы,
   которые читает игра (script.js): events/halloween, events/wheelEvent,
   polls/current, announcements, bans/<id>, users/<id>.
   ============================================================ */
const FS = {
  /* try/catch ловит ReferenceError от TDZ: если firebase-config.js не догрузился,
     const database остаётся необъявленным и typeof по нему бросает исключение. */
  db: (function () { try { return (typeof firebase !== 'undefined' && database) ? database : null; } catch (e) { return null; } })(),
  cacheKey: KEY + '_fbcache',
  ready: false,
  cacheGet() { try { return localStorage.getItem(this.cacheKey) || localStorage.getItem(KEY); } catch (e) { return null; } },
  cacheSet(json) { try { localStorage.setItem(this.cacheKey, json); } catch (e) {} },
  async loadFromDb() {
    if (!this.db) { this.ready = true; return null; }
    const snap = await this.db.ref('adminPreviewState').once('value');
    const v = snap.val();
    if (v) { this.cacheSet(JSON.stringify(v)); this.ready = true; return v; }
    // первый запуск с живой базой: переносим локальное демо или стартуем с DEFAULTS
    let seed = null;
    try { seed = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
    const init = (seed && seed.updates) ? seed : JSON.parse(JSON.stringify(DEFAULTS));
    init._createdAt = Date.now();
    await this.db.ref('adminPreviewState').set(init);
    this.cacheSet(JSON.stringify(init));
    this.ready = true;
    return init;
  },
  push() {
    if (!this.db || !this.ready) return;
    this.cacheSet(JSON.stringify(S));
    this.db.ref('adminPreviewState').set(S).catch(e => console.warn('adminPreviewState write failed', e));
  }
};

let saveT = 0;
const save = () => { clearTimeout(saveT); saveT = setTimeout(() => { FS.push(); syncAll(); }, 250); };

let S = load();
function load() {
  try {
    const raw = JSON.parse(FS.cacheGet());
    if (raw && raw.updates && raw.events && raw.events.halloween) {
      if (!('poll' in raw)) raw.poll = null;
      /* список берём из кода, состояние — из демо */
      const merged = UPDATES.map(u => {
        const found = raw.updates.find(x => x.id === u.id);
        return { id: u.id, theme: u.theme, title: u.title, active: !!(found && found.active), scheduled: !!(found && found.scheduled) };
      });
      return Object.assign({}, DEFAULTS, raw, { updates: merged });
    }
  } catch (e) { /* битое демо — старт с чистого */ }
  return JSON.parse(JSON.stringify(DEFAULTS));
}

/* ============================================================
   ТОСТ / МОДАЛКА / ЛОГ
   ============================================================ */
let toastT = 0;
function toast(msg, tone) {
  const t = $('toast');
  t.className = 'toast show' + (tone ? ' ' + tone : '');
  t.textContent = msg;
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2600);
}
let modalCb = null;
function ask(title, body, okLabel, cb) {
  $('modalIn').innerHTML = `<h3>${title}</h3><p class="hint">${body}</p>
    <div class="row"><button class="btn xs ok" data-m="ok">${okLabel}</button><button class="btn xs" data-close>Отмена</button></div>`;
  modalCb = cb;
  $('modal').classList.add('on');
}
$('modal').addEventListener('click', e => {
  if (e.target === $('modal') || e.target.closest('[data-close]')) return $('modal').classList.remove('on');
  if (e.target.closest('[data-m="ok"]')) { $('modal').classList.remove('on'); if (modalCb) modalCb(); }
});

const LOGICON = { ok: '✅', warn: '⚠️', sync: '🔄', err: '⛔' };
function addLog(type, msg) {
  S.log.unshift({ t: Date.now(), type, msg });
  S.log = S.log.slice(0, 30);
  renderLog(); save();
}
function renderLog() {
  $('logBox').innerHTML = S.log.length
    ? S.log.map(l => `${LOGICON[l.type] || '•'} ${new Date(l.t).toLocaleTimeString('ru-RU')} ${esc(l.msg)}`).join('<br>')
    : 'пусто — действия появятся здесь';
}
/* btnLog обработчик ниже (после renderLog), здесь дубль убран */
$('logClear').addEventListener('click', () => { S.log = []; renderLog(); save(); });

/* ============================================================
   НАВИГАЦИЯ (хедер как в игре)
   ============================================================ */
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.dataset.view === name));
  document.querySelectorAll('.nav-btn[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === name));
}
$('navLinks').addEventListener('click', e => {
  const b = e.target.closest('.nav-btn[data-view]');
  if (b) showView(b.dataset.view);
});

/* ============================================================
   СПИСКИ: выбор игрока (как в старой админке)
   ============================================================ */
const PICKER_LIMIT = 300;
function createUserPicker(o) {
  const picker = $(o.pickerId), search = $(o.searchId), hidden = $(o.hiddenId), list = $(o.listId), caret = $(o.caretId);
  let filtered = [], highlight = -1;

  function render() {
    const q = search.value.trim().toLowerCase();
    const selected = hidden.value;
    filtered = (USERS_CACHE.length ? USERS_CACHE : DEMO_USERS).filter(u => !q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.id.toLowerCase().includes(q));
    highlight = -1;
    if (!filtered.length) { list.innerHTML = '<div class="pempty">Никого не нашли</div>'; return; }
    list.innerHTML = filtered.slice(0, PICKER_LIMIT).map((u, i) =>
      `<div class="popt${u.id === selected ? ' sel' : ''}" data-i="${i}"><span class="pn">${esc(u.name)}</span>${u.id === ADMIN_UID ? '<span class="crown">👑</span>' : ''}<span class="pid">${esc(u.id)}</span></div>`).join('')
      + (filtered.length > PICKER_LIMIT ? `<div class="pempty">Показаны первые ${PICKER_LIMIT} — уточните поиск</div>` : '');
  }
  function open() { closeAllPickers(picker); picker.classList.add('open'); render(); }
  function close() { picker.classList.remove('open'); highlight = -1; }
  function pick(u) { hidden.value = u.id; search.value = u.name; close(); }
  function move(dir) {
    if (!picker.classList.contains('open')) return open();
    highlight = Math.max(-1, Math.min(filtered.length - 1, highlight + dir));
    list.querySelectorAll('.popt').forEach(el => el.classList.toggle('sel', +el.dataset.i === highlight));
    const cur = list.querySelector('.popt.sel');
    if (cur) cur.scrollIntoView({ block: 'nearest' });
  }

  search.addEventListener('focus', e => { e.stopPropagation(); open(); });
  search.addEventListener('input', () => { hidden.value = ''; open(); });
  search.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); const u = filtered[highlight >= 0 ? highlight : 0]; if (u) pick(u); }
    else if (e.key === 'Escape') close();
  });
  if (caret) caret.addEventListener('click', e => { e.stopPropagation(); picker.classList.contains('open') ? close() : open(); });
  list.addEventListener('mousedown', e => {
    const row = e.target.closest('.popt');
    if (row) { e.preventDefault(); pick(filtered[+row.dataset.i]); }
  });
  document.addEventListener('click', e => { if (!picker.contains(e.target)) close(); });

  return {
    name: () => search.value.trim(),
    resolve() {
      const q = search.value.trim().toLowerCase();
      const pool = USERS_CACHE.length ? USERS_CACHE : DEMO_USERS;
      const byId = pool.find(u => u.id === hidden.value);
      if (byId) return byId;
      return pool.find(u => u.name.toLowerCase() === q || u.username.toLowerCase() === q) || null;
    },
    reset() { hidden.value = ''; search.value = ''; close(); }
  };
}
function closeAllPickers(except) {
  document.querySelectorAll('.picker.open, .pick.open').forEach(p => { if (p !== except) p.classList.remove('open'); });
}

const rwPicker = createUserPicker({ pickerId: 'rewardPicker', searchId: 'rewardUserSearch', hiddenId: 'rewardUserId', listId: 'rewardList', caretId: 'rewardCaret' });
const bnPicker = createUserPicker({ pickerId: 'banPicker', searchId: 'banUserSearch', hiddenId: 'banUserId', listId: 'banList', caretId: 'banCaret' });
const unbPicker = createUserPicker({ pickerId: 'unbanPicker', searchId: 'unbanUserSearch', hiddenId: 'unbanUserId', listId: 'unbanList', caretId: 'unbanCaret' });
const clrPicker = createUserPicker({ pickerId: 'clearPicker', searchId: 'clearUserSearch', hiddenId: 'clearUserId', listId: 'clearList', caretId: 'clearCaret' });

/* стеклянный выпадашек вместо select (там системный скрол) */
function createGlassSelect(o) {
  const box = $(o.pickId), btn = $(o.pickId).querySelector('.pick-btn'), lbl = $(o.labelId), pop = $(o.popId);
  let value = o.options[0].v;
  function render() {
    pop.innerHTML = o.options.map(op =>
      `<div class="opt${op.v === value ? ' sel' : ''}" data-v="${op.v}">${op.e ? `<span>${op.e}</span>` : ''}<span>${esc(op.l)}</span></div>`).join('');
    const cur = o.options.find(x => x.v === value);
    lbl.textContent = (cur.e ? cur.e + ' ' : '') + cur.l;
  }
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const wasOpen = box.classList.contains('open');
    closeAllPickers(box);
    if (!wasOpen) { box.classList.add('open'); render(); }
  });
  pop.addEventListener('mousedown', e => {
    const op = e.target.closest('.opt');
    if (!op) return;
    e.preventDefault();
    value = op.dataset.v;
    box.classList.remove('open');
    render();
    if (o.onChange) o.onChange(value);
  });
  document.addEventListener('click', () => box.classList.remove('open'), true);
  render();
  return { value: () => value, set: v => { value = v; render(); } };
}
const REWARD_OPTS = [{ v: 'dilicks', l: 'Дилики', e: '💎' }, { v: 'money', l: 'Деньги', e: '💰' }, { v: 'skin', l: 'Скин', e: '✨' }];
const giveOpts = [{ v: 'dilicks', l: 'Дилики', e: '💎' }, { v: 'money', l: 'Деньги', e: '💰' }];
let rewardType = 'dilicks';
let giveAllType = 'dilicks';
createGlassSelect({ pickId: 'rewardTypePick', labelId: 'rewardTypeLbl', popId: 'rewardTypePop', options: REWARD_OPTS, onChange: v => rewardType = v });
createGlassSelect({ pickId: 'giveAllTypePick', labelId: 'giveAllTypeLbl', popId: 'giveAllTypePop', options: giveOpts, onChange: v => giveAllType = v });

/* ============================================================
   ОБНОВЫ: три кнопки и ничего лишнего
   ============================================================ */
const updDef = id => UPDATES.find(u => u.id === id);
const stateOf = id => S.updates.find(u => u.id === id);
const activeUpd = () => S.updates.find(u => u.active);
const screenRunning = () => S.screens.type === 'infinite' || S.screens.endsAt > Date.now();

function cardUpd(u) {
  const st = stateOf(u.id);
  const scr = SCREEN_THEMES[u.theme];
  const running = screenRunning();
  const whatIsNew = u.theme === 'halloween' ? 'баннеры, декор вкладок, хэллоуинская тема колеса, конфетный бонус, плашка ивента' : 'обычные баннеры';

  return `<div class="lg up ${st.active ? 'on-card' : 'off-card'}">
    <div class="up-head">
      <div class="up-ic">${scr.emoji}</div>
      <div class="up-tt"><div class="t1">${esc(u.title)}</div>
        <div class="t2"><span class="tag hal">${scr.name}</span><span class="pill ${st.active ? 'good' : st.scheduled ? 'warn' : 'off'}">${st.active ? 'в игре' : st.scheduled ? 'запланирована' : 'скрыта'}</span></div></div>
    </div>
    <p class="hint">Появится у игроков: <b>${whatIsNew}</b></p>
    <div class="up-actions">
      <button class="btn xs solid" data-act="sync" data-id="${u.id}">🔄 СИНХРО</button>
      ${st.active
        ? `<button class="btn xs danger" data-act="remove" data-id="${u.id}">⏹ Убрать обнову</button>`
        : `<button class="btn xs ok" data-act="enable" data-id="${u.id}">✅ Включить обнову</button>`}
      <span class="hint" style="margin-left:auto">${st.scheduled ? 'запланирована: катсцена пойдёт, когда таймер закончится' : (st.active ? 'обнова видна игрокам' : 'скрыта — в игре нет ничего из этой обновы')}</span>
    </div>
  </div>`;
}

function renderUpd() {
  $('updList').innerHTML = UPDATES.map(cardUpd).join('');
  renderMirror();
}

$('updList').addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const id = b.dataset.id;
  const act = b.dataset.act;

  if (act === 'sync') {
    const def = updDef(id), stS = stateOf(id);
    if (!screenRunning()) { toast('Сначала включи экран работ — СИНХРО привязывает обнову к концу таймера', 'warn'); return; }
    if (S.screens.type === 'infinite') { toast('Бесконечные техработы: у них нет конца таймера, включай обнову кнопкой', 'warn'); return; }
    if (S.screens.theme !== def.theme) { toast(`Нужен экран темы «${SCREEN_THEMES[def.theme].name}» — сейчас «${SCREEN_THEMES[S.screens.theme].name}»`, 'warn'); return; }
    scheduleSync(id);
  syncUpdateState();
  } else if (act === 'enable') {
    enableUpdate(id);
  } else if (act === 'remove') {
    const st = stateOf(id);
    st.active = false;
    addLog('warn', `«${updDef(id).title}» убрана: баннеры, декор и баннер ивента скрыты у игроков`);
    syncUpdateState();
    renderAll();
  }
});

/* «Включить обнову» — сразу, без катсцены и без всяких таймеров */
function enableUpdate(id) {
  S.updates.forEach(x => { x.active = false; x.scheduled = false; });
  const st = stateOf(id);
  st.active = true;
  addLog('ok', `«${updDef(id).title}» включена сразу — у всех появится без анимаций`);
  syncUpdateState();
  renderAll();
}

/* СИНХРО — обнова ПЛАНИРУЕТСЯ к концу текущего таймера. Таймер продолжает идти!
   Катсцена у игроков стартует только когда таймер сам закончится (см. tick). */
function scheduleSync(id) {
  const st = stateOf(id);
  st.scheduled = true;
  st.active = false;
  const t = S.screens.type === 'infinite' ? null : Math.max(0, S.screens.endsAt - Date.now());
  addLog('sync', `СИНХРО: «${updDef(id).title}» привязана к экрану работ (${t == null ? 'бесконечные работы — ждётmanual-выключения' : 'катсцена пройдёт через ' + clock(t * 1000)})`);
  toast('Обнова запланирована: катсцена начнётся, когда таймер закончится', 'ok');
  renderAll();
}

/* момент истины: таймер экрана закончился → запланированная обнова выходит по катсцене */
function fireScheduled() {
  const idx = S.updates.findIndex(u => u.scheduled);
  if (idx < 0) return false;
  const u = S.updates[idx];
  u.scheduled = false;
  u.active = true;
  addLog('sync', `⏱ Таймер закончился → «${updDef(u.id).title}» вышла из работ: у игроков началась КАТСКАЦЕНА появления`);
  toast(`Катсцена: ${updDef(u.id).title}`, 'ok');
  syncUpdateState();
  return true;
}

/* updateState — витрина обновы. Игра показывает хэллоуин-контент ТОЛЬКО
   когда activeId непустой. scheduledId = «ждёт конца таймера» — в игре ничего
   не появляется пока таймер сам не закончится. */
function syncUpdateState() {
  if (!FS.db) return;
  const act = S.updates.find(u => u.active);
  const sch = S.updates.find(u => u.scheduled);
  const body = {
    activeId: act ? act.id : null,
    activeTheme: act ? act.theme : null,
    scheduledId: sch ? sch.id : null,
    scheduledTheme: sch ? sch.theme : null,
    screenTheme: S.screens.theme,
    updatedAt: Date.now()
  };
  FS.db.ref('updateState').set(body).catch(e => console.warn('updateState write failed', e));
}
function renderMirror() {
  const now = Date.now(), u = activeUpd(), hw = S.events.halloween, wh = S.events.wheel;
  const work = screenRunning();
  const tiles = [
    ['обнова у игроков', u ? SCREEN_THEMES[u.theme].emoji + ' ' + u.title : 'нет', u ? 'баннеры и декор показаны' : 'витрина пустая', u ? 'gold' : ''],
    ['экран работ', work ? (S.screens.type === 'infinite' ? 'идут ∞' : clock(S.screens.endsAt - now)) : 'выключен', 'тема: ' + SCREEN_THEMES[S.screens.theme].name, work ? 'bad' : 'good'],
    ['хэллоуин', hw.active ? 'активен' : 'остановлен', hw.active ? clock(Math.max(0, hw.endsAt - now)) + ' до конца' : 'запуск кнопкой', hw.active ? 'good' : ''],
    ['колесо', wh.active ? 'активно' : 'остановлено', fmt(wh.spinCost) + ' диликов за крутку', wh.active ? 'good' : '']
  ];
  $('sysMirror').innerHTML = tiles.map(([n, v, s, tone]) =>
    `<div class="lg tile ${tone}"><div class="t-n">${n}</div><div class="t-v">${v}</div><div class="t-s">${s}</div></div>`).join('');
}

/* ============================================================
   ЭКРАНЫ РАБОТ
   ============================================================ */
function renderScreens() {
  const sc = S.screens, now = Date.now();
  document.querySelectorAll('#themeRow [data-theme]').forEach(b => b.classList.toggle('sel', b.dataset.theme === sc.theme));
  $('themeName').textContent = SCREEN_THEMES[sc.theme].name;
  const work = screenRunning();
  $('scrLeft').textContent = sc.type === 'infinite' ? '∞' : work ? clock(sc.endsAt - now) : '—';
  const total = Math.max(1, (sc.endsAt || 0) - (sc.startedAt || 0));
  $('scrBar').style.width = sc.type === 'infinite' ? '100%' : work ? Math.min(100, Math.max(2, (sc.endsAt - now) / total * 100)) + '%' : '0%';
}
$('themeRow').addEventListener('click', e => {
  const b = e.target.closest('[data-theme]');
  if (!b) return;
  S.screens.theme = b.dataset.theme;
  addLog('ok', `Тема экрана работ: ${SCREEN_THEMES[b.dataset.theme].name}`);
  renderAll();
});
$('scrInfOn').addEventListener('click', () => { S.screens.type = 'infinite'; S.screens.fired = false; addLog('warn', 'Бесконечные техработы включены'); renderAll(); });
$('scrInfOff').addEventListener('click', () => { S.screens.type = 'timer'; S.screens.startedAt = 0; S.screens.endsAt = 0; addLog('ok', 'Техработы сняты — игра открыта'); renderAll(); });
$('scrPresets').addEventListener('click', e => {
  const c = e.target.closest('.chip');
  if (!c) return;
  $('scrSec').value = c.dataset.s;
  $('scrPresets').querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
  c.classList.add('active');
});
$('scrTimerOn').addEventListener('click', () => {
  const sec = Math.max(1, +$('scrSec').value || 60);
  S.screens.type = 'timer';
  S.screens.startedAt = Date.now();
  S.screens.endsAt = Date.now() + sec * 1000;
  S.screens.fired = false;
  addLog('sync', `Экран работ на ${clock(sec * 1000)} — потом жми СИНХРО в «Обновах»`);
  toast('Экран включён. Когда таймер кончится — нажми СИНХРО в «Обновах»', 'ok');
  renderAll();
});

/* ============================================================
   ИВЕНТЫ: хэллоуин + колесо
   ============================================================ */
const sumTop = () => S.top.reduce((s, x) => s + x.v, 0);

function renderEvents() {
  const now = Date.now(), hw = S.events.halloween, wh = S.events.wheel;
  const anyOn = hw.active || wh.active;
  $('evState').className = 'currency' + (anyOn ? ' on' : '');
  $('evStateT').textContent = anyOn
    ? [hw.active ? '🎃 хэллоуин' : null, wh.active ? '🎡 колесо' : null].filter(Boolean).join(' + ')
    : 'ивентов нет';

  $('evLeft').textContent = hw.active ? clock(Math.max(0, hw.endsAt - now)) : 'стоп';
  $('evBar').style.width = hw.active ? Math.min(100, Math.max(2, (hw.endsAt - now) / Math.max(1, hw.total) * 100)) + '%' : '0%';

  const pool = sumTop();
  $('evPoolVal').textContent = fmt(pool) + ' 🍬';
  $('evGoalVal').textContent = fmt(hw.goal);
  $('evPoolBar').style.width = Math.min(100, hw.goal ? pool / hw.goal * 100 : 0) + '%';
  $('halloweenGoalInput').value = hw.goal;

  $('topList').innerHTML = S.top.length ? S.top.slice().sort((a, b) => b.v - a.v).map((p, i) =>
    `<div class="top-li"><span class="r">${['🥇', '', '🥉'][i] || i + 1}</span><span class="n">${esc(p.n)}${p.id === ADMIN_UID ? ' 👑' : ''}</span><span class="v">${fmt(p.v)}</span></div>`).join('')
    : '<div class="empty">Пока нет участников</div>';

  $('halloweenTopPaidInfo').textContent = hw.paidTop ? '✅ Награды топ-3 уже выданы' : 'Награды ещё не выданы';

  $('whLeft').textContent = wh.active ? clock(Math.max(0, wh.endsAt - now)) : 'стоп';
  $('whBar').style.width = wh.active ? Math.min(100, Math.max(2, (wh.endsAt - now) / Math.max(1, wh.total) * 100)) + '%' : '0%';
  $('spinCostNow').textContent = fmt(wh.spinCost);

  $('tileHw').className = 'lg tile ' + (hw.active ? 'good' : '');
  $('tileHw').querySelector('.t-v').textContent = hw.active ? 'активен' : 'остановлен';
  $('tileWh').className = 'lg tile ' + (wh.active ? 'good' : '');
  $('tileWh').querySelector('.t-v').textContent = wh.active ? 'активно' : 'остановлено';
}

$('evStart').addEventListener('click', () => {
  const days = Math.max(1, +$('evDays').value || 7);
  const hw = S.events.halloween;
  hw.active = true; hw.total = days * 864e5; hw.endsAt = Date.now() + hw.total;
  addLog('ok', `Хэллоуин запущен на ${days} д`);
  renderAll();
});
$('evStop').addEventListener('click', () => { S.events.halloween.active = false; addLog('warn', 'Хэллоуин остановлен'); renderAll(); });
$('evPresets').addEventListener('click', e => {
  const c = e.target.closest('.chip');
  if (!c) return;
  $('evDays').value = c.dataset.d;
  $('evPresets').querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
  c.classList.add('active');
});
$('setHalloweenGoalBtn').addEventListener('click', () => {
  const v = Math.max(1, +$('halloweenGoalInput').value || 0);
  if (!v) return toast('Укажи цель', 'warn');
  S.events.halloween.goal = v;
  addLog('ok', `Цель копилки: ${fmt(v)}`);
  renderAll();
});
/* ---------- копилка: реальный узел events/halloween/totalPool ---------- */
function poolDelta(sign) {
  const v = Math.max(0, +$('poolAmount').value || 0) * sign;
  if (!v) return toast('Укажи количество', 'warn');
  if (!FS.db) { S.top.forEach(() => {}); addLog('warn', 'Копилка: только локально'); return toast('Firebase недоступен', 'warn'); }
  dbTx('events/halloween/totalPool', cur => Math.max(0, (Number(cur) || 0) + v))
    .then(ok => ok && addLog('ok', `Копилка ${v > 0 ? '+' : ''}${fmt(v)} → /events/halloween/totalPool`));
}
$('addPoolBtn').addEventListener('click', () => poolDelta(1));
$('removePoolBtn').addEventListener('click', () => poolDelta(-1));
$('resetPoolBtn').addEventListener('click', () => ask('Сбросить копилку?', 'Конфеты в <span class="cmd">events/halloween/totalPool</span> станут 0.', 'Сбросить', () => {
  dbSet('events/halloween/totalPool', 0, 'Копилка обнулена');
}));

/* ---------- топ: читается из users/<id>/halloweenContribution ---------- */
function readTop() {
  if (!FS.db) { renderEvents(); return toast('Firebase недоступен — демо-топ', 'warn'); }
  toast('Загружаю топ из базы...', 'ok');
  FS.db.ref('users').once('value').then(snap => {
    const v = snap.val() || {};
    const rows = Object.keys(v).map(id => ({
      id,
      n: (v[id].settings && v[id].settings.displayName) || v[id].username || id,
      v: Number(v[id].halloweenContribution) || 0
    })).filter(r => r.v > 0).sort((a, b) => b.v - a.v).slice(0, 10);
    S.top = rows;
    renderEvents();
    addLog('ok', `Топ ивента: ${rows.length} игроков из базы`);
  }).catch(e => { console.warn(e); addLog('err', 'Топ не загружен: нет прав на чтение /users'); toast('Не удалось прочитать топ', 'err'); });
}
$('loadTopBtn').addEventListener('click', readTop);

/* ---------- награды топ-3 ---------- */
const HW_PRIZES = [
  { money: 1000000, dilicks: 100000 },
  { money: 500000, dilicks: 50000 },
  { money: 250000, dilicks: 25000 }
];
$('payHalloweenTopBtn').addEventListener('click', () => {
  if (!FS.db) return toast('Firebase недоступен', 'warn');
  if (!S.top.length) return toast('Сначала загрузи топ', 'warn');
  FS.db.ref('events/halloween/topRewardsPaid').once('value').then(snap => {
    if (snap.val() === true) return toast('Награды уже выданы', 'warn');
    ask('Выдать награды топ-3?',
      '🥇 1 000 000 монет + 100 000 диликов · 🥈 500 000 + 50 000 · 🥉 250 000 + 25 000<br>Флаг <span class="cmd">topRewardsPaid</span> защитит от повтора.', 'Выдать', () => {
        const winners = S.top.slice(0, 3);
        Promise.all(winners.flatMap((w, i) => [
          FS.db.ref('users/' + w.id + '/money').transaction(cur => (Number(cur) || 0) + HW_PRIZES[i].money),
          FS.db.ref('users/' + w.id + '/dilicks').transaction(cur => (Number(cur) || 0) + HW_PRIZES[i].dilicks)
        ])).then(() => {
          FS.db.ref('events/halloween/topRewardsPaid').set(true);
          S.events.halloween.paidTop = true;
          addLog('ok', `Награды выданы: ${winners.map(w => w.n).join(', ')}`);
          toast('Награды топ-3 выданы', 'ok');
          renderAll();
        }).catch(e => { console.warn(e); addLog('err', 'Выдача наград не удалась'); toast('Ошибка выдачи', 'err'); });
      });
  }).catch(e => { console.warn(e); toast('Не удалось проверить флаг выдачи', 'err'); });
});

/* ---------- очистки ---------- */
$('clearUraganTopBtn').addEventListener('click', () => ask('Очистить весь топ?', 'Обнулит <span class="cmd">halloweenContribution</span> всем игрокам из топа и копилку. Необратимо.', 'Очистить', () => {
  if (!FS.db) return toast('Firebase недоступен', 'warn');
  const ids = S.top.map(p => p.id);
  if (!ids.length) return toast('Топ пуст — сначала загрузи его', 'warn');
  Promise.all(ids.map(id => FS.db.ref('users/' + id + '/halloweenContribution').remove()))
    .then(() => FS.db.ref('events/halloween/totalPool').set(0))
    .then(() => { S.top = []; renderAll(); addLog('warn', `Топ очищен: ${ids.length} игроков`); toast('Топ очищен', 'warn'); })
    .catch(e => { console.warn(e); addLog('err', 'Очистка топа не удалась'); });
}));
$('clearAdminBtn').addEventListener('click', () => ask('Очистить админа?', 'Обнулит конфеты администратора.', 'Очистить', () => {
  dbRemove('users/' + ADMIN_UID + '/halloweenContribution', 'Счёт админа очищен').then(() => readTop());
}));
$('clearPlayerBtn').addEventListener('click', () => {
  const u = clrPicker.resolve();
  if (!u) return toast('Выбери игрока из списка', 'warn');
  ask(`Обнулить конфеты: ${esc(u.name)}?`, `ID: <span class="cmd">${esc(u.id)}</span>`, 'Очистить', () => {
    dbRemove('users/' + u.id + '/halloweenContribution', `Счёт очищен: ${u.name}`).then(() => {
      clrPicker.reset(); readTop();
    });
  });
});

$('startWheelEventBtn').addEventListener('click', () => {
  const days = Math.max(1, +$('wheelDays').value || 150);
  const wh = S.events.wheel;
  wh.active = true; wh.total = days * 864e5; wh.endsAt = Date.now() + wh.total;
  addLog('ok', `Колесо запущено на ${days} д`);
  renderAll();
});
$('stopWheelEventBtn').addEventListener('click', () => { S.events.wheel.active = false; addLog('warn', 'Колесо остановлено'); renderAll(); });
$('wheelPresets').addEventListener('click', e => {
  const c = e.target.closest('.chip');
  if (!c) return;
  $('wheelDays').value = c.dataset.d;
  $('wheelPresets').querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
  c.classList.add('active');
});
$('setSpinCostBtn').addEventListener('click', () => {
  const v = Math.max(1, +$('spinCostInput').value || 0);
  if (!v) return toast('Укажи стоимость', 'warn');
  S.events.wheel.spinCost = v;
  addLog('ok', `Цена крутки колеса: ${fmt(v)} диликов`);
  renderAll();
});

/* ============================================================
   АНОНСЫ
   ============================================================ */
function pollTotal(p) { return p.options.reduce((s, o) => s + o.votes, 0); }
function renderPoll() {
  const box = $('pollLive');
  const p = S.poll;
  if (!p || p.closed) { box.innerHTML = '<div class="empty">Опросов нет</div>'; return; }
  const total = pollTotal(p);
  box.innerHTML = `<div class="lg" style="padding:12px;border-radius:18px">
      <div class="l-t" style="font-size:13px;font-weight:800">${esc(p.question)}</div>
      <div class="hint" style="margin-top:2px">${fmt(total)} голосов · до ${dateStr(p.endsAt)}</div>
      ${p.options.map((o, i) => `<div class="cd" style="margin-top:8px;padding:7px 10px">
          <span style="font-size:12px;font-weight:700;min-width:90px">${esc(o.text)}</span>
          <div class="bar-lite"><i style="width:${total ? Math.round(o.votes / total * 100) : 0}%"></i></div>
          <span style="font-family:ui-monospace,Menlo,monospace;font-size:11px;color:var(--gold)">${fmt(o.votes)} · ${total ? Math.round(o.votes / total * 100) : 0}%</span>
        </div>`).join('')}
      <div class="row" style="margin-top:9px">
        <button class="btn xs ok" data-pv="0">Голосовать за 1-й</button>
        <button class="btn xs ok" data-pv="1">Голосовать за 2-й</button>
      </div>
    </div>`;
}
function renderSocial() {
  renderPoll();
  $('anList').innerHTML = S.announcements.length ? S.announcements.map(a =>
    `<div class="li"><div class="l-main"><div class="l-t">${esc(a.text)}</div><div class="l-s">${dateStr(a.at)}</div></div>
      <button class="btn xs" data-an="pin" data-id="${a.id}">📌 Закрепить</button><button class="btn xs danger" data-an="del" data-id="${a.id}">✕</button></div>`).join('')
    : '<div class="empty">Анонсов нет</div>';
}
$('anSend').addEventListener('click', () => {
  const v = $('anText').value.trim();
  if (!v) return toast('Введи текст анонса', 'warn');
  S.announcements.unshift({ id: 'a' + Date.now().toString(36), text: v, at: Date.now() });
  $('anText').value = '';
  addLog('ok', `Анонс отправлен: ${v.slice(0, 48)}`);
  renderSocial(); save();
});
$('anQuick').addEventListener('click', e => {
  const c = e.target.closest('.chip');
  if (c) { $('anText').value = c.dataset.t; $('anText').focus(); }
});
$('anList').addEventListener('click', e => {
  const b = e.target.closest('[data-an]');
  if (!b) return;
  if (b.dataset.an === 'del') { S.announcements = S.announcements.filter(a => a.id !== b.dataset.id); addLog('warn', 'Анонс удалён'); }
  else { const a = S.announcements.find(x => x.id === b.dataset.id); if (a) { a.at = Date.now(); addLog('ok', 'Анонс закреплён заново'); } }
  renderSocial(); save();
});

/* ---------- опросы (как в старой админке) ---------- */
$('pollCreateBtn').addEventListener('click', () => {
  const q = $('pollQuestion').value.trim();
  const o1 = $('pollOpt1').value.trim();
  const o2 = $('pollOpt2').value.trim();
  if (!q || !o1 || !o2) return toast('Заполни вопрос и оба варианта', 'warn');
  S.poll = { question: q, options: [{ text: o1, votes: 0 }, { text: o2, votes: 0 }], endsAt: Date.now() + 24 * 36e5, closed: false };
  $('pollQuestion').value = ''; $('pollOpt1').value = ''; $('pollOpt2').value = '';
  addLog('ok', `Опрос опубликован: ${q.slice(0, 48)}`);
  toast('Опрос активен 24 часа (демо)', 'ok');
  renderSocial(); save();
});
$('pollCloseBtn').addEventListener('click', () => {
  if (!S.poll || S.poll.closed) return toast('Активного опроса нет', 'warn');
  S.poll.closed = true;
  addLog('warn', `Опрос закрыт досрочно: ${S.poll.question.slice(0, 40)}`);
  renderSocial(); save();
});
$('pollLive').addEventListener('click', e => {
  const b = e.target.closest('[data-pv]');
  if (!b || !S.poll || S.poll.closed) return;
  S.poll.options[+b.dataset.pv].votes += 1;   // демо: эмуляция голосов игроков
  renderPoll(); save();
});

/* ============================================================
   ИГРОКИ: награды и баны
   ============================================================ */
function renderPlayers() {
  $('bannedList').innerHTML = S.bans.length ? S.bans.map(b =>
    `<div class="li"><div class="l-main"><div class="l-t">⛔ ${esc(b.name)}</div><div class="l-s">${esc(b.reason)} · ${b.until > Date.now() ? clock(b.until - Date.now()) : 'навсегда'}${b.id === ADMIN_UID ? ' · 👑' : ''}</div></div>
      <button class="btn xs ok" data-unb="${b.id}">Разбанить</button></div>`).join('')
    : '<div class="empty">Забаненных нет</div>';
}
$('banPresets').addEventListener('click', e => {
  const c = e.target.closest('.chip');
  if (!c) return;
  $('banHours').value = c.dataset.h;
  $('banPresets').querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
  c.classList.add('active');
});
$('banUserBtn').addEventListener('click', () => {
  const u = bnPicker.resolve();
  if (!u) return toast('Выбери игрока из списка', 'warn');
  const h = Math.max(0, +$('banHours').value || 0);
  S.bans = S.bans.filter(b => b.id !== u.id);
  S.bans.push({ id: u.id, name: u.name, reason: $('banReason').value.trim() || 'без причины', until: h ? Date.now() + h * 36e5 : Infinity });
  bnPicker.reset(); $('banReason').value = '';
  addLog('warn', `Бан: ${u.name} ${h ? 'на ' + h + ' ч' : 'навсегда'}`);
  toast(`Забанен ${u.name}`, 'warn');
  renderPlayers(); save();
});
function unbanById(id) {
  const b = S.bans.find(x => x.id === id);
  if (!b) return false;
  S.bans = S.bans.filter(x => x.id !== id);
  addLog('ok', `Разбанен: ${b.name}`);
  return true;
}
$('unbanUserBtn').addEventListener('click', () => {
  const u = unbPicker.resolve();
  if (!u) return toast('Выбери игрока из списка', 'warn');
  const ok = unbanById(u.id);
  unbPicker.reset();
  toast(ok ? `Разбанен ${u.name}` : `Бан не найден: ${u.name}`, ok ? 'ok' : 'err');
  renderPlayers(); save();
});
$('bannedList').addEventListener('click', e => {
  const b = e.target.closest('[data-unb]');
  if (!b) return;
  unbanById(b.dataset.unb);
  renderPlayers(); save();
});
$('giveRewardBtn').addEventListener('click', () => {
  const u = rwPicker.resolve();
  const a = +$('rewardAmount').value || 0;
  if (!u) return toast('Выбери игрока из списка', 'warn');
  if (!a) return toast('Укажи количество', 'warn');
  giveReward(u, rewardType, a);
});

/* награда в реальную базу: только своё поле, через transaction */
const REWARD_LABEL = { dilicks: '💎 диликов', money: '💰 денег', skin: '✨ скин' };
function giveReward(u, type, amount) {
  if (!FS.db) {
    addLog('warn', `Локально: ${u.name} → ${fmt(amount)} ${REWARD_LABEL[type]}`);
    return toast('Firebase недоступен — только локально', 'warn');
  }
  if (type === 'skin') {
    const skinId = String(amount);
    dbTx('users/' + u.id + '/inventory', cur => {
      const arr = Array.isArray(cur) ? cur.slice() : [];
      if (!arr.includes(skinId)) arr.push(skinId);
      return arr;
    }).then(ok => ok && addLog('ok', `Скин ${skinId} → /users/${u.id}/inventory`));
    return toast(`${u.name}: скин ${skinId}`, 'ok');
  }
  dbTx('users/' + u.id + '/' + type, cur => (Number(cur) || 0) + amount)
    .then(ok => ok && addLog('ok', `+${fmt(amount)} ${REWARD_LABEL[type]} → /users/${u.id}/${type}`));
  toast(`${u.name}: +${fmt(amount)} ${REWARD_LABEL[type]}`, 'ok');
}

$('giveAllBtn').addEventListener('click', () => {
  const a = +$('giveAllAmount').value || 0;
  if (!a) return toast('Укажи количество', 'warn');
  ask('Выдать всем?', `${fmt(a)} × ${giveAllType} каждому игроку. Идёт транзакция по <span class="cmd">users/&lt;id&gt;</span> — не закрывай вкладку.`, 'Выдать всем', () => {
    if (!FS.db) return toast('Firebase недоступен — только локально', 'warn');
    const ids = USERS_CACHE.map(x => x.id);
    if (!ids.length) return toast('Список игроков ещё не загружен', 'warn');
    addLog('sync', `Раздача: ${fmt(a)} ${giveAllType} × ${ids.length} игроков`);
    giveAllBatch(ids, giveAllType, a, 0);
  });
});

/* по 12 игроков за подход, чтобы не вешать вкладку */
function giveAllBatch(ids, field, amount, i) {
  const slice = ids.slice(i, i + 12);
  Promise.all(slice.map(id => FS.db.ref('users/' + id + '/' + field).transaction(cur => (Number(cur) || 0) + amount)))
    .catch(e => console.warn(e))
    .then(() => {
      const done = i + slice.length;
      if (done % 120 === 0 && done < ids.length) addLog('sync', `Раздача: ${done}/${ids.length}`);
      if (done < ids.length) return giveAllBatch(ids, field, amount, done);
      addLog('ok', `Раздача завершена: ${fmt(amount)} ${field} для ${ids.length} игроков`);
      toast('Раздача готова', 'ok');
    });
}

/* ============================================================
   ПИЮЛИ ХЕДЕРА + ТИК
   ============================================================ */
function renderPills() {
  const now = Date.now(), u = activeUpd(), work = screenRunning();
  $('pillUpd').className = 'currency' + (u ? ' on' : '');
  $('pillUpdT').textContent = u ? (u.theme === 'halloween' ? '🎃 Хэллоуин' : '✨ обнова') : 'обнов нет';
  $('ncUpd').className = 'nav-count' + (u ? '' : ' off');
  $('ncUpd').textContent = u ? 'в игре' : 'нет';

  $('pillScr').className = 'currency' + (work ? ' bad' : '');
  $('pillScrT').textContent = work ? (S.screens.type === 'infinite' ? '🔧 работы' : '⏱ ' + clock(S.screens.endsAt - now)) : 'открыта';
  $('ncScr').className = 'nav-count' + (work ? ' wait' : ' off');
  $('ncScr').textContent = work ? 'работы' : 'выкл';

  const ev = (S.events.halloween.active ? 1 : 0) + (S.events.wheel.active ? 1 : 0);
  $('ncEvt').className = 'nav-count' + (ev ? '' : ' off');
  $('ncEvt').textContent = ev || 'нет';
}

function tick() {
  const now = Date.now();
  let dirty = false;

  ['halloween', 'wheel'].forEach(k => {
    const ev = S.events[k];
    if (ev.active && ev.endsAt && now >= ev.endsAt) {
      ev.active = false;
      addLog('warn', `${k === 'halloween' ? 'Хэллоуин' : 'Колесо'} завершились по таймеру`);
      dirty = true;
    }
  });

  const sc = S.screens;
  if (sc.type === 'timer' && sc.endsAt > 0 && now >= sc.endsAt && !sc.fired) {
    sc.fired = true;
    // истёк таймер → запланированная обнова выходит по катсцене
    if (fireScheduled()) {
      sc.type = 'timer'; sc.startedAt = 0; sc.endsAt = 0;   // работы окончены, экран открыт
    } else {
      const ready = S.updates.find(u => !u.active && !u.scheduled);
      addLog(ready ? 'sync' : 'ok', ready ? `Работы окончились → можно жать СИНХРО для «${ready.title}»` : 'Работы окончены — обнова не запланирована');
      if (ready) toast('Таймер закончился — зайди в «Обновы» и жми СИНХРО', 'ok');
    }
    dirty = true;
  }

  if (dirty) renderAll();
  else {
    renderPills();
    renderMirror();
    if (document.querySelector('.view[data-view="screens"]').classList.contains('active')) {
      $('scrLeft').textContent = sc.type === 'infinite' ? '∞' : sc.endsAt > now ? clock(sc.endsAt - now) : '—';
    }
    if (document.querySelector('.view[data-view="events"]').classList.contains('active')) renderEvents();
  }
  save();
}

/* ============================================================
   ЗАПИСЬ В РЕАЛЬНЫЕ УЗЛЫ БАЗЫ. Схема совпадает со script.js:
     maintenance        {active, type:'timer'|'infinite', endTime, duration}
     events/halloween   {active, endTime, duration, goal}
     events/wheelEvent  {active, endTime, duration, spinCost}
     announcements/<id> {text, date, timestamp, isPinned}
     ban/<id>           {active, reason, endTime, isPermanent}
     users/<id>         money / dilicks / inventory / halloweenContribution
   update() пишет только наши поля — totalPool и topRewardsPaid не затираются.
   ============================================================ */
let lastPush = { maint: '', hw: '', wh: '', ann: {}, ban: {} };
const jkey = o => JSON.stringify(o);

function dbSet(path, data, note) {
  if (!FS.db) { toast('Firebase недоступен — только локально', 'warn'); return Promise.resolve(false); }
  return FS.db.ref(path).set(data)
    .then(() => { if (note) addLog('sync', note + ' → /' + path); return true; })
    .catch(e => { console.warn(e); addLog('err', 'Запись не удалась: /' + path); toast('Ошибка записи в Firebase', 'err'); return false; });
}
function dbUpdate(path, patch, note) {
  if (!FS.db) { toast('Firebase недоступен — только локально', 'warn'); return Promise.resolve(false); }
  return FS.db.ref(path).update(patch)
    .then(() => { if (note) addLog('sync', note + ' → /' + path); return true; })
    .catch(e => { console.warn(e); addLog('err', 'Обновление не удалось: /' + path); toast('Ошибка записи в Firebase', 'err'); return false; });
}
function dbRemove(path, note) {
  if (!FS.db) return Promise.resolve(false);
  return FS.db.ref(path).remove()
    .then(() => { if (note) addLog('sync', note + ' → /' + path); return true; })
    .catch(e => { console.warn(e); addLog('err', 'Удаление не удалось: /' + path); return false; });
}
function dbTx(path, fn) {
  if (!FS.db) return Promise.resolve(false);
  return FS.db.ref(path).transaction(fn)
    .then(() => true)
    .catch(e => { console.warn(e); addLog('err', 'Транзакция не прошла: /' + path); return false; });
}

/* экран работ -> maintenance */
function syncMaintenance() {
  if (!FS.db) return;
  const running = screenRunning();
  const timer = S.screens.type === 'timer' && running;
  const body = {
    active: running,
    type: S.screens.type,
    endTime: timer ? S.screens.endsAt : null,
    duration: timer ? Math.max(1, Math.round((S.screens.endsAt - (S.screens.startedAt || S.screens.endsAt)) / 1000)) : null
  };
  const key = jkey(body);
  if (key === lastPush.maint) return;
  lastPush.maint = key;
  FS.db.ref('maintenance').set(body).catch(e => console.warn('maintenance write failed', e));
}

/* ивенты -> events/halloween, events/wheelEvent */
function syncEvents() {
  if (!FS.db) return;
  const hw = S.events.halloween;
  const hwBody = { active: !!hw.active, endTime: hw.active ? hw.endsAt : null, duration: Math.round(hw.total / 1000), goal: hw.goal };
  const hwKey = jkey(hwBody);
  if (hwKey !== lastPush.hw) { lastPush.hw = hwKey; FS.db.ref('events/halloween').update(hwBody).catch(e => console.warn(e)); }
  const wh = S.events.wheel;
  const whBody = { active: !!wh.active, endTime: wh.active ? wh.endsAt : null, duration: Math.round(wh.total / 1000), spinCost: wh.spinCost };
  const whKey = jkey(whBody);
  if (whKey !== lastPush.wh) { lastPush.wh = whKey; FS.db.ref('events/wheelEvent').update(whBody).catch(e => console.warn(e)); }
}

/* анонсы -> announcements/<id> */
function syncAnnouncements() {
  if (!FS.db) return;
  const alive = {};
  S.announcements.forEach(a => {
    alive[a.id] = 1;
    const body = { text: a.text, date: dateStr(a.at), timestamp: a.at, isPinned: !!a.pinned };
    if (jkey(lastPush.ann[a.id]) !== jkey(body)) {
      lastPush.ann[a.id] = body;
      FS.db.ref('announcements/' + a.id).update(body).catch(e => console.warn(e));
    }
  });
  Object.keys(lastPush.ann).forEach(id => {
    if (!alive[id]) { delete lastPush.ann[id]; FS.db.ref('announcements/' + id).remove().catch(e => console.warn(e)); }
  });
}

/* баны -> ban/<id> */
function syncBans() {
  if (!FS.db) return;
  const alive = {};
  S.bans.forEach(b => {
    alive[b.id] = 1;
    const perm = !isFinite(b.until);
    const body = { active: true, reason: b.reason, endTime: perm ? null : b.until, isPermanent: perm };
    if (jkey(lastPush.ban[b.id]) !== jkey(body)) {
      lastPush.ban[b.id] = body;
      FS.db.ref('ban/' + b.id).set(body).catch(e => console.warn(e));
    }
  });
  Object.keys(lastPush.ban).forEach(id => {
    if (!alive[id]) { delete lastPush.ban[id]; FS.db.ref('ban/' + id).remove().catch(e => console.warn(e)); }
  });
}

function syncAll() {
  if (!FS.ready || !FS.db) return;
  syncMaintenance(); syncEvents(); syncAnnouncements(); syncBans();
}

function renderAll() {
  renderPills();
  renderUpd();
  renderScreens();
  renderEvents();
  renderSocial();
  renderPlayers();
  renderLog();
  save();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { $('modal').classList.remove('on'); closeAllPickers(null); }
});

/* ---------- загрузка состояния из Firebase ---------- */
async function bootFromFirebase() {
  if (FS.db) {
    try {
      const v = await FS.loadFromDb();
      if (v) S = Object.assign({}, DEFAULTS, v, { updates: mergeUpdates(v.updates) });
      addLog('ok', 'Состояние загружено из Firebase (/adminPreviewState)');
    } catch (e) {
      console.warn(e);
      addLog('err', 'Firebase недоступен — работаю на локальном кэше');
    }
  } else {
    addLog('warn', 'Firebase SDK не подключён — только локальный кэш');
  }
  attachRealtimeWatches();
}

/* список обнов берём из кода (UPDATES), состояние — из записи */
function mergeUpdates(rawList) {
  return UPDATES.map(u => {
    const found = Array.isArray(rawList) ? rawList.find(x => x && x.id === u.id) : null;
    return { id: u.id, theme: u.theme, title: u.title, active: !!(found && found.active), scheduled: !!(found && found.scheduled) };
  });
}

/* подписки на реальные узлы игры: обнова видела бы их в проде.
   Здесь preview-админка сама пишет в эти же пути (см. push* ниже),
   а подписки нужны, чтобы видеть изменения с других вкладок/устройств. */
function attachRealtimeWatches() {
  if (!FS.db) return;
  FS.db.ref('maintenance').on('value', snap => {
    const m = snap.val();
    if (!m) return;
    /* прод-семантика maintenance: {active, type: 'timer'|'infinite', endsAt}.
       Тему экранаpreview хранит у себя (в проде — отдельный узел screenTheme). */
    /* прод-схема узла: {active, type, endTime, duration}.
       Игнорируем собственное эхо — иначе только что запущенный таймер
       перезаписывался бы нул и «не запускался» вовсе. */
    const echo = jkey({ active: !!m.active, type: m.type || 'timer', endTime: m.endTime || null, duration: m.duration || null });
    if (echo === lastPush.maint) return;
    const endsAt = (m.active && m.endTime) ? Number(m.endTime) : 0;
    if (endsAt !== S.screens.endsAt) S.screens.startedAt = endsAt ? Date.now() : 0;
    S.screens.type = m.type === 'infinite' ? 'infinite' : 'timer';
    S.screens.endsAt = endsAt;
    S.screens.fired = false;
    renderScreens(); renderPills(); renderUpd();
  });
  FS.db.ref('events/halloween').on('value', snap => {
    const h = snap.val(); if (!h) return;
    S.events.halloween.active = !!h.active;
    S.events.halloween.total = (h.duration || (h.endTime && h.startTime ? h.endTime - h.startTime : 7 * 864e5));
    S.events.halloween.endsAt = h.endTime || 0;
    S.events.halloween.goal = h.goal ?? S.events.halloween.goal;
    if (typeof h.totalPool === 'number') S.pool = h.totalPool;
    renderEvents(); renderMirror();
  });
  FS.db.ref('events/wheelEvent').on('value', snap => {
    const w = snap.val(); if (!w) return;
    S.events.wheel.active = !!w.active;
    S.events.wheel.total = w.duration || S.events.wheel.total;
    S.events.wheel.endsAt = w.endTime || 0;
    S.events.wheel.spinCost = w.spinCost ?? S.events.wheel.spinCost;
    renderEvents(); renderMirror();
  });
  FS.db.ref('polls/current').on('value', snap => {
    S.poll = snap.val() || null;
    renderPoll();
  });
  FS.db.ref('announcements').on('value', snap => {
    const v = snap.val();
    S.announcements = v ? Object.keys(v).map(k => ({ id: k, text: v[k].text, at: v[k].timestamp || v[k].createdAt || Date.now(), pinned: !!v[k].isPinned })) : [];
    renderSocial();
  });
  FS.db.ref('ban').on('value', snap => {
    const v = snap.val() || {};
    S.bans = Object.keys(v).filter(k => v[k] && v[k].active !== false).map(k => ({
      id: k,
      name: (USERS_CACHE.find(u => u.id === k) || {}).name || k,
      reason: v[k].reason || 'без причины',
      until: v[k].isPermanent ? Infinity : (v[k].endTime || Infinity)
    }));
    renderPlayers();
  });
  FS.db.ref('users').on('value', snap => {
    const v = snap.val() || {};
    USERS_CACHE = Object.keys(v).map(id => ({
      id, name: (v[id].settings && v[id].settings.displayName) || v[id].username || id,
      username: v[id].username || ''
    })).sort((a, b) => a.name.localeCompare(b.name));
    renderPlayers();
  }, () => {});
}

$('adminUid').textContent = "UID: " + ADMIN_UID;   // в проде — реальный uid админа из Firebase
renderAll();
bootFromFirebase();
addLog('ok', 'Превью редизайна открыто — Firebase-слой активен');
setInterval(tick, 1000);
$('btnLog').addEventListener('click', () => { const on = $('logBadge').classList.toggle('on'); if (on) renderLog(); });