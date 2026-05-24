import { initStarfield } from '../shared/starfield.js';
import { initLotrTabs }  from './tabs.js';
import { initLotrCharacters, initLotrModal, clearLotrCharacterSelection, initLotrSearch } from './characters.js';
import { initLotrTimeline, filterLotrTimeline, filterLotrTimelineByEra, destroyLotrTimeline } from './timeline/index.js';
import { LANGS, LANG_LABELS, getLang, setLang, t } from './i18n/index.js';

let currentFilter = [];

function onEraSwitch(eraId) {
  clearLotrCharacterSelection();
  currentFilter = [];
  filterLotrTimelineByEra(eraId);
}

function onCharacterFilter(selectedIds) {
  currentFilter = selectedIds;
  filterLotrTimeline(selectedIds);
}

function applyStaticI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  const logoText = document.getElementById('logoText');
  if (logoText) logoText.childNodes[0].textContent = t('logoTitle');
  const logoSub  = document.getElementById('logoSub');
  if (logoSub)  logoSub.textContent = t('logoSub');
  document.documentElement.lang = getLang();
}

function switchLang(lang) {
  setLang(lang);
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  destroyLotrTimeline();
  initLotrTabs(onEraSwitch);
  initLotrCharacters(onCharacterFilter);
  initLotrTimeline();
  applyStaticI18n();
}

function initLangSwitcher() {
  const container = document.getElementById('langSwitcher');
  if (!container) return;
  container.innerHTML = '';
  LANGS.forEach(lang => {
    const btn = document.createElement('button');
    btn.className = 'lang-btn' + (lang === getLang() ? ' active' : '');
    btn.textContent = LANG_LABELS[lang];
    btn.dataset.lang = lang;
    btn.title = { ca: 'Català', en: 'English', es: 'Español' }[lang];
    btn.addEventListener('click', () => switchLang(lang));
    container.appendChild(btn);
  });
}

function initScrollHijack() {
  if (window.innerWidth <= 768) return;
  const sidebar  = document.getElementById('charsSidebar');
  const timeline = document.getElementById('timelineSection');
  if (!timeline) return;

  document.addEventListener('wheel', (e) => {
    if (sidebar && sidebar.contains(e.target)) return;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
    e.preventDefault();

    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 32;
    if (e.deltaMode === 2) delta *= timeline.clientWidth;

    timeline.scrollLeft += delta;
  }, { passive: false });
}

function initMobileSidebar() {
  const toggle   = document.getElementById('charsMobileToggle');
  const sidebar  = document.getElementById('charsSidebar');
  const backdrop = document.getElementById('charsMobileBackdrop');
  if (!toggle || !sidebar) return;

  function openSidebar() {
    sidebar.classList.add('mobile-open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    if (backdrop) backdrop.classList.add('visible');
  }

  function closeSidebar() {
    sidebar.classList.remove('mobile-open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    if (backdrop) backdrop.classList.remove('visible');
  }

  toggle.addEventListener('click', () => {
    sidebar.classList.contains('mobile-open') ? closeSidebar() : openSidebar();
  });

  backdrop?.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sidebar.classList.contains('mobile-open')) closeSidebar();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initLangSwitcher();
  initLotrModal();
  initLotrTabs(onEraSwitch);
  initLotrCharacters(onCharacterFilter);
  initLotrTimeline();
  applyStaticI18n();
  initScrollHijack();
  initLotrSearch();
  initMobileSidebar();
});
