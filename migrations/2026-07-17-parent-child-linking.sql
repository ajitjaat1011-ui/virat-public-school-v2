-- Parent ↔ student verified linking workflow.
-- Apply once to the production Turso database before deploying functions.

ALTER TABLE parent_students ADD COLUMN student_id TEXT;
ALTER TABLE parent_students ADD COLUMN admission_number TEXT;
ALTER TABLE parent_students ADD COLUMN dob TEXT;
ALTER TABLE parent_students ADD COLUMN link_status TEXT NOT NULL DEFAULT 'REQUESTED';
ALTER TABLE parent_students ADD COLUMN verified_by TEXT;
ALTER TABLE parent_students ADD COLUMN verified_at TEXT;
ALTER TABLE parent_students ADD COLUMN updated_at TEXT;

-- Preserve the behaviour of already-approved accounts. Existing rows were
-- previously treated as live links, so mark those as verified during migration.
UPDATE parent_students
SET link_status = 'LINKED', verified_at = datetime('now')
WHERE parent_id IN (SELECT id FROM parents WHERE status = 'APPROVED');

CREATE INDEX IF NOT EXISTS idx_parent_students_status
  ON parent_students(parent_id, link_status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_parent_students_verified_unique
  ON parent_students(parent_id, student_id)
  WHERE student_id IS NOT NULL AND link_status = 'LINKED';
