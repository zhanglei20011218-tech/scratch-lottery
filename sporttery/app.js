'use strict';

/* ═══════════════════════════════════════════════════════════
   中国体育彩票 · 顶呱刮 在线试刮
   数据来源：中国体彩网公开产品数据（tickets.js）
   非官方模拟器，不提供真实奖金。
   ═══════════════════════════════════════════════════════════ */

const TICKETS = Array.isArray(window.DGG_TICKETS) ? window.DGG_TICKETS : [];
const STORE_KEY = 'sporttery-dgg-v1';
const WIN_RATE = 0.33;

/* ─────────── 工具 ─────────── */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const fmt = (value) => '¥' + Math.round(value).toLocaleString('zh-CN');
const signedMoney = (value) =>
  (value > 0 ? '+' : value < 0 ? '−' : '') + fmt(Math.abs(value));
const shortMoney = (value) =>
  value >= 10000 ? `${+(value / 10000).toFixed(1)}万` : `${value}元`;
const pad2 = (value) => String(value).padStart(2, '0');

function formatTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const time = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  return date.toDateString() === now.toDateString()
    ? `今天 ${time}`
    : `${date.getMonth() + 1}/${date.getDate()} ${time}`;
}

function findTicket(id) {
  return TICKETS.find((ticket) => String(ticket.id) === String(id));
}

/* ─────────── 状态 ─────────── */

function defaultState() {
  return {
    balance: 100,
    spent: 0,
    won: 0,
    tickets: 0,
    wins: 0,
    best: 0,
    history: [],
  };
}

function loadState() {
  const base = defaultState();
  let raw = null;
  try {
    raw = localStorage.getItem(STORE_KEY);
  } catch {
    return base;
  }
  if (!raw) return base;

  try {
    const saved = JSON.parse(raw);
    if (!saved || typeof saved !== 'object') return base;
    return {
      balance: Number(saved.balance) || 0,
      spent: Number(saved.spent) || 0,
      won: Number(saved.won) || 0,
      tickets: Number(saved.tickets) || 0,
      wins: Number(saved.wins) || 0,
      best: Number(saved.best) || 0,
      history: Array.isArray(saved.history)
        ? saved.history
            .filter((entry) => entry && typeof entry === 'object' && entry.name)
            .slice(0, 30)
            .map((entry) => ({
              t: Number(entry.t) || Date.now(),
              name: String(entry.name),
              price: Number(entry.price) || 0,
              prize: Number(entry.prize) || 0,
            }))
        : [],
    };
  } catch {
    return base;
  }
}

let state = loadState();
let session = null;
let activePrice = 'all';
let query = '';

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    /* 隐私模式忽略 */
  }
}

/* ─────────── DOM ─────────── */

const racksEl = $('#rack');
const walletEl = $('#wallet');
const balanceEl = $('#balance');
const btnCharge = $('#btn-charge');
const btnChargeStats = $('#btn-charge-stats');
const btnStats = $('#btn-stats');
const btnReset = $('#btn-reset');
const priceChipsEl = $('#price-chips');
const searchEl = $('#search');
const resultCount = $('#result-count');

const statCount = $('#stat-count');
const statSpent = $('#stat-spent');
const statWon = $('#stat-won');
const statNet = $('#stat-net');

const playModal = $('#play-modal');
const closePlayBtn = $('#close-play');
const dggTicket = $('#dgg-ticket');
const scratchZone = $('#scratch-zone');
const canvas = $('#scratch-canvas');
const scratchHint = $('#scratch-hint');
const layerHead = $('#layer-head');
const layerMid = $('#layer-mid');
const layerResult = $('#layer-result');
const layerFoot = $('#layer-foot');

const ticketNameEl = $('#ticket-name');
const ticketPlayEl = $('#ticket-play');
const ticketPriceEl = $('#ticket-price');
const ticketRuleEl = $('#ticket-rule');
const ticketChanceEl = $('#ticket-chance');
const gradeListEl = $('#grade-list');
const rulesEl = $('#rules');

const stubSn = $('#stub-sn');
const stubChance = $('#stub-chance');
const stubBarcode = $('#stub-barcode');

const progressFill = $('#progress-fill');
const progressText = $('#progress-text');
const resultArea = $('#play-result');
const resultBadge = $('#result-badge');
const redeemBtn = $('#btn-redeem');
const resultActions = $('#result-actions');

const statsModal = $('#stats-modal');
const statsGrid = $('#stats-grid');
const historyList = $('#history-list');
const toastEl = $('#toast');

/* ─────────── 渲染票库 ─────────── */

function renderPriceChips() {
  const prices = [...new Set(TICKETS.map((ticket) => ticket.price))].sort(
    (a, b) => a - b
  );
  const options = [
    { value: 'all', label: '全部', count: TICKETS.length },
    ...prices.map((price) => ({
      value: String(price),
      label: `${price}元`,
      count: TICKETS.filter((ticket) => ticket.price === price).length,
    })),
  ];

  priceChipsEl.innerHTML = options
    .map(
      (option) => `
      <button class="chip${activePrice === option.value ? ' is-active' : ''}"
        type="button" data-price="${option.value}">
        ${option.label} <span class="chip-count">${option.count}</span>
      </button>`
    )
    .join('');
}

function filteredTickets() {
  const keyword = query.trim();
  return TICKETS.filter((ticket) => {
    if (activePrice !== 'all' && ticket.price !== Number(activePrice)) return false;
    if (!keyword) return true;
    return (
      ticket.name.includes(keyword) ||
      (ticket.play || '').includes(keyword) ||
      (ticket.rule || '').includes(keyword) ||
      (ticket.desc || '').includes(keyword)
    );
  });
}

function renderRack() {
  const list = filteredTickets();

  resultCount.textContent = query
    ? `搜索「${query}」：${list.length} 款`
    : `共 ${list.length} 款 · 面值 5–50 元 · 点击「试刮」开票`;

  if (!list.length) {
    racksEl.innerHTML = `<p class="empty">没有匹配的票种，换个关键词试试。</p>`;
    return;
  }

  racksEl.innerHTML = list
    .map(
      (ticket) => `
    <article class="ticket-card">
      <div class="card-art">
        <img src="${ticket.img}" alt="${ticket.name}票面" loading="lazy" decoding="async">
        <span class="card-price"><i>¥</i>${ticket.price}</span>
        ${ticket.tag ? `<span class="card-tag">${ticket.tag}</span>` : ''}
      </div>
      <div class="card-body">
        <h3>${ticket.name}</h3>
        <p class="card-play">${ticket.play || ticket.rule}</p>
        <div class="card-meta">
          <span>最高奖 <b>${shortMoney(ticket.maxAward)}</b></span>
          <span>${ticket.chance ? `${ticket.chance} 次机会` : ticket.faceValue}</span>
        </div>
        <button class="buy-btn" type="button" data-buy="${ticket.id}">
          试刮 ¥${ticket.price}
        </button>
      </div>
    </article>`
    )
    .join('');

  renderBuyButtons();
}

function renderBuyButtons() {
  $$('.buy-btn', racksEl).forEach((button) => {
    const ticket = findTicket(button.dataset.buy);
    if (!ticket) return;
    const short = state.balance < ticket.price;
    button.classList.toggle('is-insufficient', short);
    button.textContent = short ? '余额不足' : `试刮 ¥${ticket.price}`;
  });
}

function renderWallet(bump = false) {
  balanceEl.textContent = fmt(state.balance);
  renderBuyButtons();

  if (bump) {
    walletEl.classList.remove('is-bumping');
    void walletEl.offsetWidth;
    walletEl.classList.add('is-bumping');
  }
}

function renderLedger() {
  const net = state.won - state.spent;
  statCount.textContent = `${state.tickets} 张`;
  statSpent.textContent = fmt(state.spent);
  statWon.textContent = fmt(state.won);
  statNet.textContent = signedMoney(net);
  statNet.classList.toggle('is-gain', net > 0);
  statNet.classList.toggle('is-loss', net < 0);
}

/* ─────────── 账本 ─────────── */

function renderStatsPanel() {
  const net = state.won - state.spent;
  const cards = [
    ['已试刮', `${state.tickets} 张`, ''],
    ['中奖张数', `${state.wins} 张`, ''],
    ['中奖率', state.tickets ? `${((state.wins / state.tickets) * 100).toFixed(1)}%` : '—', ''],
    ['累计投入', fmt(state.spent), ''],
    ['累计中奖', fmt(state.won), ''],
    ['净盈亏', signedMoney(net), net > 0 ? 'is-gain' : net < 0 ? 'is-loss' : ''],
    ['最高单张', state.best ? fmt(state.best) : '—', ''],
    ['当前余额', fmt(state.balance), ''],
  ];

  statsGrid.innerHTML = cards
    .map(
      ([label, value, cls]) => `
      <div class="stat-card"><span>${label}</span><b class="${cls}">${value}</b></div>`
    )
    .join('');

  if (!state.history.length) {
    historyList.innerHTML = `<li class="history-empty">还没有试刮记录，去票库挑一张吧。</li>`;
  } else {
    historyList.innerHTML = state.history
      .slice(0, 12)
      .map(
        (entry) => `
      <li>
        <span>
          <span class="history-name">${entry.name}</span>
          <span class="history-meta">¥${entry.price} · ${formatTime(entry.t)}</span>
        </span>
        <span class="history-prize ${entry.prize > 0 ? '' : 'is-zero'}">
          ${entry.prize > 0 ? `+${fmt(entry.prize)}` : '未中奖'}
        </span>
      </li>`
      )
      .join('');
  }
}

function openStats() {
  renderStatsPanel();
  statsModal.hidden = false;
  document.body.classList.add('is-locked');
}

function closeStats() {
  statsModal.hidden = true;
  if (playModal.hidden) document.body.classList.remove('is-locked');
}

/* ─────────── 提示 ─────────── */

let toastTimer = 0;
function toast(message, duration = 2200) {
  toastEl.textContent = message;
  toastEl.classList.add('is-show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastEl.classList.remove('is-show'), duration);
}

function shakeWallet() {
  walletEl.classList.remove('is-shaking');
  void walletEl.offsetWidth;
  walletEl.classList.add('is-shaking');
  window.setTimeout(() => walletEl.classList.remove('is-shaking'), 460);
}

/* ─────────── 抽奖 ─────────── */

function drawPrize(ticket) {
  if (Math.random() > WIN_RATE) return 0;

  // 官方中奖图层上印有固定金额，结果必须与票面一致
  const official = Number(ticket.awardMoney);
  if (official > 0) return official;

  const grades =
    Array.isArray(ticket.grades) && ticket.grades.length
      ? ticket.grades
      : [ticket.price];
  return grades[grades.length - 1];
}

/* ─────────── 购买与开票 ─────────── */

function buyTicket(ticket) {
  if (state.balance < ticket.price) {
    shakeWallet();
    toast(`余额不足，还差 ${fmt(ticket.price - state.balance)}，可点「充值」`);
    return;
  }

  if (session) settle();

  state.balance -= ticket.price;
  state.spent += ticket.price;
  state.tickets += 1;
  save();
  renderWallet(true);
  renderLedger();
  renderStatsPanel();

  openPlay(ticket);
}

function generateSerial() {
  const now = new Date();
  const date =
    `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`;
  const random = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
  return date + random;
}

function renderStubBarcode(element) {
  if (!element) return;
  const count = window.innerWidth > 720 ? 180 : 130;
  const bars = [];
  for (let index = 0; index < count; index += 1) {
    const wide = Math.random() < 0.3;
    bars.push(`<i style="width:${wide ? 2.5 : 1}px"></i>`);
  }
  element.innerHTML = bars.join('');
}

function openPlay(ticket) {
  const prize = drawPrize(ticket);
  session = {
    ticket,
    prize,
    revealed: false,
    redeemed: false,
    settled: false,
  };

  // 官方三图层票面
  layerHead.src = ticket.head;
  layerMid.src = ticket.mid;
  layerFoot.src = ticket.foot;
  layerResult.src = prize > 0 ? ticket.award : ticket.noAward;
  layerResult.alt = prize > 0 ? '中奖图层' : '未中奖图层';

  ticketNameEl.textContent = ticket.name;
  ticketPlayEl.textContent = ticket.play || '即开型彩票';
  ticketPriceEl.textContent = ticket.price;
  ticketRuleEl.textContent = ticket.rule || '刮开覆盖膜，按票面规则兑奖。';
  ticketChanceEl.textContent = ticket.chance ? `中奖机会 ${ticket.chance} 次` : '';
  rulesEl.open = false;

  stubSn.textContent = generateSerial();
  stubChance.textContent = ticket.chance ? `${ticket.chance} 次` : '—';
  renderStubBarcode(stubBarcode);

  gradeListEl.innerHTML = ticket.grades
    .map(
      (amount, index) => `
      <div class="grade-row">
        <span>${index === 0 ? '一等奖' : `${index + 1}等奖`}</span>
        <b>${fmt(amount)}</b>
      </div>`
    )
    .join('');

  resultArea.hidden = true;
  resultArea.classList.remove('is-win');
  resultBadge.innerHTML = '';
  redeemBtn.hidden = true;
  redeemBtn.disabled = false;
  redeemBtn.textContent = '兑奖入账';

  progressFill.style.width = '0%';
  progressText.textContent = '已刮开 0%';
  scratchHint.hidden = false;

  canvas.hidden = false;
  canvas.style.pointerEvents = '';
  canvas.classList.remove('is-fading');

  playModal.hidden = false;
  document.body.classList.add('is-locked');
  requestAnimationFrame(() => requestAnimationFrame(() => initScratch()));
}

/* ─────────── Canvas 刮涂层 ─────────── */

let ctx = null;
let dpr = 1;
let scratching = false;
let lastPoint = null;
let moveTick = 0;

function initScratch() {
  if (!session || session.revealed) return;
  const width = scratchZone.clientWidth;
  const height = scratchZone.clientHeight;
  if (width < 10 || height < 10) return;

  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawCoating(width, height);

  scratching = false;
  lastPoint = null;
  moveTick = 0;
}

function drawCoating(width, height) {
  if (!ctx) return;

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#d5cfc2');
  gradient.addColorStop(0.45, '#bdb6a7');
  gradient.addColorStop(1, '#aaa293');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  for (let x = -height; x < width + height; x += 14) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + height, height);
    ctx.stroke();
  }
  ctx.restore();

  const fontSize = Math.max(13, Math.min(18, width * 0.038));
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(62, 52, 38, 0.58)';
  ctx.font = `800 ${fontSize}px ${getComputedStyle(document.body).fontFamily}`;
  ctx.fillText('刮 开 涂 层', width / 2, height / 2 - 2);
  ctx.fillStyle = 'rgba(62, 52, 38, 0.38)';
  ctx.font = `600 ${Math.max(9, fontSize * 0.58)}px ${getComputedStyle(document.body).fontFamily}`;
  ctx.fillText('按住鼠标 / 手指左右涂抹', width / 2, height / 2 + fontSize * 0.95);
  ctx.restore();

  ctx.save();
  ctx.setLineDash([4, 6]);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.strokeRect(5.5, 5.5, width - 11, height - 11);
  ctx.restore();
}

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
}

function scratchDot(point) {
  if (!ctx) return;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(point.x, point.y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function scratchLine(from, to) {
  if (!ctx) return;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineWidth = 26;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.restore();
}

function scratchRatio() {
  if (!ctx) return 0;
  const width = canvas.width;
  const height = canvas.height;
  if (!width || !height) return 0;

  let pixels;
  try {
    pixels = ctx.getImageData(0, 0, width, height).data;
  } catch {
    return 0;
  }

  const step = Math.max(4, Math.round(10 * dpr));
  let cleared = 0;
  let total = 0;
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      total += 1;
      if (pixels[(y * width + x) * 4 + 3] < 40) cleared += 1;
    }
  }
  return total ? cleared / total : 0;
}

function updateProgress() {
  if (!session || session.revealed) return;
  const ratio = scratchRatio();
  const shown = Math.min(0.99, ratio);
  progressFill.style.width = `${(shown * 100).toFixed(1)}%`;
  progressText.textContent = `已刮开 ${Math.round(shown * 100)}%`;
  if (ratio >= 0.5) reveal();
}

function reveal() {
  const current = session;
  if (!current || current.revealed) return;

  current.revealed = true;
  scratching = false;
  lastPoint = null;
  scratchHint.hidden = true;
  progressFill.style.width = '100%';
  progressText.textContent = '已刮开 100%';
  canvas.classList.add('is-fading');
  canvas.style.pointerEvents = 'none';

  window.setTimeout(() => {
    if (session === current) canvas.hidden = true;
  }, 360);

  window.setTimeout(() => {
    if (session !== current) return;
    showResult();
  }, 280);
}

canvas.addEventListener('pointerdown', (event) => {
  if (!session || session.revealed) return;
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();

  if (canvas.setPointerCapture) {
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  }

  scratching = true;
  const point = canvasPoint(event);
  lastPoint = point;
  scratchDot(point);
  scratchHint.hidden = true;
  updateProgress();
});

canvas.addEventListener('pointermove', (event) => {
  if (!scratching || !session || session.revealed) return;
  event.preventDefault();
  const point = canvasPoint(event);
  if (lastPoint) scratchLine(lastPoint, point);
  else scratchDot(point);
  lastPoint = point;

  moveTick += 1;
  if (moveTick % 6 === 0) updateProgress();
});

function endScratch() {
  scratching = false;
  lastPoint = null;
}

canvas.addEventListener('pointerup', endScratch);
canvas.addEventListener('pointercancel', endScratch);
canvas.addEventListener('lostpointercapture', endScratch);
canvas.addEventListener('pointerleave', (event) => {
  if (event.buttons === 0) endScratch();
});

window.addEventListener('resize', () => {
  if (session && !session.revealed && !playModal.hidden) {
    window.clearTimeout(window.__scratchResizeTimer);
    window.__scratchResizeTimer = window.setTimeout(() => {
      if (!session || session.revealed) return;
      initScratch();
      progressFill.style.width = '0%';
      progressText.textContent = '已刮开 0%';
    }, 220);
  }
});

/* ─────────── 结果与结算 ─────────── */

function showResult() {
  if (!session) return;
  const { prize, redeemed } = session;
  const won = prize > 0;

  resultArea.hidden = false;
  resultArea.classList.toggle('is-win', won);

  resultBadge.innerHTML = won
    ? `<span class="result-kicker">恭喜中奖</span><strong class="result-amount">+${fmt(prize)}</strong>`
    : `<span class="result-kicker">谢谢惠顾</span><span class="result-amount is-muted">下一张好运</span>`;

  redeemBtn.hidden = !won;
  if (won) {
    redeemBtn.disabled = redeemed;
    redeemBtn.textContent = redeemed ? `已入账 ${fmt(prize)}` : `兑奖入账 ${fmt(prize)}`;
  }
}

function redeem(silent = false) {
  if (!session || session.prize <= 0 || session.redeemed) return;

  const { prize } = session;
  session.redeemed = true;
  state.balance += prize;
  state.won += prize;
  state.wins += 1;
  state.best = Math.max(state.best, prize);
  save();
  renderWallet(true);
  renderLedger();
  renderStatsPanel();

  if (!silent) {
    showResult();
    toast(`已兑奖 ${fmt(prize)}，余额 ${fmt(state.balance)}`);
  }
}

function recordHistory() {
  if (!session) return;
  const { ticket, prize } = session;
  state.history.unshift({
    t: Date.now(),
    name: ticket.name,
    price: ticket.price,
    prize,
  });
  state.history = state.history.slice(0, 30);
  save();
  renderStatsPanel();
}

function settle() {
  if (!session || session.settled) return;
  session.settled = true;
  if (session.prize > 0 && !session.redeemed) redeem(true);
  recordHistory();
}

function closePlay() {
  if (!session) {
    playModal.hidden = true;
    document.body.classList.remove('is-locked');
    return;
  }

  const current = session;
  const wasRevealed = current.revealed;
  const wasRedeemed = current.redeemed;

  if (!wasRevealed) current.revealed = true;
  settle();
  playModal.hidden = true;
  document.body.classList.remove('is-locked');
  session = null;

  if (current.prize > 0) {
    toast(
      wasRedeemed
        ? `这张已兑奖 ${fmt(current.prize)}`
        : `奖金 ${fmt(current.prize)} 已自动兑入余额`
    );
  } else if (!wasRevealed) {
    toast('这张没中，下张好运');
  }
}

function playAgain() {
  if (!session) return;
  const { ticket } = session;
  settle();

  if (state.balance < ticket.price) {
    shakeWallet();
    showResult();
    toast(`余额不足，还差 ${fmt(ticket.price - state.balance)}`);
    return;
  }

  buyTicket(ticket);
}

/* ─────────── 账本操作 ─────────── */

function charge() {
  state.balance += 100;
  save();
  renderWallet(true);
  renderLedger();
  renderStatsPanel();
  toast('已模拟充值 ¥100');
}

function resetAll() {
  const confirmed = window.confirm('确定清空所有试刮记录并重新开始吗？此操作不可撤销。');
  if (!confirmed) return;

  state = defaultState();
  save();
  renderWallet();
  renderLedger();
  renderStatsPanel();
  closeStats();
  toast('已重新开始，余额 ¥100');
}

/* ─────────── 事件 ─────────── */

priceChipsEl.addEventListener('click', (event) => {
  const chip = event.target.closest('[data-price]');
  if (!chip) return;
  activePrice = chip.dataset.price;
  renderPriceChips();
  renderRack();
});

let searchTimer = 0;
searchEl.addEventListener('input', () => {
  window.clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => {
    query = searchEl.value;
    renderRack();
  }, 120);
});

racksEl.addEventListener('click', (event) => {
  const button = event.target.closest('[data-buy]');
  if (!button) return;
  const ticket = findTicket(button.dataset.buy);
  if (ticket) buyTicket(ticket);
});

resultActions.addEventListener('click', (event) => {
  const button = event.target.closest('[data-act]');
  if (!button) return;
  const action = button.dataset.act;

  if (action === 'redeem') redeem(false);
  else if (action === 'again') playAgain();
  else if (action === 'stop') closePlay();
});

closePlayBtn.addEventListener('click', closePlay);
$('[data-close-play]').addEventListener('click', closePlay);
$('#close-stats').addEventListener('click', closeStats);
$('[data-close-stats]').addEventListener('click', closeStats);
btnStats.addEventListener('click', openStats);
btnCharge.addEventListener('click', charge);
btnChargeStats.addEventListener('click', charge);
btnReset.addEventListener('click', resetAll);

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!playModal.hidden) closePlay();
  else if (!statsModal.hidden) closeStats();
});

/* ─────────── 启动 ─────────── */

function init() {
  if (!TICKETS.length) {
    racksEl.innerHTML = `<p class="empty">票种数据加载失败，请刷新页面重试。</p>`;
    resultCount.textContent = '';
    renderWallet();
    renderLedger();
    renderStatsPanel();
    return;
  }

  renderPriceChips();
  renderRack();
  renderWallet();
  renderLedger();
  renderStatsPanel();
}

init();
