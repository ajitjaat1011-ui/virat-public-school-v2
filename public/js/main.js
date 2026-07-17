/* ============================================================
   Virat Public School — App main script
   ============================================================ */
(function () {
  'use strict';

  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function fmt(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // === Count-up stats ===
    document.querySelectorAll('.stat-num[data-count]').forEach((el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      if (prefersReduced) { el.textContent = Math.floor(target) + suffix; return; }
      let current = 0;
      const duration = 1000;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        current = target * eased;
        el.textContent = Math.floor(current) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      const io = ('IntersectionObserver' in window)
        ? new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) { requestAnimationFrame(step); io.disconnect(); }
          }, { threshold: 0.3 })
        : null;
      if (io) io.observe(el); else requestAnimationFrame(step);
    });

    // === Latest notices ===
    const noticeEl = document.getElementById('latest-notices');
    if (noticeEl) {
      fetch('/api/notices?limit=5')
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          const list = (d && (d.notices || d.results)) || [];
          if (!list.length) { noticeEl.innerHTML = '<p class="empty">No notices yet.</p>'; return; }
          noticeEl.innerHTML = list.map(n => {
            const date = n.publish_date || n.published_at || n.created_at;
            const dObj = date ? new Date(date) : null;
            const day = dObj ? dObj.getDate() : '';
            const mon = dObj ? dObj.toLocaleString('en-IN', { month: 'short' }) : '';
            return `
              <a href="notice-detail.html?id=${encodeURIComponent(n.id)}" class="notice-item">
                <div class="date"><div class="day">${day}</div><div class="mon">${mon}</div></div>
                <div class="body">
                  <span class="tag">${esc(n.category || 'Notice')}</span>
                  <h3>${esc(n.title)}</h3>
                  <div class="meta">${fmt(date)}</div>
                </div>
              </a>`;
          }).join('');
          const cnt = document.getElementById('notices-count');
          if (cnt) cnt.textContent = list.length;
        })
        .catch(() => { noticeEl.innerHTML = '<p class="empty">Unable to load notices.</p>'; });
    }

    // === Latest gallery ===
    const galEl = document.getElementById('latest-gallery');
    if (galEl) {
      fetch('/api/gallery?limit=3')
        .then(r => r.ok ? r.json() : null)
        .then(d => {
          const list = (d && (d.albums || d.results)) || [];
          if (!list.length) { galEl.innerHTML = '<p class="empty">No albums yet.</p>'; return; }
          galEl.innerHTML = list.map(a => {
            const date = a.event_date ? new Date(a.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
            const cover = a.cover_url
              ? `<img class="album-thumb-img" src="${esc(a.cover_url)}" alt="${esc(a.title)}" loading="lazy" />`
              : '';
            return `
              <a href="album.html?slug=${encodeURIComponent(a.slug)}" class="album-card">
                <div class="album-thumb">${cover}</div>
                <div class="album-body">
                  <h3>${esc(a.title)}</h3>
                  <p>${esc(date)}</p>
                </div>
              </a>`;
          }).join('');
        })
        .catch(() => { galEl.innerHTML = '<p class="empty">Unable to load albums.</p>'; });
    }
  });
})();
/* v9 — app */
