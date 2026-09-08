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

  /* ----- Mobile menu ----- */
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navMenu   = document.querySelector('[data-nav-menu]');
  if (navToggle && navMenu) {
    // The panel is opaque and covers the page. Anything behind it must leave the
    // tab order too, or focus walks onto controls the user cannot see.
    const behind = [document.getElementById('main'), document.querySelector('footer')];
    const focusables = () =>
      Array.from(navMenu.querySelectorAll('a[href], button:not([disabled])'));

    const setMenu = (open) => {
      navMenu.hidden = !open;
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('nav-open', open);
      behind.forEach((el) => {
        if (!el) return;
        if (open) { el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); }
        else      { el.removeAttribute('inert'); el.removeAttribute('aria-hidden'); }
      });
      if (open) { const f = focusables(); if (f.length) f[0].focus(); }
    };
    navToggle.addEventListener('click', () => {
      setMenu(navMenu.hidden);
    });
    // Any jump closes the menu so the target is actually visible.
    navMenu.addEventListener('click', (e) => {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', (e) => {
      if (navMenu.hidden) return;
      if (e.key === 'Escape') { setMenu(false); navToggle.focus(); return; }
      if (e.key !== 'Tab') return;
      // Cycle: toggle -> first link ... last link -> toggle. The toggle stays in
      // the loop because it is the only way to close the panel by keyboard.
      const f = focusables();
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      const on = document.activeElement;
      if (on === navToggle)            { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
      else if (e.shiftKey && on === first) { e.preventDefault(); navToggle.focus(); }
      else if (!e.shiftKey && on === last) { e.preventDefault(); navToggle.focus(); }
    });
    // Leaving mobile width with the menu open would trap scroll behind a hidden panel.
    const wide = window.matchMedia('(min-width: 769px)');
    const onWide = () => { if (wide.matches && !navMenu.hidden) setMenu(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide);
  }

  /* ----- Current section marker in the nav ----- */
  const navLinks = Array.from(document.querySelectorAll(
    '.nav__links a[href^="#"], [data-nav-menu] a[href^="#"]'
  ));
  if (navLinks.length && 'IntersectionObserver' in window) {
    const bySection = new Map();
    navLinks.forEach((a) => {
      const el = document.querySelector(a.getAttribute('href'));
      if (!el) return;
      // Desktop nav and mobile menu both link to the same section — mark both.
      if (!bySection.has(el)) bySection.set(el, []);
      bySection.get(el).push(a);
    });
    let current = null;
    const mark = (group) => {
      if (current === group) return;
      navLinks.forEach((l) => l.removeAttribute('aria-current'));
      if (group) group.forEach((l) => l.setAttribute('aria-current', 'true'));
      current = group;
    };
    const visible = new Set();
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) visible.add(en.target);
        else visible.delete(en.target);
      });
      // Topmost visible section wins, so the marker never lags behind the reader.
      let top = null;
      visible.forEach((el) => {
        if (!top || el.getBoundingClientRect().top < top.getBoundingClientRect().top) top = el;
      });
      mark(top ? bySection.get(top) : null);
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });
    bySection.forEach((_a, el) => spy.observe(el));
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
    initKindWords();
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

  /* ----- Kind words — vertical scroll drives horizontal pan -----
     Progressive enhancement only. Without this the rail is a plain
     horizontal scroll container, which is the fallback on mobile,
     with reduced motion, on short viewports, and with JS disabled. */
  function initKindWords() {
    const pin = document.querySelector('[data-kw-pin]');
    if (!pin) return;
    const stage = pin.querySelector('[data-kw-stage]');
    const rail  = pin.querySelector('[data-kw-rail]');
    const prog  = pin.querySelector('[data-kw-prog]');
    if (!stage || !rail) return;

    const wide = window.matchMedia('(min-width: 861px)');
    let pan = 0;
    let pinned = false;
    let ticking = false;

    const navH = () =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 68;

    const eligible = () => !reduceMotion && wide.matches;

    const unpin = () => {
      pinned = false;
      pin.classList.remove('kw--pinned');
      pin.style.height = '';
      rail.style.transform = '';
      if (prog) prog.style.setProperty('--kw-p', '0');
    };

    const measure = () => {
      if (!eligible()) { unpin(); return; }

      // Measure the natural (unpinned) overflow first.
      pin.classList.remove('kw--pinned');
      pin.style.height = '';
      const overflow = rail.scrollWidth - rail.clientWidth;

      // Pinned stage is exactly one viewport tall, so it always fits. The only
      // question is whether the cards themselves fit inside it — if the window
      // is too short for a card, keep the native scroll rail instead.
      const avail = window.innerHeight - navH();
      const roomy = rail.offsetHeight + 48 <= avail;

      // Nothing to pan through — leave it as a normal rail.
      if (overflow < 48 || !roomy) { unpin(); return; }

      pin.classList.add('kw--pinned');
      pinned = true;
      pan = overflow;
      // Spacer height = one pinned viewport + the horizontal distance to travel.
      pin.style.height = (avail + pan) + 'px';
      update();
    };

    const update = () => {
      if (!pinned) return;
      const travel = pin.offsetHeight - stage.offsetHeight;
      if (travel <= 0) return;
      const p = Math.min(Math.max((navH() - pin.getBoundingClientRect().top) / travel, 0), 1);
      rail.style.transform = 'translate3d(' + (-p * pan).toFixed(2) + 'px,0,0)';
      if (prog) prog.style.setProperty('--kw-p', p.toFixed(4));
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    if (wide.addEventListener) wide.addEventListener('change', measure);

    // Re-measure when card heights settle (webfonts, images), but guard against
    // the feedback loop: measure() resizes the rail, which would re-fire this.
    if ('ResizeObserver' in window) {
      let lastH = 0;
      const ro = new ResizeObserver(() => {
        const h = Math.round(stage.offsetHeight);
        if (h === lastH) return;
        lastH = h;
        requestAnimationFrame(measure);
      });
      ro.observe(rail.firstElementChild || rail);
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
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
