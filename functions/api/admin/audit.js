/**
 * Admin: Audit Log
 */
import { errorResponse, jsonResponse } from '../../lib/data.js';
import { db } from '../../lib/db.js';
import { requireUser } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(request, env);
  if (error) return errorResponse(error, 401);
  const { results } = await db(env).prepare(`
    SELECT a.id, a.user_id, a.action, a.entity, a.entity_id, a.ip, a.metadata, a.created_at,
           u.username, u.name as user_name
    FROM audit_log a LEFT JOIN users u ON u.id = a.user_id
    ORDER BY a.created_at DESC LIMIT 200
  `).all();
  return jsonResponse({ entries: results });
}
