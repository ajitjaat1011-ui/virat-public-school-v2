// date validation v2
/**
 * Admin — manage exams
 * GET  /api/admin/exams            — list all
 * POST /api/admin/exams            — create
 */
import { errorResponse, jsonResponse } from '../../lib/data.js';
import { db } from '../../lib/db.js';
import { requireAdmin, cuid, checkOrigin, audit } from '../../lib/auth.js';

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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

  let title    = String(body.title || '').trim();
  const class_name = String(body.class_name || '').trim();
  const subject  = String(body.subject || '').trim();
  const exam_date = String(body.exam_date || '').trim();
  const start_time = body.start_time ? String(body.start_time).trim() : null;
  const end_time   = body.end_time ? String(body.end_time).trim() : null;
  const max_marks = body.max_marks != null ? Number(body.max_marks) : null;
  const syllabus  = body.syllabus ? String(body.syllabus).trim() : null;
  const notes     = body.notes ? String(body.notes).trim() : null;
  const is_published = body.is_published === undefined ? 1 : (body.is_published ? 1 : 0);

  if (!class_name) return errorResponse('Class is required', 400);
  if (!subject)   return errorResponse('Subject is required', 400);
  if (!exam_date) return errorResponse('Exam date is required', 400);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(exam_date)) return errorResponse('Exam date must be YYYY-MM-DD format', 400);
  if (!title)     title = `${subject} — ${class_name}`;

  // Creating the same exam twice is almost always a double click or retry.
  const duplicate = await db(env).prepare(`SELECT id FROM exams
    WHERE title = ?1 AND class_name = ?2 AND subject = ?3 AND exam_date = ?4
      AND IFNULL(start_time, '') = ?5 AND deleted_at IS NULL
    ORDER BY created_at DESC LIMIT 1`)
    .bind(title, class_name, subject, exam_date, start_time || '').first();
  if (duplicate) return jsonResponse({ ok: true, duplicate: true, id: duplicate.id });

  const id = 'exm_' + cuid();
  try {
    await db(env).prepare(
      `INSERT INTO exams (id, title, class_name, subject, exam_date, start_time, end_time,
                          max_marks, syllabus, notes, is_published, created_by)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`
    ).bind(id, title, class_name, subject, exam_date, start_time, end_time,
           max_marks, syllabus, notes, is_published, user.id).run();
    await audit(env, user.id, 'exam.create', 'Exam', id, request.headers.get('CF-Connecting-IP') || '');

    // === Auto-create a public notice when the exam is published ===
    // Parents see this on the home page and notices page.
    if (is_published === 1) {
      try {
        const slugBase = (title || 'exam').toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '').trim()
          .replace(/\s+/g, '-').slice(0, 70);
        const slug = `${slugBase}-${exam_date}`;
        const examDateFmt = new Date(exam_date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        const timeLine = start_time
          ? `${start_time}${end_time ? ' – ' + end_time : ''}`
          : '';
        const bodyHtml = `<p><strong>${escapeHtml(title)}</strong> is scheduled for <strong>${escapeHtml(examDateFmt)}</strong>${timeLine ? ' at <strong>' + escapeHtml(timeLine) + '</strong>' : ''}${class_name ? ' for <strong>' + escapeHtml(class_name) + '</strong>' : ''}.</p>${syllabus ? '<p>' + escapeHtml(syllabus) + '</p>' : ''}<p>Please be in your seats 10 minutes before the start time. Bring your school ID and stationery.</p>`;
        const excerpt = `Exam on ${examDateFmt}${timeLine ? ', ' + timeLine : ''} — ${class_name}`;
        // Use a unique slug — append a short cuid tail to avoid collisions
        const slugFinal = slug + '-' + cuid().slice(0, 6);
        const noticeId = 'ntc_' + cuid();
        await db(env).prepare(
          `INSERT INTO notices (id, title, slug, body, excerpt, category, is_published, publish_date, author_id)
           VALUES (?1, ?2, ?3, ?4, ?5, 'EXAM', 1, datetime('now'), ?6)`
        ).bind(noticeId, title, slugFinal, bodyHtml, excerpt, user.id).run();
      } catch (e) {
        // Don't fail the exam creation if notice creation has a hiccup
        console.error('Auto-notice creation failed:', e.message);
      }
    }
  } catch (e) {
    return errorResponse('Could not create exam: ' + e.message, 500);
  }

  return jsonResponse({ ok: true, id });
}
