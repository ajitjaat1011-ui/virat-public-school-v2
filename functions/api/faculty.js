/**
 * Faculty API — D1 with /data/faculty.json fallback
 */
import { loadStatic, isD1Available } from '../lib/data.js';

export async function onRequestGet(context) {
  const { env } = context;
  if (isD1Available(env)) {
    const { results } = await env.DB.prepare(
      'SELECT id, name, qualification, subject, department, photo_url, display_order FROM faculty WHERE is_active = 1 ORDER BY display_order ASC, name ASC'
    ).all();
    return Response.json({ faculty: results });
  }
  const data = await loadStatic(env, 'faculty.json');
  return Response.json({ faculty: data?.faculty || [] });
}
