/**
 * Admin — approve / reject / delete a parent account
 * POST   /api/admin/parents/[id]   { action: 'approve' | 'reject', note?: string }
 * DELETE /api/admin/parents/[id]
 */
import { errorResponse, jsonResponse } from '../../../lib/data.js';
import { db } from '../../../lib/db.js';
import { requireAdmin, audit, checkOrigin } from '../../../lib/auth.js';

export async function onRequestPost(context) {
  const { request, env, params } = context;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);

  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON', 400); }

  const id = params.id;
  const parent = await db(env).prepare('SELECT id, status FROM parents WHERE id = ?1').bind(id).first();
  if (!parent) return errorResponse('Parent not found', 404);

  const action = String(body.action || '').toLowerCase();
  const note = body.note ? String(body.note).trim() : null;
  const now = new Date().toISOString();

  if (action === 'approve') {
    await db(env).prepare(
      'UPDATE parents SET status = ?1, reviewed_by = ?2, reviewed_at = ?3, review_note = ?4, updated_at = ?3 WHERE id = ?5'
    ).bind('APPROVED', user.id, now, note, id).run();
    await audit(env, user.id, 'parent.approve', 'Parent', id, request.headers.get('CF-Connecting-IP') || '');
    return jsonResponse({ ok: true, status: 'APPROVED' });
  }
  if (action === 'reject') {
    await db(env).prepare(
      'UPDATE parents SET status = ?1, reviewed_by = ?2, reviewed_at = ?3, review_note = ?4, updated_at = ?3 WHERE id = ?5'
    ).bind('REJECTED', user.id, now, note, id).run();
    await audit(env, user.id, 'parent.reject', 'Parent', id, request.headers.get('CF-Connecting-IP') || '');
    return jsonResponse({ ok: true, status: 'REJECTED' });
  }
  if (action === 'reset') {
    // Re-open a rejected/approved request back to pending (useful for re-approval)
    await db(env).prepare(
      'UPDATE parents SET status = ?1, updated_at = ?2 WHERE id = ?3'
    ).bind('PENDING', now, id).run();
    await audit(env, user.id, 'parent.reset', 'Parent', id, request.headers.get('CF-Connecting-IP') || '');
    return jsonResponse({ ok: true, status: 'PENDING' });
  }

  return errorResponse('Unknown action. Use "approve", "reject", or "reset".', 400);
}

export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const originErr = checkOrigin(request);
  if (originErr) return errorResponse(originErr, 403);
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);

  const id = params.id;
  const parent = await db(env).prepare('SELECT id FROM parents WHERE id = ?1').bind(id).first();
  if (!parent) return errorResponse('Parent not found', 404);

  // Delete child rows + sessions first
  await db(env).prepare('DELETE FROM parent_sessions WHERE parent_id = ?1').bind(id).run();
  await db(env).prepare('DELETE FROM parent_students WHERE parent_id = ?1').bind(id).run();
  await db(env).prepare('DELETE FROM parents WHERE id = ?1').bind(id).run();
  await audit(env, user.id, 'parent.delete', 'Parent', id, request.headers.get('CF-Connecting-IP') || '');
  return jsonResponse({ ok: true });
}
