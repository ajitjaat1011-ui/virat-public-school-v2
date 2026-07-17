/**
 * Admin: Single inquiry
 *  - POST   — update status (or notes)
 *  - DELETE — soft-delete
 */
import { json, errorResponse, requireUser, checkOrigin, audit } from '../../../lib/auth.js';
import { db } from '../../../lib/db.js';

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const { user, error } = await requireUser(request, env);
  if (error) return errorResponse(error, 401);
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);

  let body = {};
  try { body = await request.json(); } catch { /* allow empty body */ }

  try {
    const existing = await db(env).prepare(
      'SELECT id, status FROM admission_inquiries WHERE id = ?1 AND deleted_at IS NULL'
    ).bind(params.id).first();
    if (!existing) return errorResponse('Inquiry not found', 404);

    const updates = [];
    const args = [];
    if (body.status && ['NEW','CONTACTED','ADMITTED','REJECTED'].includes(body.status)) {
      updates.push('status = ?');
      args.push(body.status);
    }
    if (body.notes !== undefined) {
      updates.push('notes = ?');
      args.push(String(body.notes).slice(0, 4000));
    }
    if (updates.length === 0) return errorResponse('No valid fields to update', 400);

    updates.push('updated_at = CURRENT_TIMESTAMP');
    args.push(params.id);
    await db(env).prepare(`UPDATE admission_inquiries SET ${updates.join(', ')} WHERE id = ?${args.length}`).bind(...args).run();

    await audit(env, user.id, 'inquiry.update', 'AdmissionInquiry', params.id,
      request.headers.get('CF-Connecting-IP') || '',
      JSON.stringify({ status: body.status }));

    return json({ ok: true, id: params.id, status: body.status || existing.status });
  } catch (e) {
    return errorResponse('Database error: ' + e.message, 500);
  }
}

export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const { user, error } = await requireUser(request, env);
  if (error) return errorResponse(error, 401);
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);

  try {
    const existing = await db(env).prepare(
      'SELECT id FROM admission_inquiries WHERE id = ?1 AND deleted_at IS NULL'
    ).bind(params.id).first();
    if (!existing) return errorResponse('Inquiry not found', 404);

    await db(env).prepare("UPDATE admission_inquiries SET deleted_at = datetime('now') WHERE id = ?1").bind(params.id).run();
    await audit(env, user.id, 'inquiry.delete', 'AdmissionInquiry', params.id,
      request.headers.get('CF-Connecting-IP') || '', null);
    return json({ ok: true });
  } catch (e) {
    return errorResponse('Database error: ' + e.message, 500);
  }
}
