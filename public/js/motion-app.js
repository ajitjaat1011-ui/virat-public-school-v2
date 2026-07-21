/* ============================================================
   Virat Public School — reactive motion layer
   Balanced, app-like interactions with reduced-motion support.
   ============================================================ */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const REVEAL_SELECTOR = [
    '.home-hero', '.hero-stat', '.page-header', '.section-head',
    '.app-card', '.card', '.value-card', '.stat-app', '.quick-app a',
    '.album-card', '.notice-item', '.faculty-card', '.form-surface',
    '.auth-card', '.glass-card', '.stat-tile', '.quick-action',
    '.list-item', '.parent-card', '.inquiry-card', '.album-tile',
    '.exam-card', '.result-card', '.table-wrap'
  ].join(',');
  const REACTIVE_SELECTOR = [
    '.home-hero', '.hero-stat', '.stat-app', '.app-card', '.card',
    '.album-card', '.glass-card', '.stat-tile', '.quick-action', '.auth-card'
  ].join(',');

  const prepared = new WeakSet();
  const reactive = new WeakSet();
  const counted = new WeakSet();
  const celebrated = new WeakSet();
  let revealObserver;
  let countObserver;
  let mutationObserver;
  let scrollFrame = 0;
  let pointerFrame = 0;
  let lastScrollY = window.scrollY;

  function elementDelay(element) {
    if (!element.parentElement) return 0;
    const siblings = Array.from(element.parentElement.children).filter(node => node.matches?.(REVEAL_SELECTOR));
    const index = Math.max(0, siblings.indexOf(element));
    return Math.min(index, 5) * 55;
  }

  function prepareReveal(element) {
    if (prepared.has(element) || element.closest('[data-no-motion]')) return;
    prepared.add(element);
    element.classList.add('motion-reveal');
    element.style.setProperty('--motion-delay', `${elementDelay(element)}ms`);
    if (reduceMotion.matches) element.classList.add('is-visible');
    else revealObserver.observe(element);
  }

  function prepareReactive(element) {
    if (reactive.has(element) || element.closest('[data-no-motion]')) return;
    reactive.add(element);
    element.classList.add('motion-reactive');

    const glow = document.createElement('span');
    glow.className = 'motion-pointer-glow';
    glow.setAttribute('aria-hidden', 'true');
    element.appendChild(glow);

    if (!finePointer.matches || reduceMotion.matches) return;
    let frame = 0;
    let lastEvent;
    const update = () => {
      frame = 0;
      if (!lastEvent) return;
      const rect = element.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (lastEvent.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (lastEvent.clientY - rect.top) / rect.height));
      const rotateX = (0.5 - y) * 4.2;
      const rotateY = (x - 0.5) * 5.2;
      element.style.setProperty('--pointer-x', `${x * 100}%`);
      element.style.setProperty('--pointer-y', `${y * 100}%`);
      element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    };
    element.addEventListener('pointermove', event => {
      lastEvent = event;
      if (!frame) frame = requestAnimationFrame(update);
    });
    element.addEventListener('pointerenter', () => element.classList.add('is-reacting'));
    element.addEventListener('pointerleave', () => {
      lastEvent = null;
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      element.classList.remove('is-reacting');
      element.style.transform = '';
      element.style.removeProperty('--pointer-x');
      element.style.removeProperty('--pointer-y');
    });
  }

  function numericValue(element) {
    const text = element.textContent.trim();
    const match = text.match(/^(\d{1,6})([+%]?)$/);
    if (!match) return null;
    const value = Number(match[1]);
    if (!Number.isFinite(value) || value === 0) return null;
    return { value, suffix: match[2] || '' };
  }

  function prepareCount(element) {
    if (counted.has(element)) return;
    const number = numericValue(element);
    if (!number) return;
    counted.add(element);
    element.dataset.motionValue = String(number.value);
    element.dataset.motionSuffix = number.suffix;
    if (reduceMotion.matches) return;
    countObserver.observe(element);
  }

  function runCount(element) {
    if (element.dataset.motionCounted === 'true') return;
    element.dataset.motionCounted = 'true';
    const target = Number(element.dataset.motionValue || 0);
    const suffix = element.dataset.motionSuffix || '';
    const duration = Math.min(1250, 650 + target * 7);
    const start = performance.now();
    const render = now => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      const value = Math.round(target * eased);
      element.textContent = String(value) + suffix;
      if (progress < 1) requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  }

  function scan(root) {
    if (!(root instanceof Element || root instanceof Document)) return;
    if (root instanceof Element && root.matches(REVEAL_SELECTOR)) prepareReveal(root);
    root.querySelectorAll?.(REVEAL_SELECTOR).forEach(prepareReveal);

    if (root instanceof Element && root.matches(REACTIVE_SELECTOR)) prepareReactive(root);
    root.querySelectorAll?.(REACTIVE_SELECTOR).forEach(prepareReactive);

    const values = [];
    if (root instanceof Element && root.matches('.value, .stat-num')) values.push(root);
    root.querySelectorAll?.('.value, .stat-num').forEach(element => values.push(element));
    values.forEach(prepareCount);
  }

  function addRipple(event) {
    if (reduceMotion.matches) return;
    const target = event.target.closest('.btn, .quick-app a, .dock-item, .nav-item, .filter-btn');
    if (!target || target.matches(':disabled') || target.getAttribute('aria-disabled') === 'true') return;
    const rect = target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.8;
    const ripple = document.createElement('span');
    ripple.className = 'motion-ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
    ripple.setAttribute('aria-hidden', 'true');
    target.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }

  function celebrate(element) {
    if (reduceMotion.matches || celebrated.has(element)) return;
    celebrated.add(element);
    element.classList.add('motion-success-pop');
    for (let index = 0; index < 7; index++) {
      const spark = document.createElement('span');
      spark.className = 'motion-success-spark';
      spark.style.setProperty('--spark-angle', `${index * (360 / 7)}deg`);
      spark.style.setProperty('--spark-delay', `${index * 18}ms`);
      spark.setAttribute('aria-hidden', 'true');
      element.appendChild(spark);
      setTimeout(() => spark.remove(), 950);
    }
    setTimeout(() => element.classList.remove('motion-success-pop'), 800);
  }

  function checkSuccess(root) {
    if (!(root instanceof Element || root instanceof Document)) return;
    const elements = [];
    if (root instanceof Element && root.matches('.form-success.show, .form-status.show.success')) elements.push(root);
    root.querySelectorAll?.('.form-success.show, .form-status.show.success').forEach(element => elements.push(element));
    elements.forEach(celebrate);
  }

  function updateScrollUI() {
    scrollFrame = 0;
    const y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, y / max));
    document.documentElement.style.setProperty('--scroll-progress', String(progress));

    document.querySelectorAll('.app-topbar, .topbar').forEach(bar => bar.classList.toggle('is-scrolled', y > 18));
    if (y > 160 && y - lastScrollY > 7) document.body.classList.add('is-scrolling-down');
    else if (lastScrollY - y > 5 || y < 120) document.body.classList.remove('is-scrolling-down');
    lastScrollY = y;
  }

  function onScroll() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScrollUI);
  }

  function updateAmbientPointer(event) {
    if (!finePointer.matches || reduceMotion.matches) return;
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      document.documentElement.style.setProperty('--ambient-x', `${x * 16}px`);
      document.documentElement.style.setProperty('--ambient-y', `${y * 12}px`);
    });
  }

  function initObservers() {
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.08 });

    countObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        runCount(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.45 });
  }

  function init() {
    initObservers();
    document.documentElement.classList.add('motion-ready');

    const progress = document.createElement('div');
    progress.className = 'motion-scroll-progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);

    scan(document);
    checkSuccess(document);

    mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node instanceof Element) {
              scan(node);
              checkSuccess(node);
            } else if (node.parentElement) {
              prepareCount(node.parentElement);
            }
          });
        } else if (mutation.type === 'characterData' && mutation.target.parentElement) {
          prepareCount(mutation.target.parentElement);
        } else if (mutation.type === 'attributes' && mutation.target instanceof Element) {
          if (mutation.target.matches('.form-success.show, .form-status.show.success')) celebrate(mutation.target);
        }
      });
    });
    mutationObserver.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class'] });

    document.addEventListener('pointerdown', addRipple, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', updateAmbientPointer, { passive: true });
    reduceMotion.addEventListener?.('change', () => location.reload());

    updateScrollUI();
    requestAnimationFrame(() => document.body.classList.add('motion-page-entered'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
