/* ============================================================
   Virat Public School — Main script
   Reveal-on-scroll, magnetic buttons, tilt, scroll progress, etc.
   ============================================================ */

// 1) Inject shared layout (top bar, header, footer) — synchronously
(function injectPartials() {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'js/partials.js?v=5', false);
    xhr.send(null);
    if (xhr.status === 200 || xhr.status === 0) {
      const s = document.createElement('script');
      s.textContent = xhr.responseText;
      document.head.appendChild(s);
    }
  } catch (e) {
    const s = document.createElement('script');
    s.src = 'js/partials.js?v=5';
    document.head.appendChild(s);
  }
})();

// 2) Page helpers on DOM ready
document.addEventListener('DOMContentLoaded', () => {

  // === Scroll progress bar ===
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  const updateProgress = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    const pct = max > 0 ? (h.scrollTop / max) : 0;
    progress.style.transform = `scaleX(${pct})`;
  };
  document.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // === Header scrolled state ===
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 8);
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // === Reveal on scroll ===
  const revealEls = document.querySelectorAll('.reveal, .reveal-l, .reveal-r, .reveal-scale, .stagger');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  // === Split text per-letter ===
  document.querySelectorAll('.split-text').forEach((el) => {
    const text = el.textContent.trim();
    el.innerHTML = text.split('').map((c) => `<span class="letter">${c === ' ' ? '&nbsp;' : c}</span>`).join('');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { el.classList.add('in'); io.disconnect(); }
      }, { threshold: 0.5 });
      io.observe(el);
    } else {
      el.classList.add('in');
    }
  });

  // === Magnetic buttons ===
  document.querySelectorAll('.btn-magnetic, .btn-accent, .btn-primary, .nav-cta').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) translateY(-2px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // === 3D tilt cards ===
  document.querySelectorAll('.tilt-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  // === Per-word hero animation ===
  document.querySelectorAll('.hero h1 .word').forEach((w, i) => {
    w.style.animationDelay = (0.1 + i * 0.05) + 's';
  });

  // === Latest notices ===
  const noticeEl = document.getElementById('latest-notices');
  if (noticeEl) {
    fetch('/api/notices?limit=4')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const list = (d && (d.notices || d.results)) || [];
        if (!list.length) {
          noticeEl.innerHTML = '<p class="text-center" style="color:var(--ink-500);">No notices yet.</p>';
          return;
        }
        noticeEl.classList.add('stagger');
        noticeEl.innerHTML = list.map(n => `
          <a href="notice-detail.html?id=${n.id}" class="notice-item">
            <span class="notice-tag">${esc(n.category || 'Notice')}</span>
            <h3>${esc(n.title)}</h3>
            <div class="notice-meta">${fmt(n.publish_date || n.published_at || n.created_at)}</div>
          </a>
        `).join('');
        // Re-observe the newly inserted items
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) { noticeEl.classList.add('in'); io.disconnect(); }
          }, { threshold: 0.1 });
          io.observe(noticeEl);
        } else { noticeEl.classList.add('in'); }
      })
      .catch(() => {
        noticeEl.innerHTML = '<p class="text-center" style="color:var(--ink-500);">No notices yet.</p>';
      });
  }

  // === Latest gallery ===
  const galEl = document.getElementById('latest-gallery');
  if (galEl) {
    fetch('/api/gallery?limit=3')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const list = (d && (d.albums || d.results)) || [];
        if (!list.length) {
          galEl.innerHTML = '<p class="text-center" style="color:var(--ink-500);grid-column:1/-1;">No albums yet.</p>';
          return;
        }
        const tones = ['', 'sky', 'rose', 'plum'];
        galEl.classList.add('stagger');
        galEl.innerHTML = list.map((a, i) => `
          <a href="album.html?slug=${a.slug}" class="album-card">
            <div class="album-thumb ${tones[i % tones.length]}">
              <span class="thumb-shape thumb-shape-1"></span>
              <span class="thumb-shape thumb-shape-2"></span>
              <span class="thumb-shape thumb-shape-3"></span>
            </div>
            <div class="album-body">
              <h3>${esc(a.title)}</h3>
              <p>${fmt(a.event_date || a.created_at)}</p>
            </div>
          </a>
        `).join('');
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) { galEl.classList.add('in'); io.disconnect(); }
          }, { threshold: 0.1 });
          io.observe(galEl);
        } else { galEl.classList.add('in'); }
      })
      .catch(() => {
        galEl.innerHTML = '<p class="text-center" style="color:var(--ink-500);grid-column:1/-1;">No albums yet.</p>';
      });
  }

  // === Stats count-up animation ===
  document.querySelectorAll('.stat-num[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.includes('.') || el.dataset.count.includes('%')) && el.dataset.count.includes('.') ? 1 : 0;
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const duration = 1500;
    const startTime = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      current = target * eased;
      el.textContent = (decimals ? current.toFixed(decimals) : Math.floor(current)) + suffix;
      if (t < 1) requestAnimationFrame(step);
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          requestAnimationFrame(step);
          io.disconnect();
        }
      }, { threshold: 0.3 });
      io.observe(el);
    } else { requestAnimationFrame(step); }
  });
});

function esc(s) {
  if (!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}
function fmt(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}
