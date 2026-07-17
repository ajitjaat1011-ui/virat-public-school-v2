/* Updated active logic for parent dashboard */
/* ============================================================
   Virat Public School — App shell injector
   Welcome row + bottom dock + PWA install
   ============================================================ */
(function () {
  'use strict';

  // === Bottom dock items (active page = current path) ===
  const DOCK = [
    { href: '/index.html',     label: 'Home',    icon: 'home' },
    { href: '/notices.html',   label: 'Notices', icon: 'bell' },
    { href: '/gallery.html',   label: 'Gallery', icon: 'image' },
    { href: '/parent/login.html', label: 'Parents', icon: 'users' },
    { href: '/contact.html',   label: 'Contact', icon: 'mail' },
  ];

  const ICONS = {
    home:   '<path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z"/>',
    bell:   '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    image:  '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>',
    users:  '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    mail:   '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
  };

  function icon(name) {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
  }

  // === Render top app bar (welcome row) ===
  function renderAppBar() {
    return `
      <div class="app-topbar">
        <div class="welcome">
          <span class="hi">Welcome back,</span>
          <span class="name">Virat <span class="em">Public School</span></span>
        </div>
        <div class="app-avatar" title="VPS">V</div>
      </div>`;
  }

  // === Render bottom dock ===
  function renderDock() {
    const path = window.location.pathname.replace(/\/$/, '') || '/index.html';
    return `
      <div class="app-dock-wrap">
        <nav class="app-dock" aria-label="Primary">
          ${DOCK.map(item => {
            // Match exact path OR a "section" match (e.g. /parent/login.html matches /parent/ prefix for the Parents dock item)
            let active = '';
            if (item.href === '/parent/login.html') {
              if (path.startsWith('/parent/')) active = 'active';
            } else if (item.href === '/index.html') {
              if (path === '/' || path === '/index' || path === '/index.html' || path === '') active = 'active';
            } else {
              if (path === item.href || path === item.href.replace('.html', '')) active = 'active';
            }
            return `<a href="${item.href}" class="dock-item ${active}">${icon(item.icon)}<span class="label">${item.label}</span></a>`;
          }).join('')}
        </nav>
      </div>`;
  }

  // === Render install banner (PWA) ===
  function renderInstallBanner() {
    return `
      <div class="install-banner" id="install-banner">
        <div class="inner">
          <div class="icon">V</div>
          <div class="text">
            <div class="title">Install VPS app</div>
            <div class="desc">Add to your home screen for quick access</div>
          </div>
          <div class="actions">
            <button class="dismiss" id="install-dismiss">Not now</button>
            <button class="install" id="install-accept">Install</button>
          </div>
        </div>
      </div>`;
  }

  // === Inject floating blobs (decorative) ===
  function injectBlobs() {
    if (document.querySelector('.float-blob')) return;
    const html = '<div class="float-blob pink" aria-hidden="true"></div><div class="float-blob sky" aria-hidden="true"></div>';
    document.body.insertAdjacentHTML('afterbegin', html);
  }

  // === Service worker registration ===
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    if (location.protocol === 'file:') return;
    // Don't register on admin pages (sensitive)
    if (location.pathname.startsWith('/admin/')) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // === Install prompt capture ===
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!localStorage.getItem('vps-install-dismissed')) {
      const banner = document.getElementById('install-banner');
      if (banner) {
        setTimeout(() => banner.classList.add('show'), 3000);
      }
    }
  });

  function bindInstall() {
    const banner = document.getElementById('install-banner');
    if (!banner) return;
    document.getElementById('install-accept').addEventListener('click', async () => {
      if (!deferredPrompt) return;
      banner.classList.remove('show');
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (e) {}
      deferredPrompt = null;
    });
    document.getElementById('install-dismiss').addEventListener('click', () => {
      banner.classList.remove('show');
      localStorage.setItem('vps-install-dismissed', '1');
    });
  }

  // === Mount ===
  function mount() {
    // Inject app topbar (welcome row)
    const topbarSlot = document.getElementById('vps-topbar');
    if (topbarSlot) {
      topbarSlot.outerHTML = renderAppBar();
    } else if (!document.querySelector('.app-topbar') && !document.body.dataset.noTopbar) {
      const main = document.querySelector('main') || document.body.firstChild;
      main.insertAdjacentHTML('beforebegin', renderAppBar());
    }
    // Inject dock + install banner
    if (!document.querySelector('.app-dock') && !document.body.dataset.noDock) {
      document.body.insertAdjacentHTML('beforeend', renderDock() + renderInstallBanner());
      document.body.classList.add('has-dock');
    }

    // Bind install banner buttons (after they are in the DOM)
    bindInstall();

    injectBlobs();
    registerSW();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
/* v10 — app shell */
