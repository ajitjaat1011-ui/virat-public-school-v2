/**
 * Results API — list recent result sets. D1 with /data/results.json fallback.
 */
import { loadStatic, isD1Available } from '../lib/data.js';

export async function onRequestGet(context) {
  const { env } = context;
  if (isD1Available(env)) {
    const { results } = await env.DB.prepare(
      'SELECT id, academic_year, exam_name, class_name, declared_at FROM result_sets WHERE deleted_at IS NULL AND is_published = 1 ORDER BY declared_at DESC LIMIT 10'
    ).all();
    return Response.json({ sets: results });
  }
  const data = await loadStatic(env, 'results.json');
  const sets = (data?.resultSets || []).filter((s) => s.is_published !== false);
  return Response.json({ sets });
}
