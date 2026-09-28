/* ==========================================================================
   Investors Planet Realty — site script
   One file for the whole site. Every block checks for the elements it needs,
   so the same file can be loaded on every page.

   Contents
     1.  Smooth scroll + header    Lenis, sticky/hiding header, anchor links
     2.  Intro + scroll animations hero, [data-reveal], parallax, counters
     3.  Home: hero search tabs
     4.  Home: offering panels
     5.  Home: featured projects filter
     6.  Home: developer logo wall
     7.  Home: more projects slider (Swiper)
     8.  About: story gates + manifesto
     9.  About: FAQ accordion
     10. Offerings: skyline, gates, city filter
     11. Projects listing: filters, sorting, pagination
     12. Careers: job filter + application form
     13. Enquiry form (contact, project sidebar, project popup)
     14. Project: section tabs, floor plans, lightbox, enquiry popup

   Libraries expected on the page: GSAP + ScrollTrigger, Lenis, Bootstrap
   (offcanvas menu) and, on the home page only, Swiper.
   ========================================================================== */

/* ==========================================================================
   1. Smooth scroll (Lenis on GSAP's ticker) + header behaviour
   ========================================================================== */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const lenis = new Lenis({ duration: 1.15, smoothWheel: !reduceMotion });

(function () {
  gsap.registerPlugin(ScrollTrigger);
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  window.__lenis = lenis; // used by the sections below and by page links

  // "/index.html" and "/" are the same page.
  const samePage = (path) => path.replace(/index\.html$/, '') === location.pathname.replace(/index\.html$/, '');

  // Smooth-scroll any link that points at a section on the current page.
  document.querySelectorAll('a[href*="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const url = new URL(a.href, location.href);
      if (!url.hash || !samePage(url.pathname)) return;
      const target = document.querySelector(url.hash);
      if (!target) return;
      e.preventDefault();
      // Let Bootstrap close the offcanvas first so Lenis isn't locked.
      // Leave room for a sticky section bar if the page has one (project pages).
      const tabs = document.getElementById('sectionTabs');
      const offset = url.hash === '#home' ? 0 : -((tabs ? tabs.offsetHeight : 0) + 20);
      setTimeout(() => lenis.scrollTo(target, { offset }), 10);
    });
  });

  // Header: solid after the hero, hidden while scrolling down.
  const header = document.getElementById('siteHeader');
  let lastY = 0;
  lenis.on('scroll', ({ scroll }) => {
    if (!header) return;
    header.classList.toggle('is-scrolled', scroll > 60);
    // Headers marked data-sticky (e.g. the project page nav) stay visible.
    if (!('sticky' in header.dataset)) header.classList.toggle('is-hidden', scroll > 400 && scroll > lastY);
    lastY = scroll;
  });
})();

/* ==========================================================================
   2. Intro (header + hero) and scroll animations
   ========================================================================== */
(function () {
  function intro() {
    // The header is deliberately not animated. It carries a CSS transition on transform
    // for the scroll hide/show, so animating transform here as well made the two fight:
    // the bar flashed in, jumped off-screen and crawled back over ~1.8s.
    // Everything below starts from a state set in CSS, so nothing is painted in its
    // final position first and then moved.
    gsap.timeline({ defaults: { ease: 'expo.out' } })
      // The resting state is set in CSS (translateY(110%)), so this tween must drive the
      // whole translate — both y and yPercent — or GSAP reads the CSS offset as its own
      // starting y and the heading never comes back up. No clearProps either: the final
      // inline transform has to stay, otherwise the CSS rule puts it back down.
      .fromTo('[data-hero-title] .line > span',
        { y: 0, yPercent: 110 },
        { y: 0, yPercent: 0, duration: 1.3, stagger: 0.12, delay: 0.1 })
      .fromTo('[data-hero]', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.1 }, '<0.3');
  }

  function scrollAnimations() {
    // Generic reveal.
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      gsap.fromTo(el, { autoAlpha: 0, y: 50 }, {
        autoAlpha: 1, y: 0, duration: 1.2, ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    // Image parallax inside its frame.
    gsap.utils.toArray('[data-parallax]').forEach((img) => {
      gsap.fromTo(img, { yPercent: -8 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentElement, scrub: true } });
    });

    // Counters.
    gsap.utils.toArray('[data-count]').forEach((el) => {
      const end = Number(el.dataset.count);
      const obj = { v: 0 };
      gsap.to(obj, {
        v: end, duration: 2.2, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString('en-IN')),
      });
    });
  }

  function start() {
    if (reduceMotion) {
      gsap.set('[data-reveal], [data-hero]', { autoAlpha: 1 });
      gsap.set('[data-hero-title] .line > span', { y: 0, yPercent: 0 });
      return;
    }
    intro();
    scrollAnimations();
  }

  // This file is deferred, so the DOM is ready: start straight away rather than
  // waiting for window.load, which would leave the hero blank on a slow connection.
  start();

  // Recalculate trigger positions once web fonts and images settle.
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
})();

/* ==========================================================================
   3. Home: sliding pill for the hero search tabs
   ========================================================================== */
(function () {
  const tabs = document.querySelectorAll('.search__tab');
  const pill = document.querySelector('.search__tab-pill');
  if (!tabs.length) return;
  const move = (el) => {
    if (!pill) return;
    pill.style.width = `${el.offsetWidth}px`;
    pill.style.transform = `translateX(${el.offsetLeft - 5}px)`;
  };
  tabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        t.classList.toggle('is-active', t === tab);
        t.setAttribute('aria-selected', String(t === tab));
      });
      move(tab);
    }),
  );
  const init = () => { const a = document.querySelector('.search__tab.is-active'); if (a) move(a); };
  init();
  window.addEventListener('resize', init);
  if (document.fonts) document.fonts.ready.then(init);
})();

/* ==========================================================================
   4. Home: offering panels — widen the hovered panel (desktop)
   ========================================================================== */
(function () {
  const panels = document.querySelectorAll('.offer');
  const mq = window.matchMedia('(min-width: 992px)');
  panels.forEach((p) =>
    p.addEventListener('mouseenter', () => {
      if (!mq.matches) return;
      panels.forEach((x) => x.classList.toggle('is-open', x === p));
    }),
  );
})();

/* ==========================================================================
   5. Home: featured projects filter with a sliding underline
   ========================================================================== */
(function () {
  const buttons = document.querySelectorAll('.filters__btn');
  const items = document.querySelectorAll('.featured__item');
  const bar = document.querySelector('.filters__bar');
  if (!buttons.length) return;

  const moveBar = (el) => {
    if (!bar || !el) return;
    bar.style.width = `${el.offsetWidth}px`;
    bar.style.transform = `translateX(${el.offsetLeft}px)`;
  };
  const initBar = () => moveBar(document.querySelector('.filters__btn.is-active'));
  initBar();
  window.addEventListener('resize', initBar);
  if (document.fonts) document.fonts.ready.then(initBar);

  buttons.forEach((btn) =>
    btn.addEventListener('click', () => {
      const key = btn.dataset.filter;
      buttons.forEach((b) => {
        b.classList.toggle('is-active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });
      moveBar(btn);
      items.forEach((it) => it.classList.toggle('is-hidden', key !== 'all' && it.dataset.type !== key));
      const visible = [...items].filter((it) => !it.classList.contains('is-hidden'));
      gsap.fromTo(
        visible.map((v) => v.firstElementChild),
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out', onComplete: () => ScrollTrigger.refresh() },
      );
    }),
  );
})();

/* ==========================================================================
   6. Home: developer logo wall
   One cell at a time: the current logo dissolves out (blur + fade + drift)
   while a logo from the spare pool dissolves in, with a gold light sweep.
   ========================================================================== */
(function () {
  const wall = document.querySelector('.logo-wall');
  const poolEl = document.getElementById('devPool');
  if (!wall || !poolEl || reduceMotion) return;

  const pool = JSON.parse(poolEl.textContent || '[]');
  const cells = [...wall.querySelectorAll('.logo-cell')];
  const shown = new Set(cells.map((c) => c.querySelector('img').getAttribute('src')));
  const spares = pool.filter((p) => !shown.has(p.src));

  // Preload spares so the dissolve never shows a half-loaded image.
  spares.forEach((s) => { const i = new Image(); i.src = s.src; });

  // Visit cells in a shuffled order so the "blink" feels organic, not a sweep.
  let order = [];
  const nextCell = () => {
    if (!order.length) order = cells.map((_, i) => i).sort(() => Math.random() - 0.5);
    return cells[order.pop()];
  };

  const swap = () => {
    // pick the next cell that is visible, idle and not being hovered
    let cell;
    for (let tries = 0; tries < cells.length && !cell; tries++) {
      const c = nextCell();
      if (c.offsetParent !== null && !c.classList.contains('is-swapping') && !c.matches(':hover')) cell = c;
    }
    if (!cell || !spares.length) return;

    // tidy any leftovers so a cell only ever holds one logo
    const imgs = cell.querySelectorAll('.logo-cell__img');
    imgs.forEach((img, i) => { if (i < imgs.length - 1) img.remove(); });
    const oldImg = imgs[imgs.length - 1];

    const incoming = spares.shift();
    const outgoing = { name: oldImg.alt, src: oldImg.getAttribute('src'), scale: Number(oldImg.style.getPropertyValue('--s')) || 1 };

    const newImg = oldImg.cloneNode();
    newImg.src = incoming.src;
    newImg.alt = incoming.name;
    newImg.title = incoming.name;
    newImg.style.cssText = `--s:${incoming.scale}`;
    cell.appendChild(newImg);
    cell.classList.add('is-swapping');

    const done = () => {
      oldImg.remove();
      newImg.style.cssText = `--s:${incoming.scale}`;
      cell.classList.remove('is-swapping');
      spares.push(outgoing); // only return the old logo once it has left the screen
    };

    gsap.timeline({ onComplete: done })
      .to(oldImg, { opacity: 0, filter: 'blur(8px) grayscale(0.15)', scale: 0.88, y: -8, duration: 0.9, ease: 'power2.inOut' })
      .fromTo(newImg,
        { opacity: 0, filter: 'blur(10px) grayscale(0.15)', scale: 1.1, y: 8 },
        { opacity: 1, filter: 'blur(0px) grayscale(0.15)', scale: 1, y: 0, duration: 1.1, ease: 'power3.out' },
        0.35)
      .fromTo(cell.querySelector('.logo-cell__shine'),
        { xPercent: 0, opacity: 0 },
        { xPercent: 420, opacity: 1, duration: 1.2, ease: 'power2.inOut' },
        0.1);
  };

  // Run on GSAP's clock (not setInterval) so it pauses with the animations
  // when the tab is hidden, instead of piling up swaps.
  let loop;
  const tick = () => { swap(); loop = gsap.delayedCall(1.4, tick); };
  const start = () => { if (!loop) loop = gsap.delayedCall(0.6, tick); };
  const stop = () => { if (loop) loop.kill(); loop = undefined; };

  let inView = false;
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; inView ? start() : stop(); }, { threshold: 0.25 }).observe(wall);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : inView && start()));
})();

/* ==========================================================================
   7. Home: "more projects" slider (Swiper)
   ========================================================================== */
(function () {
  const root = document.querySelector('.more__slider');
  if (!root || typeof Swiper === 'undefined') return;
  const prev = document.querySelector('.more__arrow--prev');
  const next = document.querySelector('.more__arrow--next');

  const update = (s) => {
    if (prev) prev.disabled = s.isBeginning;
    if (next) next.disabled = s.isEnd;
  };

  // swiper-bundle already includes the Keyboard, Mousewheel and A11y modules.
  const slider = new Swiper(root, {
    slidesPerView: 'auto',
    spaceBetween: 24,
    speed: 900,
    grabCursor: true,
    watchOverflow: true,
    keyboard: { enabled: true, onlyInViewport: true },
    mousewheel: { forceToAxis: true },
    breakpoints: { 0: { spaceBetween: 16 }, 768: { spaceBetween: 24 } },
    on: { init: update, slideChange: update, progress: update, resize: update },
  });

  if (prev) prev.addEventListener('click', () => slider.slidePrev());
  if (next) next.addEventListener('click', () => slider.slideNext());
})();

/* ==========================================================================
   8. About: story gates and the manifesto
   ========================================================================== */
(function () {
  // Gates: start closed in the middle, slide apart to the sides as the section scrolls in.
  const gate = document.querySelector('.gate');
  if (gate && !reduceMotion) {
    const open = () => (window.innerWidth < 768 ? 62 : 46); // % of each door's width
    gsap.timeline({ scrollTrigger: { trigger: '.story', start: 'top 95%', end: 'top 5%', scrub: 0.8, invalidateOnRefresh: true } })
      .fromTo('.gate__door--l', { xPercent: 0 }, { xPercent: () => -open(), ease: 'power2.inOut' }, 0)
      .fromTo('.gate__door--r', { xPercent: 0 }, { xPercent: () => open(), ease: 'power2.inOut' }, 0);
  }

  // Words brighten one by one and image pills pop in as the manifesto scrolls through the viewport.
  const text = document.querySelector('.manifesto__text');
  if (!text) return;
  if (reduceMotion) {
    gsap.set('.mw, .mpill', { opacity: 1, scale: 1 });
    return;
  }
  const tl = gsap.timeline({ scrollTrigger: { trigger: text, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 } });
  text.querySelectorAll('.mw, .mpill').forEach((el, i) => {
    const pill = el.classList.contains('mpill');
    tl.to(el, pill ? { opacity: 1, scale: 1, duration: 1.5, ease: 'back.out(2)' } : { opacity: 1, duration: 1 }, i * 0.5);
  });
})();

/* ==========================================================================
   9. About: FAQ accordion — one open at a time
   ========================================================================== */
(function () {
  const items = document.querySelectorAll('.acc__item');
  items.forEach((item) => {
    const btn = item.querySelector('.acc__btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      items.forEach((it) => {
        const on = it === item && open;
        it.classList.toggle('is-open', on);
        const b = it.querySelector('.acc__btn');
        if (b) b.setAttribute('aria-expanded', String(on));
      });
    });
  });
})();

/* ==========================================================================
   10. Offering pages: rising skyline, gates, city filter
   ========================================================================== */
(function () {
  // "How it works" buildings rise into place as the section scrolls in.
  if (document.querySelector('.process__city') && !reduceMotion) {
    gsap.fromTo('.process__bld', { yPercent: 35, opacity: 0 }, {
      yPercent: 0, opacity: 0.85, ease: 'power2.out', stagger: 0.1,
      scrollTrigger: { trigger: '.process', start: 'top 85%', end: 'bottom 85%', scrub: 0.8 },
    });
  }

  // Gates: start closed in the middle, slide apart to the sides as the section scrolls in.
  if (document.querySelector('.wgate') && !reduceMotion) {
    const open = () => (window.innerWidth < 768 ? 62 : 46); // % of each door's width
    gsap.timeline({ scrollTrigger: { trigger: '.why-cat', start: 'top 95%', end: 'top 5%', scrub: 0.8, invalidateOnRefresh: true } })
      .fromTo('.wgate__door--l', { xPercent: 0 }, { xPercent: () => -open(), ease: 'power2.inOut' }, 0)
      .fromTo('.wgate__door--r', { xPercent: 0 }, { xPercent: () => open(), ease: 'power2.inOut' }, 0);
  }

  // City filter for the project grid.
  const btns = [...document.querySelectorAll('.cities__btn')];
  const items = [...document.querySelectorAll('.cprojects__item')];
  btns.forEach((b) =>
    b.addEventListener('click', () => {
      btns.forEach((x) => x.classList.toggle('is-active', x === b));
      items.forEach((it) => {
        it.hidden = !!b.dataset.city && it.dataset.city !== b.dataset.city;
        if (!it.hidden) it.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'ease-out' });
      });
    }),
  );

  // "Talk to an expert" scrolls to the footer call-back form.
  const expert = document.querySelector('[data-cat-enquire]');
  if (expert) {
    expert.addEventListener('click', () => {
      const t = document.getElementById('contact');
      if (t) (window.__lenis ? window.__lenis.scrollTo(t, { offset: -20 }) : t.scrollIntoView({ behavior: 'smooth' }));
    });
  }
})();

/* ==========================================================================
   11. Projects listing: type tabs, search, filters, sorting, pagination
   State lives in the URL (?type=&city=&status=&budget=&sort=&page=).
   ========================================================================== */
(function () {
  const PER_PAGE = 6;
  const form = document.getElementById('filters');
  const grid = document.getElementById('projectGrid');
  if (!form || !grid) return;
  const cards = [...grid.querySelectorAll('.pc')];
  const tabs = [...document.querySelectorAll('.ftabs__btn')];
  const countEl = document.getElementById('resultCount');
  const chipsEl = document.getElementById('activeChips');
  const emptyEl = document.getElementById('emptyState');
  const pager = document.getElementById('pager');
  const listing = document.getElementById('listing');

  const field = (n) => form.elements.namedItem(n);
  const labels = { city: 'Location', status: 'Status', budget: 'Budget' };

  // ----- state <-> URL -----
  const read = () => {
    const u = new URLSearchParams(location.search);
    return {
      type: u.get('type') || 'all',
      q: u.get('q') || '',
      city: u.get('city') || '',
      status: u.get('status') || '',
      budget: u.get('budget') || '',
      sort: u.get('sort') || '',
      page: Math.max(1, Number(u.get('page')) || 1),
    };
  };
  let state = read();

  const write = () => {
    const u = new URLSearchParams();
    if (state.type !== 'all') u.set('type', state.type);
    ['q', 'city', 'status', 'budget', 'sort'].forEach((k) => state[k] && u.set(k, state[k]));
    if (state.page > 1) u.set('page', String(state.page));
    const qs = u.toString();
    try { history.replaceState(null, '', qs ? `?${qs}` : location.pathname); } catch (err) {}
  };

  const syncControls = () => {
    tabs.forEach((t) => {
      const on = t.dataset.type === state.type;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
    });
    ['q', 'city', 'status', 'budget', 'sort'].forEach((k) => {
      const el = field(k);
      el.value = state[k];
      const wrap = el.closest('.fsel');
      if (wrap) wrap.classList.toggle('is-set', !!state[k] && k !== 'sort');
    });
  };

  // ----- filtering -----
  const matches = (c) => {
    const price = Number(c.dataset.price);
    if (state.type !== 'all' && c.dataset.type !== state.type) return false;
    if (state.city && c.dataset.city !== state.city) return false;
    if (state.status && c.dataset.status !== state.status) return false;
    if (state.budget) {
      const opt = field('budget').querySelector(`option[value="${state.budget}"]`);
      if (opt && !(price >= Number(opt.dataset.min) && price < Number(opt.dataset.max))) return false;
    }
    if (state.q) {
      const words = state.q.toLowerCase().trim().split(/\s+/);
      if (!words.every((w) => c.dataset.name.includes(w))) return false;
    }
    return true;
  };

  const sorted = (list) => {
    const by = {
      'price-asc': (a, b) => Number(a.dataset.price) - Number(b.dataset.price),
      'price-desc': (a, b) => Number(b.dataset.price) - Number(a.dataset.price),
      name: (a, b) => a.querySelector('.pc__name').textContent.localeCompare(b.querySelector('.pc__name').textContent),
    }[state.sort] || ((a, b) => Number(a.dataset.index) - Number(b.dataset.index));
    return [...list].sort(by);
  };

  // ----- rendering -----
  const renderChips = () => {
    chipsEl.innerHTML = '';
    ['city', 'status', 'budget'].forEach((k) => {
      if (!state[k]) return;
      const sel = field(k);
      const text = (sel.selectedOptions[0] && sel.selectedOptions[0].textContent) || state[k];
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.innerHTML = `${labels[k]}: ${text} <button type="button" aria-label="Remove ${labels[k]} filter">×</button>`;
      chip.querySelector('button').addEventListener('click', () => update({ [k]: '' }));
      chipsEl.appendChild(chip);
    });
    if (state.q) {
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.textContent = `“${state.q}” `;
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = '×';
      b.setAttribute('aria-label', 'Clear search');
      b.addEventListener('click', () => update({ q: '' }));
      chip.appendChild(b);
      chipsEl.appendChild(chip);
    }
  };

  const pageButton = (label, page, opts = {}) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'pager__btn' + (opts.current ? ' is-current' : '');
    b.innerHTML = opts.html || label;
    if (opts.aria) b.setAttribute('aria-label', opts.aria);
    if (opts.current) b.setAttribute('aria-current', 'page');
    b.disabled = !!opts.disabled;
    b.addEventListener('click', () => { update({ page }, true); });
    return b;
  };

  const renderPager = (pages) => {
    pager.innerHTML = '';
    if (pages <= 1) return;
    const p = state.page;
    const arrow = (d) => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
    pager.appendChild(pageButton('', p - 1, { disabled: p === 1, aria: 'Previous page', html: `${arrow('M15 6l-6 6 6 6')}<span class="pager__label">Prev</span>` }));
    // 1 … p-1 p p+1 … last
    const nums = [...new Set([1, p - 1, p, p + 1, pages])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
    nums.forEach((n, i) => {
      if (i && n - nums[i - 1] > 1) {
        const gap = document.createElement('span');
        gap.className = 'pager__gap';
        gap.textContent = '…';
        pager.appendChild(gap);
      }
      pager.appendChild(pageButton(String(n), n, { current: n === p, aria: `Page ${n}` }));
    });
    pager.appendChild(pageButton('', p + 1, { disabled: p === pages, aria: 'Next page', html: `<span class="pager__label">Next</span>${arrow('M9 6l6 6-6 6')}` }));
  };

  const render = (animate = true) => {
    const list = sorted(cards.filter(matches));
    const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
    state.page = Math.min(state.page, pages);
    const start = (state.page - 1) * PER_PAGE;
    const visible = list.slice(start, start + PER_PAGE);

    cards.forEach((c) => (c.hidden = true));
    visible.forEach((c) => { c.hidden = false; grid.appendChild(c); }); // re-append keeps sort order

    emptyEl.hidden = list.length > 0;
    pager.hidden = list.length === 0;
    countEl.innerHTML = list.length
      ? `Showing <strong>${start + 1}–${start + visible.length}</strong> of <strong>${list.length}</strong> ${list.length === 1 ? 'project' : 'projects'}`
      : 'No projects found';

    renderChips();
    renderPager(pages);
    syncControls();
    write();

    if (animate && visible.length) {
      gsap.fromTo(visible, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.06, ease: 'power3.out', clearProps: 'transform' });
    }
  };

  const update = (patch, scroll = false) => {
    state = { ...state, page: 1, ...patch };
    render();
    if (scroll) {
      window.__lenis ? window.__lenis.scrollTo(listing, { offset: -110 }) : listing.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // ----- events -----
  tabs.forEach((t) => t.addEventListener('click', () => update({ type: t.dataset.type })));
  ['city', 'status', 'budget', 'sort'].forEach((k) => field(k).addEventListener('change', (e) => update({ [k]: e.target.value })));
  let t;
  field('q').addEventListener('input', (e) => {
    window.clearTimeout(t);
    t = window.setTimeout(() => update({ q: e.target.value.trim() }), 250);
  });
  const reset = () => update({ type: 'all', q: '', city: '', status: '', budget: '', sort: '' });
  document.getElementById('resetFilters').addEventListener('click', reset);
  document.querySelector('[data-reset]').addEventListener('click', reset);

  render(false);
})();

/* ==========================================================================
   12. Careers: department filter and the application form
   ========================================================================== */
(function () {
  // Department filter
  const filters = [...document.querySelectorAll('.jobs__filter')];
  const jobEls = [...document.querySelectorAll('.job')];
  filters.forEach((f) =>
    f.addEventListener('click', () => {
      filters.forEach((x) => { x.classList.toggle('is-active', x === f); x.setAttribute('aria-selected', String(x === f)); });
      jobEls.forEach((j) => { j.hidden = f.dataset.dept !== 'All' && j.dataset.dept !== f.dataset.dept; if (j.hidden) j.open = false; });
    }),
  );

  // "Apply for this role" pre-selects the role and scrolls to the form
  const form = document.getElementById('applyForm');
  if (!form) return;
  document.querySelectorAll('[data-apply]').forEach((b) =>
    b.addEventListener('click', () => {
      form.elements.namedItem('role').value = b.dataset.apply;
      const target = document.getElementById('apply');
      window.__lenis ? window.__lenis.scrollTo(target, { offset: -20 }) : target.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => form.elements.namedItem('name').focus({ preventScroll: true }), 900);
    }),
  );

  // Application form
  const cv = form.elements.namedItem('cv');
  const fileLabel = form.querySelector('[data-file]');
  const MAX = 5 * 1024 * 1024;
  const okCv = () => !!(cv.files && cv.files[0]) && cv.files[0].size <= MAX && /\.(pdf|docx?)$/i.test(cv.files[0].name);
  cv.addEventListener('change', () => {
    fileLabel.textContent = (cv.files && cv.files[0] && cv.files[0].name) || 'Click to choose a file';
    cv.closest('.aform__f').classList.toggle('is-invalid', !okCv());
  });
  const phone = form.elements.namedItem('phone');
  phone.addEventListener('input', () => (phone.value = phone.value.replace(/\D/g, '').slice(0, 10)));

  const check = (el) => {
    const bad = el === cv ? !okCv() : !el.checkValidity() || (el.name === 'name' && el.value.trim().length < 2);
    el.closest('.aform__f').classList.toggle('is-invalid', bad);
    return !bad;
  };
  ['name', 'phone', 'email'].forEach((n) => form.elements.namedItem(n).addEventListener('blur', (e) => check(e.target)));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fields = ['name', 'phone', 'email'].map((n) => form.elements.namedItem(n)).concat(cv);
    if (!fields.map(check).every(Boolean)) {
      const invalid = form.querySelector('.is-invalid input');
      if (invalid) invalid.focus();
      return;
    }
    form.classList.add('is-loading');
    // Placeholder: send FormData(form) to your HR inbox / ATS here.
    console.info('Application', Object.fromEntries(new FormData(form)));
    await new Promise((r) => setTimeout(r, 900));
    form.classList.remove('is-loading');
    form.classList.add('is-done');
  });
})();

/* ==========================================================================
   13. Enquiry form — contact page, project sidebar and project popup
   ========================================================================== */
(function () {
  // Placeholder for your lead endpoint (CRM, email service, Google Sheet…).
  async function submitLead(data) {
    console.info('Lead captured', data);
    await new Promise((r) => setTimeout(r, 900));
  }

  document.querySelectorAll('form.eform').forEach((form) => {
    if (form.dataset.bound) return;
    form.dataset.bound = '1';

    const validate = (input) => {
      const field = input.closest('.eform__field');
      const bad = !input.checkValidity() || (input.name === 'name' && input.value.trim().length < 2);
      if (field) field.classList.toggle('is-invalid', bad);
      return !bad;
    };

    form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"]').forEach((i) => {
      i.addEventListener('blur', () => validate(i));
      i.addEventListener('input', () => i.closest('.is-invalid') && validate(i));
    });
    const phone = form.querySelector('input[name="phone"]');
    if (phone) {
      phone.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const inputs = [...form.querySelectorAll('input[name="name"], input[name="phone"], input[name="email"]')];
      const ok = inputs.map(validate).every(Boolean);
      const consent = form.querySelector('input[name="consent"]');
      if (!ok || !consent.checked) {
        const invalid = form.querySelector('.is-invalid input');
        if (invalid) invalid.focus();
        if (!consent.checked) consent.focus();
        return;
      }
      const data = Object.fromEntries(new FormData(form));
      form.classList.add('is-loading');
      try {
        await submitLead(data);
        form.querySelector('[data-name]').textContent = data.name.split(' ')[0];
        form.classList.add('is-done');
        try { sessionStorage.setItem('enquired', '1'); } catch (err) {}
      } finally {
        form.classList.remove('is-loading');
      }
    });
  });
})();

/* ==========================================================================
   14. Project pages: sticky section tabs, floor-plan tabs, gallery lightbox
       and the enquiry popup
   ========================================================================== */

/* ---------- Sticky section tabs + scroll-spy ---------- */
(function () {
  const bar = document.getElementById('sectionTabs');
  if (!bar) return;
  const nav = bar.querySelector('.stabs__nav');
  const underline = bar.querySelector('.stabs__bar');
  const links = [...bar.querySelectorAll('.stabs__link')];
  const header = document.getElementById('siteHeader');

  const place = (a) => {
    underline.style.width = `${a.offsetWidth - 24}px`;
    underline.style.transform = `translateX(${a.offsetLeft + 12}px)`;
  };
  const activate = (a) => {
    if (a.classList.contains('is-active') && underline.style.width) return;
    links.forEach((l) => l.classList.toggle('is-active', l === a));
    place(a);
    nav.scrollTo({ left: a.offsetLeft - 40, behavior: 'smooth' }); // keep active tab visible on phones
  };
  const active = () => links.find((l) => l.classList.contains('is-active'));
  place(links[0]);
  window.addEventListener('resize', () => place(active()));
  if (document.fonts) document.fonts.ready.then(() => place(active()));

  // Scroll-spy
  const targets = links.map((l) => document.querySelector(l.getAttribute('href')));
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) activate(links[targets.indexOf(e.target)]); }),
    { rootMargin: '-35% 0px -60% 0px' },
  );
  targets.forEach((t) => t && io.observe(t));

  // "Stuck" styling + step down when the main navbar is showing.
  const sentinel = document.createElement('div');
  bar.before(sentinel);
  new IntersectionObserver(([e]) => bar.classList.toggle('is-stuck', !e.isIntersecting)).observe(sentinel);
  if (header) {
    const sync = () => bar.classList.toggle('is-pushed', header.classList.contains('is-scrolled') && !header.classList.contains('is-hidden'));
    new MutationObserver(sync).observe(header, { attributes: true, attributeFilter: ['class'] });
  }
})();

/* ---------- Floor-plan tabs ---------- */
(function () {
  document.querySelectorAll('.plan__tab').forEach((tab, _, all) =>
    tab.addEventListener('click', () =>
      all.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        const panel = document.getElementById(`plan-${t.dataset.plan}`);
        panel.hidden = !on;
        if (on) panel.animate([{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.22,1,.36,1)' });
      }),
    ),
  );
})();

/* ---------- Gallery lightbox ---------- */
(function () {
  const dlg = document.getElementById('lightbox');
  if (!dlg) return;
  const img = dlg.querySelector('.lb__img');
  const counter = dlg.querySelector('.lb__counter');
  const srcs = JSON.parse(document.getElementById('galleryData').textContent || '[]');
  let i = 0;
  const show = (n) => {
    i = (n + srcs.length) % srcs.length;
    img.src = srcs[i];
    counter.textContent = `${i + 1} / ${srcs.length}`;
    img.animate([{ opacity: 0, transform: 'scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: 400, easing: 'ease-out' });
  };
  const open = (n) => { show(n); dlg.showModal(); if (window.__lenis) window.__lenis.stop(); };

  document.querySelectorAll('.gs__item').forEach((b) => b.addEventListener('click', () => open(Number(b.dataset.index))));
  document.querySelectorAll('[data-open-gallery]').forEach((b) => b.addEventListener('click', () => open(0)));
  dlg.addEventListener('close', () => { if (window.__lenis) window.__lenis.start(); });
  dlg.querySelector('.lb__close').addEventListener('click', () => dlg.close());
  dlg.querySelector('.lb__nav--prev').addEventListener('click', () => show(i - 1));
  dlg.querySelector('.lb__nav--next').addEventListener('click', () => show(i + 1));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(i - 1);
    if (e.key === 'ArrowRight') show(i + 1);
  });
})();

/* ---------- Enquiry popup ---------- */
// Any element with [data-enquire] opens the popup; its value becomes the heading & intent.
(function () {
  const modal = document.getElementById('enquiryModal');
  if (!modal) return;
  const title = document.getElementById('emodalTitle');
  const form = document.getElementById('modalForm');

  const open = (intent = 'Enquire about this project') => {
    if (modal.open) return;
    title.textContent = intent;
    form.elements.namedItem('intent').value = intent;
    modal.showModal();
    if (window.__lenis) window.__lenis.stop();
  };
  const close = () => modal.close();

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-enquire]');
    if (trigger) { e.preventDefault(); open(trigger.dataset.enquire || undefined); }
  });
  modal.querySelector('.emodal__close').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
  modal.addEventListener('close', () => { if (window.__lenis) window.__lenis.start(); });

  // Auto-popup 3 seconds after a project page opens (skipped once the visitor has enquired this session).
  const AUTO_POPUP_DELAY = 3000;
  const enquired = () => { try { return sessionStorage.getItem('enquired'); } catch (err) { return null; } };
  window.setTimeout(() => {
    const lb = document.getElementById('lightbox');
    const typing = document.activeElement && document.activeElement.closest('form');
    if (enquired() || (lb && lb.open) || typing || document.hidden) return;
    open('Get exclusive launch offers');
  }, AUTO_POPUP_DELAY);
})();
