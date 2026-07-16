// scripts/gen-pages.cjs
// Generate clean, soft inner pages from a simple spec.

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
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <div id="vps-topbar"></div>
  <div id="vps-header"></div>

  <main id="main">

    <section class="page-header">
      <div class="container-wide">
        <span class="section-eyebrow">${data.eyebrow}</span>
        <h1>${data.h1}</h1>
        ${data.lead ? `<p>${data.lead}</p>` : ''}
      </div>
    </section>

    ${data.body}

  </main>

  <div id="vps-footer"></div>

  <script src="js/partials.js?v=2"></script>
  <script src="js/main.js?v=2"></script>
  ${data.extraScript || ''}
</body>
</html>
`;

// ===== Pages =====

const pages = [
  {
    file: 'infrastructure.html',
    title: 'Campus',
    description: 'Smart classrooms, labs, library, and playground at Virat Public School.',
    eyebrow: 'Infrastructure',
    h1: 'Our campus.',
    lead: 'A working school, built slowly, kept well.',
    body: `
    <section class="section">
      <div class="container-narrow">
        <div class="prose">
          <p>Our campus sits on the Kotputli–Behror road, with a quiet main building, open courtyards, and a large playground. Everything here is built to be used — not just looked at.</p>
        </div>
      </div>
    </section>
    <section class="section section-soft">
      <div class="container-wide">
        <div class="value-grid">
          <div class="value-card"><h3>Smart classrooms</h3><p>Thirty-six classrooms with projectors and good light.</p></div>
          <div class="value-card"><h3>Science labs</h3><p>Separate physics, chemistry, and biology labs for senior classes.</p></div>
          <div class="value-card"><h3>Computer lab</h3><p>Forty computers, internet, and a working printer for students.</p></div>
          <div class="value-card"><h3>Library</h3><p>Over six thousand books, in Hindi, English, and Sanskrit.</p></div>
          <div class="value-card"><h3>Playground</h3><p>A full-size field for cricket, football, and athletics.</p></div>
          <div class="value-card"><h3>Transport</h3><p>Twelve buses covering Virat Nagar, Kotputli, Behror, and nearby villages.</p></div>
        </div>
      </div>
    </section>`,
  },

  {
    file: 'admissions-fee.html',
    title: 'Fee Structure',
    description: 'Transparent fee structure for Virat Public School, Kotputli.',
    eyebrow: 'Fees',
    h1: 'Fee structure.',
    lead: 'Transparent. Published. The same for everyone.',
    body: `
    <section class="section">
      <div class="container-narrow">
        <div class="table-wrap">
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
        <p class="text-center mt-5" style="color:var(--color-text-mute);">Transport, books, and uniform are charged separately. Sibling and need-based concessions are available — please ask the office.</p>
        <div class="text-center mt-6">
          <a href="admissions.html" class="btn btn-accent">Apply now</a>
        </div>
      </div>
    </section>`,
  },

  {
    file: 'events.html',
    title: 'Events Calendar',
    description: 'Upcoming events at Virat Public School, Kotputli.',
    eyebrow: 'Events',
    h1: 'What\'s coming up.',
    lead: 'A few notes about the year ahead.',
    body: `
    <section class="section">
      <div class="container-narrow">
        <div class="stack-lg">
          <div class="card">
            <h3>15 August 2026</h3>
            <p>Independence Day assembly and student performances.</p>
          </div>
          <div class="card">
            <h3>14 November 2026</h3>
            <p>Children's Day — classrooms run by students for a day.</p>
          </div>
          <div class="card">
            <h3>26 January 2027</h3>
            <p>Republic Day parade and flag-hoisting.</p>
          </div>
          <div class="card">
            <h3>February 2027</h3>
            <p>Annual Day and inter-house science exhibition.</p>
          </div>
          <div class="card">
            <h3>March 2027</h3>
            <p>Annual sports meet and prize distribution.</p>
          </div>
        </div>
      </div>
    </section>`,
  },

  {
    file: 'holidays.html',
    title: 'Holiday List',
    description: 'School holiday list for the academic year.',
    eyebrow: 'Holidays',
    h1: 'Holiday list 2026-27.',
    lead: 'The school is closed on these days.',
    body: `
    <section class="section">
      <div class="container-narrow">
        <div id="holidays-list" class="stack-lg">
          <p class="text-center" style="color:var(--color-text-mute);">Loading…</p>
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
        if (!d.results || !d.results.length) {
          el.innerHTML = '<p class="text-center" style="color:var(--color-text-mute);">No holidays published yet.</p>';
          return;
        }
        el.innerHTML = d.results.map(h => {
          const date = h.holiday_date ? new Date(h.holiday_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
          return '<div class="card"><h3>' + date + '</h3><p>' + (h.name || '') + (h.type ? ' · <span style="color:var(--color-text-mute);font-size:13px;">' + h.type + '</span>' : '') + '</p></div>';
        }).join('');
      } catch (e) {
        el.innerHTML = '<p class="text-center" style="color:var(--color-text-mute);">Could not load holidays.</p>';
      }
    })();
    </script>`,
  },

  {
    file: 'disclosures.html',
    title: 'Mandatory Disclosures',
    description: 'Mandatory public disclosures for Virat Public School, Kotputli.',
    eyebrow: 'Disclosures',
    h1: 'Mandatory disclosures.',
    lead: 'Information published as required by RBSE norms.',
    body: `
    <section class="section">
      <div class="container-narrow">
        <div class="table-wrap">
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
    </section>`,
  },

  {
    file: 'privacy.html',
    title: 'Privacy Policy',
    eyebrow: 'Privacy',
    h1: 'Privacy policy.',
    lead: 'How we handle the information you share with us.',
    body: `
    <section class="section">
      <div class="container-narrow">
        <div class="prose">
          <p>We collect only the information you give us — through admission forms, inquiry forms, and contact messages. We use it to respond to you, run the school, and keep you informed about your child's education.</p>
          <h2>What we collect</h2>
          <p>Names, contact details, dates of birth, previous school records, and any messages you send us.</p>
          <h2>What we don't do</h2>
          <p>We don't sell your data. We don't share it with third parties for marketing.</p>
          <h2>Your rights</h2>
          <p>You can ask to see, correct, or delete the information we hold about your family. Write to us at <a href="mailto:office@viratpublicschool.in">office@viratpublicschool.in</a>.</p>
        </div>
      </div>
    </section>`,
  },

  {
    file: 'terms.html',
    title: 'Terms of Use',
    eyebrow: 'Terms',
    h1: 'Terms of use.',
    lead: 'A few ground rules for using this website.',
    body: `
    <section class="section">
      <div class="container-narrow">
        <div class="prose">
          <p>By using this website, you agree to use it for personal, non-commercial purposes. Information published here is meant to help families learn about our school.</p>
          <h2>Accuracy</h2>
          <p>We do our best to keep notices, results, and other published information accurate. If you spot something wrong, please tell us.</p>
          <h2>External links</h2>
          <p>Where we link to other sites, we don't control their content.</p>
        </div>
      </div>
    </section>`,
  },

  {
    file: 'accessibility.html',
    title: 'Accessibility',
    eyebrow: 'Accessibility',
    h1: 'Accessibility.',
    lead: 'We want this site to be usable for everyone.',
    body: `
    <section class="section">
      <div class="container-narrow">
        <div class="prose">
          <p>This site follows WCAG 2.1 AA guidelines. It works on screen readers, can be navigated by keyboard, and resizes gracefully for small screens.</p>
          <p>If something is hard to use, please tell us at <a href="mailto:office@viratpublicschool.in">office@viratpublicschool.in</a> and we'll fix it.</p>
        </div>
      </div>
    </section>`,
  },

  {
    file: 'sitemap.html',
    title: 'Sitemap',
    eyebrow: 'Sitemap',
    h1: 'Sitemap.',
    lead: 'A simple list of every page on this site.',
    body: `
    <section class="section">
      <div class="container-narrow">
        <div class="prose">
          <ul>
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
          </ul>
        </div>
      </div>
    </section>`,
  },

  {
    file: '404.html',
    title: 'Page not found',
    eyebrow: '404',
    h1: 'This page doesn\'t exist.',
    lead: 'But here are some places you might want to go:',
    body: `
    <section class="section">
      <div class="container-narrow text-center">
        <div class="flex" style="justify-content:center;">
          <a href="index.html" class="btn btn-primary">Home</a>
          <a href="admissions.html" class="btn btn-ghost">Admissions</a>
          <a href="contact.html" class="btn btn-ghost">Contact</a>
        </div>
      </div>
    </section>`,
  },

  {
    file: 'admissions-thank-you.html',
    title: 'Thank you',
    eyebrow: 'Thank you',
    h1: 'We\'ve received your note.',
    lead: 'Our office will be in touch within a working day.',
    body: `
    <section class="section">
      <div class="container-narrow text-center">
        <a href="index.html" class="btn btn-primary mt-6">Back to home</a>
      </div>
    </section>`,
  },

  {
    file: 'notices-archive.html',
    title: 'Notice archive',
    eyebrow: 'Archive',
    h1: 'Older notices.',
    lead: 'Notices from earlier in the year.',
    body: `
    <section class="section">
      <div class="container-narrow">
        <p style="color:var(--color-text-mute);">Looking for a specific circular or announcement? <a href="notices.html">See the current notices</a>, or contact the office.</p>
      </div>
    </section>`,
  },
];

for (const p of pages) {
  const html = TEMPLATE(p);
  fs.writeFileSync(path.join(PUBLIC, p.file), html);
  console.log('wrote', p.file);
}
console.log('Done.');
