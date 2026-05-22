import { initStarfield } from '../shared/starfield.js';
import { initLotrTabs }  from './tabs.js';
import { initLotrCharacters, initLotrModal, clearLotrCharacterSelection } from './characters.js';
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

document.addEventListener('DOMContentLoaded', () => {
  initStarfield();
  initLangSwitcher();
  initLotrModal();
  initLotrTabs(onEraSwitch);
  initLotrCharacters(onCharacterFilter);
  initLotrTimeline();
  applyStaticI18n();
  initScrollHijack();
});
