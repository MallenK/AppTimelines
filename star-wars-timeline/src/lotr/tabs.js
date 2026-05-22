import { ERAS } from './data/index.js';
import { t } from './i18n/index.js';

let currentEra = 'all';
let onSwitchCallback = null;

export function initLotrTabs(onSwitch) {
  onSwitchCallback = onSwitch;
  const nav = document.getElementById('tabsNav');
  if (!nav) return;
  nav.innerHTML = '';

  const allEras = [{ id: 'all' }, ...ERAS];

  allEras.forEach(era => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (era.id === currentEra ? ' active' : '');
    btn.textContent = t(`eras.${era.id}`);
    btn.dataset.era = era.id;

    btn.addEventListener('click', () => {
      if (era.id === currentEra) return;
      switchEra(era.id);
    });

    nav.appendChild(btn);
  });
}

function switchEra(id) {
  currentEra = id;
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.era === id);
  });

  const wrap  = document.getElementById('timelineWrap');
  const chars = document.getElementById('characterStrip');
  const tl    = gsap.timeline();

  tl.to([wrap, chars], { opacity: 0, y: -12, duration: 0.2, ease: 'power2.in' })
    .call(() => { if (onSwitchCallback) onSwitchCallback(id); })
    .to([wrap, chars], { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' });
}
