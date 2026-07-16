/**
 * Result lookup — D1 with embedded static fallback.
 * Per Rules.md BR-RES-04: same generic error on miss regardless of which field was wrong.
 */
import { errorResponse, loadStatic, isD1Available, jsonResponse } from '../../lib/data.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const roll = (url.searchParams.get('roll') || '').trim();
  const dob  = (url.searchParams.get('dob')  || '').trim();

  if (!roll || !dob) {
    return errorResponse('Roll number and date of birth are required', 400);
  }

  if (isD1Available(env)) {
    const row = await env.DB.prepare(`
      SELECT r.roll_number, r.student_name, r.dob, r.class_name, r.section, r.marks_json,
             r.total, r.max_total, r.percentage, r.grade, r.rank,
             s.exam_name, s.academic_year
      FROM student_results r
      JOIN result_sets s ON s.id = r.result_set_id
      WHERE r.roll_number = ?1 AND r.dob = ?2 AND s.is_published = 1
      ORDER BY s.declared_at DESC
      LIMIT 1
    `).bind(roll, dob).first();
    if (!row) {
      return new Response(JSON.stringify({ error: 'No result found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    return jsonResponse({
      roll_number: row.roll_number, student_name: row.student_name, class_name: row.class_name,
      section: row.section, exam_name: row.exam_name, academic_year: row.academic_year,
      marks: JSON.parse(row.marks_json), total: row.total, max_total: row.max_total,
      percentage: row.percentage, grade: row.grade, rank: row.rank
    });
  }

  const data = loadStatic(env, 'results.json');
  const set = (data?.resultSets || []).find((s) => s.results && s.results.some((x) => x.roll_number === roll && x.dob === dob));
  if (!set) {
    return new Response(JSON.stringify({ error: 'No result found' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
  }
  const r = set.results.find((x) => x.roll_number === roll && x.dob === dob);
  return jsonResponse({ ...r, exam_name: set.exam_name, academic_year: set.academic_year });
}
