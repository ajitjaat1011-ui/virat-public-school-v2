import { jsonResponse } from '../lib/data.js';
import { db } from '../lib/db.js';

export async function onRequestGet(context) {
  const { env } = context;
  const out = { notices: 0, albums: 0, faculty: 0, results: 0, inquiries: 0 };
  try {
    // One round trip keeps the public homepage reliable with Turso's HTTP adapter.
    const row = await db(env).prepare(`SELECT
      (SELECT COUNT(*) FROM notices WHERE deleted_at IS NULL AND is_published = 1) AS notices,
      (SELECT COUNT(*) FROM gallery_albums WHERE deleted_at IS NULL AND is_published = 1) AS albums,
      (SELECT COUNT(*) FROM faculty WHERE is_active = 1) AS faculty,
      (SELECT COUNT(*) FROM result_sets WHERE deleted_at IS NULL AND is_published = 1) AS results,
      (SELECT COUNT(*) FROM admission_inquiries WHERE status = 'NEW' AND deleted_at IS NULL) AS inquiries
    `).first();
    if (row) Object.assign(out, row);
  } catch (_) { /* keep safe zero fallbacks */ }
  return jsonResponse(out);
}
