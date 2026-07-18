/**
 * Admin — approve / reject / delete a parent account
 * POST   /api/admin/parents/[id]   { action: 'approve' | 'reject', note?: string }
 * DELETE /api/admin/parents/[id]
 */
import { errorResponse, jsonResponse } from '../../../lib/data.js';
import { db } from '../../../lib/db.js';
import { ensureParentLinkSchema } from '../../../lib/migrations.js';
import { requireAdmin, audit, checkOrigin, cuid } from '../../../lib/auth.js';

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);
  try { await ensureParentLinkSchema(env); }
  catch (_) { return errorResponse('Parent-link database migration failed', 503); }

  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400); }

  const id = params.id;
  const parent = await db(env).prepare('SELECT id, status FROM parents WHERE id = ?1').bind(id).first();
  if (!parent) return errorResponse('Parent not found', 404);

  const action = String(body.action || '').toLowerCase();
  const note = body.note ? String(body.note).trim() : null;
  const now = new Date().toISOString();

  if (action === 'approve') {
    await db(env).prepare(
      'UPDATE parents SET status = ?1, reviewed_by = ?2, reviewed_at = ?3, review_note = ?4, updated_at = ?3 WHERE id = ?5'
    ).bind('APPROVED', user.id, now, note, id).run();
    await audit(env, user.id, 'parent.approve', 'Parent', id, request.headers.get('CF-Connecting-IP') || '');
    return jsonResponse({ ok: true, status: 'APPROVED' });
  }
  if (action === 'reject') {
    await db(env).prepare(
      'UPDATE parents SET status = ?1, reviewed_by = ?2, reviewed_at = ?3, review_note = ?4, updated_at = ?3 WHERE id = ?5'
    ).bind('REJECTED', user.id, now, note, id).run();
    await db(env).prepare('DELETE FROM parent_sessions WHERE parent_id = ?1').bind(id).run();
    await audit(env, user.id, 'parent.reject', 'Parent', id, request.headers.get('CF-Connecting-IP') || '');
    return jsonResponse({ ok: true, status: 'REJECTED' });
  }
  if (action === 'reset') {
    // Re-open a rejected/approved request back to pending (useful for re-approval)
    await db(env).prepare(
      'UPDATE parents SET status = ?1, updated_at = ?2 WHERE id = ?3'
    ).bind('PENDING', now, id).run();
    await db(env).prepare('DELETE FROM parent_sessions WHERE parent_id = ?1').bind(id).run();
    await audit(env, user.id, 'parent.reset', 'Parent', id, request.headers.get('CF-Connecting-IP') || '');
    return jsonResponse({ ok: true, status: 'PENDING' });
  }

  if (action === 'link_child') {
    const studentId = String(body.student_id || '').trim();
    const requestId = String(body.request_id || '').trim() || null;
    if (!studentId) return errorResponse('Choose a student from the master list', 400);

    const student = await db(env).prepare(`SELECT id, full_name, admission_number, class_name, section, roll_number, dob
      FROM students WHERE id = ?1 AND is_active = 1 AND deleted_at IS NULL`).bind(studentId).first();
    if (!student) return errorResponse('Student not found or inactive', 404);

    const duplicate = await db(env).prepare(`SELECT id FROM parent_students
      WHERE parent_id = ?1 AND student_id = ?2 AND link_status = 'LINKED' LIMIT 1`)
      .bind(id, studentId).first();
    if (duplicate) return jsonResponse({ ok: true, duplicate: true, link_id: duplicate.id, status: 'LINKED' });

    let linkId = requestId;
    if (requestId) {
      const requestRow = await db(env).prepare(
        `SELECT id FROM parent_students WHERE id = ?1 AND parent_id = ?2 AND link_status != 'LINKED'`
      ).bind(requestId, id).first();
      if (!requestRow) return errorResponse('Child link request not found', 404);
      await db(env).prepare(`UPDATE parent_students SET
          student_id=?1, student_name=?2, admission_number=?3, class_name=?4,
          section=?5, roll_number=?6, dob=?7, link_status='LINKED',
          verified_by=?8, verified_at=?9, updated_at=?9
        WHERE id=?10 AND parent_id=?11`)
        .bind(student.id, student.full_name, student.admission_number, student.class_name,
          student.section, student.roll_number, student.dob, user.id, now, requestId, id).run();
    } else {
      linkId = 'ps_' + cuid();
      await db(env).prepare(`INSERT INTO parent_students
        (id, parent_id, student_id, student_name, admission_number, class_name,
         section, roll_number, dob, link_status, verified_by, verified_at, updated_at)
        VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,'LINKED',?10,?11,?11)`)
        .bind(linkId, id, student.id, student.full_name, student.admission_number,
          student.class_name, student.section, student.roll_number, student.dob, user.id, now).run();
    }

    await audit(env, user.id, 'parent.child_link', 'ParentStudent', linkId,
      request.headers.get('CF-Connecting-IP') || '', { parent_id: id, student_id: studentId });
    return jsonResponse({ ok: true, link_id: linkId, status: 'LINKED' });
  }

  if (action === 'unlink_child') {
    const linkId = String(body.link_id || '').trim();
    if (!linkId) return errorResponse('Link id is required', 400);
    const link = await db(env).prepare(
      `SELECT id FROM parent_students WHERE id = ?1 AND parent_id = ?2 AND link_status = 'LINKED'`
    ).bind(linkId, id).first();
    if (!link) return errorResponse('Verified child link not found', 404);
    await db(env).prepare('DELETE FROM parent_students WHERE id = ?1 AND parent_id = ?2').bind(linkId, id).run();
    await audit(env, user.id, 'parent.child_unlink', 'ParentStudent', linkId,
      request.headers.get('CF-Connecting-IP') || '', { parent_id: id });
    return jsonResponse({ ok: true });
  }

  if (action === 'reject_child') {
    const requestId = String(body.request_id || '').trim();
    if (!requestId) return errorResponse('Request id is required', 400);
    const result = await db(env).prepare(`UPDATE parent_students SET link_status='REJECTED',
        verified_by=?1, verified_at=?2, updated_at=?2
      WHERE id=?3 AND parent_id=?4 AND link_status='REQUESTED'`)
      .bind(user.id, now, requestId, id).run();
    if (!result.meta?.rows_written) return errorResponse('Pending child request not found', 404);
    await audit(env, user.id, 'parent.child_reject', 'ParentStudent', requestId,
      request.headers.get('CF-Connecting-IP') || '', { parent_id: id });
    return jsonResponse({ ok: true, status: 'REJECTED' });
  }

  return errorResponse('Unknown parent account or child-link action.', 400);
}

export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);

  const id = params.id;
  const parent = await db(env).prepare('SELECT id FROM parents WHERE id = ?1').bind(id).first();
  if (!parent) return errorResponse('Parent not found', 404);

  // Delete child rows + sessions first
  await db(env).prepare('DELETE FROM parent_sessions WHERE parent_id = ?1').bind(id).run();
  await db(env).prepare('DELETE FROM parent_students WHERE parent_id = ?1').bind(id).run();
  await db(env).prepare('DELETE FROM parents WHERE id = ?1').bind(id).run();
  await audit(env, user.id, 'parent.delete', 'Parent', id, request.headers.get('CF-Connecting-IP') || '');
  return jsonResponse({ ok: true });
}
