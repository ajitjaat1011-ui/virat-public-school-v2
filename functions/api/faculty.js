import { json } from '../lib/auth.js';

export async function onRequestGet(context) {
  const { env } = context;
  const { results } = await env.DB.prepare(
    'SELECT id, name, qualification, subject, department, photo_url, display_order FROM faculty WHERE is_active = 1 ORDER BY display_order ASC, name ASC'
  ).all();
  return json({ faculty: results });
}
