/**
 * Admin: Inquiries list
 *  - GET — list all non-deleted inquiries
 *  (POST/DELETE for a single inquiry lives in ./inquiries/[id].js)
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
      'SELECT * FROM admission_inquiries WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 200'
    ).all();
    return jsonResponse({ inquiries: results });
  } catch (e) {
    return errorResponse('Database error: ' + e.message, 500);
  }
}
