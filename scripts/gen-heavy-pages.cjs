// scripts/gen-heavy-pages.cjs
// Generate all inner pages with the heavy graphical design system.

const fs = require('fs');
const path = require('path');

const PUBLIC = path.resolve(__dirname, '..', 'public');

const TEMPLATE = (data) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${data.title} | Virat Public School</title>
  ${data.description ? `<meta name="description" content="${data.description}" />` : ''}
  <meta name="theme-color" content="#6d3877" />
  <link rel="icon" type="image/svg+xml" href="images/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/style.css?v=7" />
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <div id="vps-topbar"></div>
  <div id="vps-header"></div>

  <main id="main">
    ${data.body}
  </main>

  <div id="vps-footer"></div>

  <script src="js/partials.js?v=6"></script>
  <script src="js/main.js?v=6"></script>
  ${data.extraScript || ''}
</body>
</html>
`;

const PH = (eyebrow, h1, lead) => `
  <section class="page-header">
    <div class="container-wide">
      <span class="section-eyebrow">${eyebrow}</span>
      <h1>${h1}</h1>
      ${lead ? `<p>${lead}</p>` : ''}
    </div>
  </section>
`;

// School icon SVG used in headings
const schoolIcon = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="width:200px;height:200px;display:block;margin:0 auto;">
  <defs>
    <linearGradient id="si-g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#c486cc"/><stop offset="100%" stop-color="#ff7898"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="44" fill="url(#si-g)" opacity="0.15"/>
  <circle cx="50" cy="50" r="32" fill="url(#si-g)" opacity="0.3"/>
  <path d="M22 60 L50 38 L78 60 L78 80 L22 80 Z" fill="url(#si-g)"/>
  <rect x="44" y="66" width="12" height="14" fill="white"/>
  <circle cx="50" cy="73" r="1.5" fill="url(#si-g)"/>
  <rect x="28" y="64" width="8" height="8" fill="white" opacity="0.7"/>
  <rect x="64" y="64" width="8" height="8" fill="white" opacity="0.7"/>
</svg>`;

const pages = [
  // ---- ABOUT ----
  {
    file: 'about.html',
    title: 'About Us',
    description: 'A small, caring school in Virat Nagar, Kotputli. LKG to Class 12, RBSE-affiliated since 2008.',
    body: PH('About us', 'A small school, in a small town,<br>with very big care.', "We've been teaching the children of Virat Nagar and Kotputli since 2008.")
    + `
    <section class="section">
      <div class="container-wide">
        <div style="display:grid;grid-template-columns:1fr;gap:48px;align-items:center;" class="about-grid">
          <div class="prose" style="max-width:none;">
            <p class="reveal">Virat Public School began in 2008, in a two-room building, with twenty-four children and two teachers. The families of Virat Nagar needed a serious English-medium school close to home, and a small group of educators decided to build one.</p>
            <p class="reveal">Today we teach more than twelve hundred students from LKG to Class 12, on a real campus with smart classrooms, science labs, a library, a playground, and our own fleet of buses.</p>
            <p class="reveal">The school is recognised by RBSE. We've had strong board results, year after year. But the thing we are most proud of is harder to measure: that our students leave us a little more kind, a little more confident, and a little more curious than when they arrived.</p>
          </div>
          <div class="reveal-r" style="text-align:center;">
            ${schoolIcon}
          </div>
        </div>
        <style>@media (min-width: 880px) { .about-grid { grid-template-columns: 1.4fr 1fr !important; } }</style>
      </div>
    </section>

    <section class="section section-soft">
      <div class="container-narrow text-center">
        <span class="section-eyebrow reveal">What we believe</span>
        <h2 class="section-title reveal">A few simple things,<br>held for a long time.</h2>
        <div class="value-grid mt-7 stagger">
          <div class="value-card reveal"><span class="vc-num">01</span><h3>Small is good</h3><p>Eighteen students in a class. Teachers who know each child by name, by habit, and by what they're struggling with.</p></div>
          <div class="value-card reveal"><span class="vc-num">02</span><h3>Foundations matter</h3><p>Strong reading, clear writing, real arithmetic. Everything else is built on these.</p></div>
          <div class="value-card reveal"><span class="vc-num">03</span><h3>Discipline, not fear</h3><p>Routines, expectations, and follow-through. The point of discipline is freedom.</p></div>
          <div class="value-card reveal"><span class="vc-num">04</span><h3>Parents are partners</h3><p>We cannot do this work alone. We keep parents close, communicate often, and trust them.</p></div>
        </div>
      </div>
    </section>

    <section class="section section-blush">
      <div class="container-narrow text-center">
        <span class="section-eyebrow reveal">A note from the principal</span>
        <h2 class="section-title reveal">"Every child who walks in<br>is someone's whole world."</h2>
        <p class="reveal" style="font-size:1.15rem;line-height:1.7;">Dear parents, every year we receive the same precious trust — the care of your child, for a few hours each day, for twelve or more years. We hold that trust carefully. We teach them, we watch them grow, and we send them back to you a little more ready for what comes next.</p>
        <p class="reveal" style="font-family:'Fraunces',serif;font-style:italic;font-size:1.15rem;color:var(--plum-700);">— Dr. Meera Singh, Principal</p>
      </div>
    </section>

    <section class="section">
      <div class="container-narrow text-center">
        <span class="section-eyebrow reveal">Our affiliation</span>
        <h2 class="section-title reveal">Recognised by RBSE.</h2>
        <p class="section-sub reveal">Our affiliation number, school code, and other public details are on our disclosures page.</p>
        <a href="disclosures.html" class="btn btn-primary reveal">View disclosures</a>
      </div>
    </section>
    `,
  },

  // ---- INFRASTRUCTURE ----
  {
    file: 'infrastructure.html',
    title: 'Campus',
    description: 'Smart classrooms, labs, library, and playground at Virat Public School.',
    body: PH('Infrastructure', 'Our campus.', 'A working school, built slowly, kept well.')
    + `
    <section class="section">
      <div class="container-wide">
        <div class="value-grid stagger">
          <div class="value-card reveal"><span class="vc-num">36</span><h3>Smart classrooms</h3><p>With projectors and good light, from LKG to Class 12.</p></div>
          <div class="value-card reveal"><span class="vc-num">3</span><h3>Science labs</h3><p>Separate physics, chemistry, and biology labs for senior classes.</p></div>
          <div class="value-card reveal"><span class="vc-num">40</span><h3>Computers</h3><p>Full computer lab with internet and a working printer for students.</p></div>
          <div class="value-card reveal"><span class="vc-num">6k+</span><h3>Library books</h3><p>In Hindi, English, and Sanskrit. Open every school day.</p></div>
          <div class="value-card reveal"><span class="vc-num">1</span><h3>Playground</h3><p>A full-size field for cricket, football, and athletics.</p></div>
          <div class="value-card reveal"><span class="vc-num">12</span><h3>Buses</h3><p>Covering Virat Nagar, Kotputli, Behror, and nearby villages.</p></div>
        </div>
      </div>
    </section>
    `,
  },

  // ---- ADMISSIONS ----
  {
    file: 'admissions.html',
    title: 'Admissions 2026-27',
    description: 'Apply for admission to Virat Public School, Kotputli for the 2026-27 academic year.',
    body: PH('Admissions 2026-27', 'A few seats remain.<br>Apply gently.', 'Online applications for LKG through Class 11. Our office replies within a working day.')
    + `
    <section class="section">
      <div class="container-narrow">
        <div class="prose">
          <h2 class="reveal">How it works</h2>
          <p class="reveal">Four small steps. Nothing dramatic.</p>
          <ol class="reveal">
            <li><strong>Send an inquiry.</strong> Fill the form below — it takes two minutes.</li>
            <li><strong>Visit us.</strong> Come to the campus, see the classrooms, meet the teachers.</li>
            <li><strong>Submit documents.</strong> Birth certificate, previous report card, Aadhaar, four photographs.</li>
            <li><strong>Confirm admission.</strong> Pay the admission fee at the office and collect the books list.</li>
          </ol>
        </div>
      </div>
    </section>

    <section class="section section-soft" id="inquiry">
      <div class="container-narrow">
        <div class="text-center mb-7">
          <span class="section-eyebrow reveal">Inquiry form</span>
          <h2 class="section-title reveal">Tell us about your child.</h2>
          <p class="reveal">We'll get back to you within a working day.</p>
        </div>
        <form id="inquiry-form" class="form reveal" novalidate style="background:white;padding:40px;border-radius:28px;box-shadow:0 12px 48px rgba(106,56,119,0.08);">
          <input class="honeypot" type="text" name="website" tabindex="-1" autocomplete="off" />
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="parent_name">Parent's name</label>
              <input class="form-input" type="text" id="parent_name" name="parent_name" required autocomplete="name" />
            </div>
            <div class="form-group">
              <label class="form-label" for="phone">Phone</label>
              <input class="form-input" type="tel" id="phone" name="phone" required autocomplete="tel" placeholder="10-digit number" inputmode="numeric" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="email">Email <span style="color:var(--ink-500);font-weight:400;">(optional)</span></label>
            <input class="form-input" type="email" id="email" name="email" autocomplete="email" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="student_name">Child's name</label>
              <input class="form-input" type="text" id="student_name" name="student_name" required autocomplete="off" />
            </div>
            <div class="form-group">
              <label class="form-label" for="dob">Child's date of birth <span style="color:var(--ink-500);font-weight:400;">(optional)</span></label>
              <input class="form-input" type="date" id="dob" name="dob" />
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="applying_for">Applying for class</label>
            <select class="form-select" id="applying_for" name="applying_for" required>
              <option value="">Select a class…</option>
              <option>LKG</option><option>UKG</option>
              <option>Class 1</option><option>Class 2</option><option>Class 3</option>
              <option>Class 4</option><option>Class 5</option><option>Class 6</option>
              <option>Class 7</option><option>Class 8</option><option>Class 9</option>
              <option>Class 10</option><option>Class 11</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="message">Anything we should know? <span style="color:var(--ink-500);font-weight:400;">(optional)</span></label>
            <textarea class="form-textarea" id="message" name="message" rows="3" placeholder="Allergies, learning needs, siblings already at VPS…"></textarea>
          </div>
          <button type="submit" class="btn btn-accent btn-lg btn-magnetic" id="submit-btn" style="justify-content:center;">Send inquiry <span class="arrow">→</span></button>
          <p class="form-help text-center">By submitting, you agree to our <a href="privacy.html">privacy policy</a>.</p>
          <div id="form-error" class="form-error-banner" role="alert"></div>
          <div id="form-success" class="form-success" role="status">
            <strong>Thank you.</strong> We've received your note and will reply within a working day.
          </div>
        </form>
      </div>
    </section>

    <section class="section">
      <div class="container-narrow">
        <div class="prose">
          <h2 class="reveal">What to bring on visit day</h2>
          <ul class="reveal">
            <li>Birth certificate of the child (original + photocopy)</li>
            <li>Previous year's report card (if applicable)</li>
            <li>Aadhaar card of parent and child</li>
            <li>Four recent passport-size photographs</li>
            <li>Transfer certificate (for Class 2 and above)</li>
          </ul>
          <p class="reveal">For fee details, see our <a href="admissions-fee.html">fee structure</a>.</p>
        </div>
      </div>
    </section>
    `,
    extraScript: `<script>
    (function () {
      const form = document.getElementById('inquiry-form');
      const btn = document.getElementById('submit-btn');
      const errBox = document.getElementById('form-error');
      const okBox = document.getElementById('form-success');
      function showError(msg) { errBox.textContent = msg; errBox.classList.add('show'); okBox.classList.remove('show'); errBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      const phoneEl = document.getElementById('phone');
      phoneEl.addEventListener('input', () => { phoneEl.value = phoneEl.value.replace(/\\D/g, '').slice(-10); phoneEl.setAttribute('aria-invalid', 'false'); });
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errBox.classList.remove('show');
        form.querySelectorAll('[aria-invalid="true"]').forEach(el => el.setAttribute('aria-invalid', 'false'));
        const data = Object.fromEntries(new FormData(form));
        if (!data.parent_name)  { showError('Please tell us the parent\\'s name.'); document.getElementById('parent_name').setAttribute('aria-invalid','true'); return; }
        if (!data.student_name) { showError('Please tell us the child\\'s name.'); document.getElementById('student_name').setAttribute('aria-invalid','true'); return; }
        if (!data.applying_for) { showError('Please choose a class.'); document.getElementById('applying_for').setAttribute('aria-invalid','true'); return; }
        if (!data.phone)         { showError('Please share a phone number.'); document.getElementById('phone').setAttribute('aria-invalid','true'); return; }
        if (!/^[6-9]\\d{9}$/.test(data.phone)) { showError('Phone number must be 10 digits, starting with 6, 7, 8 or 9.'); document.getElementById('phone').setAttribute('aria-invalid','true'); return; }
        if (data.email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data.email)) { showError('Please enter a valid email.'); document.getElementById('email').setAttribute('aria-invalid','true'); return; }
        btn.disabled = true; btn.textContent = 'Sending…';
        try {
          const r = await fetch('/api/inquiries', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
          const out = await r.json().catch(() => ({}));
          if (r.ok && out.ok) { okBox.classList.add('show'); form.reset(); okBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
          else { showError(out.error || 'Could not send (' + r.status + '). Please call +91 90000 00000.'); }
        } catch (err) { showError('Network error. Please try again or call +91 90000 00000.'); }
        finally { btn.disabled = false; btn.textContent = 'Send inquiry'; }
      });
    })();
    </script>`,
  },

  // ---- ADMISSIONS FEE ----
  {
    file: 'admissions-fee.html',
    title: 'Fee Structure',
    body: PH('Fees', 'Fee structure.', 'Transparent. Published. The same for everyone.')
    + `
    <section class="section">
      <div class="container-narrow">
        <div class="table-wrap reveal">
          <table class="table">
            <thead><tr><th>Class</th><th>Tuition (₹/month)</th><th>Annual (₹)</th></tr></thead>
            <tbody>
              <tr><td>LKG – UKG</td><td>1,200</td><td>3,000</td></tr>
              <tr><td>Class 1 – 5</td><td>1,500</td><td>4,000</td></tr>
              <tr><td>Class 6 – 8</td><td>1,800</td><td>5,000</td></tr>
              <tr><td>Class 9 – 10</td><td>2,200</td><td>6,000</td></tr>
              <tr><td>Class 11 – 12</td><td>2,600</td><td>7,000</td></tr>
            </tbody>
          </table>
        </div>
        <p class="text-center mt-7 reveal" style="color:var(--ink-500);">Transport, books, and uniform are charged separately. Sibling and need-based concessions are available — please ask the office.</p>
        <div class="text-center mt-7 reveal">
          <a href="admissions.html" class="btn btn-accent btn-magnetic">Apply now <span class="arrow">→</span></a>
        </div>
      </div>
    </section>
    `,
  },

  {
    file: 'admissions-thank-you.html',
    title: 'Thank you',
    body: PH('Thank you', "We've received your note.", 'Our office will be in touch within a working day.')
    + `<section class="section"><div class="container-narrow text-center"><a href="index.html" class="btn btn-primary reveal">Back to home</a></div></section>`,
  },

  // ---- FACULTY ----
  {
    file: 'faculty.html',
    title: 'Faculty',
    description: 'Meet the teachers and staff of Virat Public School, Kotputli.',
    body: PH('Faculty', 'The people who teach here.', 'Sixty-five teachers. Many of them have been with us for over a decade.')
    + `
    <section class="section">
      <div class="container-wide">
        <div id="faculty-list" class="faculty-grid stagger">
          <p class="text-center" style="grid-column:1/-1;color:var(--ink-500);">Loading…</p>
        </div>
      </div>
    </section>
    `,
    extraScript: `<script>
    (async () => {
      const el = document.getElementById('faculty-list');
      try {
        const r = await fetch('/api/faculty');
        if (!r.ok) throw new Error('fetch failed');
        const d = await r.json();
        const list = (d && (d.faculty || d.results)) || [];
        if (!list.length) { el.innerHTML = '<p class="text-center" style="grid-column:1/-1;color:var(--ink-500);">No faculty listed yet.</p>'; return; }
        el.innerHTML = list.map(f => {
          const initials = (f.name || '').split(' ').map(p => p[0]).slice(0, 2).join('').toUpperCase();
          return \`<div class="faculty-card reveal">
            <div class="faculty-avatar">\${initials}</div>
            <h3>\${esc(f.name)}</h3>
            <p class="role">\${esc(f.designation || 'Teacher')}</p>
            <p class="meta">\${esc(f.department || '')}\${f.qualification ? ' · ' + esc(f.qualification) : ''}</p>
          </div>\`;
        }).join('');
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { el.classList.add('in'); io.disconnect(); } }, { threshold: 0.1 });
          io.observe(el);
        } else { el.classList.add('in'); }
      } catch (e) {
        el.innerHTML = '<p class="text-center" style="grid-column:1/-1;color:var(--ink-500);">Could not load faculty right now.</p>';
      }
      function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
    })();
    </script>`,
  },

  // ---- GALLERY ----
  {
    file: 'gallery.html',
    title: 'Gallery',
    description: 'Photos from the life of Virat Public School.',
    body: PH('Gallery', 'Moments from school life.', 'Classrooms, grounds, annual day, sports day, science fairs.')
    + `
    <section class="section">
      <div class="container-wide">
        <div id="gallery-list" class="album-grid stagger">
          <p class="text-center" style="grid-column:1/-1;color:var(--ink-500);">Loading albums…</p>
        </div>
      </div>
    </section>
    `,
    extraScript: `<script>
    (async () => {
      const el = document.getElementById('gallery-list');
      try {
        const r = await fetch('/api/gallery?limit=50');
        if (!r.ok) throw new Error('fetch failed');
        const d = await r.json();
        const list = (d && (d.albums || d.results)) || [];
        if (!list.length) { el.innerHTML = '<p class="text-center" style="grid-column:1/-1;color:var(--ink-500);">No albums yet.</p>'; return; }
        el.innerHTML = list.map((a, i) => {
          const date = a.event_date ? new Date(a.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
          return \`<a href="album.html?slug=\${encodeURIComponent(a.slug)}" class="album-card reveal">
            <div class="album-thumb">\${window.albumSVG ? window.albumSVG(['plum','sky','rose','mix'][i % 4]) : ''}</div>
            <div class="album-body">
              <h3>\${esc(a.title)}</h3>
              <p>\${esc(date)}</p>
            </div>
          </a>\`;
        }).join('');
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { el.classList.add('in'); io.disconnect(); } }, { threshold: 0.05 });
          io.observe(el);
        } else { el.classList.add('in'); }
      } catch (e) {
        el.innerHTML = '<p class="text-center" style="grid-column:1/-1;color:var(--ink-500);">Could not load albums.</p>';
      }
      function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
    })();
    </script>`,
  },

  // ---- ALBUM ----
  {
    file: 'album.html',
    title: 'Album',
    body: `
    <section class="page-header">
      <div class="container-narrow">
        <a href="gallery.html" style="color:var(--plum-600);font-size:14px;">← All albums</a>
        <h1 id="album-title" class="mt-4" style="margin-top:16px;">Loading…</h1>
        <p id="album-date" style="color:var(--ink-500);"></p>
      </div>
    </section>
    <section class="section">
      <div class="container-wide">
        <div id="album-photos" class="album-grid stagger">
          <p class="text-center" style="grid-column:1/-1;color:var(--ink-500);">Loading…</p>
        </div>
      </div>
    </section>
    `,
    extraScript: `<script>
    (async () => {
      const slug = new URLSearchParams(location.search).get('slug');
      try {
        const r = await fetch('/api/gallery/' + encodeURIComponent(slug || ''));
        if (!r.ok) throw new Error('fetch failed');
        const a = await r.json();
        document.getElementById('album-title').textContent = a.title;
        const date = a.event_date ? new Date(a.event_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
        document.getElementById('album-date').textContent = date;
        document.title = a.title + ' | Gallery';
        const photos = a.photos || [];
        const el = document.getElementById('album-photos');
        if (!photos.length) {
          el.innerHTML = '<p class="text-center" style="grid-column:1/-1;color:var(--ink-500);">No photos in this album yet.</p>';
        } else {
          el.innerHTML = photos.map((p, i) => \`<div class="album-card reveal"><div class="album-thumb">\${window.albumSVG ? window.albumSVG(['plum','sky','rose','mix'][i % 4]) : ''}</div>\${p.caption ? '<div class="album-body"><p>' + esc(p.caption) + '</p></div>' : ''}</div>\`).join('');
        }
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { el.classList.add('in'); io.disconnect(); } }, { threshold: 0.05 });
          io.observe(el);
        } else { el.classList.add('in'); }
      } catch (e) {
        document.getElementById('album-title').textContent = 'Album not found';
        document.getElementById('album-photos').innerHTML = '<p class="text-center" style="grid-column:1/-1;">This album may have been removed.</p>';
      }
      function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
    })();
    </script>`,
  },

  // ---- NOTICES ----
  {
    file: 'notices.html',
    title: 'Notices',
    description: 'Latest notices and announcements from Virat Public School.',
    body: PH('Notices', "What's happening at school.", 'Holiday lists, exam dates, PTM schedules, and other announcements.')
    + `
    <section class="section">
      <div class="container-wide" style="max-width:800px;">
        <div id="notices-list" class="notice-list stagger">
          <p class="text-center" style="color:var(--ink-500);">Loading…</p>
        </div>
      </div>
    </section>
    `,
    extraScript: `<script>
    (async () => {
      const el = document.getElementById('notices-list');
      try {
        const r = await fetch('/api/notices?limit=50');
        if (!r.ok) throw new Error('fetch failed');
        const d = await r.json();
        const list = (d && (d.notices || d.results)) || [];
        if (!list.length) { el.innerHTML = '<p class="text-center" style="color:var(--ink-500);">No notices yet.</p>'; return; }
        el.innerHTML = list.map(n => {
          const date = n.publish_date || n.published_at || n.created_at;
          const dObj = date ? new Date(date) : null;
          const day  = dObj ? dObj.getDate() : '';
          const mon  = dObj ? dObj.toLocaleString('en-IN', { month: 'short' }) : '';
          return \`<a href="notice-detail.html?id=\${encodeURIComponent(n.id)}" class="notice-item reveal">
            <div class="notice-date"><div class="day">\${day}</div><div class="mon">\${mon}</div></div>
            <div class="notice-body">
              <span class="notice-tag">\${esc(n.category || 'Notice')}</span>
              <h3>\${esc(n.title)}</h3>
              <div class="notice-meta">\${esc(date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '')}</div>
            </div>
          </a>\`;
        }).join('');
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { el.classList.add('in'); io.disconnect(); } }, { threshold: 0.05 });
          io.observe(el);
        } else { el.classList.add('in'); }
      } catch (e) {
        el.innerHTML = '<p class="text-center" style="color:var(--ink-500);">Could not load notices.</p>';
      }
      function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
    })();
    </script>`,
  },

  {
    file: 'notice-detail.html',
    title: 'Notice',
    body: `
    <section class="page-header">
      <div class="container-narrow">
        <a href="notices.html" style="color:var(--plum-600);font-size:14px;">← All notices</a>
        <span class="section-eyebrow mt-5" id="notice-category" style="display:block;margin-top:16px;">Notice</span>
        <h1 id="notice-title" class="mt-4" style="margin-top:16px;">Loading…</h1>
        <p id="notice-date" style="color:var(--ink-500);font-size:14px;"></p>
      </div>
    </section>
    <section class="section">
      <div class="container-narrow">
        <article id="notice-body" class="prose" style="background:white;padding:40px;border-radius:28px;box-shadow:0 12px 48px rgba(106,56,119,0.08);">
          <p style="color:var(--ink-500);">Loading…</p>
        </article>
      </div>
    </section>
    `,
    extraScript: `<script>
    (async () => {
      const id = new URLSearchParams(location.search).get('id');
      if (!id) { document.getElementById('notice-title').textContent = 'Notice not found'; return; }
      try {
        const r = await fetch('/api/notices/' + encodeURIComponent(id));
        if (!r.ok) throw new Error('fetch failed');
        const n = await r.json();
        document.getElementById('notice-category').textContent = n.category || 'Notice';
        document.getElementById('notice-title').textContent = n.title;
        const date = n.publish_date || n.published_at || n.created_at;
        document.getElementById('notice-date').textContent = date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
        document.getElementById('notice-body').innerHTML = n.body || n.excerpt || '';
        document.title = n.title + ' | Virat Public School';
      } catch (e) {
        document.getElementById('notice-title').textContent = 'Notice not found';
        document.getElementById('notice-body').innerHTML = '<p>This notice may have been removed or the link is wrong.</p><a href="notices.html" class="btn btn-ghost">View all notices</a>';
      }
    })();
    </script>`,
  },

  {
    file: 'notices-archive.html',
    title: 'Notice archive',
    body: PH('Archive', 'Older notices.', 'Notices from earlier in the year.')
    + `<section class="section"><div class="container-narrow"><p class="reveal" style="color:var(--ink-500);">Looking for a specific circular or announcement? <a href="notices.html">See the current notices</a>, or contact the office.</p></div></section>`,
  },

  // ---- RESULTS ----
  {
    file: 'results.html',
    title: 'Results',
    body: PH('Results', 'Check your result.', 'Enter your roll number and date of birth to see your marks.')
    + `
    <section class="section">
      <div class="container-narrow">
        <form id="result-form" class="form reveal" style="background:white;padding:40px;border-radius:28px;box-shadow:0 12px 48px rgba(106,56,119,0.08);">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label" for="roll">Roll number</label>
              <input class="form-input" type="text" id="roll" name="roll" placeholder="e.g. 10-001" required />
            </div>
            <div class="form-group">
              <label class="form-label" for="dob">Date of birth</label>
              <input class="form-input" type="date" id="dob" name="dob" required />
            </div>
          </div>
          <button type="submit" class="btn btn-accent btn-lg btn-magnetic" style="justify-content:center;">View result <span class="arrow">→</span></button>
          <p class="form-help text-center">Sample: roll <code>10-001</code>, dob <code>2011-04-12</code></p>
        </form>
        <div id="result-out" class="mt-7"></div>
      </div>
    </section>
    `,
    extraScript: `<script>
    document.getElementById('result-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const out = document.getElementById('result-out');
      const roll = document.getElementById('roll').value;
      const dob = document.getElementById('dob').value;
      out.innerHTML = '<p class="text-center" style="color:var(--ink-500);">Looking up…</p>';
      try {
        const r = await fetch('/api/results/lookup?roll=' + encodeURIComponent(roll) + '&dob=' + encodeURIComponent(dob));
        const d = await r.json();
        if (!r.ok || d.error) { out.innerHTML = '<div class="form-error-banner show">No result found. Check your roll number and date of birth.</div>'; return; }
        const s = d.student || {};
        const marks = d.marks || [];
        out.innerHTML = \`<div class="table-wrap">
          <h3 style="margin-bottom:8px;">\${esc(s.name || '')}</h3>
          <p style="color:var(--ink-500);font-size:13px;margin-bottom:16px;">Class \${esc(s.class || '')} · Roll \${esc(s.roll || roll)}</p>
          <table class="table">
            <thead><tr><th>Subject</th><th>Marks</th><th>Grade</th></tr></thead>
            <tbody>\${marks.map(m => \`<tr><td>\${esc(m.subject)}</td><td>\${esc(String(m.marks))}</td><td>\${esc(m.grade || '')}</td></tr>\`).join('')}</tbody>
          </table>
          <p style="margin-top:16px;color:var(--plum-700);font-weight:600;">Total: \${esc(String(d.total || marks.reduce((a,b) => a + Number(b.marks||0), 0)))}</p>
        </div>\`;
      } catch (err) { out.innerHTML = '<div class="form-error-banner show">Could not reach the server. Please try again.</div>'; }
    });
    function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
    </script>`,
  },

  // ---- EVENTS ----
  {
    file: 'events.html',
    title: 'Events Calendar',
    body: PH('Events', "What's coming up.", 'A few notes about the year ahead.')
    + `
    <section class="section">
      <div class="container-narrow">
        <div class="stack-lg stagger" style="display:flex;flex-direction:column;gap:16px;">
          <div class="card reveal"><h3>15 August 2026</h3><p>Independence Day assembly and student performances.</p></div>
          <div class="card reveal"><h3>14 November 2026</h3><p>Children's Day — classrooms run by students for a day.</p></div>
          <div class="card reveal"><h3>26 January 2027</h3><p>Republic Day parade and flag-hoisting.</p></div>
          <div class="card reveal"><h3>February 2027</h3><p>Annual Day and inter-house science exhibition.</p></div>
          <div class="card reveal"><h3>March 2027</h3><p>Annual sports meet and prize distribution.</p></div>
        </div>
      </div>
    </section>
    `,
  },

  // ---- HOLIDAYS ----
  {
    file: 'holidays.html',
    title: 'Holiday List',
    body: PH('Holidays', 'Holiday list 2026-27.', 'The school is closed on these days.')
    + `
    <section class="section">
      <div class="container-narrow">
        <div id="holidays-list" class="stack-lg stagger" style="display:flex;flex-direction:column;gap:12px;">
          <p class="text-center" style="color:var(--ink-500);">Loading…</p>
        </div>
      </div>
    </section>
    `,
    extraScript: `<script>
    (async () => {
      const el = document.getElementById('holidays-list');
      try {
        const r = await fetch('/api/holidays');
        const d = await r.json();
        const list = (d && (d.holidays || d.results)) || [];
        if (!list.length) { el.innerHTML = '<p class="text-center" style="color:var(--ink-500);">No holidays published yet.</p>'; return; }
        el.innerHTML = list.map(h => {
          const date = h.holiday_date ? new Date(h.holiday_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
          return \`<div class="card reveal"><h3>\${esc(date)}</h3><p>\${esc(h.name || '')}\${h.type ? ' · <span style="color:var(--ink-500);font-size:13px;">' + esc(h.type) + '</span>' : ''}</p></div>\`;
        }).join('');
        if ('IntersectionObserver' in window) {
          const io = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { el.classList.add('in'); io.disconnect(); } }, { threshold: 0.05 });
          io.observe(el);
        } else { el.classList.add('in'); }
      } catch (e) {
        el.innerHTML = '<p class="text-center" style="color:var(--ink-500);">Could not load holidays.</p>';
      }
      function esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
    })();
    </script>`,
  },

  // ---- CONTACT ----
  {
    file: 'contact.html',
    title: 'Contact',
    body: PH('Contact', 'Come and say hello.', 'Office hours are 8 AM to 4 PM, Monday to Saturday.')
    + `
    <section class="section">
      <div class="container-wide">
        <div style="display:grid;grid-template-columns:1fr;gap:16px;" class="contact-grid stagger">
          <div class="card reveal" style="text-align:center;"><h3 style="color:var(--plum-700);margin-bottom:8px;">Visit</h3><p style="margin:0;font-size:14px;">Virat Nagar, Kotputli<br>Behror, Rajasthan — 303102</p></div>
          <div class="card reveal" style="text-align:center;"><h3 style="color:var(--plum-700);margin-bottom:8px;">Call</h3><p style="margin:0;font-size:14px;"><a href="tel:+919000000000">+91 90000 00000</a></p></div>
          <div class="card reveal" style="text-align:center;"><h3 style="color:var(--plum-700);margin-bottom:8px;">Email</h3><p style="margin:0;font-size:14px;"><a href="mailto:office@viratpublicschool.in">office@viratpublicschool.in</a></p></div>
        </div>
        <style>@media (min-width: 720px) { .contact-grid { grid-template-columns: repeat(3, 1fr) !important; } }</style>
      </div>
    </section>
    <section class="section section-soft">
      <div class="container-narrow">
        <div class="text-center mb-7">
          <span class="section-eyebrow reveal">Write to us</span>
          <h2 class="section-title reveal">Send us a message.</h2>
          <p class="reveal">We'll get back within a working day.</p>
        </div>
        <form id="contact-form" class="form reveal" novalidate style="background:white;padding:40px;border-radius:28px;box-shadow:0 12px 48px rgba(106,56,119,0.08);">
          <input class="honeypot" type="text" name="website" tabindex="-1" autocomplete="off" />
          <div class="form-row">
            <div class="form-group"><label class="form-label" for="name">Your name</label><input class="form-input" type="text" id="name" name="name" required autocomplete="name" /></div>
            <div class="form-group"><label class="form-label" for="email">Email</label><input class="form-input" type="email" id="email" name="email" required autocomplete="email" /></div>
          </div>
          <div class="form-group"><label class="form-label" for="phone">Phone <span style="color:var(--ink-500);font-weight:400;">(optional)</span></label><input class="form-input" type="tel" id="phone" name="phone" autocomplete="tel" /></div>
          <div class="form-group"><label class="form-label" for="subject">Subject</label><input class="form-input" type="text" id="subject" name="subject" required /></div>
          <div class="form-group"><label class="form-label" for="message">Message</label><textarea class="form-textarea" id="message" name="message" rows="5" required></textarea></div>
          <button type="submit" class="btn btn-accent btn-lg btn-magnetic" id="contact-btn" style="justify-content:center;">Send message <span class="arrow">→</span></button>
          <div id="form-error" class="form-error-banner" role="alert"></div>
          <div id="form-success" class="form-success" role="status"><strong>Thank you.</strong> Your message is on its way. We'll reply within a working day.</div>
        </form>
      </div>
    </section>
    `,
    extraScript: `<script>
    (function () {
      const form = document.getElementById('contact-form');
      const btn = document.getElementById('contact-btn');
      const errBox = document.getElementById('form-error');
      const okBox = document.getElementById('form-success');
      function showError(msg) { errBox.textContent = msg; errBox.classList.add('show'); okBox.classList.remove('show'); errBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errBox.classList.remove('show');
        form.querySelectorAll('[aria-invalid="true"]').forEach(el => el.setAttribute('aria-invalid', 'false'));
        const data = Object.fromEntries(new FormData(form));
        if (!data.name) { showError('Please tell us your name.'); document.getElementById('name').setAttribute('aria-invalid','true'); return; }
        if (!data.email) { showError('Please share your email.'); document.getElementById('email').setAttribute('aria-invalid','true'); return; }
        if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data.email)) { showError('Please enter a valid email.'); document.getElementById('email').setAttribute('aria-invalid','true'); return; }
        if (!data.subject) { showError('Please add a subject.'); document.getElementById('subject').setAttribute('aria-invalid','true'); return; }
        if (!data.message) { showError('Please write a short message.'); document.getElementById('message').setAttribute('aria-invalid','true'); return; }
        btn.disabled = true; btn.textContent = 'Sending…';
        try {
          const r = await fetch('/api/contact', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
          const out = await r.json().catch(() => ({}));
          if (r.ok && (out.ok || out === undefined)) { okBox.classList.add('show'); form.reset(); okBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
          else { showError(out.error || 'Could not send (' + r.status + '). Please try again.'); }
        } catch (err) { showError('Network error. Please try again.'); }
        finally { btn.disabled = false; btn.textContent = 'Send message'; }
      });
    })();
    </script>`,
  },

  // ---- DISCLOSURES ----
  {
    file: 'disclosures.html',
    title: 'Mandatory Disclosures',
    body: PH('Disclosures', 'Mandatory disclosures.', 'Information published as required by RBSE norms.')
    + `
    <section class="section">
      <div class="container-narrow">
        <div class="table-wrap reveal">
          <table class="table">
            <tbody>
              <tr><th>School name</th><td>Virat Public School</td></tr>
              <tr><th>Affiliation No.</th><td>1234567</td></tr>
              <tr><th>School Code</th><td>98765</td></tr>
              <tr><th>Board</th><td>Rajasthan Board of Secondary Education (RBSE)</td></tr>
              <tr><th>Address</th><td>Virat Nagar, Kotputli, Behror, Rajasthan — 303102</td></tr>
              <tr><th>Principal</th><td>Dr. Meera Singh, M.A., M.Ed., Ph.D.</td></tr>
              <tr><th>Established</th><td>2008</td></tr>
              <tr><th>Total students</th><td>1,200+</td></tr>
              <tr><th>Total teachers</th><td>65</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
    `,
  },

  {
    file: 'privacy.html',
    title: 'Privacy Policy',
    body: PH('Privacy', 'Privacy policy.', 'How we handle the information you share with us.')
    + `
    <section class="section"><div class="container-narrow"><div class="prose">
      <p class="reveal">We collect only the information you give us — through admission forms, inquiry forms, and contact messages. We use it to respond to you, run the school, and keep you informed about your child's education.</p>
      <h2 class="reveal">What we collect</h2>
      <p class="reveal">Names, contact details, dates of birth, previous school records, and any messages you send us.</p>
      <h2 class="reveal">What we don't do</h2>
      <p class="reveal">We don't sell your data. We don't share it with third parties for marketing.</p>
      <h2 class="reveal">Your rights</h2>
      <p class="reveal">You can ask to see, correct, or delete the information we hold about your family. Write to us at <a href="mailto:office@viratpublicschool.in">office@viratpublicschool.in</a>.</p>
    </div></div></section>
    `,
  },

  {
    file: 'terms.html',
    title: 'Terms of Use',
    body: PH('Terms', 'Terms of use.', 'A few ground rules for using this website.')
    + `
    <section class="section"><div class="container-narrow"><div class="prose">
      <p class="reveal">By using this website, you agree to use it for personal, non-commercial purposes. Information published here is meant to help families learn about our school.</p>
      <h2 class="reveal">Accuracy</h2>
      <p class="reveal">We do our best to keep notices, results, and other published information accurate. If you spot something wrong, please tell us.</p>
      <h2 class="reveal">External links</h2>
      <p class="reveal">Where we link to other sites, we don't control their content.</p>
    </div></div></section>
    `,
  },

  {
    file: 'accessibility.html',
    title: 'Accessibility',
    body: PH('Accessibility', 'Accessibility.', 'We want this site to be usable for everyone.')
    + `
    <section class="section"><div class="container-narrow"><div class="prose">
      <p class="reveal">This site follows WCAG 2.1 AA guidelines. It works on screen readers, can be navigated by keyboard, and resizes gracefully for small screens.</p>
      <p class="reveal">If something is hard to use, please tell us at <a href="mailto:office@viratpublicschool.in">office@viratpublicschool.in</a> and we'll fix it.</p>
    </div></div></section>
    `,
  },

  {
    file: 'sitemap.html',
    title: 'Sitemap',
    body: PH('Sitemap', 'Sitemap.', 'A simple list of every page on this site.')
    + `
    <section class="section"><div class="container-narrow"><div class="prose"><ul>
      <li><a href="index.html">Home</a></li>
      <li><a href="about.html">About us</a></li>
      <li><a href="infrastructure.html">Campus</a></li>
      <li><a href="faculty.html">Faculty</a></li>
      <li><a href="admissions.html">Admissions</a></li>
      <li><a href="admissions-fee.html">Fee structure</a></li>
      <li><a href="results.html">Results</a></li>
      <li><a href="gallery.html">Gallery</a></li>
      <li><a href="notices.html">Notices</a></li>
      <li><a href="events.html">Events</a></li>
      <li><a href="holidays.html">Holidays</a></li>
      <li><a href="contact.html">Contact</a></li>
      <li><a href="disclosures.html">Disclosures</a></li>
      <li><a href="privacy.html">Privacy</a></li>
      <li><a href="terms.html">Terms</a></li>
      <li><a href="accessibility.html">Accessibility</a></li>
    </ul></div></div></section>
    `,
  },

  {
    file: '404.html',
    title: 'Page not found',
    body: PH('404', "This page doesn't exist.", 'But here are some places you might want to go:')
    + `<section class="section"><div class="container-narrow text-center"><div class="flex reveal" style="justify-content:center;"><a href="index.html" class="btn btn-primary">Home</a><a href="admissions.html" class="btn btn-ghost">Admissions</a><a href="contact.html" class="btn btn-ghost">Contact</a></div></div></section>`,
  },
];

for (const p of pages) {
  const html = TEMPLATE(p);
  fs.writeFileSync(path.join(PUBLIC, p.file), html);
  console.log('wrote', p.file);
}
console.log('Done. ' + pages.length + ' pages regenerated.');
