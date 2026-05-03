const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const hpEl = document.getElementById('hp');
const spEl = document.getElementById('sp');
const coinEl = document.getElementById('coins');
const charEl = document.getElementById('charName');
const dialogueEl = document.getElementById('dialogue');

const chars = {
  '1': { name: 'Gintoki', speed: 0.9, jump: 14, damage: 1, color: '#d9f3ff', sprite: 'assets/characters/gintoki.png' },
  '2': { name: 'Kagura', speed: 1.15, jump: 13, damage: 1.4, color: '#ffc0d3', sprite: 'assets/characters/kagura.png' },
  '3': { name: 'Shinpachi', speed: 0.82, jump: 15, damage: 0.9, color: '#cce1ff', sprite: 'assets/characters/shinpachi.png' },
};

const spriteMap = {};
for (const [id, cfg] of Object.entries(chars)) {
  const img = new Image();
  img.src = cfg.sprite;
  spriteMap[id] = img;
}

const world = { width: 3200, gravity: 0.68, friction: 0.84 };
const player = { x: 100, y: 420, w: 48, h: 64, vx: 0, vy: 0, face: 1, hp: 5, sp: 100, coins: 0, atk: 0, dash: 0, onGround: false, char: '1' };
const platforms = [
  { x: 0, y: 490, w: 760, h: 50 }, { x: 820, y: 460, w: 220, h: 22 }, { x: 1100, y: 420, w: 240, h: 22 },
  { x: 1400, y: 380, w: 180, h: 22 }, { x: 1700, y: 470, w: 340, h: 22 }, { x: 2120, y: 440, w: 280, h: 22 },
  { x: 2480, y: 400, w: 260, h: 22 }, { x: 2810, y: 490, w: 390, h: 50 }
];
const coins = Array.from({ length: 20 }, (_, i) => ({ x: 230 + i * 145, y: [430, 390, 350][i % 3], r: 10, taken: false }));
const enemies = [{ x: 920, y: 426, w: 34, h: 34, hp: 3, vx: 1.5 }, { x: 1770, y: 436, w: 34, h: 34, hp: 4, vx: -1.1 }, { x: 2300, y: 406, w: 34, h: 34, hp: 4, vx: 1.2 }];
const goal = { x: 3050, y: 420, w: 34, h: 70 };
const dialoguePool = [
  'Kagura: "Hit harder! Also, buy me food."',
  'Shinpachi: "Please respect the glasses budget."',
  'Narrator: "This is definitely not a parody."',
  'Gintoki: "Press K for tax-evading dash."'
];

let cam = 0, win = false, frame = 0;
const keys = {};
addEventListener('keydown', (e) => { keys[e.key.toLowerCase()] = true; if (e.key === ' ') e.preventDefault(); });
addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);
for (const b of document.querySelectorAll('.touch-controls button')) {
  b.addEventListener('touchstart', () => keys[b.dataset.k] = true, { passive: true });
  b.addEventListener('touchend', () => keys[b.dataset.k] = false, { passive: true });
  b.addEventListener('mousedown', () => keys[b.dataset.k] = true);
  b.addEventListener('mouseup', () => keys[b.dataset.k] = false);
}

const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

function update() {
  if (win) return;
  frame++;
  if (keys['1'] || keys['2'] || keys['3']) player.char = keys['1'] ? '1' : keys['2'] ? '2' : '3';
  const cfg = chars[player.char];
  charEl.textContent = cfg.name;

  const L = keys.a || keys.arrowleft, R = keys.d || keys.arrowright;
  if (L) { player.vx -= cfg.speed; player.face = -1; }
  if (R) { player.vx += cfg.speed; player.face = 1; }
  if ((keys[' '] || keys.w || keys.arrowup) && player.onGround) { player.vy = -cfg.jump; player.onGround = false; }

  if ((keys.k || keys.shift) && player.dash <= 0 && player.sp >= 20) { player.vx += player.face * 12; player.sp -= 20; player.dash = 35; }
  if ((keys.j || keys.l) && player.atk <= 0) player.atk = 14;

  player.vx *= world.friction;
  player.vy += world.gravity;
  player.x += player.vx;
  player.y += player.vy;
  player.onGround = false;

  for (const p of platforms) {
    if (player.x + player.w > p.x && player.x < p.x + p.w) {
      const prev = player.y + player.h - player.vy;
      if (prev <= p.y && player.y + player.h >= p.y) { player.y = p.y - player.h; player.vy = 0; player.onGround = true; }
    }
  }

  if (player.y > canvas.height + 120) { player.hp -= 1; Object.assign(player, { x: 100, y: 420, vx: 0, vy: 0 }); }
  player.atk = Math.max(0, player.atk - 1);
  player.dash = Math.max(0, player.dash - 1);
  player.sp = Math.min(100, player.sp + 0.09);

  for (const c of coins) if (!c.taken && Math.hypot(player.x + player.w / 2 - c.x, player.y + player.h / 2 - c.y) < 28) { c.taken = true; player.coins += 10; }

  for (const e of enemies) {
    if (e.hp <= 0) continue;
    e.x += e.vx; if (e.x < 860 || e.x > 2880) e.vx *= -1;
    if (overlap(player, e)) {
      if (player.atk > 0) e.hp -= cfg.damage;
      else player.hp -= 0.02;
    }
  }

  if (frame % 360 === 0) dialogueEl.textContent = dialoguePool[(Math.random() * dialoguePool.length) | 0];
  if (overlap(player, goal) && player.coins >= 120) win = true;
  if (player.hp <= 0) location.reload();

  cam = Math.max(0, Math.min(world.width - canvas.width, player.x - 320));
  hpEl.textContent = Math.max(0, Math.ceil(player.hp));
  spEl.textContent = Math.floor(player.sp);
  coinEl.textContent = player.coins;
}

function drawPlayer() {
  const img = spriteMap[player.char];
  const runningBop = Math.sin(frame * 0.25) * 2;
  const y = player.y + runningBop;

  if (img?.complete && img.naturalWidth > 0) {
    ctx.save();
    if (player.face < 0) {
      ctx.translate(player.x + player.w / 2, 0);
      ctx.scale(-1, 1);
      ctx.translate(-(player.x + player.w / 2), 0);
    }
    ctx.drawImage(img, player.x - 10, y - 8, player.w + 20, player.h + 8);
    ctx.restore();
  } else {
    ctx.fillStyle = player.atk > 0 ? '#ffd59a' : chars[player.char].color;
    ctx.fillRect(player.x, y, player.w, player.h);
  }

  if (player.atk > 0) {
    ctx.fillStyle = 'rgba(255,220,120,.55)';
    const ax = player.face > 0 ? player.x + player.w : player.x - 30;
    ctx.fillRect(ax, player.y + 8, 30, 24);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height); sky.addColorStop(0, '#68b0ff'); sky.addColorStop(1, '#fed9a8'); ctx.fillStyle = sky; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.save(); ctx.translate(-cam, 0);
  ctx.fillStyle = '#7a5637'; for (const p of platforms) ctx.fillRect(p.x, p.y, p.w, p.h);
  for (const c of coins) if (!c.taken) { ctx.fillStyle = '#ffce2f'; ctx.beginPath(); ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx.fill(); }
  for (const e of enemies) if (e.hp > 0) { ctx.fillStyle = '#7b2030'; ctx.fillRect(e.x, e.y, e.w, e.h); }
  ctx.fillStyle = '#5f462b'; ctx.fillRect(goal.x, goal.y, goal.w, goal.h); ctx.fillStyle = '#ffec8a'; ctx.fillRect(goal.x + 5, goal.y + 8, 18, 14);
  drawPlayer();
  ctx.restore();
  if (win) { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, canvas.width, canvas.height); ctx.fillStyle = '#fff4ba'; ctx.font = 'bold 44px sans-serif'; ctx.fillText('Yorozuya Job Complete!', 230, 250); ctx.font = '24px sans-serif'; ctx.fillText(`Yen Collected: ${player.coins}`, 360, 295); }
}

(function loop() { update(); draw(); requestAnimationFrame(loop); })();
