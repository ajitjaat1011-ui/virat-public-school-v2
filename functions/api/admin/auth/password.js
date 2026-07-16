/**
 * Admin password change endpoint
 * POST /api/admin/auth/password
 * Body: { current: string, next: string }
 * Requires an authenticated admin session.
 */
import { requireAdmin, hashPassword, verifyPassword, audit, errorResponse, json } from '../../../lib/auth.js';
import { db } from '../../../lib/db.js';

export async function onRequestPost(context) {
  const { request, env } = context;
  const { user, error } = await requireAdmin(request, env);
  if (!user) return errorResponse(error, 401);

  let body;
  try { body = await request.json(); } catch { return errorResponse('Invalid JSON'); }
  const current = String(body.current || '');
  const next    = String(body.next || '');

  if (!current) return errorResponse('Current password is required');
  if (!next)     return errorResponse('New password is required');
  if (next.length < 8) return errorResponse('New password must be at least 8 characters');
  if (next === current) return errorResponse('New password must be different from the current one');

  try {
    // Fetch current password hash
    const row = await db(env).prepare('SELECT password_hash FROM users WHERE id = ?1').bind(user.id).first();
    if (!row) return errorResponse('User not found', 404);

    // Verify current password
    const ok = await verifyPassword(current, row.password_hash);
    if (!ok) return errorResponse('Current password is incorrect', 403);

    // Hash and update
    const newHash = await hashPassword(next);
    await db(env).prepare('UPDATE users SET password_hash = ?1, updated_at = CURRENT_TIMESTAMP WHERE id = ?2')
      .bind(newHash, user.id).run();

    await audit(env, user.id, 'user.password.change', 'User', user.id,
      request.headers.get('CF-Connecting-IP') || '', null);

    return json({ ok: true, message: 'Password updated' });
  } catch (e) {
    return errorResponse('Could not update password: ' + e.message, 500);
  }
}
