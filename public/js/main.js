/* ============================================================
   Virat Public School — Main frontend script
   ============================================================ */

// 1) Inject shared layout (top bar, header, footer)
(function injectPartials() {
  const s = document.createElement('script');
  s.src = 'js/partials.js?v=2';
  s.defer = false;
  document.head.appendChild(s);
})();

// 2) Mobile menu + page helpers
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu (also re-bound after partials inject)
  const bindMenu = () => {
    const toggle = document.querySelector('.menu-toggle');
    const mobile = document.getElementById('mobile-menu');
    if (toggle && mobile && !toggle.dataset.bound) {
      toggle.dataset.bound = '1';
      toggle.addEventListener('click', () => {
        const open = mobile.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  };
  bindMenu();
  setTimeout(bindMenu, 50);

  // 3) Latest notices
  const noticeEl = document.getElementById('latest-notices');
  if (noticeEl) {
    fetch('/api/notices?limit=4')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const list = (d && (d.notices || d.results)) || [];
        if (!list.length) {
          noticeEl.innerHTML = '<p class="text-center" style="color:var(--color-text-mute);">No notices yet.</p>';
          return;
        }
        noticeEl.innerHTML = list.map(n => `
          <a href="notice-detail.html?id=${n.id}" class="notice-item">
            <span class="notice-tag">${n.category || 'Notice'}</span>
            <h3>${escapeHtml(n.title)}</h3>
            <div class="notice-meta">${formatDate(n.publish_date || n.published_at || n.created_at)}</div>
          </a>
        `).join('');
      })
      .catch(() => {
        noticeEl.innerHTML = '<p class="text-center" style="color:var(--color-text-mute);">No notices yet.</p>';
      });
  }

  // 4) Latest gallery
  const galEl = document.getElementById('latest-gallery');
  if (galEl) {
    fetch('/api/gallery?limit=3')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const list = (d && (d.albums || d.results)) || [];
        if (!list.length) {
          galEl.innerHTML = '<p class="text-center" style="color:var(--color-text-mute);grid-column:1/-1;">No albums yet.</p>';
          return;
        }
        const tones = ['', 'sky', 'rose', 'plum'];
        galEl.innerHTML = list.map((a, i) => `
          <a href="album.html?slug=${a.slug}" class="album-card">
            <div class="album-thumb ${tones[i % tones.length]}"></div>
            <div class="album-body">
              <h3>${escapeHtml(a.title)}</h3>
              <p>${formatDate(a.event_date || a.created_at)}</p>
            </div>
          </a>
        `).join('');
      })
      .catch(() => {
        galEl.innerHTML = '<p class="text-center" style="color:var(--color-text-mute);grid-column:1/-1;">No albums yet.</p>';
      });
  }

  // 5) Stats
  const statsEl = document.getElementById('stats');
  if (statsEl) {
    fetch('/api/stats').then(r => r.ok ? r.json() : null).then(d => {
      if (!d) return;
      const items = [
        ['students', d.students || 1200],
        ['teachers', d.teachers || 65],
        ['board pass rate', d.pass_rate || '98%'],
        ['years and counting', d.years || 18]
      ];
      statsEl.innerHTML = items.map(([l, v]) => `
        <div>
          <div class="stat-num">${v}</div>
          <div class="stat-label">${l}</div>
        </div>
      `).join('');
    }).catch(() => {});
  }
});

function escapeHtml(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}
