-- Virat Public School — Student master list
CREATE TABLE IF NOT EXISTS students (
  id              TEXT PRIMARY KEY,
  admission_number TEXT UNIQUE,
  full_name       TEXT NOT NULL,
  class_name      TEXT NOT NULL,
  section         TEXT,
  roll_number     TEXT,
  dob             TEXT,
  is_active       INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  deleted_at      TEXT
);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_name, section, roll_number);
CREATE INDEX IF NOT EXISTS idx_students_active ON students(is_active, full_name);
