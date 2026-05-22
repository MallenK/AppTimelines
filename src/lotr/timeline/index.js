import { buildTimeline } from './render.js';
import { setupAnimations } from './animations.js';

let activeCharFilter = [];
let activeEraFilter  = 'all';
let allCols          = [];

export function initLotrTimeline() {
  gsap.registerPlugin(ScrollTrigger);
  allCols = buildTimeline();
  setupAnimations(allCols);
}

export function filterLotrTimeline(selectedIds) {
  activeCharFilter = selectedIds;
  applyFilter();
}

export function filterLotrTimelineByEra(eraId) {
  activeEraFilter = eraId;
  applyFilter();
}

function applyFilter() {
  allCols.forEach(({ col, event }) => {
    const charMatch = activeCharFilter.length === 0 ||
      event.characters.some(id => activeCharFilter.includes(id));
    const eraMatch  = activeEraFilter === 'all' || event.era === activeEraFilter;
    const matches   = charMatch && eraMatch;

    if (matches) {
      col.classList.remove('filtered-out');
      gsap.to(col, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' });
    } else {
      col.classList.add('filtered-out');
      gsap.to(col, { opacity: 0.12, scale: 0.95, duration: 0.3, ease: 'power2.in' });
    }
  });
}

export function destroyLotrTimeline() {
  ScrollTrigger.getAll().forEach(st => st.kill());
  allCols = [];
}
