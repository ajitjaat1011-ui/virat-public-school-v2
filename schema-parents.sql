-- ===========================================================================
-- Virat Public School — Parent Portal Schema Additions
-- Apply these statements to the existing database (idempotent).
-- Parents register → admin approves → parent can log in.
-- Parents see exams + results for their child(ren).
-- ===========================================================================

-- ---------- Parent accounts (registration request → admin approval) ----------
CREATE TABLE IF NOT EXISTS parents (
  id              TEXT PRIMARY KEY,
  full_name       TEXT NOT NULL,
  phone           TEXT NOT NULL,                 -- school-given mobile number
  password_hash   TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING','APPROVED','REJECTED')),
  -- Optional: review metadata
  reviewed_by     TEXT,
  reviewed_at     TEXT,
  review_note     TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  last_login_at   TEXT,
  failed_logins   INTEGER NOT NULL DEFAULT 0,
  locked_until    TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_parents_phone ON parents(phone);
CREATE INDEX IF NOT EXISTS idx_parents_status ON parents(status, created_at DESC);

-- ---------- Parent sessions ----------
CREATE TABLE IF NOT EXISTS parent_sessions (
  id            TEXT PRIMARY KEY,
  parent_id     TEXT NOT NULL,
  expires_at    TEXT NOT NULL,
  ip            TEXT,
  user_agent    TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_parent_sessions_parent ON parent_sessions(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_sessions_expires ON parent_sessions(expires_at);

-- ---------- Children of parents ----------
-- A parent may have 1+ children. After approval, admin maps the parent to
-- student(s) so the parent can see their exam schedule + results.
CREATE TABLE IF NOT EXISTS parent_students (
  id              TEXT PRIMARY KEY,
  parent_id       TEXT NOT NULL,
  student_name    TEXT NOT NULL,
  class_name      TEXT NOT NULL,           -- e.g. "Class 5"
  section         TEXT,                    -- e.g. "A"
  roll_number     TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_parent_students_parent ON parent_students(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_students_lookup ON parent_students(class_name, section, roll_number);

-- ---------- Exams (announcements / schedule) ----------
-- Admin creates an exam for a class. Parents of that class see it.
CREATE TABLE IF NOT EXISTS exams (
  id              TEXT PRIMARY KEY,
  title           TEXT NOT NULL,                -- e.g. "Mid-Term Mathematics"
  class_name      TEXT NOT NULL,                -- "Class 5", "Class 10", etc.
  subject         TEXT NOT NULL,                -- "Mathematics"
  exam_date       TEXT NOT NULL,                -- ISO date
  start_time      TEXT,                         -- "10:00"
  end_time        TEXT,                         -- "12:00"
  max_marks       INTEGER,
  syllabus        TEXT,                         -- optional syllabus notes
  notes           TEXT,
  is_published    INTEGER NOT NULL DEFAULT 1,
  created_by      TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at      TEXT
);
CREATE INDEX IF NOT EXISTS idx_exams_class_date ON exams(class_name, exam_date);
CREATE INDEX IF NOT EXISTS idx_exams_published ON exams(is_published, exam_date);

-- ---------- Exam results (one row per exam × student) ----------
-- Admin uploads marks; parents see results only for their own child.
CREATE TABLE IF NOT EXISTS exam_results (
  id              TEXT PRIMARY KEY,
  exam_id         TEXT NOT NULL,
  student_name    TEXT NOT NULL,
  class_name      TEXT NOT NULL,
  section         TEXT,
  roll_number     TEXT,
  marks_obtained  REAL NOT NULL,
  max_marks       REAL NOT NULL,
  grade           TEXT,
  remarks         TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam ON exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_lookup ON exam_results(class_name, section, roll_number);
