import { jsonResponse } from '../lib/data.js';
import { db } from '../lib/db.js';

export async function onRequestGet(context) {
  const { env } = context;
  const out = { notices: 0, albums: 0, faculty: 0, results: 0, inquiries: 0 };
  const queries = [
    ['notices', 'SELECT COUNT(*) as c FROM notices WHERE deleted_at IS NULL AND is_published = 1'],
    ['albums',  'SELECT COUNT(*) as c FROM gallery_albums WHERE deleted_at IS NULL AND is_published = 1'],
    ['faculty', 'SELECT COUNT(*) as c FROM faculty WHERE is_active = 1'],
    ['results', 'SELECT COUNT(*) as c FROM result_sets WHERE deleted_at IS NULL AND is_published = 1'],
    ['inquiries', "SELECT COUNT(*) as c FROM admission_inquiries WHERE status = 'NEW' AND deleted_at IS NULL"]
  ];
  // Run independent counts together. This is important with the Turso HTTP
  // adapter: five sequential round trips can make a public page time out.
  await Promise.all(queries.map(async ([key, sql]) => {
    try {
      const row = await db(env).prepare(sql).first();
      out[key] = row?.c || 0;
    } catch (_) { /* keep the safe zero fallback */ }
  }));
  return jsonResponse(out);
}
