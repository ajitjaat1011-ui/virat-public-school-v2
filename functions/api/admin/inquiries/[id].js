/**
 * Admin: Single inquiry — DELETE (soft)
 */
import { json, errorResponse, requireUser, checkOrigin, audit } from '../../../lib/auth.js';

export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const { user, error } = await requireUser(request, env);
  if (error) return errorResponse(error, 401);
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);

  const existing = await env.DB.prepare('SELECT id FROM admission_inquiries WHERE id = ?1').bind(params.id).first();
  if (!existing) return errorResponse('Inquiry not found', 404);

  await env.DB.prepare('UPDATE admission_inquiries SET deleted_at = datetime(''now'') WHERE id = ?1').bind(params.id).run();
  await audit(env, user.id, 'inquiry.delete', 'AdmissionInquiry', params.id, null, null);
  return json({ ok: true });
}
