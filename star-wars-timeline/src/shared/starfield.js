const LAYERS = [
  { count: 200, speed: 0.06, minR: 0.4, maxR: 0.9, minA: 0.3, maxA: 0.6 },
  { count: 70,  speed: 0.14, minR: 0.9, maxR: 1.8, minA: 0.6, maxA: 1.0 },
];

const SHOOTING_STAR_INTERVAL = 4000;
const SHOOTING_STAR_CHANCE   = 0.5;

let canvas, ctx, w, h;
let stars  = [];
let shoots = [];
let scrollY = 0;
let raf;

function rand(min, max) { return min + Math.random() * (max - min); }

function initStars() {
  stars = [];
  LAYERS.forEach((layer, li) => {
    for (let i = 0; i < layer.count; i++) {
      stars.push({
        x:     rand(0, w),
        y:     rand(0, h),
        r:     rand(layer.minR, layer.maxR),
        alpha: rand(layer.minA, layer.maxA),
        layer: li,
        twinkleSpeed: rand(0.005, 0.02),
        twinklePhase: rand(0, Math.PI * 2),
      });
    }
  });
}

function spawnShootingStar() {
  if (Math.random() > SHOOTING_STAR_CHANCE) return;
  const angle = rand(20, 45) * (Math.PI / 180);
  const len   = rand(80, 200);
  shoots.push({
    x:      rand(0, w * 0.8),
    y:      rand(0, h * 0.4),
    vx:     Math.cos(angle) * rand(6, 12),
    vy:     Math.sin(angle) * rand(6, 12),
    len,
    alpha:  1,
    decay:  rand(0.016, 0.028),
    tail:   [],
  });
}

let shootTimer = 0;

function draw(ts) {
  raf = requestAnimationFrame(draw);
  ctx.clearRect(0, 0, w, h);

  const t = ts * 0.001;

  stars.forEach(s => {
    const layer = LAYERS[s.layer];
    const parallaxY = (scrollY * layer.speed) % h;
    let py = (s.y - parallaxY % h + h) % h;

    const twinkle = s.alpha + Math.sin(t * s.twinkleSpeed * 60 + s.twinklePhase) * 0.15;
    ctx.beginPath();
    ctx.arc(s.x, py, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200, 215, 255, ${Math.max(0.1, Math.min(1, twinkle))})`;
    ctx.fill();
  });

  if (ts - shootTimer > SHOOTING_STAR_INTERVAL) {
    spawnShootingStar();
    shootTimer = ts;
  }

  shoots = shoots.filter(s => s.alpha > 0.01);
  shoots.forEach(s => {
    s.tail.unshift({ x: s.x, y: s.y });
    if (s.tail.length > 18) s.tail.pop();
    s.x += s.vx;
    s.y += s.vy;
    s.alpha -= s.decay;

    if (s.tail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(s.tail[0].x, s.tail[0].y);
      for (let i = 1; i < s.tail.length; i++) {
        ctx.lineTo(s.tail[i].x, s.tail[i].y);
      }
      const grad = ctx.createLinearGradient(
        s.x, s.y,
        s.tail[s.tail.length - 1].x,
        s.tail[s.tail.length - 1].y
      );
      grad.addColorStop(0, `rgba(220, 235, 255, ${s.alpha})`);
      grad.addColorStop(1, 'rgba(220, 235, 255, 0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(240, 248, 255, ${s.alpha})`;
    ctx.fill();
  });
}

function resize() {
  w = canvas.width  = window.innerWidth;
  h = canvas.height = window.innerHeight;
  initStars();
}

export function initStarfield() {
  canvas = document.getElementById('starfield');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
  shootTimer = performance.now();
  raf = requestAnimationFrame(draw);
}
