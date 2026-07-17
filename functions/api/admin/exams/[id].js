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

    // === Auto-create a public notice when toggling is_published from 0 → 1 ===
    if (body.is_published === 1 || body.is_published === true) {
      try {
        const updated = await db(env).prepare('SELECT title, class_name, subject, exam_date, start_time, end_time, syllabus FROM exams WHERE id = ?1').bind(id).first();
        if (updated) {
          const examDateFmt = new Date(updated.exam_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
          const timeLine = updated.start_time ? `${updated.start_time}${updated.end_time ? ' – ' + updated.end_time : ''}` : '';
          const bodyHtml = `<p><strong>${(updated.title || '').replace(/</g, '&lt;')}</strong> is scheduled for <strong>${examDateFmt}</strong>${timeLine ? ' at <strong>' + timeLine + '</strong>' : ''}${updated.class_name ? ' for <strong>' + updated.class_name + '</strong>' : ''}.</p>${updated.syllabus ? '<p>' + updated.syllabus.replace(/</g, '&lt;') + '</p>' : ''}<p>Please be in your seats 10 minutes before the start time. Bring your school ID and stationery.</p>`;
          const excerpt = `Exam on ${examDateFmt}${timeLine ? ', ' + timeLine : ''} — ${updated.class_name || ''}`;
          const slugBase = (updated.title || 'exam').toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '').trim()
            .replace(/\s+/g, '-').slice(0, 70);
          const slugFinal = `${slugBase}-${updated.exam_date}-` + cuid().slice(0, 6);
          const noticeId = 'ntc_' + cuid();
          await db(env).prepare(
            `INSERT INTO notices (id, title, slug, body, excerpt, category, is_published, publish_date, author_id)
             VALUES (?1, ?2, ?3, ?4, ?5, 'EXAM', 1, datetime('now'), ?6)`
          ).bind(noticeId, updated.title, slugFinal, bodyHtml, excerpt, user.id).run();
        }
      } catch (e) {
        console.error('Auto-notice on publish failed:', e.message);
      }
    }
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
