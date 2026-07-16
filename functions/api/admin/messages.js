/**
 * Admin: Contact Messages
 */
import { json, errorResponse, requireUser, checkOrigin, audit } from '../../lib/auth.js';

async function ensureAdmin(request, env) {
  const { user, error } = await requireUser(request, env);
  if (error) return { user: null, error: errorResponse(error, 401) };
  return { user, error: null };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const { user, error } = await ensureAdmin(request, env);
  if (error) return error;
  const { results } = await env.DB.prepare(
    'SELECT * FROM contact_messages WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 200'
  ).all();
  return json({ messages: results });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { user, error } = await ensureAdmin(request, env);
  if (error) return error;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);

  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  // Mark as read
  const existing = await env.DB.prepare('SELECT id FROM contact_messages WHERE id = ?1').bind(id).first();
  if (!existing) return errorResponse('Message not found', 404);
  await env.DB.prepare('UPDATE contact_messages SET is_read = 1 WHERE id = ?1').bind(id).run();
  await audit(env, user.id, 'message.read', 'ContactMessage', id, null, null);
  return json({ ok: true });
}
