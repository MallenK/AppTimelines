import { CHARACTERS, FACTIONS, ERAS } from './data/index.js';
import { t } from './i18n/index.js';

const selectedIds = new Set();
let onFilterCallback = null;
let searchQuery = '';

export function initCharacters(onFilter) {
  onFilterCallback = onFilter;
  renderCharacters();
  applyCurrentSearch();
}

export function initSearch() {
  const input    = document.getElementById('charSearch');
  const clearBtn = document.getElementById('charSearchClear');
  if (!input) return;

  input.addEventListener('input', () => {
    searchQuery = input.value.trim().toLowerCase();
    clearBtn?.classList.toggle('visible', searchQuery.length > 0);
    applyCurrentSearch();
  });

  clearBtn?.addEventListener('click', () => {
    input.value = '';
    searchQuery = '';
    clearBtn.classList.remove('visible');
    applyCurrentSearch();
    input.focus();
  });
}

function applyCurrentSearch() {
  const noResults = document.getElementById('charNoResults');
  let visibleCount = 0;

  document.querySelectorAll('.char-card').forEach(card => {
    const id   = card.dataset.id;
    const char = CHARACTERS.find(c => c.id === id);

    if (!char || !searchQuery) {
      card.style.display = '';
      if (char) visibleCount++;
      return;
    }

    const name      = (t(`characters.${char.id}`) || '').toLowerCase();
    const faction   = (t(`factions.${char.faction}`) || '').toLowerCase();
    const species   = (char.species   || '').toLowerCase();
    const homeworld = (char.homeworld || '').toLowerCase();

    const matches = name.includes(searchQuery)    ||
                    faction.includes(searchQuery)  ||
                    species.includes(searchQuery)  ||
                    homeworld.includes(searchQuery);

    card.style.display = matches ? '' : 'none';
    if (matches) visibleCount++;
  });

  if (noResults) noResults.classList.toggle('visible', visibleCount === 0 && searchQuery.length > 0);
}

export function initModal() {
  const modal     = document.getElementById('charModal');
  const closeBtn  = document.getElementById('charModalClose');
  const filterBtn = document.getElementById('charModalFilter');
  if (!modal) return;

  modal.addEventListener('click', e => {
    if (e.target === modal) closeCharModal();
  });
  closeBtn?.addEventListener('click', closeCharModal);
  filterBtn?.addEventListener('click', () => {
    const charId = modal.dataset.charId;
    if (!charId) return;

    if (selectedIds.has(charId)) {
      selectedIds.delete(charId);
    } else {
      selectedIds.clear();
      selectedIds.add(charId);
    }

    document.querySelectorAll('.char-card').forEach(c => {
      c.classList.toggle('selected', selectedIds.has(c.dataset.id));
    });

    if (onFilterCallback) onFilterCallback([...selectedIds]);
    closeCharModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCharModal();
  });
}

export function clearCharacterSelection() {
  selectedIds.clear();
  document.querySelectorAll('.char-card').forEach(c => c.classList.remove('selected'));
  if (onFilterCallback) onFilterCallback([]);
}

function renderCharacters() {
  const grid = document.getElementById('characterStrip');
  if (!grid) return;
  grid.innerHTML = '';

  CHARACTERS.forEach(char => {
    const faction = FACTIONS[char.faction];
    const card    = document.createElement('div');
    card.className = 'char-card' + (selectedIds.has(char.id) ? ' selected' : '');
    card.dataset.id = char.id;
    card.style.setProperty('--char-glow-rgb', faction.rgb);
    card.setAttribute('aria-label', t(`characters.${char.id}`));
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const imgHtml = char.img
      ? `<img src="${char.img}" alt="${t(`characters.${char.id}`)}"
             onerror="this.style.display='none'">`
      : '';

    const sideColor = { light: '59,130,246', dark: '239,68,68', both: '168,85,247', neutral: '136,146,164' }[char.side || 'neutral'];

    card.innerHTML = `
      <div class="char-selected-ring"></div>
      <div class="char-portrait" aria-hidden="true">
        ${imgHtml}
        <span class="char-icon-fallback">${char.icon || char.initials[0]}</span>
      </div>
      <div class="char-info">
        <p class="char-name">${t(`characters.${char.id}`)}</p>
        <span class="char-faction-badge">${t(`factions.${char.faction}`)}</span>
        <p class="char-meta">
          <span>${char.species || ''}</span>
          ${char.homeworld ? `<span class="char-meta-sep">·</span><span>${char.homeworld}</span>` : ''}
        </p>
      </div>
      <div class="char-side-pip" style="background:rgb(${sideColor}); box-shadow:0 0 6px rgba(${sideColor},0.8)"></div>
    `;

    card.addEventListener('click', () => openCharModal(char));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCharModal(char); }
    });

    grid.appendChild(card);
  });

  gsap.fromTo('.char-card',
    { y: 18, opacity: 0 },
    { y: 0, opacity: 1, stagger: 0.05, duration: 0.45, ease: 'power2.out', delay: 0.3 }
  );
}

function openCharModal(char) {
  const modal = document.getElementById('charModal');
  if (!modal) return;

  const faction = FACTIONS[char.faction];
  modal.dataset.charId = char.id;
  modal.style.setProperty('--modal-glow-rgb', faction.rgb);

  const eraBadges = [...new Set(char.era)].map(eraId => {
    const eraDef = ERAS.find(e => e.id === eraId);
    const eraFac = FACTIONS[eraDef?.faction || 'neutral'];
    return `<span class="modal-era-badge"
      style="color:rgb(${eraFac.rgb});
             background:rgba(${eraFac.rgb},0.08);
             border-color:rgba(${eraFac.rgb},0.28)">
      ${t(`eras.${eraId}`)}
    </span>`;
  }).join('');

  const imgEl = document.getElementById('charModalImg');
  imgEl.style.setProperty('--modal-glow-rgb', faction.rgb);
  imgEl.innerHTML = char.img
    ? `<img src="${char.img}" alt="${t(`characters.${char.id}`)}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
       <span class="modal-img-icon" style="display:none">${char.icon}</span>`
    : `<span class="modal-img-icon">${char.icon}</span>`;

  document.getElementById('charModalFaction').textContent = t(`factions.${char.faction}`);
  document.getElementById('charModalFaction').style.setProperty('--modal-glow-rgb', faction.rgb);
  document.getElementById('charModalName').textContent    = t(`characters.${char.id}`);
  document.getElementById('charModalSpecies').textContent = char.species    || '—';
  document.getElementById('charModalHomeworld').textContent = char.homeworld || '—';
  document.getElementById('charModalSide').textContent    = t(`side.${char.side || 'neutral'}`);
  document.getElementById('charModalBio').textContent     = char.bio || '';
  document.getElementById('charModalEras').innerHTML      = eraBadges;

  const isSelected = selectedIds.has(char.id);
  const filterBtn  = document.getElementById('charModalFilter');
  filterBtn.textContent = isSelected ? t('filterBtnRemove') : t('filterBtn');
  filterBtn.style.setProperty('--modal-glow-rgb', faction.rgb);
  filterBtn.classList.toggle('active', isSelected);

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  gsap.fromTo('#charModalInner',
    { scale: 0.9, opacity: 0, y: 24 },
    { scale: 1, opacity: 1, y: 0, duration: 0.32, ease: 'power2.out' }
  );
}

function closeCharModal() {
  const modal = document.getElementById('charModal');
  if (!modal || !modal.classList.contains('open')) return;

  gsap.to('#charModalInner', {
    scale: 0.94, opacity: 0, y: 12, duration: 0.2, ease: 'power2.in',
    onComplete: () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    },
  });
}
