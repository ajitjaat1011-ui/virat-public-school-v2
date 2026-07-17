/**
 * Admin — exam results
 * GET  /api/admin/exam-results?exam_id=xxx  — list for an exam
 * POST /api/admin/exam-results              — bulk insert results
 *   body: { exam_id, results: [{student_name, class_name, section, roll_number, marks_obtained, max_marks, grade, remarks}, ...] }
 */
import { errorResponse, jsonResponse } from '../../lib/data.js';
import { db } from '../../lib/db.js';
import { requireAdmin, cuid, checkOrigin, audit } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);

  const url = new URL(request.url);
  const examId = url.searchParams.get('exam_id');
  if (!examId) return errorResponse('exam_id is required', 400);

  const res = await db(env).prepare(
    'SELECT * FROM exam_results WHERE exam_id = ?1 ORDER BY roll_number, student_name'
  ).bind(examId).all();

  return jsonResponse({ results: res.results || [] });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);

  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400); }

  const examId = String(body.exam_id || '').trim();
  const list   = Array.isArray(body.results) ? body.results : [];

  if (!examId)  return errorResponse('exam_id is required', 400);
  if (!list.length) return errorResponse('No results provided', 400);

  // Validate exam exists
  const exam = await db(env).prepare(
    'SELECT id, class_name, max_marks FROM exams WHERE id = ?1 AND deleted_at IS NULL'
  ).bind(examId).first();
  if (!exam) return errorResponse('Exam not found', 404);

  const defaultMax = exam.max_marks || 100;
  let inserted = 0;
  let updated = 0;
  for (const r of list) {
    const student_name = String(r.student_name || '').trim();
    const class_name   = String(r.class_name || exam.class_name || '').trim();
    const section      = r.section ? String(r.section).trim() : null;
    const roll_number  = r.roll_number ? String(r.roll_number).trim() : null;
    const marks_obtained = Number(r.marks_obtained);
    const max_marks     = r.max_marks != null ? Number(r.max_marks) : defaultMax;
    const grade         = r.grade ? String(r.grade).trim() : null;
    const remarks       = r.remarks ? String(r.remarks).trim() : null;

    if (!student_name || !class_name) continue;
    if (isNaN(marks_obtained) || isNaN(max_marks)) continue;

    // Upsert by (exam_id, student_name, class_name, roll_number) — best-effort uniqueness
    const existing = await db(env).prepare(
      'SELECT id FROM exam_results WHERE exam_id = ?1 AND student_name = ?2 AND class_name = ?3 AND IFNULL(roll_number, "") = ?4'
    ).bind(examId, student_name, class_name, roll_number || '').first();

    if (existing) {
      await db(env).prepare(
        'UPDATE exam_results SET section = ?1, marks_obtained = ?2, max_marks = ?3, grade = ?4, remarks = ?5 WHERE id = ?6'
      ).bind(section, marks_obtained, max_marks, grade, remarks, existing.id).run();
      updated++;
    } else {
      await db(env).prepare(
        'INSERT INTO exam_results (id, exam_id, student_name, class_name, section, roll_number, marks_obtained, max_marks, grade, remarks) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)'
      ).bind('res_' + cuid(), examId, student_name, class_name, section, roll_number, marks_obtained, max_marks, grade, remarks).run();
      inserted++;
    }
  }

  await audit(env, user.id, 'exam_results.bulk_save', 'Exam', examId, request.headers.get('CF-Connecting-IP') || '', { inserted, updated });
  return jsonResponse({ ok: true, inserted, updated });
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return errorResponse('id is required', 400);
  await db(env).prepare('DELETE FROM exam_results WHERE id = ?1').bind(id).run();
  await audit(env, user.id, 'exam_results.delete', 'ExamResult', id, request.headers.get('CF-Connecting-IP') || '');
  return jsonResponse({ ok: true });
}
