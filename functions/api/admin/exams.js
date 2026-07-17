/**
 * Admin — manage exams
 * GET  /api/admin/exams            — list all
 * POST /api/admin/exams            — create
 */
import { errorResponse, jsonResponse } from '../../lib/data.js';
import { db } from '../../lib/db.js';
import { requireAdmin, cuid, checkOrigin, audit } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);

  const url = new URL(request.url);
  const className = url.searchParams.get('class_name');

  let res;
  if (className) {
    res = await db(env).prepare(
      `SELECT e.*,
              (SELECT COUNT(*) FROM exam_results r WHERE r.exam_id = e.id) AS result_count
       FROM exams e WHERE e.class_name = ?1 AND e.deleted_at IS NULL
       ORDER BY e.exam_date DESC`
    ).bind(className).all();
  } else {
    res = await db(env).prepare(
      `SELECT e.*,
              (SELECT COUNT(*) FROM exam_results r WHERE r.exam_id = e.id) AS result_count
       FROM exams e WHERE e.deleted_at IS NULL
       ORDER BY e.exam_date DESC`
    ).all();
  }

  return jsonResponse({ exams: res.results || [] });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);

  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400); }

  const title    = String(body.title || '').trim();
  const class_name = String(body.class_name || '').trim();
  const subject  = String(body.subject || '').trim();
  const exam_date = String(body.exam_date || '').trim();
  const start_time = body.start_time ? String(body.start_time).trim() : null;
  const end_time   = body.end_time ? String(body.end_time).trim() : null;
  const max_marks = body.max_marks != null ? Number(body.max_marks) : null;
  const syllabus  = body.syllabus ? String(body.syllabus).trim() : null;
  const notes     = body.notes ? String(body.notes).trim() : null;
  const is_published = body.is_published === undefined ? 1 : (body.is_published ? 1 : 0);

  if (!title)     return errorResponse('Title is required', 400);
  if (!class_name) return errorResponse('Class is required', 400);
  if (!subject)   return errorResponse('Subject is required', 400);
  if (!exam_date) return errorResponse('Exam date is required', 400);

  const id = 'exm_' + cuid();
  try {
    await db(env).prepare(
      `INSERT INTO exams (id, title, class_name, subject, exam_date, start_time, end_time,
                          max_marks, syllabus, notes, is_published, created_by)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`
    ).bind(id, title, class_name, subject, exam_date, start_time, end_time,
           max_marks, syllabus, notes, is_published, user.id).run();
    await audit(env, user.id, 'exam.create', 'Exam', id, request.headers.get('CF-Connecting-IP') || '');
  } catch (e) {
    return errorResponse('Could not create exam: ' + e.message, 500);
  }

  return jsonResponse({ ok: true, id });
}
