/**
 * Admin: Inquiries — D1 with read-only fallback.
 */
import { errorResponse, loadStatic, isD1Available, jsonResponse } from '../../lib/data.js';
import { requireUser, checkOrigin, audit } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { env } = context;
  if (!isD1Available(env)) {
    const data = loadStatic(env, 'inquiries.json');
    return jsonResponse({ inquiries: data?.inquiries || [], readOnly: true });
  }
  const { results } = await env.DB.prepare('SELECT * FROM admission_inquiries WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 200').all();
  return jsonResponse({ inquiries: results });
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
  return jsonResponse({ ok: true });
}
