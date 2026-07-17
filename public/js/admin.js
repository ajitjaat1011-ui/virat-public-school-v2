/* ============================================================
   Virat Public School — Admin App Shell v3
   Sidebar + Topbar + Background blobs
   Each page defines window.ADMIN_PAGE = { title, crumb }
   and window.onShellReady(ctx) — runs AFTER the shell is mounted
   so getElementById finds the live elements.
   ============================================================ */
(function () {
  'use strict';

  const NAV = [
    { section: 'Overview' },
    { href: '/admin/',                  label: 'Dashboard',  icon: 'home',    match: '/admin/' },
    { section: 'Manage' },
    { href: '/admin/notices.html',      label: 'Notices',    icon: 'megaphone', badgeKey: 'notices' },
    { href: '/admin/inquiries.html',    label: 'Inquiries',  icon: 'inbox',   badgeKey: 'newInquiries' },
    { href: '/admin/messages.html',     label: 'Messages',   icon: 'mail',    badgeKey: 'unreadMessages' },
    { href: '/admin/gallery.html',      label: 'Gallery',    icon: 'image' },
    { section: 'Academics' },
    { href: '/admin/results.html',      label: 'Results',    icon: 'chart' },
    { href: '/admin/exams.html',        label: 'Exams',      icon: 'calendar', badgeKey: 'exams' },
    { href: '/admin/parents.html',      label: 'Parents',    icon: 'users',   badgeKey: 'parentRequests' },
    { section: 'System' },
    { href: '/admin/audit.html',        label: 'Audit log',  icon: 'shield' },
  ];

  const ICONS = {
    home:      '<path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z"/>',
    inbox:     '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>',
    mail:      '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>',
    image:     '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/>',
    chart:     '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
    calendar:  '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    users:     '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    megaphone: '<path d="M3 11l18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
    shield:    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  };

  function icon(name) {
    return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
  }

  const path = window.location.pathname.replace(/\/$/, '') || '/admin';
  function isActive(item) {
    if (!item.href) return false;
    if (item.match) return path === item.match.replace(/\/$/, '');
    return path === item.href.replace(/\/$/, '');
  }

  function renderSidebar(badges) {
    let html = '';
    for (const item of NAV) {
      if (item.section) {
        html += `<div class="nav-section"><div class="nav-section-title">${item.section}</div>`;
        continue;
      }
      const active = isActive(item) ? 'active' : '';
      const badge = item.badgeKey && badges && badges[item.badgeKey] > 0
        ? `<span class="badge">${badges[item.badgeKey]}</span>` : '';
      html += `<a href="${item.href}" class="nav-item ${active}">${icon(item.icon)}<span>${item.label}</span>${badge}</a>`;
    }
    return html;
  }

  // === Shared pickers ===
  window.PICKERS = {
    classes: [
      'LKG', 'UKG',
      'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
      'Class 6', 'Class 7', 'Class 8',
      'Class 9', 'Class 10',
      'Class 11 (Science)', 'Class 11 (Arts)', 'Class 11 (Agriculture)',
      'Class 12 (Science)', 'Class 12 (Arts)', 'Class 12 (Agriculture)'
    ],
    subjects: [
      'English', 'Hindi', 'Mathematics', 'Science', 'Social Science',
      'Physics', 'Chemistry', 'Biology',
      'Agriculture', 'Animal Husbandry',
      'Accountancy', 'Business Studies', 'Economics',
      'History', 'Geography', 'Political Science', 'Sociology',
      'Computer Science', 'Information Technology',
      'Sanskrit', 'French', 'Art', 'Music', 'Physical Education'
    ],
    sections: ['A', 'B', 'C', 'D', 'E'],
    grades: ['A+', 'A', 'B+', 'B', 'C', 'D', 'E']
  };

  // === 12-hour time helpers ===
  // Display: "10:30 AM" / "2:00 PM" / "12:00 AM" / "12:00 PM"
  // Storage: 24h "HH:MM" (server stays the same)
  window.fmt12 = function (iso) {
    if (!iso) return '';
    const m = /^(\d{1,2}):(\d{2})/.exec(String(iso).trim());
    if (!m) return String(iso);
    let h = parseInt(m[1], 10);
    const min = m[2];
    if (isNaN(h)) return String(iso);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    return `${h}:${min} ${ampm}`;
  };

  // Parse a 12h input back to 24h "HH:MM"
  window.parse12 = function (val) {
    if (!val) return '';
    const m = /^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/i.exec(String(val).trim());
    if (!m) {
      // Try 24h fallback
      const m2 = /^(\d{1,2}):(\d{2})$/.exec(String(val).trim());
      if (!m2) return '';
      return `${m2[1].padStart(2, '0')}:${m2[2]}`;
    }
    let h = parseInt(m[1], 10);
    const min = m[2];
    const isPm = /PM/i.test(m[3]);
    if (isPm && h !== 12) h += 12;
    if (!isPm && h === 12) h = 0;
    return `${String(h).padStart(2, '0')}:${min}`;
  };

  // === Custom 12-hour time input HTML ===
  // Renders a wrapper with hour, minute, AM/PM dropdowns. Returns
  // an element with `.time12` class and a `getValue()` method on the wrapper.
  // value is a 24h "HH:MM" string.
  window.time12Input = function (initial, name) {
    let h = '', m = '', ap = '';
    if (initial) {
      const parts = /^(\d{1,2}):(\d{2})/.exec(String(initial).trim());
      if (parts) {
        const hh = parseInt(parts[1], 10);
        m = parts[2];
        ap = hh >= 12 ? 'PM' : 'AM';
        h = String(hh % 12); if (h === '0') h = '12';
      }
    }
    const wrap = document.createElement('div');
    wrap.className = 'time12';
    wrap.innerHTML = `
      <select class="time12-h" aria-label="Hour">
        ${Array.from({length: 12}, (_, i) => i + 1).map(n => `<option value="${n}"${String(n) === h ? ' selected' : ''}>${n}</option>`).join('')}
      </select>
      <span class="time12-sep">:</span>
      <select class="time12-m" aria-label="Minute">
        ${Array.from({length: 60}, (_, i) => String(i).padStart(2, '0')).map(n => `<option value="${n}"${n === m ? ' selected' : ''}>${n}</option>`).join('')}
      </select>
      <select class="time12-ap" aria-label="AM/PM">
        <option value="AM"${ap === 'AM' ? ' selected' : ''}>AM</option>
        <option value="PM"${ap === 'PM' ? ' selected' : ''}>PM</option>
      </select>
      <input type="hidden" name="${name || 'time12'}" value="" />`;
    const hSel = wrap.querySelector('.time12-h');
    const mSel = wrap.querySelector('.time12-m');
    const apSel = wrap.querySelector('.time12-ap');
    const hidden = wrap.querySelector('input[type=hidden]');
    function sync() {
      hidden.value = window.parse12(`${hSel.value}:${mSel.value} ${apSel.value}`);
    }
    hSel.addEventListener('change', sync);
    mSel.addEventListener('change', sync);
    apSel.addEventListener('change', sync);
    sync();
    wrap.getValue = () => hidden.value;
    return wrap;
  };

  // === Sign out — exposed as window.signOut for any page to call ===
  window.signOut = async function () {
    try { await fetch('/api/admin/auth', { method: 'DELETE', credentials: 'include' }); } catch (e) {}
    window.location.href = '/admin/login.html';
  };

  // === Global toast ===
  window.toast = function (msg, type) {
    type = type || 'success';
    const t = document.createElement('div');
    t.className = 'toast ' + type;
    t.textContent = msg;
    const area = document.getElementById('toast-area');
    if (area) area.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  };

  // === Render options helper ===
  window.renderOptions = function (list, selected) {
    return list.map(v => `<option value="${escapeHtml(v)}"${v === selected ? ' selected' : ''}>${escapeHtml(v)}</option>`).join('');
  };

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  async function mount() {
    const cfg = window.ADMIN_PAGE || {};
    const title = cfg.title || 'Admin';
    const crumb = cfg.crumb || '';
    const actionsHtml = cfg.actionsHtml || '';

    let user = null;
    try {
      const r = await fetch('/api/admin/auth', { credentials: 'include' });
      if (r.ok) { const d = await r.json(); user = d.user; }
    } catch (e) {}
    if (!user) { window.location.href = '/admin/login.html'; return; }

    let badges = {};
    try {
      const r = await fetch('/api/admin/dashboard', { credentials: 'include' });
      if (r.ok) { const d = await r.json(); badges = d.counts || {}; }
    } catch (e) {}

    // Capture the page-content HTML BEFORE replacing root
    const contentEl = document.getElementById('page-content');
    const contentHTML = contentEl ? contentEl.innerHTML : '';

    const root = document.getElementById('app-root') || document.body;
    root.innerHTML = `
      <div class="sidebar-scrim" id="sidebar-scrim"></div>
      <div class="app">
        <aside class="sidebar" id="sidebar">
          <a href="/admin/" class="sidebar-brand">
            <span class="logo">V</span>
            <div>
              <div class="name">VPS Admin</div>
              <div class="sub">Virat Public School</div>
            </div>
          </a>
          <nav class="sidebar-nav">${renderSidebar(badges)}</nav>
          <div class="sidebar-foot">
            <div class="sidebar-user">
              <span class="avatar">${(user.name || user.username || 'A').slice(0, 1).toUpperCase()}</span>
              <div class="info">
                <div class="name">${escapeHtml(user.name || user.username)}</div>
                <div class="role">${user.role || 'ADMIN'}</div>
              </div>
              <button class="signout" id="signout-btn" title="Sign out" aria-label="Sign out">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </div>
        </aside>

        <div class="main">
          <header class="topbar">
            <button class="menu-btn" id="menu-btn" aria-label="Open menu" aria-controls="sidebar" aria-expanded="false" type="button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <h1>
              <span>${escapeHtml(title)}</span>
              ${crumb ? `<span class="crumb">›</span><span class="sub">${escapeHtml(crumb)}</span>` : ''}
            </h1>
            <div class="right">${actionsHtml}</div>
          </header>
          <main class="page" id="page-root">${contentHTML}</main>
        </div>
      </div>
      <div id="toast-area"></div>
    `;

    // Move modals from body into the mounted app (so they overlay correctly)
    document.querySelectorAll('body > .modal-backdrop').forEach(m => {
      root.appendChild(m);
    });

    // Mobile menu
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const scrim = document.getElementById('sidebar-scrim');
    if (menuBtn && sidebar && scrim) {
      const setMenuOpen = (open) => {
        sidebar.classList.toggle('open', open);
        scrim.classList.toggle('open', open);
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        document.body.classList.toggle('menu-open', open);
      };

      menuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        setMenuOpen(!sidebar.classList.contains('open'));
      });
      scrim.addEventListener('click', () => setMenuOpen(false));
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
          setMenuOpen(false);
          menuBtn.focus();
        }
      });
      // Close the drawer after selecting a destination on phones. The
      // navigation still follows the anchor normally.
      sidebar.querySelectorAll('.nav-item').forEach((item) => {
        item.addEventListener('click', () => setMenuOpen(false));
      });
    }

    // Sign out — bind here AFTER shell is in DOM
    const soBtn = document.getElementById('signout-btn');
    if (soBtn) soBtn.addEventListener('click', (e) => { e.preventDefault(); window.signOut(); });

    // Page is now ready — call onShellReady
    if (typeof window.onShellReady === 'function') {
      try { window.onShellReady({ badges, user }); } catch (e) { console.error('onShellReady error:', e); }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
/* admin-shell v3 */
