'use strict';

/* ═══════════════════════════════════════════════════════════
   福彩刮刮乐 · 模拟器
   票种价位与奖级结构参考市面常见即开票，数值为模拟数据。
   ═══════════════════════════════════════════════════════════ */

const PER = 1000000; // 每个票种的模拟发行量（张），用于换算中奖率

const TICKETS = [
  {
    id: 'fajiangjin',
    name: '发奖金',
    price: 2,
    mode: 'find',
    playLabel: '找金币',
    emoji: '🧧',
    series: '经典票',
    tagline: '刮出金币就中奖，2 元也能搏个好彩头',
    rule: '刮出「金币 🪙」图符，即中该格所示奖金',
    winSymbol: '🪙',
    symbolPool: ['🧧', '🏮', '🍊', '🎁', '🍀'],
    grid: 6,
    theme: { a: '#ff9f45', b: '#d9342b', accent: '#b81c24' },
    prizeTable: [
      [50000, 1],
      [5000, 20],
      [500, 100],
      [100, 1000],
      [20, 6000],
      [10, 15000],
      [5, 70000],
      [2, 120000],
    ],
  },
  {
    id: 'wufu',
    name: '五福临门',
    price: 5,
    mode: 'find',
    playLabel: '找福字',
    emoji: '🏮',
    series: '人气票',
    tagline: '刮出「福」字就中奖，讨个五福临门的好彩头',
    rule: '刮出「福」字，即中该格所示奖金',
    winSymbol: '福',
    symbolPool: ['寿', '喜', '财', '禄', '康'],
    grid: 9,
    theme: { a: '#f2b544', b: '#c22a2a', accent: '#b81c24' },
    prizeTable: [
      [150000, 1],
      [10000, 10],
      [1000, 100],
      [200, 1000],
      [50, 8000],
      [20, 20000],
      [10, 50000],
      [5, 260000],
    ],
  },
  {
    id: 'baifa',
    name: '百发百中',
    price: 10,
    mode: 'match',
    playLabel: '号码匹配',
    emoji: '🎯',
    series: '经典票',
    tagline: '中奖号码对号入座，10 元冲击 30 万',
    rule: '「我的号码」与「中奖号码」相同，即中该号码下方奖金',
    theme: { a: '#3aa0f5', b: '#1a4fa8', accent: '#1656b8' },
    prizeTable: [
      [300000, 1],
      [20000, 5],
      [5000, 30],
      [1000, 200],
      [200, 2000],
      [100, 6000],
      [50, 20000],
      [20, 60000],
      [10, 255000],
    ],
  },
  {
    id: 'dianshichengjin',
    name: '点石成金',
    price: 20,
    mode: 'matchBonus',
    playLabel: '号码+金币',
    emoji: '💰',
    series: '畅销票',
    tagline: '号码对得上，或刮出金币，奖金都归你',
    rule: '「我的号码」与「中奖号码」相同，或刮出「金币」，即中所示奖金',
    bonusSymbol: '🪙',
    bonusCount: 2,
    symbolPool: ['🧧', '🏮', '🍊', '🎁', '🍀'],
    theme: { a: '#f6cf65', b: '#b8801c', accent: '#9a6d12' },
    prizeTable: [
      [1000000, 1],
      [20000, 10],
      [5000, 50],
      [1000, 400],
      [500, 1000],
      [200, 8000],
      [100, 10000],
      [50, 40000],
      [20, 300000],
    ],
  },
  {
    id: 'xingfujiabei',
    name: '幸福加倍',
    price: 30,
    mode: 'matchMultiplier',
    playLabel: '奖金×2',
    emoji: '🎁',
    series: '新票上市',
    tagline: '号码一碰，奖金翻倍，最高奖 100 万',
    rule: '「我的号码」与「中奖号码」相同，即中该号码下方奖金 ×2',
    multiplier: 2,
    theme: { a: '#ef5da8', b: '#9c1c72', accent: '#a3237d' },
    prizeTable: [
      [1000000, 1],
      [50000, 4],
      [10000, 20],
      [2000, 100],
      [500, 1000],
      [200, 5000],
      [100, 20000],
      [60, 30000],
      [30, 400000],
    ],
  },
  {
    id: 'dajidali',
    name: '大吉大利',
    price: 50,
    mode: 'matchBonus',
    playLabel: '号码+吉字',
    emoji: '🍊',
    series: '高端票',
    tagline: '号码对得上，或刮出「吉」字，最高奖 150 万',
    rule: '「我的号码」与「中奖号码」相同，或刮出「吉」字，即中所示奖金',
    bonusSymbol: '吉',
    bonusCount: 2,
    symbolPool: ['福', '禄', '寿', '喜', '财'],
    theme: { a: '#2fa36b', b: '#0d5c42', accent: '#0d6b4b' },
    prizeTable: [
      [1500000, 1],
      [100000, 2],
      [10000, 20],
      [2000, 200],
      [1000, 1000],
      [500, 5000],
      [200, 20000],
      [100, 60000],
      [50, 330000],
    ],
  },
];

// 预计算返奖率 / 中奖率 / 最高奖
for (const ticket of TICKETS) {
  ticket.topPrize = Math.max(...ticket.prizeTable.map(([amount]) => amount));
  const winCount = ticket.prizeTable.reduce((sum, [, count]) => sum + count, 0);
  const payout = ticket.prizeTable.reduce((sum, [amount, count]) => sum + amount * count, 0);
  ticket.winRate = winCount / PER;
  ticket.returnRate = payout / (ticket.price * PER);
}

/* ═══════════════════════════ 工具函数 ═══════════════════════════ */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const fmt = (value) => '¥' + Math.round(value).toLocaleString('zh-CN');
const signedMoney = (value) =>
  (value > 0 ? '+' : value < 0 ? '−' : '') + fmt(Math.abs(value));
const shortMoney = (value) =>
  value >= 10000 ? `${+(value / 10000).toFixed(1)}万` : `${value}元`;
const pct = (value) => `${(value * 100).toFixed(1)}%`;
const pad2 = (value) => String(value).padStart(2, '0');
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (list) => list[Math.floor(Math.random() * list.length)];

/* ═══════════════════════════ 持久化状态 ═══════════════════════════ */

const STORE_KEY = 'fucai-scratch-v1';

function defaultState() {
  const byTicket = {};
  for (const ticket of TICKETS) {
    byTicket[ticket.id] = { count: 0, spent: 0, won: 0 };
  }
  return {
    balance: 100,
    spent: 0,
    won: 0,
    tickets: 0,
    wins: 0,
    best: 0,
    soundOn: true,
    byTicket,
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

    const state = {
      ...base,
      balance: Number(saved.balance) || 0,
      spent: Number(saved.spent) || 0,
      won: Number(saved.won) || 0,
      tickets: Number(saved.tickets) || 0,
      wins: Number(saved.wins) || 0,
      best: Number(saved.best) || 0,
      soundOn: saved.soundOn !== false,
    };

    for (const ticket of TICKETS) {
      const record = saved.byTicket?.[ticket.id];
      if (record) {
        state.byTicket[ticket.id] = {
          count: Number(record.count) || 0,
          spent: Number(record.spent) || 0,
          won: Number(record.won) || 0,
        };
      }
    }

    if (Array.isArray(saved.history)) {
      state.history = saved.history
        .filter((entry) => entry && typeof entry === 'object' && entry.name)
        .slice(0, 30)
        .map((entry) => ({
          t: Number(entry.t) || Date.now(),
          id: String(entry.id || ''),
          name: String(entry.name),
          price: Number(entry.price) || 0,
          prize: Number(entry.prize) || 0,
        }));
    }

    return state;
  } catch {
    return base;
  }
}

let state = loadState();
let session = null;

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch {
    /* 隐私模式下忽略写入失败 */
  }
}

/* ═══════════════════════════ DOM 引用 ═══════════════════════════ */

const racksEl = $('#racks');
const walletEl = $('#wallet');
const balanceEl = $('#balance');
const btnCharge = $('#btn-charge');
const btnChargeStats = $('#btn-charge-stats');
const btnSound = $('#btn-sound');
const btnStats = $('#btn-stats');
const btnReset = $('#btn-reset');

const statCount = $('#stat-count');
const statSpent = $('#stat-spent');
const statWon = $('#stat-won');
const statNet = $('#stat-net');

const playModal = $('#play-modal');
const ticketEl = $('#ticket');
const scratchWrap = $('#ticket-scratch');
const faceEl = $('#ticket-face');
const canvas = $('#scratch-canvas');
const scratchHint = $('#scratch-hint');
const ticketNameEl = $('#ticket-name');
const ticketSeriesEl = $('#ticket-series');
const ticketRuleEl = $('#ticket-rule');
const ticketPriceEl = $('#ticket-price');
const ticketTopEl = $('#ticket-top');
const ticketSnEl = $('#ticket-sn');
const ticketBarcodeEl = $('#ticket-barcode');
const progressFill = $('#progress-fill');
const progressText = $('#progress-text');
const resultArea = $('#result-area');
const resultBadge = $('#result-badge');
const redeemBtn = $('#btn-redeem');

const statsModal = $('#stats-modal');
const statsGrid = $('#stats-grid');
const statsByTicket = $('#stats-by-ticket');
const historyList = $('#history-list');
const toastEl = $('#toast');
const confettiCanvas = $('#confetti');
const confettiCtx = confettiCanvas.getContext('2d');

/* ═══════════════════════════ 渲染 ═══════════════════════════ */

function renderRacks() {
  racksEl.innerHTML = TICKETS.map(
    (ticket, index) => `
    <article class="ticket-card" style="--a:${ticket.theme.a};--b:${ticket.theme.b};--i:${index}">
      <div class="card-ticket" aria-hidden="true">
        <div class="card-crown">
          <div class="card-brand">
            <span class="card-brand-name">中国福利彩票</span>
            <span class="card-brand-sub">刮刮乐</span>
          </div>
          <span class="card-price"><i>¥</i>${ticket.price}</span>
          <span class="card-emoji">${ticket.emoji}</span>
          <h3 class="card-title">${ticket.name}</h3>
          <span class="card-series">${ticket.series}</span>
        </div>
        <div class="card-scratch">
          <span class="card-scratch-tag">刮开区</span>
          <span class="card-scratch-stripes"></span>
          <span class="card-scratch-hint">刮开涂层</span>
        </div>
        <div class="card-bottom">
          <span>最高奖 <b>${shortMoney(ticket.topPrize)}</b></span>
          <span class="card-barcode"></span>
        </div>
      </div>
      <div class="card-body">
        <div class="card-title-row">
          <h3>${ticket.name}</h3>
          <span class="card-play">${ticket.playLabel}</span>
        </div>
        <p class="card-tagline">${ticket.tagline}</p>
        <div class="card-meta">
          <span>中奖率 <b>${pct(ticket.winRate)}</b></span>
          <span>返奖率 <b>${pct(ticket.returnRate)}</b></span>
        </div>
        <button class="buy-btn" type="button" data-buy="${ticket.id}">
          <span>买一张</span><b>¥${ticket.price}</b>
        </button>
      </div>
    </article>`
  ).join('');
}

function renderWallet(bump = false) {
  balanceEl.textContent = fmt(state.balance);

  $$('.buy-btn', racksEl).forEach((button) => {
    const ticket = TICKETS.find((item) => item.id === button.dataset.buy);
    if (!ticket) return;
    const short = state.balance < ticket.price;
    button.classList.toggle('is-insufficient', short);
    const label = $('span', button);
    if (label) label.textContent = short ? '余额不足' : '买一张';
  });

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

function formatTime(timestamp) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const time = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  return sameDay ? `今天 ${time}` : `${date.getMonth() + 1}/${date.getDate()} ${time}`;
}

function renderStatsPanel() {
  const net = state.won - state.spent;
  const cards = [
    ['已刮张数', `${state.tickets} 张`, ''],
    ['中奖张数', `${state.wins} 张`, ''],
    ['中奖率', state.tickets ? pct(state.wins / state.tickets) : '—', ''],
    ['累计投入', fmt(state.spent), ''],
    ['累计中奖', fmt(state.won), ''],
    ['净盈亏', signedMoney(net), net > 0 ? 'is-gain' : net < 0 ? 'is-loss' : ''],
    ['最高单张', state.best ? fmt(state.best) : '—', ''],
    ['当前余额', fmt(state.balance), ''],
  ];

  statsGrid.innerHTML = cards
    .map(
      ([label, value, cls]) => `
      <div class="stat-card">
        <span>${label}</span>
        <b class="${cls}">${value}</b>
      </div>`
    )
    .join('');

  const played = TICKETS.some((ticket) => (state.byTicket[ticket.id]?.count || 0) > 0);
  if (!played) {
    statsByTicket.innerHTML = `<tr><td class="table-empty" colspan="5">还没有刮过，去票架挑一张吧</td></tr>`;
  } else {
    statsByTicket.innerHTML = TICKETS.map((ticket) => {
      const record = state.byTicket[ticket.id] || { count: 0, spent: 0, won: 0 };
      if (!record.count) {
        return `<tr><td>${ticket.name}</td><td>0</td><td>¥0</td><td>¥0</td><td>—</td></tr>`;
      }
      const rowNet = record.won - record.spent;
      return `<tr>
        <td>${ticket.name}</td>
        <td>${record.count}</td>
        <td>${fmt(record.spent)}</td>
        <td>${fmt(record.won)}</td>
        <td class="${rowNet > 0 ? 'is-gain' : rowNet < 0 ? 'is-loss' : ''}">${signedMoney(rowNet)}</td>
      </tr>`;
    }).join('');
  }

  if (!state.history.length) {
    historyList.innerHTML = `<li class="history-empty">还没有刮过，去票架挑一张吧。</li>`;
  } else {
    historyList.innerHTML = state.history
      .slice(0, 10)
      .map(
        (entry) => `
      <li>
        <span class="history-main">
          <span class="history-name">${entry.name}</span>
          <span class="history-time">${formatTime(entry.t)}</span>
        </span>
        <span class="history-prize ${entry.prize > 0 ? '' : 'is-zero'}">
          ${entry.prize > 0 ? `+${fmt(entry.prize)}` : '未中奖'}
        </span>
      </li>`
      )
      .join('');
  }
}

function updateSoundButton() {
  btnSound.classList.toggle('is-off', !state.soundOn);
  btnSound.setAttribute('aria-pressed', String(state.soundOn));
  btnSound.setAttribute('aria-label', state.soundOn ? '关闭音效' : '开启音效');
}

/* ═══════════════════════════ 弹层控制 ═══════════════════════════ */

function openModal(element) {
  element.hidden = false;
  document.body.classList.add('is-locked');
}

function closeModal(element) {
  element.hidden = true;
  if (playModal.hidden && statsModal.hidden) {
    document.body.classList.remove('is-locked');
  }
}

let toastTimer = 0;
function toast(message, duration = 2400) {
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

/* ═══════════════════════════ 购买流程 ═══════════════════════════ */

function drawPrize(ticket) {
  let roll = Math.random() * PER;
  for (const [amount, count] of ticket.prizeTable) {
    if (roll < count) return amount;
    roll -= count;
  }
  return 0;
}

function generateSerial() {
  const now = new Date();
  const date =
    `${now.getFullYear()}${pad2(now.getMonth() + 1)}${pad2(now.getDate())}`;
  const random = String(Math.floor(Math.random() * 100000000)).padStart(8, '0');
  return date + random;
}

function renderBarcode(element) {
  if (!element) return;
  const bars = [];
  for (let index = 0; index < 90; index += 1) {
    const wide = Math.random() < 0.32;
    bars.push(`<i style="width:${wide ? 2.5 : 1}px"></i>`);
  }
  element.innerHTML = bars.join('');
}

function buyTicket(ticket) {
  if (state.balance < ticket.price) {
    shakeWallet();
    toast(`余额不足，还差 ${fmt(ticket.price - state.balance)}，可点「充值」继续`);
    return;
  }

  if (session) settle();

  ensureAudio();
  state.balance -= ticket.price;
  state.spent += ticket.price;
  state.tickets += 1;

  if (!state.byTicket[ticket.id]) {
    state.byTicket[ticket.id] = { count: 0, spent: 0, won: 0 };
  }
  state.byTicket[ticket.id].count += 1;
  state.byTicket[ticket.id].spent += ticket.price;

  save();
  renderWallet(true);
  renderLedger();
  renderStatsPanel();
  playBuySound();

  openTicket(ticket);
}

function openTicket(ticket) {
  const prize = drawPrize(ticket);
  session = {
    ticket,
    prize,
    revealed: false,
    redeemed: false,
    settled: false,
  };

  ticketEl.style.setProperty('--ticket-accent', ticket.theme.accent);
  ticketEl.style.setProperty('--ticket-a', ticket.theme.a);
  ticketEl.style.setProperty('--ticket-b', ticket.theme.b);
  ticketEl.classList.remove('is-settled');
  ticketSeriesEl.textContent = `刮刮乐 · ${ticket.series}`;
  ticketNameEl.textContent = ticket.name;
  ticketRuleEl.textContent = ticket.rule;
  ticketPriceEl.textContent = `¥${ticket.price}`;
  ticketTopEl.textContent = shortMoney(ticket.topPrize);
  ticketSnEl.textContent = generateSerial();
  renderBarcode(ticketBarcodeEl);
  faceEl.innerHTML = buildFace(ticket, prize);

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

  openModal(playModal);
  requestAnimationFrame(() => requestAnimationFrame(() => initScratch()));
}

/* ═══════════════════════════ 票面生成 ═══════════════════════════ */

function decoyAmount(ticket) {
  const limit = Math.max(ticket.price * 20, 100);
  const pool = ticket.prizeTable
    .map(([amount]) => amount)
    .filter((amount) => amount >= ticket.price && amount <= limit);
  return pool.length ? pick(pool) : ticket.price;
}

function buildFace(ticket, prize) {
  switch (ticket.mode) {
    case 'find':
      return buildFindFace(ticket, prize);
    case 'match':
      return buildMatchFace(ticket, prize, { count: 9 });
    case 'matchBonus':
      return buildMatchFace(ticket, prize, {
        count: 8,
        bonus: {
          symbol: ticket.bonusSymbol,
          count: ticket.bonusCount,
          pool: ticket.symbolPool,
        },
      });
    case 'matchMultiplier':
      return buildMatchFace(ticket, prize, {
        count: 9,
        multiplier: ticket.multiplier,
      });
    default:
      return '';
  }
}

function isHan(symbol) {
  return /^[\u4e00-\u9fa5]$/.test(symbol);
}

function buildMatchFace(ticket, prize, options = {}) {
  const { count = 9, bonus = null, multiplier = 1 } = options;
  const target = randInt(1, 99);

  // 双玩法票种：中奖时随机走“号码匹配”或“特殊图符”
  let hitMode = null;
  if (prize > 0) {
    hitMode = bonus && Math.random() < 0.45 ? 'bonus' : 'number';
  }

  const baseAmount = prize > 0 ? prize / multiplier : 0;
  const numberHitIndex = hitMode === 'number' ? randInt(0, count - 1) : -1;
  const cells = [];

  for (let index = 0; index < count; index += 1) {
    if (index === numberHitIndex) {
      cells.push({ num: target, amount: baseAmount, hit: true });
    } else {
      let num = randInt(1, 99);
      while (num === target) num = randInt(1, 99);
      cells.push({ num, amount: decoyAmount(ticket), hit: false });
    }
  }

  let bonusMarkup = '';
  if (bonus) {
    const bonusHitIndex = hitMode === 'bonus' ? randInt(0, bonus.count - 1) : -1;
    const bonusCells = [];

    for (let index = 0; index < bonus.count; index += 1) {
      if (index === bonusHitIndex) {
        bonusCells.push({ symbol: bonus.symbol, amount: baseAmount, hit: true });
      } else {
        let symbol = pick(bonus.pool);
        while (symbol === bonus.symbol) symbol = pick(bonus.pool);
        bonusCells.push({ symbol, amount: decoyAmount(ticket), hit: false });
      }
    }

    bonusMarkup = `
      <div class="bonus-row">
        <span class="bonus-label">${bonus.symbol === '🪙' ? '金币' : '吉字'}</span>
        <div class="bonus-grid">
          ${bonusCells
            .map(
              (cell) => `
            <div class="symbol-cell bonus-cell${cell.hit ? ' is-hit' : ''}">
              <span class="sym${isHan(cell.symbol) ? ' is-char' : ''}">${cell.symbol}</span>
              <span class="amt">${fmt(cell.amount)}</span>
            </div>`
            )
            .join('')}
        </div>
      </div>`;
  }

  const multiplierMarkup =
    multiplier > 1
      ? `<div class="multi-box"><span>中奖倍数</span><b>×${multiplier}</b></div>`
      : '';

  return `
    <div class="play-mat">
      <div class="match-head">
        <div class="win-row">
          <span class="win-label">中奖号码</span>
          <span class="win-bubble">${pad2(target)}</span>
        </div>
        ${multiplierMarkup}
      </div>
      <p class="my-label">我 的 号 码</p>
      <div class="num-grid${count === 8 ? ' is-four' : ''}">
        ${cells
          .map(
            (cell) => `
          <div class="num-cell${cell.hit ? ' is-hit' : ''}">
            <span class="num">${pad2(cell.num)}</span>
            <span class="amt">${fmt(cell.amount)}</span>
          </div>`
          )
          .join('')}
      </div>
      ${bonusMarkup}
    </div>`;
}

function buildFindFace(ticket, prize) {
  const count = ticket.grid || 6;
  const hitIndex = prize > 0 ? randInt(0, count - 1) : -1;
  const cells = [];

  for (let index = 0; index < count; index += 1) {
    if (index === hitIndex) {
      cells.push({ symbol: ticket.winSymbol, amount: prize, hit: true });
    } else {
      let symbol = pick(ticket.symbolPool);
      while (symbol === ticket.winSymbol) symbol = pick(ticket.symbolPool);
      cells.push({ symbol, amount: decoyAmount(ticket), hit: false });
    }
  }

  const winName = ticket.winSymbol === '🪙' ? '金币' : ticket.winSymbol;

  return `
    <div class="find-mat">
      <p class="find-hint">刮出「${winName}」即中下方奖金</p>
      <div class="find-grid">
        ${cells
          .map(
            (cell) => `
          <div class="symbol-cell${cell.hit ? ' is-hit' : ''}">
            <span class="sym${isHan(cell.symbol) ? ' is-char' : ''}">${cell.symbol}</span>
            <span class="amt">${fmt(cell.amount)}</span>
          </div>`
          )
          .join('')}
      </div>
    </div>`;
}

/* ═══════════════════════════ 刮涂层 ═══════════════════════════ */

const uiFont =
  getComputedStyle(document.body).fontFamily ||
  '"Microsoft YaHei", system-ui, sans-serif';

let ctx = null;
let dpr = 1;
let scratching = false;
let lastPoint = null;
let moveTick = 0;
let lastNoiseAt = 0;

function initScratch() {
  if (!session || session.revealed) return;

  const width = scratchWrap.clientWidth;
  const height = scratchWrap.clientHeight;
  if (width < 10 || height < 10) return;

  dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.max(1, Math.round(width * dpr));
  canvas.height = Math.max(1, Math.round(height * dpr));

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
  gradient.addColorStop(0, '#d2ccbf');
  gradient.addColorStop(0.42, '#bab3a4');
  gradient.addColorStop(0.72, '#aaa293');
  gradient.addColorStop(1, '#c6bfb0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.globalAlpha = 0.11;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  for (let x = -height; x < width + height; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + height, height);
    ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.strokeStyle = '#3c3428';
  ctx.lineWidth = 1;
  for (let x = -height; x < width + height; x += 16) {
    ctx.beginPath();
    ctx.moveTo(x + 4, 0);
    ctx.lineTo(x + height + 4, height);
    ctx.stroke();
  }
  ctx.restore();

  const fontSize = Math.max(16, Math.min(23, width * 0.042));
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(66, 56, 40, 0.58)';
  ctx.font = `800 ${fontSize}px ${uiFont}`;
  ctx.fillText('刮 开 涂 层', width / 2, height / 2 - fontSize * 0.35);
  ctx.fillStyle = 'rgba(66, 56, 40, 0.4)';
  ctx.font = `600 ${Math.max(10, fontSize * 0.58)}px ${uiFont}`;
  ctx.fillText('按住鼠标 / 手指左右涂抹', width / 2, height / 2 + fontSize * 0.85);
  ctx.restore();

  ctx.save();
  ctx.setLineDash([5, 7]);
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(255,255,255,0.38)';
  ctx.strokeRect(7.5, 7.5, width - 15, height - 15);
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
  ctx.arc(point.x, point.y, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function scratchLine(from, to) {
  if (!ctx) return;
  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  ctx.lineWidth = 32;
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

  const step = Math.max(4, Math.round(12 * dpr));
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
  ticketEl.classList.add('is-settled');
  canvas.classList.add('is-fading');
  canvas.style.pointerEvents = 'none';

  window.setTimeout(() => {
    if (session === current) canvas.hidden = true;
  }, 380);

  window.setTimeout(() => {
    if (session !== current) return;
    showResult();
    if (current.prize > 0) {
      playWinSound();
      fireConfetti();
    } else {
      playLoseSound();
    }
  }, 300);
}

canvas.addEventListener('pointerdown', (event) => {
  if (!session || session.revealed) return;
  if (event.button !== undefined && event.button !== 0) return;
  event.preventDefault();

  if (canvas.setPointerCapture) {
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      /* 某些浏览器在合成事件下会拒绝 */
    }
  }

  scratching = true;
  const point = canvasPoint(event);
  lastPoint = point;
  scratchDot(point);
  scratchHint.hidden = true;
  strokeNoise();
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
  strokeNoise();
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
  sizeConfetti();
  if (session && !session.revealed && !playModal.hidden) {
    window.clearTimeout(window.__scratchResizeTimer);
    window.__scratchResizeTimer = window.setTimeout(() => {
      if (!session || session.revealed) return;
      initScratch();
      progressFill.style.width = '0%';
      progressText.textContent = '已刮开 0%';
    }, 240);
  }
});

/* ═══════════════════════════ 结果与结算 ═══════════════════════════ */

function showResult() {
  if (!session) return;
  const { prize, redeemed } = session;
  const won = prize > 0;

  resultArea.hidden = false;
  resultArea.classList.toggle('is-win', won);

  const multiplierTag =
    won && session.ticket.multiplier > 1
      ? `<span class="result-tag">已含 ×${session.ticket.multiplier}</span>`
      : '';

  resultBadge.innerHTML = won
    ? `<span class="result-kicker">恭喜中奖</span><strong class="result-amount">+${fmt(prize)}</strong>${multiplierTag}`
    : `<span class="result-kicker">谢谢惠顾</span><span class="result-amount is-muted">下一张好运</span>`;

  redeemBtn.hidden = !won;
  if (won) {
    redeemBtn.disabled = redeemed;
    redeemBtn.textContent = redeemed ? `已入账 ${fmt(prize)}` : `兑奖入账 ${fmt(prize)}`;
  }
}

function redeemPrize(silent = false) {
  if (!session || session.prize <= 0 || session.redeemed) return;

  const { prize, ticket } = session;
  session.redeemed = true;

  state.balance += prize;
  state.won += prize;
  state.wins += 1;
  state.best = Math.max(state.best, prize);

  if (!state.byTicket[ticket.id]) {
    state.byTicket[ticket.id] = { count: 0, spent: 0, won: 0 };
  }
  state.byTicket[ticket.id].won += prize;

  save();
  renderWallet(true);
  renderLedger();
  renderStatsPanel();

  if (!silent) {
    playRedeemSound();
    showResult();
    toast(`已兑奖 ${fmt(prize)}，余额 ${fmt(state.balance)}`);
  }
}

function recordHistory() {
  if (!session) return;
  const { ticket, prize } = session;

  state.history.unshift({
    t: Date.now(),
    id: ticket.id,
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
  if (session.prize > 0 && !session.redeemed) redeemPrize(true);
  recordHistory();
}

function closePlay() {
  if (!session) {
    closeModal(playModal);
    return;
  }

  const current = session;
  const wasRevealed = current.revealed;
  const wasRedeemed = current.redeemed;

  if (!wasRevealed) current.revealed = true;
  settle();
  closeModal(playModal);
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

/* ═══════════════════════════ 音效 ═══════════════════════════ */

let audio = null;
let noiseGain = null;

function ensureAudio() {
  if (!state.soundOn) return null;

  if (audio) {
    if (audio.state === 'suspended') audio.resume().catch(() => {});
    return audio;
  }

  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return null;

  try {
    audio = new AudioCtor();

    const length = Math.floor(audio.sampleRate * 1.5);
    const buffer = audio.createBuffer(1, length, audio.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = audio.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = audio.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1600;
    filter.Q.value = 0.8;

    noiseGain = audio.createGain();
    noiseGain.gain.value = 0;

    source.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audio.destination);
    source.start();
  } catch {
    audio = null;
    noiseGain = null;
  }

  return audio;
}

function strokeNoise() {
  if (!state.soundOn) return;
  const now = performance.now();
  if (now - lastNoiseAt < 70) return;
  lastNoiseAt = now;

  const audioCtx = ensureAudio();
  if (!audioCtx || !noiseGain) return;

  const start = audioCtx.currentTime;
  const volume = 0.055 + Math.random() * 0.03;
  noiseGain.gain.cancelScheduledValues(start);
  noiseGain.gain.setValueAtTime(volume, start);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.13);
}

function stopNoise() {
  if (!audio || !noiseGain) return;
  const now = audio.currentTime;
  noiseGain.gain.cancelScheduledValues(now);
  noiseGain.gain.setValueAtTime(0, now);
}

function tone(frequency, delay, duration, type = 'triangle', volume = 0.08) {
  if (!state.soundOn) return;
  const audioCtx = ensureAudio();
  if (!audioCtx) return;

  const start = audioCtx.currentTime + delay;
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
}

function playBuySound() {
  tone(1046.5, 0, 0.07, 'square', 0.018);
  tone(1567.98, 0.05, 0.09, 'square', 0.014);
}

function playWinSound() {
  [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => {
    tone(frequency, index * 0.1, 0.45, 'triangle', 0.085);
  });
}

function playLoseSound() {
  tone(196, 0, 0.22, 'sine', 0.045);
  tone(146.83, 0.13, 0.3, 'sine', 0.038);
}

function playRedeemSound() {
  tone(880, 0, 0.12, 'triangle', 0.06);
  tone(1174.66, 0.08, 0.16, 'triangle', 0.06);
  tone(1567.98, 0.16, 0.26, 'triangle', 0.055);
}

function toggleSound() {
  state.soundOn = !state.soundOn;
  save();
  updateSoundButton();

  if (state.soundOn) {
    ensureAudio();
    playBuySound();
    toast('音效已开启');
  } else {
    stopNoise();
    toast('音效已关闭');
  }
}

/* ═══════════════════════════ 彩带 ═══════════════════════════ */

let confettiPieces = [];
let confettiRaf = 0;

function sizeConfetti() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  confettiCanvas.width = Math.round(window.innerWidth * ratio);
  confettiCanvas.height = Math.round(window.innerHeight * ratio);
  confettiCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function fireConfetti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  sizeConfetti();
  const colors = ['#ffd77a', '#e8b64c', '#e0323e', '#3fae7a', '#f4efe4', '#ef5da8'];

  for (let i = 0; i < 150; i += 1) {
    confettiPieces.push({
      x: Math.random() * window.innerWidth,
      y: -20 - Math.random() * window.innerHeight * 0.5,
      vx: (Math.random() - 0.5) * 3.6,
      vy: 2.2 + Math.random() * 4.2,
      w: 5 + Math.random() * 7,
      h: 8 + Math.random() * 9,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.28,
      color: colors[i % colors.length],
    });
  }

  if (!confettiRaf) confettiRaf = requestAnimationFrame(tickConfetti);
}

function tickConfetti() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  confettiCtx.clearRect(0, 0, width, height);

  for (let i = confettiPieces.length - 1; i >= 0; i -= 1) {
    const piece = confettiPieces[i];
    piece.vy += 0.045;
    piece.vx *= 0.995;
    piece.x += piece.vx;
    piece.y += piece.vy;
    piece.rot += piece.vr;

    if (piece.y > height + 40 || piece.x < -60 || piece.x > width + 60) {
      confettiPieces.splice(i, 1);
      continue;
    }

    confettiCtx.save();
    confettiCtx.translate(piece.x, piece.y);
    confettiCtx.rotate(piece.rot);
    confettiCtx.fillStyle = piece.color;
    confettiCtx.globalAlpha = 0.95;
    confettiCtx.fillRect(
      -piece.w / 2,
      -piece.h / 2,
      piece.w,
      piece.h * (0.7 + 0.3 * Math.abs(Math.sin(piece.rot)))
    );
    confettiCtx.restore();
  }

  if (confettiPieces.length) {
    confettiRaf = requestAnimationFrame(tickConfetti);
  } else {
    confettiRaf = 0;
    confettiCtx.clearRect(0, 0, width, height);
  }
}

/* ═══════════════════════════ 账本 / 充值 / 重置 ═══════════════════════════ */

function openStats() {
  renderStatsPanel();
  openModal(statsModal);
}

function closeStats() {
  closeModal(statsModal);
}

function charge() {
  state.balance += 100;
  save();
  renderWallet(true);
  renderLedger();
  renderStatsPanel();
  playBuySound();
  toast('已模拟充值 ¥100');
}

function resetAll() {
  const confirmed = window.confirm('确定要清空所有记录并重新开始吗？此操作不可撤销。');
  if (!confirmed) return;

  const soundOn = state.soundOn;
  state = defaultState();
  state.soundOn = soundOn;
  save();
  renderWallet();
  renderLedger();
  renderStatsPanel();
  closeStats();
  toast('已重新开始，余额 ¥100');
}

/* ═══════════════════════════ 事件绑定 ═══════════════════════════ */

racksEl.addEventListener('click', (event) => {
  const button = event.target.closest('[data-buy]');
  if (!button) return;
  const ticket = TICKETS.find((item) => item.id === button.dataset.buy);
  if (ticket) buyTicket(ticket);
});

$('#result-actions').addEventListener('click', (event) => {
  const button = event.target.closest('[data-act]');
  if (!button) return;
  const action = button.dataset.act;

  if (action === 'redeem') redeemPrize(false);
  else if (action === 'again') playAgain();
  else if (action === 'close') closePlay();
});

$('#close-play').addEventListener('click', closePlay);
$('[data-close-play]').addEventListener('click', closePlay);
$('#close-stats').addEventListener('click', closeStats);
$('[data-close-stats]').addEventListener('click', closeStats);

btnStats.addEventListener('click', openStats);
btnCharge.addEventListener('click', charge);
btnChargeStats.addEventListener('click', charge);
btnSound.addEventListener('click', toggleSound);
btnReset.addEventListener('click', resetAll);

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (!playModal.hidden) closePlay();
  else if (!statsModal.hidden) closeStats();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopNoise();
});

window.addEventListener('pagehide', stopNoise);

/* ═══════════════════════════ 启动 ═══════════════════════════ */

renderRacks();
renderWallet();
renderLedger();
renderStatsPanel();
updateSoundButton();
sizeConfetti();
