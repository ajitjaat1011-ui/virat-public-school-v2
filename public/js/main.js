/* ============================================================
   Virat Public School — Main script
   Heavy graphical + interactive
   ============================================================ */

// 1) Inject shared layout (top bar, header, footer) — synchronously
(function injectPartials() {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'js/partials.js?v=6', false);
    xhr.send(null);
    if (xhr.status === 200 || xhr.status === 0) {
      const s = document.createElement('script');
      s.textContent = xhr.responseText;
      document.head.appendChild(s);
    }
  } catch (e) {
    const s = document.createElement('script');
    s.src = 'js/partials.js?v=6';
    document.head.appendChild(s);
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  // === Scroll progress ===
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
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // === Reveal on scroll ===
  const revealEls = document.querySelectorAll('.reveal, .reveal-l, .reveal-r, .reveal-scale, .stagger');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  // === Magnetic buttons ===
  document.querySelectorAll('.btn-magnetic, .btn-accent, .btn-primary, .nav-cta').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) translateY(-2px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  // === Per-word hero delay ===
  document.querySelectorAll('.hero h1 .word').forEach((w, i) => {
    w.style.animationDelay = (0.1 + i * 0.06) + 's';
  });

  // === Latest notices (with date pill) ===
  const noticeEl = document.getElementById('latest-notices');
  if (noticeEl) {
    fetch('/api/notices?limit=4')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const list = (d && (d.notices || d.results)) || [];
        if (!list.length) { noticeEl.innerHTML = '<p class="text-center" style="color:var(--ink-500);">No notices yet.</p>'; return; }
        noticeEl.classList.add('stagger');
        noticeEl.innerHTML = list.map(n => {
          const date = n.publish_date || n.published_at || n.created_at;
          const dObj = date ? new Date(date) : null;
          const day  = dObj ? dObj.getDate() : '';
          const mon  = dObj ? dObj.toLocaleString('en-IN', { month: 'short' }) : '';
          return `
            <a href="notice-detail.html?id=${n.id}" class="notice-item">
              <div class="notice-date"><div class="day">${day}</div><div class="mon">${mon}</div></div>
              <div class="notice-body">
                <span class="notice-tag">${esc(n.category || 'Notice')}</span>
                <h3>${esc(n.title)}</h3>
                <div class="notice-meta">${fmt(date)}</div>
              </div>
            </a>`;
        }).join('');
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) { noticeEl.classList.add('in'); io.disconnect(); } }, { threshold: 0.1 });
          io.observe(noticeEl);
        } else { noticeEl.classList.add('in'); }
      })
      .catch(() => { noticeEl.innerHTML = '<p class="text-center" style="color:var(--ink-500);">No notices yet.</p>'; });
  }

  // === Latest gallery (with big SVG art per album) ===
  const galEl = document.getElementById('latest-gallery');
  if (galEl) {
    fetch('/api/gallery?limit=3')
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        const list = (d && (d.albums || d.results)) || [];
        if (!list.length) { galEl.innerHTML = '<p class="text-center" style="color:var(--ink-500);grid-column:1/-1;">No albums yet.</p>'; return; }
        const tones = ['plum', 'sky', 'rose', 'mix', 'plum'];
        galEl.classList.add('stagger');
        galEl.innerHTML = list.map((a, i) => {
          const date = a.event_date ? new Date(a.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
          return `
            <a href="album.html?slug=${a.slug}" class="album-card">
              <div class="album-thumb">${albumSVG(tones[i % tones.length])}</div>
              <div class="album-body">
                <h3>${esc(a.title)}</h3>
                <p>${esc(date)}</p>
              </div>
            </a>`;
        }).join('');
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) { galEl.classList.add('in'); io.disconnect(); } }, { threshold: 0.05 });
          io.observe(galEl);
        } else { galEl.classList.add('in'); }
      })
      .catch(() => { galEl.innerHTML = '<p class="text-center" style="color:var(--ink-500);grid-column:1/-1;">No albums yet.</p>'; });
  }

  // === Stats count-up ===
  document.querySelectorAll('.stat-num[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.includes('.') || el.dataset.count.includes('%')) && el.dataset.count.includes('.') ? 1 : 0;
    const suffix = el.dataset.suffix || '';
    let current = 0;
    const duration = 1600;
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
        if (entries[0].isIntersecting) { requestAnimationFrame(step); io.disconnect(); }
      }, { threshold: 0.3 });
      io.observe(el);
    } else { requestAnimationFrame(step); }
  });
});

// === Big graphic SVG for album thumbnails ===
// Expose to window for inner pages
function albumSVG(theme) {
  const palettes = {
    plum: ['#a862b4', '#c486cc', '#6d3877'],
    sky:  ['#5aaef6', '#8ac8fc', '#3892e6'],
    rose: ['#ff7898', '#ffa3b9', '#d63e6b'],
    mix:  ['#c486cc', '#8ac8fc', '#ff7898']
  };
  const p = palettes[theme] || palettes.plum;
  // Vary by theme for visual interest
  const variant = Math.floor(Math.random() * 4);
  if (theme === 'plum') {
    if (variant === 0) {
      // Mountain + sun
      return `<svg class="album-thumb-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${p[1]}"/><stop offset="100%" stop-color="${p[2]}"/></linearGradient></defs>
        <rect width="400" height="300" fill="url(#ag1)"/>
        <circle cx="320" cy="80" r="40" fill="#ffe5ec" opacity="0.9"/>
        <path d="M0 220 L100 140 L180 200 L280 100 L400 180 L400 300 L0 300 Z" fill="${p[2]}" opacity="0.7"/>
        <path d="M0 250 L120 180 L200 230 L320 160 L400 220 L400 300 L0 300 Z" fill="${p[2]}"/>
        <circle cx="60" cy="60" r="3" fill="white" opacity="0.8"/><circle cx="140" cy="40" r="2" fill="white" opacity="0.6"/><circle cx="240" cy="70" r="2" fill="white" opacity="0.7"/>
      </svg>`;
    }
    if (variant === 1) {
      // Concentric circles
      return `<svg class="album-thumb-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="ag2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${p[0]}"/><stop offset="100%" stop-color="${p[2]}"/></linearGradient></defs>
        <rect width="400" height="300" fill="url(#ag2)"/>
        <circle cx="200" cy="150" r="120" fill="none" stroke="white" stroke-width="1" opacity="0.4"/>
        <circle cx="200" cy="150" r="90" fill="none" stroke="white" stroke-width="1" opacity="0.5"/>
        <circle cx="200" cy="150" r="60" fill="none" stroke="white" stroke-width="1" opacity="0.6"/>
        <circle cx="200" cy="150" r="30" fill="white" opacity="0.8"/>
        <circle cx="200" cy="150" r="8" fill="${p[2]}"/>
      </svg>`;
    }
    if (variant === 2) {
      // Wave
      return `<svg class="album-thumb-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="ag3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${p[1]}"/><stop offset="100%" stop-color="${p[0]}"/></linearGradient></defs>
        <rect width="400" height="300" fill="url(#ag3)"/>
        <path d="M0 200 Q 100 150 200 200 T 400 200 L400 300 L0 300 Z" fill="${p[2]}" opacity="0.6"/>
        <path d="M0 220 Q 100 180 200 220 T 400 220 L400 300 L0 300 Z" fill="${p[2]}" opacity="0.8"/>
        <path d="M0 240 Q 100 210 200 240 T 400 240 L400 300 L0 300 Z" fill="${p[2]}"/>
      </svg>`;
    }
    // School
    return `<svg class="album-thumb-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="ag4" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${p[1]}"/><stop offset="100%" stop-color="${p[0]}"/></linearGradient></defs>
      <rect width="400" height="300" fill="url(#ag4)"/>
      <circle cx="320" cy="60" r="30" fill="#ffe5ec" opacity="0.7"/>
      <rect x="100" y="150" width="200" height="120" fill="white" opacity="0.95"/>
      <path d="M80 150 L200 80 L320 150 Z" fill="${p[2]}"/>
      <rect x="180" y="200" width="40" height="70" fill="${p[0]}"/>
      <rect x="120" y="180" width="30" height="30" fill="${p[1]}"/>
      <rect x="250" y="180" width="30" height="30" fill="${p[1]}"/>
    </svg>`;
  }
  if (theme === 'sky') {
    return `<svg class="album-thumb-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs><linearGradient id="as1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#b9dffe"/><stop offset="100%" stop-color="#5aaef6"/></linearGradient></defs>
      <rect width="400" height="300" fill="url(#as1)"/>
      <ellipse cx="100" cy="80" rx="50" ry="20" fill="white" opacity="0.7"/>
      <ellipse cx="280" cy="60" rx="60" ry="22" fill="white" opacity="0.6"/>
      <ellipse cx="200" cy="200" rx="240" ry="80" fill="#5aaef6" opacity="0.5"/>
      <path d="M0 220 Q 200 180 400 220 L400 300 L0 300 Z" fill="#5aaef6"/>
      <circle cx="80" cy="180" r="4" fill="white" opacity="0.8"/>
      <circle cx="160" cy="160" r="3" fill="white" opacity="0.7"/>
      <circle cx="240" cy="170" r="3" fill="white" opacity="0.8"/>
    </svg>`;
  }
  if (theme === 'rose') {
    return `<svg class="album-thumb-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <defs><radialGradient id="ar1" cx="50%" cy="50%"><stop offset="0%" stop-color="#ffa3b9"/><stop offset="100%" stop-color="#d63e6b"/></radialGradient></defs>
      <rect width="400" height="300" fill="url(#ar1)"/>
      ${Array.from({length: 30}, (_, i) => {
        const x = (i * 37) % 400; const y = ((i * 53) % 240) + 20; const r = 4 + (i % 4) * 2;
        return `<circle cx="${x}" cy="${y}" r="${r}" fill="white" opacity="${0.2 + (i % 3) * 0.1}"/>`;
      }).join('')}
      <circle cx="200" cy="150" r="50" fill="white" opacity="0.3"/>
      <circle cx="200" cy="150" r="20" fill="white" opacity="0.6"/>
    </svg>`;
  }
  // mix
  return `<svg class="album-thumb-svg" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="am1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#c486cc"/><stop offset="50%" stop-color="#ff7898"/><stop offset="100%" stop-color="#8ac8fc"/></linearGradient></defs>
    <rect width="400" height="300" fill="url(#am1)"/>
    ${Array.from({length: 8}, (_, i) => {
      const x = (i * 50); const y = 30 + (i % 4) * 60; const r = 30 + (i % 3) * 20;
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="white" opacity="0.15"/>`;
    }).join('')}
    <path d="M0 250 Q 100 200 200 230 T 400 220 L400 300 L0 300 Z" fill="white" opacity="0.2"/>
  </svg>`;
}
window.albumSVG = albumSVG;

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
