// Reset all site data — wipe notices, exams, parents, parent_students,
// parent_sessions, messages, inquiries, audit log, rate limits, sessions
// (keeps the admin user so login still works).
// Re-seeds a clean default dataset: 1 admissions notice, 1 sample album,
// 3 faculty members, 5 holidays for 2026-27.
const DB_URL = 'libsql://virat-public-school-ajitjaat1011-ui.aws-ap-south-1.turso.io';
const TOKEN = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODQxNzI0ODEsImlkIjoiMDE5ZjY4ZjctNWMwMS03NDVhLTllZDItZTIzNzAyZmIwYzRhIiwia2lkIjoienVDWHBCUlUtOU1paW1aOW45NlhYRUJyRzdUU0U3Y1JJWG4zbE5rQUxzWSIsInJpZCI6IjBhMjBkYmFmLTc5YTktNDliOC1hZDg2LWMzYzNiOGEyYzgxZCJ9.luNfzLTKvqXKQlLyOM4suZbdCihXhKlxwTwoVCvLELFQyjlUu5E_Q5PiLTAn6hEscx2_IC7Y1MuqT185DDD_BA';

const httpUrl = DB_URL.replace(/^libsql:/, 'https:');

async function run(sql) {
  const res = await fetch(httpUrl + '/v2/pipeline', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requests: [
        { type: 'execute', stmt: { sql } },
        { type: 'close' }
      ]
    })
  });
  if (!res.ok) throw new Error('HTTP ' + res.status + ': ' + (await res.text()).slice(0, 200));
  const data = await res.json();
  const r = data.results?.[0]?.response;
  if (r?.type === 'error') throw new Error('SQL: ' + r.error?.message);
  return r;
}

async function exec(sql) {
  console.log('  •', sql.slice(0, 80).replace(/\s+/g, ' '));
  await run(sql);
}

async function main() {
  console.log('Resetting database (keeping admin user)...\n');

  // === Wipe content tables (order matters for FKs) ===
  const tables = [
    'exam_results', 'exams',
    'parent_sessions', 'parent_students', 'parents',
    'contact_messages', 'admission_inquiries',
    'notices',
    'holidays', 'faculty', 'photos', 'gallery_albums',
    'student_results', 'result_sets',
    'audit_log', 'rate_limits', 'sessions',
    'settings'
  ];
  for (const t of tables) await exec(`DELETE FROM ${t}`);

  // === Re-seed default settings ===
  await exec(`INSERT INTO settings (key, value) VALUES
    ('school.name', 'Virat Public School'),
    ('school.tagline', 'Shaping Confident, Curious, Capable Learners'),
    ('school.address', 'Virat Nagar, Kotputli, Dist. Behror, Rajasthan — 303102'),
    ('school.phone', '+91 90000 00000'),
    ('school.email', 'office@viratpublicschool.in'),
    ('school.established', '2008'),
    ('school.board', 'RBSE'),
    ('school.medium', 'English'),
    ('school.hours', 'Monday – Saturday, 8:00 AM – 4:00 PM'),
    ('school.director', 'Mahander Kumar Meena'),
    ('school.director_instagram', 'mahander_meena_86'),
    ('principal.name', 'Dr. Meera Singh'),
    ('principal.message', 'For nearly two decades, our school has served the families of this region with a simple promise — that we will take your child''s education seriously, treat them with respect, and prepare them well for the life ahead.')`);

  // === Re-seed a single admissions notice ===
  await exec(`INSERT INTO notices (id, title, slug, body, excerpt, category, is_published, publish_date, author_id) VALUES
    ('ntc_default_2026', 'Admissions Open for Academic Year 2026-27', 'admissions-open-for-academic-year-2026-27',
     '<p>Online applications are now being accepted for LKG through Class 11 (Science, Commerce, and Arts streams) for the 2026-27 academic year.</p><h3>How to apply</h3><ul><li>Fill the inquiry form on our website</li><li>Visit the campus for a tour and meeting</li><li>Submit required documents at the office</li><li>Complete admission by paying the fee</li></ul><p>Limited seats available in select classes. Apply early to secure your spot.</p>',
     'Online applications for LKG through Class 11 are now open for the 2026-27 academic year. Limited seats.',
     'ADMISSION', 1, datetime('now'), 'usr_admin_default')`);

  // === Re-seed one sample gallery album ===
  await exec(`INSERT INTO gallery_albums (id, title, slug, description, event_date, is_published) VALUES
    ('alb_default', 'Welcome to VPS', 'welcome-to-vps', 'A glimpse of our school campus, classrooms, and students at work.', '2026-07-17', 1)`);

  // === Re-seed faculty ===
  await exec(`INSERT INTO faculty (id, name, qualification, subject, department, display_order, is_active) VALUES
    ('fac_1', 'Dr. Meera Singh', 'M.A., B.Ed., Ph.D.', 'English Literature', 'SENIOR_SECONDARY', 1, 1),
    ('fac_2', 'Rajesh Kumar', 'M.Sc., B.Ed.', 'Mathematics', 'SECONDARY', 2, 1),
    ('fac_3', 'Sunita Sharma', 'M.A., B.Ed.', 'Hindi', 'SECONDARY', 3, 1)`);

  // === Re-seed 2026-27 holidays ===
  await exec(`INSERT INTO holidays (id, holiday_date, name, type, academic_year) VALUES
    ('hol_1', '2026-08-15', 'Independence Day', 'GAZETTED', '2026-27'),
    ('hol_2', '2026-10-02', 'Gandhi Jayanti', 'GAZETTED', '2026-27'),
    ('hol_3', '2026-11-12', 'Diwali Break', 'FESTIVAL', '2026-27'),
    ('hol_4', '2026-12-25', 'Christmas', 'GAZETTED', '2026-27'),
    ('hol_5', '2027-01-26', 'Republic Day', 'GAZETTED', '2026-27')`);

  console.log('\n✓ Reset complete.');
  console.log('  Admin login: Arvindjaat1011 / Arvindjaat.x');
  console.log('  Re-seeded: 1 notice, 1 album, 3 faculty, 5 holidays');
}

main().catch(e => { console.error('FAIL:', e.message); process.exit(1); });
