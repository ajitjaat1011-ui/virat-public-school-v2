import { db } from './db.js';

let parentLinkMigration;

/**
 * One-time, backwards-compatible migration for verified parent↔student links.
 * Pages deployments cannot read Cloudflare secrets outside the runtime, so the
 * app performs this small idempotent migration using its existing DB binding.
 */
export function ensureParentLinkSchema(env) {
  if (!parentLinkMigration) {
    parentLinkMigration = migrateParentLinks(env).catch((error) => {
      parentLinkMigration = null;
      throw error;
    });
  }
  return parentLinkMigration;
}

async function migrateParentLinks(env) {
  const database = db(env);
  const info = await database.prepare('PRAGMA table_info(parent_students)').all();
  const columns = new Set((info.results || []).map(row => row.name));
  if (!columns.size) throw new Error('parent_students table is missing');
  const legacy = !columns.has('link_status');

  const additions = [
    ['student_id', 'ALTER TABLE parent_students ADD COLUMN student_id TEXT'],
    ['admission_number', 'ALTER TABLE parent_students ADD COLUMN admission_number TEXT'],
    ['dob', 'ALTER TABLE parent_students ADD COLUMN dob TEXT'],
    ['link_status', "ALTER TABLE parent_students ADD COLUMN link_status TEXT NOT NULL DEFAULT 'REQUESTED'"],
    ['verified_by', 'ALTER TABLE parent_students ADD COLUMN verified_by TEXT'],
    ['verified_at', 'ALTER TABLE parent_students ADD COLUMN verified_at TEXT'],
    ['updated_at', 'ALTER TABLE parent_students ADD COLUMN updated_at TEXT']
  ];

  for (const [column, sql] of additions) {
    if (columns.has(column)) continue;
    try { await database.prepare(sql).run(); }
    catch (error) {
      // Another isolate may have completed the same idempotent step.
      if (!/duplicate column|already exists/i.test(String(error?.message || error))) throw error;
    }
  }

  if (legacy) {
    await database.prepare(`UPDATE parent_students
      SET link_status='LINKED', verified_at=datetime('now')
      WHERE parent_id IN (SELECT id FROM parents WHERE status='APPROVED')`).run();
  }

  await database.prepare(`CREATE INDEX IF NOT EXISTS idx_parent_students_status
    ON parent_students(parent_id, link_status)`).run();
  await database.prepare(`CREATE UNIQUE INDEX IF NOT EXISTS idx_parent_students_verified_unique
    ON parent_students(parent_id, student_id)
    WHERE student_id IS NOT NULL AND link_status='LINKED'`).run();
}
