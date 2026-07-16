import { json, errorResponse } from '../../lib/auth.js';

export async function onRequestGet(context) {
  const { env, params } = context;
  const id = params.id;

  // Try by id first, then by slug
  let row = await env.DB.prepare(
    'SELECT n.*, u.name as author_name FROM notices n LEFT JOIN users u ON u.id = n.author_id WHERE (n.id = ?1 OR n.slug = ?1) AND n.deleted_at IS NULL AND n.is_published = 1'
  ).bind(id).first();

  if (!row) return errorResponse('Notice not found', 404);
  return json(row);
}
