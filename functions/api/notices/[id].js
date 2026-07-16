import { errorResponse, jsonResponse } from '../../lib/data.js';
import { db } from '../../lib/db.js';

export async function onRequestGet(context) {
  const { env, params } = context;
  const id = params.id;
  const row = await db(env).prepare(
    'SELECT n.*, u.name as author_name FROM notices n LEFT JOIN users u ON u.id = n.author_id WHERE (n.id = ?1 OR n.slug = ?1) AND n.deleted_at IS NULL AND n.is_published = 1'
  ).bind(id).first();
  if (row) return jsonResponse(row);
  return errorResponse('Notice not found', 404);
}
