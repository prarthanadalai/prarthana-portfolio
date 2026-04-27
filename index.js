(() => {
  'use strict';

  /* ----- Sticky-nav border on scroll ----- */
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    const onScroll = () => {
      nav.setAttribute('data-scrolled', window.scrollY > 8 ? 'true' : 'false');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----- Scroll reveal — staggered ----- */
  const targets = document.querySelectorAll('[data-reveal]');
  if (targets.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const idx = Array.from(el.parentElement?.children || []).indexOf(el);
          el.style.transitionDelay = `${Math.min(idx, 4) * 70}ms`;
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach((el) => io.observe(el));
  } else {
    targets.forEach((el) => el.classList.add('is-visible'));
  }

  /* ----- Footer year ----- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
