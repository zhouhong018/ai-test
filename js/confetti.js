// 独立特效画布（#fxc）：彩带 / 烟花 / 花瓣 / 爱心，与 #fx 星光层分开，避免互相擦除
const CONFETTI = ['#f5c2d1', '#e3b8f0', '#f7e1b6', '#ffffff', '#f3aec2', '#cbb6ea'];
const SPARKS = ['#ffe9b8', '#f7cf9a', '#ffd3e0', '#fff6f9', '#e8c8ff'];
const FLOWERS = ['#ffb6c9', '#ffd0dc', '#fff0f4', '#f7c8d8', '#f4a6bf'];
const HEARTS = ['#f48fb1', '#f8bbd0', '#e1bee7', '#f7d9a0'];
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

let canvas = null;
let ctx = null;
let parts = [];
let raf = null;

function size() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = `${innerWidth}px`;
  canvas.style.height = `${innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function boot() {
  if (canvas) return;
  canvas = document.createElement('canvas');
  canvas.id = 'fxc';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  addEventListener('resize', size);
  size();
}

function run() {
  if (!raf) raf = requestAnimationFrame(loop);
}

function shell(x, y) {
  const n = 40 + ((Math.random() * 20) | 0);
  const color = pick(SPARKS);
  for (let i = 0; i < n; i += 1) {
    const a = (Math.PI * 2 * i) / n + Math.random() * 0.18;
    const v = 1.6 + Math.random() * 2.6;
    parts.push({
      kind: 'spark',
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      r: 1 + Math.random() * 1.5,
      color: Math.random() < 0.4 ? pick(SPARKS) : color,
      alpha: 0.95,
      fade: 0.011 + Math.random() * 0.01,
    });
  }
  run();
}

function loop() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    const p = parts[i];

    if (p.kind === 'rocket') {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      if (p.vy >= -0.5) {
        parts.splice(i, 1);
        shell(p.x, p.y);
      }
      continue;
    }

    if (p.kind === 'spark') {
      p.vx *= 0.978;
      p.vy = p.vy * 0.978 + 0.04;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.fade;
      if (p.alpha <= 0) {
        parts.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }

    if (p.kind === 'petal' || p.kind === 'heart') {
      p.sway += 0.026;
      p.x += Math.sin(p.sway) * p.drift + p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.alpha -= p.fade || 0;
      if (p.y > innerHeight + 30 || p.alpha <= 0) {
        parts.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = Math.min(p.alpha, 0.9);
      if (p.kind === 'petal') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.w, p.h, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = p.color;
        ctx.font = `${p.size}px system-ui, serif`;
        ctx.fillText('♥', -p.size / 2, p.size / 2);
      }
      ctx.restore();
      continue;
    }

    // confetti
    p.vy += p.g;
    p.vx *= 0.995;
    p.wob += 0.1;
    p.x += p.vx + Math.sin(p.wob) * 0.6;
    p.y += p.vy;
    p.rot += p.vr;
    if (p.y > innerHeight + 40 || p.x < -60 || p.x > innerWidth + 60) {
      parts.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
  }
  raf = parts.length ? requestAnimationFrame(loop) : null;
}

export function confettiBurst({ count = 60, origin = { x: innerWidth / 2, y: -20 }, spread = Math.PI / 3, power = 8 } = {}) {
  boot();
  for (let i = 0; i < count; i += 1) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread * 2;
    const v = power * (0.4 + Math.random() * 0.85);
    parts.push({
      kind: 'confetti',
      x: origin.x + (Math.random() - 0.5) * 40,
      y: origin.y + (Math.random() - 0.5) * 20,
      vx: Math.cos(angle) * v,
      vy: Math.sin(angle) * v,
      g: 0.12 + Math.random() * 0.08,
      w: 4 + Math.random() * 5,
      h: 3 + Math.random() * 7,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.22,
      color: pick(CONFETTI),
      wob: Math.random() * Math.PI * 2,
    });
  }
  run();
}

/* 烟花：柔和地窜上天空再散开 */
export function fireworkShow(shots = 3, { stagger = 620 } = {}) {
  boot();
  for (let i = 0; i < shots; i += 1) {
    setTimeout(() => {
      parts.push({
        kind: 'rocket',
        x: innerWidth * (0.2 + Math.random() * 0.6),
        y: innerHeight * 0.92,
        vx: (Math.random() - 0.5) * 1,
        vy: -(8.4 + Math.random() * 2),
        color: pick(SPARKS),
      });
      run();
    }, i * stagger);
  }
}

/* 花瓣雨：origin 省略时从屏幕上方落下 */
export function flowerBurst({ count = 12, origin = null } = {}) {
  boot();
  for (let i = 0; i < count; i += 1) {
    const from = origin
      ? { x: origin.x + (Math.random() - 0.5) * 140, y: origin.y + (Math.random() - 0.5) * 60 }
      : { x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.3 };
    parts.push({
      kind: 'petal',
      x: from.x,
      y: from.y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0.7 + Math.random() * 1,
      w: 3.5 + Math.random() * 4.5,
      h: 7 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.05,
      sway: Math.random() * Math.PI * 2,
      drift: 0.4 + Math.random() * 0.8,
      alpha: 0.9,
      color: pick(FLOWERS),
    });
  }
  run();
}

/* 爱心上浮 */
export function heartBurst({ count = 8, origin = null } = {}) {
  boot();
  for (let i = 0; i < count; i += 1) {
    const from = origin
      ? { x: origin.x + (Math.random() - 0.5) * 160, y: origin.y }
      : { x: innerWidth * (0.2 + Math.random() * 0.6), y: innerHeight * 0.85 };
    parts.push({
      kind: 'heart',
      x: from.x,
      y: from.y,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -(0.7 + Math.random() * 0.8),
      size: 14 + Math.random() * 16,
      rot: (Math.random() - 0.5) * 0.4,
      vr: (Math.random() - 0.5) * 0.02,
      sway: Math.random() * Math.PI * 2,
      drift: 0.3 + Math.random() * 0.5,
      alpha: 0.9,
      fade: 0.004,
      color: pick(HEARTS),
    });
  }
  run();
}
