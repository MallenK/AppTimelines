import { buildTimeline } from './render.js';
import { setupAnimations } from './animations.js';

let activeFilter = [];
let allCols      = [];

export function initTimeline() {
  gsap.registerPlugin(ScrollTrigger);
  allCols = buildTimeline();
  setupAnimations(allCols);
}

export function filterTimeline(selectedIds) {
  activeFilter = selectedIds;
  allCols.forEach(({ col, event }) => {
    const matches =
      activeFilter.length === 0 ||
      event.characters.some(id => activeFilter.includes(id));

    if (matches) {
      col.classList.remove('filtered-out');
      gsap.to(col, { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' });
    } else {
      col.classList.add('filtered-out');
      gsap.to(col, { opacity: 0.12, scale: 0.95, duration: 0.3, ease: 'power2.in' });
    }
  });
}

export function destroyTimeline() {
  ScrollTrigger.getAll().forEach(st => st.kill());
  allCols = [];
}
