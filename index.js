(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----- Splash — first-load only, removes itself ----- */
  const splash = document.querySelector('[data-splash]');
  let splashDelay = 0;
  if (splash) {
    let seen = false;
    try { seen = sessionStorage.getItem('pd-splash-seen') === '1'; } catch {}
    if (seen) {
      splash.classList.add('splash--gone');
      splashDelay = 0;
    } else {
      try { sessionStorage.setItem('pd-splash-seen', '1'); } catch {}
      splashDelay = 2200;
      setTimeout(() => splash.classList.add('splash--gone'), splashDelay);
    }
  }

  /* ----- Sticky-nav border on scroll ----- */
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    const onScroll = () => {
      nav.setAttribute('data-scrolled', window.scrollY > 8 ? 'true' : 'false');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ----- Footer year ----- */
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ----- Reveal & counters — fired once splash is gone ----- */
  const finishLoad = () => {
    document.body.classList.add('is-loaded');
    initReveal();
    initCounters();
  };

  if (splash && splashDelay > 0) {
    setTimeout(finishLoad, splashDelay);
  } else {
    // Either no splash, or already seen this session — go straight in.
    finishLoad();
  }

  /* ----- Scroll reveal (staggered) ----- */
  function initReveal() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;
    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
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
  }

  /* ----- Counter animation on numbers section ----- */
  function initCounters() {
    const els = document.querySelectorAll('[data-counter]');
    if (!els.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      // Skip animation; leave existing markup untouched.
      return;
    }

    // Cache the original markup so we can re-render each frame.
    els.forEach((el) => { el.dataset._orig = el.innerHTML; });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        animateCounter(entry.target);
      });
    }, { threshold: 0.4 });
    els.forEach((el) => obs.observe(el));
  }

  function animateCounter(el) {
    const target = parseFloat(el.dataset.counter);
    if (isNaN(target)) return;
    const decimals = (el.dataset.counter.split('.')[1] || '').length;
    const orig = el.dataset._orig || el.innerHTML;
    // Match: leading non-digits (prefix), the number, then everything after (incl. inner HTML).
    const m = orig.match(/^(\D*?)([\d.]+)([\s\S]*)$/);
    if (!m) return;
    const prefix = m[1];
    const tail = m[3];
    const duration = 1500;
    const startTime = performance.now();

    const tick = (now) => {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);          // easeOutCubic
      const cur = (target * eased).toFixed(decimals);
      el.innerHTML = `${prefix}${cur}${tail}`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
})();
