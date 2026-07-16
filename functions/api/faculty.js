import { jsonResponse } from '../lib/data.js';
import { db } from '../lib/db.js';

export async function onRequestGet(context) {
  const { env } = context;
  const { results } = await db(env).prepare(
    'SELECT id, name, qualification, subject, department, photo_url, display_order FROM faculty WHERE is_active = 1 ORDER BY display_order ASC, name ASC'
  ).all();
  return jsonResponse({ faculty: results });
}
