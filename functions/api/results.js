import { json } from '../lib/auth.js';

export async function onRequestGet(context) {
  const { env } = context;
  const { results } = await env.DB.prepare(
    'SELECT id, academic_year, exam_name, class_name, declared_at FROM result_sets WHERE deleted_at IS NULL AND is_published = 1 ORDER BY declared_at DESC LIMIT 10'
  ).all();
  return json({ sets: results });
}
