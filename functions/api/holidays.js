import { json } from '../lib/auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const year = url.searchParams.get('year') || '2026-27';
  const { results } = await env.DB.prepare(
    'SELECT id, holiday_date, end_date, name, type FROM holidays WHERE academic_year = ?1 ORDER BY holiday_date ASC'
  ).bind(year).all();
  return json({ holidays: results });
}
