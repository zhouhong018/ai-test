import { confettiBurst, fireworkShow, flowerBurst, heartBurst } from './confetti.js';

/* ============================================================
   改这里就能换文案：bg 可选 bg-blush / bg-lavender / bg-cream
   ============================================================ */
const CONFIG = {
  name: '大漂亮',
  date: '今天 · 是全世界最温柔的一天',
  messages: [
    { tag: '01', title: '嘿，生日快乐', text: '先别急着往下滑，这句话我是认真说的：今天你最大，全世界都该让你三分。愿新的一岁眼里有光，心里有糖，口袋里装着数不清的好消息，走过的每一步都算数。', bg: 'bg-blush' },
    { tag: '02', title: '愿你笑得尽兴', text: '看你笑的时候，连空气都跟着变甜。新的一岁，愿你想笑就笑出声，不必为谁收敛；愿有趣的人常在你身边，开心的事天天都在发生，连梦里都是轻快的。', bg: 'bg-cream' },
    { tag: '03', title: '愿你被世界温柔待', text: '愿你想要的都慢慢靠近，愿你的热爱都有回响。走路有风，睡觉有梦，抬头就碰上好天气。那些你认真埋下的种子，都会在没留神的时候悄悄开花。', bg: 'bg-lavender' },
    { tag: '04', title: '愿你有钱也有闲', text: '想买的东西不必犹豫，想去的地方随时出发。卡里有钱，日程有空，身边有人。愿你的日子既热闹又从容，忙的时候有奔头，闲的时候有诗意，四季都值得过。', bg: 'bg-blush' },
    { tag: '05', title: '最后一个愿望留给你', text: '往下的蜡烛交给你自己吹，礼物也等你亲手拆。许愿的时候贪心一点没关系，把没说出口的期待都写上。愿你所求的都如愿，愿这条路越走越开阔。', bg: 'bg-cream' },
  ],
  gift: {
    title: '这里还有一份小礼物',
    hint: '点一下礼盒',
    opened: '拆开啦：往后的日子，都像今天这样被偏爱 ✦',
    items: ["💄", "🌷", "🧸", "🎀", "🍰", "💍", "🧋", "🎁", "👜", "👠", "🍓", "💐", "✨", "🕯️"],
  },
};

const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rand = (min, max) => min + Math.random() * (max - min);

/* ---------- 星光层（持续飘动的细闪） ---------- */
const cv = document.getElementById('fx');
const ctx = cv.getContext('2d');
const glitters = [];

function resize() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  cv.width = Math.floor(innerWidth * dpr);
  cv.height = Math.floor(innerHeight * dpr);
  cv.style.width = `${innerWidth}px`;
  cv.style.height = `${innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function spawnGlitter() {
  glitters.push({
    x: rand(0, innerWidth),
    y: innerHeight + 16,
    vy: rand(-0.5, -0.15),
    vx: rand(-0.2, 0.2),
    r: rand(3, 9),
    a: rand(0.12, 0.42),
    rot: rand(0, Math.PI * 2),
    vr: rand(-0.012, 0.012),
    g: ['✦', '✧', '·', '♡', '❀'][(Math.random() * 5) | 0],
    c: Math.random() < 0.5 ? '#e8b4c8' : '#d9b878',
  });
}

function tick() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (let i = glitters.length - 1; i >= 0; i -= 1) {
    const p = glitters[i];
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    if (p.y < -24) {
      glitters.splice(i, 1);
      continue;
    }
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = p.a;
    ctx.fillStyle = p.c;
    ctx.font = `${p.r}px system-ui, serif`;
    ctx.fillText(p.g, 0, 0);
    ctx.restore();
  }
  if (!prefersReduced && glitters.length < 34 && Math.random() < 0.35) spawnGlitter();
  requestAnimationFrame(tick);
}

resize();
addEventListener('resize', resize);
if (!prefersReduced) requestAnimationFrame(tick);

/* ---------- 背景音乐（Web Audio 合成，无需音频文件） ---------- */
const music = (() => {
  let ac = null;
  let master = null;
  let timer = null;
  let step = 0;
  let on = false;

  // 生日歌旋律：[频率, 拍长]
  const notes = [
    [523.25, 0.75], [523.25, 0.25], [587.33, 1], [523.25, 1], [783.99, 1], [698.46, 2],
    [523.25, 0.75], [523.25, 0.25], [587.33, 1], [523.25, 1], [880.0, 1], [783.99, 2],
    [523.25, 0.75], [523.25, 0.25], [1046.98, 1], [880.0, 1], [698.46, 1], [659.25, 1], [587.33, 2],
    [932.33, 0.75], [932.33, 0.25], [880.0, 1], [783.99, 1], [698.46, 1], [1046.98, 2],
  ];
  const bass = [261.63, 261.63, 174.61, 174.61, 196.0, 196.0, 261.63, 261.63, 174.61, 174.61, 196.0, 196.0];

  function blip(freq, dur, gain, type) {
    const t = ac.currentTime;
    const osc = ac.createOscillator();
    const env = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(gain, t + 0.03);
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(env).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  function schedule() {
    const beat = 0.46;
    const mel = notes[step % notes.length];
    blip(mel[0], mel[1] * beat, 0.1, 'sine');
    if (step % 2 === 0) blip(bass[(step / 2) % bass.length] / 2, beat * 1.8, 0.045, 'triangle');
    step += 1;
    timer = setTimeout(schedule, mel[1] * beat * 1000);
  }

  return {
    start() {
      if (!ac) {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain();
        master.gain.value = 0.85;
        master.connect(ac.destination);
      }
      ac.resume();
      if (on) return;
      on = true;
      schedule();
    },
    stop() {
      on = false;
      clearTimeout(timer);
      if (master) master.gain.value = 0;
    },
    resume() {
      if (on && master) master.gain.value = 0.85;
    },
    get playing() {
      return on;
    },
  };
})();

const btnMusic = document.getElementById('btn-music');
btnMusic?.addEventListener('click', () => {
  if (music.playing) {
    music.stop();
    btnMusic.classList.remove('is-on');
  } else {
    music.resume();
    music.start();
    btnMusic.classList.add('is-on');
  }
});

/* ---------- 逐字显示 ---------- */
function type(el, text, speed = 26) {
  return new Promise((resolve) => {
    if (prefersReduced || !text) {
      el.textContent = text ?? '';
      resolve();
      return;
    }
    el.textContent = '';
    let i = 0;
    const run = () => {
      el.textContent = text.slice(0, (i += 1));
      if (i >= text.length) {
        resolve();
        return;
      }
      setTimeout(run, speed);
    };
    run();
  });
}

/* ---------- 语音朗读（到屏自动触发） ---------- */
const say = { unlocked: false };
const zhVoices = () => speechSynthesis.getVoices().filter((v) => v.lang.startsWith('zh'));

function pickVoice() {
  const vs = zhVoices();
  if (!vs.length) return null;
  return vs.find((v) => /xiaoxiao|tingting|meijia|huihui|yao/i.test(v.name)) || vs[0];
}

function speak(text, host) {
  if (!('speechSynthesis' in window) || !say.unlocked) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-CN';
  const v = pickVoice();
  if (v) u.voice = v;
  u.rate = 0.92;
  u.pitch = 1.1;
  const stop = () => host?.classList.remove('speaking');
  u.onstart = () => host?.classList.add('speaking');
  u.onend = stop;
  u.onerror = stop;
  speechSynthesis.speak(u);
}

/* ---------- 祝福卡片 ---------- */
const deck = document.getElementById('deck');

CONFIG.messages.forEach((m) => {
  const sec = document.createElement('section');
  sec.className = 'msg';
  sec.dataset.scene = '';
  sec.innerHTML = `
    <div class="msg-bg ${m.bg}"></div>
    <div class="msg-inner">
      <div class="bubble">
        <span class="bubble-tag">${m.tag}</span>
        <h2 class="bubble-title"></h2>
        <p class="bubble-text"></p>
        <span class="say-state" aria-hidden="true"><i></i><i></i><i></i></span>
      </div>
    </div>`;
  sec._data = m;
  sec._typed = false;
  deck.appendChild(sec);
});

/* ---------- 进度点 ---------- */
const dots = document.getElementById('dots');
document.querySelectorAll('[data-scene]').forEach((sec, i) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.dataset.i = String(i);
  b.setAttribute('aria-label', `第 ${i + 1} 屏`);
  b.addEventListener('click', () => sec.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' }));
  dots.appendChild(b);
  sec._dot = b;
});

/* ---------- 分屏揭示 ---------- */
function reveal(sec) {
  sec.classList.add('in');
  dots.querySelectorAll('.active').forEach((d) => d.classList.remove('active'));
  sec._dot?.classList.add('active');

  if (!sec._said && (sec.classList.contains('wish') || sec.classList.contains('finale'))) {
    sec._said = true;
    fireworkShow(sec.classList.contains('finale') ? 4 : 2);
    heartBurst({ count: 8 });
  }

  if (sec.classList.contains('msg') && !sec._typed) {
    sec._typed = true;
    const m = sec._data;
    const bubble = sec.querySelector('.bubble');
    const title = sec.querySelector('.bubble-title');
    const text = sec.querySelector('.bubble-text');
    type(title, m.title, 60)
      .then(() => type(text, m.text, 26))
      .then(() => {
        bubble.classList.add('typed-done');
        if (!sec._said) {
          sec._said = true;
          speak(`${m.title}。${m.text}`, bubble);
        }
      });
  }
}

/* 以视口中线判定当前场景：分屏比屏幕高时也能触发 */
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) reveal(e.target);
    });
  },
  { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
);
document.querySelectorAll('[data-scene]').forEach((s) => io.observe(s));

/* ---------- 拆礼物：蹦出一堆小物件 ---------- */
const gift = document.getElementById('gift');
const giftPop = document.getElementById('gift-pop');
let giftOpen = false;

function popItems() {
  const n = CONFIG.gift.items.length;
  // 散开半径跟着屏幕尺寸走，小屏不会蹦出画面
  const base = Math.min(innerWidth, innerHeight);
  CONFIG.gift.items.forEach((emoji, i) => {
    const span = document.createElement('span');
    span.className = 'pop';
    span.textContent = emoji;
    const angle = -Math.PI / 2 + (i / (n - 1) - 0.5) * Math.PI * 0.95;
    const dist = base * rand(0.16, 0.3);
    span.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
    span.style.setProperty('--ty', `${Math.sin(angle) * dist - base * rand(0.03, 0.1)}px`);
    span.style.setProperty('--rot', `${rand(-40, 40)}deg`);
    span.style.setProperty('--d', `${i * 70}ms`);
    span.style.fontSize = `${base * rand(0.055, 0.085)}px`;
    giftPop.appendChild(span);
  });
}

function openGift() {
  if (giftOpen) return;
  giftOpen = true;
  gift.classList.add('opened');
  document.getElementById('gift-hint').hidden = true;
  document.getElementById('gift-note').hidden = false;
  popItems();
  const r = gift.getBoundingClientRect();
  const at = { x: r.left + r.width / 2, y: r.top };
  confettiBurst({ count: 70, origin: at, power: 8 });
  flowerBurst({ count: 16, origin: at });
  heartBurst({ count: 10, origin: at });
  speak(CONFIG.gift.opened);
}

gift?.addEventListener('click', openGift);
gift?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    openGift();
  }
});

/* ---------- 吹蜡烛 ---------- */
const cake = document.getElementById('cake');
let lit = true;

function blowOut() {
  if (!lit) return;
  lit = false;
  cake.classList.add('blown');
  document.getElementById('wish-done').hidden = false;
  const r = cake.getBoundingClientRect();
  confettiBurst({ count: 50, origin: { x: r.left + r.width / 2, y: r.top }, power: 7 });
  fireworkShow(2);
  speak('愿望说出来就不灵了，不过还是要祝你生日快乐。');
}

cake?.addEventListener('click', blowOut);
cake?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    blowOut();
  }
});

/* ---------- 静态文案注入 ---------- */
document.getElementById('hero-name').textContent = CONFIG.name;
document.getElementById('hero-date').textContent = CONFIG.date;
document.getElementById('finale-title').textContent = `${CONFIG.name}，生日快乐`;
document.getElementById('gift-title').textContent = CONFIG.gift.title;
document.getElementById('gift-hint').textContent = CONFIG.gift.hint;
document.getElementById('gift-note').textContent = CONFIG.gift.opened;

document.getElementById('replay')?.addEventListener('click', () => {
  lit = true;
  cake.classList.remove('blown');
  document.getElementById('wish-done').hidden = true;
  window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
});

/* ---------- 入口 ---------- */
const gate = document.getElementById('gate');

async function enter() {
  music.start();
  btnMusic?.classList.add('is-on');
  if ('speechSynthesis' in window) {
    try {
      const tiny = new SpeechSynthesisUtterance(' ');
      tiny.volume = 0;
      speechSynthesis.speak(tiny);
      say.unlocked = true;
    } catch {
      /* 朗读不可用时静默降级 */
    }
  }
  gate.classList.add('gone');
  await sleep(700);
  gate.hidden = true;
  document.body.classList.add('entered');
  reveal(document.querySelector('.cover'));
  confettiBurst({ count: 70 });
  flowerBurst({ count: 10 });
  if (!prefersReduced) {
    setInterval(() => flowerBurst({ count: 2 }), 3200);
  }
}

document.getElementById('gate-btn')?.addEventListener('click', enter);

/* 移动端偶尔需要额外手势才允许朗读 */
document.addEventListener('touchend', () => {
  say.unlocked = true;
}, { once: true });

addEventListener('pagehide', () => {
  music.stop();
  speechSynthesis.cancel();
});
