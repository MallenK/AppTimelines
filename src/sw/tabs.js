import { t } from './i18n/index.js';

const UNIVERSES = [
  { id: 'starwars', active: true  },
  { id: 'marvel',   active: false },
  { id: 'lotr',     active: false },
  { id: 'dune',     active: false },
];

let currentUniverse = 'starwars';
let onSwitchCallback = null;

export function initTabs(onSwitch) {
  onSwitchCallback = onSwitch;
  const nav = document.getElementById('tabsNav');
  if (!nav) return;

  nav.innerHTML = '';
  UNIVERSES.forEach(u => {
    const btn = document.createElement('button');
    const label = t(`universes.${u.id}`);
    btn.className = 'tab-btn' + (u.id === currentUniverse ? ' active' : '') + (!u.active ? ' disabled' : '');
    btn.textContent = label;
    btn.dataset.universe = u.id;
    btn.setAttribute('aria-label', u.active ? label : `${label} — ${t('comingSoon')}`);

    btn.addEventListener('click', () => {
      if (u.id === currentUniverse) return;
      if (!u.active) { showComingSoon(); return; }
      switchTab(u.id);
    });

    nav.appendChild(btn);
  });
}

function switchTab(id) {
  currentUniverse = id;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.universe === id);
  });

  const wrap  = document.getElementById('timelineWrap');
  const chars = document.getElementById('characterStrip');
  const tl    = gsap.timeline();

  tl.to([wrap, chars], { opacity: 0, y: -12, duration: 0.2, ease: 'power2.in' })
    .call(() => { if (onSwitchCallback) onSwitchCallback(id); })
    .to([wrap, chars], { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' });
}

let comingSoonTimeout;
function showComingSoon() {
  const overlay = document.getElementById('comingSoonOverlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
  clearTimeout(comingSoonTimeout);
  comingSoonTimeout = setTimeout(() => {
    gsap.to(overlay, {
      opacity: 0, duration: 0.3,
      onComplete: () => { overlay.style.display = 'none'; }
    });
  }, 2500);
}
