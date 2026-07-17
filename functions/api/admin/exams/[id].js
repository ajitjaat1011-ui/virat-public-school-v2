/**
 * Admin — single exam (update / delete / fetch)
 * GET    /api/admin/exams/[id]   — full details + results
 * POST   /api/admin/exams/[id]   — update
 * DELETE /api/admin/exams/[id]   — soft delete
 */
import { errorResponse, jsonResponse } from '../../../lib/data.js';
import { db } from '../../../lib/db.js';
import { requireAdmin, checkOrigin, audit } from '../../../lib/auth.js';

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);

  const id = params.id;
  const exam = await db(env).prepare(
    'SELECT * FROM exams WHERE id = ?1 AND deleted_at IS NULL'
  ).bind(id).first();
  if (!exam) return errorResponse('Exam not found', 404);

  const results = await db(env).prepare(
    'SELECT * FROM exam_results WHERE exam_id = ?1 ORDER BY roll_number, student_name'
  ).bind(id).all();

  return jsonResponse({ exam, results: results.results || [] });
}

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);

  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400); }
  const id = params.id;

  const exam = await db(env).prepare('SELECT id FROM exams WHERE id = ?1 AND deleted_at IS NULL').bind(id).first();
  if (!exam) return errorResponse('Exam not found', 404);

  const fields = [];
  const params2 = [];
  let idx = 1;
  const map = {
    title: 'title', class_name: 'class_name', subject: 'subject',
    exam_date: 'exam_date', start_time: 'start_time', end_time: 'end_time',
    syllabus: 'syllabus', notes: 'notes'
  };
  for (const [key, col] of Object.entries(map)) {
    if (body[key] !== undefined) { fields.push(`${col} = ?${idx++}`); params2.push(String(body[key]).trim()); }
  }
  if (body.max_marks !== undefined) { fields.push(`max_marks = ?${idx++}`); params2.push(Number(body.max_marks) || null); }
  if (body.is_published !== undefined) { fields.push(`is_published = ?${idx++}`); params2.push(body.is_published ? 1 : 0); }
  if (!fields.length) return errorResponse('Nothing to update', 400);

  fields.push(`updated_at = ?${idx++}`); params2.push(new Date().toISOString());
  params2.push(id);
  try {
    await db(env).prepare(`UPDATE exams SET ${fields.join(', ')} WHERE id = ?${idx}`).bind(...params2).run();
    await audit(env, user.id, 'exam.update', 'Exam', id, request.headers.get('CF-Connecting-IP') || '');
  } catch (e) {
    return errorResponse('Update failed: ' + e.message, 500);
  }
  return jsonResponse({ ok: true });
}

export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);

  const id = params.id;
  const exam = await db(env).prepare('SELECT id FROM exams WHERE id = ?1 AND deleted_at IS NULL').bind(id).first();
  if (!exam) return errorResponse('Exam not found', 404);
  try {
    await db(env).prepare('UPDATE exams SET deleted_at = ?1 WHERE id = ?2')
      .bind(new Date().toISOString(), id).run();
    await audit(env, user.id, 'exam.delete', 'Exam', id, request.headers.get('CF-Connecting-IP') || '');
  } catch (e) {
    return errorResponse('Delete failed: ' + e.message, 500);
  }
  return jsonResponse({ ok: true });
}
