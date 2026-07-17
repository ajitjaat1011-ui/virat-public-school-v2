/**
 * Admin: Contact Messages list
 *  - GET — list all non-deleted messages
 *  (POST/DELETE for a single message lives in ./messages/[id].js)
 */
import { errorResponse, jsonResponse } from '../../lib/data.js';
import { db } from '../../lib/db.js';
import { requireUser } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { env, request } = context;
  const { user, error } = await requireUser(request, env);
  if (error) return errorResponse(error, 401);
  try {
    const { results } = await db(env).prepare(
      'SELECT * FROM contact_messages WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 200'
    ).all();
    return jsonResponse({ messages: results });
  } catch (e) {
    return errorResponse('Database error: ' + e.message, 500);
  }
}
