/**
 * Admin: Messages — D1 with read-only fallback.
 */
import { errorResponse, loadStatic, isD1Available, jsonResponse } from '../../lib/data.js';
import { requireUser, checkOrigin, audit } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { env } = context;
  if (!isD1Available(env)) {
    const data = loadStatic(env, 'messages.json');
    return jsonResponse({ messages: data?.messages || [], readOnly: true });
  }
  const { results } = await env.DB.prepare('SELECT * FROM contact_messages WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 200').all();
  return jsonResponse({ messages: results });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  if (!isD1Available(env)) return errorResponse('Read-only deployment', 503);
  const { user, error } = await requireUser(request, env);
  if (error) return errorResponse(error, 401);
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  const existing = await env.DB.prepare('SELECT id FROM contact_messages WHERE id = ?1').bind(id).first();
  if (!existing) return errorResponse('Message not found', 404);
  await env.DB.prepare('UPDATE contact_messages SET is_read = 1 WHERE id = ?1').bind(id).run();
  await audit(env, user.id, 'message.read', 'ContactMessage', id, null, null);
  return jsonResponse({ ok: true });
}
