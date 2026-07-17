/* ============================================================
   Virat Public School — Admin App Shell
   Sidebar + Topbar + Background blobs
   Each page sets window.ADMIN_PAGE = { title, crumb, subtitle, actionsHtml }
   And uses window.PICKERS = { classes, subjects } for dropdowns
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

  // === Shared options for pickers ===
  // Defined once so all admin forms use the same list.
  window.PICKERS = {
    classes: [
      'LKG', 'UKG',
      'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
      'Class 6', 'Class 7', 'Class 8',
      'Class 9', 'Class 10',
      'Class 11 (Science)', 'Class 11 (Commerce)', 'Class 11 (Arts)',
      'Class 12 (Science)', 'Class 12 (Commerce)', 'Class 12 (Arts)'
    ],
    subjects: [
      'English', 'Hindi', 'Mathematics', 'Science', 'Social Science',
      'Physics', 'Chemistry', 'Biology',
      'Accountancy', 'Business Studies', 'Economics',
      'History', 'Geography', 'Political Science', 'Sociology',
      'Computer Science', 'Information Technology',
      'Sanskrit', 'French', 'Art', 'Music', 'Physical Education'
    ],
    sections: ['A', 'B', 'C', 'D', 'E'],
    grades: ['A+', 'A', 'B+', 'B', 'C', 'D', 'E']
  };

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
            <button class="menu-btn" id="menu-btn" aria-label="Open menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <h1>
              <span>${escapeHtml(title)}</span>
              ${crumb ? `<span class="crumb">›</span><span class="sub">${escapeHtml(crumb)}</span>` : ''}
            </h1>
            <div class="right">${actionsHtml}</div>
          </header>
          <main class="page" id="page-root">
            ${document.getElementById('page-content') ? document.getElementById('page-content').innerHTML : ''}
          </main>
        </div>
      </div>
      <div id="toast-area"></div>
    `;

    // Mobile menu
    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');
    const scrim = document.getElementById('sidebar-scrim');
    if (menuBtn) {
      menuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        sidebar.classList.toggle('open');
        scrim.classList.toggle('open');
      });
      scrim.addEventListener('click', () => {
        sidebar.classList.remove('open');
        scrim.classList.remove('open');
      });
    }

    // Sign out
    document.getElementById('signout-btn').addEventListener('click', async () => {
      try { await fetch('/api/admin/auth', { method: 'DELETE', credentials: 'include' }); } catch (e) {}
      window.location.href = '/admin/login.html';
    });

    if (typeof window.onShellReady === 'function') {
      window.onShellReady({ badges, user });
    }
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

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

  // === Helper: render options for a select ===
  window.renderOptions = function (list, selected) {
    return list.map(v => `<option value="${escapeHtml(v)}"${v === selected ? ' selected' : ''}>${escapeHtml(v)}</option>`).join('');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
/* admin-shell v2 */
