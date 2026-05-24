import { FACTIONS } from '../data/index.js';

export function setupAnimations(allCols) {
  const section = document.getElementById('timelineSection');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const col  = entry.target;
        const card = col.querySelector('.event-card');
        const dot  = col.querySelector('.event-dot');

        gsap.fromTo(card,
          { y: 28, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' }
        );
        gsap.fromTo(dot,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2.5)', delay: 0.1 }
        );
        gsap.to(dot, {
          scale: 1.45,
          repeat: -1, yoyo: true,
          duration: 1.4,
          ease: 'sine.inOut',
          delay: 0.5 + Math.random() * 1.2,
        });

        observer.unobserve(col);
      });
    },
    { threshold: 0.05, root: section }
  );

  allCols.forEach(({ col }) => observer.observe(col));

  setTimeout(() => {
    initScrollSpotlight(allCols);
    initHoverEffects(allCols);
  }, 400);
}

function initScrollSpotlight(allCols) {
  if (window.innerWidth <= 768) return;
  const section = document.getElementById('timelineSection');
  if (!section) return;

  const update = () => {
    const viewCenter = section.scrollLeft + section.clientWidth / 2;
    const range      = section.clientWidth * 0.72;

    allCols.forEach(({ col, card }) => {
      if (col.classList.contains('filtered-out')) return;
      const colCenter = col.offsetLeft + col.offsetWidth / 2;
      const dist      = Math.abs(colCenter - viewCenter);
      const prox      = Math.max(0, 1 - dist / range);

      gsap.to(card, {
        scale:   0.88 + prox * 0.12,
        opacity: 0.38 + prox * 0.62,
        duration: 0.22,
        ease: 'power1.out',
        overwrite: 'auto',
      });
    });
  };

  section.addEventListener('scroll', update, { passive: true });
  requestAnimationFrame(update);
}

function initHoverEffects(allCols) {
  allCols.forEach(({ card, dot, conn, event }) => {
    const { rgb } = FACTIONS[event.faction];

    card.addEventListener('mouseenter', () => {
      gsap.to(card, { y: -10, duration: 0.28, ease: 'power2.out', overwrite: 'auto' });
      gsap.to(dot, { boxShadow: `0 0 22px rgba(${rgb},1), 0 0 44px rgba(${rgb},0.65)`, duration: 0.25, overwrite: 'auto' });
      gsap.to(conn, { width: '2px', opacity: 1, filter: `drop-shadow(0 0 4px rgba(${rgb},0.8))`, duration: 0.25, overwrite: 'auto' });
      card.classList.add('shimmer');
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, { y: 0, duration: 0.38, ease: 'power2.inOut', overwrite: 'auto' });
      gsap.to(dot, { boxShadow: `0 0 10px rgba(${rgb},0.9), 0 0 20px rgba(${rgb},0.4)`, duration: 0.38, overwrite: 'auto' });
      gsap.to(conn, { width: '1px', opacity: 1, filter: 'none', duration: 0.38, overwrite: 'auto' });
      card.classList.remove('shimmer');
    });
  });
}
