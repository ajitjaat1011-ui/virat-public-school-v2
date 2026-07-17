/* ============================================================
   Virat Public School — Partial layout injector
   Calm, premium design. No bloom animation. No flower petals.
   ============================================================ */
(function () {
  'use strict';

  const TOP_BAR_HTML = `
    <div class="top-bar">
      <div class="container-wide">
        <span><a href="tel:+919000000000">+91 90000 00000</a></span>
        <span class="top-tag">RBSE Affiliated · Est. 2008</span>
      </div>
    </div>`;

  const HEADER_HTML = `
    <header class="site-header">
      <div class="container-wide">
        <div class="header-inner">
          <a href="index.html" class="brand" aria-label="Virat Public School, Virat Nagar Kotputli — home">
            <span class="brand-logo">V</span>
            <span class="brand-text">
              <span class="brand-name">Virat Public School</span>
              <span class="brand-sub">Virat Nagar · Kotputli</span>
            </span>
          </a>
          <nav class="primary-nav" aria-label="Primary">
            <a href="index.html" class="nav-link">Home</a>
            <a href="about.html" class="nav-link">About</a>
            <a href="admissions.html" class="nav-link">Admissions</a>
            <a href="gallery.html" class="nav-link">Gallery</a>
            <a href="notices.html" class="nav-link">Notices</a>
            <a href="contact.html" class="nav-link">Contact</a>
            <a href="parent/login.html" class="nav-link">Parents</a>
            <a href="admissions.html#inquiry" class="nav-cta">Apply</a>
          </nav>
          <button class="menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-menu">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
      <nav id="mobile-menu" class="mobile-menu" aria-label="Mobile">
        <a href="index.html">Home</a>
        <a href="about.html">About</a>
        <a href="admissions.html">Admissions</a>
        <a href="results.html">Results</a>
        <a href="gallery.html">Gallery</a>
        <a href="notices.html">Notices</a>
        <a href="events.html">Events</a>
        <a href="contact.html">Contact</a>
        <a href="parent/login.html">Parent Portal</a>
        <a href="admissions.html#inquiry" style="color:var(--accent);font-weight:600;">Apply Now →</a>
      </nav>
    </header>`;

  const FOOTER_HTML = `
    <footer class="site-footer">
      <div class="container-wide">
        <div class="footer-grid">
          <div>
            <div class="brand" style="margin-bottom:12px;">
              <span class="brand-logo">V</span>
              <span class="brand-text">
                <span class="brand-name">Virat Public School</span>
                <span class="brand-sub">Virat Nagar · Kotputli</span>
              </span>
            </div>
            <p>RBSE-affiliated. LKG to Class 12.<br><a href="tel:+919000000000">+91 90000 00000</a> · <a href="mailto:office@viratpublicschool.in">office@viratpublicschool.in</a></p>
          </div>
          <div>
            <h4>Visit</h4>
            <ul>
              <li><a href="about.html">About</a></li>
              <li><a href="infrastructure.html">Campus</a></li>
              <li><a href="faculty.html">Faculty</a></li>
              <li><a href="gallery.html">Gallery</a></li>
            </ul>
          </div>
          <div>
            <h4>Families</h4>
            <ul>
              <li><a href="admissions.html">Admissions</a></li>
              <li><a href="results.html">Results</a></li>
              <li><a href="notices.html">Notices</a></li>
              <li><a href="holidays.html">Holidays</a></li>
            </ul>
          </div>
          <div>
            <h4>Info</h4>
            <ul>
              <li><a href="contact.html">Contact</a></li>
              <li><a href="disclosures.html">Disclosures</a></li>
              <li><a href="privacy.html">Privacy</a></li>
              <li><a href="parent/login.html">Parent Portal</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Virat Public School</span>
          <span><a href="admin/login.html">Admin</a></span>
        </div>
      </div>
    </footer>`;

  function getPath() {
    const p = window.location.pathname;
    if (p.endsWith('/')) return '';
    const last = p.split('/').pop();
    if (last.includes('.')) {
      return p.substring(0, p.length - last.length);
    }
    return p + '/';
  }

  function fixLinks(html) {
    const base = getPath();
    if (!base || base === '/') return html;
    return html.replace(/(href|src)="(?!https?:\/\/|#|mailto:|tel:|data:|\/)([^"]+)"/g,
      (m, attr, path) => `${attr}="${base}${path}"`);
  }

  function mount() {
    const topBarSlot = document.getElementById('vps-topbar');
    const headerSlot = document.getElementById('vps-header');
    const footerSlot = document.getElementById('vps-footer');

    if (topBarSlot) topBarSlot.outerHTML = fixLinks(TOP_BAR_HTML);
    else if (!document.querySelector('.top-bar') && !document.body.dataset.noTopbar) {
      document.body.insertAdjacentHTML('afterbegin', fixLinks(TOP_BAR_HTML));
    }

    if (headerSlot) headerSlot.outerHTML = fixLinks(HEADER_HTML);
    else if (!document.querySelector('.site-header') && !document.body.dataset.noHeader) {
      const main = document.querySelector('main') || document.body.firstChild;
      main.insertAdjacentHTML('beforebegin', fixLinks(HEADER_HTML));
    }

    if (footerSlot) footerSlot.outerHTML = fixLinks(FOOTER_HTML);
    else if (!document.querySelector('.site-footer') && !document.body.dataset.noFooter) {
      document.body.insertAdjacentHTML('beforeend', fixLinks(FOOTER_HTML));
    }

    // Mark current nav as active
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (href === path) a.classList.add('active');
    });

    // Mobile menu toggle
    const bindMenu = () => {
      const toggle = document.querySelector('.menu-toggle');
      const mobile = document.getElementById('mobile-menu');
      if (toggle && mobile && !toggle.dataset.bound) {
        toggle.dataset.bound = '1';
        toggle.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const open = mobile.classList.toggle('open');
          toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
          toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        });
        mobile.querySelectorAll('a').forEach(a => {
          a.addEventListener('click', () => {
            mobile.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
          });
        });
        document.addEventListener('click', (e) => {
          if (!mobile.classList.contains('open')) return;
          if (mobile.contains(e.target) || toggle.contains(e.target)) return;
          mobile.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && mobile.classList.contains('open')) {
            mobile.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
          }
        });
      }
    };
    bindMenu();
    setTimeout(bindMenu, 50);
    setTimeout(bindMenu, 200);

    // Header shadow on scroll
    const header = document.querySelector('.site-header');
    if (header) {
      const onScroll = () => {
        if (window.scrollY > 8) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
/* v9 — calm redesign */
