-- ===========================================================================
-- Virat Public School — Database Schema (Cloudflare D1 / SQLite)
-- ===========================================================================
-- Implements the data model from Architecture.md §4, plus auth, sessions,
-- and an audit log. Soft-delete via deleted_at columns; hard-delete on
-- retention expiry (cron-style cleanup job is out of scope for v2.0).
-- ===========================================================================

PRAGMA foreign_keys = ON;

-- ---------- Users / Auth ----------
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  username      TEXT UNIQUE NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'EDITOR' CHECK (role IN ('ADMIN','EDITOR')),
  is_active     INTEGER NOT NULL DEFAULT 1,
  last_login_at TEXT,
  failed_logins INTEGER NOT NULL DEFAULT 0,
  locked_until  TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL,
  expires_at    TEXT NOT NULL,
  ip            TEXT,
  user_agent    TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ---------- Notices ----------
CREATE TABLE IF NOT EXISTS notices (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  body          TEXT NOT NULL,           -- sanitized HTML
  excerpt       TEXT,
  category      TEXT NOT NULL CHECK (category IN ('ADMISSION','HOLIDAY','EXAM','PTM','GENERAL')),
  is_published  INTEGER NOT NULL DEFAULT 1,
  publish_date  TEXT NOT NULL DEFAULT (datetime('now')),
  expiry_date   TEXT,
  attachment_url TEXT,
  attachment_name TEXT,
  author_id     TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at    TEXT,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_notices_published ON notices(is_published, publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_notices_slug ON notices(slug);
CREATE INDEX IF NOT EXISTS idx_notices_category ON notices(category);

-- ---------- Gallery ----------
CREATE TABLE IF NOT EXISTS gallery_albums (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,
  description   TEXT,
  event_date    TEXT NOT NULL,
  cover_url     TEXT,
  is_published  INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_albums_eventdate ON gallery_albums(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_albums_published ON gallery_albums(is_published, event_date DESC);

CREATE TABLE IF NOT EXISTS photos (
  id            TEXT PRIMARY KEY,
  album_id      TEXT NOT NULL,
  url           TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  caption       TEXT,
  is_draft      INTEGER NOT NULL DEFAULT 0,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (album_id) REFERENCES gallery_albums(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_photos_album ON photos(album_id, sort_order);

-- ---------- Results ----------
CREATE TABLE IF NOT EXISTS result_sets (
  id            TEXT PRIMARY KEY,
  academic_year TEXT NOT NULL,            -- e.g. "2025-26"
  exam_name     TEXT NOT NULL,            -- e.g. "Annual Examination 2025-26"
  class_name    TEXT NOT NULL,            -- e.g. "Class 10"
  declared_at   TEXT NOT NULL DEFAULT (datetime('now')),
  is_published  INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_resultsets_published ON result_sets(is_published, declared_at DESC);

CREATE TABLE IF NOT EXISTS student_results (
  id            TEXT PRIMARY KEY,
  result_set_id TEXT NOT NULL,
  roll_number   TEXT NOT NULL,
  student_name  TEXT NOT NULL,
  dob           TEXT NOT NULL,            -- ISO date
  class_name    TEXT NOT NULL,
  section       TEXT,
  marks_json    TEXT NOT NULL,            -- JSON: {"Hindi": 78, "English": 82, ...}
  total         INTEGER NOT NULL,
  max_total     INTEGER NOT NULL,
  percentage    REAL NOT NULL,
  grade         TEXT NOT NULL,
  rank          INTEGER,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (result_set_id) REFERENCES result_sets(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_results_lookup ON student_results(roll_number, dob, result_set_id);

-- ---------- Admissions / Inquiries ----------
CREATE TABLE IF NOT EXISTS admission_inquiries (
  id            TEXT PRIMARY KEY,
  parent_name   TEXT NOT NULL,
  student_name  TEXT NOT NULL,
  dob           TEXT,
  class_seeking TEXT NOT NULL,
  parent_phone  TEXT NOT NULL,
  parent_email  TEXT,
  address       TEXT,
  message       TEXT,
  status        TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','CONTACTED','ADMITTED','REJECTED')),
  notes         TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON admission_inquiries(status, created_at DESC);

-- ---------- Contact ----------
CREATE TABLE IF NOT EXISTS contact_messages (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  subject       TEXT NOT NULL,
  message       TEXT NOT NULL,
  is_read       INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at    TEXT
);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON contact_messages(is_read, created_at DESC);

-- ---------- Holidays ----------
CREATE TABLE IF NOT EXISTS holidays (
  id            TEXT PRIMARY KEY,
  holiday_date  TEXT NOT NULL,            -- ISO date
  end_date      TEXT,                     -- for vacation ranges
  name          TEXT NOT NULL,
  type          TEXT NOT NULL CHECK (type IN ('GAZETTED','SCHOOL','FESTIVAL','VACATION')),
  academic_year TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_holidays_year ON holidays(academic_year, holiday_date);

-- ---------- Faculty ----------
CREATE TABLE IF NOT EXISTS faculty (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  qualification TEXT,
  subject       TEXT,
  department    TEXT NOT NULL CHECK (department IN ('PRE_PRIMARY','PRIMARY','SECONDARY','SENIOR_SECONDARY','ADMIN')),
  photo_url     TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_faculty_dept ON faculty(department, display_order);

-- ---------- Audit log ----------
CREATE TABLE IF NOT EXISTS audit_log (
  id            TEXT PRIMARY KEY,
  user_id       TEXT,
  action        TEXT NOT NULL,            -- e.g. "notice.create", "user.login"
  entity        TEXT,                     -- e.g. "Notice", "ResultSet"
  entity_id     TEXT,
  ip            TEXT,
  metadata      TEXT,                     -- JSON
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action, created_at DESC);

-- ---------- Rate limit counters (sliding window) ----------
CREATE TABLE IF NOT EXISTS rate_limits (
  key           TEXT PRIMARY KEY,         -- e.g. "form:1.2.3.4"
  count         INTEGER NOT NULL DEFAULT 1,
  window_start  TEXT NOT NULL
);

-- ---------- Settings (key-value for school info etc.) ----------
CREATE TABLE IF NOT EXISTS settings (
  key           TEXT PRIMARY KEY,
  value         TEXT NOT NULL,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
