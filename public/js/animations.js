/* ============================================================
   Virat Public School — Animation Lab JS
   Wires up all 31 interactive demo behaviours
   ============================================================ */
(function () {
  'use strict';

  /* 01. Real-time hero */
  const rtInput = document.getElementById('rt-input');
  const rtText  = document.getElementById('rt-text');
  const rtReset = document.getElementById('rt-reset');
  if (rtInput && rtText) {
    rtInput.addEventListener('input', () => {
      rtText.textContent = rtInput.value || ' ';
    });
    if (rtReset) rtReset.addEventListener('click', () => {
      rtInput.value = 'Admissions Open 2026-27';
      rtText.textContent = rtInput.value;
    });
  }

  /* 02. Scrollytelling — active dot follows scroll */
  const steps = document.querySelectorAll('.scrolly-step');
  const dots  = document.querySelectorAll('.scrolly-dot');
  if (steps.length && dots.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const idx = Array.from(steps).indexOf(e.target);
          dots.forEach((d, i) => {
            d.style.transform = i === idx ? 'scale(1.3)' : 'scale(1)';
            d.style.boxShadow  = i === idx
              ? '0 6px 20px rgba(168, 98, 180, 0.5)'
              : '0 4px 12px rgba(168, 98, 180, 0.3)';
          });
        }
      });
    }, { threshold: 0.5 });
    steps.forEach((s) => obs.observe(s));
  }

  /* 03. AR/VR tilt */
  const arvrCard = document.querySelector('.arvr-card');
  if (arvrCard) {
    const handle = (x, y) => {
      const rect = arvrCard.getBoundingClientRect();
      const cx = (x - rect.left) / rect.width - 0.5;
      const cy = (y - rect.top) / rect.height - 0.5;
      arvrCard.style.transform = `rotateX(${-cy * 20}deg) rotateY(${cx * 20}deg)`;
    };
    arvrCard.addEventListener('mousemove', (e) => handle(e.clientX, e.clientY));
    arvrCard.addEventListener('touchmove', (e) => {
      const t = e.touches[0];
      handle(t.clientX, t.clientY);
    });
    arvrCard.addEventListener('mouseleave', () => arvrCard.style.transform = '');
  }

  /* 04. Scramble text */
  const scramble = document.getElementById('scramble-headline');
  if (scramble) {
    const original = scramble.dataset.text;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    scramble.addEventListener('mouseenter', () => {
      let iter = 0;
      const interval = setInterval(() => {
        scramble.textContent = original.split('').map((c, i) => {
          if (i < iter) return original[i];
          if (c === ' ') return ' ';
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        iter += 1 / 2;
        if (iter >= original.length) {
          scramble.textContent = original;
          clearInterval(interval);
        }
      }, 40);
    });
  }

  /* 12. Microinteractions */
  const likeBtn = document.getElementById('like-btn');
  const likeCount = document.getElementById('like-counter');
  let likes = 0;
  if (likeBtn && likeCount) {
    likeBtn.addEventListener('click', () => {
      likeBtn.classList.toggle('liked');
      likes += likeBtn.classList.contains('liked') ? 1 : -1;
      likeCount.textContent = likes + (likes === 1 ? ' like' : ' likes');
    });
  }
  const rippleBtn = document.getElementById('ripple-btn');
  if (rippleBtn) {
    rippleBtn.addEventListener('click', (e) => {
      const r = document.createElement('span');
      r.className = 'ripple';
      const rect = rippleBtn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      r.style.width = r.style.height = size + 'px';
      r.style.left = (e.clientX - rect.left - size / 2) + 'px';
      r.style.top  = (e.clientY - rect.top  - size / 2) + 'px';
      rippleBtn.appendChild(r);
      setTimeout(() => r.remove(), 600);
    });
  }

  /* 14. Faux 3D drag */
  const card = document.getElementById('faux3d-card');
  if (card) {
    let dragging = false, sx = 0, sy = 0, rx = 0, ry = 0;
    const down = (e) => {
      dragging = true;
      const t = e.touches ? e.touches[0] : e;
      sx = t.clientX; sy = t.clientY;
    };
    const move = (e) => {
      if (!dragging) return;
      const t = e.touches ? e.touches[0] : e;
      const dx = t.clientX - sx;
      const dy = t.clientY - sy;
      ry += dx * 0.5; rx -= dy * 0.5;
      card.style.transform = `rotateY(${ry}deg) rotateX(${rx}deg)`;
      sx = t.clientX; sy = t.clientY;
    };
    const up = () => dragging = false;
    card.addEventListener('mousedown', down);
    card.addEventListener('touchstart', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
  }

  /* 17. Liquid */
  const liquidStage = document.getElementById('liquid-stage');
  const liquidBlob  = document.getElementById('liquid-blob');
  if (liquidStage && liquidBlob) {
    const move = (e) => {
      const t = e.touches ? e.touches[0] : e;
      const rect = liquidStage.getBoundingClientRect();
      liquidBlob.style.left = (t.clientX - rect.left) + 'px';
      liquidBlob.style.top  = (t.clientY - rect.top)  + 'px';
    };
    liquidStage.addEventListener('mousemove', move);
    liquidStage.addEventListener('touchmove', move);
  }

  /* 19. Isometric */
  const isoStage = document.getElementById('iso-stage');
  if (isoStage) {
    const room = isoStage.querySelector('.iso-room');
    isoStage.addEventListener('mousemove', (e) => {
      const rect = isoStage.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width - 0.5;
      const cy = (e.clientY - rect.top)  / rect.height - 0.5;
      room.style.transform = `rotateX(${55 - cy * 10}deg) rotateZ(${-45 + cx * 20}deg)`;
    });
    isoStage.addEventListener('mouseleave', () => {
      room.style.transform = '';
    });
  }

  /* 07. Redraw lines */
  const redraw = document.getElementById('redraw-lines');
  if (redraw) {
    redraw.addEventListener('click', () => {
      document.querySelectorAll('.line-svg path, .line-svg circle').forEach((el) => {
        el.style.animation = 'none';
        el.offsetHeight; // reflow
        el.style.animation = '';
      });
    });
  }

  /* 22. Page transitions */
  const txTabs = document.querySelectorAll('.tx-tab');
  const txPanels = document.querySelectorAll('.tx-panel');
  txTabs.forEach((t) => {
    t.addEventListener('click', () => {
      const v = t.dataset.view;
      txTabs.forEach((x) => x.classList.toggle('active', x === t));
      txPanels.forEach((p) => p.classList.toggle('active', p.dataset.view === v));
    });
  });

  /* 24. Skeleton → real */
  const loadBtn = document.getElementById('load-notice');
  const skCard  = document.getElementById('skeleton-card');
  if (loadBtn && skCard) {
    loadBtn.addEventListener('click', () => {
      loadBtn.disabled = true;
      loadBtn.textContent = 'Loading…';
      setTimeout(() => {
        skCard.classList.add('loaded');
        skCard.innerHTML = `
          <span class="sk-tag">ADMISSION</span>
          <h3 class="sk-title">Admissions Open for Academic Year 2026-27</h3>
          <p>Online applications are now being accepted for LKG through Class 11. Limited seats available.</p>
          <p class="sk-short" style="color:var(--ink-500);font-size:13px;margin-top:8px;">15 July 2026</p>
        `;
        loadBtn.textContent = 'Loaded';
      }, 1800);
    });
  }

  /* 27. Neumorphic toggle */
  const neuBtn = document.getElementById('neu-btn');
  const neuToggle = document.getElementById('neu-toggle');
  if (neuBtn) {
    let count = 0;
    neuBtn.addEventListener('click', () => {
      count++;
      neuBtn.textContent = count + (count === 1 ? ' press' : ' presses');
    });
  }
  if (neuToggle) {
    neuToggle.addEventListener('click', () => neuToggle.classList.toggle('on'));
  }

  /* 30. Flipbook */
  const pages = document.querySelectorAll('.flipbook-page');
  const numEl = document.getElementById('fb-num');
  const prevBtn = document.getElementById('fb-prev');
  const nextBtn = document.getElementById('fb-next');
  const playBtn = document.getElementById('fb-play');
  let fbIdx = 0;
  let fbTimer = null;
  function showFb(i) {
    fbIdx = (i + pages.length) % pages.length;
    pages.forEach((p, j) => p.classList.toggle('active', j === fbIdx));
    if (numEl) numEl.textContent = (fbIdx + 1) + ' / ' + pages.length;
  }
  if (prevBtn) prevBtn.addEventListener('click', () => { stopPlay(); showFb(fbIdx - 1); });
  if (nextBtn) nextBtn.addEventListener('click', () => { stopPlay(); showFb(fbIdx + 1); });
  if (playBtn) playBtn.addEventListener('click', () => {
    if (fbTimer) { stopPlay(); return; }
    playBtn.textContent = '⏸ Pause';
    fbTimer = setInterval(() => showFb(fbIdx + 1), 700);
  });
  function stopPlay() {
    if (fbTimer) { clearInterval(fbTimer); fbTimer = null; }
    if (playBtn) playBtn.textContent = '▶ Play';
  }

  /* 31. Stop-motion walk */
  const stopBtn = document.getElementById('stop-walk');
  const stopActor = document.getElementById('stop-actor');
  if (stopBtn && stopActor) {
    stopBtn.addEventListener('click', () => {
      stopActor.classList.remove('walking');
      stopActor.offsetHeight;
      stopActor.classList.add('walking');
      stopBtn.disabled = true;
      setTimeout(() => {
        stopActor.classList.remove('walking');
        stopActor.style.left = '16px';
        stopBtn.disabled = false;
      }, 4100);
    });
  }
})();
