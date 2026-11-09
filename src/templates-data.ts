export type Template = { html: string; css: string; js: string };

export const TEMPLATES: Record<string, Template> = {
  example: {
    html: `<h1>Пример виджета</h1>
<p>Один HTML-файл · тема из чата · без сети</p>
<div class="row">
  <button class="btn ghost" id="copy" type="button">Копировать</button>
  <button class="btn" id="open" type="button">Открыть</button>
</div>`,
    css: `html,body{margin:0;padding:0;background:var(--tg-theme-bg-color);color:var(--tg-theme-text-color);font:15px/1.35 system-ui,sans-serif}
body{padding:12px;padding-bottom:max(12px,var(--tg-content-safe-area-inset-bottom,22px))}
h1{font-size:16px;margin:0 0 6px;font-weight:600}
p{margin:0;color:var(--tg-theme-hint-color);font-size:13px;line-height:1.4}
.row{display:flex;gap:8px;margin-top:14px}
.btn{
  flex:1;background:var(--tg-theme-button-color);color:var(--tg-theme-button-text-color);
  border:0;border-radius:10px;padding:10px 12px;font:inherit;font-weight:600;cursor:pointer;
  touch-action:manipulation
}
.btn.ghost{
  background:var(--tg-theme-secondary-bg-color);color:var(--tg-theme-text-color);font-weight:500
}`,
    js: `document.getElementById('copy').onclick = function () {
  TelegramWidget.HapticFeedback.selectionChanged();
  TelegramWidget.copyText('https://t.me/telegram');
};
document.getElementById('open').onclick = function () {
  TelegramWidget.HapticFeedback.impactOccurred('light');
  TelegramWidget.openTelegramLink('https://t.me/telegram');
};`,
  },

  card: {
    html: `<div class="card">
  <div class="avatar"></div>
  <div class="meta">
    <p class="name">Premium Sticker Pack</p>
    <p class="sub">24 стикера · анимированные</p>
  </div>
  <div class="price">150 ⭐</div>
</div>`,
    css: `html,body{margin:0;padding:0;background:var(--tg-theme-bg-color);color:var(--tg-theme-text-color);font:15px/1.35 system-ui,sans-serif}
body{padding:14px;padding-bottom:max(14px,var(--tg-content-safe-area-inset-bottom,22px))}
.card{
  background:var(--tg-theme-secondary-bg-color);border-radius:14px;padding:14px;
  display:flex;gap:12px;align-items:center
}
.avatar{
  width:48px;height:48px;border-radius:50%;
  background:linear-gradient(135deg,var(--tg-theme-button-color),#6c5ce7);
  flex-shrink:0
}
.meta{flex:1;min-width:0}
.name{font-weight:600;font-size:15px;margin:0 0 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sub{margin:0;font-size:13px;color:var(--tg-theme-hint-color)}
.price{font-weight:700;font-size:16px;color:var(--tg-theme-link-color);white-space:nowrap}`,
    js: '',
  },

  counter: {
    html: `<div class="n" id="n">0</div>
<div class="ctrls">
  <button id="m" type="button" aria-label="minus">−</button>
  <button id="p" type="button" aria-label="plus">+</button>
</div>`,
    css: `html,body{margin:0;padding:0;background:var(--tg-theme-bg-color);color:var(--tg-theme-text-color);font:15px/1.35 system-ui,sans-serif}
body{padding:16px;padding-bottom:max(16px,var(--tg-content-safe-area-inset-bottom,22px));text-align:center}
.n{font-size:42px;font-weight:700;letter-spacing:-1px;margin:8px 0 16px}
.ctrls{display:flex;gap:10px;justify-content:center}
button{
  width:48px;height:48px;border-radius:12px;border:0;font-size:22px;font-weight:600;
  background:var(--tg-theme-button-color);color:var(--tg-theme-button-text-color);
  cursor:pointer;touch-action:none
}
button:active{opacity:.85}`,
    js: `var v = 0, el = document.getElementById('n');
function set(x) {
  v = x;
  el.textContent = v;
  try { localStorage.setItem('tw-counter', String(v)); } catch (e) {}
  TelegramWidget.HapticFeedback.selectionChanged();
}
try { v = parseInt(localStorage.getItem('tw-counter') || '0', 10) || 0; } catch (e) {}
el.textContent = v;
document.getElementById('m').onclick = function () { set(v - 1); };
document.getElementById('p').onclick = function () { set(v + 1); };`,
  },

  status: {
    html: `<p class="title">Заказ #4821</p>
<div class="status">
  <div class="dot" id="dot"></div>
  <span class="label" id="label">Готовится</span>
  <span class="eta" id="eta">~12 мин</span>
</div>
<div class="steps">
  <div class="step on"></div>
  <div class="step on"></div>
  <div class="step"></div>
  <div class="step"></div>
</div>`,
    css: `html,body{margin:0;padding:0;background:var(--tg-theme-bg-color);color:var(--tg-theme-text-color);font:15px/1.35 system-ui,sans-serif}
body{padding:14px;padding-bottom:max(14px,var(--tg-content-safe-area-inset-bottom,22px))}
.title{font-size:13px;color:var(--tg-theme-hint-color);margin:0 0 8px}
.status{
  display:flex;align-items:center;gap:10px;
  background:var(--tg-theme-secondary-bg-color);border-radius:12px;padding:12px 14px
}
.dot{
  width:10px;height:10px;border-radius:50%;background:#31b545;flex-shrink:0;
  box-shadow:0 0 0 4px rgba(49,181,69,.2)
}
.dot.warn{background:#f5a623;box-shadow:0 0 0 4px rgba(245,166,35,.2)}
.dot.err{background:#e53935;box-shadow:0 0 0 4px rgba(229,57,53,.2)}
.label{font-weight:600;font-size:15px}
.eta{margin-left:auto;font-size:13px;color:var(--tg-theme-hint-color)}
.steps{display:flex;gap:4px;margin-top:12px}
.step{flex:1;height:4px;border-radius:2px;background:var(--tg-theme-secondary-bg-color)}
.step.on{background:var(--tg-theme-button-color)}`,
    js: `var stages = [
  { t: 'Принят', eta: '—', c: '' },
  { t: 'Готовится', eta: '~12 мин', c: '' },
  { t: 'В пути', eta: '~8 мин', c: 'warn' },
  { t: 'Доставлен', eta: '', c: '' }
];
var i = 1;
function render() {
  var s = stages[i];
  document.getElementById('label').textContent = s.t;
  document.getElementById('eta').textContent = s.eta;
  document.getElementById('dot').className = 'dot ' + s.c;
  var steps = document.querySelectorAll('.step');
  for (var k = 0; k < steps.length; k++) {
    steps[k].className = 'step' + (k <= i ? ' on' : '');
  }
}
render();`,
  },

  /* ── Currency converter (offline rates) ── */
  converter: {
    html: `<p class="title">Конвертер</p>
<div class="box">
  <div class="amt" id="from">100 USD</div>
  <div class="arrow">↓</div>
  <div class="amt big" id="to">9 200 ₽</div>
</div>
<div class="pairs">
  <button type="button" data-p="USD/RUB" class="on">USD→RUB</button>
  <button type="button" data-p="EUR/RUB">EUR→RUB</button>
  <button type="button" data-p="USD/EUR">USD→EUR</button>
  <button type="button" data-p="TON/USD">TON→USD</button>
</div>
<p class="hint">Курсы демо · без сети</p>`,
    css: `html,body{margin:0;padding:0;background:var(--tg-theme-bg-color);color:var(--tg-theme-text-color);font:15px/1.35 system-ui,sans-serif}
body{padding:14px;padding-bottom:max(14px,var(--tg-content-safe-area-inset-bottom,22px))}
.title{margin:0 0 10px;font-size:13px;color:var(--tg-theme-hint-color)}
.box{background:var(--tg-theme-secondary-bg-color);border-radius:14px;padding:14px;text-align:center}
.amt{font-size:15px;color:var(--tg-theme-hint-color)}
.amt.big{font-size:28px;font-weight:700;color:var(--tg-theme-text-color);margin-top:2px;letter-spacing:-.5px}
.arrow{color:var(--tg-theme-hint-color);margin:6px 0;font-size:14px}
.pairs{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}
.pairs button{
  flex:1;min-width:70px;border:0;border-radius:10px;padding:9px 8px;font:12px/1 system-ui,sans-serif;
  background:var(--tg-theme-secondary-bg-color);color:var(--tg-theme-text-color);cursor:pointer
}
.pairs button.on{background:var(--tg-theme-button-color);color:var(--tg-theme-button-text-color);font-weight:600}
.hint{margin:10px 0 0;font-size:11px;color:var(--tg-theme-hint-color)}`,
    js: `var RATES = { 'USD/RUB': 92, 'EUR/RUB': 100, 'USD/EUR': 0.92, 'TON/USD': 5.4 };
var AMT = { 'USD/RUB': 100, 'EUR/RUB': 100, 'USD/EUR': 100, 'TON/USD': 10 };
var pair = 'USD/RUB';
function fmt(n, code) {
  if (code === 'RUB') return Math.round(n).toLocaleString('ru-RU') + ' ₽';
  if (code === 'USD') return n.toFixed(2) + ' $';
  if (code === 'EUR') return n.toFixed(2) + ' €';
  if (code === 'TON') return n.toFixed(2) + ' TON';
  return String(n);
}
function render() {
  var a = pair.split('/')[0], b = pair.split('/')[1];
  var src = AMT[pair], dst = src * RATES[pair];
  document.getElementById('from').textContent = fmt(src, a);
  document.getElementById('to').textContent = fmt(dst, b);
  var btns = document.querySelectorAll('.pairs button');
  for (var i = 0; i < btns.length; i++) {
    btns[i].className = btns[i].getAttribute('data-p') === pair ? 'on' : '';
  }
}
document.querySelector('.pairs').onclick = function (e) {
  var t = e.target;
  if (t.tagName !== 'BUTTON') return;
  pair = t.getAttribute('data-p');
  TelegramWidget.HapticFeedback.selectionChanged();
  render();
};
render();`,
  },

  /* ── Wallet (customized) (inspired by bot-demos/07-wallet) ── */
  wallet: {
    html: `<div class="hd"><div class="ic">💎</div><div><h3>Gram Wallet</h3><small>Demo · mock request / sign / send</small></div></div>
<div class="r"><div><b>My wallet</b><span class="w" id="mw">—</span></div><button type="button" id="me">Show</button></div>
<div class="r"><div><b>Sign a text</b><span class="w" id="sw">—</span></div><button type="button" id="sg">Sign</button></div>
<div class="r"><div><b>0.01 TON</b><span class="w" id="tw">—</span></div><button type="button" id="pay">Send</button></div>
<p class="n" id="n"></p>`,
    css: `html,body{margin:0;padding:0;background:var(--tg-theme-bg-color);color:var(--tg-theme-text-color);font:15px/1.35 system-ui,sans-serif}
body{padding:12px 14px;padding-bottom:max(12px,var(--tg-content-safe-area-inset-bottom,22px))}
.hd,.r{display:flex;align-items:center;gap:10px}
.ic{width:40px;height:40px;border-radius:50%;background:var(--tg-theme-button-color);color:var(--tg-theme-button-text-color);display:flex;align-items:center;justify-content:center;font-size:20px;flex:none}
h3{margin:0;font-size:16px}
small,.w,.n{font-size:13px;color:var(--tg-theme-hint-color)}
.r{padding:10px 0 9px;border-top:1px solid var(--tg-theme-secondary-bg-color)}
.hd{margin-bottom:8px}
.r div{flex:1;min-width:0}
.r b{display:block;font-size:15px;font-weight:500;color:var(--tg-theme-text-color)}
.w{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
button{flex:none;min-width:74px;border:0;border-radius:10px;padding:8px 12px;font:13px system-ui,sans-serif;font-weight:600;background:var(--tg-theme-button-color);color:var(--tg-theme-button-text-color);cursor:pointer}
button:disabled{opacity:.45}
.n{margin:10px 0 0;min-height:17px}`,
    js: `var T = window.TelegramWidget, busy = 0;
function $(id) { return document.getElementById(id); }
function note(s) { $('n').textContent = s || ''; }
function short(a) { return a ? a.slice(0, 4) + '…' + a.slice(-4) : '—'; }
function mockWallet() {
  return {
    a: 'EQCdemoWalletAddress0000000000000001',
    b: 12500000000
  };
}
$('me').onclick = function () {
  if (busy) return;
  busy = 1; note('…');
  T.HapticFeedback.impactOccurred('light');
  T.request('w:me', { wallet: true }).then(function () {
    var m = mockWallet();
    $('mw').textContent = short(m.a) + ' · ' + (m.b / 1e9).toFixed(2) + ' TON';
    note('');
    busy = 0;
  }).catch(function () {
    var m = mockWallet();
    $('mw').textContent = short(m.a) + ' · ' + (m.b / 1e9).toFixed(2) + ' TON';
    note('Mock (нет бота)');
    busy = 0;
  });
};
$('sg').onclick = function () {
  if (busy) return;
  busy = 1; note('Confirm…');
  T.HapticFeedback.selectionChanged();
  setTimeout(function () {
    $('sw').textContent = '✓ signed (demo)';
    note('');
    busy = 0;
  }, 400);
};
$('pay').onclick = function () {
  if (busy) return;
  busy = 1; note('Sending…');
  T.HapticFeedback.impactOccurred('medium');
  setTimeout(function () {
    $('tw').textContent = '✓ 0.01 TON (demo)';
    note('');
    busy = 0;
  }, 500);
};
if (!T.wallet) {
  note('wallet mock: TelegramWidget.wallet null in preview');
}`,
  },

  /* ── 3D cube (canvas projection, profile-1 safe — no CSS 3D) ── */
  cube3d: {
    html: `<p class="t">3D cube</p>
<canvas id="c" width="180" height="140" aria-label="Rotating cube"></canvas>
<div class="row">
  <button type="button" id="spin">Spin</button>
  <button type="button" id="stop">Stop</button>
</div>`,
    css: `html,body{margin:0;padding:0;background:var(--tg-theme-bg-color);color:var(--tg-theme-text-color);font:15px/1.35 system-ui,sans-serif}
body{padding:12px;padding-bottom:max(12px,var(--tg-content-safe-area-inset-bottom,22px));text-align:center}
.t{margin:0 0 8px;font-size:13px;color:var(--tg-theme-hint-color)}
canvas{display:block;margin:0 auto;touch-action:none;border-radius:8px;background:var(--tg-theme-secondary-bg-color)}
.row{display:flex;gap:8px;margin-top:10px;justify-content:center}
button{border:0;border-radius:10px;padding:9px 16px;font:13px system-ui,sans-serif;font-weight:600;background:var(--tg-theme-button-color);color:var(--tg-theme-button-text-color);cursor:pointer}`,
    js: `var c = document.getElementById('c'), ctx = c.getContext('2d');
var W = c.width, H = c.height;
var ang = 0.4, tilt = 0.5, spinning = 1, raf = 0;
var verts = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
var edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
function project(v) {
  var x = v[0], y = v[1], z = v[2];
  var cy = Math.cos(ang), sy = Math.sin(ang);
  var cx = Math.cos(tilt), sx = Math.sin(tilt);
  var x1 = x * cy - z * sy, z1 = x * sy + z * cy;
  var y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
  var s = 48 / (3 + z2);
  return [W / 2 + x1 * s, H / 2 + y2 * s];
}
function draw() {
  ctx.clearRect(0, 0, W, H);
  var pts = [];
  for (var i = 0; i < verts.length; i++) pts.push(project(verts[i]));
  ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--tg-theme-button-color') || '#2aabee';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (var e = 0; e < edges.length; e++) {
    var a = pts[edges[e][0]], b = pts[edges[e][1]];
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  }
}
function loop() {
  if (spinning) { ang += 0.025; tilt = 0.45 + Math.sin(ang * 0.7) * 0.15; }
  draw();
  raf = requestAnimationFrame(loop);
}
document.getElementById('spin').onclick = function () {
  spinning = 1;
  TelegramWidget.HapticFeedback.selectionChanged();
};
document.getElementById('stop').onclick = function () {
  spinning = 0;
  TelegramWidget.HapticFeedback.impactOccurred('light');
};
c.addEventListener('pointerdown', function (ev) {
  c.setPointerCapture(ev.pointerId);
  var lx = ev.clientX, ly = ev.clientY;
  function move(e) {
    ang += (e.clientX - lx) * 0.01;
    tilt = Math.max(-1, Math.min(1, tilt + (e.clientY - ly) * 0.01));
    lx = e.clientX; ly = e.clientY;
  }
  function up() {
    c.removeEventListener('pointermove', move);
    c.removeEventListener('pointerup', up);
  }
  c.addEventListener('pointermove', move);
  c.addEventListener('pointerup', up);
});
loop();`,
  },

  /* ── corpus-inspired: poll ── */
  poll: {
    html: `<h1 id="q">Best lunch?</h1>
<p class="meta" id="tt">0 votes</p>
<div id="os"></div>
<p class="ms" id="ms">Tap an option</p>`,
    css: `html,body{margin:0;padding:0;background:var(--tg-theme-bg-color);color:var(--tg-theme-text-color);font:15px/1.35 system-ui,sans-serif}
body{padding:12px 10px;padding-bottom:max(12px,var(--tg-content-safe-area-inset-bottom,22px))}
h1{font-size:17px;font-weight:600;margin:0 4px 4px}
.meta{margin:0 4px 8px;font-size:13px;color:var(--tg-theme-hint-color)}
#os button{display:block;width:100%;text-align:left;margin:0 0 6px;padding:10px 12px;border:0;border-radius:12px;background:var(--tg-theme-secondary-bg-color);color:inherit;font:inherit;cursor:pointer}
#os button.me{outline:2px solid var(--tg-theme-button-color)}
.bar{height:4px;margin-top:6px;border-radius:2px;background:var(--tg-theme-bg-color);overflow:hidden}
.bar i{display:block;height:100%;width:0;background:var(--tg-theme-button-color);border-radius:2px}
.row{display:flex;justify-content:space-between;gap:8px;font-size:14px}
.pct{font-weight:600;font-variant-numeric:tabular-nums}
.ms{margin:8px 4px 0;font-size:13px;color:var(--tg-theme-hint-color)}`,
    js: `var T = window.TelegramWidget;
var opts = ['Pizza', 'Sushi', 'Burger'];
var votes = [3, 5, 1];
var mine = -1;
try { mine = parseInt(localStorage.getItem('poll-my') || '-1', 10); } catch (e) {}
function load() {
  try {
    var p = JSON.parse(T.publicData || '{}');
    if (Array.isArray(p.o) && p.o.length) opts = p.o.slice(0, 6);
    if (Array.isArray(p.v)) votes = opts.map(function (_, i) { return Math.max(0, +p.v[i] || 0); });
  } catch (e) {}
}
function draw() {
  load();
  var total = votes.reduce(function (a, b) { return a + b; }, 0) || 1;
  document.getElementById('tt').textContent = (total === 1 ? '1 vote' : total + ' votes');
  document.getElementById('os').innerHTML = opts.map(function (name, i) {
    var pct = Math.round(votes[i] / total * 100);
    return '<button data-i="' + i + '" class="' + (mine === i ? 'me' : '') + '">' +
      '<div class="row"><span>' + name + '</span><span class="pct">' + pct + '%</span></div>' +
      '<div class="bar"><i style="width:' + pct + '%"></i></div></button>';
  }).join('');
  document.getElementById('ms').textContent = mine >= 0 ? 'Tap again to clear' : 'Tap an option to vote';
}
document.getElementById('os').onclick = function (e) {
  var b = e.target.closest('button');
  if (!b) return;
  var i = +b.getAttribute('data-i');
  T.HapticFeedback.impactOccurred('light');
  if (mine === i) {
    if (mine >= 0) votes[mine] = Math.max(0, votes[mine] - 1);
    mine = -1;
  } else {
    if (mine >= 0) votes[mine] = Math.max(0, votes[mine] - 1);
    mine = i;
    votes[i]++;
  }
  try { localStorage.setItem('poll-my', String(mine)); } catch (e) {}
  // Real bot: TelegramWidget.request('vote:' + i)
  T.request && T.request('vote:' + i).catch(function () {});
  draw();
};
if (T && T.onEvent) T.onEvent('publicDataChanged', draw);
draw();`,
  },

  /* ── corpus-inspired: live ticker ── */
  ticker: {
    html: `<div class="hd"><div class="lg" id="lg">TON</div><div class="nm"><b id="nm">Toncoin</b><span id="sy">TON</span></div><div class="lv"><i></i>Live</div></div>
<div class="px" id="px">5.43</div>
<div class="ch"><span class="pl" id="cv">+0.12 · 2.3%</span> Today</div>
<svg id="sv" viewBox="0 0 280 72" preserveAspectRatio="none"><path id="ln" fill="none" stroke-width="2"/></svg>
<p class="ft" id="up">Demo series · no network</p>`,
    css: `html,body{margin:0;padding:0;background:var(--tg-theme-bg-color);color:var(--tg-theme-text-color);font:15px/1.3 system-ui,sans-serif;font-variant-numeric:tabular-nums}
body{padding:14px 16px;padding-bottom:max(14px,var(--tg-content-safe-area-inset-bottom,22px))}
.hd{display:flex;align-items:center;gap:10px}
.lg{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--tg-theme-button-color);color:var(--tg-theme-button-text-color);font-weight:700;font-size:12px;flex:none}
.nm{flex:1;min-width:0}
.nm b,.nm span{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nm b{font-size:16px}.nm span{font-size:13px;color:var(--tg-theme-hint-color)}
.lv{display:flex;align-items:center;gap:6px;padding:4px 9px;border-radius:12px;background:var(--tg-theme-secondary-bg-color);font-size:12px;font-weight:600;color:var(--tg-theme-hint-color)}
.lv i{width:7px;height:7px;border-radius:50%;background:#31b545}
.px{margin-top:12px;font-size:32px;font-weight:700;letter-spacing:-.02em}
.ch{margin-top:4px;font-size:13px;color:var(--tg-theme-hint-color)}
.pl{color:#31b545;font-weight:600;margin-right:6px}
.pl.dn{color:var(--tg-theme-destructive-text-color,#e53935)}
#sv{display:block;width:100%;height:72px;margin-top:8px}
#ln{stroke:var(--tg-theme-button-color)}
.ft{margin:8px 0 0;font-size:12px;color:var(--tg-theme-hint-color)}`,
    js: `var hist = [5.20,5.22,5.18,5.25,5.30,5.28,5.35,5.40,5.38,5.42,5.45,5.43];
var open = 5.31;
function paint() {
  var p = hist[hist.length - 1];
  var lo = Math.min.apply(null, hist.concat([open]));
  var hi = Math.max.apply(null, hist.concat([open]));
  var W = 280, H = 72, n = hist.length;
  var pts = hist.map(function (v, i) {
    var x = (i / (n - 1)) * (W - 8) + 4;
    var y = hi === lo ? H / 2 : 8 + (hi - v) / (hi - lo) * (H - 16);
    return [x, y];
  });
  var d = 'M' + pts.map(function (pt) { return pt[0].toFixed(1) + ' ' + pt[1].toFixed(1); }).join('L');
  document.getElementById('ln').setAttribute('d', d);
  document.getElementById('px').textContent = p.toFixed(2);
  var ch = p - open;
  var el = document.getElementById('cv');
  el.textContent = (ch >= 0 ? '+' : '') + ch.toFixed(2) + ' · ' + (Math.abs(ch / open) * 100).toFixed(2) + '%';
  el.className = 'pl' + (ch < 0 ? ' dn' : '');
}
function tick() {
  var last = hist[hist.length - 1];
  var next = Math.max(4.5, Math.min(6.5, last + (Math.random() - 0.48) * 0.06));
  hist.push(+next.toFixed(4));
  if (hist.length > 24) hist.shift();
  paint();
}
paint();
setInterval(tick, 2000);
// Real shared ticker: TelegramWidget.watchPublicData() + publicDataChanged
if (window.TelegramWidget && TelegramWidget.watchPublicData) {
  try { TelegramWidget.watchPublicData(); } catch (e) {}
}`,
  },

  /* ── corpus-inspired: promo code ── */
  promo: {
    html: `<p class="t">Promo</p>
<div class="code" id="code">TG-WIDGET-25</div>
<div class="row">
  <button type="button" id="copy">Copy</button>
  <button type="button" id="redeem">Redeem</button>
</div>
<p class="ms" id="ms"></p>`,
    css: `html,body{margin:0;padding:0;background:var(--tg-theme-bg-color);color:var(--tg-theme-text-color);font:15px/1.35 system-ui,sans-serif}
body{padding:14px;padding-bottom:max(14px,var(--tg-content-safe-area-inset-bottom,22px))}
.t{margin:0 0 8px;font-size:13px;color:var(--tg-theme-hint-color)}
.code{font:600 18px ui-monospace,monospace;letter-spacing:.04em;background:var(--tg-theme-secondary-bg-color);border-radius:12px;padding:14px;text-align:center}
.row{display:flex;gap:8px;margin-top:12px}
button{flex:1;border:0;border-radius:10px;padding:10px;font:13px system-ui,sans-serif;font-weight:600;background:var(--tg-theme-button-color);color:var(--tg-theme-button-text-color);cursor:pointer}
button.ghost{background:var(--tg-theme-secondary-bg-color);color:var(--tg-theme-text-color)}
button:disabled{opacity:.45}
.ms{margin:10px 0 0;font-size:13px;color:var(--tg-theme-hint-color);min-height:18px}`,
    js: `var code = 'TG-WIDGET-25';
var redeemed = false;
try {
  var cd = JSON.parse((TelegramWidget && TelegramWidget.chatData) || '{}');
  if (cd.redeemed) redeemed = true;
} catch (e) {}
function msg(s) { document.getElementById('ms').textContent = s; }
document.getElementById('code').textContent = code;
document.getElementById('copy').onclick = function () {
  TelegramWidget.HapticFeedback.selectionChanged();
  TelegramWidget.copyText(code);
  msg('Copied');
};
document.getElementById('redeem').onclick = function () {
  if (redeemed) { msg('Already redeemed'); return; }
  TelegramWidget.HapticFeedback.impactOccurred('light');
  TelegramWidget.request('redeem').then(function () {
    redeemed = true;
    document.getElementById('redeem').disabled = true;
    msg('Redeemed ✓');
  }).catch(function () {
    // demo offline
    redeemed = true;
    document.getElementById('redeem').disabled = true;
    msg('Redeemed ✓ (demo)');
  });
};
if (redeemed) {
  document.getElementById('redeem').disabled = true;
  msg('Already redeemed');
}`,
  },

  /* ── corpus-inspired: order tracker ── */
  order: {
    html: `<p class="title">Order #4821</p>
<div class="card">
  <div class="dot" id="dot"></div>
  <div>
    <b id="st">Cooking</b>
    <span id="eta">~12 min</span>
  </div>
</div>
<div class="items" id="items"></div>
<div class="row">
  <button type="button" id="ref">Refresh</button>
  <button type="button" class="ghost" id="can">Cancel</button>
</div>`,
    css: `html,body{margin:0;padding:0;background:var(--tg-theme-bg-color);color:var(--tg-theme-text-color);font:15px/1.35 system-ui,sans-serif}
body{padding:14px;padding-bottom:max(14px,var(--tg-content-safe-area-inset-bottom,22px))}
.title{margin:0 0 8px;font-size:13px;color:var(--tg-theme-hint-color)}
.card{display:flex;gap:12px;align-items:center;background:var(--tg-theme-secondary-bg-color);border-radius:12px;padding:12px 14px}
.dot{width:10px;height:10px;border-radius:50%;background:#31b545;box-shadow:0 0 0 4px rgba(49,181,69,.2);flex:none}
.dot.warn{background:#f5a623;box-shadow:0 0 0 4px rgba(245,166,35,.2)}
.dot.err{background:#e53935;box-shadow:0 0 0 4px rgba(229,57,53,.2)}
.card b{display:block;font-size:15px}
.card span{font-size:13px;color:var(--tg-theme-hint-color)}
.items{margin:12px 0;font-size:14px}
.items div{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid var(--tg-theme-secondary-bg-color)}
.row{display:flex;gap:8px}
button{flex:1;border:0;border-radius:10px;padding:10px;font:13px system-ui,sans-serif;font-weight:600;background:var(--tg-theme-button-color);color:var(--tg-theme-button-text-color);cursor:pointer}
button.ghost{background:var(--tg-theme-secondary-bg-color);color:var(--tg-theme-text-color)}
button:disabled{opacity:.4}`,
    js: `var stages = [
  { t: 'Placed', eta: '—', c: '' },
  { t: 'Cooking', eta: '~12 min', c: '' },
  { t: 'On the way', eta: '~8 min', c: 'warn' },
  { t: 'Delivered', eta: '', c: '' },
  { t: 'Cancelled', eta: '', c: 'err' }
];
var i = 1;
var items = [['Margherita', 1, 450], ['Cola', 2, 120]];
function render() {
  var s = stages[i];
  document.getElementById('st').textContent = s.t;
  document.getElementById('eta').textContent = s.eta;
  document.getElementById('dot').className = 'dot ' + s.c;
  document.getElementById('items').innerHTML = items.map(function (it) {
    return '<div><span>' + it[0] + ' ×' + it[1] + '</span><span>' + (it[1] * it[2]) + ' ₽</span></div>';
  }).join('');
  document.getElementById('can').disabled = i >= 2;
}
document.getElementById('ref').onclick = function () {
  TelegramWidget.HapticFeedback.selectionChanged();
  if (i < 3) i++;
  // Real: request('order:refresh')
  TelegramWidget.request && TelegramWidget.request('order:refresh').catch(function () {});
  render();
};
document.getElementById('can').onclick = function () {
  if (i >= 2) return;
  TelegramWidget.HapticFeedback.notificationOccurred('warning');
  i = 4;
  TelegramWidget.request && TelegramWidget.request('order:cancel').catch(function () {});
  render();
};
try {
  var pd = JSON.parse((TelegramWidget.publicData) || '{}');
  if (typeof pd.st === 'number') i = Math.max(0, Math.min(4, pd.st));
} catch (e) {}
render();`,
  },
};
