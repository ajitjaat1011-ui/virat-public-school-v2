/* ============================================================
   Virat Public School — Partial layout injector
   Keeps all 22 pages consistent with the new soft design
   ============================================================ */
(function () {
  'use strict';

  const TOP_BAR_HTML = `
    <div class="top-bar">
      <div class="container-wide">
        <a href="tel:+919000000000">+91 90000 00000</a>
        <span class="top-tag">RBSE Affiliated · Est. 2008</span>
      </div>
    </div>`;

  const HEADER_HTML = `
    <header class="site-header">
      <div class="container-wide">
        <div class="header-inner">
          <a href="index.html" class="brand">
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
        <a href="admissions.html#inquiry" style="color:var(--rose-600);font-weight:600;">Apply Now →</a>
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
              <li><a href="accessibility.html">Accessibility</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 Virat Public School</span>
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
        // Close menu when a link is clicked — do NOT preventDefault
        mobile.querySelectorAll('a').forEach(a => {
          a.addEventListener('click', (e) => {
            // Let the browser handle the navigation
            mobile.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
          });
        });
        // Close on outside click
        document.addEventListener('click', (e) => {
          if (!mobile.classList.contains('open')) return;
          if (mobile.contains(e.target) || toggle.contains(e.target)) return;
          mobile.classList.remove('open');
          toggle.setAttribute('aria-expanded', 'false');
        });
        // Close on escape
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && mobile.classList.contains('open')) {
            mobile.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
          }
        });
      }
    };
    bindMenu();
    // Re-bind after a tick in case main.js re-rendered
    setTimeout(bindMenu, 50);
    setTimeout(bindMenu, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
