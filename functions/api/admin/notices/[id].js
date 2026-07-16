/**
 * Admin: Single notice — GET, PUT (update), DELETE (soft delete)
 */
import { json, errorResponse, requireUser, checkOrigin, audit, sanitizeHtml, slugify } from '../../../lib/auth.js';

async function ensureAdmin(request, env) {
  const { user, error } = await requireUser(request, env);
  if (error) return { user: null, error: errorResponse(error, 401) };
  return { user, error: null };
}

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const { user, error } = await ensureAdmin(request, env);
  if (error) return error;
  const row = await env.DB.prepare('SELECT * FROM notices WHERE id = ?1 AND deleted_at IS NULL').bind(params.id).first();
  if (!row) return errorResponse('Notice not found', 404);
  return json(row);
}

export async function onRequestPut(context) {
  const { request, env, params } = context;
  const { user, error } = await ensureAdmin(request, env);
  if (error) return error;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);

  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400); }

  const existing = await env.DB.prepare('SELECT * FROM notices WHERE id = ?1').bind(params.id).first();
  if (!existing) return errorResponse('Notice not found', 404);

  const cleanBody = body.body ? sanitizeHtml(body.body) : existing.body;
  const excerpt = body.excerpt || (body.body ? cleanBody.replace(/<[^>]+>/g, '').slice(0, 200) : existing.excerpt);

  await env.DB.prepare(`
    UPDATE notices SET
      title = ?1, body = ?2, excerpt = ?3, category = ?4, is_published = ?5,
      publish_date = ?6, expiry_date = ?7, attachment_url = ?8, attachment_name = ?9,
      updated_at = datetime('now')
    WHERE id = ?10
  `).bind(
    body.title ?? existing.title,
    cleanBody,
    excerpt,
    body.category ?? existing.category,
    body.is_published !== undefined ? (body.is_published ? 1 : 0) : existing.is_published,
    body.publish_date ?? existing.publish_date,
    body.expiry_date ?? existing.expiry_date,
    body.attachment_url ?? existing.attachment_url,
    body.attachment_name ?? existing.attachment_name,
    params.id
  ).run();

  await audit(env, user.id, 'notice.update', 'Notice', params.id, null, null);
  return json({ ok: true });
}

export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const { user, error } = await ensureAdmin(request, env);
  if (error) return error;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);

  const existing = await env.DB.prepare('SELECT id FROM notices WHERE id = ?1').bind(params.id).first();
  if (!existing) return errorResponse('Notice not found', 404);

  await env.DB.prepare('UPDATE notices SET deleted_at = datetime(''now'') WHERE id = ?1').bind(params.id).run();
  await audit(env, user.id, 'notice.delete', 'Notice', params.id, null, null);
  return json({ ok: true });
}
