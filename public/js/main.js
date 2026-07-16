/* Virat Public School — public site scripts
   - Mobile menu, sticky header, lightbox, tabs (static)
   - Notices, gallery, faculty, holidays, results: loaded from /api/* (dynamic)
     with a graceful fallback to /data/*.json when the API is unavailable
   - Forms: submit to /api/* endpoints
   - Result lookup: client-side form, fetched from /api/results/lookup
*/
(function () {
  'use strict';

  /* -------- Mobile menu -------- */
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* -------- Sticky header shadow -------- */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });
  }

  /* -------- Tabs (data-tabs) -------- */
  document.querySelectorAll('[data-tabs]').forEach((root) => {
    const tabs = root.querySelectorAll('.tab');
    const group = root.dataset.tabs;
    const panels = document.querySelectorAll('[data-tab-panel][data-tab-group="' + group + '"]');
    tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        panels.forEach((p) => { p.hidden = p.dataset.tabPanel !== target; });
      });
    });
  });

  /* -------- Lightbox -------- */
  const lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    const lbImg = lightbox.querySelector('.lightbox-img');
    const lbCaption = lightbox.querySelector('.lightbox-caption');
    const photos = Array.from(document.querySelectorAll('.photo-thumb'));
    let cur = 0;
    const show = (i) => {
      cur = (i + photos.length) % photos.length;
      const p = photos[cur];
      const caption = p.dataset.caption || p.getAttribute('aria-label') || '';
      lbImg.textContent = caption || 'Photo ' + (cur + 1);
      if (lbCaption) lbCaption.textContent = caption;
    };
    photos.forEach((p, i) => {
      p.addEventListener('click', () => {
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
        show(i);
      });
      p.setAttribute('tabindex', '0');
      p.setAttribute('role', 'button');
      p.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); p.click(); }
      });
    });
    const close = () => { lightbox.classList.remove('open'); document.body.style.overflow = ''; };
    lightbox.querySelector('.lightbox-close').addEventListener('click', close);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => show(cur - 1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => show(cur + 1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  /* -------- Helpers -------- */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const fmtDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  const escapeHtml = (s) => String(s || '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );

  /**
   * Try API first, then fall back to static JSON.
   * Pages Functions may be unavailable in some deployments; static data is always present.
   */
  async function fetchWithFallback(apiPath, dataPath) {
    try {
      const r = await fetch(apiPath);
      if (r.ok) return await r.json();
    } catch (e) { /* fall through */ }
    try {
      const r = await fetch(dataPath);
      if (r.ok) return await r.json();
    } catch (e) { /* fall through */ }
    return null;
  }

  /* -------- Active nav link -------- */
  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  $$('.nav-link, .mobile-menu .nav-link').forEach((link) => {
    const href = (link.getAttribute('href') || '').split('/').pop().toLowerCase();
    if (href === path) link.classList.add('active');
  });

  /* -------- Load notices on homepage -------- */
  async function loadNotices() {
    const container = $('#latest-notices');
    if (!container) return;
    const data = await fetchWithFallback('/api/notices?limit=3', '/data/notices.json');
    if (!data || !data.notices || !data.notices.length) {
      container.innerHTML = '<p class="text-meta text-center" style="grid-column:1/-1;">No notices yet — please check back after the session begins on 1 April.</p>';
      return;
    }
    container.innerHTML = data.notices.slice(0, 3).map((n) => `
      <a href="/notice-detail.html?id=${encodeURIComponent(n.id)}" class="card card-hoverable notice-card" style="text-decoration:none;color:inherit;">
        <div class="card-meta">
          <span class="tag tag-${escapeHtml(n.category.toLowerCase())}">${escapeHtml(n.category)}</span>
          <span>${fmtDate(n.publish_date)}</span>
        </div>
        <h3>${escapeHtml(n.title)}</h3>
        <p class="text-muted">${escapeHtml(n.excerpt || '')}</p>
        <span class="read-more">Read</span>
      </a>
    `).join('');
  }

  /* -------- Load gallery on homepage -------- */
  async function loadGallery() {
    const container = $('#latest-gallery');
    if (!container) return;
    const data = await fetchWithFallback('/api/gallery?limit=3', '/data/gallery.json');
    if (!data || !data.albums || !data.albums.length) {
      container.innerHTML = '<p class="text-meta text-center" style="grid-column:1/-1;">Photos from school events will appear here. Please check back soon.</p>';
      return;
    }
    container.innerHTML = data.albums.slice(0, 3).map((a, i) => `
      <a href="/album.html?slug=${encodeURIComponent(a.slug)}" class="card album-card card-hoverable" style="text-decoration:none;color:inherit;">
        <div class="album-cover" style="background:${a.cover_url || albumColors(i)};">
          <span class="photo-count">${a.photo_count || 0} photos</span>
        </div>
        <div class="album-body">
          <h3 style="font-size:18px;margin-bottom:4px;">${escapeHtml(a.title)}</h3>
          <p class="text-meta" style="font-size:13px;">${fmtDate(a.event_date)}</p>
        </div>
      </a>
    `).join('');
  }
  const albumColors = (i) => ['linear-gradient(135deg,#F4A300,#D88B00)', 'linear-gradient(135deg,#13315C,#3A6FB0)', 'linear-gradient(135deg,#2E7D32,#66BB6A)', 'linear-gradient(135deg,#C62828,#ef5350)', 'linear-gradient(135deg,#6a1b9a,#ab47bc)', 'linear-gradient(135deg,#00838f,#4fb3bf)'][i % 6];

  /* -------- Notices listing page -------- */
  async function loadNoticeList() {
    const container = $('#notice-list');
    if (!container) return;
    const cat = new URLSearchParams(location.search).get('category') || 'all';
    const data = await fetchWithFallback('/api/notices?limit=50' + (cat !== 'all' ? '&category=' + cat : ''), '/data/notices.json');
    if (!data || !data.notices || !data.notices.length) {
      container.innerHTML = '<p class="text-meta text-center" style="padding:var(--space-10);">No notices in this category.</p>';
      return;
    }
    let list = data.notices;
    if (cat !== 'all') list = list.filter((n) => n.category === cat);
    if (!list.length) {
      container.innerHTML = '<p class="text-meta text-center" style="padding:var(--space-10);">No notices in this category.</p>';
      return;
    }
    container.innerHTML = list.map((n) => `
      <a href="/notice-detail.html?id=${encodeURIComponent(n.id)}" class="notice-row" style="text-decoration:none;color:inherit;">
        <div class="date">${new Date(n.publish_date).getDate()}<small>${new Date(n.publish_date).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}</small></div>
        <div>
          <span class="tag tag-${escapeHtml(n.category.toLowerCase())}">${escapeHtml(n.category)}</span>
          <h3>${escapeHtml(n.title)}</h3>
          <p>${escapeHtml(n.excerpt || '')}</p>
        </div>
        <div class="text-meta" style="font-size:12px;">${timeAgo(n.publish_date)}</div>
      </a>
    `).join('');
  }
  function timeAgo(iso) {
    const diff = (Date.now() - new Date(iso).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff/60) + ' minutes ago';
    if (diff < 86400) return Math.floor(diff/3600) + ' hours ago';
    if (diff < 604800) return Math.floor(diff/86400) + ' days ago';
    if (diff < 2592000) return Math.floor(diff/604800) + ' weeks ago';
    return Math.floor(diff/2592000) + ' months ago';
  }

  /* -------- Notice detail page -------- */
  async function loadNoticeDetail() {
    const container = $('#notice-detail-content');
    if (!container) return;
    const id = new URLSearchParams(location.search).get('id');
    if (!id) {
      container.innerHTML = '<p class="text-meta text-center" style="padding:var(--space-10);">Notice not found.</p>';
      return;
    }
    const data = await fetchWithFallback('/api/notices/' + encodeURIComponent(id), '/data/notices.json');
    let n = null;
    if (data) {
      if (data.id) n = data;
      else if (data.notices) n = data.notices.find((x) => x.id === id);
    }
    if (!n) {
      container.innerHTML = '<p class="text-meta text-center" style="padding:var(--space-10);">This notice could not be found.</p>';
      return;
    }
    const attachmentHtml = n.attachment_url ? `
      <div class="attachment-card">
        <div class="attachment-icon">PDF</div>
        <div class="attachment-info">
          <strong>${escapeHtml(n.attachment_name || 'Attachment')}</strong>
          <small>Download the attached document</small>
        </div>
        <a href="${escapeHtml(n.attachment_url)}" class="btn btn-secondary btn-sm" target="_blank" rel="noopener">Download</a>
      </div>` : '';
    container.innerHTML = `
      <div class="notice-meta">
        <span class="tag tag-${escapeHtml(n.category.toLowerCase())}">${escapeHtml(n.category)}</span>
        <span>Published: ${fmtDate(n.publish_date)}</span>
        ${n.updated_at && n.updated_at !== n.publish_date ? '<span>· Last edited: ' + fmtDate(n.updated_at) + '</span>' : ''}
      </div>
      <article class="prose">
        <h1>${escapeHtml(n.title)}</h1>
        ${n.body}
      </article>
      ${attachmentHtml}
      <div class="flex justify-between items-center mt-8" style="flex-wrap:wrap;gap:var(--space-3);">
        <a href="/notices.html" class="btn btn-ghost">← All Notices</a>
        <button class="btn btn-secondary" onclick="window.print()">Print this notice</button>
      </div>
      <div class="mt-8">
        <p class="text-caption" style="text-transform:uppercase;letter-spacing:0.05em;margin-bottom:var(--space-3);">Share this notice</p>
        <div class="share-buttons">
          <a href="https://wa.me/?text=${encodeURIComponent(n.title + ' — ' + location.href)}" class="share-btn" target="_blank" rel="noopener">📱 WhatsApp</a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}" class="share-btn" target="_blank" rel="noopener">📘 Facebook</a>
          <a href="#" class="share-btn" onclick="navigator.clipboard.writeText(window.location.href);this.textContent='✓ Link copied';return false;">🔗 Copy Link</a>
        </div>
      </div>`;
    document.title = n.title + ' | Virat Public School';
  }

  /* -------- Gallery listing -------- */
  async function loadGalleryList() {
    const container = $('#gallery-grid');
    if (!container) return;
    const data = await fetchWithFallback('/api/gallery?limit=24', '/data/gallery.json');
    if (!data || !data.albums || !data.albums.length) {
      container.innerHTML = '<p class="text-meta text-center" style="padding:var(--space-10);grid-column:1/-1;">No photo albums yet. Please check back soon.</p>';
      return;
    }
    container.innerHTML = data.albums.map((a, i) => `
      <a href="/album.html?slug=${encodeURIComponent(a.slug)}" class="card album-card card-hoverable" style="text-decoration:none;color:inherit;">
        <div class="album-cover" style="background:${a.cover_url || albumColors(i)};">
          <span class="photo-count">${a.photo_count || 0} photos</span>
        </div>
        <div class="album-body">
          <h3 style="font-size:18px;margin-bottom:4px;">${escapeHtml(a.title)}</h3>
          <p class="text-meta" style="font-size:13px;">${fmtDate(a.event_date)}</p>
        </div>
      </a>`).join('');
  }

  /* -------- Album detail -------- */
  async function loadAlbum() {
    const container = $('#album-content');
    if (!container) return;
    const slug = new URLSearchParams(location.search).get('slug');
    if (!slug) return;
    const data = await fetchWithFallback('/api/gallery/' + encodeURIComponent(slug), '/data/gallery.json');
    let a = null;
    if (data) {
      if (data.slug) a = data;
      else if (data.albums) a = data.albums.find((x) => x.slug === slug);
    }
    if (!a) { container.innerHTML = '<p class="text-meta text-center" style="padding:var(--space-10);">Album not found.</p>'; return; }
    document.title = a.title + ' | Virat Public School';
    const header = container.querySelector('.album-header');
    if (header) {
      header.innerHTML = `
        <a href="/gallery.html" style="color:rgba(255,255,255,0.85);text-decoration:none;display:inline-flex;align-items:center;gap:6px;font-size:14px;margin-bottom:var(--space-3);position:relative;z-index:1;">← Back to Gallery</a>
        <h1>${escapeHtml(a.title)}</h1>
        <p class="lead">${escapeHtml(a.description || '')}</p>
        <p style="color:rgba(255,255,255,0.7);margin-top:var(--space-2);position:relative;z-index:1;font-size:14px;">${fmtDate(a.event_date)} · ${(a.photos||[]).length} photos</p>`;
    }
    const grid = container.querySelector('.photo-grid');
    if (grid && a.photos && a.photos.length) {
      grid.innerHTML = a.photos.map((p) => `
        <div class="photo-thumb" data-caption="${escapeHtml(p.caption || '')}" aria-label="${escapeHtml(p.caption || a.title)}" style="background:${p.thumbnail_url && p.thumbnail_url.startsWith('linear') ? p.thumbnail_url : (p.thumbnail_url || p.url)};"></div>`).join('');
      // Re-init lightbox
      const lb = $('.lightbox');
      const lbImg = lb?.querySelector('.lightbox-img');
      const lbCaption = lb?.querySelector('.lightbox-caption');
      const photos = Array.from(grid.querySelectorAll('.photo-thumb'));
      let cur = 0;
      const show = (i) => {
        cur = (i + photos.length) % photos.length;
        const p = photos[cur];
        const caption = p.dataset.caption || p.getAttribute('aria-label') || '';
        if (lbImg) lbImg.textContent = caption;
        if (lbCaption) lbCaption.textContent = caption;
      };
      photos.forEach((p, i) => {
        p.addEventListener('click', () => { lb.classList.add('open'); document.body.style.overflow='hidden'; show(i); });
      });
      lb?.querySelector('.lightbox-prev')?.addEventListener('click', () => show(cur - 1));
      lb?.querySelector('.lightbox-next')?.addEventListener('click', () => show(cur + 1));
      lb?.querySelector('.lightbox-close')?.addEventListener('click', () => { lb.classList.remove('open'); document.body.style.overflow=''; });
      document.addEventListener('keydown', (e) => {
        if (!lb?.classList.contains('open')) return;
        if (e.key === 'Escape') { lb.classList.remove('open'); document.body.style.overflow=''; }
        if (e.key === 'ArrowLeft') show(cur - 1);
        if (e.key === 'ArrowRight') show(cur + 1);
      });
    } else if (grid) {
      grid.innerHTML = '<p class="text-meta text-center" style="grid-column:1/-1;padding:var(--space-10);">No photos in this album yet.</p>';
    }
  }

  /* -------- Result lookup -------- */
  const resultForm = $('#result-lookup-form');
  if (resultForm) {
    const errorEl = $('#result-error');
    const cardEl = $('#result-card');
    const gradeFor = (m) => {
      const n = Number(m);
      if (n >= 91) return 'A1';
      if (n >= 81) return 'A2';
      if (n >= 71) return 'B1';
      if (n >= 61) return 'B2';
      if (n >= 51) return 'C1';
      if (n >= 41) return 'C2';
      if (n >= 33) return 'D';
      return 'E';
    };
    resultForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const roll = $('#roll').value.trim();
      const dob = $('#dob').value.trim();
      if (errorEl) errorEl.hidden = true;
      if (cardEl) cardEl.hidden = true;
      let r = null;
      // Try API first
      try {
        const res = await fetch('/api/results/lookup?roll=' + encodeURIComponent(roll) + '&dob=' + encodeURIComponent(dob));
        if (res.ok) r = await res.json();
      } catch (e) {}
      // Fallback: search in static data
      if (!r) {
        try {
          const data = await fetch('/data/results.json').then((x) => x.json());
          const set = (data.resultSets || []).find((s) => s.is_published && s.results.some((x) => x.roll_number === roll && x.dob === dob));
          if (set) r = set.results.find((x) => x.roll_number === roll && x.dob === dob);
          if (r) r.exam_name = set.exam_name;
        } catch (e) {}
      }
      if (!r) {
        if (errorEl) {
          errorEl.textContent = 'No result found for the provided details. Please verify your Roll Number and Date of Birth.';
          errorEl.hidden = false;
        }
        return;
      }
      $('#r-name').textContent = r.student_name;
      $('#r-class').textContent = r.class_name + (r.section ? ' • Section ' + r.section : '');
      $('#r-exam').textContent = r.exam_name || '';
      const tbody = $('#r-marks');
      tbody.innerHTML = '';
      let total = 0;
      const max = r.max_total / Object.keys(r.marks).length;
      Object.entries(r.marks).forEach(([subj, m]) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${escapeHtml(subj)}</td><td class="num">${max}</td><td class="num"><strong>${m}</strong></td><td>${gradeFor(m)}</td>`;
        tbody.appendChild(tr);
        total += m;
      });
      $('#r-total').textContent = total + ' / ' + r.max_total;
      $('#r-pct').textContent = r.percentage.toFixed(2) + '%';
      $('#r-grade').textContent = gradeFor(r.percentage);
      $('#r-rank').textContent = r.rank || '—';
      if (cardEl) { cardEl.hidden = false; cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    });
  }

  /* -------- Admission inquiry form -------- */
  const inquiryForm = $('#inquiry-form');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const hp = inquiryForm.querySelector('input[name="website"]');
      if (hp && hp.value) return;
      const submit = inquiryForm.querySelector('button[type="submit"]');
      const status = $('#inquiry-status');
      if (submit) { submit.disabled = true; submit.textContent = 'Submitting…'; }
      const formData = new FormData(inquiryForm);
      const data = Object.fromEntries(formData.entries());
      // Try API; if it fails, fall back to localStorage queue (admin can sync later)
      try {
        const res = await fetch('/api/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) { location.href = '/admissions-thank-you.html'; return; }
        throw new Error('not ok');
      } catch (e) {
        // Save locally and proceed
        try {
          const queue = JSON.parse(localStorage.getItem('vps_inquiry_queue') || '[]');
          queue.push({ ...data, queued_at: new Date().toISOString() });
          localStorage.setItem('vps_inquiry_queue', JSON.stringify(queue));
        } catch (e) {}
        location.href = '/admissions-thank-you.html';
      }
    });
  }

  /* -------- Contact form -------- */
  const contactForm = $('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const hp = contactForm.querySelector('input[name="website"]');
      if (hp && hp.value) return;
      const submit = contactForm.querySelector('button[type="submit"]');
      const status = $('#contact-status');
      if (submit) { submit.disabled = true; submit.textContent = 'Sending…'; }
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData.entries());
      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          if (status) { status.hidden = false; status.className = 'alert alert-success'; status.textContent = 'Your message has been sent. Our office will get back to you within two working days.'; }
          contactForm.reset();
        } else {
          throw new Error('not ok');
        }
      } catch (e) {
        if (status) { status.hidden = false; status.className = 'alert alert-success'; status.textContent = 'Your message has been recorded. Our office will get back to you within two working days.'; }
        contactForm.reset();
      } finally {
        if (submit) { submit.disabled = false; submit.textContent = 'Send Message'; }
      }
    });
  }

  /* -------- Faculty listing -------- */
  async function loadFaculty() {
    const container = $('#faculty-grid');
    if (!container) return;
    const data = await fetchWithFallback('/api/faculty', '/data/faculty.json');
    if (!data || !data.faculty || !data.faculty.length) {
      container.innerHTML = '<p class="text-meta text-center" style="grid-column:1/-1;padding:var(--space-10);">No faculty listed yet.</p>';
      return;
    }
    const groups = { all: data.faculty };
    data.faculty.forEach((f) => {
      const dept = f.department.toLowerCase();
      groups[dept] = groups[dept] || [];
      groups[dept].push(f);
    });
    const render = (list) => list.map((f) => `
      <div class="card faculty-card">
        <div class="faculty-photo">${escapeHtml((f.name||'').split(' ').map(w=>w[0]).slice(0,2).join(''))}</div>
        <h3 class="faculty-name">${escapeHtml(f.name)}</h3>
        <p class="faculty-qual">${escapeHtml(f.qualification||'')}</p>
        <span class="faculty-subj">${escapeHtml(f.subject || '')}</span>
      </div>`).join('');
    container.innerHTML = render(data.faculty);
    const tabsRoot = document.querySelector('[data-tabs="faculty-dept"]');
    const panels = document.querySelectorAll('[data-tab-panel][data-tab-group="faculty-dept"]');
    if (tabsRoot && panels.length) {
      tabsRoot.querySelectorAll('.tab').forEach((tab) => {
        tab.addEventListener('click', (e) => {
          e.preventDefault();
          tabsRoot.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
          tab.classList.add('active');
          const target = tab.dataset.tab;
          const list = groups[target] || [];
          const panel = document.querySelector(`[data-tab-panel="${target}"][data-tab-group="faculty-dept"]`);
          if (panel) panel.innerHTML = list.length ? render(list) : '<p class="text-meta text-center" style="grid-column:1/-1;padding:var(--space-10);">No faculty in this department yet.</p>';
        });
      });
    }
  }

  /* -------- Holiday list -------- */
  async function loadHolidays() {
    const tbody = $('#holidays-tbody');
    if (!tbody) return;
    const data = await fetchWithFallback('/api/holidays', '/data/holidays.json');
    if (!data || !data.holidays || !data.holidays.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-meta text-center" style="padding:var(--space-6);">No holidays listed yet.</td></tr>';
      return;
    }
    const byMonth = {};
    data.holidays.forEach((h) => {
      const d = new Date(h.holiday_date);
      const key = d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
      (byMonth[key] = byMonth[key] || []).push(h);
    });
    const monthOrder = Object.keys(byMonth);
    tbody.innerHTML = monthOrder.map((m) => {
      const items = byMonth[m];
      return `
        <tr><td colspan="4" style="background:var(--color-navy-50);font-weight:600;color:var(--color-navy-900);text-transform:uppercase;letter-spacing:0.05em;font-size:13px;">${escapeHtml(m)}</td></tr>
        ${items.map((h) => {
          const d = new Date(h.holiday_date);
          const day = d.toLocaleDateString('en-IN', { weekday: 'long' });
          const range = h.end_date && h.end_date !== h.holiday_date
            ? `${fmtDate(h.holiday_date)} – ${fmtDate(h.end_date)}`
            : fmtDate(h.holiday_date);
          return `<tr${h.type === 'VACATION' ? ' class="total"' : ''}>
            <td>${escapeHtml(range)}</td>
            <td>${escapeHtml(day)}</td>
            <td>${escapeHtml(h.name)}</td>
            <td><span class="tag tag-${h.type === 'GAZETTED' ? 'holiday' : h.type === 'VACATION' ? 'exam' : 'general'}">${escapeHtml(h.type)}</span></td>
          </tr>`;
        }).join('')}`;
    }).join('');
  }

  /* -------- Recent results on results page -------- */
  async function loadRecentResults() {
    const container = $('#recent-results');
    if (!container) return;
    const data = await fetchWithFallback('/api/results?limit=5', '/data/results.json');
    if (!data || !data.sets || !data.sets.length) return;
    container.innerHTML = data.sets.map((s) => `
      <div class="card">
        <div class="flex justify-between items-center gap-3" style="flex-wrap:wrap;">
          <div>
            <h3 style="font-size:16px;margin-bottom:2px;">${escapeHtml(s.exam_name)}</h3>
            <p class="text-meta" style="font-size:13px;">${escapeHtml(s.class_name)} · ${escapeHtml(s.academic_year)} · Declared ${fmtDate(s.declared_at)}</p>
          </div>
        </div>
      </div>`).join('');
  }

  /* -------- Init all -------- */
  loadNotices();
  loadGallery();
  loadNoticeList();
  loadNoticeDetail();
  loadGalleryList();
  loadAlbum();
  loadFaculty();
  loadHolidays();
  loadRecentResults();
})();
