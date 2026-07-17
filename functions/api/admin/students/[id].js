import { errorResponse, jsonResponse } from '../../../lib/data.js';
import { db } from '../../../lib/db.js';
import { requireAdmin, checkOrigin, audit } from '../../../lib/auth.js';

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400); }
  const fullName = String(body.full_name || '').trim();
  const className = String(body.class_name || '').trim();
  if (!fullName || !className) return errorResponse('Student name and class are required', 400);
  try {
    await db(env).prepare(`UPDATE students SET admission_number=?1, full_name=?2, class_name=?3,
      section=?4, roll_number=?5, dob=?6, is_active=?7, updated_at=datetime('now')
      WHERE id=?8 AND deleted_at IS NULL`)
      .bind(String(body.admission_number || '').trim() || null, fullName, className,
        String(body.section || '').trim() || null, String(body.roll_number || '').trim() || null,
        String(body.dob || '').trim() || null, body.is_active === false ? 0 : 1, params.id).run();
    await audit(env, user.id, 'student.update', 'Student', params.id, request.headers.get('CF-Connecting-IP') || '');
    return jsonResponse({ ok: true });
  } catch (e) {
    if (String(e.message).toLowerCase().includes('unique')) return errorResponse('Admission number already exists', 409);
    return errorResponse('Could not update student', 500);
  }
}

export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);
  await db(env).prepare("UPDATE students SET deleted_at=datetime('now'), is_active=0 WHERE id=?1").bind(params.id).run();
  await audit(env, user.id, 'student.delete', 'Student', params.id, request.headers.get('CF-Connecting-IP') || '');
  return jsonResponse({ ok: true });
}
