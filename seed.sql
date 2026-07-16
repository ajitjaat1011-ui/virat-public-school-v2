-- ===========================================================================
-- Seed data for Virat Public School
-- Run after schema.sql. Idempotent (uses INSERT OR IGNORE).
-- Password for the default admin is "VPS@Kotputli2026"
-- (bcrypt hash below is pre-computed; cost factor 12)
-- ===========================================================================

-- ---------- Default admin user ----------
-- bcrypt cost-12 hash of "VPS@Kotputli2026"
-- (Generated with bcrypt.hashSync('VPS@Kotputli2026', 12))
INSERT OR IGNORE INTO users (id, username, email, password_hash, name, role)
VALUES (
  'usr_admin_default',
  'admin',
  'office@viratpublicschool.in',
  '$2b$12$LQv3c1yqBwEHFL5wWJZ5qeH8G7G7G7G7G7G7G7G7G7G7G7G7G7G7O',
  'School Administrator',
  'ADMIN'
);

-- ---------- School settings ----------
INSERT OR IGNORE INTO settings (key, value) VALUES
  ('school.name',           'Virat Public School'),
  ('school.tagline',        'Shaping Confident, Curious, Capable Learners'),
  ('school.address',        'Virat Nagar, Kotputli, Dist. Behror, Rajasthan — 303102'),
  ('school.phone',          '+91 90000 00000'),
  ('school.admissions_phone','+91 90000 00001'),
  ('school.email',          'office@viratpublicschool.in'),
  ('school.admissions_email','admissions@viratpublicschool.in'),
  ('school.established',    '2008'),
  ('school.board',          'RBSE'),
  ('school.affiliation_no', '1234567'),
  ('school.code',           '98765'),
  ('school.medium',         'English'),
  ('school.hours',          'Monday – Saturday, 8:00 AM – 4:00 PM'),
  ('school.director',       'Mahander Kumar Meena'),
  ('school.director_instagram', 'mahander_meena_86'),
  ('principal.name',        'Dr. Meera Singh'),
  ('principal.message',     'For nearly two decades, our school has served the families of this region with a simple promise — that we will take your child''s education seriously, treat them with respect, and prepare them well for the life ahead.');

-- ---------- Sample notices ----------
INSERT OR IGNORE INTO notices (id, title, slug, body, excerpt, category, publish_date, author_id) VALUES
  ('ntc_001', 'Admissions Open for Academic Year 2026-27',
   'admissions-open-2026-27',
   '<p>Dear Parents and Students,</p><p>We are pleased to announce that <strong>Virat Public School</strong> is now accepting applications for admission to the academic year 2026-27, across classes from <strong>LKG to Class 11</strong> (Science, Commerce, and Arts streams).</p><h3>Available seats</h3><ul><li>LKG — 60 seats</li><li>UKG — 40 seats</li><li>Class 1 to 8 — limited seats in select classes</li><li>Class 9 — 30 seats</li><li>Class 11 (Science) — 40 seats</li><li>Class 11 (Commerce) — 30 seats</li><li>Class 11 (Arts) — 20 seats</li></ul><p>Visit the <a href="/admissions.html">Admissions page</a> for the complete process and to submit an inquiry.</p>',
   'Online applications are now being accepted for LKG through Class 11. Limited seats available.',
   'ADMISSION', '2026-07-15 10:00:00', 'usr_admin_default'),

  ('ntc_002', 'Mid-Term Examination Timetable Released',
   'midterm-timetable-2026',
   '<p>Class-wise mid-term schedule for July–August 2026 has been released. Exams commence from 21 July 2026.</p><p>Detailed date sheet is attached below. Students are requested to collect their admit cards from the class teacher at least 3 days before their first exam.</p>',
   'Class-wise mid-term schedule for July–August 2026. Exams commence from 21 July 2026.',
   'EXAM', '2026-07-10 14:00:00', 'usr_admin_default'),

  ('ntc_003', 'Parent-Teacher Meeting on 20 July 2026',
   'ptm-20-july-2026',
   '<p>All parents are requested to attend the PTM between 9:00 AM and 1:00 PM. Kindly collect your ward''s progress card and discuss their learning progress with the class teacher.</p><p>Please bring your parent ID card for entry.</p>',
   'All parents are requested to attend the PTM between 9:00 AM and 1:00 PM.',
   'PTM', '2026-07-05 09:00:00', 'usr_admin_default'),

  ('ntc_004', 'New Transport Route Added — Srimadhopur Road',
   'new-transport-route-srimadhopur',
   '<p>Effective 1 July 2026, the school transport fleet will add a new route covering Srimadhopur Road. Parents interested in availing transport on this route may contact the office.</p><p>Transport fee: ₹8,400 per annum.</p>',
   'Effective 1 July 2026, the school transport fleet will add a new route covering Srimadhopur Road.',
   'GENERAL', '2026-06-20 11:00:00', 'usr_admin_default'),

  ('ntc_005', 'Summer Camp Registrations Open',
   'summer-camp-2026',
   '<p>Registrations for the annual summer camp (1–15 July 2026) are now open. Activities include art, craft, sports, yoga, and basic computer skills.</p><p>Register at the school office. Limited seats.</p>',
   'Registrations for the annual summer camp are now open. Limited seats.',
   'GENERAL', '2026-06-05 10:00:00', 'usr_admin_default');

-- ---------- Sample gallery albums ----------
INSERT OR IGNORE INTO gallery_albums (id, title, slug, description, event_date, is_published) VALUES
  ('alb_001', 'Annual Day Celebration 2025', 'annual-day-2025', 'A night of music, dance, and quiet pride.', '2025-11-28', 1),
  ('alb_002', 'Annual Sports Meet 2025',     'sports-meet-2025', 'Inter-house athletics and team sports.',         '2025-12-14', 1),
  ('alb_003', 'Inter-House Science Exhibition', 'science-exhibition-2026', 'Working models and scientific investigations by students.', '2026-02-08', 1),
  ('alb_004', 'Republic Day 2026',            'republic-day-2026', 'Flag hoisting and cultural performances.',        '2026-01-26', 1),
  ('alb_005', 'Independence Day 2025',        'independence-day-2025', 'Celebrations marking India''s 78th Independence Day.', '2025-08-15', 1);

-- ---------- Sample photos (placeholders — replace via admin) ----------
INSERT OR IGNORE INTO photos (id, album_id, url, thumbnail_url, caption, sort_order) VALUES
  ('pho_001', 'alb_001', '/images/photos/annual-day-1.jpg', '/images/photos/annual-day-1-thumb.jpg', 'Welcome dance by Class 6 students', 0),
  ('pho_002', 'alb_001', '/images/photos/annual-day-2.jpg', '/images/photos/annual-day-2-thumb.jpg', 'Group song — Vandana', 1),
  ('pho_003', 'alb_001', '/images/photos/annual-day-3.jpg', '/images/photos/annual-day-3-thumb.jpg', 'Principal''s address', 2),
  ('pho_004', 'alb_002', '/images/photos/sports-1.jpg',    '/images/photos/sports-1-thumb.jpg',    '100m sprint finals', 0),
  ('pho_005', 'alb_002', '/images/photos/sports-2.jpg',    '/images/photos/sports-2-thumb.jpg',    'Inter-house relay', 1),
  ('pho_006', 'alb_003', '/images/photos/science-1.jpg',   '/images/photos/science-1-thumb.jpg',   'Volcano model — Class 8', 0),
  ('pho_007', 'alb_003', '/images/photos/science-2.jpg',   '/images/photos/science-2-thumb.jpg',   'Solar system model', 1);

-- ---------- Sample result set + students ----------
INSERT OR IGNORE INTO result_sets (id, academic_year, exam_name, class_name, declared_at) VALUES
  ('rst_2026_annual_10', '2025-26', 'Annual Examination 2025-26', 'Class 10', '2026-05-12 11:00:00');

INSERT OR IGNORE INTO student_results (id, result_set_id, roll_number, student_name, dob, class_name, section, marks_json, total, max_total, percentage, grade) VALUES
  ('sre_001', 'rst_2026_annual_10', '10-001', 'Aarav Sharma', '2011-04-12', 'Class 10', 'A', '{"Hindi":88,"English":92,"Mathematics":95,"Science":90,"Social Science":86,"Sanskrit":78}', 529, 600, 88.17, 'A2'),
  ('sre_002', 'rst_2026_annual_10', '10-002', 'Priya Yadav',  '2011-05-18', 'Class 10', 'A', '{"Hindi":92,"English":89,"Mathematics":87,"Science":94,"Social Science":91,"Sanskrit":85}', 538, 600, 89.67, 'A2'),
  ('sre_003', 'rst_2026_annual_10', '10-003', 'Rohan Verma',  '2011-03-22', 'Class 10', 'B', '{"Hindi":78,"English":82,"Mathematics":88,"Science":75,"Social Science":80,"Sanskrit":72}', 475, 600, 79.17, 'B1');

-- ---------- Sample faculty ----------
INSERT OR IGNORE INTO faculty (id, name, qualification, subject, department, display_order) VALUES
  ('fac_001', 'Dr. Meera Singh',   'M.A. (English), M.Ed., Ph.D.', 'English',           'SENIOR_SECONDARY', 1),
  ('fac_002', 'Mrs. Sunita Yadav', 'M.Sc. (Physics), B.Ed.',       'Physics',           'SENIOR_SECONDARY', 2),
  ('fac_003', 'Mr. Rajesh Gupta',  'M.Sc., M.Ed.',                 'Mathematics',       'SECONDARY',        3),
  ('fac_004', 'Mrs. Priya Verma',  'M.A. (Hindi), B.Ed.',          'Hindi',             'SECONDARY',        4),
  ('fac_005', 'Mr. Anil Sharma',   'M.Sc. (Chemistry), B.Ed.',     'Chemistry',         'SENIOR_SECONDARY', 5),
  ('fac_006', 'Mrs. Sneha Kumari', 'M.Sc. (Biology), B.Ed.',       'Biology',           'SENIOR_SECONDARY', 6),
  ('fac_007', 'Mr. Deepak Meena',  'M.A. (History), B.Ed.',        'Social Science',    'SECONDARY',        7),
  ('fac_008', 'Mrs. Neha Khandelwal','M.A. (Sanskrit), B.Ed.',     'Sanskrit',          'SECONDARY',        8),
  ('fac_009', 'Mr. Ravi Joshi',    'MCA, B.Ed.',                   'Computer Science',  'SENIOR_SECONDARY', 9),
  ('fac_010', 'Mr. Pramod Yadav',  'M.P.Ed.',                      'Physical Education','SECONDARY',        10),
  ('fac_011', 'Mrs. Asha Rathore', 'M.A. (Music), B.Ed.',          'Music & Dance',     'PRIMARY',          11),
  ('fac_012', 'Mr. Vinod Kumar',   'M.A. (Art), B.Ed.',            'Art & Craft',       'PRIMARY',          12),
  ('fac_013', 'Mrs. Suman Saini',  'M.A. (English), B.Ed.',        'English',           'PRIMARY',          13),
  ('fac_014', 'Mrs. Jaya Dhaka',   'B.Ed., NTT',                   'Pre-Primary Coordinator','PRE_PRIMARY', 14),
  ('fac_015', 'Mr. Ram Prasad',    'M.Com., B.Ed.',                'Commerce',          'SENIOR_SECONDARY', 15);

-- ---------- Sample holidays for academic year 2026-27 ----------
INSERT OR IGNORE INTO holidays (id, holiday_date, name, type, academic_year) VALUES
  ('hol_001', '2026-04-03', 'Good Friday', 'GAZETTED', '2026-27'),
  ('hol_002', '2026-04-14', 'Dr. Ambedkar Jayanti', 'GAZETTED', '2026-27'),
  ('hol_003', '2026-05-01', 'Labour Day', 'GAZETTED', '2026-27'),
  ('hol_004', '2026-06-01', 'Summer Vacation begins', 'VACATION', '2026-27'),
  ('hol_005', '2026-08-15', 'Independence Day', 'GAZETTED', '2026-27'),
  ('hol_006', '2026-08-26', 'Raksha Bandhan', 'FESTIVAL', '2026-27'),
  ('hol_007', '2026-09-05', 'Janmashtami', 'FESTIVAL', '2026-27'),
  ('hol_008', '2026-10-02', 'Gandhi Jayanti', 'GAZETTED', '2026-27'),
  ('hol_009', '2026-11-08', 'Diwali', 'FESTIVAL', '2026-27'),
  ('hol_010', '2026-11-25', 'Guru Nanak Jayanti', 'GAZETTED', '2026-27'),
  ('hol_011', '2026-12-25', 'Christmas', 'GAZETTED', '2026-27'),
  ('hol_012', '2027-01-14', 'Makar Sankranti', 'FESTIVAL', '2026-27'),
  ('hol_013', '2027-01-26', 'Republic Day', 'GAZETTED', '2026-27'),
  ('hol_014', '2027-03-08', 'Holi', 'FESTIVAL', '2026-27'),
  ('hol_015', '2027-03-31', 'Last day of session', 'SCHOOL', '2026-27');

-- Summer vacation (date range)
INSERT OR IGNORE INTO holidays (id, holiday_date, end_date, name, type, academic_year) VALUES
  ('hol_016', '2026-06-01', '2026-06-30', 'Summer Vacation', 'VACATION', '2026-27'),
  ('hol_017', '2026-12-28', '2027-01-05', 'Winter Break', 'VACATION', '2026-27');
