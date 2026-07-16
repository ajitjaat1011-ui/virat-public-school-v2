/**
 * Admin: Admission Inquiries
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
  const url = new URL(request.url);
  const status = url.searchParams.get('status');
  let query = 'SELECT * FROM admission_inquiries WHERE deleted_at IS NULL';
  const params = [];
  if (status && status !== 'all') {
    query += ' AND status = ?' + (params.length + 1);
    params.push(status);
  }
  query += ' ORDER BY created_at DESC LIMIT 200';
  const { results } = await env.DB.prepare(query).bind(...params).all();
  return json({ inquiries: results });
}

export async function onRequestPost(context) {
  // Update status / notes
  const { request, env } = context;
  const { user, error } = await ensureAdmin(request, env);
  if (error) return error;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);

  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400); }

  if (body.status && !['NEW','CONTACTED','ADMITTED','REJECTED'].includes(body.status)) {
    return errorResponse('Invalid status', 400);
  }
  const existing = await env.DB.prepare('SELECT id FROM admission_inquiries WHERE id = ?1').bind(id).first();
  if (!existing) return errorResponse('Inquiry not found', 404);

  await env.DB.prepare("UPDATE admission_inquiries SET status = COALESCE(?1, status), notes = COALESCE(?2, notes), updated_at = datetime('now') WHERE id = ?3")
    .bind(body.status || null, body.notes || null, id).run();
  await audit(env, user.id, 'inquiry.update', 'AdmissionInquiry', id, null, { status: body.status });
  return json({ ok: true });
}
