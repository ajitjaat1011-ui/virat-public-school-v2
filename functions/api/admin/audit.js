/**
 * Admin: Audit log
 */
import { json, errorResponse, requireUser } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { request, env } = context;
  const { user, error } = await requireUser(request, env);
  if (error) return errorResponse(error, 401);
  const { results } = await env.DB.prepare(`
    SELECT a.id, a.user_id, a.action, a.entity, a.entity_id, a.ip, a.metadata, a.created_at,
           u.username, u.name as user_name
    FROM audit_log a LEFT JOIN users u ON u.id = a.user_id
    ORDER BY a.created_at DESC
    LIMIT 200
  `).all();
  return json({ entries: results });
}
