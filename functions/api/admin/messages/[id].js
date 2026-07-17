/**
 * Admin: Single contact message
 *  - POST   — mark as read
 *  - DELETE — soft delete
 */
import { errorResponse, jsonResponse } from '../../../lib/data.js';
import { db } from '../../../lib/db.js';
import { requireUser, checkOrigin, audit } from '../../../lib/auth.js';

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const { user, error } = await requireUser(request, env);
  if (error) return errorResponse(error, 401);
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);

  try {
    const existing = await db(env).prepare('SELECT id FROM contact_messages WHERE id = ?1 AND deleted_at IS NULL').bind(params.id).first();
    if (!existing) return errorResponse('Message not found', 404);

    await db(env).prepare('UPDATE contact_messages SET is_read = 1 WHERE id = ?1').bind(params.id).run();
    await audit(env, user.id, 'message.read', 'ContactMessage', params.id,
      request.headers.get('CF-Connecting-IP') || '', null);
    return jsonResponse({ ok: true });
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
    const existing = await db(env).prepare('SELECT id FROM contact_messages WHERE id = ?1 AND deleted_at IS NULL').bind(params.id).first();
    if (!existing) return errorResponse('Message not found', 404);

    await db(env).prepare("UPDATE contact_messages SET deleted_at = datetime('now') WHERE id = ?1").bind(params.id).run();
    await audit(env, user.id, 'message.delete', 'ContactMessage', params.id,
      request.headers.get('CF-Connecting-IP') || '', null);
    return jsonResponse({ ok: true });
  } catch (e) {
    return errorResponse('Database error: ' + e.message, 500);
  }
}
