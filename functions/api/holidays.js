/**
 * Holidays API — D1 with /data/holidays.json fallback
 */
import { loadStatic, isD1Available } from '../lib/data.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const year = url.searchParams.get('year') || '2026-27';
  if (isD1Available(env)) {
    const { results } = await env.DB.prepare(
      'SELECT id, holiday_date, end_date, name, type FROM holidays WHERE academic_year = ?1 ORDER BY holiday_date ASC'
    ).bind(year).all();
    return Response.json({ holidays: results });
  }
  const data = await loadStatic(env, 'holidays.json');
  const holidays = (data?.holidays || []).filter((h) => h.academic_year === year);
  return Response.json({ holidays });
}
