/**
 * Admin: Notices — D1 (read+write) or static fallback (read-only).
 */
import { errorResponse, loadStatic, isD1Available, jsonResponse } from '../../lib/data.js';
import { sanitizeHtml, slugify, requireUser, checkOrigin, audit, cuid } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { env } = context;
  if (!isD1Available(env)) {
    const data = loadStatic(env, 'notices.json');
    return jsonResponse({ notices: data?.notices || [], readOnly: true });
  }
  const { results } = await env.DB.prepare('SELECT * FROM notices WHERE deleted_at IS NULL ORDER BY publish_date DESC LIMIT 200').all();
  return jsonResponse({ notices: results });
}

export async function onRequestPost(context) {
  const { env, request } = context;
  if (!isD1Available(env)) {
    return errorResponse('Editing requires a database. The current deployment is read-only.', 503);
  }
  const { user, error } = await requireUser(request, env);
  if (error) return errorResponse(error, 401);
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400); }
  if (!body.title || !body.body || !body.category) return errorResponse('Title, body, and category are required', 400);
  if (!['ADMISSION','HOLIDAY','EXAM','PTM','GENERAL'].includes(body.category)) return errorResponse('Invalid category', 400);
  const id = cuid();
  let slug = body.slug ? slugify(body.slug) : slugify(body.title);
  const existing = await env.DB.prepare('SELECT id FROM notices WHERE slug = ?1').bind(slug).first();
  if (existing) slug = slug + '-' + id.slice(-4);
  const cleanBody = sanitizeHtml(body.body);
  const excerpt = body.excerpt || cleanBody.replace(/<[^>]+>/g, '').slice(0, 200);
  await env.DB.prepare(`INSERT INTO notices (id, title, slug, body, excerpt, category, is_published, publish_date, expiry_date, attachment_url, attachment_name, author_id) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)`).bind(
    id, String(body.title).slice(0, 200), slug, cleanBody, String(excerpt).slice(0, 300), body.category,
    body.is_published ? 1 : 0, body.publish_date || new Date().toISOString(), body.expiry_date || null,
    body.attachment_url || null, body.attachment_name || null, user.id
  ).run();
  await audit(env, user.id, 'notice.create', 'Notice', id, null, { title: body.title });
  return jsonResponse({ ok: true, id, slug });
}
