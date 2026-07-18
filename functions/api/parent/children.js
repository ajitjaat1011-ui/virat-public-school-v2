/**
 * Parent child-link requests.
 * POST   /api/parent/children       — request another child link
 * DELETE /api/parent/children?id=  — cancel an unverified request
 */
import { errorResponse, jsonResponse } from '../../lib/data.js';
import { db } from '../../lib/db.js';
import { ensureParentLinkSchema } from '../../lib/migrations.js';
import { requireParent, checkOrigin, cuid, audit, rateLimit } from '../../lib/auth.js';

function clean(value, max = 100) {
  return String(value || '').trim().slice(0, max);
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);
  const { parent, error } = await requireParent(request, env);
  if (!parent) return errorResponse(error, 401);
  try { await ensureParentLinkSchema(env); }
  catch (_) { return errorResponse('Parent portal setup failed', 503); }

  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400); }

  const studentName = clean(body.student_name);
  const admissionNumber = clean(body.admission_number, 40) || null;
  const className = clean(body.class_name, 60);
  const section = clean(body.section, 10) || null;
  const rollNumber = clean(body.roll_number, 30) || null;
  const dob = clean(body.dob, 10) || null;

  if (studentName.length < 2) return errorResponse('Please enter the student’s full name', 400);
  if (!className) return errorResponse('Please choose the student’s class', 400);
  if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) return errorResponse('Please enter a valid date of birth', 400);

  try {
    const limit = await rateLimit(env, 'parent-child:' + parent.id, 8, 60 * 60);
    if (limit.limited) return errorResponse('Too many link requests. Please contact the school office.', 429);
  } catch (_) {}

  const duplicate = await db(env).prepare(`SELECT id, link_status FROM parent_students
    WHERE parent_id = ?1 AND lower(student_name) = lower(?2) AND class_name = ?3
      AND IFNULL(admission_number, '') = ?4 AND link_status IN ('REQUESTED','LINKED')
    ORDER BY created_at DESC LIMIT 1`)
    .bind(parent.id, studentName, className, admissionNumber || '').first();
  if (duplicate) {
    return jsonResponse({
      ok: true,
      duplicate: true,
      id: duplicate.id,
      status: duplicate.link_status,
      message: duplicate.link_status === 'LINKED' ? 'This child is already linked.' : 'This link request is already awaiting review.'
    });
  }

  const id = 'ps_' + cuid();
  await db(env).prepare(`INSERT INTO parent_students
      (id, parent_id, student_name, admission_number, class_name, section, roll_number, dob, link_status)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 'REQUESTED')`)
    .bind(id, parent.id, studentName, admissionNumber, className, section, rollNumber, dob).run();

  await audit(env, null, 'parent.child_request', 'ParentStudent', id,
    request.headers.get('CF-Connecting-IP') || '', { parent_id: parent.id, class_name: className });

  return jsonResponse({ ok: true, id, status: 'REQUESTED' });
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);
  const { parent, error } = await requireParent(request, env);
  if (!parent) return errorResponse(error, 401);
  try { await ensureParentLinkSchema(env); }
  catch (_) { return errorResponse('Parent portal setup failed', 503); }

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return errorResponse('Request id is required', 400);
  const row = await db(env).prepare(
    `SELECT id FROM parent_students WHERE id = ?1 AND parent_id = ?2 AND link_status = 'REQUESTED'`
  ).bind(id, parent.id).first();
  if (!row) return errorResponse('Pending link request not found', 404);

  await db(env).prepare('DELETE FROM parent_students WHERE id = ?1 AND parent_id = ?2').bind(id, parent.id).run();
  await audit(env, null, 'parent.child_request_cancel', 'ParentStudent', id,
    request.headers.get('CF-Connecting-IP') || '', { parent_id: parent.id });
  return jsonResponse({ ok: true });
}
