/**
 * Admin: Notices CRUD
 */
import { json, errorResponse, requireUser, checkOrigin, audit, cuid, sanitizeHtml, slugify } from '../../lib/auth.js';

async function ensureAdmin(request, env) {
  const { user, error } = await requireUser(request, env);
  if (error) return { user: null, error: errorResponse(error, 401) };
  return { user, error: null };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const { user, error } = await ensureAdmin(request, env);
  if (error) return error;
  const url = new URL(request.url);
  const includeUnpublished = url.searchParams.get('all') === '1';
  const query = includeUnpublished
    ? 'SELECT * FROM notices WHERE deleted_at IS NULL ORDER BY publish_date DESC LIMIT 200'
    : 'SELECT * FROM notices WHERE deleted_at IS NULL AND is_published = 1 ORDER BY publish_date DESC LIMIT 200';
  const { results } = await env.DB.prepare(query).all();
  return json({ notices: results });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { user, error } = await ensureAdmin(request, env);
  if (error) return error;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);

  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400); }
  if (!body.title || !body.body || !body.category) {
    return errorResponse('Title, body, and category are required', 400);
  }
  if (!['ADMISSION','HOLIDAY','EXAM','PTM','GENERAL'].includes(body.category)) {
    return errorResponse('Invalid category', 400);
  }
  const id = cuid();
  let slug = body.slug ? slugify(body.slug) : slugify(body.title);
  // Ensure unique
  const existing = await env.DB.prepare('SELECT id FROM notices WHERE slug = ?1').bind(slug).first();
  if (existing) slug = slug + '-' + id.slice(-4);

  const cleanBody = sanitizeHtml(body.body);
  const excerpt = body.excerpt || cleanBody.replace(/<[^>]+>/g, '').slice(0, 200);

  await env.DB.prepare(`
    INSERT INTO notices (id, title, slug, body, excerpt, category, is_published, publish_date, expiry_date, attachment_url, attachment_name, author_id)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
  `).bind(
    id,
    String(body.title).slice(0, 200),
    slug,
    cleanBody,
    String(excerpt).slice(0, 300),
    body.category,
    body.is_published ? 1 : 0,
    body.publish_date || new Date().toISOString(),
    body.expiry_date || null,
    body.attachment_url || null,
    body.attachment_name || null,
    user.id
  ).run();

  await audit(env, user.id, 'notice.create', 'Notice', id, null, { title: body.title });
  return json({ ok: true, id, slug });
}
