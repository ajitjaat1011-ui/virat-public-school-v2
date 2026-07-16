import { jsonResponse } from '../lib/data.js';
import { db } from '../lib/db.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const year = url.searchParams.get('year') || '2026-27';
  const { results } = await db(env).prepare(
    'SELECT id, holiday_date, end_date, name, type FROM holidays WHERE academic_year = ?1 ORDER BY holiday_date ASC'
  ).bind(year).all();
  return jsonResponse({ holidays: results });
}
