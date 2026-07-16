import { jsonResponse } from '../lib/data.js';
import { db } from '../lib/db.js';

export async function onRequestGet(context) {
  const { env } = context;
  const out = { notices: 0, albums: 0, faculty: 0, results: 0, inquiries: 0 };
  try {
    const queries = [
      ['notices', 'SELECT COUNT(*) as c FROM notices WHERE deleted_at IS NULL AND is_published = 1'],
      ['albums',  'SELECT COUNT(*) as c FROM gallery_albums WHERE deleted_at IS NULL AND is_published = 1'],
      ['faculty', 'SELECT COUNT(*) as c FROM faculty WHERE is_active = 1'],
      ['results', 'SELECT COUNT(*) as c FROM result_sets WHERE deleted_at IS NULL AND is_published = 1'],
      ['inquiries', "SELECT COUNT(*) as c FROM admission_inquiries WHERE status = 'NEW' AND deleted_at IS NULL"]
    ];
    for (const [key, sql] of queries) {
      try {
        const row = await db(env).prepare(sql).first();
        out[key] = row?.c || 0;
      } catch (e) {}
    }
  } catch (e) {}
  return jsonResponse(out);
}
