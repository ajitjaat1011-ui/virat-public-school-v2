/**
 * Admin: Inquiries
 */
import { errorResponse, jsonResponse } from '../../lib/data.js';
import { db } from '../../lib/db.js';
import { requireUser, checkOrigin, audit, cuid } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(request, env);
  if (error) return errorResponse(error, 401);
  const { results } = await db(env).prepare('SELECT * FROM admission_inquiries WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 200').all();
  return jsonResponse({ inquiries: results });
}

export async function onRequestPost(context) {
  const { env, request } = context;
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
  const existing = await db(env).prepare('SELECT id FROM admission_inquiries WHERE id = ?1').bind(id).first();
  if (!existing) return errorResponse('Inquiry not found', 404);
  await db(env).prepare("UPDATE admission_inquiries SET status = COALESCE(?1, status), notes = COALESCE(?2, notes), updated_at = datetime('now') WHERE id = ?3")
    .bind(body.status || null, body.notes || null, id).run();
  await audit(env, user.id, 'inquiry.update', 'AdmissionInquiry', id, null, { status: body.status });
  return jsonResponse({ ok: true });
}
