import { TIMELINE_EVENTS, ERAS, FACTIONS, CHARACTERS } from '../data/index.js';
import { t } from '../i18n/index.js';

export const COL_W    = 320;
export const MARGIN   = 100;
export const ARCH_TOP  = 56;
export const ARCH_BASE = 320;
export const CARD_TOP  = 360;
const        CARD_H    = 380;
export const WRAP_H    = CARD_TOP + CARD_H + 32;

export function getArchY(index, total) {
  const tv = (2 * index / (total - 1)) - 1;
  return ARCH_TOP + (ARCH_BASE - ARCH_TOP) * tv * tv;
}

export function buildTimeline() {
  const wrap = document.getElementById('timelineWrap');
  if (!wrap) return [];
  wrap.innerHTML = '';
  const allCols = [];

  const n      = TIMELINE_EVENTS.length;
  const totalW = MARGIN * 2 + (n - 1) * COL_W;

  wrap.style.cssText = `
    position: relative;
    width: ${totalW}px;
    height: ${WRAP_H}px;
    user-select: none;
  `;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('arch-svg');
  svg.setAttribute('width', totalW);
  svg.setAttribute('height', ARCH_BASE + 20);
  svg.style.cssText = 'position:absolute;top:0;left:0;pointer-events:none;z-index:1;overflow:visible;';

  const steps = 140;
  const pathPts = [];
  for (let s = 0; s <= steps; s++) {
    const frac = s / steps;
    const x    = MARGIN + frac * (totalW - MARGIN * 2);
    const tVal = 2 * frac - 1;
    const y    = ARCH_TOP + (ARCH_BASE - ARCH_TOP) * tVal * tVal;
    pathPts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const pathD = 'M ' + pathPts.join(' L ');

  svg.innerHTML = `
    <defs>
      <linearGradient id="archGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stop-color="rgba(59,130,246,0.9)"/>
        <stop offset="28%"  stop-color="rgba(239,68,68,0.7)"/>
        <stop offset="55%"  stop-color="rgba(168,85,247,0.7)"/>
        <stop offset="80%"  stop-color="rgba(245,158,11,0.7)"/>
        <stop offset="100%" stop-color="rgba(34,197,94,0.9)"/>
      </linearGradient>
      <filter id="archGlow" x="-10%" y="-50%" width="120%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6"/>
      </filter>
    </defs>
    <path d="${pathD}" fill="none" stroke="url(#archGrad)"
          stroke-width="10" filter="url(#archGlow)" opacity="0.4"
          id="timelineSpineGlow"/>
    <path d="${pathD}" fill="none" stroke="url(#archGrad)"
          stroke-width="2.5" id="timelineSpine"
          stroke-dasharray="10000" stroke-dashoffset="10000"/>
  `;
  wrap.appendChild(svg);

  gsap.to('#timelineSpine', { strokeDashoffset: 0, duration: 2.8, ease: 'power1.inOut', delay: 0.2 });
  gsap.to('#timelineSpineGlow', { opacity: 0.4, duration: 2.8, ease: 'power1.inOut', delay: 0.2 });

  let lastEra = null;
  TIMELINE_EVENTS.forEach((event, i) => {
    if (event.era === lastEra) return;
    lastEra = event.era;
    const xCenter = MARGIN + i * COL_W;
    const yDot    = getArchY(i, n);
    const eraDef  = ERAS.find(e => e.id === event.era);
    const eraFac  = FACTIONS[eraDef?.faction || 'neutral'];

    const label = document.createElement('div');
    label.className = 'era-label-h';
    label.style.cssText = `
      left: ${xCenter - 52}px;
      top:  ${yDot + 20}px;
      color: rgb(${eraFac.rgb});
      border-color: rgba(${eraFac.rgb}, 0.35);
    `;
    label.textContent = t(`eras.${event.era}`);
    wrap.appendChild(label);
  });

  TIMELINE_EVENTS.forEach((event, i) => {
    const faction  = FACTIONS[event.faction];
    const xCenter  = MARGIN + i * COL_W;
    const yDot     = getArchY(i, n);
    const colLeft  = xCenter - COL_W / 2;

    const col = document.createElement('div');
    col.className    = 'event-col';
    col.dataset.eventId = event.id;
    col.style.cssText = `
      position: absolute;
      left:   ${colLeft}px;
      top:    0;
      width:  ${COL_W}px;
      height: ${WRAP_H}px;
      z-index: 3;
    `;

    const connH = CARD_TOP - yDot;
    const conn  = document.createElement('div');
    conn.style.cssText = `
      position:  absolute;
      left:      50%;
      top:       ${yDot}px;
      width:     1px;
      height:    ${connH}px;
      transform: translateX(-50%);
      background: linear-gradient(180deg,
        rgba(${faction.rgb}, 0.65) 0%,
        rgba(${faction.rgb}, 0.05) 100%);
      z-index: 2;
    `;

    const dotWrap = document.createElement('div');
    dotWrap.className = 'event-dot-wrap-h';
    dotWrap.style.cssText = `
      position:  absolute;
      left:      50%;
      top:       ${yDot}px;
      transform: translate(-50%, -50%);
      z-index:   6;
    `;
    dotWrap.innerHTML = `
      <div class="event-dot"
           style="--card-glow-rgb:${faction.rgb}; background:${faction.color};"></div>
      <div class="event-dot-ring"
           style="border-color:rgba(${faction.rgb},0.35);"></div>
    `;

    const card = document.createElement('article');
    card.className = 'event-card event-card-h';
    card.style.cssText = `
      position: absolute;
      top:   ${CARD_TOP}px;
      left:  6px;
      right: 6px;
      --card-glow-rgb: ${faction.rgb};
    `;

    const imgHtml = event.img
      ? `<img src="${event.img}" alt="${t(`events.${event.id}.title`)}"
             onerror="this.style.display='none'">`
      : '';

    const charAvatars = event.characters.map(id => {
      const char = CHARACTERS.find(c => c.id === id);
      if (!char) return '';
      const cfac = FACTIONS[char.faction];
      const cImg = char.img
        ? `<img src="${char.img}" onerror="this.style.display='none'">`
        : '';
      return `<div class="card-char-avatar"
        style="--char-glow-rgb:${cfac.rgb}"
        title="${t(`characters.${id}`)}">
        ${cImg}
        <span class="card-char-icon">${char.icon}</span>
      </div>`;
    }).join('');

    card.innerHTML = `
      <div class="event-image event-image-h" style="--card-glow-rgb:${faction.rgb}">
        ${imgHtml}
        <div class="event-image-overlay">
          <time class="event-year-overlay">${event.year}</time>
        </div>
        <span class="event-image-icon">${event.icon}</span>
      </div>
      <div class="event-card-body">
        <div class="event-card-header">
          <h3 class="event-title">${t(`events.${event.id}.title`)}</h3>
          <span class="era-badge">${t(`eras.${event.era}`)}</span>
        </div>
        <p class="event-desc">${t(`events.${event.id}.description`)}</p>
        <div class="event-faction-bar" style="background:rgba(${faction.rgb},0.12); border-color:rgba(${faction.rgb},0.25)">
          <span class="event-faction-dot" style="background:${faction.color}; box-shadow:0 0 8px rgba(${faction.rgb},0.8)"></span>
          <span class="event-faction-label" style="color:rgba(${faction.rgb},0.9)">${t(`factions.${event.faction}`)}</span>
        </div>
        ${charAvatars ? `<div class="event-char-avatars">${charAvatars}</div>` : ''}
      </div>
    `;

    col.appendChild(conn);
    col.appendChild(dotWrap);
    col.appendChild(card);
    wrap.appendChild(col);

    allCols.push({ col, event, card, conn, dot: dotWrap.querySelector('.event-dot') });
  });

  return allCols;
}
