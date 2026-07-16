import { jsonResponse } from '../lib/data.js';
import { db } from '../lib/db.js';

export async function onRequestGet(context) {
  const { env } = context;
  const { results } = await db(env).prepare(
    'SELECT id, academic_year, exam_name, class_name, declared_at FROM result_sets WHERE deleted_at IS NULL AND is_published = 1 ORDER BY declared_at DESC LIMIT 10'
  ).all();
  return jsonResponse({ sets: results });
}
